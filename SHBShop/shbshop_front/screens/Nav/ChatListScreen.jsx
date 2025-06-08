import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';  // useFocusEffect 추가
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

const API_URL = Constants.expoConfig.extra.API_URL;

const ChatListScreen = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchChatRooms = async () => {
        try {
          const Data = await AsyncStorage.getItem('UserData');
          const userData = JSON.parse(Data);
          const userId = userData.decoded_user_id;

          const Token = await AsyncStorage.getItem('jwtToken');

          const res = await axios.get(`${API_URL}/chat/${userId}/chat-room`, {
            headers: { Authorization: `Bearer ${Token}` }
          });

          setChatRooms(res.data.chat_room_list);
        } catch (err) {
          console.error(err);
        }
      };

      fetchChatRooms();
    }, [])
  );

  const handlePressRoom = (roomId) => {
    navigation.navigate('ChatRoomScreen', { roomId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handlePressRoom(item.roomId)}>
      <Image
        source={{ uri: item.elseimg ? `${API_URL}${item.elseimg}` : 'https://your.default.image/path.png' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>
          {item.elseNickname?.trim() ? item.elseNickname : '알 수 없음'}
        </Text>
        <Text style={styles.preview}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{backgroundColor:'white', flex:1}}>

        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, paddingBottom: 10, paddingHorizontal: 10 }}>

  <Text
    style={{ flex: 1, fontWeight: 'bold', fontSize: 28, paddingTop:10, paddingLeft:10 }}
  >
    채팅방 목록
  </Text>
</View>

        <FlatList
  data={chatRooms}
  keyExtractor={(item) => item.roomId.toString()}
  renderItem={renderItem}
  ListEmptyComponent={() => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
      <Text style={{ fontSize: 16, color: '#999' }}>채팅방이 없습니다.</Text>
    </View>
  )}
/>

      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    padding: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
  },
  preview: {
    color: '#666',
  },
});

export default ChatListScreen;
