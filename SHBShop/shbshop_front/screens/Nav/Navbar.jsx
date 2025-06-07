import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ChatStack from './ChatStack';
import HomeStack from './HomeStack';
import BookStack from './BookStack';
import MyPageStack from './MyPageStack';
import { CommonActions } from '@react-navigation/native';
const Tab = createBottomTabNavigator();

const Navbar = ({ navigation }) => {
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
      <Tab.Screen
        name="홈"
        component={HomeStack}
        options={{ headerShown: false }}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            const state = route?.state;
            if (state && state.index > 0) {
              // 스택의 맨 위가 아닐 경우 첫 화면으로 이동
              navigation.navigate('홈');
            }
          }
        })}
      />

      <Tab.Screen
        name="책방"
        component={BookStack}
        options={{ headerShown: false }}
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            const state = route?.state;
            if (state && state.index > 0) {
              navigation.navigate('책방');
            }
          }
        })}
      />

      <Tab.Screen
        name="채팅"
        component={ChatStack}
        options={{ headerShown: false }}
      />

      <Tab.Screen
  name="마이페이지"
  component={MyPageStack}
  options={{ headerShown: false }}
  listeners={({ navigation, route }) => ({
    tabPress: e => {
      const state = route?.state;

      if (state && state.index > 0) {
        // 기본 탭 이동 막기
        e.preventDefault();

        // MyPageStack 스택 초기화해서 루트 화면(MyPageScreen)만 남기기
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: '마이페이지' }],
          })
        );
      }
    },
  })}
/>
    </Tab.Navigator>
  );
};

export default Navbar;
