import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const SellList = ({route}) => {
  const { sellData } = route.params;
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* 여기에 원하는 UI 요소를 추가하세요 */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SellList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
