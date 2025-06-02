import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export default function NewBuyList({route, navigation}) {
const { receiptData } = route.params;

  return (
    <View style={styles.container}>
      {/* 여기에 컴포넌트를 추가하세요 */}
      <TouchableOpacity onPress={()=>console.log(receiptData)}><Text>아아</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 흰 배경
    justifyContent: 'center', // 가운데 정렬
    alignItems: 'center',
  },
});
