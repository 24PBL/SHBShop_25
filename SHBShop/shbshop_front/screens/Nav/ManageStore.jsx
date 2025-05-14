import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ManageStore({navigation}) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white'}}>
        <TouchableOpacity style={{flexDirection:'row', alignItems:'center', marginBottom:30, paddingTop:10, paddingLeft:10}}>
          <Ionicons name="chevron-back-outline" size={28} onPress={() => navigation.goBack()} />
          <Text style={{fontSize:28, marginLeft:10, fontWeight:'bold'}}>매장관리</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
          <Text>매장 재고 조회</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={()=> navigation.navigate("StoreBookRegister")}>
          <Text>매장 재고 개별 등록</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={()=> navigation.navigate("ExcelUploadScreen")}>
          <Text>매장 재고 일괄 등록</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
          <Text>예약 주문 목록 조회</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection:'row', paddingLeft:20, width:'90%', justifyContent:'space-between', alignItems:'center', marginBottom:20}} onPress={()=> navigation.navigate('ChangeStoreInfo')}>
          <Text>매장 정보 수정</Text>
          <Ionicons name="chevron-forward-outline" size={23}/>
        </TouchableOpacity>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({

});
