import React from 'react';
import { View,Text } from 'react-native';
import { CheckBox } from '@rneui/themed';
import styled from 'styled-components';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function KindFindPW  ({navigation}){
  const [selectedIndex, setIndex] = React.useState(1);

  const goToFindPW = () => {
    navigation.navigate('FindPW1',{
      userType : selectedIndex
    })
  }

const getSelectedText = () => {
  return selectedIndex === 1 
    ? '계정의 유형을 선택해주세요.' 
    : '계정의 유형을 선택해주세요.';
};


  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:'white', alignItems: 'center'}}>
        <Text style={{fontSize:30, fontWeight:'bold', textAlign:'center', paddingTop:80}}>비밀번호 찾기</Text>
      <View style={{justifyContent:'space-between', flexDirection:'row', paddingTop:120, gap:20}}>
        <SignUpTitle onPress={()=>setIndex(1)} activeOpacity={1}><Text style={{color:'white', fontWeight:'bold', fontSize:18}}>개인 회원</Text></SignUpTitle>
        <SignUpTitle onPress={()=>setIndex(2)} activeOpacity={1}><Text style={{color:'white',  fontWeight:'bold', fontSize:18}}>사업자 회원</Text></SignUpTitle>
        </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 140, justifyContent:'space-between'}}>
      <CheckBox
        checked={selectedIndex === 1}
        onPress={() => setIndex(1)}
        checkedIcon="dot-circle-o"
        uncheckedIcon="circle-o"
      />
      <CheckBox
        checked={selectedIndex === 2}
        onPress={() => setIndex(2)}
        checkedIcon="dot-circle-o"
        uncheckedIcon="circle-o"
      />
    </View>
    <Explain><Text style={{textAlign:'center', fontSize:17, fontWeight:'bold'}}>{getSelectedText()}</Text></Explain>
    <Next onPress={goToFindPW}><Text style={{color:'white', fontSize:20, fontWeight:'bold'}}>확인</Text></Next>
    </SafeAreaView>
    </SafeAreaProvider>

  );
};

export const SignUpTitle = styled.TouchableOpacity`
   width : 180px;
   height : 100px;
   background-color : #0071da;
   border-radius : 10px;
   justify-content : center;
   align-items : center;
`;

export const Explain = styled.View`
  width : 90%;
  height : 150px;
  border-width : 0.3px;
  border-radius : 10px;
  justify-content : center;
  `
  export const Next = styled.TouchableOpacity`
  width : 130px;
  height : 70px;
  background-color : #0071da;
  border-radius : 10px;
  justify-content : center;
  align-items : center;
  margin-Top : 40px;
`;