import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = Constants.expoConfig.extra.API_URL;

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [bookList, setBookList] = useState([]);

  // 화면이 focus 될 때마다 실행되는 loadData 함수
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('UserData');
          if (jsonValue != null) {
            const parsed = JSON.parse(jsonValue);
            setUserData(parsed);
            if (parsed.bookList) {
              const sortedBooks = parsed.bookList.sort(
                (a, b) => new Date(b.createAt) - new Date(a.createAt)
              );
              setBookList(sortedBooks);
            }
          }
        } catch (e) {
          console.error('JSON 파싱 에러', e);
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
      navigation.navigate('pBookDetailScreen', { storedata: { data } });
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <TouchableOpacity
          onPress={goToBookSearch}
          style={{
            width: 60,
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
            글쓰기
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
              <TouchableOpacity style={{ paddingRight: 5 }}>
                <Ionicons name="notifications-outline" size={33} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={{ paddingRight: 10 }} onPress={goToSerach}>
                <Ionicons name="search-outline" size={33} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={{ padding: 20 }}>불러오는 중...</Text>
        )}

        <FlatList
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
