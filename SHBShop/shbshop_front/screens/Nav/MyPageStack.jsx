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
import PBuyListDetailcreen from './PBuyListDetail';
import StoreBookRegister1 from './StoreBookRegister1';
import SellList from './SellList';
import SellingList from './SellingList'
import SelledList from './SelledList'
import SellListSearch from './SellListSearch';
import SellDetail from './SellDetail';
import EditSellDetail from './EditSellDetail';
import MySellBook from './MySellBook';
import MyBookSearchScreen from './MyBookSearchScreen';
import MySellBook1 from './MySellBook1';
import MySelledList from './MySelledList'
import AdjustmentList from './AdjustmentList';
import AdjustmentDetail from './AdjustmentDetail';
import StoreSelledList from './StoreSelledList';
import ShopAdjustmentList from './ShopAdjustmentList';
import ShopAdjustmentDetail from './ShopAdjustmentDetail';
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
      <Stack.Screen name="PBuyListDetail" component={PBuyListDetailcreen} options={{ headerShown: false }} />
      <Stack.Screen name="StoreBookRegister1" component={StoreBookRegister1} options={{ headerShown: false }} />
      <Stack.Screen name="SellList" component={SellList} options={{ headerShown: false }} />
      <Stack.Screen name="SellingList" component={SellingList} options={{ headerShown: false }} />
      <Stack.Screen name="SelledList" component={SelledList} options={{ headerShown: false }} />
      <Stack.Screen name='SellListSearch' component={SellListSearch} options={{headerShown: false}}/>
      <Stack.Screen name='SellDetail' component={SellDetail} options={{headerShown: false}}/>
      <Stack.Screen name='EditSellDetail' component={EditSellDetail} options={{headerShown: false}}/>
      <Stack.Screen name="MySellBook" component={MySellBook} options={{ headerShown:false }} />
      <Stack.Screen name="MyBookSearch" component={MyBookSearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MySellBook1" component={MySellBook1} options={{ headerShown: false }} />
      <Stack.Screen name="MySelledList" component={MySelledList} options={{ headerShown: false }} />
      <Stack.Screen name="AdjustmentList" component={AdjustmentList} options={{ headerShown: false }} />
      <Stack.Screen name="AdjustmentDetail" component={AdjustmentDetail} options={{ headerShown: false }} />
      <Stack.Screen name="StoreSelledList" component={StoreSelledList} options={{ headerShown: false }} />
      <Stack.Screen name="ShopAdjustmentList" component={ShopAdjustmentList} options={{ headerShown: false }} />
      <Stack.Screen name="ShopAdjustmentDetail" component={ShopAdjustmentDetail} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
};

export default MyPageStack;
