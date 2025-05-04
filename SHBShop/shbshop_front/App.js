import React from 'react';
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
import DeleteID from './screens/DeleteID';
import DeleteID1 from './screens/DeleteID1';
import BookStoreSearch from './screens/Nav/BookStoreSearch';
import cMoreList from './screens/Nav/cMoreList';
import StoreRegister from './screens/Nav/StoreRegister';
import pMoreList from './screens/Nav/pMoreList';
import pBookDetailScreen from './screens/Nav/pBookDetailScreen';
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="StartScreen" component={StartScreen} option={{headershown : false}}/>
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FindID" component={FindID} options={{ headerShown:false}} />
      <Stack.Screen name="KindFindID" component={KindFindID} options={{ headerShown: false }} />
      <Stack.Screen name="KindFindPW" component={KindFindPW} options={{ headerShown: false }} />
      <Stack.Screen name="BusinessSignupScreen" component={BusinessSignupScreen} options={{headerShown:false}}/>
      <Stack.Screen name="FindPW2" component={FindPW2} options={{ headerShown:false}} />
        <Stack.Screen name="FindPW1" component={FindPW1} options={{ headerShown:false}} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown:false}} />
        <Stack.Screen name="SignupCommon" component={SignupCommon} options={{ headerShown:false}} />
        <Stack.Screen name="SignupBusiness" component={SignupBusiness} options={{ headerShown:false}} />        
        <Stack.Screen name="SuccessID" component={SuccessID} options={{ headerShown:false}} />
        
        <Stack.Screen name="Navbar" component={Navbar} options={{headerShown:false}}/>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}}/>
        <Stack.Screen name="DeleteID" component={DeleteID} options={{headerShown:false}}/>
        <Stack.Screen name="DeleteID1" component={DeleteID1} options={{headerShown:false}}/>
        <Stack.Screen name="BookStoreSearch" component={BookStoreSearch} options={{headerShown:false}}/>
        <Stack.Screen name="cMoreList" component={cMoreList} options={{ headerShown:false}} />
        <Stack.Screen name="StoreRegister" component={StoreRegister} options={{ headerShown:false}} />
        <Stack.Screen name="pMoreList" component={pMoreList} options={{ headerShown:false}} />
        <Stack.Screen name="pBookDetailScreen" component={pBookDetailScreen} options={{ headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
