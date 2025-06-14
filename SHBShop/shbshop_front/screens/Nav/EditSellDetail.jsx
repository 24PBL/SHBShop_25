import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const EditSellDetail = ({ route, navigation }) => {
  const { data } = route.params;
  const book = data.book_info;


  const [price, setPrice] = useState(String(book.price));
  const [description, setDescription] = useState(book.detail || '');
  const [selectedImages, setSelectedImages] = useState([]);

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
      const newUris = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newUris].slice(0, 3));
    }
  };

  const cancelImage = (uri) => {
    setSelectedImages(prev => prev.filter(item => item !== uri));
  };

  const goToHome = () => {
    navigation.goBack();
  };

  const handleSubmit = async (bid) => {
    console.log(book)
    const token = await AsyncStorage.getItem('jwtToken');
    const userData = JSON.parse(await AsyncStorage.getItem('UserData'));
    const userId = userData.decoded_user_id;

    const formData = new FormData();
    formData.append('title', book.title);
    formData.append('author', book.author);
    formData.append('publish', book.publish);
    formData.append('isbn', book.isbn);
    formData.append('price', price);
    formData.append('region', book.region)
    formData.append('detail', description);

    selectedImages.forEach((uri, index) => {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename ?? '');
      const type = match ? `image/${match[1]}` : `image`;

      formData.append(`img${index + 1}`, {
        uri,
        name: filename,
        type,
      });
    });

    console.log(formData)
    try {
      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-product/modify-product/${bid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await response.json();
      if (response.ok) {
        Alert.alert('정보 수정', '재고 정보가 수정되었습니다');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MyPageScreen' }],
        });
      } else {
        Alert.alert('실패', json?.message || '알 수 없는 오류');
      }
    } catch (err) {
      Alert.alert('에러', '서버 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', paddingTop: 10, marginBottom: 10, alignSelf:'flex-start' }}>
          <TouchableOpacity onPress={goToHome} style={{ paddingHorizontal: 10 }}>
            <Ionicons name="chevron-back-outline" size={30} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginLeft:90}}>도서 정보 수정</Text>
        </View>

        <ScrollView style={{ width: '90%' }} showsVerticalScrollIndicator={false}>
          {/* 기본 정보 출력 */}
          {[
            { label: '제목', value: book.title },
            { label: '저자', value: book.author },
            { label: '출판사', value: book.publish },
            { label: 'ISBN', value: book.isbn },
            { label: '지역', value: book.region }
          ].map(({ label, value }, i) => (
            <View key={i}>
              <Text style={styles.inputtitle}>{label}</Text>
              <View style={styles.viewBox}>
                <Text style={styles.viewText}>{value}</Text>
              </View>
            </View>
          ))}

          {/* 가격 입력 */}
          <Text style={styles.inputtitle}>가격</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* 설명 입력 */}
          <Text style={styles.inputtitle}>설명</Text>
          <View style={styles.textArea}>
            <TextInput
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
              style={styles.textInput}
              placeholder="책 상태, 사용 여부 등을 입력하세요"
            />
          </View>

          {/* 이미지 첨부 */}
          <Text style={styles.inputtitle}>
            사진 첨부 <Text style={{ fontSize: 12, color: 'gray' }}>(최대 3장 - 미첨부 시 기존 사진이 유지됩니다)</Text>
          </Text>
          {selectedImages.length < 3 && (
            <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
              <Ionicons name="add-outline" size={30} />
            </TouchableOpacity>
          )}
          <View style={styles.imagePreviewContainer}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={{ marginRight: 10 }}>
                <Image source={{ uri }} style={styles.selectedImage} />
                <TouchableOpacity onPress={() => cancelImage(uri)} style={styles.cancelButton}>
                  <Ionicons name="close-circle-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* 제출 버튼 */}
          <TouchableOpacity style={styles.submitButton} onPress={()=>{handleSubmit(book.bid)}}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>재고 정보 수정</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default EditSellDetail;

const styles = StyleSheet.create({
  inputtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 5,
    paddingLeft: 10,
  },
  viewBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  viewText: {
    fontSize: 16,
    color: 'gray',
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
    marginBottom: 10,
  },
  textInput: {
    fontSize: 16,
  },
  imagePickerButton: {
    borderWidth: 1,
    borderRadius: 10,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 10,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 10,
    marginBottom: 10,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  cancelButton: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  submitButton: {
    backgroundColor: '#0091da',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});
