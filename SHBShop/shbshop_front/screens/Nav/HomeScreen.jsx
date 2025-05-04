import { React, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => { //데이터 가져오기
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('UserData');
        if (jsonValue != null) {
          const parsed = JSON.parse(jsonValue);
          setUserData(parsed);
          console.log(parsed);
        }
      } catch (e) {
        console.error('JSON 파싱 에러', e);
      }
    };
    loadData();
  }, []);

  const goToBookSearch = () => {
    navigation.navigate('BookSearch');
  }

  const goToSerach = () => {
    navigation.navigate('Search');
  }

  const Favorite = async () => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await fetch(`${API_URL}/home/${userId}/shop-mode/1/add-shop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });  
  }

  const FavoriteDelete = async () => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await fetch(`${API_URL}/home/${userId}/shop-mode/1/delete-shop`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });
  }

  const goToBookDetail = async (sellType, bid) =>{
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await fetch(`${API_URL}/book/${userId}/${sellType}/${bid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });
    const data = await response.json();
    navigation.navigate('pBookDetailScreen', {storedata : {data}});
    
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor:'white', flex : 1 }}>
        <TouchableOpacity onPress={goToBookSearch} style={{ width: 60, height: 50, backgroundColor: '#0091da', borderRadius: 15, justifyContent: 'center', position: 'absolute', zIndex: 999, bottom: 50, right: 30 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17, textAlign: 'center' }}>글쓰기</Text>
        </TouchableOpacity>
        {userData ? (
          <View style={{ width: '100%', height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', paddingLeft: 15 }}>{userData.region}</Text>
            <Text></Text>
            <View style={{ flexDirection: 'row' }}>
                {/* 즐겨찾기 기능을 확인하려면 여기 밑에 주석을 풀어주세요~*/}
            {/*
              <TouchableOpacity onPress={Favorite}><Text>즐겨찾기 </Text></TouchableOpacity>
              <TouchableOpacity onPress={FavoriteDelete}><Text>즐찾 삭제 </Text></TouchableOpacity>
              */}


              <TouchableOpacity style={{ paddingRight: 5 }}>
                <Ionicons name="notifications-outline" size={33} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={{ paddingRight: 10 }} onPress={goToSerach}>
                <Ionicons name="search-outline" size={33} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (<Text>불러오는 중...</Text>)}
        <ScrollView>
          {userData?.bookList?.length > 0 ? (
            userData?.bookList
              ?.sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
              .map((book, index) => (
                <View key={`${book.bid}_${index}`}>
                  <TouchableOpacity style={styles.bookBox} onPress={() => goToBookDetail(book.userType, book.bid)}>
                    <Image source={{ uri: `${API_URL}/${book.bookimg}` }} style={styles.bookImg}></Image>
                    <View style={{ paddingLeft: 20, height: 100, width: 250 }}>
                      <Text style={{ fontSize: 20, paddingBottom: 10 }}>{book.title}</Text>
                      <Text style={{ fontSize: 16 }}>{book.price.toLocaleString()}원</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={{ width: '100%', backgroundColor: '#d9d9d9', height: 1 }}></View>
                </View>
              ))
          ) : (
            <View style={styles.noBooksContainer}>
              <Text style={styles.noBooksText}>해당 지역에 등록된 도서가 없습니다.</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  bookBox: {
    width: '100%',
    height: 130,
    flexDirection: 'row',
    paddingTop: 20
  },
  bookImg: {
    backgroundColor: '#d9d9d9',
    width: 100,
    height: 100,
    borderRadius: 10,
    marginLeft: 15
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
    color: '#888'
  }
});
