import React from 'react';
import { View, Text, Image, ScrollView, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const API_URL = Constants.expoConfig.extra.API_URL;
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const stateMap = {
  1: '판매중',
  2: '결제 성공',
  3: '판매 거절',
  4: '판매 승인',
  5: '구매 확정',
  6: '사용자 취소',
  7: '환불 완료',
  8: '결제 실패',
  9: '결제 미완료',
};

const PBuyListDetail = ({route, navigation}) => {
  const { storedata, receiptData } = route.params;
  const { book_list, receipt_info, user_info } = storedata;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View>
          <TouchableOpacity>
            <Ionicons
              name="chevron-back-outline"
              size={28}
              onPress={()=>navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'BuyList',
                    params: { receiptData: receiptData },
                  },
                ],
              })}
              style={{ padding: 10 }}
            />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.container}>
          {/* 이미지 슬라이드 */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageSlider}
          >
            {book_list.map((book, index) => (
              <Image
            key={index}
            source={{ uri: `${API_URL}/${book.bookimg}` }}
            style={styles.image}
          />
        ))}
      </ScrollView>

      {/* 책 리스트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>구매한 책</Text>
        {book_list.map((book, idx) => (
          <View key={idx} style={styles.bookItem}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookDetail}>
              {book.author} / {book.publish}
            </Text>
            <Text style={styles.bookPrice}>{book.price.toLocaleString()}원</Text>
          </View>
        ))}
      </View>

      {/* 영수증 정보 */}
<View style={styles.receiptBox}>
  <View style={styles.receiptRow}>
    <Text style={styles.label}>결제 금액</Text>
    <Text style={styles.value}>{receipt_info.amount.toLocaleString()}원</Text>
  </View>
  <View style={styles.receiptRow}>
    <Text style={styles.label}>결제 방법</Text>
    <Text style={styles.value}>{receipt_info.payment_method}</Text>
  </View>
  <View style={styles.receiptRow}>
    <Text style={styles.label}>결제 상태</Text>
    <Text style={styles.value}>{stateMap[receipt_info.state]}</Text>
  </View>
  <View style={styles.receiptRow}>
    <Text style={styles.label}>결제 일시</Text>
    <Text style={styles.value}>
      {new Date(receipt_info.paidAt).toLocaleString()}
    </Text>
  </View>

  {/*여기에 판매자/판매처 구분해서 표시 */}
  <View style={styles.receiptRow}>
    <Text style={styles.label}>
      {book_list[0].sellerType === 1 ? '판매자' : '판매처'}
    </Text>
    <Text style={styles.value}>
      {book_list[0].sellerType === 1
        ? book_list[0].sellerName
        : book_list[0].shopName}
    </Text>
  </View>
</View>

    </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageSlider: { height: 280 },
  image: { width: width, height: 280, resizeMode: 'cover' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  bookItem: { marginBottom: 12 },
  bookTitle: { fontSize: 16, fontWeight: '600' },
  bookDetail: { color: 'gray', marginBottom: 4 },
  bookPrice: { fontWeight: 'bold' },

  receiptBox: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fdfaf6',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: { fontWeight: '500', color: '#333' },
  value: { color: '#444' },
});

export default PBuyListDetail;
