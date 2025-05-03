// screens/Nav/HomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPageScreen from './MyPageScreen'
import Approve from './Approve';
const Stack = createNativeStackNavigator();

const MyPageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BookScreen" component={MyPageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Approve" component={Approve} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default MyPageStack;
