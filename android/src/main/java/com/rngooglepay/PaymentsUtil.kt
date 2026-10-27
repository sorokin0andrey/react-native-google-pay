package com.rngooglepay

import android.app.Activity
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.google.android.gms.wallet.PaymentsClient
import com.google.android.gms.wallet.Wallet
import org.json.JSONArray
import org.json.JSONObject

object PaymentsUtil {
  fun createPaymentsClient(environment: Int, activity: Activity): PaymentsClient {
    val walletOptions =
      Wallet.WalletOptions.Builder().setEnvironment(environment).build()
    return Wallet.getPaymentsClient(activity, walletOptions)
  }

  fun readableMapToJson(readableMap: ReadableMap): JSONObject {
    val json = JSONObject()
    val iterator = readableMap.keySetIterator()
    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()
      json.put(key, readableValue(readableMap.getType(key), readableMap, key))
    }
    return json
  }

  private fun readableArrayToJson(readableArray: ReadableArray): JSONArray {
    val json = JSONArray()
    for (index in 0 until readableArray.size()) {
      json.put(readableValue(readableArray.getType(index), readableArray, index))
    }
    return json
  }

  private fun readableValue(type: ReadableType, map: ReadableMap, key: String): Any {
    return when (type) {
      ReadableType.Null -> JSONObject.NULL
      ReadableType.Boolean -> map.getBoolean(key)
      ReadableType.Number -> jsonNumber(map.getDouble(key))
      ReadableType.String -> map.getString(key) ?: JSONObject.NULL
      ReadableType.Map -> map.getMap(key)?.let { readableMapToJson(it) } ?: JSONObject.NULL
      ReadableType.Array -> map.getArray(key)?.let { readableArrayToJson(it) } ?: JSONArray()
    }
  }

  private fun readableValue(type: ReadableType, array: ReadableArray, index: Int): Any {
    return when (type) {
      ReadableType.Null -> JSONObject.NULL
      ReadableType.Boolean -> array.getBoolean(index)
      ReadableType.Number -> jsonNumber(array.getDouble(index))
      ReadableType.String -> array.getString(index) ?: JSONObject.NULL
      ReadableType.Map -> array.getMap(index)?.let { readableMapToJson(it) } ?: JSONObject.NULL
      ReadableType.Array -> array.getArray(index)?.let { readableArrayToJson(it) } ?: JSONArray()
    }
  }

  private fun jsonNumber(number: Double): Number {
    if (number % 1.0 == 0.0 && number <= Int.MAX_VALUE && number >= Int.MIN_VALUE) {
      return number.toInt()
    }
    return number
  }
}
