import React, { useState, useMemo } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Constants from 'expo-constants';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

const MySelledList = ({ route, navigation }) => {
  const { data } = route.params;

  const [bookList, setBookList] = useState(data.payment_book_list); // books → state 관리
  const [selectedOrders, setSelectedOrders] = useState([]); // 선택된 orderid 목록

  // orderid 기준으로 그룹화
  const groupedBooks = useMemo(() => {
    const groups = {};
    for (const book of bookList) {
      if (!groups[book.orderid]) groups[book.orderid] = [];
      groups[book.orderid].push(book);
    }
    return Object.values(groups); // [[book, book], [book], ...]
  }, [bookList]);

  const toggleSelect = (orderid) => {
    if (selectedOrders.includes(orderid)) {
      setSelectedOrders(prev => prev.filter(id => id !== orderid));
    } else {
      setSelectedOrders(prev => [...prev, orderid]);
    }
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

      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-payment/req-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
        body: JSON.stringify(selectedData),
      });

      const result = await response.json();
      console.log(result);
      Alert.alert('정산 신청', '정산 신청되었습니다.');

      // ✅ 리스트에서 신청된 책 제거
      setBookList(prev =>
        prev.filter(book => !selectedBooks.find(sel => sel.bid === book.bid))
      );

      // ✅ 선택 상태 초기화
      setSelectedOrders([]);
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  const adjustment = async () => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-payment-req`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });

      const result = await response.json();
      console.log(result.payment_group[0])
      navigation.navigate("AdjustmentList", result)
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  const renderItem = ({ item: group }) => {
    const first = group[0];
    const title =
      group.length > 1 ? `${first.title} 외 ${group.length - 1}권` : first.title;
    const totalPrice = group.reduce((sum, b) => sum + b.price, 0);

    return (
      <TouchableOpacity style={styles.card} onPress={() => toggleSelect(first.orderid)}>
        <Ionicons
          name={isSelected(first.orderid) ? "checkbox" : "square-outline"}
          size={24}
          color="#007BFF"
          style={styles.checkbox}
        />
        <Image
          source={{ uri: `${API_URL}${first.bookimg}` }}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.author}>{first.author} | {first.publish}</Text>
          <Text style={styles.price}>총 판매가: {totalPrice.toLocaleString()}원</Text>
          <Text style={styles.buyer}>구매자: {first.ownerName} ({first.ownerNickname})</Text>
          <Text style={styles.date}>결제일: {new Date(first.paidAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
  <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>판매 완료 목록</Text>
          <TouchableOpacity style={styles.adjustmentBtn} onPress={adjustment}>
            <Text style={styles.adjustmentText}>정산 신청 목록</Text>
          </TouchableOpacity>
        </View>

        {groupedBooks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>판매 완료된 책이 없습니다.</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={groupedBooks}
              renderItem={renderItem}
              keyExtractor={(item) => item[0].orderid}
            />
            {selectedOrders.length > 0 && (
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSelection}>
                <Text style={styles.confirmText}>
                  {selectedOrders.length}건 선택됨 | 총 {groupedBooks
                    .filter(g => selectedOrders.includes(g[0].orderid))
                    .flat()
                    .reduce((sum, b) => sum + b.price, 0)
                    .toLocaleString()}원 → 정산 신청
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  </SafeAreaProvider>
);

};

export default MySelledList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    elevation: 2,
    alignItems: 'center'
  },
  checkbox: {
    marginRight: 8,
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: 6,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#555",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  buyer: {
    fontSize: 13,
    color: "#333",
  },
  date: {
    fontSize: 13,
    color: "#888",
  },
  confirmBtn: {
    padding: 16,
    backgroundColor: "#0091da",
    borderRadius: 10,
    marginTop: 12,
  },
  confirmText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  adjustmentBtn: {
    backgroundColor: '#0091da',
    borderRadius: 5,
    width: 100,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  adjustmentText: {
    color: 'white',
    fontWeight: 'bold'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adjustmentBtn: {
    backgroundColor: '#0091da',
    borderRadius: 5,
    width: 100,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustmentText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
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
});
