import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';


const API_URL = Constants.expoConfig.extra.API_URL;

const AdjustmentList = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { payment_group } = route.params;
   
  const adjustmentDetail = async (pyid) => {
  try {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

    const response = await fetch(`${API_URL}/home/${userId}/my-page/check-payment-req/${pyid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });

    const result = await response.json();
    console.log(result);
    navigation.navigate("AdjustmentDetail", result)
  } catch (error) {
    console.error('오류 발생:', error);
  }
};
  const renderItem = ({ item }) => {
    const firstTitle = item.books[0]?.title || '제목 없음';
    const bookCount = item.books.length;
    const displayTitle = bookCount > 1 ? `${firstTitle} 외 ${bookCount - 1}권` : firstTitle;

    return (
      <TouchableOpacity style={styles.card} onPress={()=>adjustmentDetail(item.pyid)}>
        <Text style={styles.title}> {displayTitle}</Text>
        <Text style={styles.row}> 총 금액: <Text style={styles.value}>{item.price.toLocaleString()}원</Text></Text>
        <Text style={styles.row}> 신청일: <Text style={styles.value}>{dayjs(item.createAt).format('YYYY.MM.DD')}</Text></Text>
        <Text style={styles.row}> 상태: <Text style={styles.value}>{item.state === 10 ? '정산 진행 중' : item.state === 11 ? '정산 완료' : '알 수 없음'}</Text></Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>정산 신청 리스트</Text>
        </View>

        <FlatList
          contentContainerStyle={styles.container}
          data={payment_group}
          renderItem={renderItem}
          keyExtractor={(item) => item.pyid.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>정산 신청 내역이 없습니다.</Text>}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  row: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  value: {
    fontWeight: '600',
    color: '#222',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});

export default AdjustmentList;
