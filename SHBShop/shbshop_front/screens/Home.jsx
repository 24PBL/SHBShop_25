import React,{useState, useEffect} from 'react';
import { View, Text, StyleSheet,TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home({navigation}) {
  const [userData, setUserData] = useState(null);


  useEffect(() => {
    const fetchUserData = async () => {
      const data = await AsyncStorage.getItem('UserData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    };

    fetchUserData();
  }, []);

  const Logout = async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      console.log('토큰 삭제됨');
      navigation.navigate("LoginScreen")
    } catch (error) {
      console.error('데이터 삭제 중 오류 발생:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>홈 화면 예정</Text>
      <View></View>
      <TouchableOpacity onPress={removeUserData}><Text>임시 로그아웃</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', 
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
