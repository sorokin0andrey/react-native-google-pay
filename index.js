import { Platform } from 'react-native'
import NativeRNGooglePay from './src/NativeRNGooglePay'

const ENVIRONMENT_TEST = 3
const ENVIRONMENT_PRODUCTION = 1

const BASE_REQUEST = {
  apiVersion: 2,
  apiVersionMinor: 0,
}

const unsupported = () => {
  throw new Error('Google Pay is available on Android only')
}

const unsupportedGooglePay = {
  ENVIRONMENT_TEST,
  ENVIRONMENT_PRODUCTION,
  BaseRequest: BASE_REQUEST,
  setEnvironment: unsupported,
  isReadyToPay: unsupported,
  requestPayment: unsupported,
}

function createGooglePay() {
  if (Platform.OS !== 'android' || NativeRNGooglePay == null) {
    return unsupportedGooglePay
  }

  const constants = NativeRNGooglePay.getConstants()

  return {
    ENVIRONMENT_TEST: constants.ENVIRONMENT_TEST,
    ENVIRONMENT_PRODUCTION: constants.ENVIRONMENT_PRODUCTION,
    BaseRequest: BASE_REQUEST,
    setEnvironment(environment) {
      NativeRNGooglePay.setEnvironment(environment)
    },
    isReadyToPay(request) {
      return NativeRNGooglePay.isReadyToPay(request)
    },
    requestPayment(request) {
      return NativeRNGooglePay.requestPayment(request)
    },
  }
}

export const GooglePay = createGooglePay()
