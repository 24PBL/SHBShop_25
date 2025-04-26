import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView} from 'react-native';
import axios from 'axios';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const BookSearchScreen = ({navigation}) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);

  const goToSellBook1 = () => {
    navigation.navigate('SellBook1')
  }

  const searchBooks = async () => {
    if (query === '') {
      Alert.alert('검색어 없음','검색어를 입력하세요.',[{text : '확인'}]);
      return;
    }
    try {
      const response = await axios.get('https://openapi.naver.com/v1/search/book.json', {
        params: { query },
        headers: {
          'X-Naver-Client-Id': 'I1pUM32yZm8kHwX9pq5J', // 여기에 네이버 앱의 Client ID
          'X-Naver-Client-Secret': '4otGB36xQK', // 여기에 Secret
        },
      });

      setBooks(response.data.items);
    } catch (error) {
      console.error('책 검색 실패:', error);
    }
  };



  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
    <View style={styles.container}>
      <TextInput
        placeholder="책 정보를 입력하세요. (제목, 저자, 출판사)"
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />
      <Button title="검색" onPress={searchBooks} />
      {books.length === 0 ? (
        <Text style={styles.noResultsText}></Text>
        
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SellBook', {
                  title: item.title,
                  author: item.author,
                  publisher: item.publisher,
                  ISBN : item.isbn,
                })
              }
            >
              <View style={{ padding: 10 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Image source={{uri : item.image}} style={{width:60, height:90, resizeMode:'contain'}}></Image>
                <View style={{marginLeft:10}}>
                <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                <Text>저자 : {item.author}</Text>
                <Text>출판사 : {item.publisher}</Text>
                <Text numberOfLines={1} ellipsizeMode="tail">
                  책 설명 : {item.description}
                </Text>
                </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 70 }}
        />
      )}
    </View>
    <TouchableOpacity style={{position:'absolute', bottom:20, right:20,
      backgroundColor:'white', borderWidth:1, borderRadius:10,
      borderColor:'#0091da', height:30,width:200, alignItems:'center',
      justifyContent:'center'}}
      onPress={goToSellBook1}>
      <Text style={{color:'#0091da', fontWeight:'bold'}}>혹시 찾으시는 책이 없으신가요?</Text>
    </TouchableOpacity>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default BookSearchScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#aaa',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  item: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f3f3f3',
    borderRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
    color: '#555',
  },
});
