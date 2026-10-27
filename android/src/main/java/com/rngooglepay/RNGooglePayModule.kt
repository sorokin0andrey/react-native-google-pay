package com.rngooglepay

import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.tasks.Task
import com.google.android.gms.wallet.IsReadyToPayRequest
import com.google.android.gms.wallet.PaymentData
import com.google.android.gms.wallet.PaymentDataRequest
import com.google.android.gms.wallet.PaymentsClient
import com.google.android.gms.wallet.WalletConstants
import com.google.android.gms.wallet.contract.ApiTaskResult
import com.google.android.gms.wallet.contract.TaskResultContracts.GetPaymentDataResult
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

@ReactModule(name = NativeRNGooglePaySpec.NAME)
class RNGooglePayModule(reactContext: ReactApplicationContext) :
  NativeRNGooglePaySpec(reactContext) {

  private val paymentLock = Any()

  private var paymentsClient: PaymentsClient? = null

  private var requestPaymentPromise: Promise? = null

  override fun getTypedExportedConstants(): MutableMap<String, Any> {
    return mutableMapOf(
      "ENVIRONMENT_TEST" to WalletConstants.ENVIRONMENT_TEST,
      "ENVIRONMENT_PRODUCTION" to WalletConstants.ENVIRONMENT_PRODUCTION,
    )
  }

  override fun setEnvironment(environment: Double) {
    val activity = reactApplicationContext.currentActivity ?: return
    paymentsClient = PaymentsUtil.createPaymentsClient(environment.toInt(), activity)
  }

  override fun isReadyToPay(requestData: ReadableMap, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      Log.w(TAG, "[GooglePay] activity is null")
      promise.reject("NO_ACTIVITY", "activity is null")
      return
    }
    val client = paymentsClient
    if (client == null) {
      Log.w(TAG, "[GooglePay] PaymentsClient is null")
      promise.reject("NO_PAYMENTS_CLIENT", "PaymentsClient is null. Call setEnvironment first.")
      return
    }
    val request =
      try {
        IsReadyToPayRequest.fromJson(PaymentsUtil.readableMapToJson(requestData).toString())
      } catch (error: Exception) {
        Log.w(TAG, "[GooglePay] IsReadyToPayRequest is invalid: $error")
        promise.reject("IS_READY_TO_PAY_REQUEST", "IsReadyToPayRequest JSON is invalid")
        return
      }

    client.isReadyToPay(request).addOnCompleteListener(activity) { task ->
      if (task.isSuccessful && task.result == true) {
        promise.resolve(true)
      } else if (task.isSuccessful) {
        Log.w(TAG, "[GooglePay] Not available")
        promise.resolve(false)
      } else {
        Log.w(TAG, "[GooglePay] isReadyToPay failed")
        promise.resolve(false)
      }
    }
  }

  override fun requestPayment(requestData: ReadableMap, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity !is ComponentActivity) {
      Log.w(TAG, "[GooglePay] activity is null")
      promise.reject("NO_ACTIVITY", "activity is null")
      return
    }
    val client = paymentsClient
    if (client == null) {
      Log.w(TAG, "[GooglePay] PaymentsClient is null")
      promise.reject("NO_PAYMENTS_CLIENT", "PaymentsClient is null. Call setEnvironment first.")
      return
    }
    val request =
      try {
        PaymentDataRequest.fromJson(PaymentsUtil.readableMapToJson(requestData).toString())
      } catch (error: Exception) {
        Log.w(TAG, "[GooglePay] PaymentDataRequest is invalid: $error")
        promise.reject("PAYMENT_DATA_REQUEST_JSON", "PaymentDataRequest JSON is invalid")
        return
      }
    val alreadyPaying =
      synchronized(paymentLock) {
        if (requestPaymentPromise != null) {
          true
        } else {
          requestPaymentPromise = promise
          false
        }
      }
    if (alreadyPaying) {
      promise.reject("PAYMENT_IN_PROGRESS", "A payment request is already in progress")
      return
    }
    reactApplicationContext.runOnUiQueueThread {
      try {
        launchPaymentData(activity, client.loadPaymentData(request))
      } catch (error: Exception) {
        Log.e(TAG, "[GooglePay] requestPayment error: $error")
        rejectPayment("PAYMENT_RESULT_ERROR", error.message ?: "loadPaymentData failed")
      }
    }
  }

  private fun launchPaymentData(activity: ComponentActivity, task: Task<PaymentData>) {
    val key = "RNGooglePay.loadPaymentData.${System.nanoTime()}"
    lateinit var launcher: ActivityResultLauncher<Task<PaymentData>>
    launcher =
      activity.activityResultRegistry.register(key, GetPaymentDataResult()) { taskResult ->
        try {
          handlePaymentResult(taskResult)
        } finally {
          launcher.unregister()
        }
      }
    task.addOnCompleteListener(activity) { completed ->
      try {
        launcher.launch(completed)
      } catch (error: Exception) {
        Log.e(TAG, "[GooglePay] loadPaymentData failed: $error")
        launcher.unregister()
        rejectPayment("PAYMENT_RESULT_ERROR", error.message ?: "loadPaymentData failed")
      }
    }
  }

  private fun handlePaymentResult(taskResult: ApiTaskResult<PaymentData>) {
    when (val statusCode = taskResult.status.statusCode) {
      CommonStatusCodes.SUCCESS -> handlePaymentSuccess(taskResult.result)
      CommonStatusCodes.CANCELED ->
        rejectPayment("PAYMENT_RESULT_CANCELED", "Payment has been canceled")
      else -> {
        val errorMessage = String.format("loadPaymentData failed. Error code: %d", statusCode)
        Log.w(TAG, "[GooglePay] $errorMessage")
        rejectPayment("PAYMENT_RESULT_ERROR", errorMessage)
      }
    }
  }

  private fun handlePaymentSuccess(paymentData: PaymentData?) {
    val paymentInformation = paymentData?.toJson()
    if (paymentInformation == null) {
      rejectPayment("NULL_PAYMENT_INFORMATION", "paymentInformation is null")
      return
    }
    try {
      resolvePayment(jsonToWritableMap(JSONObject(paymentInformation)))
    } catch (error: JSONException) {
      Log.e(TAG, "[GooglePay] handlePaymentSuccess error: $error")
      rejectPayment("PAYMENT_RESULT_ERROR", error.toString())
    }
  }

  private fun jsonToWritableMap(jsonObject: JSONObject): WritableMap {
    val map = Arguments.createMap()
    val keys = jsonObject.keys()
    while (keys.hasNext()) {
      val key = keys.next()
      putJsonValue(map, key, jsonObject.get(key))
    }
    return map
  }

  private fun jsonToWritableArray(jsonArray: JSONArray): WritableArray {
    val array = Arguments.createArray()
    for (index in 0 until jsonArray.length()) {
      when (val value = jsonArray.get(index)) {
        JSONObject.NULL -> array.pushNull()
        is JSONObject -> array.pushMap(jsonToWritableMap(value))
        is JSONArray -> array.pushArray(jsonToWritableArray(value))
        is Boolean -> array.pushBoolean(value)
        is Int -> array.pushInt(value)
        is Long ->
          if (value in Int.MIN_VALUE..Int.MAX_VALUE) {
            array.pushInt(value.toInt())
          } else {
            array.pushDouble(value.toDouble())
          }
        is Double -> array.pushDouble(value)
        is String -> array.pushString(value)
        else -> array.pushString(value.toString())
      }
    }
    return array
  }

  private fun putJsonValue(map: WritableMap, key: String, value: Any) {
    when (value) {
      JSONObject.NULL -> map.putNull(key)
      is JSONObject -> map.putMap(key, jsonToWritableMap(value))
      is JSONArray -> map.putArray(key, jsonToWritableArray(value))
      is Boolean -> map.putBoolean(key, value)
      is Int -> map.putInt(key, value)
      is Long ->
        if (value in Int.MIN_VALUE..Int.MAX_VALUE) {
          map.putInt(key, value.toInt())
        } else {
          map.putDouble(key, value.toDouble())
        }
      is Double -> map.putDouble(key, value)
      is String -> map.putString(key, value)
      else -> map.putString(key, value.toString())
    }
  }

  private fun resolvePayment(paymentData: WritableMap) {
    val promise = takePaymentPromise()
    if (promise == null) {
      Log.w(TAG, "[GooglePay] requestPaymentPromise is null")
      return
    }
    promise.resolve(paymentData)
  }

  private fun rejectPayment(code: String, message: String) {
    val promise = takePaymentPromise()
    if (promise == null) {
      Log.w(TAG, "[GooglePay] requestPaymentPromise is null")
      return
    }
    promise.reject(code, message)
  }

  private fun takePaymentPromise(): Promise? {
    return synchronized(paymentLock) {
      val promise = requestPaymentPromise
      requestPaymentPromise = null
      promise
    }
  }

  private companion object {
    const val TAG = "ReactNative"
  }
}
