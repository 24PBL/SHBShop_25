import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ChangePWScreen = ({navigation}) => {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (newPwd && confirmPwd && newPwd !== confirmPwd) {
      setError('비밀번호가 일치하지 않습니다.');
      setIsValid(false);
    } else {
      setError('');
      setIsValid(currentPwd !== '' && newPwd !== '' && confirmPwd !== '');
    }
  }, [currentPwd, newPwd, confirmPwd]);

  const handleSubmit = () => {
    console.log({ currentPwd, newPwd });
    // 비밀번호 변경 API 연동 코드 작성
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
      <View style={{flexDirection:'row', alignItems:'center'}}>
        <Ionicons name="chevron-back-outline" size={28} onPress={() => navigation.goBack()} style={{paddingLeft:20, paddingTop:10}} />
      <Text style={styles.title}>비밀번호 변경</Text>
      </View>
      <View style={{height:40}}></View>
      <Text style={styles.inputLabel}>현재 비밀번호</Text>
      <TextInput
        style={styles.input}
        placeholder="현재 비밀번호"
        secureTextEntry
        value={currentPwd}
        onChangeText={setCurrentPwd}          
        placeholderTextColor="rgba(0,0,0,0.4)"
      />

      <Text style={styles.inputLabel}>새 비밀번호</Text>
      <TextInput
        style={styles.input}
        placeholder="새 비밀번호"
        secureTextEntry
        value={newPwd}
        onChangeText={setNewPwd}          
        placeholderTextColor="rgba(0,0,0,0.4)"
      />

      <Text style={styles.inputLabel}>새 비밀번호 확인</Text>
      <TextInput
        style={styles.input}
        placeholder="새 비밀번호 확인"
        secureTextEntry
        value={confirmPwd}
        onChangeText={setConfirmPwd}
        placeholderTextColor="rgba(0,0,0,0.4)"

      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isValid && !error ? '#0091DA' : '#ccc' }]}
        disabled={!isValid || !!error}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>비밀번호 변경</Text>
      </TouchableOpacity>
      </SafeAreaView>
</SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
    marginTop:30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingLeft: 20,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 5,
    fontWeight: 'bold',
    paddingLeft: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#black',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    marginBottom: 22,
    height:50,
    width: '80%',
    marginLeft: 40,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 60,
    width: '80%',
    marginLeft: 40,
    marginTop:70
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChangePWScreen;
