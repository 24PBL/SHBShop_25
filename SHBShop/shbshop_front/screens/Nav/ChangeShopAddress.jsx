import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from "react-native-webview";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = Constants.expoConfig.extra.API_URL;

const ChangeShopAddress = ({route,navigation}) => {

    const { result } = route.params.data;

  const [form, setForm] = useState({
    businessName: result.userInfo.businessmanName,
    presidentName: result.userInfo.presidentName,
    coNumber: result.userInfo.coNumber,
    businessEmail: result.userInfo.businessEmail
  });

  const [files, setFiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [zipcode, setZipcode] = useState("");
  const [address, setAddress] = useState(result.userInfo.address);
  const [name, setName] = useState(result.userInfo.name);
  const [detailAddress, setDetailAddress] = useState("");
  const finaladdress = address + ' ' + detailAddress;
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

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setZipcode(data.zonecode);
    setAddress(data.address);
    setModalVisible(false);
  };

  const RequestChangeAddress = async () => {
  try {
    const formData = new FormData();

    // 기본 정보 추가
    formData.append("name", name);
    formData.append("businessmanName", form.businessName);
    formData.append("presidentName", form.presidentName);
    formData.append("coNumber", form.coNumber);
    formData.append("businessEmail", form.businessEmail);
    formData.append("address", finaladdress);


    // 파일 추가
    if (files.length > 0) {
      const file = files[0];
      formData.append("licence", {
        uri: file.uri,
        name: file.name,
        type: "application/pdf", // 필요시 동적으로 타입 감지 가능
      });
    }
    for (let [key, value] of formData.entries()) {
  if (value && value.uri) {
    console.log(`${key}: { uri: ${value.uri}, name: ${value.name}, type: ${value.type} }`);
  } else {
    console.log(`${key}: ${value}`);
  }
}


    // 사용자 정보 및 토큰 가져오기
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

    // API 요청
    const response = await axios.post(
      `${API_URL}/home/${userId}/my-page/modify-shop-address`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log(response);
    navigation.reset({
  index: 0,
  routes: [
    {
      name: 'MyPageScreen'
    }
  ],
});
  } catch (error) {
    console.error('오류 발생:', error);
    Alert.alert("정보 수정 실패", "다시 시도해주세요.");
  }
};


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>사업자 주소 변경</Text>
            <Text style={styles.subtitle}>사업자 정보</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>사업자명</Text>
              <Text style={styles.readOnlyText}>{form.businessName}</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>대표자명</Text>
              <Text style={styles.readOnlyText}>{form.presidentName}</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>사업자 등록번호</Text>
              <Text style={styles.readOnlyText}>{form.coNumber}</Text>
            </View>


            <View style={styles.inputWrapper}>
              <Text style={styles.label}>사업자 전자우편</Text>
              <Text style={styles.readOnlyText}>{form.businessEmail}</Text>
            </View>
            <View style={styles.inputWrapper}>
                <Text style={styles.label}>사업자 주소</Text>
            </View>
            
            <View>
              <Text style={{
                color: zipcode ? "black" : "rgba(0,0,0,0.5)", fontSize: 17, borderWidth: 1, padding: 10,
                width: 270, borderRadius: 10, height: 55, textAlignVertical: 'center', alignSelf: 'center'
              }}>{zipcode || "우편번호"}</Text>

              <TouchableOpacity style={styles.AddressStyle} activeOpacity={1} onPress={() => setModalVisible(true)}>
                <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>우편번호 찾기</Text>
              </TouchableOpacity>

              <Text style={{
                color: zipcode ? "black" : "rgba(0,0,0,0.5)", fontSize: 17, borderWidth: 1, padding: 10,
                marginTop: 10, width: 270, borderRadius: 10, height: 65, textAlignVertical: 'center', alignSelf: 'center'
              }}>{address || "주소"}</Text>

              <View style={{ margin: 5 }}></View>

              <TextInput
                placeholder="상세주소"
                value={detailAddress}
                onChangeText={setDetailAddress}
                style={{
                  borderWidth: 1, padding: 10, marginTop: 10, width: 270,
                  borderRadius: 10, height: 55, fontSize: 17, alignSelf: 'center'
                }}
              />

              <Modal visible={modalVisible} animationType="slide">
                <WebView
                  source={{ uri: "https://24pbl.github.io/react-native-daum-postcode/" }}
                  onMessage={handleWebViewMessage}
                />
                <Button title="닫기" onPress={() => setModalVisible(false)} />
              </Modal>
            </View>

            <Text style={styles.subtitle}>사업자등록증</Text>
            <View style={styles.fileContainer}>
              {files.length === 0 ? (
                <TouchableOpacity style={styles.filePickerButton} onPress={pickFile}>
                  <Ionicons name="document-attach-outline" size={35} color="#aaa" />
                </TouchableOpacity>
              ) : (
                <View style={styles.fileWrapper}>
                  <Text numberOfLines={1} style={styles.fileText}>{files[0].name}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={removeFile}>
                    <Ionicons name="close-circle" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.note}>
              <Text style={{ fontWeight: 'bold' }}>주소 변경 후 사업자 등록증(pdf)을 첨부해주세요</Text>
            </Text>
            <TouchableOpacity onPress={RequestChangeAddress} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>주소 변경 요청</Text>
            </TouchableOpacity>
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
    backgroundColor: '#fff',
    marginTop: 35,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 50,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 50,
  },
  inputWrapper: {
    marginBottom: 10,
    marginLeft: 50,
    width: 270,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  readOnlyText: {
    borderWidth: 1,
    borderColor: '#727272',
    borderRadius: 10,
    padding: 10,
    fontSize: 17,
    height: 55,
    textAlignVertical: 'center',
    color: '#333',
    backgroundColor: '#f4f4f4',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    marginLeft: 50,
    width: 270,
    height: 55,
    justifyContent: 'space-between',
  },
  filePickerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  fileText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    position: 'absolute',
    top: -2,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  note: {
    fontSize: 12,
    color: '#777',
    marginTop: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    marginLeft: 50,
  },
  submitButton: {
    backgroundColor: '#0091DA',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 50,
    width: 270,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  AddressStyle: {
    width: 270,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#0091da',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 50
  }
});

export default ChangeShopAddress;
