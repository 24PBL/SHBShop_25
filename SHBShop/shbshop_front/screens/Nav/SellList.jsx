import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';


const API_URL = Constants.expoConfig.extra.API_URL;
const SellList = ({ route, navigation }) => {
  const { sellData } = route.params;

  // 최대 10개까지 잘라서 표시
  const onSaleBooks = sellData.on_sale_book_list.slice(0, 10);
  const soldBooks = sellData.sold_book_list.slice(0, 10);

  // 각 책 항목 렌더링
  const renderBookItem = ({ item }) => (
    <BookCard onPress={()=>{goToSellDetail(item.bid)}}>
      <BookImage source={{ uri: `${API_URL}/${item.bookimg}` }} />
      <BookInfo>
        <Title numberOfLines={1}>{item.title}</Title>
        <Author numberOfLines={1}>{item.author}</Author>
        <Price>{item.price.toLocaleString()}원</Price>
      </BookInfo>
    </BookCard>
  );

  const goToSellingList = async () => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-product/more-sale-book`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });
      const result = await response.json();
      console.log(result);
      navigation.navigate('SellingList', { sellingData: result, selldata : sellData });
    } catch (error) {
      console.error('오류 발생:', error);
    }
  }

  const goToSelledList = async () => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-product/more-sold-book`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });
      const result = await response.json();
      console.log(result);
      navigation.navigate('SelledList', { selledData: result, selldata : sellData });
    } catch (error) {
      console.error('오류 발생:', error);
    }
  }

  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MyPageScreen',
        },
      ],
    });
  };

  const goToSearch = () => {
    navigation.navigate("SellListSearch")
  }

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

  const goToBookSearch = () => {
    navigation.navigate('MyBookSearch', {sellData});
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
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
        <View
                  style={{
                    flexDirection: 'row',
                    alignItems:'center',
                    justifyContent:"space-between",
                  }}
                >
                  <TouchableOpacity onPress={goToHome}>
                    <Ionicons
                      name="chevron-back-outline"
                      size={30}
                      color="black"
                      style={{marginLeft:0}}
                    />
                  </TouchableOpacity>
                  <Text style={{ fontWeight: 'bold', fontSize: 28, marginLeft:10 }}>내 등록 도서</Text>
                  <TouchableOpacity onPress={goToSearch}>
                    <Ionicons name="search-outline" size={28} style={{paddingRight:20}}/>
                  </TouchableOpacity>
                </View>
        <Container>
      {/* 판매 중인 도서 섹션 */}
      <SectionHeader>
        <SectionTitle>판매 중인 도서</SectionTitle>
        <MoreButton
          onPress={goToSellingList}>
          <MoreText>더보기</MoreText>
        </MoreButton>
      </SectionHeader>

      <FlatList
        data={onSaleBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.bid.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      {/* 판매 완료 도서 섹션 */}
      <SectionHeader style={{paddingTop:50}}>
        <SectionTitle>판매 완료 도서</SectionTitle>
        <MoreButton
          onPress={goToSelledList}
        >
          <MoreText>더보기</MoreText>
        </MoreButton>
      </SectionHeader>

      <FlatList
        data={soldBooks}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.bid.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </Container>
      </SafeAreaView>
    </SafeAreaProvider>

  );
}

export default SellList;
const Container = styled.ScrollView`
  flex: 1;
  paddingLeft:16px;
  paddingRight:16px;
  paddingBottom:16px;
  background-color: #fff;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 8px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

const MoreButton = styled.TouchableOpacity``;

const MoreText = styled.Text`
  font-size: 14px;
  color: #007bff;
`;

const BookCard = styled.TouchableOpacity`
  width: 140px;
  margin-right: 12px;
`;

const BookImage = styled.Image`
  width: 140px;
  height: 180px;
  border-radius: 8px;
  background-color: #eee;
`;

const BookInfo = styled.View`
  margin-top: 6px;
`;

const Title = styled.Text`
  font-size: 14px;
  font-weight: bold;
`;

const Author = styled.Text`
  font-size: 12px;
  color: #666;
`;

const Price = styled.Text`
  font-size: 13px;
  margin-top: 2px;
  color: #222;
`;
