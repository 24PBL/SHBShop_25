import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
const EditProfileScreen = () => {
    const [PNum, setPNum] = useState('');    
    
    const formatPhoneNumber = (text) => {
        const cleaned = text.replace(/\D/g, ''); // 숫자 이외 제거
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    };

  return (
    <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>개인정보 수정</Text>

      {/* 전화번호 변경 */}
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

      {/* 주소 변경 */}
      <Text style={styles.sectionLabel1}>주소 변경</Text>
      <Text style={styles.sectionLabel}>새로운 주소를 입력하세요</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>주소</Text>
        <TextInput
          style={styles.input}
          placeholder="주소"
          placeholderTextColor="rgba(0,0,0,0.4)"
        />
      </View>

      {/* 닉네임 변경 */}
      <Text style={styles.sectionLabel1}>닉네임 변경</Text>
      <Text style={styles.sectionLabel}>새로운 닉네임을 입력하세요</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>닉네임</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임"
          placeholderTextColor="rgba(0,0,0,0.4)"
        />
      </View>

      {/* 확인 버튼 */}
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>확인</Text>
      </TouchableOpacity>
    </ScrollView>
            </SafeAreaView>
    </SafeAreaProvider>
    
  );
};


const styles = StyleSheet.create({
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
    paddingBottom:20
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
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
