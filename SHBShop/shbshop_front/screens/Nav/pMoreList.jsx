import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

const pMoreList = ({ route, navigation }) => {
  const { list, title } = route.params; // 넘어온 책 리스트랑 제목

  const goToback = () => navigation.goBack();

  const goToBookDetail = async (sellType, bid) =>{
    const Data = await AsyncStorage.getItem('UserData');
    const userData = JSON.parse(Data);
    const userId = userData.decoded_user_id;
    const Token = await AsyncStorage.getItem('jwtToken');
    const response = await fetch(`${API_URL}/book/pb/${userId}/${sellType}/${bid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Token}`,
      },
    });
    const data = await response.json();
    navigation.navigate('pBookDetailScreen', {storedata : {data}});
    
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.bookItem} onPress={()=>goToBookDetail(item.userType, item.bid)}>
      <Image
        source={{ uri: `${API_URL}/${item.bookimg}` }}
        style={styles.bookImage}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookPrice}>{item.price}원</Text>
      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        {/* 상단 바 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goToback}>
            <Ionicons name="arrow-back-outline" size={24} color="gray" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        {/* 책 리스트 */}
        <FlatList
          data={list}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.noResultText}>책이 없습니다.</Text>}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default pMoreList;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    color: 'black',
  },
  listContainer: {
    padding: 20,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 10,
  },
  bookImage: {
    width: 60,
    height: 90,
    marginRight: 15,
    borderRadius: 5,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookPrice: {
    fontSize: 14,
    color: '#555',
  },
  noResultText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 50,
  },
});
