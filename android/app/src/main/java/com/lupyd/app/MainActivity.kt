package com.lupyd.app

import android.os.Bundle
import android.util.Log
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import com.getcapacitor.BridgeActivity


class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {

//        bridge.getWebView().getSettings().setMixedContentMode(MIXED_CONTENT_ALWAYS_ALLOW);

        System.setProperty("kotlinx.coroutines.debug", "on")

        registerPlugin(EncryptionPlugin::class.java)
        registerPlugin(NativeNotificationPlugin::class.java)

        Log.i("lupyd-cap", "Encryption Plugin registered")
        Log.i("lupyd-cap", "NativeNotification Plugin registered")

        super.onCreate(savedInstanceState)

//        bridge.webView.settings.setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW)
        val webView = bridge.getWebView()
        webView.setWebChromeClient(object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                request.grant(request.getResources())
            }
        })

    }
}
