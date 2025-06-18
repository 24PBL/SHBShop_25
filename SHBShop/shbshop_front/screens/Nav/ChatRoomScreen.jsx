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
  Image,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import socket from '../Chat/Socket';
import { SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';


const API_URL = Constants.expoConfig.extra.API_URL;

const ChatRoomScreen = ({ route, navigation}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { roomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState(null);
  const [otheruser, setotheruser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState(null);

  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false);

  const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0]);
  }
};

const takePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.7,
  });

  if (!result.canceled) {
    setSelectedImage(result.assets[0]);
  }
};


  const toggleAttachment = () => {
  setIsAttachmentVisible((prev) => !prev);
};

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = JSON.parse(await AsyncStorage.getItem('UserData'));
      setUserId(userData.decoded_user_id);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
  const joinRoom = async () => {
    const Token = await AsyncStorage.getItem('jwtToken');
    if (!Token) return;

    socket.auth = { token: Token };

    if (!socket.connected) {
      socket.connect();
      socket.once('connect', () => {
        socket.emit('join', { token: Token, room_id: roomId });
      });
    } else {
      // 이미 연결되어 있으면 바로 join
      socket.emit('join', { token: Token, room_id: roomId });
    }
  };

  joinRoom();
}, [roomId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const Token = await AsyncStorage.getItem('jwtToken');
        const res = await axios.get(
          `${API_URL}/chat/${userId}/chat-room/${roomId}`,  
          {
            headers: { Authorization: `Bearer ${Token}` },  
          }
        );
        const data = await res.data;
        console.log(`채팅방 정보 ${data}`)
        setotheruser(res.data.other_info)
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
    if (!Token) return;

    socket.auth = { token: Token };
    socket.connect();

    socket.on('connect', () => {
      console.log('소켓 연결됨');
      socket.emit('join', { token: Token, room_id: roomId });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('소켓 재연결됨:', attemptNumber);
      socket.emit('join', { token: Token, room_id: roomId });  // 🔁 재참여
    });

    socket.on('connect_error', (error) => {
      console.error("소켓 연결 오류:", error);
    });
  };

  //setupSocket();

  socket.on('receive_message', (data) => {
    if (data.room_id === roomId) {
      setMessages((prev) => [...prev, data]);
    }
  });

  setupSocket();

  return () => {
    
  };
}, [roomId]); 


 

  const flatListRef = useRef();

 const sendMessage = async () => {
  if (!input.trim() && !selectedImage) return;

  const Token = await AsyncStorage.getItem('jwtToken');
  const formData = new FormData();

  if (input.trim()) formData.append('message', input.trim());
  if (selectedImage) {
    formData.append('image', {
      uri: selectedImage.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
  }

  try {
    await axios.post(
      `${API_URL}/chat/${userId}/chat-room/${roomId}/send`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${Token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // 전송 후에는 메시지를 직접 추가하지 않고, 
    // 서버가 보내는 'receive_message' 이벤트에서 메시지 업데이트를 기다림
    setInput('');
    setSelectedImage(null);

  } catch (err) {
    console.error('메시지 전송 실패:', err);
    Alert.alert('메시지 전송 실패', '다시 시도해주세요.');
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
        {item.image_url && (
          <TouchableOpacity onPress={() => {
            setModalImageUri(`${API_URL}${item.image_url}`);
            setModalVisible(true)}}>
            <Image
            style={{ width: 200, height: 200, borderRadius: 10, marginTop: 5 }}
            source={{ uri: `${API_URL}${item.image_url}` }}
            resizeMode="cover"
          />
          </TouchableOpacity>
          
        )}
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
        {!isMe && (
          <Image
            style={styles.avatar}
            source={{ uri: `${API_URL}/${otheruser.elseimg}` }}
          />
        )}
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          {!isMe && (
            <Text style={styles.nickname}>
              {otheruser.otherName || '알 수 없음'}
            </Text>
          )}
          <Text style={isMe ? styles.messageText : styles.othermessageText}>
            {item.message}
          </Text>
          {item.image_url && (
            <Image
              style={{ width: 200, height: 200, borderRadius: 10, marginTop: 5 }}
              source={{ uri: `${API_URL}${item.image_url}` }}
              resizeMode="cover"
            />
          )}
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

  const goToHome = () =>{
    navigation.goBack();
  }

  const leaveChat = async () => {
  try {
    const Token = await AsyncStorage.getItem('jwtToken');
    if (!Token || !userId) {
      Alert.alert('에러', '유저 정보가 없습니다.');
      return;
    }

    // 1. 소켓에서 leave 이벤트 emit
    socket.emit('leave', { token: Token, room_id: roomId });

    // 2. 서버에 DELETE 요청 보내서 채팅방 나가기 처리
    await axios.delete(
      `${API_URL}/chat/${userId}/chat-room/${roomId}/out`,
      {
        headers: { Authorization: `Bearer ${Token}` },
      }
    );
    socket.off();
    socket.disconnect();

    // 4. 채팅방 리스트 화면으로 이동 (예: 'ChatList'라는 이름)
    navigation.reset({
  index: 0,
  routes: [
    {
      name: 'Navbar'
    }
  ],
});

  } catch (error) {
    console.error('채팅방 나가기 실패:', error);
    Alert.alert('오류', '채팅방 나가기에 실패했습니다. 다시 시도해주세요.');
  }
};

  if (!otheruser) {
  return (
    <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>로딩 중...</Text>
    </SafeAreaView>
  );
}


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, paddingBottom: 10, paddingHorizontal: 10 }}>
  <TouchableOpacity onPress={goToHome} style={{ paddingRight: 10 }}>
    <Ionicons name="chevron-back-outline" size={30} color="black" />
  </TouchableOpacity>

  <Text
    style={{ flex: 1, fontWeight: 'bold', fontSize: 22 }}
    numberOfLines={1}
    ellipsizeMode="tail"
  >
    {otheruser && otheruser.otherName ? otheruser.otherName : '접속 중'}님과의 채팅
  </Text>

  <TouchableOpacity
    onPress={leaveChat}
    style={{
      borderRadius: 5,
      borderWidth: 0.8,
      width: 50,
      alignItems: 'center',
      justifyContent: 'center',
      height: 30,
      borderColor: 'red',
    }}
  >
    <Text style={{ fontWeight: 'bold', color: 'red' }}>나가기</Text>
  </TouchableOpacity>
</View>


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
        <TouchableOpacity onPress={toggleAttachment}>
          <Ionicons name="add-outline" size={35} style={{alignSelf:'center', paddingRight:5}}/>
        </TouchableOpacity>
        <View style={styles.inputPreviewContainer}>
  {selectedImage && (
    <View style={styles.previewWrapper}>
      <Image
        source={{ uri: selectedImage.uri }}
        style={styles.previewImage}
      />
      <TouchableOpacity
        style={styles.removePreviewButton}
        onPress={() => setSelectedImage(null)}
      >
        <Ionicons name="close-circle" size={24} color="red" />
      </TouchableOpacity>
    </View>
  )}
  <TextInput
    style={styles.input}
    value={input}
    onChangeText={setInput}
    placeholder="메시지를 입력하세요"
    placeholderTextColor="#999"
  />
</View>

        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>

    {isAttachmentVisible && (
  <View style={styles.attachmentOptions}>
    <TouchableOpacity style={styles.attachmentButton} onPress={pickImage}>
      <Ionicons name="image-outline" size={24} color="black" />
      <Text style={styles.attachmentText}>사진</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.attachmentButton} onPress={takePhoto}>
      <Ionicons name="camera-outline" size={24} color="black" />
      <Text style={styles.attachmentText}>카메라</Text>
    </TouchableOpacity>
  </View>
)}

<Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeArea} onPress={() => setModalVisible(false)} />
          <Image
            source={{ uri: modalImageUri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>


      </SafeAreaView>
    </SafeAreaProvider>
   
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
    backgroundColor: 'dodgerblue',
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
  attachmentOptions: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  backgroundColor: 'white',
  paddingVertical: 10,
  borderTopWidth: 1,
  borderColor: '#ddd',
},

attachmentButton: {
  alignItems: 'center',
  justifyContent: 'center',
},

attachmentText: {
  fontSize: 12,
  marginTop: 4,
},
inputPreviewContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},

previewWrapper: {
  position: 'relative',
  marginRight: 8,
},

previewImage: {
  width: 50,
  height: 50,
  borderRadius: 8,
},

removePreviewButton: {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: 'white',
  borderRadius: 12,
},



});

export default ChatRoomScreen;
