// BookDetailList.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BookDetailList = () => {
  useEffect(() => {
    console.log('📘 BookDetailList 페이지 진입');
    // 추후 params와 fetch 작업 여기에 추가
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>도서 상세 목록</Text>
      <Text style={styles.placeholder}>여기에 데이터가 표시됩니다.</Text>
    </SafeAreaView>
  );
};

export default BookDetailList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});
