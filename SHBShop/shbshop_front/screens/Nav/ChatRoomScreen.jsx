import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import socket from '../Chat/Socket';

const API_URL = Constants.expoConfig.extra.API_URL;

const ChatRoomScreen = ({ route }) => {
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = JSON.parse(await AsyncStorage.getItem('UserData'));
      setUserId(userData.decoded_user_id);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const Token = await AsyncStorage.getItem('jwtToken');
        const res = await axios.get(
          `${API_URL}/chat/${userId}/chat-room/${roomId}`,  // 백틱으로 수정
          {
            headers: { Authorization: `Bearer ${Token}` },  // 백틱으로 수정
          }
        );

        if (res.data && Array.isArray(res.data.message_list)) {
          setMessages(res.data.message_list); // API 응답으로 메시지 설정
        } else {
          console.error(
            'API 응답에 message_list가 없거나 배열이 아닙니다:',
            res.data,
          );
        }
      } catch (err) {
        console.error('메시지 불러오기 실패:', err);
      }
    };

    if (userId) fetchMessages();
  }, [roomId, userId]);

  useEffect(() => {
    const setupSocket = async () => {
      const Token = await AsyncStorage.getItem('jwtToken');
      if (!Token) {
        console.log("No JWT token found, cannot connect to socket or join room");
        return; // 토큰 없으면 진행 중단
      }

      if (!socket.connected) {
        socket.auth = { token: Token };
        socket.connect();
        socket.on('connect', () => {
          console.log('소켓 서버에 연결되었습니다.');
          socket.emit('join', { token: Token, room_id: roomId });
          console.log(`Joined room: ${roomId}`);
        });
        socket.on('connect_error', (error) => {
          console.error("Socket connection error during setup:", error);
        });
      } else {
        socket.emit('join', { token: Token, room_id: roomId });
        console.log(`Socket already connected. Joined room: ${roomId}`);
      }
    };

    setupSocket();

    socket.on('receive_message', (data) => {
      console.log("'receive_message' 이벤트 수신:", data);
      if (data.room_id === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.emit('leave', { room_id: roomId });
      socket.off('receive_message');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [roomId]);

  const flatListRef = useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageToSend = input;
    setInput('');

    // 1. UI 즉시 업데이트
    const newMessage = {
      message: messageToSend,
      sender_id: userId,
      createAt: new Date().toISOString(),
      sender_nickname: '나',
      room_id: roomId,
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const Token = await AsyncStorage.getItem('jwtToken');
      const formData = new URLSearchParams();
      formData.append('message', messageToSend);

      const response = await axios.post(
        `${API_URL}/chat/${userId}/chat-room/${roomId}/send`,  // 백틱으로 수정
        formData,
        {
          headers: {
            Authorization: `Bearer ${Token}`,  // 백틱으로 수정
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data && response.data.message_id) {
        const updatedMessage = { ...newMessage, id: response.data.message_id };
        setMessages((prev) =>
          prev.map((message) =>
            message.message === newMessage.message && message.sender_id === newMessage.sender_id
              ? updatedMessage
              : message
          )
        );
      }
    } catch (err) {
      console.error('메시지 전송 실패:', err);
      Alert.alert('메시지 전송 실패', '메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const groupMessagesByDate = useCallback((messages) => {
    return messages.reduce((acc, message) => {
      const date = new Date(message.createAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    }, {});
  }, []);

  const convertGroupedMessagesToArray = useCallback((groupedMessages) => {
    return Object.entries(groupedMessages)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .reduce((acc, [date, messages]) => {
        acc.push({ type: 'header', date });
        acc.push(...messages.map((message) => ({ type: 'message', ...message })));
        return acc;
      }, []);
  }, []);

  const flatListData = useMemo(() => {
    const groupedMessages = groupMessagesByDate(messages);
    return convertGroupedMessagesToArray(groupedMessages);
  }, [messages, convertGroupedMessagesToArray, groupMessagesByDate]);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.headerContainer}>
          <View style={styles.headerLine} />
          <Text style={styles.headerText}>{item.date}</Text>
          <View style={styles.headerLine} />
        </View>
      );
    } else {
      const isMe = item.sender_id === userId;
      return (
        <View
          style={[
            styles.messageContainer,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          {!isMe && <Image style={styles.avatar} source={{uri : `${API_URL}/${item.sender_img}`}}/>}
          <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
            {!isMe && (
              <Text style={styles.nickname}>{item.sender_nickname || '상대방'}</Text>
            )}
            <Text style={isMe ? styles.messageText : styles.othermessageText}>{item.message}</Text>
            <Text style={isMe ? styles.timestamp : styles.othertimestamp}>
              {new Date(item.createAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      );
    }
  };

  const keyExtractor = useCallback((item, index) => {
    return `message-${item.room_id}-${item.id || item.cmid}-${index}`;
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding' })}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={flatListData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        inverted={false}
        contentContainerStyle={styles.flatListContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flatListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 12,
    paddingBottom: 60,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
    paddingLeft: 50,
  },
  otherMessage: {
    justifyContent: 'flex-start',
    paddingRight: 50,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccc',
    marginRight: 8,
    marginBottom: 50,
  },
  bubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 15,
  },
  myBubble: {
    backgroundColor: '#0091da',
    borderTopRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: 'lightblue',
    borderTopLeftRadius: 0,
  },
  nickname: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  othermessageText: {
    fontSize: 16,
    color: 'black',
  },
  timestamp: {
    fontSize: 10,
    color: 'white',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  othertimestamp: {
    fontSize: 10,
    color: 'black',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    height: 40,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sendText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  headerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default ChatRoomScreen;
