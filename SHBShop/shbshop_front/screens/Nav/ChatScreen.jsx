import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;
const BUY_URL = Constants.expoConfig.extra.BUY_URL;

export default function ChatScreen() {
  useEffect(() => {
    console.log("BUY_URL:", BUY_URL);
  }, []);

  if (!BUY_URL) {
    return (
      <View style={styles.container}>
        <Text>BUY_URL이 설정되어 있지 않습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ uri: `${BUY_URL}/book/payment` }}
        style={{ flex: 1 }}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onLoad={() => console.log('WebView loaded')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
