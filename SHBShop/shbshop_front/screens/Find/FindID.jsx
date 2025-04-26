import { Text, Alert } from 'react-native';
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

export default function FindID({ navigation, route }) {
    const [Name, setName] = useState('');
    const [Birth, setBirth] = useState('');
    const [PNum, setPNum] = useState('');
    const { userType } = route.params; // 이전 창에서 받아온 유저 유형

    // 정규식
    const birthRegex = /^\d{8}$/;  // YYYYMMDD (8자리 숫자)
    const phoneRegex = /^010-\d{4}-\d{4}$/; // 010-XXXX-XXXX

    const formatBirthForServer = (text) => {
        return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
    };
    
    

    // 전화번호 입력 시 자동 하이픈 추가
    const formatPhoneNumber = (text) => {
        const cleaned = text.replace(/\D/g, ''); // 숫자 이외 제거
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

    // 확인 버튼 클릭 시 처리
    const handleSubmit = async () => {
        if (!birthRegex.test(Birth)) {
            Alert.alert('오류', '생년월일 형식이 올바르지 않습니다.');
            return;
        }
        if (!phoneRegex.test(PNum)) {
            Alert.alert('오류', '전화번호 형식이 올바르지 않습니다.');
            return;
        }
    
        try {
            const response = await axios.post(`${API_URL}/auth/find-email`, {
                kind: userType,
                name: Name,
                birth: formatBirthForServer(Birth),
                tel: PNum
            });
    
            console.log('✅ 응답 데이터:', response.data.message); 
    
            navigation.navigate('SuccessID', {
                res: response.data 
            });
    
        } catch (error) {
            console.error('❌ 요청 실패:', error);
            Alert.alert('에러', '서버 요청에 실패했습니다.');
        }
    };

    return (
        <Back>
            <Container>
                <LoginTitle>아이디 찾기</LoginTitle>
                <Separator />
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
                    onChangeText={(text) => {
                        const cleaned = text.replace(/\D/g, ''); // 숫자만
                        if (cleaned.length <= 8) setBirth(cleaned);
                    }}
                    keyboardType="numeric"
                    maxLength={8}
                />


                {!birthRegex.test(Birth) && Birth !== '' && <ErrorText>형식이 올바르지 않습니다.</ErrorText>}
                <Separator />

                <Label>전화번호</Label>
                <InputBox 
                    placeholder="010-1234-5678"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    value={PNum}
                    onChangeText={(text) => setPNum(formatPhoneNumber(text))}
                    keyboardType="numeric"
                    maxLength={13}
                />
                {!phoneRegex.test(PNum) && PNum !== '' && <ErrorText>형식이 올바르지 않습니다.</ErrorText>}
                <Separator />

                <LoginBox onPress={handleSubmit}>
                    <LoginText>확인</LoginText>
                </LoginBox>
            </Container>
        </Back>
    );
}

const Back = styled.View`
    flex: 1;
    background-color: white;
`;

const Container = styled.View`
    flex: 1;
    justify-content: center;
    width: 280px;
    align-items: left;
    padding: 10px;
    margin: 0 auto;
`;

const LoginTitle = styled.Text`
    font-size: 30px;
    margin-bottom: 10px;
    font-weight: bold;
`;

const InputBox = styled.TextInput`
    border-color: black;
    border-width: 1px;
    border-radius: 10px;
    width: 260px;
    height: 60px;
    padding-left: 10px;
    font-size: 17px;
`;

const Label = styled.Text`
    margin-bottom: 10px;
    margin-top: 10px;
    font-weight: bold;
    color: #727272;
`;

const Separator = styled.View`
    margin: 5px 0;
`;

const LoginBox = styled.TouchableOpacity`
    width: 260px;
    height: 55px;
    border-radius: 10px;
    background-color: #0091DA;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
`;

const LoginText = styled.Text`
    color: white;
    font-weight: bold;
    font-size: 17px;
`;

const ErrorText = styled.Text`
    color: red;
    margin-top: 5px;
    font-size: 14px;
`;
