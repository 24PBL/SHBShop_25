import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AddCart = ({navigation}) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor:'white'}}>
        <View style={{flexDirection:'row', alignItems:'center', paddingLeft:20, paddingTop:10}}>
          <TouchableOpacity onPress={()=>navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={23} color="gray" />
        </TouchableOpacity>
        <Text style={styles.Label}>장바구니</Text>
        </View>
        <View style={{height:30}}></View>
        <TouchableOpacity style={styles.bookItem}>
                <View>
                  <Image
                    source={{}}
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                  <Text style={{position:'absolute', bottom:10, backgroundColor:'black', color:'white', fontWeight:'bold', width:60, textAlign:'center'}}>판매완료</Text>
                </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>타이틀</Text>
                    <Text style={{ fontSize: 14, color: '#555', marginTop: 5 }}>xxxx원</Text>
                  </View>
                  <TouchableOpacity style={{position:'absolute', right:10, bottom:20}} onPress={() => {}}>
                    <Ionicons name="trash-outline" size={25}/>
                  </TouchableOpacity>
        </TouchableOpacity>

      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  Label:{
    fontWeight:'bold',
    fontSize:28,
    marginLeft:10,
  },
   bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 10,
    paddingLeft:20,
  },
  bookImage: {
    width: 60,
    height: 90,
    marginRight: 15,
    borderRadius: 5,
    backgroundColor:'gray'
  }
});

export default AddCart;