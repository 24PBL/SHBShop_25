// screens/Nav/HomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import Search from './Search';
import SellBook from './SellBook';
import BookSearchScreen from './BookSearchScreen';
import SellBook1 from './SellBook1';
import PBookDetailScreen from './PBookDetailScreen';
import CBookDetailScreen from './CBookDetailScreen'

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Search" component={Search} options={{ headerShown:false }} />
      <Stack.Screen name="SellBook" component={SellBook} options={{ headerShown:false }} />
      <Stack.Screen name="BookSearch" component={BookSearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SellBook1" component={SellBook1} options={{ headerShown: false }} />
      <Stack.Screen name="PBookDetailScreen" component={PBookDetailScreen} options={{headerShown: false}}/>
      <Stack.Screen name="CBookDetailScreen" component={CBookDetailScreen} options={{headerShown: false}}/>
    </Stack.Navigator>
  );
};

export default HomeStack;
