import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from './ChatListScreen';
import ChatRoomScreen from './ChatRoomScreen';

const Stack = createStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} options={{ title: '채팅 목록' }} />
      <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} options={{ title: '채팅방' }} />
      
    </Stack.Navigator>
  );
}
