import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = Constants.expoConfig.extra.API_URL;

const MyPageScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [nickname, setNickname] = useState('닉네임'); 
  const [bookstoreName, setBookstoreName] = useState('');
  const [userData, setUserData] = useState(null); 

  const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
  const imageUri = result.assets[0].uri;
  try {
    const res = await uploadProfileImage(imageUri); // 서버 응답 받음
    // 서버가 저장된 이미지 경로를 알려주면 그걸로 바로 상태 변경
    const fullImageUrl = `${API_URL}${res.img}`;  
    setSelectedImage(fullImageUrl);

    Alert.alert('성공', '프로필 사진이 변경되었습니다.');
  } catch (error) {
    Alert.alert('오류', '프로필 사진 변경에 실패했습니다.');
  }
}

};

const uploadProfileImage = async (uri) => {
  const data = new FormData();
  const filename = uri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image';

  data.append('imgfile1', {
    uri,
    name: filename,
    type,
  });

  const userId = userData.decoded_user_id;
  const token = await AsyncStorage.getItem('jwtToken');

  const response = await fetch(`${API_URL}/home/${userId}/my-page/modify-img`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: data,
  });

  if (!response.ok) {
    throw new Error('서버 업로드 실패');
  }

  return response.json();
};


  const Logout = async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      console.log('로그아웃 성공');
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error('데이터 삭제 중 오류 발생:', error);
    }
  };

  const goToApprove = async () => {
    try {
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-commer`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });
      const result = await response.json();
      console.log(result.cert_list);
      navigation.navigate("Approve", { data: { result } });
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  const deleteID = () => {
    navigation.navigate('DeleteID');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await AsyncStorage.getItem('UserData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    };

    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchMyPageData = async () => {
        try {
          if (!userData) return;

          const userId = userData.decoded_user_id;
          const Token = await AsyncStorage.getItem('jwtToken');

          const response = await fetch(`${API_URL}/home/${userId}/my-page`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Token}`,
            },
          });

          if (!response.ok) {
            console.error('마이페이지 불러오기 실패:', response.status);
            return;
          }

          const result = await response.json();
          console.log('마이페이지 데이터:', result);

          if (result.user_info.nickname) setNickname(result.user_info.nickname);
          if (result.user_info.bookstoreName) setBookstoreName(`(${result.user_info.bookstoreName})`);
          if (result.user_info.profile) {
            const fullProfileUri = `${API_URL}${result.user_info.profile}`;
            setSelectedImage(fullProfileUri);
          }
        } catch (error) {
          console.error('유저 데이터 불러오기 오류:', error);
        }
      };

      fetchMyPageData();
    }, [userData])
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
          <Text style={styles.title}>마이페이지</Text>

          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <TouchableOpacity onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color="#000" style={styles.cameraIcon} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.nicknameRow} onPress={() => navigation.navigate('CommonPWConfirm')}>
              <View style={styles.nicknameTextContainer}>
                <Text style={styles.nickname}>{nickname}</Text>
                <Text style={styles.bookstoreName}>{bookstoreName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={{ width: 415, height: 5, backgroundColor: '#ddd', position: 'absolute', top: 160 }} />

          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>내 판매목록</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AddCart')}>
              <Text style={styles.menuText}>장바구니</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BuyList')}>
              <Text style={styles.menuText}>구매 내역</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePWScreen')}>
              <Text style={styles.menuText}>비밀번호 변경</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            {userData?.user_type === 2 && (
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ManageStore')}>
                <Text style={styles.menuText}>매장 관리</Text>
                <Ionicons name="chevron-forward" size={18} color="#000" />
              </TouchableOpacity>
            )}

            {userData?.user_type === 2 && (
              <TouchableOpacity style={styles.menuItem} onPress={goToApprove}>
                <Text style={styles.menuText}>사업자 승인</Text>
                <Ionicons name="chevron-forward" size={18} color="#000" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.bottomItem} onPress={Logout}>
              <Text style={styles.bottomText}>로그아웃</Text>
              <Ionicons name="log-out-outline" size={24} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.bottomItem} onPress={deleteID}>
              <Text style={styles.bottomText}>회원탈퇴</Text>
              <Ionicons name="log-out-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default MyPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    backgroundColor: '#fff',
    width: '100%',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#ddd',
    borderRadius: 30,
  },
  cameraIcon: {
    position: 'absolute',
    right: -4,
    bottom: -4,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  nicknameTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  bookstoreName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuList: {
    marginTop: 30,
    gap: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuText: {
    fontSize: 15,
  },
  bottomSection: {
    marginTop: 'auto',
    marginBottom: 20,
    gap: 15,
  },
  bottomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomText: {
    fontSize: 18,
  },
});
