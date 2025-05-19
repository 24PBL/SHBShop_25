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

const API_URL = Constants.expoConfig.extra.API_URL;

const AddCart = ({ navigation, route }) => {
  const { data } = route.params;
  const result = data.result || {};

  const sortByDateDesc = (arr) =>
    [...arr].sort((a, b) => new Date(b.createAt) - new Date(a.createAt));

  const [bookList, setBookList] = useState(sortByDateDesc(result.book_list || []));
  const [sbookList, setSbookList] = useState(sortByDateDesc(result.sbook_list || []));

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
          'Authorization': `Bearer ${Token}`,
        },
      });
      const data = await response.json();
      navigation.navigate('CBookDetailScreen', { storedata: { data } });
    } catch (error) {
      console.error('매장 책 상세 실패:', error);
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

      // 삭제 후 상태 업데이트
      setSbookList((prev) => prev.filter((item) => item.bid !== bid));
    } catch (error) {
      console.error('오류 발생:', error.response?.data || error.message);
      Alert.alert('장바구니 제거 실패', '다시 시도해주세요.');
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

      // 삭제 후 상태 업데이트
      setBookList((prev) => prev.filter((item) => item.bid !== bid));
    } catch (error) {
      console.error('오류 발생:', error.response?.data || error.message);
      Alert.alert('장바구니 제거 실패', '다시 시도해주세요.');
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
        <View style={{ height: 30 }} />

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
          {/* 개인 거래 책 리스트 */}
          {bookList.map((item) => (
            <TouchableOpacity key={item.idx} style={styles.bookItem} onPress={() => goToBookDetail(item.sellerType, item.bid)}>
              <Image
                source={{ uri: API_URL + item.bookimg }}
                style={styles.bookImage}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subText}>{item.sellerName} - {item.region}</Text>
                <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
              </View>
              <TouchableOpacity style={{ position: 'absolute', right: 10, bottom: 20 }} onPress={() => pDeleteCart(item.sellerType, item.bid)}>
                <Ionicons name="trash-outline" size={25} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* 매장 책 리스트 */}
          {sbookList.map((item) => (
            <TouchableOpacity key={item.idx} style={styles.bookItem} onPress={() => CommergoToBookDetail(item.sid, item.bid)}>
              <Image
                source={{ uri: API_URL + item.bookimg }}
                style={styles.bookImage}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subText}>{item.shopName} - {item.region}</Text>
                <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
              </View>
              <TouchableOpacity style={{ position: 'absolute', right: 10, bottom: 20 }} onPress={() => cDeleteCart(item.sid, item.bid)}>
                <Ionicons name="trash-outline" size={25} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
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
});

export default AddCart;
