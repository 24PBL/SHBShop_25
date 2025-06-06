import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const API_URL = Constants.expoConfig.extra.API_URL;

const SellListSearch = ({navigation}) => {
  const [keyword, setKeyword] = useState('');
  const [onSaleBooks, setOnSaleBooks] = useState([]);
  const [soldBooks, setSoldBooks] = useState([]);

  const Search = async () => {
    if (!keyword.trim()) {
      Alert.alert('검색어 없음', '검색어를 입력하세요.');
      return;
    }

    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      if (!Token) {
        console.log('토큰이 없습니다.');
        return;
      }

      const response = await fetch(
        `${API_URL}/home/${userId}/my-page/check-my-product/search?keyword=${keyword}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);

      setOnSaleBooks(data.on_sale_book_list || []);
      setSoldBooks(data.sold_book_list || []);
    } catch (error) {
      console.error('Fetch 오류:', error);
    }
  };

  const renderBook = (item) => (
  <TouchableOpacity
    key={item.bid.toString()}
    style={styles.bookItem}
    onPress={()=>{goToSellDetail(item.bid)}}
  >
    <Image
      source={{ uri: `${API_URL}${item.bookimg}` }}
      style={styles.bookImage}
    />
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.author} | {item.publish}</Text>
      <Text style={{ fontWeight: 'bold' }}>{item.price.toLocaleString()}원</Text>
    </View>
  </TouchableOpacity>
);

const goToSellDetail = async (bid) => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      if (!Token) {
        console.log('토큰이 없습니다.');
        return;
      }

      const response = await fetch(
        `${API_URL}/home/${userId}/my-page/check-my-product/detail/${bid}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      navigation.navigate("SellDetail",data)

    } catch (error) {
      console.error('Fetch 오류:', error);
    }
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="검색어 (제목, 저자, 출판사, ISBN)"
            />
            <TouchableOpacity onPress={Search}>
              <View style={styles.searchButton}>
                <Text style={styles.searchButtonText}>검색</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 판매중 도서 */}
          <Text style={styles.sectionTitle}>판매 중인 도서</Text>
          {onSaleBooks.length === 0 ? (
            <Text style={styles.emptyText}>판매 중인 도서가 없습니다.</Text>
          ) : (
            onSaleBooks.map(renderBook)
          )}

          {/* 판매 완료 도서 */}
          <Text style={styles.sectionTitle}>판매 완료된 도서</Text>
          {soldBooks.length === 0 ? (
            <Text style={styles.emptyText}>판매 완료된 도서가 없습니다.</Text>
          ) : (
            soldBooks.map(renderBook)
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 30,
  },
  searchBox: {
    backgroundColor: '#d9d9d9',
    width: 350,
    height: 50,
    alignSelf: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  searchInput: {
    width: 270,
    marginLeft: 10,
  },
  searchButton: {
    width: 60,
    height: 40,
    backgroundColor: '#0091da',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginHorizontal: 15,
  },
  bookItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  bookImage: {
    width: 60,
    height: 80,
    resizeMode: 'cover',
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
});

export default SellListSearch;
