import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
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
  const [name, setname] = useState("");
  const [bookstoreName, setBookstoreName] = useState('');
  const [userData, setUserData] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [sendData, setSendData] = useState(null);
  const [bankname, setbankname] = useState("");
  const [banknum, setbanknum] = useState("");
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      try {
        const res = await uploadProfileImage(imageUri);
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

    data.append('imgfile', {
      uri,
      name: filename,
      type,
    });

    if (!userData) throw new Error('유저 정보가 없습니다.');

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
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.error('데이터 삭제 중 오류 발생:', error);
    }
  };

  const goToApprove = async () => {
    try {
      if (!userData) return;
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
      console.log(result)
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
          const storedUserData = await AsyncStorage.getItem('UserData');
          if (!storedUserData) return;
          const parsedUserData = JSON.parse(storedUserData);

          const userId = parsedUserData.decoded_user_id;
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
          setSendData(result);
          console.log(result)
          if (result.user_info.nickname) setNickname(result.user_info.nickname);
          if (result.user_info.name) setname(result.user_info.name);
          if (result.user_info.bookstoreName) setBookstoreName(`(${result.user_info.bookstoreName})`);
          if (result.user_info.profile) {
            const fullProfileUri = `${API_URL}${result.user_info.profile}`;
            setSelectedImage(fullProfileUri);
          }
          if (result.user_info.bankaccount) setbanknum(result.user_info.bankaccount);
          if (result.user_info.bankname) setbankname(result.user_info.bankname);
          if (result.shop_info.shopId) setShopId(result.shop_info.shopId);
          setUserData((prev) => ({
            ...prev,
            ...parsedUserData,
            isShopExist: result.isShopExist,
          }));
        } catch (error) {
          console.error('유저 데이터 불러오기 오류:', error);
        }
      };

      fetchMyPageData();
    }, [])
  );

  const goToAddCart = async () => {
    try {
      if (!userData) return;
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userId}/my-page/show-basket`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });
      const result = await response.json();
      console.log(result);
      navigation.navigate("AddCart", { data: { result } });
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  const goToBuyList = async () => {
    try {
      if (!userData) return;
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userId}/my-page/show-receipt`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });
      const result = await response.json();
      console.log(result);
      navigation.navigate('BuyList', { receiptData: result });
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  const goToSellList = async () => {
    try {
      if (!userData) return;
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-product`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });
      const result = await response.json();
      console.log(result);
      navigation.navigate('SellList', { sellData: result });
    } catch (error) {
      console.error('오류 발생:', error);
    }
  }

  const goToSelledList = async () => {
    try {
      if (!userData) return;
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-payment`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });
      const result = await response.json();
      navigation.navigate("MySelledList", {data : result})
      console.log(result);
    } catch (error) {
      console.error('오류 발생:', error);
    }
  }
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

            <TouchableOpacity style={styles.nicknameRow} onPress={() => navigation.navigate('CommonPWConfirm',
              {bankaccount : banknum, bankname : bankname}
            )}>
              <View style={styles.nicknameTextContainer}>
                <Text style={styles.nickname}>{name} ({nickname})</Text>
                <Text style={styles.bookstoreName}>{bookstoreName}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={{ width: 415, height: 5, backgroundColor: '#ddd', position: 'absolute', top: 160 }} />

          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem} onPress={goToSellList}>
              <Text style={styles.menuText}>등록 도서 조회</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={goToSelledList}>
              <Text style={styles.menuText}>내 판매 도서 조회</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={goToAddCart}>
              <Text style={styles.menuText}>장바구니</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={goToBuyList}>
              <Text style={styles.menuText}>구매 내역</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChangePWScreen')}>
              <Text style={styles.menuText}>비밀번호 변경</Text>
              <Ionicons name="chevron-forward" size={18} color="#000" />
            </TouchableOpacity>

            {userData?.user_type === 2 && userData?.isShopExist === 2 && (
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ManageStore', {shopId : shopId, data : sendData})}>
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
