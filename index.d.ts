type EnvironmentType = number

export type AllowedCardNetworkType = 'AMEX' | 'DISCOVER' | 'JCB' | 'MASTERCARD' | 'VISA'

export type AllowedCardAuthMethodsType = 'PAN_ONLY' | 'CRYPTOGRAM_3DS'

export type tokenizationSpecificationType = 'PAYMENT_GATEWAY' | 'DIRECT'

export interface RequestDataType {
  cardPaymentMethod: {
    allowCreditCards?: boolean
    allowPrepaidCards?: boolean
    allowedCardAuthMethods: AllowedCardAuthMethodsType[]
    allowedCardNetworks: AllowedCardNetworkType[]
    assuranceDetailsRequired?: boolean
    tokenizationSpecification: {
      type: tokenizationSpecificationType
      /** only with type: PAYMENT_GATEWAY */
      gateway?: string
      gatewayMerchantId?: string
      /** only with gateway: stripe */
      stripe?: {
        publishableKey: string
        version: string
      }
      /** only with type: DIRECT */
      publicKey?: string
    }
  }
  merchantName: string
  transaction: {
    checkoutOption: string
    countryCode: string
    currencyCode?: string
    totalPrice: string
    totalPriceLabel: string
    totalPriceStatus?: string
    transactionId: string
  }
}

declare class GooglePay {
  static ENVIRONMENT_TEST: EnvironmentType
  static ENVIRONMENT_PRODUCTION: EnvironmentType
  static isReadyToPay: (
    allowedCardNetworks: AllowedCardNetworkType[],
    allowedCardAuthMethods: AllowedCardAuthMethodsType[]
  ) => Promise<boolean>
  static setEnvironment: (environment: EnvironmentType) => void
  static requestPayment: (requestData: RequestDataType) => Promise<string>
}

export { GooglePay }
