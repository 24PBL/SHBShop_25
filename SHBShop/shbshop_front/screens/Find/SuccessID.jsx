import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const SuccessID = ({ route, navigation }) => {
  const id = 'user123@gmail.com'; // 테스트용 아이디
  const {res} = route.params;


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>아이디 찾기</Text>
        <View style={styles.container}>



          <Text style={styles.text}>
           {res.message}
          </Text>


          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate("LoginScreen")} 
          >
            <Text style={styles.buttonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    position: 'absolute',
    top: 200,
    left: 60,
  },
  container: {
    width: 320,
    padding: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    textAlign: 'left',
    paddingBottom: 50,
  },
  highlight: {
    color: 'red',
    fontWeight: 'bold',
  },
  button: {
    width: 100,
    height: 45,
    backgroundColor: '#0091DA',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'absolute',
    bottom: -100,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SuccessID;
