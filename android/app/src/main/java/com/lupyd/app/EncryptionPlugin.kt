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
import uniffi.firefly_signal.GroupInfo
import uniffi.firefly_signal.GroupMessage
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


    lateinit var notificationHandler: NotificationHandler

    lateinit var fireflyClient: FireflyClient


    val tag = "lupyd-ep"

    override fun load() {
        super.load()


        notificationHandler = NotificationHandler(context)

        fireflyClient = FireflyClient.getInstance(context)

        fireflyClient.addOnMessageCallback(this::sendUserMessage)
        fireflyClient.addOnGroupMessageCallback(this::sendGroupMessage)


        bridge.activity.lifecycleScope.launch {
            fireflyClient.initialize(context)
        }

    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        fireflyClient.removeOnMessageCallback(this::sendUserMessage)
        fireflyClient.removeOnGroupMessageCallback(this::sendGroupMessage)
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

    @PluginMethod
    fun encryptAndSend(call: PluginCall) {

        bridge.activity.lifecycleScope.launch {
            try {
                val payloadB64 = call.data.getString("textB64")!!
                val to = call.data.getString("to")!!
                val payload = Base64.decode(payloadB64, Base64.NO_WRAP)

                val dmsg = fireflyClient.encryptAndSend(
                    payload,
                    to,
                )

                call.resolve(userMessageToJsObj(dmsg))
            } catch (e: Exception) {
                Log.e(tag, e.toString())
                call.reject(e.toString())
            }
        }
    }


    @PluginMethod
    fun getLastMessagesFromAllConversations(call: PluginCall) {

        bridge.activity.lifecycleScope.launch {
            try {
                val msgs = fireflyClient.getLastConversations()
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
        Log.d(tag, "getting last messages from plugin ${call.data}")

        bridge.activity.lifecycleScope.launch {
            try {
                val data = call.data
                val from = data.getString("other")!!
                val limit = data.getLong("limit")
                val before = data.getLong("before")

                Log.d(tag, "getting last messages of from plugin: ${from} ${before} ${limit}")


                val msgs = fireflyClient.getLastMessagesOf(from, before, limit)

                val arr = JSArray()
                for (msg in msgs) {
                    arr.put(userMessageToJsObj(msg))
                }
                call.resolve(JSObject().put("result", arr))
            } catch (e: Exception) {
                call.reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun saveTokens(call: PluginCall) {
        bridge.activity.lifecycleScope.launch {
            try {
                val refreshToken = call.data.getString("refreshToken")!!
                val accessToken = call.data.getString("accessToken")!!

                fireflyClient.updateAuthTokens(accessToken, refreshToken)

                call.resolve()

            } catch (e: Exception) {
                call.reject(e.toString())
            }
        }
    }


    fun sendUserMessage(msg: UserMessage) {
        notifyListeners("onUserMessage", userMessageToJsObj(msg))
    }


    fun sendGroupMessage(msg: GroupMessage) {
        notifyListeners("onGroupMessage", groupMessageToJsObj(msg))
    }


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

            notificationHandler.showCallNotification(caller, sessionId)

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

    @PluginMethod
    fun getFileServerUrl(call: PluginCall) {
        call.resolve(
            JSObject().put("url", "http://localhost:${Constants.fileServerPort}").put(
                "token",
                Constants.fileServerToken
            )
        )
    }

    @PluginMethod
    fun getGroupMessages(call: PluginCall) {
        val data = call.data
        val groupId = data.getLong("groupId")
        val startBefore = data.getLong("startBefore")
        val limit = data.getLong("limit")

        bridge.activity.lifecycleScope.launch {
            try {
                val messages = fireflyClient.getGroupMessages(groupId, startBefore, limit)

                val arr = JSArray()
                for (msg in messages) {
                    arr.put(groupMessageToJsObj(msg))
                }

                call.resolve(JSObject().put("result", arr))
            } catch (e: Exception) {
                Log.e(tag, "failed to get group messages ${e}")
            }
        }

    }
        @PluginMethod
        fun getGroupInfos(call: PluginCall) {

            bridge.activity.lifecycleScope.launch {
                try {
                    val groups = fireflyClient.getAllGroups()

                    val arr = JSArray()
                    for (group in groups) {
                        arr.put(groupInfoToJSObj(group))
                    }

                    call.resolve(JSObject().put("result", arr))
                } catch (e: Exception) {
                    Log.e(tag, "failed to get group messages ${e}")
                }
            }

        }

        @PluginMethod
        fun createGroup(call: PluginCall) {
            bridge.activity.lifecycleScope.launch {
                try {
                    val group = fireflyClient.createGroup(call.data.getString("groupName")!!)

                    call.resolve(groupInfoToJSObj(group))
                } catch (e: Exception) {
                    Log.e(tag, "failed to get group messages ${e}")
                    call.reject(e.toString())
                }
            }
        }

        @PluginMethod
        fun getGroupExtension(call: PluginCall) {
            bridge.activity.lifecycleScope.launch {
                try {
                    val groupId = call.data.getLong("groupId")
                    val group = fireflyClient.getGroupExtension(groupId)

                    call.resolve(
                        JSObject().put(
                            "resultB64",
                            Base64.encodeToString(group, Base64.NO_WRAP)
                        )
                    )
                } catch (e: Exception) {
                    Log.e(tag, "failed to get group messages ${e}")
                    call.reject(e.toString())
                }
            }
        }

        @PluginMethod
        fun encryptAndSendGroupMessage(call: PluginCall) {
            bridge.activity.lifecycleScope.launch {
                try {
                    val payloadB64 = call.data.getString("textB64")!!
                    val to = call.data.getLong("groupId")!!
                    val payload = Base64.decode(payloadB64, Base64.NO_WRAP)

                    val dmsg = fireflyClient.encryptAndSendGroup(
                        payload,
                        to,
                    )
                    call.resolve(JSObject().put("messageId", dmsg))
                } catch (e: Exception) {
                    Log.e(tag, e.toString())
                    call.reject(e.toString())

                }
            }
        }

    @PluginMethod
    fun updateGroupChannel(call: PluginCall) {
        bridge.activity.lifecycleScope.launch {
            try {
                val groupId = call.data.getString("groupId")!!.toLong()
                val delete = call.data.getBoolean("delete")!!
                val payloadB64 = call.data.getString("payloadB64")!!
                val payload = Base64.decode(payloadB64, Base64.NO_WRAP)
                
                fireflyClient.updateGroupChannel(groupId, delete, payload)
                call.resolve(JSObject())
            } catch (e: Exception) {
                Log.e(tag, e.toString(), e)
                call.reject(e.toString())
            }
        }
    }

    @PluginMethod
    fun updateGroupRole(call: PluginCall) {
        bridge.activity.lifecycleScope.launch {
            try {
                val groupId = call.data.getString("groupId")!!.toLong()
                val roleName = call.data.getString("roleName")!!
                val roleId = call.data.getInteger("roleId")!!
                val permissions = call.data.getInteger("permissions")!!
                val delete = call.data.getBoolean("delete")!!

                fireflyClient.updateGroupRole(groupId, roleName, roleId, permissions, delete)
                call.resolve(JSObject())
            } catch (e: Exception) {
                Log.e(tag, e.toString(), e)
                call.reject(e.toString())
            }
        }
    }
    
    @PluginMethod
    fun updateGroupMember(call: PluginCall) {
        bridge.activity.lifecycleScope.launch {
            try {
                val groupId = call.data.getString("groupId")!!.toLong()
                val username = call.data.getString("username")!!
                val roleId = call.data.getInteger("roleId")!!

                 fireflyClient.updateGroupMember(groupId, username, roleId)
                call.resolve(JSObject())
            } catch (e: Exception) {
                Log.e(tag, e.toString(), e)
                call.reject(e.toString())
            }
        }
    }

        @PluginMethod
        fun getLastGroupMessages(call: PluginCall) {
            bridge.activity.lifecycleScope.launch {
                try {
                    val arr = JSArray()
                    for (msg in fireflyClient.getGroupLastMessages()) {
                        arr.put(groupMessageToJsObj(msg))
                    }
                    call.resolve(JSObject().put("result", arr))
                } catch (e: Exception) {
                    Log.e(tag, "failed to get last group messages $e")
                    call.reject(e.toString())
                }
            }
        }

    }



fun groupInfoToJSObj(groupInfo: GroupInfo): JSObject {
    return JSObject()
        .put("groupId", groupInfo.id)
        .put("name", groupInfo.name)
        .put("description", groupInfo.description)
}

fun groupMessageToJsObj(msg: GroupMessage): JSObject {
    return JSObject()
        .put("groupId", msg.groupId)
        .put("sender", msg.by)
        .put("textB64", Base64.encodeToString(msg.message, Base64.NO_WRAP))
        .put("id", msg.id)
}

    fun userMessageToJsObj(msg: UserMessage): JSObject {

        val base64 = Base64.encodeToString(msg.message, Base64.NO_WRAP)

        return JSObject().put("id", msg.id).put("other", msg.other).put("sentByOther", msg.sentByOther).put("textB64", base64)


    }

    fun jsObjToUserMessage(obj: JSObject): UserMessage {
        val msg = UserMessage(
            obj.getLong("id").toULong(),
            obj.getString("other")!!,

            Base64.decode(obj.getString("textB64")!!, Base64.NO_WRAP),
            obj.getBoolean("sentByOther"),

            )

        return msg
    }
