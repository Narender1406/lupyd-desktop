package com.lupyd.client

import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)

    val filesDir = this.applicationContext.filesDir
    EncryptionPlugin.initializeFireflyClient(filesDir.absolutePath)
  }
}
