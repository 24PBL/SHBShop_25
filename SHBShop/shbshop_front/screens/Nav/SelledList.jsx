import React from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import styled from 'styled-components/native';
import Constants from 'expo-constants';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

const SelledList = ({ route, navigation }) => {
  const { selledData, selldata } = route.params;

  // 최신순 정렬
  const soldBooks = [...selledData.sold_book_list].sort(
    (a, b) => new Date(b.createAt) - new Date(a.createAt)
  );

  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'SellList',
          params: { sellData: selldata },
        },
      ],
    });
  };

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {goToSellDetail(item.bid)}}
    >
      <BookCard>
        <BookImage source={{ uri: `${API_URL}/${item.bookimg}` }} />
        <BookInfo>
          <BookTitle numberOfLines={1}>{item.title}</BookTitle>
          <BookAuthor numberOfLines={1}>{item.author}</BookAuthor>
          <BookPrice>{item.price.toLocaleString()}원</BookPrice>
          <BookDate>판매일시 : {new Date(item.paidAt).toLocaleDateString()}</BookDate>
          <PaymentMethod>결제방법: {item.payment_method}</PaymentMethod>
        </BookInfo>
      </BookCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems:'center',
            justifyContent:'center',
            marginRight:180
          }}
        >
          <TouchableOpacity onPress={goToHome}>
            <Ionicons
              name="chevron-back-outline"
              size={30}
              color="black"
              style={{marginLeft:10}}
            />
          </TouchableOpacity>
          <Text style={{ fontWeight: 'bold', fontSize: 28, marginLeft:10 }}>판매 완료 리스트</Text>
        </View>
        <Container>
          <FlatList
            data={soldBooks}
            renderItem={renderItem}
            keyExtractor={(item) => item.bid.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </Container>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SelledList;

// styled components
const Container = styled.View`
  flex: 1;
  background-color: #fff;
  padding: 16px;
`;

const BookCard = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
`;

const BookImage = styled.Image`
  width: 100px;
  height: 140px;
  border-radius: 6px;
  background-color: #eee;
`;

const BookInfo = styled.View`
  flex: 1;
  margin-left: 12px;
  justify-content: space-around;
`;

const BookTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
`;

const BookAuthor = styled.Text`
  font-size: 14px;
  color: #666;
`;

const BookPrice = styled.Text`
  font-size: 15px;
  color: #222;
`;

const BookDate = styled.Text`
  font-size: 12px;
  color: #aaa;
`;

const PaymentMethod = styled.Text`
  font-size: 12px;
  color: #666;
`;
