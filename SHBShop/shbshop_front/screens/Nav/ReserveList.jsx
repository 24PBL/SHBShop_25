import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_URL = Constants.expoConfig.extra.API_URL;

const ReserveList = ({ route, navigation }) => {
  const { storedata } = route.params;
  const { receipt_list, book_list } = storedata.data;

  // 데이터를 병합하되, 각 책(book)에 해당하는 receipt 정보를 찾아서 추가
  const dataForFlatList = book_list.map(book => {
      const matchedReceipt = receipt_list.find(receipt => receipt.orderid === book.orderid);
      return {
          ...book,
          receipt: matchedReceipt
      };
  });

  const goToReserveDetail = async (sid, ownerType, rid, bid) => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

    const response = await fetch(`${API_URL}/shop/${userId}/${sid}/check-pr/${ownerType}/${rid}/${bid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });

    const ReserverListData = await response.json();
    console.log(ReserverListData);
    navigation.navigate('ReserveDetail', { storedata: { ReserverListData } });
  };

  // renderItem 함수 수정
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => item.receipt && goToReserveDetail(
          storedata.data.shop_info.shopId,
          item.receipt.ownerType,
          item.receipt.rid,
          item.bid
      )}
    >
      <Image
        source={{ uri: `${API_URL}${item.bookimg}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        {/* ✅ 조건부 렌더링 되는 Fragment 내부의 공백/줄바꿈 제거 */}
        {item.receipt && (<>
            <Text style={styles.name}>예약자: {item.receipt.ownerName}</Text>
            <Text style={styles.reason}>{item.receipt.reason}</Text>
            <Text style={styles.price}>가격: {item.price.toLocaleString()}원</Text>
            <Text style={styles.date}>결제일: {new Date(item.receipt.paidAt).toLocaleDateString()}</Text>
        </>)}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={24} style={{ paddingLeft: 10 }} />
        </TouchableOpacity>
        <Text style={styles.header}>예약 주문 조회</Text>
      </View>

      {dataForFlatList && dataForFlatList.length > 0 ? (
        <FlatList
          data={dataForFlatList}
          keyExtractor={(item) => item.bid.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>예약된 책이 없습니다.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// styles는 동일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    color: '#222',
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  list: {
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 85,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  reason: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  price: {
      fontSize: 14,
      color: '#555',
      marginTop: 2,
  },
  date: {
      fontSize: 13,
      color: '#888',
      marginTop: 2,
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 40,
  },
});

export default ReserveList;
