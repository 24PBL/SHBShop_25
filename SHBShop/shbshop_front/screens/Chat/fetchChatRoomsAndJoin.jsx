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

    // --- 여기서부터 소켓 연결 로직을 connectSocket 함수에 위임합니다. ---
    // fetchChatRoomsAndJoin 함수는 connectSocket을 호출하여 연결만 시작하게 합니다.
    // connectSocket 함수 내부에서 토큰 설정 (query) 및 Socket.connect() 호출이 일어납니다.
    // 소켓이 이미 연결되어 있더라도 connectSocket 함수는 다시 연결하지 않도록 로직이 되어 있습니다.
    await connectSocket(); // <--- connectSocket 함수 호출 (Socket.jsx의 함수)

    // 소켓 연결은 비동기적이므로, 연결 성공 이벤트 리스너를 여기서 등록해야 합니다.
    // 이 리스너는 소켓이 연결될 때마다 실행됩니다.
    const handleSocketConnect = () => {
      console.log("[fetchChatRoomsAndJoin] 소켓 연결 성공 이벤트 수신. 채팅방 조인 시작.");
      // 소켓 연결 성공 후에 채팅방 목록을 가져와 조인 이벤트를 보냅니다.
      // 이 로직을 connect 리스너 안으로 옮기거나,
      // 혹은 connectSocket 함수가 연결 성공 후 콜백을 제공하도록 수정할 수 있습니다.
      // 여기서는 단순화를 위해 connect 리스너 안에서 채팅방 목록을 다시 가져오는 예시를 들겠습니다.
      // (실제로는 API 호출 결과를 한 번만 사용하도록 로직을 개선하는 것이 좋습니다)

      // 채팅방 목록 가져오는 API 호출 (CH-UC-001) - 이미 위에서 가져왔으니, 가져온 목록 사용
       if (chatRoomList && chatRoomList.length > 0) {
           chatRoomList.forEach(room => {
             Socket.emit("join", {
               token: userToken, // 조인 이벤트 페이로드에 토큰 포함 (이건 쿼리가 아닙니다)
               room_id: room.roomId
             });
             console.log(`[fetchChatRoomsAndJoin] 'join' 이벤트 전송: room_id ${room.roomId}`);
           });
       } else {
            console.log("[fetchChatRoomsAndJoin] 채팅방이 없습니다. 조인할 방이 없습니다.");
       }

    };

    // 소켓 연결 상태 리스너 등록 (필요하다면 다른 리스너도 여기에 등록)
    Socket.on('connect', handleSocketConnect);
    Socket.on('connect_error', (err) => {
      console.error("[fetchChatRoomsAndJoin] 소켓 연결 에러:", err.message);
    });
    Socket.on('disconnect', (reason) => {
        console.warn(`[fetchChatRoomsAndJoin] 소켓 연결 끊김: ${reason}`);
    });

    // --- 여기까지 소켓 연결 및 리스너 등록 ---

    // 2. 현재 사용자의 채팅방 목록을 가져오는 API 호출 (CH-UC-001) - 이 부분은 그대로 둡니다.
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
    const chatRoomList = chatRoomListData.chat_room_list; // <-- 채팅방 목록 변수 선언
    console.log("[fetchChatRoomsAndJoin] 가져온 채팅방 목록:", chatRoomList);


    // 중요: 만약 이 함수가 실행될 때 소켓이 이미 'connected' 상태라면,
    // 위의 'connect' 리스너는 이미 발생했을 수 있습니다.
    // 따라서 이미 연결된 상태라면 채팅방 조인 로직을 바로 실행해줍니다.
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
    // 만약 연결되지 않았다면, 위에서 등록한 'connect' 리스너가 연결 성공 시 조인 로직을 처리할 것입니다.


  } catch (error) {
    console.error("[fetchChatRoomsAndJoin] 채팅방 목록 가져오기 및 소켓 조인 중 에러 발생:", error);
  }
};

export default fetchChatRoomsAndJoin;
