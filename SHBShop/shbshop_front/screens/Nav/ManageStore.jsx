import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

const  ManageStore = ({navigation, route}) => {
  const { shopId, data} = route.params;
  
  const goToStoreInvenotry = async () =>{
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    
    const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-stock`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });
    const data = await response.json();
    console.log(data);
    navigation.navigate('StoreInventoryView', {storedata : {data}});
    
  }

  const goToReserve = async () =>{
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    
    const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-pr`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });
    const data = await response.json();
    console.log(data)
    navigation.navigate('ReserveList', {storedata : {data}});
    
  }

  const storeselledList = async () =>{
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    
    const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-payment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });
    const data = await response.json();
    console.log(data)
    navigation.navigate('StoreSelledList', data);
    
  }

  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white'}}>
        <TouchableOpacity style={{flexDirection:'row', alignItems:'center', marginBottom:30, paddingTop:10, paddingLeft:10}}>
          <Ionicons name="chevron-back-outline" size={28} onPress={() => navigation.navigate("MyPageScreen")} />
          <Text style={{fontSize:28, marginLeft:10, fontWeight:'bold'}}>매장관리</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={goToStoreInvenotry}>
          <Text>매장 재고 조회</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={storeselledList}>
          <Text>판매 완료 리스트</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={()=> navigation.navigate("CBookSearchScreen", {shopId: shopId})}>
          <Text>매장 재고 개별 등록</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={()=> navigation.navigate("ExcelUploadScreen", {shopId: shopId})}>
          <Text>매장 재고 일괄 등록</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={goToReserve}>
          <Text>예약 주문 목록 조회</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={()=> navigation.navigate('ChangeStoreInfo', {data: data.shop_info})}>
          <Text>매장 정보 수정</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({

});

export default ManageStore;