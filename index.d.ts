type EnvironmentType = number

export type AllowedCardNetworkType = "AMEX" | "DISCOVER" | "JCB" | "MASTERCARD"| "VISA"

export type AllowedCardAuthMethodsType = "PAN_ONLY" | "CRYPTOGRAM_3DS"

export interface RequestDataType {
  cardPaymentMethod: {
    tokenizationSpecification: {
      type: string
      gateway: string
      gatewayMerchantId: string
      stripe?: {
        publishableKey: string
        version: string
      }
    }
    allowedCardNetworks: AllowedCardNetworkType[]
    allowedCardAuthMethods: AllowedCardAuthMethodsType[]
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
  static isReadyToPay: (allowedCardNetworks: AllowedCardNetworkType[], allowedCardAuthMethods: AllowedCardAuthMethodsType[]) => Promise<boolean>
  static requestPayment: (requestData: RequestDataType) => Promise<string>
}

export { GooglePay }