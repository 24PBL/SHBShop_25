import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

const ExcelUploadScreen = ({ navigation, route }) => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const { shopId } = route.params;

  const pickExcelFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel"
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      console.log("📄 파일 선택 결과:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        const extension = pickedFile.name.split('.').pop().toLowerCase();

        if (extension !== 'xlsx' && extension !== 'xls') {
          Alert.alert('오류', '엑셀 파일만 선택 가능합니다.');
          return;
        }

        setFile(pickedFile);
        console.log('✅ 선택된 엑셀 파일:', pickedFile);
      } else {
        console.log("⚠️ 파일 선택이 취소되었거나 실패했습니다.");
      }
    } catch (err) {
      console.error("❌ 파일 선택 중 오류 발생:", err);
      Alert.alert('오류', '파일 선택 중 문제가 발생했습니다.');
    }
  };

  const pickImages = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImages(prev => [...prev, ...result.assets]);
      console.log("선택된 이미지:", result.assets.map(a => a.name));
    }
  } catch (err) {
    console.error("이미지 선택 중 오류:", err);
    Alert.alert("오류", "이미지 선택 중 문제가 발생했습니다.");
  }
};

  const upLoaddata = async () => {
    if (!file || images.length === 0) {
      Alert.alert("오류", "엑셀 파일과 이미지를 모두 선택해주세요.");
      return;
    }

    const formData = new FormData();

    // 엑셀 파일 타입 처리
    const excelType = file.name.endsWith('.xls')
      ? "application/vnd.ms-excel"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    formData.append("excel", {
      uri: file.uri,
      type: excelType,
      name: file.name,
    });


images.forEach(img => {
  const fileName = img.name;
  const fileType = fileName.split('.').pop().toLowerCase();

  formData.append("images", {
    uri: img.uri,
    name: fileName, // 엑셀의 img1_path와 매칭
    type: `image/${fileType}`,
  });
});


    try {
      const userData = await AsyncStorage.getItem('UserData');
      const userDataParsed = JSON.parse(userData);
      const userId = userDataParsed.decoded_user_id;
      const yourToken = await AsyncStorage.getItem('jwtToken');

      const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-stock/add-excel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${yourToken}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("성공", "도서 등록이 완료되었습니다.");
        console.log("업로드 성공", result);
        navigation.reset({
            index: 0,
            routes: [
              {
                name: 'MyPageScreen'
              },
            ],
          });
      } else {
        Alert.alert("실패", result.error || "등록 실패");
      }
    } catch (err) {
      console.error("업로드 실패", err);
      Alert.alert("오류", "네트워크 오류 또는 서버 오류");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingTop: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={28} />
          </TouchableOpacity>
          <Text style={styles.title}>매장 재고 일괄 등록</Text>
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={pickExcelFile}>
          <Ionicons name="document-text-outline" size={50} />
        </TouchableOpacity>

        <Text style={{ paddingLeft: 20, paddingTop: 5 }}> - 엑셀 파일을 등록해 주세요 - </Text>

        {file && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{file.name}</Text>
            <Text style={styles.fileSize}>크기: {(file.size / 1024).toFixed(2)} KB</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.uploadButton, { marginTop: 30 }]} onPress={pickImages}>
          <Ionicons name="images-outline" size={50} />
        </TouchableOpacity>

        <Text style={{ paddingLeft: 20, paddingTop: 5 }}> - 이미지들을 선택해 주세요 - </Text>

        <ScrollView horizontal style={{ marginTop: 10, paddingHorizontal: 20 }}>
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img.uri }}
              style={{ width: 70, height: 70, marginRight: 10, borderRadius: 8 }}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={upLoaddata}>
          <Text style={{ fontWeight: 'bold', color: 'white' }}>등록</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  uploadButton: {
    marginLeft: 40,
    marginTop: 20,
  },
  fileInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    marginBottom: 5,
  },
  fileSize: {
    color: 'gray',
  },
  submitButton: {
    backgroundColor: "#0091da",
    width: '80%',
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
  },
});

export default ExcelUploadScreen;
