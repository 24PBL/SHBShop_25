import React, { useState } from 'react';
import { Alert, Text, View, ScrollView } from 'react-native';
import styled from 'styled-components';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const DeleteID = ({ navigation }) => {
  const [Name, setName] = useState('');
  const [Birth, setBirth] = useState('');
  const [BirthError, setBirthError] = useState('');
  const [PNum, setPNum] = useState('');
  const [PNumError, setPNumError] = useState('');

  const changeName = (text) => {
    setName(text);
  };

  function isValidBirthdate(birthdate) {
    if (!/^\d{8}$/.test(birthdate)) return false;
    const year = parseInt(birthdate.substring(0, 4), 10);
    const month = parseInt(birthdate.substring(4, 6), 10);
    const day = parseInt(birthdate.substring(6, 8), 10);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  }

  const BirthCheck = (text) => {
    let cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length > 8) cleanedText = cleanedText.slice(0, 8);

    let formattedText = cleanedText;
    if (cleanedText.length > 4) {
      formattedText = cleanedText.slice(0, 4) + '-' + cleanedText.slice(4);
    }
    if (cleanedText.length > 6) {
      formattedText = cleanedText.slice(0, 4) + '-' + cleanedText.slice(4, 6) + '-' + cleanedText.slice(6);
    }

    setBirth(formattedText);

    if (!isValidBirthdate(cleanedText)) {
      setBirthError('올바르지 않은 형식입니다.');
    } else {
      setBirthError('');
    }
  };

  function isValidMobileNumber(phone) {
    const regex = /^010-\d{4}-\d{4}$/;
    return regex.test(phone);
  }

  const CheckPhone = (text) => {
    setPNum(text);
    if (!isValidMobileNumber(text)) {
      setPNumError('올바르지 않은 형식입니다.');
    } else {
      setPNumError('');
    }
  };

  const handleSubmit = () => {
    if (!Name || !Birth || !PNum || BirthError || PNumError) {
      Alert.alert('오류', '모든 항목을 올바르게 입력해주세요.');
      return;
    }

    navigation.navigate('DeleteID1', {
      Name: Name,
      Birth: Birth,
      PNum: PNum,
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Container>
            <Text style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginRight: 170 }}>회원 탈퇴</Text>

            <Separator />
            <Separator />

            <Label>이름</Label>
            <SignInput
              placeholder="이름"
              placeholderTextColor="rgba(0,0,0,0.4)"
              onChangeText={changeName}
            />

            <Separator />

            <Label>생년월일</Label>
            <SignInput
              placeholder="YYYYMMDD"
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={Birth}
              onChangeText={BirthCheck}
            />
            <Text style={{ color: 'red', marginLeft: 50, marginTop: 5 }}>{BirthError}</Text>

            <Label>전화번호</Label>
            <SignInput
              placeholder="010-XXXX-XXXX"
              placeholderTextColor="rgba(0,0,0,0.4)"
              onChangeText={CheckPhone}
              value={PNum}
            />
            <Text style={{ color: 'red', marginLeft: 50, marginTop: 5 }}>{PNumError}</Text>

            <SignBox onPress={handleSubmit}>
              <SignText>다음</SignText>
            </SignBox>
          </Container>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default DeleteID;
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

const Separator = styled.View`
  margin: 5px 0;
`;

const SignInput = styled.TextInput`
  border-width: 1px;
  border-color: black;
  border-radius: 10px;
  width: 270px;
  height: 55px;
  justify-content: center;
  align-items: center;
  margin-left: 50px;
  font-size: 16px;
  padding-left: 14px;
`;

const SignBox = styled.TouchableOpacity`
  width: 270px;
  height: 45px;
  border-radius: 10px;
  background-color: #0091DA;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  margin-left: 50px;
`;

const SignText = styled.Text`
  color: white;
  font-weight: bold;
`;
