package com.lupyd.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.view.WindowCompat
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
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // ✅ Android 13–16
            // Prevent the window (header + page) from moving
            WindowCompat.setDecorFitsSystemWindows(window, true)
            window.setSoftInputMode(
                WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN
            )
        } else {
            // ✅ Older Android (works correctly with resize)
            window.setSoftInputMode(
                WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE
            )
        }

        window.setBackgroundDrawableResource(android.R.color.white)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            @Suppress("DEPRECATION")
            window.insetsController?.setSystemBarsAppearance(
                android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
                android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
            )
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            window.decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        }

        System.setProperty("kotlinx.coroutines.debug", "on")

        registerPlugin(EncryptionPlugin::class.java)
        registerPlugin(NativeNotificationPlugin::class.java)

        Log.i("lupyd-cap", "Encryption Plugin registered")
        Log.i("lupyd-cap", "NativeNotification Plugin registered")


//        bridge.getWebView().getSettings().setMixedContentMode(MIXED_CONTENT_ALWAYS_ALLOW);


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

        Log.i("lupyd-cap", "creating FileServer")
        server = FileServer(rootDir = application.filesDir, port = 62510)

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