import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const Approve = ({ route, navigation }) => {
  const { data } = route.params;
  const certdata = data.result;
  const API_URL = Constants.expoConfig.extra.API_URL;

  const sortedCertList = (certdata.cert_list || []).sort((a, b) => new Date(b.createAt) - new Date(a.createAt));

  const getStatusStyle = (state) => {
    switch (state) {
      case 3:
        return { color: 'red', statusText: '탈락' };
      case 2:
        return { color: 'blue', statusText: '통과' };
      case 1:
      default:
        return { color: 'gray', statusText: '심사중' };
    }
  };

  // 버튼 렌더링 함수
  const renderActionButton = (state, certId) => {
    if (state === 2) {
      
      return (
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={async () => {
            try {
              const Data = await AsyncStorage.getItem('UserData');
              const userData = JSON.parse(Data);
              const userId = userData.decoded_user_id;
              const Token = await AsyncStorage.getItem('jwtToken');
              const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-commer/${certId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Token}`
                },
              });
  
              if (response.ok) {
                const result = await response.json();
                navigation.navigate("StoreRegister",{data:{result}})
                
              } else {
                console.error('책방 등록 실패:', response.status);
              }
            } catch (error) {
              console.error('요청 중 오류 발생:', error);
            }
          }}
        >
          <Text style={styles.buttonText}>책방 등록</Text>
        </TouchableOpacity>
      );
    } else if (state === 3) {
      return (
        <TouchableOpacity style={styles.actionButton} onPress={() => console.log('재요청')}>
          <Text style={styles.buttonText}>재요청</Text>
        </TouchableOpacity>
      );
    }
  
    return null;
  };
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', paddingLeft: 15, paddingTop: 10 }}>
            사업자 승인
          </Text>
          <ScrollView>
            {sortedCertList.map((cert, index) => {
              const { color, statusText } = getStatusStyle(cert.state);
              const formattedDate = new Date(cert.createAt).toLocaleDateString('ko-KR');

              const isLatest = index === 0;

              return (
                <TouchableOpacity style={{ paddingTop: 20 }} key={index}>
                  <View
                    style={{
                      height: 1,
                      width: '90%',
                      borderWidth: 1,
                      left: 20,
                      borderColor: 'rgba(0,0,0,0.05)',
                      marginBottom: 20,
                    }}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                      {formattedDate} 결과 : <Text style={{ color: color }}>{statusText}</Text>
                    </Text>

                    {/* 최신 항목이라면 버튼 조건부 렌더링 */}
                    {isLatest && renderActionButton(cert.state, cert.certId)}
                  </View>
                  <View
                    style={{
                      height: 1,
                      width: '90%',
                      borderWidth: 1,
                      left: 20,
                      borderColor: 'rgba(0,0,0,0.05)',
                      marginTop: 20,
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Approve;
