import React, { useState, useEffect} from 'react';
import { Text, Alert, TouchableOpacity, FlatList, Switch, StyleSheet, View, ScrollView} from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components';
import axios from 'axios';
import * as Sign from '../LoginScreen'
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function FindPW2({ route, navigation }) {
  const { email, userType, authCode } = route.params; // 전달된 이메일
  const [CheckPW, setCheckPw] = useState("");
  const [PW, setPw] = useState("");
  const [HardPwError, setHardPwError] = useState("");
  const [PwError, setPwError] = useState("");

  const getPasswordInputStyle = () => {
    if (PW == CheckPW) {
      return {color : "blue"}
  }
    return {};
};

useEffect(() => {
    if (PW && CheckPW) {
      if (PW === CheckPW) {
        setPwError("비밀번호가 확인되었습니다.");
      } else {
        setPwError("비밀번호가 일치하지 않습니다.");
      }
    } else {
      setPwError("");
    }
  }, [PW, CheckPW]);

  // 비밀번호 변경 요청 함수
  const handlePasswordChange = async () => {
    if (!PW) {
      Alert.alert('비밀번호를 입력하세요');
      return;
    }

    try {
      // 이메일과 새 비밀번호를 서버로 보냄
      const response = await axios.put(`${API_URL}/auth/find-password/modify-pw`, {
        kind : userType,
        email : email,
        authCode : authCode,
        pw : PW

      });

      // 비밀번호 변경 성공 시 알림
      Alert.alert('비밀번호 변경 완료', '비밀번호가 성공적으로 변경되었습니다.');
      navigation.navigate('LoginScreen')
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      Alert.alert('오류', '비밀번호 변경에 실패했습니다.');
    }
  };

  // 비밀번호 유효성 검사
  const handlePWChange = (text) => {
    setPw(text);
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(text)) {
      setHardPwError('비밀번호는 8자 이상 숫자, 특수문자를 포함해야 합니다.');
    } else {
      setHardPwError('');
    }
  };

  return (
    <SafeAreaProvider>
    <SafeAreaView style={{flex : 1, backgroundColor : 'white'}}>
    <Container>
      <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 20, paddingLeft: 50 }}>비밀번호 재설정</Text>
      <StyledLabel>새 비밀번호</StyledLabel>
      <SignInputBox2
        placeholder="새 비밀번호"
        placeholderTextColor="rgba(0,0,0,0.2)"
        onChangeText={handlePWChange}
        secureTextEntry={true}
      />
      <Text style={{ color: "red" , marginLeft:50, marginTop:5}}>{HardPwError}</Text>
      <StyledLabel>새 비밀번호 확인</StyledLabel>
      <SignInputBox2
        placeholder="새 비밀번호 확인"
        placeholderTextColor="rgba(0,0,0,0.2)"
        onChangeText={setCheckPw}
        secureTextEntry={true}
      />
      <Text style={[{color : "red", marginLeft:50, marginTop:5}, getPasswordInputStyle()]}>{PwError}</Text>
      <SignUpBox onPress={handlePasswordChange}
        disabled={!PW || PW !== CheckPW || HardPwError !== ''}
        style={{
            opacity: !PW || PW !== CheckPW || HardPwError !== '' ? 0.5 : 1,
        }}
>
        <Sign.LoginText>비밀번호 재설정</Sign.LoginText>
        </SignUpBox>
    </Container>
  </SafeAreaView>
  </SafeAreaProvider>
  );
}
  const Container = styled.View`
    flex: 1;
    padding: 20px;
    justify-content: center;
  `;
  
  const SignInputBox2 = styled.TextInput`
    border-radius: 10px;
    width: 270px;
    height: 55px;
    padding-left: 10px;
    font-size: 16px;
    border-width: 1px;
    border-color: black;
    margin-left : 50px;
  `;
  
  const StyledLabel = styled(Sign.Label)`
    margin-left: 50px;
  `;
  
  const SignUpBox = styled(Sign.LoginBox)`
    margin-left: 50px;
    width : 270px;
  `;

  