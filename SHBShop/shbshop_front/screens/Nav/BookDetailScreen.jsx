import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const BookDetailScreen = () => {
  // const navigation = useNavigation();
  const [thumbsUp, setThumbsUp] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 예시 이미지 리스트
  const images = [
    { id: '1', uri: 'https://via.placeholder.com/400x200.png?text=Book+Image+1' },
    { id: '2', uri: 'https://via.placeholder.com/400x200.png?text=Book+Image+2' },
    { id: '3', uri: 'https://via.placeholder.com/400x200.png?text=Book+Image+3' },
  ];

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{backgroundColor:'white', flex:1}}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity style={styles.backButton} onPress={() => {}}>
        <Ionicons name="chevron-back-outline" size={27} color="#000" />
      </TouchableOpacity>

      {/* 상단 이미지 */}
      <View style={styles.imageSection}>
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

      <View style={styles.detailSection}>
        {/* 프로필 */}
        <View style={styles.profileRow}>
          <View style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.nickname}>닉네임(서점이름)</Text>
            <Text style={styles.location}>동네</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* 제목 + 설명 */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.bookTitle}>제목 (책 이름)</Text>
          <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.description}>도서 관련 설명</Text>
          </ScrollView>
        </View>

        {/* 가격 , 좋아요 */}
        <View style={styles.bottomRow}>
          <View style={styles.thumb}>
            <TouchableOpacity style={{ marginRight: 15 }} onPress={() => setThumbsUp(!thumbsUp)}>
              <Ionicons
                name={thumbsUp ? 'thumbs-up-outline' : 'thumbs-up-outline'}
                size={28}
                color={thumbsUp ? '#0091da' : '#000'}
              />
            </TouchableOpacity>
            <Text style={styles.priceText}>XXXXX원</Text>
          </View>
          <TouchableOpacity style={styles.chatbutton} onPress={() => {}}>
            <Text style={styles.chatText}>채팅</Text>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
      </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
  },
  imageSection: {
    backgroundColor: '#ddd',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: width,
    height: 250,
    resizeMode: 'cover',
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
  detailSection: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: '#ddd',
    borderRadius: 25,
    marginRight: 10,
  },
  profileInfo: {
    flexDirection: 'column',
  },
  nickname: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    flexGrow: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  description: {
    fontSize: 14,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  thumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatbutton: {
    backgroundColor: '#0091DA',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  chatText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 0,
  },
});

export default BookDetailScreen;
