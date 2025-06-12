import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

const StoreSelledList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { payment_book_list, shop_info } = route.params;
  const shopId = shop_info?.shopId;

  const [bookList, setBookList] = useState(payment_book_list);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // ✅ formatDate 함수 정의 추가
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  const adjustment = async () => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-payment-req`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });

      const result = await response.json();
      console.log(result)
      navigation.navigate("ShopAdjustmentList", result)
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  // orderid 기준으로 그룹화 (useMemo 활용)
  const groupedBooks = useMemo(() => {
    const groups = {};
    for (const book of bookList) {
      if (!groups[book.orderid]) groups[book.orderid] = [];
      groups[book.orderid].push(book);
    }
    return Object.values(groups);
  }, [bookList]);

  const toggleSelect = (orderid) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderid)
        ? prevSelected.filter((id) => id !== orderid)
        : [...prevSelected, orderid]
    );
  };

  const isSelected = (orderid) => selectedOrders.includes(orderid);

  const handleConfirmSelection = async () => {
    const selectedBooks = groupedBooks
      .filter(group => selectedOrders.includes(group[0].orderid))
      .flat();

    const selectedData = {
      books: selectedBooks.map(book => book.bid),
      price: selectedBooks.reduce((sum, book) => sum + book.price, 0),
    };

    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      if (!Token) {
        console.log('토큰이 없습니다.');
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-payment/req-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
        body: JSON.stringify(selectedData),
      });

      const result = await response.json();
      console.log('정산 신청 결과:', result);

      if (response.ok) {
        Alert.alert('정산 신청 완료', '선택하신 항목에 대한 정산 신청이 완료되었습니다.');

        setBookList(prev =>
          prev.filter(book => !selectedBooks.find(sel => sel.bid === book.bid))
        );

        setSelectedOrders([]);
      } else {
        const errorMsg = result.message || '정산 신청 중 오류가 발생했습니다.';
        Alert.alert('정산 신청 실패', errorMsg);
        console.error('정산 신청 API 오류:', result);
      }

    } catch (error) {
      console.error('정산 신청 Fetch 오류:', error);
      Alert.alert('오류', '정산 신청 중 네트워크 오류가 발생했습니다.');
    }
  };

  const totalSelectedPrice = useMemo(() => {
    return groupedBooks
      .filter(group => selectedOrders.includes(group[0].orderid))
      .flat()
      .reduce((sum, book) => sum + book.price, 0);
  }, [selectedOrders, groupedBooks]);


  const renderItem = ({ item: group }) => {
    const first = group[0];
    const title =
      group.length > 1 ? `${first.title} 외 ${group.length - 1}권` : first.title;
    const totalPrice = group.reduce((sum, b) => sum + b.price, 0);

    return (
      <TouchableOpacity onPress={() => toggleSelect(first.orderid)}>
        <View style={styles.bookBox}>
          <Checkbox
            value={isSelected(first.orderid)}
            onValueChange={() => toggleSelect(first.orderid)}
            style={styles.checkbox}
            color={'#0091da'}
          />
          <Image
            source={{ uri: API_URL + first.bookimg }}
            style={styles.bookImage}
            resizeMode="cover"
          />
          <View style={styles.bookInfo}>
            <Text style={styles.title}>{title}</Text>
            <Text>총 가격: {totalPrice.toLocaleString()}원</Text>
            <Text>결제일: {formatDate(first.paidAt)}</Text>
            <Text>결제수단: {first.payment_method}</Text>
            <Text>구매자: {first.ownerNickname}</Text>
            <Text>주소: {first.ownerAddress}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
             <Text style={styles.headerTitle}>판매 완료 내역</Text>
             <TouchableOpacity style={styles.adjustmentBtn} onPress={adjustment}>
                         <Text style={styles.adjustmentText}>정산 신청 목록</Text>
                       </TouchableOpacity>
        </View>
      </View>

      {/* 리스트 */}
      {groupedBooks.length === 0 ? (
         <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>판매 완료된 책이 없습니다.</Text>
          </View>
      ) : (
        <FlatList
          data={groupedBooks}
          keyExtractor={(item) => item[0].orderid.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* 정산 신청 버튼 (선택된 항목이 있을 때만 표시) */}
      {selectedOrders.length > 0 && (
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSelection}>
          <Text style={styles.confirmText}>
            {selectedOrders.length}건 선택됨 | 총 {totalSelectedPrice.toLocaleString()}원 → 정산 신청
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StoreSelledList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  bookBox: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  bookImage: {
    width: 80,
    height: 100,
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  confirmBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#0091da",
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
   emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  adjustmentBtn: {
    backgroundColor: '#0091da',
    borderRadius: 5,
    width: 100,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft:110
  },
  adjustmentText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
