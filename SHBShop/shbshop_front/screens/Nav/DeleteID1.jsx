import React, { useState, useEffect } from 'react';
import { Alert, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components';
import axios from 'axios';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const DeleteID1 = ({ navigation, route }) => {
  const [inputValue, setInputValue] = useState('');
  const [emailError, setEmailError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRequestDisabled, setIsRequestDisabled] = useState(false);
  const Regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const { Name, Birth, PNum } = route.params;  
  const [UserId, setUserId] = useState(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setIsRequestDisabled(false);
    }
  }, [timer]);

  const handleInputChange = (text) => {
    setInputValue(text);
    setEmailError('');
  };

  const handleSubmit = async () => {
    if (!Regex.test(inputValue)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    const Token = await AsyncStorage.getItem('jwtToken');
    const userData = await AsyncStorage.getItem('UserData');
    const parsedData = JSON.parse(userData);
    const userId = parsedData.decoded_user_id;
    setUserId(userId);
    try {
      await axios.post(
        `${API_URL}/auth/${userId}/unregister/check-email`,
        {
          name: Name,
          birth: Birth,
          tel: PNum,
          email: inputValue,
        },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      Alert.alert('인증 코드 전송', '인증 코드가 이메일로 전송되었습니다.');
      setTimer(180);
      setIsRequestDisabled(true);
    } catch (error) {
      console.error('인증 코드 요청 실패:', error);
      Alert.alert('오류', '인증 코드 전송에 실패했습니다.');
    }
  };

  const verifyCode = async () => {
    const Token = await AsyncStorage.getItem('jwtToken');
    const userData = await AsyncStorage.getItem('UserData');
    const parsedData = JSON.parse(userData);
    const userId = parsedData.decoded_user_id;

    try {
      await axios.post(
        `${API_URL}/auth/${userId}/unregister/check-auth-code`,
        {
          email: inputValue,
          authCode: verificationCode,
        },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      Alert.alert('인증 성공', '이메일 인증이 완료되었습니다.');
      setIsCodeVerified(true);
    } catch (error) {
      console.error('인증 코드 확인 실패:', error);
      Alert.alert('오류', '유효하지 않은 인증 코드입니다.');
      setIsCodeVerified(false);
    }
  };

  const handleConfirmDeletion = () => {
    Alert.alert(
      '탈퇴 확인',
      '정말 탈퇴하시겠습니까?',
      [
        {
          text: '확인',
          onPress: async () => {
            try {
              const Token = await AsyncStorage.getItem('jwtToken');
              const userData = await AsyncStorage.getItem('UserData');
              const parsedData = JSON.parse(userData);
              const userId = parsedData.decoded_user_id;
  
              // 서버에 DELETE 요청 보내기
              await axios.delete(
                `${API_URL}/auth/${userId}/unregister/check-final/${inputValue}/${verificationCode}/1`,
                {
                  headers: {
                    Authorization: `Bearer ${Token}`,
                  },
                }
              );
              Alert.alert('탈퇴 성공', '회원 탈퇴가 완료되었습니다.');
              await AsyncStorage.removeItem('jwtToken');
              navigation.navigate('LoginScreen');
            } catch (error) {
              console.error('탈퇴 요청 실패:', error);
              Alert.alert('오류', '탈퇴 요청에 실패했습니다.');
            }
          },
        },
        {
          text: '취소',
          onPress: () => {
            // 취소 시 Navbar로 돌아가기
            navigation.navigate('Navbar');
          },
          style: 'cancel', // 취소 버튼을 취소 스타일로 설정
        },
      ],
      { cancelable: false }
    );
  };
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Container>
            <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginRight: 170 }}>
              이메일 인증
            </Text>
            <Separator />
            <Separator />
            <Label>이메일</Label>
            <TextAndTouch>
              <SignInputBox
                placeholder="이메일"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={inputValue}
                onChangeText={handleInputChange}
              />
              <TouchbleBox onPress={handleSubmit} disabled={isRequestDisabled}>
                <Text style={{ color: '#0091DA', fontSize: 17 }}>요청</Text>
              </TouchbleBox>
            </TextAndTouch>
            <ErrorText>{emailError}</ErrorText>

            <Label>인증번호</Label>
            <TextAndTouch>
              <SignInputBox
                placeholder="인증번호"
                placeholderTextColor="rgba(0,0,0,0.4)"
                value={verificationCode}
                onChangeText={setVerificationCode}
              />
              <TouchbleBox onPress={verifyCode}>
                <Text style={{ color: '#0091DA', fontSize: 17 }}>확인</Text>
              </TouchbleBox>
            </TextAndTouch>

            {timer > 0 && <TimerText>인증시간 : {formatTime(timer)}</TimerText>}
            <TouchableOpacity
              style={{
                backgroundColor: '#0091da',
                marginTop: 30,
                borderRadius: 10,
                width: 270,
                height: 55,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 50,
              }}
              disabled={!isCodeVerified}
              onPress={handleConfirmDeletion}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>확인</Text>
            </TouchableOpacity>
          </Container>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default DeleteID1;

const Container = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  background-color: white;
`;

const Label = styled.Text`
  font-size: 16px;
  margin-bottom: 8px;
  margin-left: 50px;
`;

const ErrorText = styled.Text`
  color: red;
  margin-left: 50px;
  margin-top: 5px;
`;

const TextAndTouch = styled.View`
  border-width: 1px;
  border-color: black;
  border-radius: 10px;
  flex-direction: row;
  width: 270px;
  height: 55px;
  justify-content: center;
  align-items: center;
  margin-left: 50px;
`;

const TouchbleBox = styled.TouchableOpacity`
  width: 50px;
  height: 40px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  border-color: #0091da;
  border-width: 1px;
`;

const SignInputBox = styled.TextInput`
  border-radius: 10px;
  width: 205px;
  height: 45px;
  padding-left: 10px;
  font-size: 16px;
`;

const TimerText = styled.Text`
  color: red;
  font-size: 16px;
  text-align: center;
  margin-top: 10px;
`;

const Separator = styled.View`
  margin: 5px 0;
`;
