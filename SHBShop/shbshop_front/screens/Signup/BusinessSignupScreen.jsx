import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Button, ScrollView} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { WebView } from "react-native-webview";
import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const BusinessSignupScreen = ({route, navigation}) => {
  const [form, setForm] = useState({
    businessName: '',
    representativeName: '',
    registrationNumber: '',
    phoneNumber: '',
    businessemail: '',
  });

  const handleSubmit = async () => {
    if (
      !form.businessName ||
      !form.representativeName ||
      !form.registrationNumber ||
      !form.phoneNumber ||
      !form.businessemail ||
      !address ||
      !detailAddress ||
      files.length === 0 ||
      !files[0]?.uri
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
  
    const finaladdress = address + ' ' + detailAddress;
  
    const formData = new FormData();
    formData.append('email', email);
    formData.append('authCode', authCode);
    formData.append('password', password);
    formData.append('nickname', nickname);
    formData.append('name', name);
    formData.append('birth', birth);
    formData.append('tel', phone);
    formData.append('address', finaladdress);
    formData.append('businessmanName', form.businessName);
    formData.append('presidentName', form.representativeName);
    formData.append('businessEmail', form.businessemail);
    formData.append('coNumber', form.registrationNumber);
  
    if (img) {
      formData.append('imgfile', {
        uri: img,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
    }
  
    formData.append('licence', {
      uri: files[0].uri,
      name: files[0].name,
      type: 'application/pdf',
    });
  
    console.log("폼데이터 준비 완료:", formData);

    try{
      const response = axios.post(
        `${API_URL}/auth/join/commercial/fill-user-info`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    navigation.navigate('LoginScreen')}
    catch(error){
      console.error('회원 가입 실패: ', error);
    }


  };
  

  const {email, authCode, password, nickname, name, birth, phone, img} = route.params;

  const [files, setFiles] = useState([]);

  const finaladdress = address + ' ' + detailAddress;

  const handleInputChange = (name, value) => {
    if (name === 'registrationNumber' || name === 'phoneNumber') {
      value = value.replace(/[^0-9-]/g, ''); // 숫자만 입력 가능
    }
    setForm({ ...form, [name]: value });
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

  const [modalVisible, setModalVisible] = useState(false);
    const [zipcode, setZipcode] = useState("");
    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
  
    const handleWebViewMessage = (event) => {
      const data = JSON.parse(event.nativeEvent.data);
      setZipcode(data.zonecode);
      setAddress(data.address);
      setModalVisible(false);
    };


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>사업자 회원가입</Text>
          <Text style={styles.subtitle}>사업자 정보</Text>
          {Object.keys(form).map((key) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={{
                businessName: '사업자명',
                representativeName: '대표자명',
                registrationNumber: '사업자 등록번호',
                phoneNumber: '사업자 대표번호',
                businessemail: '사업자 전자우편',
              }[key]}
              placeholderTextColor="#aaa"
              value={form[key]}
              onChangeText={(value) => handleInputChange(key, value)}
              keyboardType={key === 'registrationNumber' || key === 'phoneNumber' ? 'numeric' : 'default'}
            />
          ))}
          <View>

<Text style={{color: zipcode ? "black" : "rgba(0,0,0,0.5)", fontSize:17, borderWidth: 1, padding: 10, width:270, borderRadius:10, height:55, textAlignVertical:'center', alignSelf:'center'}}>{zipcode || "우편번호"}</Text>
<TouchableOpacity style={styles.AddressStyle} activeOpacity={1} onPress={() => setModalVisible(true)} ><Text style={{fontSize:17, color:'white', fontWeight:'bold'}}>우편번호 찾기</Text></TouchableOpacity>

<Text style={{color: zipcode ? "black" : "rgba(0,0,0,0.5)", fontSize:17,  borderWidth: 1, padding: 10, marginTop: 10, width:270, borderRadius:10, height:55, textAlignVertical:'center', alignSelf:'center'}}>{address || "주소"}</Text>
<View style={{margin : 5}}></View>
<TextInput
  placeholder="상세주소"
  value={detailAddress}
  onChangeText={setDetailAddress}
  style={{ borderWidth: 1, padding: 10, marginTop: 10, width:270, borderRadius:10, height:55, fontSize:17, alignSelf:'center' }}
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
            <Text style={{ fontWeight: 'bold' }}>회원가입 후 사업자 기능은 승인 후 이용 가능합니다.</Text>
          </Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton }>
            <Text style={styles.submitButtonText}>회원가입</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#727272',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginLeft: 50,
    width: 270,
    height: 55,
    fontSize: 17,
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
  AddressStyle:{
    width: 270,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#0091da',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginLeft : 50
  }
});

export default BusinessSignupScreen;
