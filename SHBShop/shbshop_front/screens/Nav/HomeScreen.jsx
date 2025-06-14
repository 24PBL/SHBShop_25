import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';
import fetchChatRoomsAndJoin from '../Chat/fetchChatRoomsAndJoin';
import Socket from '../Chat/Socket';
const API_URL = Constants.expoConfig.extra.API_URL;

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [bookList, setBookList] = useState([]);

  // 화면이 focus 될 때마다 실행되는 loadData 함수
  useFocusEffect(
  useCallback(() => {
    const loadData = async () => {
      try {
        const Token = await AsyncStorage.getItem('jwtToken');
        const Data = await AsyncStorage.getItem('UserData');
        const { decoded_user_id } = JSON.parse(Data);

        const res = await fetch(`${API_URL}/home/${decoded_user_id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        });

        const json = await res.json();

        setUserData(json);

        if (json.bookList) {
          const sortedBooks = json.bookList.sort(
            (a, b) => new Date(b.createAt) - new Date(a.createAt)
          );
          setBookList(sortedBooks);
        }
      } catch (err) {
        console.error('책 리스트 로딩 실패:', err);
      }
    };

    loadData();
  }, [])
);


  const goToBookSearch = () => {
    navigation.navigate('BookSearch');
  };

  const goToSerach = () => {
    navigation.navigate('Search');
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
      console.log('책 상세 정보:', data, bid);
      navigation.navigate('PBookDetailScreen', { storedata: data, bid });
    } catch (error) {
      console.error('책 상세 정보 가져오기 실패:', error);
      Alert.alert('오류', '책 상세 정보를 불러오는 데 실패했습니다.');
    }
  };

  const renderBookItem = ({ item, index }) => (
    <View key={`${item.bid}_${index}`}>
      <TouchableOpacity style={styles.bookBox} onPress={() => goToBookDetail(item.userType, item.bid)}>
        <Image source={{ uri: `${API_URL}/${item.bookimg}` }} style={styles.bookImg} />
        <View style={{ paddingLeft: 20, height: 100, width: 250 }}>
          <Text style={{ fontSize: 20, paddingBottom: 10 }}>{item.title}</Text>
          <Text style={{ fontSize: 16 }}>{item.price.toLocaleString()}원</Text>
        </View>
      </TouchableOpacity>
      <View style={{ width: '100%', backgroundColor: '#d9d9d9', height: 1 }} />
    </View>
  );

  useEffect(() => {
  const setupChatRooms = async () => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      if (userId && Token) {
        await fetchChatRoomsAndJoin(userId, Token); // 인자 전달
      } else {
        console.warn("userId 또는 Token이 없습니다.");
      }
    } catch (err) {
      console.error("채팅방 정보를 가져오는 중 오류 발생:", err);
    }
  };

  setupChatRooms();
}, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <TouchableOpacity
          onPress={goToBookSearch}
          style={{
            width: 80,
            height: 50,
            backgroundColor: '#0091da',
            borderRadius: 15,
            justifyContent: 'center',
            position: 'absolute',
            zIndex: 999,
            bottom: 50,
            right: 30,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17, textAlign: 'center' }}>
            물품 등록
          </Text>
        </TouchableOpacity>

        {userData ? (
          <View
            style={{
              width: '100%',
              height: 70,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: 'bold', paddingLeft: 15 }}>{userData.region}</Text>
            <Text></Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={{ paddingRight: 10 }} onPress={goToSerach}>
                <Ionicons name="search-outline" size={33} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={{ padding: 20 }}>불러오는 중...</Text>
        )}

        <FlatList
          style={{backgroundColor: 'white', flex: 1}}
          data={bookList}
          renderItem={renderBookItem}
          keyExtractor={(item, index) => `${item.bid}_${index}`}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.noBooksContainer}>
              <Text style={styles.noBooksText}>해당 지역에 등록된 도서가 없습니다.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  bookBox: {
    width: '100%',
    height: 130,
    flexDirection: 'row',
    paddingTop: 20,
  },
  bookImg: {
    backgroundColor: '#d9d9d9',
    width: 100,
    height: 100,
    borderRadius: 10,
    marginLeft: 15,
  },
  noBooksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noBooksText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
});
