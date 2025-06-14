import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 화면 컴포넌트들
import LoginScreen from './screens/LoginScreen';

import SignupScreen from './screens/Signup/SignupScreen';
import SignupCommon from './screens/Signup/SignupCommon';
import SignupBusiness from './screens/Signup/SignupBusiness';
import BusinessSignupScreen from './screens/Signup/BusinessSignupScreen';

import FindID from './screens/Find/FindID';
import FindPW1 from './screens/Find/FindPW1';
import FindPW2 from './screens/Find/FindPW2';
import SuccessID from './screens/Find/SuccessID';
import KindFindID from './screens/Find/KindFindID';
import KindFindPW from './screens/Find/KindFindPW';

import HomeScreen from './screens/Home';
import StartScreen from './screens/StartScreen';

import Navbar from './screens/Nav/Navbar';
import DeleteID from './screens/Nav/DeleteID';
import DeleteID1 from './screens/Nav/DeleteID1';
import BookStoreSearch from './screens/Nav/BookStoreSearch';
import CMoreList from './screens/Nav/CMoreList';
import StoreRegister from './screens/Nav/StoreRegister';
import PMoreList from './screens/Nav/PMoreList';
import PBookDetailScreen from './screens/Nav/PBookDetailScreen';
import CBookDetailScreen from './screens/Nav/CBookDetailScreen';
import ReRegister from './screens/Nav/ReRegister';
import TossPaymentScreen from './screens/Nav/TossPaymentScreen';
import ChatRoomScreen from './screens/Nav/ChatRoomScreen'

const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useRef();

  useEffect(() => {
    // 앱 실행 시 처음 열릴 때 URL 확인
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    });

    // 앱이 실행 중일 때 URL 이벤트 리스너 등록
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleUrl = (url) => {
    console.log('앱이 열림 URL:', url);
   
    if (url === 'myapp://payment-success') {
      navigationRef.current?.navigate('Navbar');
    }
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name="StartScreen" component={StartScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FindID" component={FindID} options={{ headerShown: false }} />
        <Stack.Screen name="KindFindID" component={KindFindID} options={{ headerShown: false }} />
        <Stack.Screen name="KindFindPW" component={KindFindPW} options={{ headerShown: false }} />
        <Stack.Screen name="BusinessSignupScreen" component={BusinessSignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FindPW2" component={FindPW2} options={{ headerShown: false }} />
        <Stack.Screen name="FindPW1" component={FindPW1} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignupCommon" component={SignupCommon} options={{ headerShown: false }} />
        <Stack.Screen name="SignupBusiness" component={SignupBusiness} options={{ headerShown: false }} />
        <Stack.Screen name="SuccessID" component={SuccessID} options={{ headerShown: false }} />
        <Stack.Screen name="Navbar" component={Navbar} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DeleteID" component={DeleteID} options={{ headerShown: false }} />
        <Stack.Screen name="DeleteID1" component={DeleteID1} options={{ headerShown: false }} />
        <Stack.Screen name="BookStoreSearch" component={BookStoreSearch} options={{ headerShown: false }} />
        <Stack.Screen name="CMoreList" component={CMoreList} options={{ headerShown: false }} />
        <Stack.Screen name="StoreRegister" component={StoreRegister} options={{ headerShown: false }} />
        <Stack.Screen name="PMoreList" component={PMoreList} options={{ headerShown: false }} />
        <Stack.Screen name="PBookDetailScreen" component={PBookDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CBookDetailScreen" component={CBookDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReRegister" component={ReRegister} options={{ headerShown: false }} />
        <Stack.Screen name="TossPaymentScreen" component={TossPaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatRoomScreen" component={ChatRoomScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
