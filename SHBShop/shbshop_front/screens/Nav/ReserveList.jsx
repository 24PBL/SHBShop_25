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

  // receipt와 book을 orderid 기준으로 병합
  const mergedData = receipt_list.map(receipt => {
    const matchedBook = book_list.find(book => book.orderid === receipt.orderid);
    return {
      ...receipt,
      ...matchedBook, // title, bookimg, bid 등 추가됨
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => goToReserveDetail(item.sid || storedata.data.shop_info.shopId, item.ownerType, item.rid, item.bid)}
    >
      <Image
        source={{ uri: `${API_URL}${item.bookimg}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.name}>예약자: {item.ownerName}</Text>
        <Text style={styles.reason}>{item.reason}</Text>
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

      {mergedData && mergedData.length > 0 ? (
        <FlatList
          data={mergedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.rid.toString()}
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
  },
  image: {
    width: 60,
    height: 85,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
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
