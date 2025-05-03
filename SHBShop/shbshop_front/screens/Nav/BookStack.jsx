// screens/Nav/HomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookScreen from './BookScreen';
import StoreDetailScreen from './StoreDetailScreen';
import BookStoreSearch from './BookStoreSearch';
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BookScreen" component={BookScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StoreDetailScreen" component={StoreDetailScreen} options={{headerShown : false}}/>
      <Stack.Screen name="BookStoreSearch" component={BookStoreSearch} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
};

export default HomeStack;
