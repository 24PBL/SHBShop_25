import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;
const ReserveList = ({route}) => {
  const { storedata } = route.params; 
  return (
    <View style={styles.container}>
      <Text>채팅 화면</Text>
      <TouchableOpacity onPress={()=>{console.log(storedata)}}>
        <Text>아아</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
});

export default ReserveList;