import { React, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const SellBook1 = ({ navigation }) => {

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
        allowsMultipleSelection: true, // 다중 선택 활성화
      });
    
      if (!result.canceled) {
        const newUris = result.assets.map((asset) => asset.uri);
        setSelectedImages((prevImages) => [...prevImages, ...newUris]);
      }
    };
  
    const cancelImage = (uriToRemove) => {
      setSelectedImages((prevImages) => prevImages.filter(uri => uri !== uriToRemove));
    };
    const goToHome = () => {
      navigation.navigate('HomeScreen');
    }
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: -200 }}>
          <TouchableOpacity onPress={goToHome}>
            <Ionicons name="chevron-back-outline" size={30} color="black" style={{ marginLeft: -20, paddingRight: 10 }} />
          </TouchableOpacity>
          <Text style={{ fontWeight: 'bold', fontSize: 28 }}>내책팔기</Text>
        </View>

        <ScrollView style={{ width: '90%' }} showsVerticalScrollIndicator={false}>
          <View style={{ height: 20 }}></View>
          <Text style={styles.inputtitle}>제목</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 70, borderRadius: 10, justifyContent: 'center', left:20 }}>
            <TextInput style={{ paddingLeft: 20, fontSize: 20}} placeholder='제목' onChangeText={setTitle}></TextInput>
          </View>
          <Text style={styles.inputtitle}>저자</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 50, borderRadius: 10, justifyContent: 'center', left:20 }}>
            <TextInput style={{ paddingLeft: 20, fontSize: 20 }} placeholder='저자명' onChangeText={setAuthor}></TextInput>
          </View>

          <Text style={styles.inputtitle}>출판사</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 50, borderRadius: 10, justifyContent: 'center', left:20 }}>
            <TextInput style={{ paddingLeft: 20, fontSize: 20 }} placeholder='출판사명' onChangeText={setPublisher}></TextInput>
          </View>

          <Text style={styles.inputtitle}>가격</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 50, borderRadius: 10, justifyContent: 'center', left:20 }}>
            <TextInput style={{ paddingLeft: 20, fontSize: 20 }} placeholder="숫자만 입력" onChangeText={setPrice}></TextInput>
          </View>

          <Text style={styles.inputtitle}>설명</Text>
          <View style={{ borderWidth: 1, width: '90%', height: 300, borderRadius: 10, left:20 }}>
            <TextInput style={{ paddingLeft: 20, fontSize: 20 }} placeholder="ex)책 상태, 사용여부 등의 참고사항" onChangeText={setDescription}></TextInput>
          </View>

          <View>
                        <Text style={styles.inputtitle}>사진 첨부</Text>
                        <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                          <Ionicons name="add-outline" size={30} color="black" />
                        </TouchableOpacity>
                      </View>

          {/* 선택한 이미지 표시 */}
                    {selectedImages.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, paddingLeft: 20 }}>
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
          <View style={{height:20}}></View>
          <TouchableOpacity style={{width:'90%', backgroundColor:'#0091da', height:50, alignItems:'center', justifyContent:'center', borderRadius:10 , left:20}}>
            <Text style={{color:'white', fontWeight:'bold'}}>완료</Text>
            </TouchableOpacity>
          <View style={{height:20}}></View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SellBook1;

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
