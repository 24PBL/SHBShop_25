import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';

const ChangeStoreInfo = ({ navigation }) => {
  const [openTime, setOpenTime] = useState(null);
  const [closeTime, setCloseTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSelectingOpenTime, setIsSelectingOpenTime] = useState(true);
  const [images, setImages] = useState([]);

  const showDatePicker = (forOpenTime) => {
    setIsSelectingOpenTime(forOpenTime);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isSelectingOpenTime) {
      setOpenTime(formattedTime);
    } else {
      setCloseTime(formattedTime);
    }
    hideDatePicker();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setImages((prevImages) => {
        if (prevImages.length < 3) {
          return [...prevImages, uri];
        }
        return prevImages;
      });
    }
  };

  const removeImage = (index) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  useEffect(() => {
    // 추가적인 상태 업데이트가 필요할 경우 useEffect에서 처리할 수 있습니다.
  }, [images]);  // 이미지 상태가 변경될 때마다 호출

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{flexDirection:'row', alignItems:'center', paddingLeft:10, paddingTop:10}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>매장 정보 수정</Text>
        </View>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 20 }}>
          {/* 입력 필드 (데이터 없음) */}
          {['대표자 명', '사업자 명', '사업자 메일', '사업장 주소', '사업장 이름', '사업장 전화번호', '휴일', '추가 정보'].map((label, idx) => (
            <View key={idx} style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.Label}>{label}</Text>
              <View style={label === '추가 정보' ? styles.TextArea : styles.TextBox}>
                <TextInput
                  style={styles.Input}
                  multiline={label === '추가 정보'}
                  numberOfLines={label === '추가 정보' ? 4 : 1}
                  editable={false}
                  placeholder="입력"
                />
              </View>
            </View>
          ))}

          {/* 운영시간 */}
          <Text style={styles.Label}>운영시간</Text>
          <View style={styles.TimeRow}>
            <TouchableOpacity style={styles.TimeBox} onPress={() => showDatePicker(true)}>
              <Text style={styles.Input}>{openTime || '개장시간 선택'}</Text>
            </TouchableOpacity>
            <Text style={styles.Separator}>~</Text>
            <TouchableOpacity style={styles.TimeBox} onPress={() => showDatePicker(false)}>
              <Text style={styles.Input}>{closeTime || '폐장시간 선택'}</Text>
            </TouchableOpacity>
          </View>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="time"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />

          {/* 이미지 */}
          <Text style={styles.Label}>매장 사진 (3개)</Text>
          <View style={styles.ImageContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.ImageWrapper}>
                <Image source={{ uri }} style={styles.Image} />
                <TouchableOpacity
                  style={styles.DeleteButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.DeleteButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={styles.AddImageButton} onPress={pickImage}>
                <Text style={styles.AddImageButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.SubmitButton}>
            <Text style={styles.SubmitText}>수정 완료</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingLeft: 20,
    paddingTop: 10,
  },
  Label: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    left: 42,
    paddingBottom: 8,
  },
  TextBox: {
    width: '80%',
    borderWidth: 1,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: 15,
    marginBottom: 10,
  },
  TextArea: {
    width: '80%',
    borderWidth: 1,
    height: 200,
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  Input: {
    fontSize: 18,
    color: '#444',
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
  SubmitButton: {
    backgroundColor: '#0091da',
    width: '80%',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  SubmitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ChangeStoreInfo;
