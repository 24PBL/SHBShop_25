import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';


const API_URL = Constants.expoConfig.extra.API_URL;

const { width } = Dimensions.get('window');

const SellDetail = ({navigation}) => {
  const route = useRoute();
  const { book_info, user_info, decoded_user_id, user_type } = route.params;

  const getBookStateText = (state) => {
    const stateMap = {
      1: '판매중',
      2: '결제 성공',
      3: '판매 거절',
      4: '판매 승인',
      5: '구매 확정',
      6: '사용자 취소',
      7: '환불 완료',
      8: '결제 실패',
      9: '결제 미완료',
    };
    return stateMap[state] || '알 수 없음';
  };

  const goToHome = () => {
      navigation.goBack();
    }

  const imageList = [book_info.bookimg1, book_info.bookimg2, book_info.bookimg3].filter(Boolean);

  // SellDetail.js 내 수정
const goToEditSellDetail = () => {
  navigation.navigate("EditSellDetail", {
    data: {
      book_info,
      shop_info: book_info.shop_info,
      user_info,
      decoded_user_id,
      user_type,
    },
  });
};

const deleteProduct = async () => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    await axios.delete(
        `${API_URL}/home/${userId}/my-page/check-my-product/delete-product/${book_info.bid}`,
        {
          headers: { Authorization: `Bearer ${Token}` },
        }
      );
    Alert.alert('삭제 완료', '재고가 삭제되었습니다.');
    try {
    const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/home/${userId}/my-page/check-my-product`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });
      const result = await response.json();
      console.log(result);
      navigation.reset({
  index: 0,
  routes: [{ name: 'SellList', params: { sellData: result } }],
});

    } catch (error) {
      console.error('오류 발생:', error);
    }

  }

  return (
    <SafeAreaProvider>
        <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
            <View style={{ flexDirection: 'row', paddingBottom:10, justifyContent:"space-between" }}>
  <TouchableOpacity onPress={goToHome}>
    <Ionicons name="chevron-back-outline" size={30} color="black" />
  </TouchableOpacity>

  {book_info.state === 1 && (
  <TouchableOpacity
    onPress={() => {
      Alert.alert(
        '재고 삭제',
        '해당 재고를 삭제하시겠습니까?',
        [
          {
            text: '삭제',
            onPress: () => deleteProduct(),
            style: 'destructive',
          },
          {
            text: '취소',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }}
  >
    <Ionicons name="trash-outline" size={30} style={{ marginLeft: 270 }} />
  </TouchableOpacity>
)}

  
  {book_info.state === 1 && (
    <TouchableOpacity onPress={goToEditSellDetail}>
      <Ionicons name="create-outline" size={30} style={{paddingRight:20}}/>
    </TouchableOpacity>
  )}
</View>


            <ScrollView style={styles.container}>
      {/* 이미지 슬라이더 */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.imageSlider}
      >
        {imageList.map((img, index) => (
          <Image
            key={index}
            source={{ uri: `${API_URL}/${img}` }}
            style={styles.image}
          />
        ))}
      </ScrollView>

      <View style={styles.detailBox}>
        <Text style={styles.title}>{book_info.title}</Text>
        <Text style={styles.text}>{book_info.author} | {book_info.publish}</Text>
        <Text style={styles.text}>가격: {book_info.price.toLocaleString()}원</Text>
        <Text style={styles.text}>지역: {book_info.region}</Text>
        <Text style={styles.text}>ISBN: {book_info.isbn}</Text>
        <Text style={styles.text}>상태: {getBookStateText(book_info.state)}</Text>
        <Text style={styles.text}>등록일: {new Date(book_info.createAt).toLocaleDateString()}</Text>
      </View>
    </ScrollView>
        </SafeAreaView>
    </SafeAreaProvider>

  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  imageSlider: {
    width: width,
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  detailBox: {
    padding: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  userBox: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default SellDetail;
