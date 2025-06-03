import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const BookDetailScreen = ({ route, navigation }) => {
  const { detailData } = route.params;
  const book = detailData.book_info;
  const API_URL = Constants.expoConfig.extra.API_URL;

  const imageUrls = [book.bookimg1, book.bookimg2, book.bookimg3]
    .filter(Boolean)
    .map((img) => API_URL + img);

  const deleteStock = async () => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    await axios.delete(
        `${API_URL}/shop/${userId}/${detailData.shop_info.shopId}/check-stock/${book.bid}/delete-sbook`,
        {
          headers: { Authorization: `Bearer ${Token}` },
        }
      );
    Alert.alert('삭제 완료', '재고가 삭제되었습니다.');
    const response = await fetch(`${API_URL}/shop/${userId}/${detailData.shop_info.shopId}/check-stock`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });
    const data = await response.json();
    console.log(data);
    navigation.reset({
  index: 0,
  routes: [
    {
      name: 'MyPageScreen'
    }
  ],
});

  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* 뒤로가기 버튼 */}
          <View style={{flexDirection:'row', flex:1, justifyContent:'space-between', alignItems:'center', paddingLeft:10, paddingRight:20}}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={()=> navigation.navigate('EditBookDetail', {data : detailData})}>
            <Ionicons name="create-outline" size={24} color="black" style={{left:120, marginBottom:20}}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{Alert.alert(
  '재고 삭제',
  '해당 재고를 삭제하시겠습니까?',
  [
    {
      text: '삭제',
      onPress: () => {
        // 삭제 로직 실행
        deleteStock(); 
      },
      style: 'destructive', 
    },
    {
      text: '취소',
      style: 'cancel', 
    },
    
  ],
  { cancelable: true }
);
}}>
            <Ionicons
              name="trash-outline"
              size={24} style={{marginBottom:20}}/>
          </TouchableOpacity>
          </View>
          
          {/* 이미지 슬라이드 */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageSlider}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {imageUrls.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.image} />
            ))}
          </ScrollView>

          {/* 제목 */}
          <Text style={styles.title}>{book.title}</Text>

          {/* 책 정보 */}
          <View style={styles.infoContainer}>
            <Text style={styles.label}>저자</Text>
            <Text style={styles.text}>{book.author}</Text>

            <Text style={styles.label}>출판사</Text>
            <Text style={styles.text}>{book.publish}</Text>

            <Text style={styles.label}>가격</Text>
            <Text style={styles.text}>{book.price}원</Text>

            <Text style={styles.label}>ISBN</Text>
            <Text style={styles.text}>{book.isbn}</Text>

            <Text style={styles.label}>책 설명</Text>
            <Text style={styles.text}>{book.detail}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    backgroundColor: 'white',
  },
  backButton: {
    marginLeft: 10,
    marginBottom: 20,
  },
  imageSlider: {
    marginBottom: 20,
    height: 300,
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 15,
  },
});

export default BookDetailScreen;
