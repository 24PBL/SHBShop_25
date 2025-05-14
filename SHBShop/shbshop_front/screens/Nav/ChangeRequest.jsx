import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Button, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from "react-native-webview";

const ChangeRequest = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>사업자 회원가입</Text>
            <Text style={styles.subtitle}>사업자 정보</Text>

            {/* 입력 필드 형식 */}
            {['사업자명', '대표자명', '사업자 등록번호', '사업자 대표번호', '사업자 전자우편'].map((placeholder, idx) => (
              <TextInput
                key={idx}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#aaa"
              />
            ))}

            {/* 주소 입력 형식 */}
            <View>
              <Text style={styles.addressField}>우편번호</Text>
              <TouchableOpacity style={styles.AddressStyle} activeOpacity={1}>
                <Text style={styles.addressButtonText}>우편번호 찾기</Text>
              </TouchableOpacity>
              <Text style={styles.addressField}>주소</Text>
              <View style={{ margin: 5 }}></View>
              <TextInput
                placeholder="상세주소"
                style={styles.detailAddressInput}
              />
              <Modal visible={false} animationType="slide">
                <WebView source={{ uri: "https://24pbl.github.io/react-native-daum-postcode/" }} />
                <Button title="닫기" onPress={() => {}} />
              </Modal>
            </View>

            {/* 파일 첨부 형식 */}
            <Text style={styles.subtitle}>사업자등록증</Text>
            <View style={styles.fileContainer}>
              <TouchableOpacity style={styles.filePickerButton}>
                <Ionicons name="document-attach-outline" size={35} color="#aaa" />
              </TouchableOpacity>
            </View>

            {/* 제출 버튼 */}
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>수정 요청</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 35,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 50,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#727272',
    fontWeight: 'bold',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginLeft: 50,
    width: 270,
    height: 55,
    fontSize: 17,
  },
  addressField: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 17,
    borderWidth: 1,
    padding: 10,
    width: 270,
    borderRadius: 10,
    height: 55,
    textAlignVertical: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  detailAddressInput: {
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    width: 270,
    borderRadius: 10,
    height: 55,
    fontSize: 17,
    alignSelf: 'center',
  },
  AddressStyle: {
    width: 270,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#0091da',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 50,
  },
  addressButtonText: {
    fontSize: 17,
    color: 'white',
    fontWeight: 'bold',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    marginLeft: 50,
    width: 270,
    height: 55,
    justifyContent: 'space-between',
  },
  filePickerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  note: {
    fontSize: 12,
    color: '#777',
    marginTop: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    marginLeft: 50,
  },
  submitButton: {
    backgroundColor: '#0091DA',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 50,
    width: 270,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChangeRequest;
