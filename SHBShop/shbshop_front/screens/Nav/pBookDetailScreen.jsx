import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import socket from '../Chat/Socket';


const BUY_URL = Constants.expoConfig.extra.BUY_URL;
const API_URL = Constants.expoConfig.extra.API_URL;
const { width } = Dimensions.get('window');

const PBookDetailScreen = ({route, navigation}) => {
  // const navigation = useNavigation();
  const [thumbsUp, setThumbsUp] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { storedata, bid } = route.params;
  const data = storedata;
  // 예시 이미지 리스트
  const images = [
    { id: '1', uri: `${API_URL}${data.book.bookimg1}` },
    { id: '2', uri: `${API_URL}${data.book.bookimg2}` },
    { id: '3', uri: `${API_URL}${data.book.bookimg3}` },
  ];
  

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleLike = async () => {
     try {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await axios.post(
      `${API_URL}/book/pb/${userId}/${data.seller.userType}/${bid}/add-basket`,
      {},
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    console.log("장바구니 추가성공")
  } catch (error) {
    console.error('오류 발생:', error);
    Alert.alert("장바구니 추가 실패", "다시 시도해주세요.");
  }
  }

  const handleUnlike = async () => {
    try {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await axios.delete(
      `${API_URL}/book/pb/${userId}/${data.seller.userType}/${bid}/delete-basket`,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    console.log("장바구니 제거 성공")
  } catch (error) {
    console.error('오류 발생:', error);
    Alert.alert("장바구니 제거 실패", "다시 시도해주세요.");
  }
  }

  useEffect(() => {
      if (data?.basket_exist == 1) {
        setThumbsUp(true);
      } else {
        setThumbsUp(false);
      }
    }, [data?.basket_exist]);
  
    const Buy = async () => {
     try {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await axios.post(
      `${BUY_URL}/book/${userId}/pb/request-payment`,
      BuyData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );
    console.log("구매 요청 성공", response.data);
    navigation.navigate('TossPaymentScreen', {
      paymentData: response.data
    });

  } catch (error) {
    console.error('오류 발생:', error);
    Alert.alert("구매요청 실패", "다시 시도해주세요.");
  }
  }

  const BuyData = {
    "books":[
      {"bid" : bid, type : data.seller.userType}
    ]
}

const handleChat = async () => {
  try {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

    const elseId = data.seller.sellerId; // 상대 유저 ID
    const elseType = data.seller.userType; // 상대 유저 타입

    const res = await axios.get(`${API_URL}/chat/${userId}/chat-room/${elseType}/${elseId}`, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });

    const roomId = res.data.room_id || res.data.roomId; // 명세에 따라 key 다를 수 있음

    // 채팅방 참여 socket.emit (소켓 전역 객체가 있다고 가정)
    socket.emit('join', {
      token: Token,
      room_id: roomId,
    });

    // 채팅방으로 이동
    navigation.navigate('ChatRoomScreen', {
      roomId: roomId,
    });

  } catch (err) {
    console.error('채팅방 생성/조회 실패:', err);
    Alert.alert("채팅 연결 실패", "다시 시도해주세요.");
  }
};


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{backgroundColor:'white', flex:1}}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={{padding:10}} onPress={() => {navigation.goBack()}}>
        <Ionicons name="chevron-back-outline" size={27} color="#000" />
      </TouchableOpacity>
      {/* 상단 이미지 */}
      <View style={styles.imageSection}>
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={{ uri: item.uri }} style={styles.image} />
          )}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.detailSection}>
        {/* 프로필 */}
        <View style={styles.profileRow}>
          <Image style={styles.avatar} source={{uri : API_URL + data.seller.img}}/>
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>{data.seller.nickname}({data.seller.name})</Text>
            <Text style={styles.location}>{data.book.region}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* 제목 + 설명 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.bookTitle}>{data.book.title}</Text>
          <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.description}>{data.book.detail}</Text>
          </ScrollView>
        </View>

        {/* 가격 , 좋아요 */}
        <View style={styles.bottomRow}>
          <View style={styles.thumb}>
            <TouchableOpacity
  style={{ marginRight: 15 }}
  onPress={() => {
    if (thumbsUp) {
      handleUnlike(); 
    } else {
      handleLike(); 
    }
    setThumbsUp(!thumbsUp); // 상태 토글
  }}
>
  <Ionicons
    name={thumbsUp ? 'heart' : 'heart-outline'}
    size={28}
    color={thumbsUp ? 'red' : 'black'}
  />
</TouchableOpacity>

            <Text style={styles.priceText}>{data.book.price.toLocaleString()}원</Text>
          </View>
          <TouchableOpacity style={styles.chatbutton} onPress={handleChat}>
            <Text style={styles.chatText}>채팅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buybutton} onPress={Buy}>
            <Text style={styles.chatText}>구매</Text>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
      </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageSection: {
    backgroundColor: '#ddd',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: width,
    height: 250,
    resizeMode: 'cover',
    backgroundColor: '#f0f0f0'
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bbb',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  detailSection: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: '#ddd',
    borderRadius: 25,
    marginRight: 10,
  },
  profileInfo: {
    flexDirection: 'column',
  },
  nickname: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    flexGrow: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  description: {
    fontSize: 14,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: 'white',
  },
  thumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight:'auto'
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft:5
  },
  chatbutton: {
    backgroundColor: '#0091DA',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft:10,
    marginRight:10
  },
  buybutton: {
    backgroundColor: '#0091DA',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  chatText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 0,
  },
});

export default PBookDetailScreen;
