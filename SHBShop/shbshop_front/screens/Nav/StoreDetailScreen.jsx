import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;
const { width } = Dimensions.get('window');

const StoreDetailScreen = ({route, navigation}) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const { storedata } = route.params;
  const data = storedata.data;

  // 예시 이미지 리스트
  const images = [
    { id: '1', uri: `${API_URL}${data.shop.shopimg1}` },
    { id: '2', uri: `${API_URL}${data.shop.shopimg2}` },
    { id: '3', uri: `${API_URL}${data.shop.shopimg3}` },
  ];

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const Favorite = async () => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await fetch(`${API_URL}/home/${userId}/shop-mode/${data.shop.shopId}/add-shop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });  
  }

  const FavoriteDelete = async () => {
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await fetch(`${API_URL}/home/${userId}/shop-mode/${data.shop.shopId}/delete-shop`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });
  }

  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
      <View style={{flexDirection:'row', justifyContent:'space-between', padding:10}}>
        {/* 뒤로가기, 하트, 점 */}
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={27} color="#000"/>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => {
            if (liked) {
              FavoriteDelete(); // 이미 찜 → 삭제
            } else {
              Favorite();        // 찜 안됨 → 추가
            }
            setLiked(!liked);    // UI 토글
          }}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={30}
            color={liked ? 'red' : '#000'}
          />
        </TouchableOpacity>
        </View>
      {/* 상단 이미지 */}
      <View style={styles.topImage}>
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={{ uri: item.uri }} style={styles.image} />
          )}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
        
    


        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      </View>

      {/* 서점 정보 */}
      <View style={styles.infoSection}>
        <View style={styles.profileRow}>
          <View style={styles.avatar} />
          <View style={styles.profileText}>
            <Text style={styles.storeName}>{data.shop.shopName}</Text>
            <Text style={styles.address}>{data.shop.address}</Text>
          </View>
          <TouchableOpacity style={styles.searchIconButton} onPress={()=>{}}>
            <Ionicons name="search-outline" size={25} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <Text style={styles.hours}>운영시간 : {data.shop.open} ~ {data.shop.close}{'\n'}</Text>
      </View>

      {/* 서점 설명 */}
      <View style={styles.descriptionSection}>
        <ScrollView style={{ maxHeight: 270 }}>
          <Text style={styles.description}>{data.shop.etc}</Text>
        </ScrollView>
      </View>

    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  topImage: {
    height: 250,
    backgroundColor: '#ddd',
    position: 'relative',
  },
  image: {
    width: width,
    height: 250,
    resizeMode: 'contain',
    backgroundColor:'#f0f0f0'
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bbb',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  infoSection: {
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  profileText: {
    flex: 1,
  },
  storeName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  address: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchIconButton: {
    marginLeft: 8,
    padding: 6,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginVertical: 10,
  },
  hours: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  description: {
    fontSize: 14,
    color: '#222',
  },
});

export default StoreDetailScreen;
