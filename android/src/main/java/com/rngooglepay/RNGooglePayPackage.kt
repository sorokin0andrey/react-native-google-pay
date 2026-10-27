package com.rngooglepay

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class RNGooglePayPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    if (name == NativeRNGooglePaySpec.NAME) {
      return RNGooglePayModule(reactContext)
    }
    return null
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        NativeRNGooglePaySpec.NAME to
          ReactModuleInfo(
            NativeRNGooglePaySpec.NAME,
            RNGooglePayModule::class.java.name,
            false,
            false,
            false,
            true,
          ),
      )
    }
  }
}
