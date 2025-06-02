import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Checkbox from 'expo-checkbox';

const API_URL = Constants.expoConfig.extra.API_URL;

const AddCart = ({ navigation, route }) => {
  const { data } = route.params;
  const result = data.result || {};

  const sortByDateDesc = (arr) =>
    [...arr].sort((a, b) => new Date(b.createAt) - new Date(a.createAt));

  const [bookList, setBookList] = useState(sortByDateDesc(result.book_list || []));
  const [sbookList, setSbookList] = useState(sortByDateDesc(result.sbook_list || []));
  const [selectedPersonal, setSelectedPersonal] = useState([]);
  const [selectedStore, setSelectedStore] = useState([]);

  const toggleSelection = (id, isStore) => {
    if (isStore) {
      setSelectedStore((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setSelectedPersonal((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  const goToBookDetail = async (sellType, bid) => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      const response = await fetch(`${API_URL}/book/pb/${userId}/${sellType}/${bid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Token}`,
        },
      });

      const data = await response.json();
      navigation.navigate('PBookDetailScreen', { storedata: data, bid });
    } catch (error) {
      console.error('책 상세 정보 가져오기 실패:', error);
      Alert.alert('오류', '책 상세 정보를 불러오는 데 실패했습니다.');
    }
  };

  const CommergoToBookDetail = async (sid, bid) => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/book/sb/${userId}/${sid}/${bid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Token}`,
        },
      });
      const data = await response.json();
      navigation.navigate('CBookDetailScreen', { storedata: { data } });
    } catch (error) {
      console.error('매장 책 상세 실패:', error);
    }
  };

  const pDeleteCart = async (sellerType, bid) => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      await axios.delete(
        `${API_URL}/book/pb/${userId}/${sellerType}/${bid}/delete-basket`,
        {
          headers: { Authorization: `Bearer ${Token}` },
        }
      );

      setBookList((prev) => prev.filter((item) => item.bid !== bid));
      setSelectedPersonal((prev) => prev.filter((id) => id !== bid));
    } catch (error) {
      console.error('오류 발생:', error.response?.data || error.message);
      Alert.alert('장바구니 제거 실패', '다시 시도해주세요.');
    }
  };

  const cDeleteCart = async (sid, bid) => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      await axios.delete(
        `${API_URL}/book/sb/${userId}/${sid}/${bid}/delete-basket`,
        {
          headers: { Authorization: `Bearer ${Token}` },
        }
      );

      setSbookList((prev) => prev.filter((item) => item.bid !== bid));
      setSelectedStore((prev) => prev.filter((id) => id !== bid));
    } catch (error) {
      console.error('오류 발생:', error.response?.data || error.message);
      Alert.alert('장바구니 제거 실패', '다시 시도해주세요.');
    }
  };

  const renderBookItem = (item, isStore) => {
  const isChecked = isStore
    ? selectedStore.includes(item.bid)
    : selectedPersonal.includes(item.bid);

  return (
    <TouchableOpacity
      key={item.bid} // bid를 key로 사용
      style={styles.bookItem}
      onPress={() =>
        isStore
          ? CommergoToBookDetail(item.sid, item.bid)
          : goToBookDetail(item.sellerType, item.bid)
      }
    >
      <Checkbox
        value={isChecked}
        color={isChecked ? '#0091da' : undefined}
        onValueChange={() => toggleSelection(item.bid, isStore)}
        style={{ marginRight: 10 }}
      />
      <Image
        source={{ uri: API_URL + item.bookimg }}
        style={styles.bookImage}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subText}>
          {isStore ? item.shopName : item.sellerName} - {item.region}
        </Text>
        <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
      </View>
      <TouchableOpacity
        style={{ position: 'absolute', right: 10, bottom: 20 }}
        onPress={() =>
          isStore
            ? cDeleteCart(item.sid, item.bid)
            : pDeleteCart(item.sellerType, item.bid)
        }
      >
        <Ionicons name="trash-outline" size={25} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};


  const handleBuy = async (isStore) => {
  const selected = isStore ? selectedStore : selectedPersonal;
  if (selected.length === 0) {
    Alert.alert('알림', '선택된 책이 없습니다.');
    return;
  }

  // 선택된 도서 정보 가져오기
  const BuyData = {
    books: selected.map((bid) => {
      const item = isStore
        ? sbookList.find((b) => b.bid === bid)
        : bookList.find((b) => b.bid === bid);
      return {
        bid: item.bid,
        type: isStore ? 3 : item.sellerType,  // 매장 도서는 type: 3, 개인 도서는 sellerType을 사용
      };
    }),
  };

  try {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

    // URL을 동적으로 설정
    const url = isStore
      ? `${API_URL}/book/${userId}/sb/request-payment`  // 매장 도서
      : `${API_URL}/book/${userId}/pb/request-payment`; // 개인 도서

    // 구매 요청 API 호출
    const response = await axios.post(url, BuyData, {
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    });

    console.log('구매 요청 성공', response.data);

    // 결제 화면으로 이동
    navigation.navigate('TossPaymentScreen', {
      paymentData: response.data,
    });
  } catch (error) {
    console.error('오류 발생:', error);
    Alert.alert('구매요청 실패', '다시 시도해주세요.');
  }
};



  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingTop: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={23} color="gray" />
          </TouchableOpacity>
          <Text style={styles.Label}>장바구니</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  <Text style={styles.sectionTitle}>개인 책</Text>
  <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(false)}>
    <Text style={styles.buyButtonText}>선택 구매</Text>
  </TouchableOpacity>
</View>

{bookList.length === 0 ? (
  <Text style={styles.emptyText}>장바구니에 담긴 개인 책이 없습니다.</Text>
) : (
  bookList.map((item) => renderBookItem(item, false))
)}

<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 }}>
  <Text style={styles.sectionTitle}>매장 책</Text>
  <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(true)}>
    <Text style={styles.buyButtonText}>선택 구매</Text>
  </TouchableOpacity>
</View>

{ sbookList.length === 0 ? (
  <Text style={styles.emptyText}>장바구니에 담긴 매장 책이 없습니다.</Text>
) : (
  sbookList.map((item) => renderBookItem(item, true))
)}

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  Label: {
    fontWeight: 'bold',
    fontSize: 28,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 10,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 10,
  },
  bookImage: {
    width: 60,
    height: 90,
    marginRight: 15,
    borderRadius: 5,
    backgroundColor: 'gray',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  buyButton: {
  backgroundColor: '#0091da', // 버튼 색상
  borderRadius: 10, // 라운드 처리
  paddingHorizontal: 10, // 좌우 여백
  height: 30, // 높이
  justifyContent: 'center', // 내용 중앙 정렬
  alignItems: 'center', // 내용 중앙 정렬
},
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
});

export default AddCart;
