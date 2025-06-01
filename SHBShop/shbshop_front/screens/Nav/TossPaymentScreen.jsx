import React from 'react';
import { Linking, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const TossPaymentScreen = ({ route }) => {
  const { paymentData } = route.params;

  const clientKey = "test_ck_ORzdMaqN3wxJoKBA2kGDV5AkYXQG"; // 실제 키로 교체하세요

  const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <script src="https://js.tosspayments.com/v1/payment"></script>
      </head>
      <body>
        <script>
          (function () {
            const tossPayments = TossPayments("${clientKey}");

            tossPayments.requestPayment("카드", {
              amount: ${paymentData.amount},
              orderId: "${paymentData.orderId}",
              orderName: "${paymentData.orderName}",
              customerName: "${paymentData.customerName}",
              successUrl: "${paymentData.successUrl}",
              failUrl: "${paymentData.failUrl}",
              availablePaymentMethods: ["카드", "계좌이체"]
            }).catch(function (error) {
              alert("결제 실패: " + error.message);
            });
          })();
        </script>
      </body>
    </html>
  `;

  const onShouldStartLoadWithRequest = (request) => {
  console.log('Request URL:', request.url);
  const url = request.url;

  if (url.startsWith('http') || url.startsWith('https')) {
    return true;
  }

  if (url.startsWith('intent://')) {
    // Android intent scheme 처리
    const fallbackUrlMatch = url.match(/S.browser_fallback_url=([^;]+)/);
    const fallbackUrl = fallbackUrlMatch ? decodeURIComponent(fallbackUrlMatch[1]) : null;

    Linking.openURL(url)
      .catch(() => {
        if (fallbackUrl) {
          Linking.openURL(fallbackUrl).catch(() => {
            Alert.alert('알림', '앱이 설치되어 있지 않거나 링크를 열 수 없습니다.');
          });
        } else {
          Alert.alert('알림', '지원하지 않는 intent 스킴입니다.');
        }
      });

    return false;
  }

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('알림', `지원하지 않는 URL 스킴입니다: ${url}`);
      }
    })
    .catch(console.error);

  return false;
};


  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
      onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      startInLoadingState
    />
  );
};

export default TossPaymentScreen;
