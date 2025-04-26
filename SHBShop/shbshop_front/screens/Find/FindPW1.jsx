import React, { useState, useEffect } from 'react';
import { Alert, Text } from 'react-native';
import styled from 'styled-components';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function FindPW1({ navigation, route }) {
  const [inputValue, setInputValue] = useState('');
  const [emailError, setEmailError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  const [Name, setName] = useState('');
  const [Birth, setBirth] = useState('');
  const [PNum, setPNum] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const birthRegex = /^\d{8}$/;  // YYYYMMDD (8자리 숫자)
  const phoneRegex = /^010-\d{4}-\d{4}$/; // 010-XXXX-XXXX

  const {userType} = route.params;
  const handleInputChange = (text) => {
    setInputValue(text);
    setEmailError('');
  };

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
      setIsCodeVerified(false);
    }
  }, [timer]);

  const handleSubmit = async () => {
    console.log('보내는 값:', {
      kind: userType,
      name: Name,
      birth: formatBirthForStorage(Birth),
      tel: PNum,
      email: inputValue
    });

    if (!emailRegex.test(inputValue)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/find-password/check-email`,
        { kind : userType,
          name : Name,
          birth : formatBirthForStorage(Birth),
          tel : PNum,
          email: inputValue });
      Alert.alert('인증 코드 전송', '인증 코드가 이메일로 전송되었습니다.');
      setTimer(180);
    } catch (error) {
      console.error('인증 코드 요청 실패:', error);
      Alert.alert('오류', '인증 코드 전송에 실패했습니다.');
    }
  };

  const nextSign = () => {
    navigation.navigate('FindPW2', { email: inputValue,
    userType : userType,
    authCode : verificationCode
     });
  };

  const verifyCode = async () => {
    try {
      await axios.post(`${API_URL}/auth/find-password/check-auth-code`, {
        kind : userType,
        email: inputValue,
        authCode: verificationCode,
      });
      Alert.alert('인증 성공', '이메일 인증이 완료되었습니다.');
      setIsCodeVerified(true);
    } catch (error) {
      console.error('인증 코드 확인 실패:', error);
      Alert.alert('오류', '유효하지 않은 인증 코드입니다.');
      setIsCodeVerified(false);
    }
  };

const isBirthValid = birthRegex.test(Birth);
const isPhoneValid = phoneRegex.test(PNum);
const isFormValid = Name.trim() !== '' && isBirthValid && isPhoneValid; //확인버튼 비활성화 조건건

const isButtonEnabled = isFormValid && isCodeVerified;

const formatBirthForStorage = (birth) => {
  if (birth.length === 8) {
    return `${birth.slice(0, 4)}-${birth.slice(4, 6)}-${birth.slice(6, 8)}`;
  }
  return birth;
};

const handleBirthChange = (text) => {
  // 숫자만 입력 가능하도록 필터링
  const filteredText = text.replace(/\D/g, '');
  if (filteredText.length <= 8) {
    setBirth(filteredText);
  }
};

  return (
    <Container>
      <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginTop: 70, marginRight: 80 }}>
        비밀번호 재설정
      </Text>
      <Separator/>
      <Label>이름</Label>
      <InputBox 
        placeholder="이름" 
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={Name} 
        onChangeText={setName} 
      />
      <Separator />

      <Label>생년월일</Label>
      <InputBox 
        placeholder="YYYYMMDD" 
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={Birth} 
        onChangeText={handleBirthChange} 
      />
      {!isBirthValid && Birth !== '' && <ErrorText>생년월일 형식이 올바르지 않습니다.</ErrorText>}
      <Separator />

      <Label>전화번호</Label>
      <InputBox 
        placeholder="010-1234-5678" 
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={PNum} 
        onChangeText={setPNum} 
      />
      {!isPhoneValid && PNum !== '' && <ErrorText>전화번호 형식이 올바르지 않습니다.</ErrorText>}
      <Separator />

      {/* 🔽 모든 입력값이 유효할 때만 이메일 인증 UI 표시 */}
      {isFormValid && (
        <>
          <Label>이메일</Label>
          <TextAndTouch>
            <SignInputBox 
              placeholder="아이디@gnu.ac.kr" 
              placeholderTextColor="rgba(0,0,0,0.2)" 
              value={inputValue} 
              onChangeText={handleInputChange} 
            />
            <TouchbleBox onPress={handleSubmit}>
              <Text style={{ color: '#0091DA', fontSize: 17 }}>요청</Text>
            </TouchbleBox>
          </TextAndTouch>
          <ErrorText>{emailError}</ErrorText>

          <Label>인증번호</Label>
          <TextAndTouch>
            <SignInputBox
              placeholder="인증번호"
              placeholderTextColor="rgba(0,0,0,0.2)"
              value={verificationCode}
              onChangeText={setVerificationCode}  
            />
            <TouchbleBox onPress={verifyCode}>
              <Text style={{ color: '#0091DA', fontSize: 17 }}>확인</Text>
            </TouchbleBox>
          </TextAndTouch>

          {timer > 0 && <TimerText>인증시간 : {formatTime(timer)}</TimerText>}
        </>
      )}

<SignBox
  onPress={nextSign}
  disabled={!isButtonEnabled} 
  style={{ backgroundColor: isButtonEnabled ? '#0091DA' : '#ccc' }}>
  <SignText>{isButtonEnabled ? '확인' : '인증 필요'}</SignText>
</SignBox>
    </Container>
  );
}

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

const InputBox = styled.TextInput`
  border-color: black;
  border-width: 1px;
  border-radius: 10px;
  width: 260px;
  height: 60px;
  padding-left: 10px;
  font-size: 17px;
  margin-left: 50px;
`;

const Separator = styled.View`
  margin: 5px 0;
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
  border-color: #0091DA;
  border-width: 1px;
`;

export const SignBox = styled.TouchableOpacity`
    width: 270px;
    height: 45px;
    border-radius: 10px;
    background-color: #0091DA;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    margin-left : 50px;
`;

export const SignText = styled.Text`
    color: white;
    font-weight: bold;
`;

export const SignInputBox = styled.TextInput`
    border-radius : 10px;
    width : 205px;
    height : 45px;
    padding-left : 10px;
    font-size : 16px;
`

const TimerText = styled.Text`
  color: red;
  font-size: 16px;
  text-align: center;
  margin-top: 10px;
`