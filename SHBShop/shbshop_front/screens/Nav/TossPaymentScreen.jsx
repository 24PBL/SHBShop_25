import React from 'react';
import { WebView } from 'react-native-webview';
import { Alert, Linking } from 'react-native';

const TossPaymentScreen = ({ route }) => {
  const { paymentData } = route.params;

  const clientKey = "test_ck_XZYkKL4MrjeEAl5Pmy2kV0zJwlEW";  // 실제 키로 교체하세요.

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
              availablePaymentMethods: ["카드"]
            }).catch(function (error) {
              alert("결제 실패: " + error.message);
            });
          })();
        </script>
      </body>
    </html>
  `;

  const onShouldStartLoadWithRequest = (request) => {
    const url = request.url;
    console.log('Request URL:', url);

    // intent:// (앱 열기) URL 처리
    if (url.startsWith('intent://')) {
      const fallbackUrlMatch = url.match(/S.browser_fallback_url=([^;]+)/);
      const fallbackUrl = fallbackUrlMatch ? decodeURIComponent(fallbackUrlMatch[1]) : null;

      // Toss 앱이 있으면 실행, 없으면 fallback URL로 연결
      Linking.openURL(url).catch(() => {
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

    // 기본 URL 처리
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
