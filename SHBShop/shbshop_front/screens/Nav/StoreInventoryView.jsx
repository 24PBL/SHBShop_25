import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const StoreInventoryView = ({ route, navigation }) => {
  const { storedata } = route.params;
  const data = storedata.data;
  const API_URL = Constants.expoConfig.extra.API_URL;
  const userId = data.decoded_user_id;
  const shopId = data.shop_info.shopId;

  const [inventory, setInventory] = useState(data.sbook_list || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const onEndReachedCalledDuringMomentum = useRef(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemClick(item)}>
      <Image source={{ uri: `${API_URL}${item.bookimg}` }} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        {/* 등록일 추가 */}
        {item.createAt && (
          <Text style={styles.registrationDate}>등록일: {new Date(item.createAt).toLocaleDateString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const handleItemClick = (item) => {
    console.log(`Clicked on item: ${item.title}`);
    // navigation.navigate('BookDetailScreen', { itemId: item.id });
  };

  const fetchMoreBooks = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const finalBid = inventory[inventory.length - 1]?.bid;

    try {
      const response = await fetch(`${API_URL}/shop/${userId}/${shopId}/check-stock/${finalBid}`);
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={24} />
          </TouchableOpacity>
          <Text style={styles.titleHeader}>매장 재고 조회</Text>
        </View>

        <FlatList
          data={inventory}
          keyExtractor={(item) => item.bid.toString()}
          renderItem={renderItem}
          onEndReached={fetchMoreBooks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="small" color="#000" /> : null}
          contentContainerStyle={styles.listContainer}
        />
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
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 0.3,
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
  registrationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  listContainer: {
    padding: 10,
  },
});

export default StoreInventoryView;
