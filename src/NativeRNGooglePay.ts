import { TurboModuleRegistry, type TurboModule } from 'react-native'

export interface Spec extends TurboModule {
  getConstants(): {
    ENVIRONMENT_TEST: number
    ENVIRONMENT_PRODUCTION: number
  }
  setEnvironment(environment: number): void
  isReadyToPay(request: Object): Promise<boolean>
  requestPayment(request: Object): Promise<Object>
}

export default TurboModuleRegistry.get<Spec>('RNGooglePay')
