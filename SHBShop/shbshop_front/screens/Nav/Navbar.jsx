import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ChatScreen from './ChatScreen';
import HomeStack from './HomeStack';
import BookStack from './BookStack'
import MyPageStack from './MyPageStack'

const Tab = createBottomTabNavigator()

const Navbar = () => {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === '홈') {
              iconName = 'home-outline';
            } else if (route.name === '책방') {
              iconName = 'book-outline';
            } else if (route.name === '채팅') {
              iconName = 'chatbubble-ellipses-outline';
            } else if (route.name === '마이페이지') {
              iconName = 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="홈" component={HomeStack} options={{headerShown:false}} />
        <Tab.Screen name="책방" component={BookStack}  options={{headerShown:false}}/>
        <Tab.Screen name="채팅" component={ChatScreen}  options={{headerShown:false}}/>
        <Tab.Screen name="마이페이지" component={MyPageStack}  options={{headerShown:false}}/>
      </Tab.Navigator>
  );
}

export default Navbar;