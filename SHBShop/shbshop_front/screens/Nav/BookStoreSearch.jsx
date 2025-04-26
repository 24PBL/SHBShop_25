import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const BookStoreSearch = ({ route }) => {
  const { storedata } = route.params;
  
  // 검색 결과가 없는 경우 message에 "검색 결과가 없습니다."가 들어 있음
  const shopList = storedata.data.shopList;
  const message = storedata.data.message;


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
            <Text style={{fontWeight:'bold', fontSize:28, paddingLeft:20, paddingBottom:20, paddingTop:20}}>책방 목록</Text>
          <ScrollView contentContainerStyle={styles.shopListContainer}>
            {shopList.length === 0 ? (
              // shopList가 비어 있으면 message 표시
              <Text style={styles.noDataText}>{message}</Text>
            ) : (
              // shopList가 비어 있지 않으면 목록 표시
              shopList.map((shop, index) => (
                <TouchableOpacity key={index} style={styles.shopCard}>
                  <Image source={{ uri: `${API_URL}/${shop.shopimg}` }} style={styles.shopImage} />
                  <Text style={styles.shopName}>{shop.shopName}</Text>
                  <Text style={styles.shopRegion}>{shop.region}</Text>
                  <Text style={styles.shopTel}>{shop.shoptel}</Text>
                </TouchableOpacity>
              ))
            )}
            
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  shopListContainer: {
    paddingHorizontal: 10,
    paddingBottom:70
  },
  shopCard: {
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
  },
  shopImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  shopRegion: {
    fontSize: 14,
    color: 'gray',
  },
  shopTel: {
    fontSize: 14,
    marginTop: 5,
  },
  noDataText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default BookStoreSearch;
