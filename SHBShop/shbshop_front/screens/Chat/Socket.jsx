import { io } from "socket.io-client";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

// Socket 인스턴스 생성 시 auth 옵션 대신 query 옵션을 사용합니다.
// 초기화 시점에는 토큰이 없을 수 있으므로 빈 객체 {} 또는 필요한 다른 쿼리 파라미터를 설정합니다.
const Socket = io(`${API_URL}`, {
  autoConnect: false,
  transports: ["websocket"],
  // auth: { token: '...' }, // <-- auth 옵션은 이제 사용하지 않습니다. 제거하거나 주석 처리하세요.
  query: {}, // <-- 여기에 연결 시 토큰을 추가할 것입니다.
});

export const connectSocket = async () => {
  console.log("[connectSocket] 소켓 연결 시도 중...");
  const token = await AsyncStorage.getItem('jwtToken');

  if (token && !Socket.connected) {
    // 연결 전에 Socket 인스턴스의 query 옵션을 업데이트합니다.
    // Socket.IO v3+에서는 Socket.io.opts.query를 직접 수정하여 쿼리 파라미터를 설정합니다.
    // 이 토큰이 소켓 연결 핸드셰이크 요청의 쿼리 스트링으로 포함됩니다.
    Socket.io.opts.query = { token: token };
    console.log("[connectSocket] Socket.io.opts.query 설정:", Socket.io.opts.query);

    // 이제 소켓 연결을 시도합니다.
    Socket.connect();
    console.log("[connectSocket] Socket.connect() 호출 완료");

  } else if (Socket.connected) {
      console.log("[connectSocket] 소켓이 이미 연결되어 있습니다.");
  } else {
      console.warn("[connectSocket] JWT 토큰을 가져오지 못했거나 연결 상태가 유효하지 않습니다.");
      // 토큰이 없는 경우의 처리를 여기에 추가할 수 있습니다.
  }
};

// 다른 파일에서 소켓 인스턴스를 사용할 수 있도록 내보냅니다.
export default Socket;
