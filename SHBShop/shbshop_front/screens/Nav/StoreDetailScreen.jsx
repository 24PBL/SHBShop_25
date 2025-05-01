import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const StoreDetailScreen = () => {
  //const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  // 예시 이미지 리스트
  const images = [
    { id: '1', uri: 'https://via.placeholder.com/400x200.png?text=Store+Image+1' },
    { id: '2', uri: 'https://via.placeholder.com/400x200.png?text=Store+Image+2' },
    { id: '3', uri: 'https://via.placeholder.com/400x200.png?text=Store+Image+3' },
  ];

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
      {/* 상단 이미지 */}
      <View style={styles.topImage}>
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image source={{ uri: item.uri }} style={styles.image} />
          )}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
        
        {/* 뒤로가기, 하트, 점 */}
        <TouchableOpacity style={styles.backIcon} onPress={() => {}}>
          <Ionicons name="chevron-back-outline" size={27} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.heartIcon} onPress={() => setLiked(!liked)}>
          <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={30}
          color={liked ? 'red' : '#000'}
        />
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>
      </View>

      {/* 서점 정보 */}
      <View style={styles.infoSection}>
        <View style={styles.profileRow}>
          <View style={styles.avatar} />
          <View style={styles.profileText}>
            <Text style={styles.storeName}>서점이름</Text>
            <Text style={styles.address}>주소</Text>
          </View>
          <TouchableOpacity style={styles.searchIconButton}>
            <Ionicons name="search-outline" size={25} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <Text style={styles.hours}>영업시간 등등{'\n'}</Text>
      </View>

      {/* 서점 설명 */}
      <View style={styles.descriptionSection}>
        <ScrollView style={{ maxHeight: 270 }}>
          <Text style={styles.description}>서점설명</Text>
        </ScrollView>
      </View>

    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  topImage: {
    height: 250,
    backgroundColor: '#ddd',
    position: 'relative',
  },
  image: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 10,
  },
  heartIcon: {
    position: 'absolute',
    top: 20,
    right: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bbb',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  infoSection: {
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  profileText: {
    flex: 1,
  },
  storeName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  address: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchIconButton: {
    marginLeft: 8,
    padding: 6,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginVertical: 10,
  },
  hours: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingTop: 15,
  },
  description: {
    fontSize: 14,
    color: '#222',
  },
});

export default StoreDetailScreen;
