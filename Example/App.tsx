import React, { Component, ReactNode } from 'react'
import { Platform, Alert, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { GooglePay, RequestDataType, AllowedCardNetworkType, AllowedCardAuthMethodsType } from 'react-native-google-pay'

const allowedCardNetworks: AllowedCardNetworkType[] = ['VISA', 'MASTERCARD']
const allowedCardAuthMethods: AllowedCardAuthMethodsType[] = ['PAN_ONLY', 'CRYPTOGRAM_3DS']

const gatewayRequestData: RequestDataType = {
  cardPaymentMethod: {
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      gateway: 'example',
      gatewayMerchantId: 'exampleGatewayMerchantId',
    },
    allowedCardNetworks,
    allowedCardAuthMethods,
  },
  transaction: {
    totalPrice: '123',
    totalPriceStatus: 'FINAL',
    currencyCode: 'RUB',
  },
  merchantName: 'Example Merchant',
}

const directRequestData: RequestDataType = {
  cardPaymentMethod: {
    tokenizationSpecification: {
      type: 'DIRECT',
      publicKey: 'BOdoXP+9Aq473SnGwg3JU1aiNpsd9vH2ognq4PtDtlLGa3Kj8TPf+jaQNPyDSkh3JUhiS0KyrrlWhAgNZKHYF2Y=',
    },
    allowedCardNetworks,
    allowedCardAuthMethods,
  },
  transaction: {
    totalPrice: '123',
    totalPriceStatus: 'FINAL',
    currencyCode: 'RUB',
  },
  merchantName: 'Example Merchant',
}

const stripeRequestData: RequestDataType = {
  cardPaymentMethod: {
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      gateway: 'stripe',
      gatewayMerchantId: '',
      stripe: {
        publishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
        version: '2018-11-08',
      },
    },
    allowedCardNetworks,
    allowedCardAuthMethods,
  },
  transaction: {
    totalPrice: '123',
    totalPriceStatus: 'FINAL',
    currencyCode: 'RUB',
  },
  merchantName: 'Example Merchant',
}

export default class App extends Component {
  componentDidMount() {
    // Set the environment before the payment request
    if (Platform.OS === 'android') {
      GooglePay.setEnvironment(GooglePay.ENVIRONMENT_TEST)
    }
  }

  payWithGooglePay = (requestData: RequestDataType) => {
    // Check if Google Pay is available
    GooglePay.isReadyToPay(allowedCardNetworks, allowedCardAuthMethods).then((ready) => {
      if (ready) {
        // Request payment token
        GooglePay.requestPayment(requestData)
          .then(this.handleSuccess)
          .catch(this.handleError)
      }
    })
  }

  handleSuccess = (token: string) => {
    // Send a token to your payment gateway
    Alert.alert('Success', `token: ${token}`)
  }

  handleError = (error: any) => Alert.alert('Error', `${error.code}\n${error.message}`)

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to react-native-google-pay!</Text>
        <TouchableOpacity style={styles.button} onPress={() => this.payWithGooglePay(gatewayRequestData)}>
          <Text style={styles.buttonText}>PAYMENT_GATEWAY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.direct]}
          onPress={() => this.payWithGooglePay(directRequestData)}
        >
          <Text style={styles.buttonText}>DIRECT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.stripe]}
          onPress={() => this.payWithGooglePay(stripeRequestData)}
        >
          <Text style={styles.buttonText}>Stripe</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  welcome: {
    fontSize: 18,
    color: '#222',
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
