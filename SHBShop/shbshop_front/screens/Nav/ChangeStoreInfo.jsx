import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;
const ChangeStoreInfo = ({ navigation, route }) => {
  const { data } = route.params;

  const [presidentName, setPresidentName] = useState('');
  const [businessmanName, setBusinessmanName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [address, setAddress] = useState('');
  const [shopName, setShopName] = useState('');
  const [shoptel, setShoptel] = useState('');
  const [holiday, setHoliday] = useState('');
  const [etc, setEtc] = useState('');
  const [openTime, setOpenTime] = useState(null);
  const [closeTime, setCloseTime] = useState(null);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSelectingOpenTime, setIsSelectingOpenTime] = useState(true);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (data) {
      setPresidentName(data.presidentName || '');
      setBusinessmanName(data.businessmanName || '');
      setBusinessEmail(data.businessEmail || '');
      setAddress(data.address || '');
      setShopName(data.shopName || '');
      setShoptel(data.shoptel || '');
      setHoliday(data.holiday || '');
      setEtc(data.etc || '');
      setOpenTime(data.open || '');
      setCloseTime(data.close || '');
    }
  }, [data]);

  const showDatePicker = (forOpenTime) => {
    setIsSelectingOpenTime(forOpenTime);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isSelectingOpenTime) {
      setOpenTime(formattedTime);
    } else {
      setCloseTime(formattedTime);
    }
    hideDatePicker();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 3
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setImages((prevImages) => {
        if (prevImages.length < 3) {
          return [...prevImages, uri];
        }
        return prevImages;
      });
    }
  };

  const removeImage = (index) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async () => {
  const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

  const formData = new FormData();

  // 텍스트 필드 추가
  formData.append('shoptel', shoptel);    
  formData.append('open', openTime);           
  formData.append('close', closeTime);       
  formData.append('holiday', holiday);      
  formData.append('etc', etc);                

  // 이미지 파일 추가
  images.forEach((uri, index) => {
    const fileName = uri.split('/').pop();
    const fileType = fileName.split('.').pop();

    formData.append(`imgfile${index + 1}`, {
      uri,
      name: fileName,
      type: `image/${fileType}`,
    });
  });

  // 예시: POST 요청 (axios 또는 fetch 사용 가능)
  try {
    const response = await fetch(`${API_URL}/shop/${userId}/${data.shopId}/modify-shop-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${Token}`,
      },
      body: formData,
    });

    const result = await response.json();
    navigation.reset({
  index: 0,
  routes: [
    {
      name: 'MyPageScreen'
    }
  ],
});
  } catch (error) {
    console.error('업데이트 실패:', error);
  }
};


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingTop: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>매장 정보 수정</Text>
        </View>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
          {/* 읽기 전용 입력 필드 */}
          {[
            { label: '대표자 명', value: presidentName },
            { label: '사업자 명', value: businessmanName },
            { label: '사업자 메일', value: businessEmail },
            { label: '사업장 주소', value: address },
            { label: '사업장 이름', value: shopName },
          ].map((item, idx) => (
            <View key={idx} style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.Label}>{item.label}</Text>
              <View style={styles.TextBox}>
                <TextInput
                  style={styles.Input}
                  editable={false}
                  value={item.value}
                />
              </View>
            </View>
          ))}

          {/* 수정 가능 필드 */}
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.Label}>사업장 전화번호</Text>
            <View style={styles.TextBox}>
              <TextInput
                style={styles.editInput}
                value={shoptel}
                onChangeText={setShoptel}
              />
            </View>
          </View>

          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.Label}>휴일</Text>
            <View style={styles.TextBox}>
              <TextInput
                style={styles.editInput}
                value={holiday}
                onChangeText={setHoliday}
              />
            </View>
          </View>

          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text style={styles.Label}>추가 정보</Text>
            <View style={styles.TextArea}>
              <TextInput
                style={styles.editInput}
                multiline
                numberOfLines={4}
                value={etc}
                onChangeText={setEtc}
              />
            </View>
          </View>

          {/* 운영시간 */}
          <Text style={styles.Label}>운영시간</Text>
          <View style={styles.TimeRow}>
            <TouchableOpacity style={styles.TimeBox} onPress={() => showDatePicker(true)}>
              <Text style={styles.editInput}>{openTime || '개장시간 선택'}</Text>
            </TouchableOpacity>
            <Text style={styles.Separator}>~</Text>
            <TouchableOpacity style={styles.TimeBox} onPress={() => showDatePicker(false)}>
              <Text style={styles.editInput}>{closeTime || '폐장시간 선택'}</Text>
            </TouchableOpacity>
          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="time"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          {/* 이미지 업로드 UI */}
          <Text style={styles.Label}>매장 사진 (3개)</Text>
          <View style={styles.ImageContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.ImageWrapper}>
                <Image source={{ uri }} style={styles.Image} />
                <TouchableOpacity
                  style={styles.DeleteButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.DeleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={styles.AddImageButton} onPress={pickImage}>
                <Text style={styles.AddImageButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.SubmitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.SubmitText}>수정 완료</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingLeft: 20,
    paddingTop: 10,
  },
  Label: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    left: 42,
    paddingBottom: 8,
  },
  TextBox: {
    width: '80%',
    borderWidth: 1,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: 15,
    marginBottom: 10,
  },
  TextArea: {
    width: '80%',
    borderWidth: 1,
    height: 200,
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  Input: {
    fontSize: 18,
    color: 'gray',
  },
  editInput:{
    fontSize: 18,
    color: 'black',
  },
  TimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  TimeBox: {
    width: '40%',
    borderWidth: 1,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Separator: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  ImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'center',
  },
  ImageWrapper: {
    position: 'relative',
    margin: 5,
  },
  Image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  DeleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 5,
  },
  DeleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  AddImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 5,
  },
  AddImageButtonText: {
    fontSize: 40,
    color: '#333',
  },
  SubmitButton: {
    backgroundColor: '#0091da',
    width: '80%',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  SubmitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ChangeStoreInfo;
