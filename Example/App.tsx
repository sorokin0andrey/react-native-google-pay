import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native'
import { GooglePay, RequestDataType, CardNetworkType } from 'react-native-google-pay'

const cardNetworks: CardNetworkType[] = ['VISA', 'MASTERCARD']

const requestData: RequestDataType = {
  cardPaymentMethod: {
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      gateway: 'example',
      gatewayMerchantId: 'exampleGatewayMerchantId',
    },
    cardNetworks,
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

  payWithGooglePay = () => {
    // Check if Google Pay is available
    GooglePay.isReadyToPay(cardNetworks)
      .then(() => {
        // Request payment token
        GooglePay.requestPayment(requestData)
          .then(this.handleSuccess)
          .catch(this.handleError)
      })
      .catch(this.handleError)
  }

  handleSuccess = (token: string) => {
    // Send a token to your payment gateway
    Alert.alert('Success', `token: ${token}`)
  }

  handleError = (error: any) => Alert.alert('isReadyToPay', `${error.code}\n${error.message}`)

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to react-native-google-pay!</Text>
        <TouchableOpacity style={styles.button} onPress={this.payWithGooglePay}>
          <Text style={styles.buttonText}>Buy with Google Pay</Text>
        </TouchableOpacity>
      </View>
    );
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
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#34a853',
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});
