import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView,TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SBuyListDetail = ({ route,navigation }) => {
  const { storedata } = route.params;
  const API_URL = Constants.expoConfig.extra.API_URL;

  const { receipt_info } = storedata;

  const BuyComplete = async () => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.put(
        `${API_URL}/home/${userId}/my-page/show-receipt/detail/3/${receipt_info.rid}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      console.log("구매 확정 성공");
    }
    catch (error) {
      console.error('구매 확정 실패:', error);
      Alert.alert("구매 확정 실패", "다시 시도해주세요.");
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={{flexDirection:'row', alignItems:'center'}}>
          <TouchableOpacity onPress={()=> {navigation.goBack()}}>
             <Ionicons name="chevron-back-outline" size={28} style={{paddingBottom:20}}></Ionicons>
          </TouchableOpacity>
            <Text style={styles.header}>구매 도서 정보</Text>
            {receipt_info.state === 2 && (
  <TouchableOpacity onPress={BuyComplete}>
    <View style={{
      backgroundColor: '#0091da',
      width: 70,
      height: 30,
      justifyContent: 'center',
      borderRadius: 10,
      marginBottom: 20,
      marginLeft: 60
    }}>
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>구매 확정</Text>
    </View>
  </TouchableOpacity>
)}

          </View>
          

          <Image
            source={{ uri: `${API_URL}${receipt_info.bookimg}` }}
            style={styles.image}
          />

          <View style={styles.section}>
            <Text style={styles.label}>제목</Text>
            <Text style={styles.value}>{receipt_info.title}</Text>

            <Text style={styles.label}>저자</Text>
            <Text style={styles.value}>{receipt_info.author}</Text>

            <Text style={styles.label}>출판사</Text>
            <Text style={styles.value}>{receipt_info.publish}</Text>

            <Text style={styles.label}>가격</Text>
            <Text style={styles.value}>{receipt_info.price.toLocaleString()}원</Text>

            <Text style={styles.label}>지역</Text>
            <Text style={styles.value}>{receipt_info.region}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>판매매장</Text>
            <Text style={styles.value}>{receipt_info.shopName}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>결제 정보</Text>
            <Text style={styles.label}>결제일자</Text>
            <Text style={styles.value}>{receipt_info.createAt.split('T')[0]}</Text>

            <Text style={styles.label}>결제 상태</Text>
            <Text style={styles.value}>{receipt_info.reason}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft:90
  },
  image: {
    width: 140,
    height: 190,
    alignSelf: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginTop: 8,
    fontWeight:'bold'
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
});

export default SBuyListDetail;
