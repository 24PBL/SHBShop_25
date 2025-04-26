import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function AdminWebView() {
  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: 'https://24pbl.github.io/AdminWebView' }} />
    </View>
  );
}
