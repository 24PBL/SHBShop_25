import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StoreInventoryView = ({ navigation, route }) => {
  const API_URL = Constants.expoConfig.extra.API_URL;
  const { storedata } = route.params;

  const [books, setBooks] = useState(storedata.sbook_list || []);
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isAuthError, setIsAuthError] = useState(false);

  const userId = storedata.decoded_user_id;
  const shopId = storedata.shop_info?.shopId;

  const fetchMoreBooks = useCallback(async () => {
    if (fetchingMore || !hasMore || isAuthError) return;

    setFetchingMore(true);

    try {
      const lastBid = books.length ? books[books.length - 1].bid : 0;
      const url = `${API_URL}/shop/${userId}/${shopId}/check-stock/${lastBid}`;

      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('인증 오류', '로그인이 필요합니다.');
        setHasMore(false);
        setIsAuthError(true);
        setFetchingMore(false);
        return;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('인증 오류', '로그인이 필요합니다.');
          setHasMore(false);
          setIsAuthError(true);
        } else {
          Alert.alert('오류', '서버 응답 오류입니다.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setBooks(prev => [...prev, ...data]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
      if (!hasMore) return;
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setFetchingMore(false);
      setLoading(false);
    }
  }, [fetchingMore, hasMore, books, API_URL, userId, shopId, isAuthError]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const onPressItem = (isbn) => {
    navigation.navigate('BookDetailList', { isbn, allBooks: books });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onPressItem(item.isbn)}>
      <Image
        source={{ uri: `${API_URL}${item.bookimg}` }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.author}>{item.author}</Text>
        <Text style={styles.createAt}>등록일: {item.createAt?.slice(0, 10)}</Text>
      </View>
      <Text style={styles.bid}>Bid: {item.bid}</Text>
    </TouchableOpacity>
  );

  const handleEndReached = () => {
    if (!fetchingMore && hasMore && !isAuthError) {
      fetchMoreBooks();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>보유 중인 도서</Text>
      {loading && !books.length ? (
        <ActivityIndicator size="large" color="#000" />
      ) : books.length === 0 ? (
        <Text style={styles.noData}>등록된 책이 없습니다.</Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.bid.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            fetchingMore ? <ActivityIndicator size="small" color="#000" /> : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 16, textAlign: 'center' },
  list: { paddingBottom: 20 },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 12,
    alignItems: 'center',
  },
  itemImage: { width: 50, height: 75, marginRight: 16, borderRadius: 5, backgroundColor: '#ddd' },
  itemInfo: { flex: 1.5, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', flexShrink: 1 },
  author: { marginTop: 4, fontSize: 14, color: '#333' },
  createAt: { marginTop: 4, fontSize: 12, color: '#666' },
  bid: {
    marginLeft: 10,
    color: '#555',
    fontWeight: 'bold',
    position: 'absolute',
    right: 0,
    bottom: 5,
  },
  noData: { marginTop: 40, fontSize: 16, textAlign: 'center', color: '#888' },
});

export default StoreInventoryView;
