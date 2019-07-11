package com.busfor;

import android.app.Activity;
import com.google.android.gms.wallet.PaymentsClient;
import com.google.android.gms.wallet.Wallet;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.ArrayList;

import com.facebook.react.bridge.ReadableMap;

public class PaymentsUtil {

  private PaymentsUtil() {}

  private static JSONObject getBaseRequest() throws JSONException {
    return new JSONObject().put("apiVersion", 2).put("apiVersionMinor", 0);
  }

  private static JSONObject getBaseCardPaymentMethod(ArrayList allowedCardNetworks, ArrayList allowedCardAuthMethods) throws JSONException {
    JSONObject cardPaymentMethod = new JSONObject();
    cardPaymentMethod.put("type", "CARD");

    JSONObject parameters = new JSONObject();
    parameters.put("allowedAuthMethods", new JSONArray(allowedCardAuthMethods));
    parameters.put("allowedCardNetworks", new JSONArray(allowedCardNetworks));

    cardPaymentMethod.put("parameters", parameters);

    return cardPaymentMethod;
  }

  public static PaymentsClient createPaymentsClient(int environment, Activity activity) {
    Wallet.WalletOptions walletOptions = new Wallet.WalletOptions.Builder().setEnvironment(environment).build();
    return Wallet.getPaymentsClient(activity, walletOptions);
  }

  public static JSONObject getIsReadyToPayRequest(ArrayList allowedCardNetworks, ArrayList allowedCardAuthMethods) {
    try {
      JSONObject isReadyToPayRequest = getBaseRequest();
      JSONArray allowedPaymentMethods = new JSONArray().put(getBaseCardPaymentMethod(allowedCardNetworks, allowedCardAuthMethods));
      isReadyToPayRequest.put("allowedPaymentMethods", allowedPaymentMethods);
      return isReadyToPayRequest;
    } catch (JSONException e) {
      return null;
    }
  }

  private static JSONObject getTransactionInfo(ReadableMap transaction) throws JSONException {
    JSONObject transactionInfo = new JSONObject();
    transactionInfo.put("totalPrice", transaction.getString("totalPrice"));
    transactionInfo.put("totalPriceStatus", transaction.getString("totalPriceStatus"));
    transactionInfo.put("currencyCode", transaction.getString("currencyCode"));

    return transactionInfo;
  }

  private static JSONObject getMerchantInfo(String merchantName) throws JSONException {
    return new JSONObject().put("merchantName", merchantName);
  }

  private static JSONObject getGatewayTokenizationSpecification(final ReadableMap tokenizationSpecification) throws JSONException {
    return new JSONObject(){{
      put("type", tokenizationSpecification.getString("type"));
      put("parameters", new JSONObject(){{
        put("gateway", tokenizationSpecification.getString("gateway"));
        put("gatewayMerchantId", tokenizationSpecification.getString("gatewayMerchantId"));
        if (tokenizationSpecification.hasKey("stripe")) {
          put("stripe:publishableKey", tokenizationSpecification.getMap("stripe").getString("publishableKey"));
          put("stripe:version", tokenizationSpecification.getMap("stripe").getString("version"));
        }
        }
      });
    }};
  }
  
  private static JSONObject getCardPaymentMethod(ReadableMap cardPaymentMethodData) throws JSONException {
    ArrayList allowedCardNetworks = cardPaymentMethodData.getArray("allowedCardNetworks").toArrayList();
    ArrayList allowedCardAuthMethods = cardPaymentMethodData.getArray("allowedCardAuthMethods").toArrayList();
    JSONObject cardPaymentMethod = getBaseCardPaymentMethod(allowedCardNetworks, allowedCardAuthMethods);
    cardPaymentMethod.put("tokenizationSpecification", getGatewayTokenizationSpecification(cardPaymentMethodData.getMap("tokenizationSpecification")));

    return cardPaymentMethod;
  }

  public static JSONObject getPaymentDataRequest(ReadableMap requestData) {
    try {
      JSONObject paymentDataRequest = PaymentsUtil.getBaseRequest();
      paymentDataRequest.put(
          "allowedPaymentMethods", new JSONArray().put(PaymentsUtil.getCardPaymentMethod(requestData.getMap("cardPaymentMethod"))));
      paymentDataRequest.put("transactionInfo", PaymentsUtil.getTransactionInfo(requestData.getMap("transaction")));
      paymentDataRequest.put("merchantInfo", PaymentsUtil.getMerchantInfo(requestData.getString("merchantName")));

      return paymentDataRequest;
    } catch (JSONException e) {
      return null;
    }
  }
}
