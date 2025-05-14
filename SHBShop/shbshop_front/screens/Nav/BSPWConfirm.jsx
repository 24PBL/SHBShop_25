import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const BSPWConfirm = ({navigation}) => {
  return (
    <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white'}}>
      <View style={{flexDirection:'row', alignItems:'center', marginBottom:60, paddingTop:10, paddingLeft:10}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={28} />
          </TouchableOpacity>
        <Text style={styles.title}>사업자정보 수정</Text>
      </View> 
    
      <Text style={styles.label}>비밀번호 인증</Text>

      <View style={styles.inputWrapper}>
        <TouchableOpacity style={styles.inlineButton}>
          <Text style={styles.buttonText}>확인</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.inputWithButton}
          placeholder="비밀번호"
          placeholderTextColor="rgba(0, 0, 0, 0.2)"
          secureTextEntry
        />
      </View>
      </SafeAreaView>
   </SafeAreaProvider>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 20,
  },
  label: {
    fontSize: 15,
    marginBottom: 8,
    paddingLeft: 40,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    width: '80%',
    marginLeft: 40,
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
    height: 40,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#0091DA',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
export default BSPWConfirm;

