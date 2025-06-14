import { React, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const StoreBookRegister = ({ route, navigation }) => {
  const { title, author, publisher, ISBN, shopId } = route.params;
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState(''); 
  const [selectedImages, setSelectedImages] = useState([]);

  // pickImage 함수 수정
const pickImage = async () => {
  if (selectedImages.length >= 3) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
    allowsMultipleSelection: true,
    selectionLimit: 3,
  });

  if (!result.canceled) {
    const newUris = result.assets.map((asset) => asset.uri);
    // 최대 3개로 제한
    setSelectedImages((prevImages) => {
      const combined = [...prevImages, ...newUris];
      return combined.slice(0, 3);
    });
  }
};


  const cancelImage = (uriToRemove) => {
    setSelectedImages((prevImages) => prevImages.filter(uri => uri !== uriToRemove));
  };

    const goToHome = () => {
      navigation.navigate('HomeScreen');
    }
  

  const handleSubmit = async () => {
  
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');

  const formData = new FormData();

  formData.append('title', title);
  formData.append('author', author);
  formData.append('publish', publisher);
  formData.append('isbn', ISBN);
  formData.append('price', price);
  formData.append('detail', description);

  // 이미지 1~3개를 각각 img1, img2, img3 필드로 추가
  selectedImages.forEach((uri, index) => {
    if (index < 3) {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename ?? '');
      const type = match ? `image/${match[1]}` : `image`;

      formData.append(`img${index + 1}`, {
        uri,
        name: filename,
        type,
      });
    }
  });

  try {
    const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-stock/add-sbook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${Token}`
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert(
        '등록 성공',
        '성공적으로 등록되었습니다.'
      );
      navigation.reset({
  index: 0,
  routes: [
    {
      name: 'MyPageScreen',
    },
  ],
});

    } else {
      console.error(data);
      alert('등록 실패: ' + (data?.message || '알 수 없는 오류'));
    }
  } catch (error) {
    console.error(error);
    alert('서버 오류 발생');
  }
};


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: -100, paddingTop:10 }}>
          <TouchableOpacity onPress={goToHome}>
            <Ionicons name="chevron-back-outline" size={30} color="black" style={{ marginLeft: -20, paddingRight: 10 }} />
          </TouchableOpacity>
          <Text style={{ fontWeight: 'bold', fontSize: 28 }}>매장 재고 개별 등록</Text>
        </View>

        <ScrollView style={{ width: '90%' }} showsVerticalScrollIndicator={false}>
          <View style={{ height: 20 }}></View>
          <Text style={styles.inputtitle} numberOfLines={1} ellipsizeMode='tail'>제목</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 70, borderRadius: 10, justifyContent: 'center', left:20 }}>
            <Text style={{ paddingLeft: 20, fontSize: 20, color:'gray' }}>{title}</Text>
          </View>

          <Text style={styles.inputtitle}>저자</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 50, borderRadius: 10, justifyContent: 'center', left:20 }}>
            <Text style={{ paddingLeft: 20, fontSize: 20, color:'gray' }}>{author}</Text>
          </View>

          <Text style={styles.inputtitle}>출판사</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 50, borderRadius: 10, justifyContent: 'center', left:20 }}>
            <Text style={{ paddingLeft: 20, fontSize: 20, color:'gray' }}>{publisher}</Text>
          </View>

          <Text style={styles.inputtitle}>가격</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 50, borderRadius: 10, justifyContent: 'center', left:20 }}>
            <TextInput style={{ paddingLeft: 20, fontSize: 20 }} placeholder="숫자만 입력" onChangeText={setPrice}></TextInput>
          </View>

          <Text style={styles.inputtitle}>설명</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 300, borderRadius: 10, left:20 }}>
            <TextInput style={{ paddingLeft: 20, fontSize: 20 }} placeholder="ex)책 상태, 사용 여부 등" onChangeText={setDescription}></TextInput>
          </View>
          {/* 이미지 첨부 버튼이 선택되지 않은 경우에만 표시 */}
   
       
            <View>
              {/* 사진 첨부 UI 수정 */}
              <Text style={styles.inputtitle}>사진 첨부</Text>
              {selectedImages.length < 3 && (
                <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                  <Ionicons name="add-outline" size={30} color="black" />
                </TouchableOpacity>
              )}

            </View>
          

          {/* 선택한 이미지 표시 */}
          {selectedImages.length > 0 && (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, paddingLeft: 20 }}>
    {selectedImages.map((uri, index) => (
      <View key={index} style={{ marginRight: 10, marginBottom: 10 }}>
        <Image source={{uri : uri}} style={styles.selectedImage} />
        <TouchableOpacity onPress={() => cancelImage(uri)} style={styles.cancelButton}>
          <Ionicons name="close-circle-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    ))}
  </View>
)}
          <View style={{height:20}}></View>
          <TouchableOpacity style={{width:'90%', backgroundColor:'#0091da', height:50, alignItems:'center', justifyContent:'center', borderRadius:10 , left:20}} onPress={handleSubmit}>
            <Text style={{color:'white', fontWeight:'bold'}}>재고 등록</Text>
            </TouchableOpacity>
          <View style={{height:20}}></View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default StoreBookRegister;

const styles = StyleSheet.create({
  inputtitle: {
    fontSize: 18,
    paddingBottom: 10,
    paddingLeft: 30,
    fontWeight: 'bold',
    paddingTop: 10,
  },
  imagePickerButton: {
    borderWidth: 1,
    borderRadius: 10,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 20,
    left:10
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  imageContainer: {
    marginTop: 20,
  },
  cancelButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
});
