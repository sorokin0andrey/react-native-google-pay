/// <reference types="googlepay" />

declare class GooglePay {
  static ENVIRONMENT_TEST: number
  static ENVIRONMENT_PRODUCTION: number
  static readonly BaseRequest: {
    apiVersion: 2
    apiVersionMinor: 0
  }
  static setEnvironment: (environment: number) => void
  static isReadyToPay: (
    request: google.payments.api.IsReadyToPayRequest
  ) => Promise<boolean>
  static requestPayment: (
    request: google.payments.api.PaymentDataRequest
  ) => Promise<google.payments.api.PaymentData>
}

export { GooglePay }
