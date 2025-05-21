// screens/Nav/HomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyPageScreen from './MyPageScreen'
import Approve from './Approve';
import AddCart from './AddCart';
import CommonPWConfirm from './CommonPWConfirm';
import EditProfileScreen from './EditProfileScreen';
import ChangePWScreen from './ChangePWScreen';
import BuyList from './BuyList';
import ManageStore from './ManageStore';
import ExcelUploadScreen from './ExcelUploadScreen';
import StoreBookRegister from './StoreBookRegister';
import ChangeStoreInfo from './ChangeStoreInfo'
import ChangeShopAddress from './ChangeShopAddress';
import StoreInventoryView from './StoreInventoryView';
import BookDetailScreen from './BookDetailScreen';
import ISBNBookListScreen from './ISBNBookListScreen';
import CBookSearchScreen from './CBookSearchScreen';
import EditBookDetail from './EditBookDetail';
import ReserveList from './ReserveList'
import ReserveDetail from './ReserverDetail';
const Stack = createNativeStackNavigator();

const MyPageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyPageScreen" component={MyPageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Approve" component={Approve} options={{ headerShown: false }} />
      <Stack.Screen name="AddCart" component={AddCart} options={{ headerShown: false }} />
      <Stack.Screen name="CommonPWConfirm" component={CommonPWConfirm} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePWScreen" component={ChangePWScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BuyList" component={BuyList} options={{ headerShown: false }} />
      <Stack.Screen name="ManageStore" component={ManageStore} options={{ headerShown: false }} />
      <Stack.Screen name="ExcelUploadScreen" component={ExcelUploadScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StoreBookRegister" component={StoreBookRegister} options={{ headerShown: false }} />
      <Stack.Screen name="ChangeStoreInfo" component={ChangeStoreInfo} options={{ headerShown: false }} />
      <Stack.Screen name="ChangeShopAddress" component={ChangeShopAddress} options={{ headerShown: false }} />
      <Stack.Screen name="StoreInventoryView" component={StoreInventoryView} options={{ headerShown: false }} />
      <Stack.Screen name="BookDetailScreen" component={BookDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ISBNBookListScreen" component={ISBNBookListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CBookSearchScreen" component={CBookSearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditBookDetail" component={EditBookDetail} options={{ headerShown: false }} />
      <Stack.Screen name="ReserveList" component={ReserveList} options={{ headerShown: false }} />
      <Stack.Screen name="ReserveDetail" component={ReserveDetail} options={{ headerShown: false }} />


    </Stack.Navigator>
  );
};

export default MyPageStack;
