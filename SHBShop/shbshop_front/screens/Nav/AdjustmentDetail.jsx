import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // ← 아이콘 사용 (expo 아이콘)
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig.extra.API_URL;



const AdjustmentDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { payment_info, book_list } = route.params;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>정산 신청 상세</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* 정산 정보 */}
        <View style={styles.section}>
          <Text>정산 금액: {payment_info.price.toLocaleString()}원</Text>
          <Text>정산 상태: {payment_info.state === 10 ? '정산 진행 중' : payment_info.state === 11 ? '정산 완료' : '알 수 없음'}</Text>
          <Text>신청 날짜: {formatDate(payment_info.createAt)}</Text>
        </View>

        {/* 책 목록 */}
        <View style={styles.section}>
          <Text style={styles.listHeader}>책 목록</Text>
          {book_list.map((book, index) => (
            <View key={book.bid} style={styles.bookBox}>
              <Image
                source={{ uri: API_URL + book.img }}
                style={styles.bookImage}
                resizeMode="cover"
              />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{index + 1}. {book.title}</Text>
                <Text>저자: {book.author}</Text>
                <Text>출판사: {book.publish}</Text>
                <Text>가격: {book.price.toLocaleString()}원</Text>
                <Text>등록일: {formatDate(book.createAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdjustmentDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bookBox: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  bookImage: {
    width: 80,
    height: 100,
    marginRight: 12,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
