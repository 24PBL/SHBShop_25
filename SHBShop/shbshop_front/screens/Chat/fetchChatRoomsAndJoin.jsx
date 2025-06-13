import Socket, { connectSocket } from './Socket'; // <--- Socket 인스턴스와 connectSocket 함수를 모두 가져옵니다.
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

/**
 * 사용자의 채팅방 목록을 가져오고 소켓 연결을 시작하며 각 채팅방의 소켓 룸에 조인하는 함수
 * 이 함수는 해당 뷰(화면)가 마운트될 때 호출됩니다.
 * @param {string} userId - 현재 로그인된 사용자의 ID
 * @param {string} userToken - 사용자의 JWT 토큰
 */
export const fetchChatRoomsAndJoin = async (userId, userToken) => {
  try {
    // 1. 인자로 받은 토큰과 userId 유효성 검사
    if (!userToken) {
      console.error("[fetchChatRoomsAndJoin] JWT 토큰이 없습니다. 소켓 연결을 시도할 수 없습니다.");
      return;
    }
    if (!userId) {
       console.error("[fetchChatRoomsAndJoin] 사용자 ID가 없습니다. 채팅방 목록을 가져올 수 없습니다.");
       return;
    }
    console.log(`[fetchChatRoomsAndJoin] 사용자 ID: ${userId}, 토큰 존재: ${!!userToken}`);
    console.log("[fetchChatRoomsAndJoin] 내 토큰 : ", userToken); // <-- 토큰 값 확인 로그

   
    await connectSocket(); // <--- connectSocket 함수 호출 (Socket.jsx의 함수)

   
    const handleSocketConnect = () => {
      console.log("[fetchChatRoomsAndJoin] 소켓 연결 성공 이벤트 수신. 채팅방 조인 시작.");
     

     
       if (chatRoomList && chatRoomList.length > 0) {
           chatRoomList.forEach(room => {
             Socket.emit("join", {
               token: userToken, 
               room_id: room.roomId
             });
             console.log(`[fetchChatRoomsAndJoin] 'join' 이벤트 전송: room_id ${room.roomId}`);
           });
       } else {
            console.log("[fetchChatRoomsAndJoin] 채팅방이 없습니다. 조인할 방이 없습니다.");
       }

    };

  
    Socket.on('connect', handleSocketConnect);
    Socket.on('connect_error', (err) => {
      console.error("[fetchChatRoomsAndJoin] 소켓 연결 에러:", err.message);
    });
    Socket.on('disconnect', (reason) => {
        console.warn(`[fetchChatRoomsAndJoin] 소켓 연결 끊김: ${reason}`);
    });

   
    const chatRoomsApiUrl = `${API_URL}/chat/${userId}/chat-room`;
    console.log(`[fetchChatRoomsAndJoin] 채팅방 목록 API 호출: ${chatRoomsApiUrl}`);

    const response = await fetch(chatRoomsApiUrl, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[fetchChatRoomsAndJoin] 채팅방 목록 가져오기 실패: ${response.status}`, errorData);
      return;
    }

    const chatRoomListData = await response.json();
    const chatRoomList = chatRoomListData.chat_room_list; 
    console.log("[fetchChatRoomsAndJoin] 가져온 채팅방 목록:", chatRoomList);


    if (Socket.connected) {
        console.log("[fetchChatRoomsAndJoin] 함수 실행 시 소켓이 이미 연결되어 있습니다. 채팅방 조인 시작 (즉시).");
         if (chatRoomList && chatRoomList.length > 0) {
           chatRoomList.forEach(room => {
             Socket.emit("join", {
               token: userToken,
               room_id: room.roomId
             });
             console.log(`[fetchChatRoomsAndJoin] 'join' 이벤트 전송 (즉시): room_id ${room.roomId}`);
           });
        } else {
             console.log("[fetchChatRoomsAndJoin] 채팅방이 없습니다. 조인할 방이 없습니다 (즉시).");
        }
    }
   


  } catch (error) {
    console.error("[fetchChatRoomsAndJoin] 채팅방 목록 가져오기 및 소켓 조인 중 에러 발생:", error);
  }
};

export default fetchChatRoomsAndJoin;
