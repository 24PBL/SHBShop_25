import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from './ChatListScreen';


const Stack = createStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} options={{headerShown:false}} />
      
    </Stack.Navigator>
  );
}
