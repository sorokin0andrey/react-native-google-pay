import React, { useEffect } from 'react'
import { Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GooglePay } from 'react-native-google-pay'

const merchantInfo: google.payments.api.MerchantInfo = {
  merchantId: 'Example Merchant',
  merchantName: 'Example Merchant',
}

const transactionInfo: google.payments.api.TransactionInfo = {
  totalPrice: '9.99',
  totalPriceStatus: 'FINAL',
  currencyCode: 'USD',
}

function paymentRequest(
  tokenizationSpecification: google.payments.api.PaymentMethodTokenizationSpecification,
): google.payments.api.PaymentDataRequest {
  return {
    ...GooglePay.BaseRequest,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD'],
        },
        tokenizationSpecification,
      },
    ],
    merchantInfo,
    transactionInfo,
  }
}

const gatewayRequestData = paymentRequest({
  type: 'PAYMENT_GATEWAY',
  parameters: {
    gateway: 'example',
    gatewayMerchantId: 'exampleGatewayMerchantId',
  },
})

const directRequestData = paymentRequest({
  type: 'DIRECT',
  parameters: {
    protocolVersion: 'ECv2',
    publicKey: 'BOdoXP+9Aq473SnGwg3JU1aiNpsd9vH2ognq4PtDtlLGa3Kj8TPf+jaQNPyDSkh3JUhiS0KyrrlWhAgNZKHYF2Y=',
  },
})

const stripeRequestData = paymentRequest({
  type: 'PAYMENT_GATEWAY',
  parameters: {
    gateway: 'stripe',
    gatewayMerchantId: '',
    'stripe:publishableKey': 'pk_test_TYooMQauvdEDq54NiTphI7jx',
    'stripe:version': '2018-11-08',
  },
})

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      GooglePay.setEnvironment(GooglePay.ENVIRONMENT_TEST)
    }
  }, [])

  const payWithGooglePay = (requestData: google.payments.api.PaymentDataRequest) => {
    const readyRequest: google.payments.api.IsReadyToPayRequest = {
      ...GooglePay.BaseRequest,
      allowedPaymentMethods: requestData.allowedPaymentMethods,
    }
    GooglePay.isReadyToPay(readyRequest)
      .then(ready => {
        if (ready) {
          GooglePay.requestPayment(requestData).then(handleSuccess).catch(handleError)
        } else {
          Alert.alert('Google Pay', 'Google Pay is not available')
        }
      })
      .catch(handleError)
  }

  const handleSuccess = (paymentData: google.payments.api.PaymentData) => {
    Alert.alert('Success', paymentData.paymentMethodData.tokenizationData.token)
  }

  const handleError = (error: { code?: string; message?: string }) => {
    Alert.alert('Error', `${error.code}\n${error.message}`)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.welcome}>Welcome to react-native-google-pay!</Text>
      <TouchableOpacity style={styles.button} onPress={() => payWithGooglePay(gatewayRequestData)}>
        <Text style={styles.buttonText}>PAYMENT_GATEWAY</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.direct]} onPress={() => payWithGooglePay(directRequestData)}>
        <Text style={styles.buttonText}>DIRECT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.stripe]} onPress={() => payWithGooglePay(stripeRequestData)}>
        <Text style={styles.buttonText}>Stripe</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  welcome: {
    fontSize: 18,
    color: '#f2f2f2',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginVertical: 8,
  },
  direct: {
    backgroundColor: '#db7d35',
  },
  stripe: {
    backgroundColor: '#556cd6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
})
