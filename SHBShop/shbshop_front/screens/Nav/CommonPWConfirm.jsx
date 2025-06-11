import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = Constants.expoConfig.extra.API_URL;

const CommonPWConfirm = ({navigation, route}) => {

  const [PW, setPW] = useState(''); // 비밀번호 상태 관리
  const {bankaccount, bankname} = route.params;
  const goToinfoChange = async () =>{
    try{
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.post(`${API_URL}/home/${userId}/my-page/modify-info/check-pw`,
      { password: PW }, 
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          'Content-Type': 'application/json',
        },
      }
    );
      const data = response.data;
      console.log(data)
      navigation.navigate("EditProfileScreen", {data : {result : data}, bankaccount : bankaccount, bank_name : bankname});
  } catch (error) {
      console.error('오류 발생:', error);
      Alert.alert("비밀번호 인증 실패", "비밀번호를 다시 확인해주세요.");
      
    }}
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white'}}>
        <View style={{flexDirection:'row', alignItems:'center', marginBottom:60, paddingTop:10, paddingLeft:10}}>
          <Ionicons name="chevron-back-outline" size={28} onPress={() => navigation.goBack()} />
          <Text style={styles.title}>개인정보 수정</Text>
        </View>

      <Text style={styles.label}>비밀번호 인증</Text>

      <View style={styles.inputWrapper}>
        <TouchableOpacity style={styles.inlineButton} onPress={goToinfoChange}>
          <Text style={styles.buttonText}>확인</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.inputWithButton}
          placeholder="비밀번호"
          placeholderTextColor="rgba(0, 0, 0, 0.2)"
          secureTextEntry
          onChangeText={setPW}
          value={PW}
        />
      </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};


const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft:20,
  },
  label: {
    fontSize: 15,
    //fontWeight: 'bold',
    marginBottom: 8,
    paddingLeft:40
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    width:'80%',
    marginLeft:40
  },
  inputWithButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    paddingRight: 70, 
    paddingVertical: 10,
    fontSize: 17,
    paddingLeft: 10,
    height:60,
    //marginleft: 50,
  },
  inlineButton: {
    position: 'absolute',
    right: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#0091DA',
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  buttonText: {
    color: '#0091DA',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
export default CommonPWConfirm;

