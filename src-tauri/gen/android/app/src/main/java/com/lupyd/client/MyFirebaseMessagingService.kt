package com.lupyd.client

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class MyFirebaseMessagingService: FirebaseMessagingService() {
  val TAG = "fcm"

  @OptIn(DelicateCoroutinesApi::class)
  private val scope = GlobalScope


  override fun onCreate() {
    super.onCreate()
  }


  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    super.onMessageReceived(remoteMessage)


    Log.d(TAG, "=== PUSH NOTIFICATION RECEIVED ===")
    Log.d(TAG, "Received message from: " + remoteMessage.getFrom())
    Log.d(TAG, "Message contains notification: " + (remoteMessage.getNotification() != null))
    Log.d(TAG, "Message contains data: " + (remoteMessage.data.toString()))


    val data = remoteMessage.data

    if (data["ty"] == "umsg") {
        try {
          val filesDir = this.applicationContext.filesDir
          EncryptionPlugin.initializeFireflyClient(filesDir.absolutePath)
          
        } catch (e: Exception) {
          Log.e(TAG, "Failed to Sync Messages ${e}")
        }
    } else {
      // handleNotification(remoteMessage)
    }

  }
}