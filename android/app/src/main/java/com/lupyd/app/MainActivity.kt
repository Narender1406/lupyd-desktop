package com.lupyd.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.result.contract.ActivityResultContracts
import com.getcapacitor.BridgeActivity


class MainActivity : BridgeActivity() {
    lateinit var server: FileServer

    var filePathCallback: ValueCallback<Array<out Uri?>?>? = null


    private val pickFile =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->


            val intent = result.data
            val clip = intent?.clipData
            val single = intent?.data

            val uris = when {
                clip != null ->
                    (0 until clip.itemCount).map { clip.getItemAt(it).uri }
                single != null ->
                    listOf(single)
                else ->
                    emptyList()
            }

            Log.i("lupyd-cap", "pickFile result ${uris}")
            if (uris.isNotEmpty()) {
                filePathCallback?.onReceiveValue(uris.toTypedArray())
            } else {
                filePathCallback?.onReceiveValue(null)
            }

            filePathCallback = null
        }
    lateinit var serverThread: Thread
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

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<out Uri?>?>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                val intent = fileChooserParams?.createIntent()
                if (intent == null) {
                    return super.onShowFileChooser(webView, filePathCallback, fileChooserParams)
                }
                this@MainActivity.filePathCallback = filePathCallback
                pickFile.launch(intent)
                return true
            }

        })
        server = FileServer(rootDir = application.filesDir)

        serverThread = Thread {
            server.startServer()
        }
        serverThread.start()
    }

    override fun onDestroy() {
        super.onDestroy()
        server.closeServer()
        serverThread.interrupt()

    }
}
