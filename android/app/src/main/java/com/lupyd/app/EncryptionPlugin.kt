package com.lupyd.app

import android.Manifest
import android.util.Base64
import android.util.Log
import androidx.lifecycle.lifecycleScope
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import firefly.Message
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import uniffi.firefly_signal.UserMessage


@CapacitorPlugin(name = "EncryptionPlugin",
    permissions = [
        Permission(
            alias = "camera",
            strings = [Manifest.permission.CAMERA]
        ),
        Permission(
            alias = "mic",
            strings = [ Manifest.permission.RECORD_AUDIO ]
        )
    ]
    )
class EncryptionPlugin : Plugin() {

//    lateinit var db: AppDatabase
//    lateinit var encryptionWrapper: EncryptionWrapper

    lateinit var notificationHandler: NotificationHandler

    lateinit var fireflyClient: FireflyClient


    val tag = "lupyd-ep"

    override fun load() {
        super.load()

//        db = getDatabase(context)
//        encryptionWrapper = EncryptionWrapper(context, this::sendUserMessage)
        notificationHandler = NotificationHandler(context)

        fireflyClient = FireflyClient.getInstance(context)

        fireflyClient.addOnMessageCallback (this::sendUserMessage)


        bridge.activity.lifecycleScope.launch {
            fireflyClient.initialize(context)
        }

    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        fireflyClient.removeOnMessageCallback(this::sendUserMessage)
    }

    fun dMessageToJsObj(msg: DMessage): JSObject {
        val base64 = Base64.encodeToString(msg.text, Base64.NO_WRAP)
        val obj = JSObject()
            .put("convoId", msg.conversationId)
            .put("from", msg.mfrom)
            .put("to", msg.mto)
            .put("id", msg.msgId)
            .put("textB64", base64)

        return obj
    }

    fun userMessageToJsObj(msg: UserMessage): JSObject {

        val base64 = Base64.encodeToString(msg.message, Base64.NO_WRAP)

        return JSObject().put("id", msg.id).put("convoId", msg.convoId).put("other", msg.other).put("sentByOther", msg.sentByOther).put("textB64", base64)


    }

    fun jsObjToUserMessage(obj: JSObject): UserMessage {
        val msg = UserMessage(
            obj.getLong("convoId").toULong(),
            obj.getLong("id").toULong(),
            obj.getString("other")!!,

            Base64.decode(obj.getString("textB64")!!, Base64.NO_WRAP),
            obj.getBoolean("sentByOther"),

            )

        return msg
    }

    @PluginMethod
    fun testMethod(call: PluginCall) {
        val data = call.data
        bridge.activity.lifecycleScope.launch {
            delay(1000)
            val result = JSObject().put("receivedAt", System.currentTimeMillis())
            for (key in data.keys()) {
                val value = data.get(key)
                result.put(key, value)
            }

            call.resolve(result)
        }
    }


//    @PluginMethod
//    fun onUserMessage(call: PluginCall) {
//
//        bridge.activity.lifecycleScope.launch {
//            try {
//                val conversationId = call.data.getLong("convoId")
//                val from = call.data.getString("from")
//                val to = call.data.getString("to")
//                val textB64 = call.data.getString("textB64")
//                val type = call.data.getInteger("type")
//                val text = Base64.decode(textB64, Base64.NO_WRAP)
//                val id = call.data.getLong("id")
//                val result = encryptionWrapper
//                    .onUserMessage(
//                        from!!,
//                        to!!,
//                        text,
//                        type!!,
//                        conversationId,
//                        id
//                    )
//                if (result != null) {
//                    call.resolve(dMessageToJsObj(result))
//                } else {
//                    call.reject("Something went wrong")
//                }
//            } catch (e: Exception) {
//                call.reject(e.toString())
//            }
//
//        }
//    }


    @PluginMethod
    fun encryptAndSend(call: PluginCall) {

        bridge.activity.lifecycleScope.launch {
            try {
                val conversationId = call.data.getLong("convoId")
                val payloadB64 = call.data.getString("textB64")!!
                val to = call.data.getString("to")!!
                val payload = Base64.decode(payloadB64, Base64.NO_WRAP)

                val dmsg = fireflyClient.encryptAndSend(
                    payload,
                    conversationId,
                    to,
                )

                call.resolve(userMessageToJsObj(dmsg))
            } catch (e: Exception) {
                Log.e(tag, e.toString())
                call.reject(e.toString())
            }
        }
    }


//    @PluginMethod
//    fun encrypt(call: PluginCall) {
//            try {
//                val payloadB64 = call.data.getString("textB64")!!
//                val to = call.data.getString("to")!!
//                val payload = Base64.decode(payloadB64, Base64.NO_WRAP)
//                val cipherTextMessage = encryptionWrapper.encrypt(to, payload)
//                call.resolve(JSObject()
//                    .put("messageType", cipherTextMessage.type)
//                    .put("cipherTextB64", Base64.encodeToString(cipherTextMessage.serialize(), Base64.NO_WRAP))
//                )
//            } catch (e: Exception) {
//                Log.e(tag, e.toString())
//                call.reject(e.toString())
//            }
//    }

//    @PluginMethod
//    fun processPreKeyBundle(call: PluginCall) {
//        try {
//            val preKeyBundleB64 = call.data.getString("preKeyBundleB64")!!
//            val owner = call.data.getString("owner")!!
//            val preKeyBundleProto = Base64.decode(preKeyBundleB64, Base64.NO_WRAP)
//            encryptionWrapper.processPreKeyBundle(Message.PreKeyBundle.parseFrom(preKeyBundleProto), owner)
//            call.resolve()
//
//        } catch (e: Exception) {
//            Log.e(tag, e.toString())
//            call.reject(e.toString())
//        }
//    }

    @PluginMethod
    fun getLastMessagesFromAllConversations(call: PluginCall) {

        bridge.activity.lifecycleScope.launch {
            try {
                val msgs = fireflyClient.getLastConversations()
//                val msgs = db.messagesDao().getLastMessagesFromAllConversations()
                for (msg in msgs) {
                    Log.i(tag, msg.toString())
                }
                val arr = JSArray()
                for (msg in msgs) {
                    arr.put(
                        JSObject()
                            .put("count", msg.count)
                            .put("message", userMessageToJsObj(msg.message))
                    )
                }

                call.resolve(JSObject().put("result", arr))
            } catch (e: Exception) {
                call.reject(e.toString())
            }
        }


    }

    @PluginMethod
    fun getLastMessages(call: PluginCall) {
        bridge.activity.lifecycleScope.launch {
            try {
                val from = call.getString("other")!!
                val limit = call.getLong("limit")!!
                val before = call.getLong("before")!!
                val msgs = fireflyClient.getLastMessagesOf(from, before, limit)

                val arr = JSArray()
                for (msg in  msgs) {
                    arr.put(userMessageToJsObj(msg))
                }
                call.resolve(JSObject().put("result", arr))
            } catch (e: Exception) {
                call.reject(e.toString())
            }
        }
    }

//    @PluginMethod
//    fun getLastMessagesInBetween(call: PluginCall) {
//        bridge.activity.lifecycleScope.launch {
//            try {
//                val from = call.getString("from")!!
//                val to = call.getString("to")!!
//                val limit = call.getInt("limit")!!
//                val before = call.getLong("before")!!
//
//                val msgs = db.messagesDao().getLastMessagesInBetween(from, to, before, limit)
//                val arr = JSArray()
//                for (msg in  msgs) {
//                    arr.put(dMessageToJsObj(msg))
//                }
//                call.resolve(JSObject().put("result", arr))
//            } catch (e: Exception) {
//                call.reject(e.toString())
//            }
//        }
//    }


    @PluginMethod
    fun saveTokens(call: PluginCall) {
        bridge.activity.lifecycleScope.launch {
            try {
                val refreshToken = call.getString("refreshToken")!!
                val accessToken = call.getString("accessToken")!!

                fireflyClient.updateAuthTokens(accessToken, refreshToken)

                call.resolve()

            } catch (e: Exception) {
                call.reject(e.toString())
            }
        }
    }


//    @PluginMethod
//    fun checkSetup(call: PluginCall) {
//        bridge.activity.lifecycleScope.launch {
//            try {
//                encryptionWrapper.checkSetup()
//                call.resolve()
//            } catch (e: Exception) {
//                call.reject(e.toString())
//            }
//        }
//    }
//
//    @PluginMethod
//    fun syncUserMessages(call: PluginCall) {
//        bridge.activity.lifecycleScope.launch {
//            try {
//                encryptionWrapper.syncUserMessages()
//                call.resolve()
//            } catch (e: Exception) {
//                call.reject(e.toString())
//            }
//        }
//    }


    fun sendUserMessage(msg: UserMessage) {
        notifyListeners("onUserMessage", userMessageToJsObj(msg))
    }



//    @PluginMethod
//    fun getLastSeenUserMessageTimestamp(call: PluginCall) {
//        bridge.activity.lifecycleScope.launch {
//            try {
//                val username = call.data.getString("username")
//                if (username == null) {
//                    call.resolve()
//                } else {
//                    val ts = db.lastSeenTimestampDao().get(username)
//                    call.resolve(JSObject().put("ts", ts))
//                }
//            } catch (e: Exception) {
//                call.reject(e.toString())
//            }
//        }
//    }

    @PluginMethod
    fun markAsReadUntil(call: PluginCall) {
        bridge.activity.lifecycleScope.launch {
            try {
                val username = call.data.getString("username")
                val ts = call.data.getLong("ts")
                if (username == null) {
                    call.reject("Invalid parameters")
                } else {
                    fireflyClient.markAsReadUntil(username, ts)
                    call.resolve()
                }
            } catch (e: Exception) {
                call.reject(e.toString())
            }
        }
    }

//    @PluginMethod
//    fun getNumberOfMessagesInBetweenSince(call: PluginCall) {
//        bridge.activity.lifecycleScope.launch {
//            try {
//                val from = call.data.getString("from")!!
//                val to = call.data.getString("to")!!
//                val since = call.data.getLong("since")
//                val count = db.messagesDao().getNumberOfMessagesInBetweenSince(from, to, since)
//
//                call.resolve(JSObject().put("count", count))
//
//            } catch (e: Exception) {
//                call.reject(e.toString())
//            }
//        }
//    }

    @PluginMethod
    fun clearNotifications(call: PluginCall) {
        notificationHandler.clearAll()
        call.resolve()
    }

    @PluginMethod
    fun showUserNotification(call: PluginCall) {
        try {
            val userMessage = jsObjToUserMessage(call.data)
            notificationHandler.showUserBundledNotification(userMessage)
            call.resolve()
        } catch (e: Exception) {
            Log.e(tag, e.toString())
            call.reject(e.toString())
        }

    }

    @PluginMethod
    fun showCallNotification(call: PluginCall) {
        try {
            val caller = call.data.getString("caller")!!
            val sessionId = call.data.getInteger("sessionId")!!
            val convoId = call.data.getLong("conversationId")

            notificationHandler.showCallNotification(caller, convoId, sessionId)

        } catch (e: Exception) {
            Log.e(tag, e.toString())
            call.reject(e.toString())
        }
    }

    @PluginMethod
    fun requestAllPermissions(call: PluginCall) {
        try {
            requestPermissions(call)
            call.resolve()
        } catch (e: Exception) {
            call.reject(e.toString())
        }
    }

//    @PluginMethod
//    fun handleMessage(call: PluginCall) {
//        bridge.activity.lifecycleScope.launch {
//            try {
//                val textB64 = call.data.getString("textB64")
//                val convoId = call.data.getLong("convoId")
//                val msgId = call.data.getLong("id")
//                val from = call.data.getString("from")
//                val to = call.data.getString("to")
//                val msg = DMessage(msgId, convoId, from!!, to!!, Base64.decode(textB64, Base64.NO_WRAP))
//
//                encryptionWrapper.handleMessage(msg)
//
//                call.resolve()
//            } catch (e: Exception) {
//                call.reject(e.toString())
//            }
//        }
//    }


    @PluginMethod
    fun getFileServerUrl(call: PluginCall) {
        call.resolve(JSObject().put("url", "http://localhost:51414"))
    }
}
