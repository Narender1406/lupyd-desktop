package com.lupyd.app

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
import androidx.annotation.RequiresApi
import androidx.core.view.WindowCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.BridgeActivity
import kotlinx.coroutines.launch
import uniffi.firefly_signal.FfiFileServer
import kotlin.io.encoding.Base64
import kotlin.random.Random


class MainActivity : BridgeActivity() {

    lateinit var server: FfiFileServer

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

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {

        registerPlugin(EncryptionPlugin::class.java)
        registerPlugin(TestPlugin::class.java)
        super.onCreate(savedInstanceState)


        System.setProperty("kotlinx.coroutines.debug", "on")


        Log.i("lupyd-cap", "Encryption Plugin registered")

        // ✅ Mobile-optimized approach for chat applications
        // Enable edge-to-edge to allow manual inset handling
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // Use ADJUST_RESIZE with stateUnchanged for mobile chat experience
        window.setSoftInputMode(
            WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE or 
            WindowManager.LayoutParams.SOFT_INPUT_STATE_UNCHANGED
        )

        // Apply WindowInsets listener to handle IME and system bars properly
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content)) { view, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())

            // Calculate the bottom inset (either IME or navigation bar, whichever is larger)
            val bottomInset = maxOf(ime.bottom, systemBars.bottom)

            // Apply padding to prevent content from going behind system UI
            view.setPadding(
                systemBars.left,
                systemBars.top,
                systemBars.right,
                bottomInset
            )

            WindowInsetsCompat.CONSUMED
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
        val fileServerToken = randomString(32)
        server = FfiFileServer.create(
            basePath = application.filesDir.toPath().toAbsolutePath().toString(),
            token = fileServerToken
        )

        lifecycleScope.launch {
            server.startServing(null)

            Constants.fileServerPort = server.port().toInt()
            Constants.fileServerToken = server.token()

            Log.i("lupyd-cap", "FileServer serving at ${Constants.fileServerPort}")
        }

    }

    @RequiresApi(Build.VERSION_CODES.O)
    override fun onDestroy() {
        super.onDestroy()

    }
}

fun randomString(length: Int): String {
    val allowedChars = ('A'..'Z') + ('a'..'z') + ('0'..'9')
    return (1..length)
        .map { allowedChars.random() }
        .joinToString("")
}