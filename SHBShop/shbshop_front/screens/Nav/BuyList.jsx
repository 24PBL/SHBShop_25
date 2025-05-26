import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  FlatList, ActivityIndicator, Alert
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
    fnlPRid: undefined,
    fnlCRid: undefined,
    fnlSRid: undefined,
  });

  const isWithinThreeMonths = (dateStr) => {
    const date = new Date(dateStr);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return date >= threeMonthsAgo;
  };

  const processSellerType1 = (list) => {
    return list.filter(item => item.sellerType === 1 && isWithinThreeMonths(item.createAt)).map(item => ({
      ...item,
      origin: '개인 거래',
    }));
  };

  const processSellerType2 = (list) => {
    return list.filter(item => item.sellerType === 2 && isWithinThreeMonths(item.createAt)).map(item => ({
      ...item,
      origin: '개인 사업자 거래',
    }));
  };

  const processStoreList = (list) => {
    return (list || []).filter(item => isWithinThreeMonths(item.createAt)).map(item => ({
      ...item,
      origin: '매장',
    }));
  };

  const getLastRid = (list) => {
    return list.length > 0 ? list[list.length - 1].rid : null;
  };

  useEffect(() => {
    const initPersonal1 = processSellerType1(receiptData.book_list || []);
    const initPersonal2 = processSellerType2(receiptData.book_list || []);
    const initStore = processStoreList(receiptData.sbook_list || []);

    const combined = [...initPersonal1, ...initPersonal2, ...initStore];
    setMergedList(combined);

    if (combined.length === 0) {
      setHasMore(false); // 초기 데이터도 없으면 더 이상 불러오지 않도록
    }

    setLastIds({
      fnlPRid: getLastRid(initPersonal1),
      fnlCRid: getLastRid(initPersonal2),
      fnlSRid: getLastRid(initStore),
    });
  }, [receiptData]);

  const fetchMore = async () => {
    // 이미 더 불러올 게 없거나, 현재 로딩 중이거나, 모든 ID가 null이면 중단
    if (!hasMore || loadingMore ||
      (lastIds.fnlPRid == null && lastIds.fnlCRid == null && lastIds.fnlSRid == null)) {
      return;
    }

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

      if (!response.ok) throw new Error(`서버 에러: ${response.status}`);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`JSON 아님 응답: ${text}`);
      }

      const result = await response.json();

      const newPersonal1 = processSellerType1(result.book_list || []);
      const newPersonal2 = processSellerType2(result.book_list || []);
      const newStore = processStoreList(result.sbook_list || []);

      if (newPersonal1.length === 0 && newPersonal2.length === 0 && newStore.length === 0) {
        setHasMore(false);
        return;
      }

      const newCombined = [...newPersonal1, ...newPersonal2, ...newStore];
      setMergedList(prev => [...prev, ...newCombined]);

      setLastIds({
        fnlPRid: getLastRid(newPersonal1) || lastIds.fnlPRid,
        fnlCRid: getLastRid(newPersonal2) || lastIds.fnlCRid,
        fnlSRid: getLastRid(newStore) || lastIds.fnlSRid,
      });
    } catch (error) {
      console.error('추가 로딩 오류:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const goToBookDetail = async (sellType, rid) => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      const response = await fetch(`${API_URL}/home/${userId}/my-page/show-receipt/detail/${sellType}/${rid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Token}`,
        },
      });

      const data = await response.json();
      console.log(data)
      navigation.navigate('PBuyListDetail', {
        storedata: data,
        receiptData: { receiptData },
      });
    } catch (error) {
      console.error('책 상세 정보 가져오기 실패:', error);
      Alert.alert('오류', '책 상세 정보를 불러오는 데 실패했습니다.');
    }
  };

  const CommergoToBookDetail = async (sid, bid) => {
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;
      const Token = await AsyncStorage.getItem('jwtToken');

      const response = await fetch(`${API_URL}/book/sb/${userId}/${sid}/${bid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`,
        },
      });

      const data = await response.json();
      navigation.navigate('CBookDetailScreen', { storedata: { data } });
    } catch (error) {
      console.error('매장 책 상세 실패:', error);
    }
  };

  const handleClickItem = (item) => {
    if (item.origin === '매장') {
      CommergoToBookDetail(item.sid, item.bid);
    } else {
      goToBookDetail(item.sellerType, item.rid);
    }
  };

  const renderBookItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.bookItem} onPress={() => handleClickItem(item)}>
        <View>
          <Image
            source={{ uri: `${API_URL}${item.bookimg}` }}
            style={styles.bookImage}
            resizeMode="cover"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>{item.price}원</Text>
          <Text style={styles.originLabel}>거래방식 : {item.origin}</Text>
        </View>
      </TouchableOpacity>
    );
  };

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
          keyExtractor={(item, index) => `${item.origin}-${item.rid || item.bid}-${index}`}
          renderItem={renderBookItem}
          contentContainerStyle={styles.listContainer}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.7}
          ListFooterComponent={loadingMore && <ActivityIndicator size="small" color="gray" />}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', padding: 20, color: '#888' }}>구매내역이 없습니다.</Text>
          }
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
