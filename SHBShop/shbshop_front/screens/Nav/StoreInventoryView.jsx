import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const StoreInventoryView = ({ route }) => {
  const { storeId = 'test-id', storeName = '테스트 매장' } = route?.params || {};
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 테스트용: 데이터 없이 1초 후 로딩 종료
    const timer = setTimeout(() => {
      setInventory([]); // 데이터 없음 상태
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);


  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.quantity}>수량: {item.quantity}</Text>
        <Text style={styles.price}>{item.price}원</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{storeName} 재고 목록</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : inventory.length === 0 ? (
        <Text style={styles.noData}>재고가 없습니다.</Text>
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 90,
    marginRight: 16,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    marginTop: 4,
    color: '#555',
  },
  price: {
    marginTop: 4,
    color: '#000',
  },
  noData: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
});

export default StoreInventoryView;
