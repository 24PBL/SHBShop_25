import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Button, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components';
import { WebView } from "react-native-webview";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const EditProfileScreen = ({ route, navigation }) => {
  const { result } = route.params.data;
  const {bankaccount, bank_name} = route.params; 
  const [random, setRandom] = useState(result.randomCode);
  const [PNum, setPNum] = useState(result.userInfo.tel);
  const [address, setAddress] = useState(result.userInfo.address);
  const [nickname, setNickname] = useState(result.userInfo.nickname);
  const [bankname, setbankname] = useState(bank_name);
  const [banknum, setbanknum] = useState(bankaccount);
  const [modalVisible, setModalVisible] = useState(false);
  const [zipcode, setZipcode] = useState('');
  const [changeAddress, setChangeAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const finaladdress = address + ' ' + detailAddress;
  const userType = result.user_type; // 사용자 타입

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setZipcode(data.zonecode);
    setAddress(data.address);
    setModalVisible(false);
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const infoChange = async () => {
  try {
    const formData = new FormData();
    formData.append("randomCode", random);
    formData.append("tel", PNum);
    formData.append("nickname", nickname);
    formData.append("bankname", bankname);
    formData.append("bankaccount", banknum);
    // userType이 2면 "commercial" 주소를 넣고, 아니면 실제 주소를 넣음
    if (userType === 2) {
      formData.append("address", "commercial");
    } else {
      formData.append("address", finaladdress);
    }

    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await axios.post(`${API_URL}/home/${userId}/my-page/modify-info`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log(response);
    navigation.reset({
  index: 0,
  routes: [
    {
      name: 'MyPageScreen'
    },
  ],
});
  } catch (error) {
    console.error('오류 발생:', error);
    Alert.alert("정보 수정 실패", "다시 시도해주세요.");
  }
};

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>개인정보 수정</Text>

          {/* 전화번호 변경 */}
          <Text style={styles.sectionLabel1}>전화번호 변경</Text>
          <Text style={styles.sectionLabel}>새로운 전화번호를 입력하세요</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>전화번호</Text>
            <TextInput
              style={styles.input}
              placeholder="전화번호"
              placeholderTextColor="rgba(0,0,0,0.4)"
              keyboardType="numeric"
              maxLength={13}
              value={PNum}
              onChangeText={(text) => setPNum(formatPhoneNumber(text))}
            />
          </View>

          {/* 주소 변경 - user_type이 2가 아닌 경우만 표시 */}
          {userType !== 2 ? (
            <>
              <Text style={styles.sectionLabel1}>주소 변경</Text>
              <Text style={styles.sectionLabel}>새로운 주소를 입력하세요</Text>
              <View style={styles.inputContainer}>
                <Label>주소</Label>
                <View>
                  <Text style={{
                    color: zipcode ? "black" : "rgba(0,0,0,0.5)",
                    fontSize: 17,
                    borderWidth: 1,
                    padding: 10,
                    width: '100%',
                    borderRadius: 10,
                    height: 55,
                    textAlignVertical: 'center',
                    alignSelf: 'center'
                  }}>
                    {zipcode || "우편번호"}
                  </Text>

                  <SignBox activeOpacity={1} onPress={() => setModalVisible(true)}>
                    <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>우편번호 찾기</Text>
                  </SignBox>

                  <Text style={{
                    color: zipcode ? "black" : "rgba(0,0,0,0.5)",
                    fontSize: 17,
                    borderWidth: 1,
                    padding: 10,
                    marginTop: 10,
                    width: '100%',
                    borderRadius: 10,
                    height: 65,
                    textAlignVertical: 'center',
                    alignSelf: 'center'
                  }}>
                    {address || "주소"}
                  </Text>

                  <Separator />

                  <TextInput
                    placeholder="상세주소"
                    value={detailAddress}
                    onChangeText={setDetailAddress}
                    style={{
                      borderWidth: 1,
                      padding: 10,
                      marginTop: 10,
                      width: '100%',
                      borderRadius: 10,
                      height: 55,
                      fontSize: 17,
                      alignSelf: 'center'
                    }}
                  />

                  {/* 모달 */}
                  <Modal visible={modalVisible} animationType="slide">
                    <WebView
                      source={{ uri: "https://24pbl.github.io/react-native-daum-postcode/" }}
                      onMessage={handleWebViewMessage}
                    />
                    <Button title="닫기" onPress={() => setModalVisible(false)} />
                  </Modal>
                </View>
              </View>
            </>
          ) : (
            // user_type === 2일 때 보여줄 내용
            <View style={styles.inputContainer}>
              <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 20}}>사업자 주소 변경</Text>
              <TouchableOpacity onPress={() => {navigation.navigate("ChangeShopAddress", {data: {result}})}}>
                  <Text style={{fontSize: 14, fontWeight: 'bold', marginTop: 30, color:'#0091da'}}>사업자 주소 변경은 이곳을 클릭해 주세요</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 닉네임 변경 */}
          <Text style={styles.sectionLabel1}>닉네임 변경</Text>
          <Text style={styles.sectionLabel}>새로운 닉네임을 입력하세요</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="닉네임"
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={nickname}
              onChangeText={setNickname}
            />
          </View>
        
        {userType !== 2 ? (
            <>
          <Text style={styles.sectionLabel1}>계좌 정보 변경</Text>
          <Text style={styles.sectionLabel}>은행명을 입력하세요</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>은행명</Text>
            <TextInput
              style={styles.input}
              placeholder="은행명"
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={bankname}
              onChangeText={setbankname}
            />
          </View>

          <Text style={styles.sectionLabel}>계좌번호를 입력하세요</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>계좌번호 <Text style={{fontSize:10, color:'gray'}}>(-를 포함하세요)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="-을 포함해주세요"
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={banknum}
              onChangeText={setbanknum}
            />
          </View>
          </>) : (
            <View style={styles.inputContainer}>
              <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 20}}>사업자 주소 변경</Text>
              <TouchableOpacity>
                  <Text style={{fontSize: 14, fontWeight: 'bold', marginTop: 30, color:'#0091da'}}>사업자 계좌 변경은 이곳을 클릭해 주세요</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* 확인 버튼 */}
          <TouchableOpacity style={styles.button} onPress={infoChange}>
            <Text style={styles.buttonText}>확인</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    paddingLeft: 20,
    paddingTop: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    paddingLeft: 40,
  },
  sectionLabel1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    paddingLeft: 40,
  },
  inputContainer: {
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
    alignSelf: 'center',
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#0091DA',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

const Label = styled.Text`
  font-size: 16px;
  margin-bottom: 8px;
`;

export const SignBox = styled.TouchableOpacity`
  width: 100%;
  height: 45px;
  border-radius: 10px;
  background-color: #0091DA;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
`;

export const Separator = styled.View`
  margin: 5px 0;
`;

export default EditProfileScreen;
