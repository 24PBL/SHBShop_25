import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';



const StoreRegister = ({ route, navigation }) => {
  const { data } = route.params;
  const commerData = data.result;
  const API_URL = Constants.expoConfig.extra.API_URL;

  const [commerName, setcommerName] = useState('');
  const [commertel, setcommertel] = useState('');
  const [openTime, setOpenTime] = useState(null);
  const [closeTime, setCloseTime] = useState(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isCloseTimePickerVisible, setCloseTimePickerVisible] = useState(false);
  const [holiday, setholiday] = useState('');
  const [etc, setetc] = useState('');
  const [images, setImages] = useState([]);
  const [realOpenTime, setRealOpenTime] = useState('');
  const [realCloseTime, setRealCloseTime] = useState('');

  const handleOpenTimeConfirm = (date) => {
    setOpenTime(date);
    setTimePickerVisible(false);
    const openTimeString = date ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : null;
    setRealOpenTime(openTimeString);
  };

  const handleCloseTimeConfirm = (date) => {
    setCloseTime(date);
    setCloseTimePickerVisible(false);
    const closeTimeString = date ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : null;
    setRealCloseTime(closeTimeString);
  };

  // 사진 선택 함수 (한 번에 최대 3개까지)
  const pickImages = async () => {
    if (images.length >= 3) {
      alert("최대 3장까지만 선택할 수 있습니다.");
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("사진을 선택할 수 있는 권한이 없습니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,  // 여러 장 선택 허용
      selectionLimit: 3 - images.length,  // 남은 개수만큼 선택 가능
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);  // 선택한 사진을 상태에 추가
    }
  };

  // 이미지 삭제 함수
  const deleteImage = (uri) => {
    setImages(images.filter(image => image !== uri));  // 해당 URI를 제외한 이미지들만 상태에 저장
  };

  const formData = new FormData();
formData.append("presidentName", commerData.cert.presidentName);
formData.append("businessmanName", commerData.cert.businessmanName);
formData.append("businessEmail", commerData.cert.businessEmail);
formData.append("address", commerData.cert.address);
formData.append("shopName", commerName);
formData.append("shoptel", commertel);
formData.append("shopOpen", realOpenTime);
formData.append("shopClose", realCloseTime);  
formData.append("holiday", holiday);
formData.append("etc", etc);    
formData.append("imgfile1", {
  uri: images[0],
  type: 'image/jpeg', 
  name: 'upload.jpg',
});
formData.append("imgfile2", {
  uri: images[1],
  type: 'image/jpeg', 
  name: 'upload.jpg',
});
formData.append("imgfile3", {
  uri: images[2],
  type: 'image/jpeg', 
  name: 'upload.jpg',
});

  const register = async () => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    try{
    const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-commer/${commerData.cert.certId}/regist-shop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Token}`
      },
      body : formData,
    });
      navigation.navigate("Navbar")
    } catch(error){
      console.error(error)
    }
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20, paddingLeft: 20, paddingTop: 10 }}>매장 등록</Text>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>

          <Text style={styles.Label}>대표자 명</Text>
          <View style={styles.TextBox}><Text style={styles.BoxText}>{commerData.cert.presidentName}</Text></View>

          <Text style={styles.Label}>사업자 명</Text>
          <View style={styles.TextBox}><Text style={styles.BoxText}>{commerData.cert.businessmanName}</Text></View>

          <Text style={styles.Label}>사업자 메일</Text>
          <View style={styles.TextBox}><Text style={styles.BoxText}>{commerData.cert.businessEmail}</Text></View>

          <Text style={styles.Label}>사업장 주소</Text>
          <View style={styles.TextBox}><Text style={styles.BoxText}>{commerData.cert.address}</Text></View>

          <Text style={styles.Label}>사업장 이름</Text>
          <View style={styles.TextBox}>
            <TextInput
              style={{ fontSize: 18 }}
              value={commerName}
              onChangeText={text => setcommerName(text)}
            />
          </View>

          <Text style={styles.Label}>사업장 전화번호</Text>
          <View style={styles.TextBox}>
            <TextInput
              style={{ fontSize: 18 }}
              value={commertel}
              onChangeText={text => setcommertel(text)}
            />
          </View>

          <Text style={styles.Label}>운영시간</Text>
          <View style={styles.TimeRow}>
            <TouchableOpacity style={styles.TimeBox} onPress={() => setTimePickerVisible(true)}>
              <Text style={{ fontSize: 18 }}>
                {openTime ? openTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '개장시간'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.Separator}>~</Text>

            <TouchableOpacity style={styles.TimeBox} onPress={() => setCloseTimePickerVisible(true)}>
              <Text style={{ fontSize: 18 }}>
                {closeTime ? closeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '폐장시간'}
              </Text>
            </TouchableOpacity>
          </View>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleOpenTimeConfirm}
            onCancel={() => setTimePickerVisible(false)}
          />

          <DateTimePickerModal
            isVisible={isCloseTimePickerVisible}
            mode="time"
            onConfirm={handleCloseTimeConfirm}
            onCancel={() => setCloseTimePickerVisible(false)}
          />

          <Text style={styles.Label}>휴일</Text>
          <View style={styles.TextBox}>
            <TextInput
              style={{ fontSize: 18 }}
              value={holiday}
              onChangeText={text => setholiday(text)}
            />
          </View>

          <Text style={styles.Label}>추가 정보</Text>
          <View style={{ width: '80%', borderWidth: 1, height: 200, borderRadius: 10, paddingLeft: 15, marginBottom: 10 }}>
            <TextInput
              style={{ fontSize: 18, height: 100, textAlignVertical: 'top' }}
              value={etc}
              onChangeText={text => setetc(text)}
              multiline={true}
              numberOfLines={4}
            />
          </View>

          <Text style={styles.Label}>매장 사진 (3개)</Text>

          {/* 이미지 표시 */}
          <View style={styles.ImageContainer}>
            {images.map((imageUri, index) => (
              <View key={index} style={styles.ImageWrapper}>
                <Image source={{ uri: imageUri }} style={styles.Image} />
                <TouchableOpacity onPress={() => deleteImage(imageUri)} style={styles.DeleteButton}>
                  <Text style={styles.DeleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ))}
            {/* 사진이 3장 미만일 때만 + 버튼 표시 */}
            {images.length < 3 && (
              <TouchableOpacity style={styles.AddImageButton} onPress={pickImages}>
                <Text style={styles.AddImageButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={{backgroundColor:'#0091da', width:'80%', borderRadius:10, height:50, alignItems:'center', justifyContent:'center'}} onPress={register}>
            <Text style={{fontSize:18, fontWeight:'bold', color:'white'}}>매장 등록</Text>
            </TouchableOpacity>
            <Text>{images[3]}</Text>
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
    color: 'gray'
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

export default StoreRegister;
