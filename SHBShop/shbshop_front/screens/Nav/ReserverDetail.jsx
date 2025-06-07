import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_URL = Constants.expoConfig.extra.API_URL;

const ReserveDetail = ({ route, navigation }) => {
  const {
    book_info,
    receipt_info,
    shop_info,
    user_info,
    user_type,
    decoded_user_id,
  } = route.params.storedata.ReserverListData;

  const {
    title,
    author,
    publish,
    price,
    isbn,
    bookimg,
  } = book_info;

  const {
    ownerName,
    ownerNickname,
    ownerEmail,
    ownertel,
    ownerAddress,
    reason,
    paidAt,
    orderid,
    rid,
    ownerType,
  } = receipt_info;

  const formattedDate = new Date(paidAt)
    .toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/\./g, '-')
    .replace(' ', ' ')
    .replace(/\s/g, '');

  const [modalVisible, setModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    setModalVisible(true);
  };

  const handleApprove = async () => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      const now = new Date();
      const approvalTime = now
        .toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(/\./g, '-')
        .replace(/\s/g, '');

      const response = await fetch(
        `${API_URL}/shop/${userId}/${shop_info.shopId}/check-pr/${ownerType}/${rid}/review`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Token}`,
          },
          body: JSON.stringify({
            decision: 2,
            reason: approvalTime,
          }),
        }
      );

      if (!response.ok) {
        console.error('승인 실패', await response.text());
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'MyPageScreen' }],
      });
    } catch (error) {
      console.error('승인 중 오류 발생:', error);
    }
  };

  const handleSubmitReject = async () => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      const response = await fetch(
        `${API_URL}/shop/${userId}/${shop_info.shopId}/check-pr/${ownerType}/${rid}/review`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Token}`,
          },
          body: JSON.stringify({
            decision: 3,
            reason: rejectReason,
          }),
        }
      );

      if (response.ok) {
        setModalVisible(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MyPageScreen' }],
        });
      } else {
        const errorData = await response.json();
        console.error('거절 실패:', errorData);
        alert('거절에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('요청 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
    setRejectReason('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingBottom: 10, paddingLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name='chevron-back-outline' size={28} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${API_URL}${bookimg}` }}
            style={styles.coverImage}
          />
        </View>

        <View style={styles.profileBox}>
          <View style={styles.avatar} />
          <Text style={styles.nickname}>구매자 : {ownerName}</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>제목</Text>
            <Text style={styles.value}>{title}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>저자</Text>
            <Text style={styles.value}>{author}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>출판사</Text>
            <Text style={styles.value}>{publish}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>가격</Text>
            <Text style={styles.value}>{price.toLocaleString()}원</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>ISBN</Text>
            <Text style={styles.value}>{isbn}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>신청일시</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>상태</Text>
            <Text style={styles.value}>{reason}</Text>
          </View>
        </View>
      </ScrollView>
{/*
  <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>거절 사유 입력</Text>
            <TextInput
              style={styles.modalInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="거절 사유를 입력해주세요"
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={handleCancel}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleSubmitReject}>
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
*/}
      

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { alignItems: 'center' },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccc',
    marginRight: 8,
  },
  nickname: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputGroup: {
    width: '90%',
  },
  infoItem: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalCancel: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 6,
  },
  modalConfirm: {
    backgroundColor: '#0091da',
    padding: 10,
    borderRadius: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ReserveDetail;
