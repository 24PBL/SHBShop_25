import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { WebView } from "react-native-webview";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const BookScreen = ({navigation}) => {
  const webviewRef = useRef(null); // WebView 참조를 위한 useRef 훅
  const [SearchText, setSearchText] = useState("");
  const [location, setLocation] = useState(null); // 위치 상태
  const [address, setAddress] = useState('');
  const [favorite, setfavorite] = useState([]); // 즐겨찾기 상태 (배열로 초기화)
  const [locallist, setlocallist] = useState([]); // 지역 리스트 상태 (배열로 초기화)

  const addresses = useMemo(() => locallist.map(item => item.address), [locallist]);
  const centerAddress = "10,10" // 예시로 현재 주소는 진주대로로 가정
  const testlocation = { latitude: 37.5563, longitude: 126.9708 };

  const BookStoreSearch = async () => {
    if (!SearchText) {
      console.log("검색어 없음");
      Alert.alert("검색어 없음","검색어를 입력하세요.");
      return; 
    }
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken'); // 비동기로 토큰 가져오기

    try {
      const response = await fetch(`${API_URL}/home/${userId}/shop-mode/search-shop?keyword=${SearchText}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });

      if (response.ok) {
        const data = await response.json(); // JSON 파싱
        navigation.navigate("BookStoreSearch", {storedata : {data}});
      } else {
        console.error('API 요청 실패:', response.status);
      }
    } catch (error) {
      console.error('Fetch 오류:', error);
    }
  };

  const sendToWebView = () => {
    const payload = {  /*여기 주석 풀기 */

      center: location ? `${location.coords.latitude},${location.coords.longitude} ` : centerAddress,
      markers: addresses,  // 마커 리스트
    };
  
    webviewRef.current?.postMessage(JSON.stringify(payload));
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('위치 권한이 거부되었습니다.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log("현재 위치:", currentLocation);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      sendToWebView();
    }
  }, [location]); // location이 업데이트될 때마다 실행

  useEffect(() => {
    const fetchData = async () => {
      const data = await AsyncStorage.getItem('UserData');
      const parsedData = JSON.parse(data);
      const userId = parsedData.decoded_user_id;

      const currentAddress = '경남 진주시 진주대로 501'; // 예시로 현재 주소는 진주대로로 가정
      const encodedAddress = encodeURIComponent(currentAddress);
      const Token = await AsyncStorage.getItem('jwtToken'); // JWT 토큰 가져오기

      try {
        const response = await fetch(`${API_URL}/home/${userId}/shop-mode/main?currentAddress=${encodedAddress}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Token}`, 
          },
        });

        if (response.ok) {
          const data = await response.json();
          setfavorite(data.favorite_list); // 받아온 즐겨찾기 리스트 상태에 저장
          setlocallist(data.localShop_list); // 받아온 지역 리스트 상태에 저장
        } else {
          const errorData = await response.json();
          console.error("API 요청 실패:", errorData);
          Alert.alert('서버 요청 실패', '매장 정보를 가져오는 데 실패했습니다.');
        }
      } catch (error) {
        console.error("Fetch 오류:", error);
        Alert.alert('네트워크 오류', '서버와의 연결에 실패했습니다.');
      }
    };

    fetchData(); 
  }, []); 

  const getAddressFromCoords = async (longitude, latitude) => {
    const REST_API_KEY = 'e4fc79ddd963f9332126d385ab256cdf'; // 여기에 본인 키 입력
  
    try {
      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`,
        {
          headers: {
            Authorization: `KakaoAK ${REST_API_KEY}`,
          },
        }
      );
  
      console.log('카카오 API 응답:', response.data); // 응답 데이터 확인
  
      const address = response.data.documents[0]?.address?.address_name;
      if (!address) {
        console.error('주소를 찾을 수 없습니다.');
      }
      console.log('주소:', address);
      return address;
  
    } catch (error) {
      console.error('주소 변환 실패:', error);
      return null;
    }
  };
  
  useEffect(() => {
    if (location) {
      const fetchAddress = async () => {
        const addr = await getAddressFromCoords(location.coords.longitude, location.coords.latitude);
        setAddress(addr); // 변환한 주소를 상태에 저장
      };
  
      fetchAddress();
    }
  }, [location]);

  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ width: '90%', height: 40, backgroundColor: '#E8E8E8', borderRadius: 20, alignItems: 'center', flexDirection: 'row', left: 20}}>
          <TextInput 
            style={{ color: 'gray', fontSize: 17, paddingLeft: 10, width: 330 }} 
            onChangeText={setSearchText} 
            value={SearchText} 
          />
          <TouchableOpacity 
            style={{ backgroundColor: '#0091da', borderRadius: 10, width: 40, height: 30, alignItems: 'center', justifyContent: 'center', right: 10 }} 
            onPress={BookStoreSearch}  // 검색 버튼 클릭 시 검색 함수 실행
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>검색</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <WebView
            ref={webviewRef}
            source={{ uri: 'https://24pbl.github.io/maptest/?v=1234' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            userAgent="Mozilla/5.0"
            mixedContentMode="always"
            cacheEnabled={false}
            onMessage={(event) => {
              console.log('받은 메시지', event.nativeEvent.data);
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.ready) {
                  sendToWebView();
                }
              } catch (e) {
                console.error("웹뷰 메시지 처리 오류:", e);
              }
            }}
          />
        </View>

        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', left: 10, top: 15 }}>즐겨찾는 책방</Text>
        </View>

        <ScrollView horizontal style={{ marginTop: 10 }} showsHorizontalScrollIndicator={false}>
          {favorite.map((shop, idx) => (
            <TouchableOpacity key={idx} style={{ padding: 10 }}>
              <View style={{ backgroundColor: '#d9d9d9', width: 80, height: 80, borderRadius: 50 }}>
                <Image
                  source={{ uri: `${API_URL}/${shop.shopimg1}` }} // 실제 이미지 URL을 사용
                  style={{ width: '100%', height: '100%', borderRadius: 50 }}
                />
              </View>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', paddingTop: 10 }}>{shop.shopName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default BookScreen;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '70%',
    borderBottomWidth: 1,
    paddingTop:15
  },
});
