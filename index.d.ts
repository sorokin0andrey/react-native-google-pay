type EnvironmentType = number

export type CardNetworkType = "AMEX" | "DISCOVER" | "JCB" | "MASTERCARD"| "VISA"

export interface RequestDataType {
  cardPaymentMethod: {
    tokenizationSpecification: {
      type: string
      gateway: string
      gatewayMerchantId: string
    }
    cardNetworks: CardNetworkType[]
  }
  transaction: {
    totalPrice: string
    totalPriceStatus: string
    currencyCode: string
  }
  merchantName: string
}

declare class GooglePay {
  static ENVIRONMENT_TEST: EnvironmentType
  static ENVIRONMENT_PRODUCTION: EnvironmentType
  static setEnvironment: (environment: EnvironmentType) => void
  static isReadyToPay: (cardNetworks: CardNetworkType[]) => Promise<boolean>
  static requestPayment: (requestData: RequestDataType) => Promise<string>
}

export { GooglePay }