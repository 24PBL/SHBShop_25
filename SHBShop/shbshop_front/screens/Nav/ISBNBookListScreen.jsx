import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const ISBNBookListScreen = ({ route, navigation }) => {
  const { isbn, fullList, API_URL, userId, shopId } = route.params;

  const filteredBooks = fullList.filter((book) => book.isbn === isbn);

  const handleItemClick = async (bid) => {
    const token = await AsyncStorage.getItem('jwtToken');
    try {
      const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-stock/detail/${bid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      navigation.navigate('BookDetailScreen', { detailData: result });
    } catch (error) {
      console.error('도서 상세 요청 실패:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemClick(item.bid)}>
      <Image source={{ uri: `${API_URL}${item.bookimg}` }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        <Text style={styles.date}>{item.createAt?.substring(0, 10)}</Text>
        <Text style={styles.count}>가격: {item.price}원</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} >
            <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>재고 조회</Text>
      </View>
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.bid.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
    </SafeAreaView>
    </SafeAreaProvider>
    
  );
};

const styles = StyleSheet.create({

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 100,
    resizeMode: 'cover',
    marginRight: 10,
    borderRadius: 4,
  },
  textContainer: {
    flexShrink: 1,
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  author: { fontSize: 14, color: '#666', marginTop: 4 },
  date: { fontSize: 12, color: '#aaa', marginTop: 6 },
  count: { fontSize: 13, color: '#444', marginTop: 4 },
  listContainer: { padding: 10 },
});

export default ISBNBookListScreen;
