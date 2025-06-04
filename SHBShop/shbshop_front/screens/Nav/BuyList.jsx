import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  FlatList, Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

const BuyList = ({ navigation, route }) => {
  const { receiptData } = route.params ?? {};

  // 상태 관리
  const [personalList, setPersonalList] = useState([]);
  const [shopList, setShopList] = useState([]);

  // 3개월 이내 주문만 필터링 함수
  const isWithinThreeMonths = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return date >= threeMonthsAgo;
  };

  // 주문별로 묶고 대표책 + 외 n권 + 총 가격 계산
  const groupByOrderId = (books, paidAtMap, origin) => {
    if (!books || typeof books !== 'object') return [];

    const allBooks = Object.values(books).flat();

    const groups = {};
    allBooks.forEach(item => {
      if (!groups[item.orderid]) groups[item.orderid] = [];
      groups[item.orderid].push(item);
    });

    const result = Object.entries(groups).map(([orderid, items]) => {
      const createAt = paidAtMap[orderid] || null;
      const totalPrice = items.reduce((sum, book) => sum + Number(book.price || 0), 0);
      const mainBook = { ...items[0] };

      return {
        ...mainBook,
        createAt,
        origin,
        extraCount: items.length - 1,
        totalPrice,
        groupOrderId: orderid,
      };
    });

    return result.filter(item => isWithinThreeMonths(item.createAt));
  };

  useEffect(() => {
    if (!receiptData) return;

    const personalPaidAtMap = {};
    (receiptData.receipt_personal || []).forEach(item => {
      personalPaidAtMap[item.orderid] = item.paidAt;
    });
    const shopPaidAtMap = {};
    (receiptData.receipt_shop || []).forEach(item => {
      shopPaidAtMap[item.orderid] = item.paidAt;
    });

    setPersonalList(groupByOrderId(receiptData.books_personal, personalPaidAtMap, '개인거래'));
    setShopList(groupByOrderId(receiptData.books_shop, shopPaidAtMap, '매장거래'));
  }, [receiptData]);

  // 상세 페이지 이동 함수
  const handleClickItem = (item) => {
    goToBookDetail(item.groupOrderId);
  };

  const goToBookDetail = async (orderid) => {
    try {
      const userData = JSON.parse(await AsyncStorage.getItem('UserData'));
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userData.decoded_user_id}/my-page/show-receipt/detail/${orderid}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      console.log(data);
      navigation.navigate('PBuyListDetail', { storedata: data, receiptData });
    } catch (error) {
      Alert.alert('오류', '책 상세 정보를 불러오는 데 실패했습니다.');
    }
  };


  // 렌더링
  const renderBookItem = ({ item }) => (
    <TouchableOpacity style={styles.bookItem} onPress={() => handleClickItem(item)}>
      <Image
        source={{ uri: `${API_URL}${item.bookimg}` }}
        style={styles.bookImage}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {item.title}
          {item.extraCount > 0 && (
            <Text style={{ fontSize: 14, color: '#555' }}> 외 {item.extraCount}권</Text>
          )}
        </Text>
        <Text style={styles.price}>{item.totalPrice.toLocaleString()}원</Text>
        <Text style={styles.originLabel}>{item.origin}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!receiptData) {
    return (
      <View style={{ padding: 20 }}>
        <Text>데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'MyPageScreen'
                  },
                ],
              })}>
            <Ionicons name="chevron-back-outline" size={23} />
          </TouchableOpacity>
          <Text style={styles.label}>구매내역</Text>
        </View>

        <FlatList
          data={personalList}
          keyExtractor={(item, index) => `personal-${item.groupOrderId}-${index}`}
          renderItem={renderBookItem}
          ListHeaderComponent={<Text style={styles.sectionTitle}> 개인거래</Text>}
          ListEmptyComponent={<Text style={styles.empty}>개인거래 내역이 없습니다.</Text>}
        />

        <FlatList
          data={shopList}
          keyExtractor={(item, index) => `shop-${item.groupOrderId}-${index}`}
          renderItem={renderBookItem}
          ListHeaderComponent={<Text style={styles.sectionTitle}> 매장거래</Text>}
          ListEmptyComponent={<Text style={styles.empty}>매장거래 내역이 없습니다.</Text>}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingTop: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 28,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
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
    backgroundColor: 'gray',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  originLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
  },
  empty: {
    textAlign: 'center',
    padding: 20,
    color: '#888',
  },
});

export default BuyList;
