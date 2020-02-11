import { NativeModules, Platform } from 'react-native'

const { RNGooglePay } = NativeModules

const throwError = () => {
  throw new Error(`Google Pay is for Android only, use Platform.OS === 'android'`)
}

const mockIOS = {
  ENVIRONMENT_TEST: 0,
  ENVIRONMENT_PRODUCTION: 0,
  setEnvironment: throwError,
  isReadyToPay: throwError,
  requestPayment: throwError,
}

const GooglePay = Platform.OS === 'android' ? RNGooglePay : mockIOS

export { GooglePay }
