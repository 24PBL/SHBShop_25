import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Button, Modal} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import styled from 'styled-components';
import { WebView } from "react-native-webview";
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';


const ReRegister = ({ route, navigation }) => {
  const { data } = route.params;
  const commerData = data.result;
  const API_URL = Constants.expoConfig.extra.API_URL;

  const [etc, setetc] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [files, setFiles] = useState([]);

  const finaladdress = address + ' ' + detailAddress

  const ReApprove = async () => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    try{
      console.log(data.result)
    const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-commer/${commerData.cert.certId}/regist-shop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Token}`
      },
      body : formData,
    });
    
      /*navigation.navigate("Navbar")*/
    } catch(error){
      console.error(error)
    }
  }

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setZipcode(data.zonecode);
    setAddress(data.address);
    setModalVisible(false);
  };

  const pickFile = async () => {
      let result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });
  
      if (result.canceled) return;
  
      setFiles([{ name: result.assets[0].name, uri: result.assets[0].uri }]);
    };
  
    const removeFile = () => {
      setFiles([]);
    };
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20, paddingLeft: 20, paddingTop: 10 }}>승인 재요청</Text>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>

        <Text style={styles.Label}>거절 사유</Text>
          <View style={{ width: '80%', borderWidth: 1, height: 200, borderRadius: 10, paddingLeft: 15, marginBottom: 10 }}>
            <Text
              style={{ fontSize: 18, height: 100, textAlignVertical: 'top', marginTop:10, color:'gray', fontWeight:'bold' }}
              value={etc}
              onChangeText={text => setetc(text)}
              multiline={true}
              numberOfLines={4}
            >{data.result.cert.reason}</Text>
          </View>

          <Text style={styles.Label}>이름</Text>
          <View style={styles.TextBox}><TextInput style={styles.BoxText}>{commerData.cert.name}</TextInput></View>

          <Text style={styles.Label}>대표자 명</Text>
          <View style={styles.TextBox}><TextInput style={styles.BoxText}>{commerData.cert.presidentName}</TextInput></View>

          <Text style={styles.Label}>사업자 명</Text>
          <View style={styles.TextBox}><TextInput style={styles.BoxText}>{commerData.cert.businessmanName}</TextInput></View>

          <Text style={styles.Label}>사업자 메일</Text>
          <View style={styles.TextBox}><TextInput style={styles.BoxText}>{commerData.cert.businessEmail}</TextInput></View>

          <Text style={styles.Label}>사업자 번호</Text>
          <View style={styles.TextBox}><TextInput style={styles.BoxText}>{commerData.cert.coNumber}</TextInput></View>

          <Text style={styles.Label}>주소</Text>
          <View>
      <SignBox  activeOpacity={1} onPress={() => setModalVisible(true)} ><Text style={{fontSize:17, color:'white', fontWeight:'bold'}}>우편번호 찾기</Text></SignBox>
      
      <Text style={{color: zipcode ? "black" : "rgba(0,0,0,0.5)", fontSize:17,  borderWidth: 1, padding: 10, marginTop: 10, width:330, borderRadius:10, height:55, textAlignVertical:'center', alignSelf:'center'}}>{address || "주소"}</Text>
      <Separator/>
      <TextInput
        placeholder="상세주소"
        value={detailAddress}
        onChangeText={setDetailAddress}
        style={{ borderWidth: 1, padding: 10, marginTop: 10, width:330, borderRadius:10, height:55, fontSize:17, alignSelf:'center' }}
      />

      {/* 다음 우편번호 검색 모달 */}
      <Modal visible={modalVisible} animationType="slide">
        <WebView
          source={{ uri: "https://24pbl.github.io/react-native-daum-postcode/" }} 
          onMessage={handleWebViewMessage}
        />
        <Button title="닫기" onPress={() => setModalVisible(false)} />
      </Modal>
    </View>
    <Separator/>
    <Text style={styles.Label}>사업자등록증</Text>
          <View style={{flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                marginBottom: 10,
                width: 270,
                height: 55,
                justifyContent: 'space-between'}}>
            {files.length === 0 ? (
              <TouchableOpacity style={{justifyContent:'center', alignItems:'center'}} onPress={pickFile}>
                <Ionicons name="document-attach-outline" size={35} color="#aaa" />
              </TouchableOpacity>
            ) : (
              <View style={{flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%'}}>
                <Text numberOfLines={1} style={{flex: 1,
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#333'}}>{files[0].name}</Text>
                <TouchableOpacity style={{position: 'absolute',
                    top: -2,
                    right: -5,
                    backgroundColor: 'white',
                    borderRadius: 10}} onPress={removeFile}>
                  <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
          </View>


          <TouchableOpacity style={{backgroundColor:'#0091da', width:'80%', borderRadius:10, height:50, alignItems:'center', justifyContent:'center'}} onPress={ReApprove}>
            <Text style={{fontSize:18, fontWeight:'bold', color:'white'}}>재요청</Text>
            </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  TextBox: {
    width: '80%',
    borderWidth: 1,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: 15,
    marginBottom: 10
  },
  Label: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    left: 42,
    paddingBottom: 8
  },
  BoxText: {
    fontSize: 18,
  },
  TimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  TimeBox: {
    width: '40%',
    borderWidth: 1,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Separator: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  ImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'center',
  },
  ImageWrapper: {
    position: 'relative',
    margin: 5,
  },
  Image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  DeleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 5,
  },
  DeleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  AddImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 5,
  },
  AddImageButtonText: {
    fontSize: 40,
    color: '#333',
  },
});


export const SignBox = styled.TouchableOpacity`
    width: 330;
    height: 45px;
    border-radius: 10px;
    background-color: #0091DA;
    justify-content: center;
    align-items: center;
`;
export const Separator = styled.View`
    margin: 5px 0;
`;

export default ReRegister;
