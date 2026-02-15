package com.lupyd.client

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import app.tauri.AppPlugin
import app.tauri.deep_link.DeepLinkPlugin


class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
    val filesDir = this.applicationContext.filesDir
    EncryptionPlugin.initializeFireflyClient(filesDir.absolutePath)
  }

  override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
      super.onRequestPermissionsResult(requestCode, permissions, grantResults)
      NotificationHandlerPlugin.instance?.get()?.onRequestPermissionsResult(requestCode, permissions, grantResults)
  }
}
