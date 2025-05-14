import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const ExcelUploadScreen = ({navigation}) => {
  const [file, setFile] = useState(null);

  const pickExcelFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        const extension = result.name.split('.').pop().toLowerCase();
        if (extension !== 'xlsx' && extension !== 'xls') {
          Alert.alert('오류', '엑셀 파일만 선택 가능합니다.');
          return;
        }

        setFile(result);
        console.log('선택된 파일:', result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaProvider>
        <SafeAreaView>
          <View style={{flexDirection:'row', alignItems:'center', paddingLeft:20, paddingTop:10}}>
            <TouchableOpacity>
            <Ionicons name="chevron-back-outline" size={28} onPress={() => navigation.goBack()} />
          </TouchableOpacity>
            <Text style={styles.title}>매장 재고 일괄 등록</Text>
          </View>
          

      <TouchableOpacity style={styles.uploadButton} onPress={pickExcelFile}>
        <Ionicons name="add-circle-outline" size={50} color="#4a90e2"/>
      </TouchableOpacity>
    
    <Text style={{paddingLeft:20, paddingTop:5, color:"#0091da"}}> - 엑셀 파일을 등록해 주세요 - </Text>

      {file && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{file.name}</Text>
          <Text style={styles.fileSize}>크기: {(file.size / 1024).toFixed(2)} KB</Text>
        </View>
      )}

      <TouchableOpacity style={{backgroundColor:"#0091da", width:'80%', height:40, borderRadius:10,
        justifyContent:'center', alignItems:'center',
        alignSelf:'center',
        marginTop:550}}>
        <Text style={{fontWeight:'bold', color:'white'}}>
            등록
        </Text>
      </TouchableOpacity>
        </SafeAreaView>
    </SafeAreaProvider>
 
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft:10
  },
  uploadButton: {
    marginLeft:40,
    marginTop:20
  },
  fileInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    marginBottom: 5,
  },
  fileSize: {
    color: 'gray',
  },
});

export default ExcelUploadScreen;