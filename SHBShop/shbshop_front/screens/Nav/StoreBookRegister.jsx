import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const StoreBookRegister = ({ navigation }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setSelectedImages((prevImages) => [...prevImages, ...newUris]);
    }
  };

  const cancelImage = (uriToRemove) => {
    setSelectedImages((prevImages) => prevImages.filter(uri => uri !== uriToRemove));
  };

  const goToBack = () => {
    navigation.goBack()
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf:'flex-start', paddingLeft:20, paddingTop:10 }}>
          <TouchableOpacity onPress={goToBack}>
            <Ionicons name="chevron-back-outline" size={30} color="black" />
          </TouchableOpacity>
          <Text style={{ fontWeight: 'bold', fontSize: 28, paddingLeft:10}}>매장 재고 개별 등록</Text>
        </View>

        <ScrollView style={{ width: '90%' }} showsVerticalScrollIndicator={false}>
          <View style={{ height: 20 }} />
          <Text style={styles.inputtitle}>제목</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.inputText} placeholder="제목" onChangeText={setTitle} />
          </View>

          <Text style={styles.inputtitle}>저자</Text>
          <View style={styles.inputBoxSmall}>
            <TextInput style={styles.inputText} placeholder="저자명" onChangeText={setAuthor} />
          </View>

          <Text style={styles.inputtitle}>출판사</Text>
          <View style={styles.inputBoxSmall}>
            <TextInput style={styles.inputText} placeholder="출판사명" onChangeText={setPublisher} />
          </View>

          <Text style={styles.inputtitle}>가격</Text>
          <View style={styles.inputBoxSmall}>
            <TextInput style={styles.inputText} placeholder="숫자만 입력" onChangeText={setPrice} />
          </View>

          <Text style={styles.inputtitle}>설명</Text>
          <View style={styles.descriptionBox}>
            <TextInput style={styles.inputText} placeholder="ex)책 상태, 사용여부 등의 참고사항" onChangeText={setDescription} multiline />
          </View>

          <Text style={styles.inputtitle}>사진 첨부</Text>
          <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
            <Ionicons name="add-outline" size={30} color="black" />
          </TouchableOpacity>

          {selectedImages.length > 0 && (
            <View style={styles.imagePreview}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={{ marginRight: 10, marginBottom: 10 }}>
                  <Image source={{ uri }} style={styles.selectedImage} />
                  <TouchableOpacity onPress={() => cancelImage(uri)} style={styles.cancelButton}>
                    <Ionicons name="close-circle-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
          <TouchableOpacity style={styles.submitButton}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>완료</Text>
          </TouchableOpacity>
          <View style={{ height: 20 }} />
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
  inputBox: {
    borderWidth: 1,
    width: '90%',
    height: 70,
    borderRadius: 10,
    justifyContent: 'center',
    left: 20,
  },
  inputBoxSmall: {
    borderWidth: 1,
    width: '90%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    left: 20,
  },
  descriptionBox: {
    borderWidth: 1,
    width: '90%',
    height: 300,
    borderRadius: 10,
    left: 20,
    justifyContent: 'flex-start',
  },
  inputText: {
    paddingLeft: 20,
    fontSize: 20,
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
    left: 10,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    paddingLeft: 20,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  cancelButton: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  submitButton: {
    width: '90%',
    backgroundColor: '#0091da',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    left: 20,
  },
});
