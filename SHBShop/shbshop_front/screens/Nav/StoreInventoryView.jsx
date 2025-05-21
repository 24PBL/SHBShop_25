import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StoreInventoryView = ({ route, navigation }) => {
  const { storedata } = route.params;
  const data = storedata.data;
  const API_URL = Constants.expoConfig.extra.API_URL;
  const userId = data.decoded_user_id;
  const shopId = data.shop_info.shopId;

  const [inventory, setInventory] = useState(data.sbook_list || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const onEndReachedCalledDuringMomentum = useRef(false);

  const handleItemClick = async (bid) => {
    const token = await AsyncStorage.getItem('jwtToken');
    try {
      const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-stock/detail/${bid}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      navigation.navigate('BookDetailScreen', { detailData: result });
    } catch (error) {
      console.error('도서 상세 정보 요청 실패:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemClick(item.bid)}>
      <Image source={{ uri: `${API_URL}${item.bookimg}` }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        <Text style={styles.count}>가격 : {item.price}원</Text>
        <Text style={styles.date}>{item.createAt?.substring(0, 10)}</Text>
      </View>
    </TouchableOpacity>
  );

  const fetchMoreBooks = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (loading || !hasMore) return;

    const finalBid = inventory[inventory.length - 1]?.bid;

    // bid가 undefined일 경우 요청 생략
    if (!finalBid) {
      setHasMore(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-stock/${finalBid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.sbook_list && result.sbook_list.length > 0) {
        setInventory((prev) => [...prev, ...result.sbook_list]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('추가 데이터 로딩 실패:', error);
    }

    setLoading(false);
  };

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    const token = await AsyncStorage.getItem('jwtToken');
    try {
      const response = await fetch(
        `${API_URL}/shop/${userId}/${shopId}/check-stock/search?keyword=${text}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.sbook_list && result.sbook_list.length > 0) {
        setSearchResults(result.sbook_list);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('검색 요청 실패:', error);
    }

    setSearchLoading(false);
  };

  const groupByISBN = (list) => {
    const map = new Map();
    list.forEach((item) => {
      if (map.has(item.isbn)) {
        map.get(item.isbn).count += 1;
      } else {
        map.set(item.isbn, { ...item, count: 1 });
      }
    });
    return Array.from(map.values());
  };

  const renderSearchResults = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('ISBNBookListScreen', {
          isbn: item.isbn,
          fullList: searchResults,
          API_URL,
          userId,
          shopId,
        })
      }
    >
      <Image source={{ uri: `${API_URL}${item.bookimg}` }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        <Text style={styles.date}>{item.createAt?.substring(0, 10)}</Text>
        <Text style={styles.count}>수량: {item.count}권</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={24} />
          </TouchableOpacity>
          <Text style={styles.titleHeader}>매장 재고 조회</Text>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Ionicons name="search-outline" size={24} color="gray" style={{ marginLeft: 100 }} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={inventory}
          keyExtractor={(item) => item.bid.toString()}
          renderItem={renderItem}
          onEndReached={fetchMoreBooks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="small" color="#000" /> : null}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>등록된 도서가 없습니다.</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContainer}
        />

        <Modal visible={searchVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback
            onPress={() => {
              setSearchVisible(false);
              setSearchText('');
              setSearchResults([]);
              setSearchLoading(false);
            }}
          >
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TextInput
                value={searchText}
                onChangeText={handleSearch}
                placeholder="검색어를 입력하세요"
                style={styles.searchInput}
              />
              <TouchableOpacity onPress={() => setSearchVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={groupByISBN(searchResults)}
              keyExtractor={(item) => item.bid.toString()}
              renderItem={renderSearchResults}
              ListFooterComponent={searchLoading ? <ActivityIndicator size="small" color="#000" /> : null}
              ListEmptyComponent={
                !searchLoading ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                  </View>
                ) : null
              }
            />
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  titleHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    backgroundColor: 'white',
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
  },
  count: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },
  listContainer: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchInput: {
    borderBottomWidth: 1,
    width: '90%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default StoreInventoryView;
