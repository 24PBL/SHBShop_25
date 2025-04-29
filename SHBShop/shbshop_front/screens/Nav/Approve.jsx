import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Approve = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
    <View style={styles.container}>
      <Text style={{fontSize:28,fontWeight:'bold', paddingLeft:15, paddingTop:10}}>사업자 승인</Text>
      <ScrollView>
        <TouchableOpacity style={{paddingTop:20}}>
          <View style={{flexDirection:'row'}}>
          <Text style={{fontSize:20, fontWeight:'bold', marginRight:20, paddingLeft:20}}>20XX.XX.XX</Text>
        <Text style={{fontSize:20, fontWeight:'bold'}}>결과 : <Text style={{color:'gray'}}>심사중</Text></Text>
        </View>
        <View style={{height:1, width:'90%', borderWidth:1, left:20, borderColor:'rgba(0,0,0,0.05)', marginTop:20}}></View>
        </TouchableOpacity>

        <TouchableOpacity style={{paddingTop:20}}>
          <View style={{flexDirection:'row'}}>
          <Text style={{fontSize:20, fontWeight:'bold', marginRight:20, paddingLeft:20}}>20XX.XX.XX</Text>
        <Text style={{fontSize:20, fontWeight:'bold'}}>결과 : <Text style={{color:'blue'}}>통과</Text></Text>
        </View>
        <View style={{height:1, width:'90%', borderWidth:1, left:20, borderColor:'rgba(0,0,0,0.05)', marginTop:20}}></View>
        </TouchableOpacity>

        <TouchableOpacity style={{paddingTop:20}}>
          <View style={{flexDirection:'row'}}>
          <Text style={{fontSize:20, fontWeight:'bold', marginRight:20, paddingLeft:20}}>20XX.XX.XX</Text>
        <Text style={{fontSize:20, fontWeight:'bold'}}>결과 : <Text style={{color:'red'}}>탈락</Text></Text>
        </View>
        <View style={{height:1, width:'90%', borderWidth:1, left:20, borderColor:'rgba(0,0,0,0.05)', marginTop:20}}></View>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  
});

export default Approve;