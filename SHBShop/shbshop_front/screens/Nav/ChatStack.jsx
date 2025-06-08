import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from './ChatListScreen';
import ChatRoomScreen from './ChatRoomScreen';

const Stack = createStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} options={{headerShown:false}} />
      <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} options={{headerShown:false}} />
      
    </Stack.Navigator>
  );
}
