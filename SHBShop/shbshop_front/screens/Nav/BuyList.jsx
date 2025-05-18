import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  FlatList, ActivityIndicator
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

const BuyList = ({ navigation, route }) => {
  const { receiptData } = route.params;

  const [mergedList, setMergedList] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastIds, setLastIds] = useState({
    fnlPRid: null,
    fnlCRid: null,
    fnlSRid: null
  });

  useEffect(() => {
    const initPersonal = receiptData.book_list || [];
    const initStore = receiptData.sbook_list || [];

    const combined = [
      ...initPersonal.map(item => ({
        ...item,
        origin: '개인'   // sellerType 구분 없이 모두 ‘개인’
      })),
      ...initStore.map(item => ({
        ...item,
        origin: '매장'
      })),
    ];
    setMergedList(combined);

    setLastIds({
      fnlPRid: getLastRid(initPersonal, 1),
      fnlCRid: getLastRid(initPersonal, 2),
      fnlSRid: getLastRid(initStore),
    });
  }, [receiptData]);

  const getLastRid = (list, sellerType = null) => {
    const filtered = sellerType !== null ? list.filter(item => item.sellerType === sellerType) : list;
    return filtered.length > 0 ? filtered[filtered.length - 1].rid : null;
  };

  const fetchMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const { fnlPRid, fnlCRid, fnlSRid } = lastIds;
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;

      const response = await fetch(
        `${API_URL}/home/${userId}/my-page/show-receipt/${fnlPRid}/${fnlCRid}/${fnlSRid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`JSON 아님 응답: ${text}`);
      }

      const result = await response.json();

      const newPersonal = result.book_list || [];
      const newStore = result.sbook_list || [];

      if (newPersonal.length === 0 && newStore.length === 0) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      const newCombined = [
        ...newPersonal.map(item => ({
          ...item,
          origin: '개인'  // 동일하게 ‘개인’
        })),
        ...newStore.map(item => ({
          ...item,
          origin: '매장'
        })),
      ];

      setMergedList(prev => [...prev, ...newCombined]);

      setLastIds({
        fnlPRid: getLastRid(newPersonal, 1) || lastIds.fnlPRid,
        fnlCRid: getLastRid(newPersonal, 2) || lastIds.fnlCRid,
        fnlSRid: getLastRid(newStore) || lastIds.fnlSRid,
      });
    } catch (error) {
      console.error('추가 로딩 오류:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity style={styles.bookItem}>
      <View>
        <Image
          source={{ uri: `${API_URL}${item.bookimg}` }}
          style={styles.bookImage}
          resizeMode="cover"
        />
        <Text style={styles.statusBadge}>{item.reason}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{item.price}원</Text>
        <Text style={styles.state}>
          상태 : <Text style={styles.stateHighlight}>{item.reason}</Text>
        </Text>
        <Text style={styles.originLabel}>거래방식 : {item.origin}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={23} />
          </TouchableOpacity>
          <Text style={styles.label}>구매내역</Text>
        </View>

        <FlatList
          data={mergedList}
          keyExtractor={(item, index) => `${item.origin}-${item.rid}-${index}`}
          renderItem={renderBookItem}
          contentContainerStyle={styles.listContainer}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.7}
          ListFooterComponent={loadingMore && <ActivityIndicator size="small" color="gray" />}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingTop: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 28,
    marginLeft: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 10,
  },
  bookImage: {
    width: 60,
    height: 90,
    marginRight: 15,
    borderRadius: 5,
    backgroundColor: 'gray',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    backgroundColor: 'black',
    color: 'white',
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  state: {
    fontSize: 14,
    marginTop: 5,
  },
  stateHighlight: {
    fontWeight: 'bold',
  },
  originLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
  },
});

export default BuyList;
