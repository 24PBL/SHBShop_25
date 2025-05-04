import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const SearchInStore = ({ navigation, route }) => {
  const [SearchText, setSearchText] = useState('');
  const [bookList, setBookList] = useState([]);
  const { shopId, shopName } = route.params;

  const goToback = () => navigation.goBack();

  const BookSearch = async () => {
    if (!SearchText) {
      Alert.alert('검색어 없음', '검색어를 입력하세요.');
      return;
    }

    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

    if (Token) {
      try {
        const response = await fetch(
          `${API_URL}/shop/${userId}/${shopId}/search-book?keyword=${SearchText}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );
        const data = await response.json();
        console.log(data);
        setBookList(data.sbookList);
      } catch (error) {
        console.error('Fetch 오류:', error);
      }
    } else {
      console.log('토큰이 없습니다.');
    }
  };

  const CommergoToBookDetail = async (sid, bid) =>{
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
    console.log(data)
    navigation.navigate('cBookDetailScreen', {storedata : {data}});
    
  }

  const renderBookList = (list) =>
    list.map((book, index) => (
      <TouchableOpacity
        key={index}
        style={styles.bookItem}
        onPress={() => CommergoToBookDetail(book.sid, book.bid)}
      >
        <Image
          source={{ uri: `${API_URL}${book.bookimg}` }}
          style={styles.bookImage}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{book.title}</Text>
          <Text style={{ fontSize: 14, color: '#555', marginTop: 5 }}>
            {book.price}원
          </Text>
        </View>
      </TouchableOpacity>
    ));

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <Text style={{fontSize:28, fontWeight:'bold', left:20}}>{shopName} - 도서 검색</Text>
        <View style={styles.container}>
          {/* 검색창 */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={goToback}>
              <Ionicons
                name="arrow-back-outline"
                size={23}
                color="gray"
                style={{ marginLeft: -20, paddingRight: 10 }}
              />
            </TouchableOpacity>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={23}
                color="gray"
                style={{ paddingLeft: 10 }}
              />
              <TextInput
                style={styles.searchInput}
                onChangeText={setSearchText}
                value={SearchText}
                placeholder="책 제목을 입력하세요"
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.searchBtn} onPress={BookSearch}>
                <Text style={{ fontWeight: 'bold', color: 'white' }}>검색</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 검색 결과 리스트 */}
          <ScrollView style={{ width: '90%', marginTop: 20 }}>
            {bookList.length > 0 ? (
              renderBookList(bookList)
            ) : (
              <Text style={styles.noResultText}>검색 결과가 없습니다.</Text>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SearchInStore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  searchBox: {
    width: '80%',
    height: 40,
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  searchInput: {
    color: 'gray',
    fontSize: 17,
    paddingLeft: 10,
    flex: 1,
  },
  searchBtn: {
    backgroundColor: '#0091da',
    borderRadius: 10,
    width: 50,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
  },
  noResultText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
});
