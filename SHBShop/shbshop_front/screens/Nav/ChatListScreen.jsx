// ChatListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = Constants.expoConfig.extra.API_URL;
const ChatListScreen = ({ userId, userToken }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const navigation = useNavigation();


 useEffect(() => {
  const fetchChatRooms = async () => {
    console.log("요청 중")
    try {
      const Data = await AsyncStorage.getItem('UserData');
      const userData = JSON.parse(Data);
      const userId = userData.decoded_user_id;

      const Token = await AsyncStorage.getItem('jwtToken');

      const res = await axios.get(`${API_URL}/chat/${userId}/chat-room`, {
        headers: { Authorization: `Bearer ${Token}` }
      });
      console.log(res.data)
      setChatRooms(res.data.chat_room_list);
    } catch (err) {
      console.error(err);
    }
  };

  fetchChatRooms();
}, []);


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
    <FlatList
      data={chatRooms}
      keyExtractor={(item) => item.roomId.toString()}
      renderItem={renderItem}
    />
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
