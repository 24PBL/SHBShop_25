// 생략된 import들 포함
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const Search = ({ navigation }) => {
  const [SearchText, setSearchText] = useState("");
  const [isRegionFilterOn, setIsRegionFilterOn] = useState(false);
  const [regionText, setRegionText] = useState("");
  const [noregion, setnoregion] = useState("");
  const [bookdata, setbookdata] = useState([]);
  const [personalBooks, setPersonalBooks] = useState([]);
  const [businessBooks, setBusinessBooks] = useState([]);

  const goToback = () => navigation.goBack();

  useEffect(() => {
    if (!isRegionFilterOn) {
      setRegionText('');
      if (regionText === "") {
        setnoregion("noneRestriction");
      }
    }
  }, [isRegionFilterOn]);

  const BookSearch = async () => {
    if (!SearchText) {
      Alert.alert("검색어 없음", "검색어를 입력하세요.");
      return;
    }

    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

    if (Token) {
      try {
        let url = isRegionFilterOn
          ? `${API_URL}/home/${userId}/search-book?keyword=${SearchText}&region=${regionText}`
          : `${API_URL}/home/${userId}/search-book?keyword=${SearchText}&region=${noregion}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setbookdata(data.bookList);
          const personal = data.bookList.filter(book => book.userType === 1);
          const business = data.bookList.filter(book => book.userType === 2);
          setPersonalBooks(personal);
          setBusinessBooks(business);
          console.log(business)
        } else {
          console.error('API 요청 실패:', response.status);
        }
      } catch (error) {
        console.error('Fetch 오류:', error);
      }
    } else {
      console.log('토큰이 없습니다.');
    }
  };

  const prenderBookList = (list) =>
    list.slice(0, 3).map((book, index) => (
      <TouchableOpacity key={index} style={styles.bookItem} onPress={()=> goToBookDetail(book.userType, book.bid)}>
        <Image
          source={{ uri: `${API_URL}/${book.bookimg}` }}
          style={styles.bookImage}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{book.title}</Text>
          <Text style={{ fontSize: 14, color: '#555', marginTop: 5 }}>{book.price}원</Text>
        </View>
      </TouchableOpacity>
    ));

    const crenderBookList = (list) =>
      list.slice(0, 3).map((book, index) => (
        <TouchableOpacity key={index} style={styles.bookItem} onPress={()=>{}}>
          <Image
            source={{ uri: `${API_URL}/${book.bookimg}` }}
            style={styles.bookImage}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{book.title}</Text>
            <Text style={{ fontSize: 14, color: '#555', marginTop: 5 }}>{book.price}원</Text>
          </View>
        </TouchableOpacity>
      ));

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
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={styles.container}>
          {/* 검색창 */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={goToback}>
              <Ionicons name="arrow-back-outline" size={23} color="gray" style={{ marginLeft: -20, paddingRight: 10 }} />
            </TouchableOpacity>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={23} color="gray" style={{ paddingLeft: 10 }} />
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

          {/* 지역 필터 */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>지역 설정</Text>
            <Switch value={isRegionFilterOn} onValueChange={setIsRegionFilterOn} />
          </View>

          {isRegionFilterOn && (
            <TextInput
              style={styles.regionInput}
              placeholder="지역명을 입력하세요"
              value={regionText}
              onChangeText={setRegionText}
            />
          )}

          {/* 검색 결과 */}
          
<ScrollView style={{ width: '90%', marginTop: 20 }} showsVerticalScrollIndicator={false}>
  {/* 개인 판매자 */}
  <Text style={styles.sectionTitle}>개인 판매자</Text>
  {personalBooks.length > 0 && (
    <TouchableOpacity onPress={() => navigation.navigate('pMoreList', { list: personalBooks, title: "개인 판매자" })}>
      <Text style={styles.moreBtn}>더보기</Text>
    </TouchableOpacity>
  )}
  {personalBooks.length > 0 ? (
    prenderBookList(personalBooks)
  ) : (
    <Text style={styles.noResultText}>개인 판매자 책이 없습니다.</Text>
  )}
  

  {/* 사업자 판매자 */}
  <Text style={styles.sectionTitle}>사업자 판매자</Text>
  {businessBooks.length > 0 && (
    <TouchableOpacity onPress={() => navigation.navigate('cMoreList', { list: businessBooks, title: "사업자 판매자" })}>
      <Text style={styles.moreBtn}>더보기</Text>
    </TouchableOpacity>
  )}
  {businessBooks.length > 0 ? (
    crenderBookList(businessBooks)
  ) : (
    <Text style={styles.noResultText}>사업자 판매자 책이 없습니다.</Text>
  )}
  
</ScrollView>

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Search;

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
    width: 200,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  regionInput: {
    marginTop: 5,
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  moreBtn: {
    color: '#0091da',
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 20,
  },
  noResultText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  }
  
});
