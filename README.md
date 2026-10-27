# react-native-google-pay

[![react-native version](https://img.shields.io/badge/react--native-%3E%3D0.76-0ba7d3.svg?style=flat-square)](https://github.com/facebook/react-native/releases/tag/v0.76.0)
![npm](https://img.shields.io/npm/dw/react-native-google-pay.svg?style=flat-square)
[![npm (tag)](https://img.shields.io/npm/v/react-native-google-pay/latest.svg?style=flat-square)](https://github.com/sorokin0andrey/react-native-google-pay)

Accept payments with Google Pay in React Native apps. The Android implementation is a [Turbo Module](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules) written in Kotlin.

<div>
<video width="280" src="preview.mp4" autoplay loop muted playsinline></video>
</div>

## Requirements

- React Native `>= 0.76` with the New Architecture enabled. React Native 0.82 and newer are New Architecture only.
- `minSdkVersion` from your React Native app. Google Pay requires 23 or higher; React Native 0.88 uses 24.
- Google Play services on the device.

Google Pay is Android-only. On other platforms `setEnvironment`, `isReadyToPay`, and `requestPayment` throw `Google Pay is available on Android only`. `ENVIRONMENT_TEST` is `3` and `ENVIRONMENT_PRODUCTION` is `1` on every platform.

## Installation

```sh
yarn add react-native-google-pay
```

Autolinking picks up the Android Turbo Module. iOS is intentionally not linked.

Add the Google Pay API meta-data element to the `<application>` element of your app's `AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
```

## Usage

```javascript
import { GooglePay } from 'react-native-google-pay';

const request = {
  ...GooglePay.BaseRequest,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['VISA', 'MASTERCARD'],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'example',
          gatewayMerchantId: 'exampleGatewayMerchantId',
        },
      },
    },
  ],
  merchantInfo: {
    merchantId: 'Example Merchant',
    merchantName: 'Example Merchant',
  },
  transactionInfo: {
    totalPrice: '9.99',
    totalPriceStatus: 'FINAL',
    currencyCode: 'USD',
  },
};

GooglePay.setEnvironment(GooglePay.ENVIRONMENT_TEST);

GooglePay.isReadyToPay({
  ...GooglePay.BaseRequest,
  allowedPaymentMethods: request.allowedPaymentMethods,
}).then(ready => {
  if (ready) {
    GooglePay.requestPayment(request)
      .then(paymentData => {
        const token = paymentData.paymentMethodData.tokenizationData.token;
        // Send the token to your payment gateway.
      })
      .catch(error => console.log(error.code, error.message));
  }
});
```

Requests use the [Google Pay API objects](https://developers.google.com/pay/api/android/reference/request-objects). TypeScript types come from `@types/googlepay`, which this package depends on. `GooglePay.BaseRequest` is `{ apiVersion: 2, apiVersionMinor: 0 }`.

`requestPayment` resolves with a `PaymentData` object. The payment token is `paymentMethodData.tokenizationData.token`. The promise rejects when the payer closes the sheet (`PAYMENT_RESULT_CANCELED`) or when Google Pay returns an error (`PAYMENT_RESULT_ERROR`). `isReadyToPay` resolves `true` or `false`. It rejects `NO_ACTIVITY` when the Android activity is missing, `NO_PAYMENTS_CLIENT` when `setEnvironment` has not run, and `IS_READY_TO_PAY_REQUEST` when the request JSON is invalid.

For a gateway integration, set `tokenizationSpecification.parameters.gateway` and `gatewayMerchantId`. Stripe uses the same `PAYMENT_GATEWAY` type with string parameters `stripe:publishableKey` and `stripe:version`. For `type: 'DIRECT'`, set `protocolVersion` to `ECv2` and `publicKey`. The Example app calls all three.

## Example

The `Example` app is a React Native 0.88 project:

```sh
npm install
npm --prefix Example install
npm --prefix Example run android
```

The demo uses `GooglePay.ENVIRONMENT_TEST`.
