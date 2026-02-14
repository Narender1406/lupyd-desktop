package com.lupyd.client

object EncryptionPlugin {
    init {
        System.loadLibrary("app_lib")
    }

    external fun initializeFireflyClient(appDataDir: String)
}
