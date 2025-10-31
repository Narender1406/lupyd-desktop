package com.lupyd.app

import android.util.Base64
import androidx.room.Room
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.protobuf.ByteString
import firefly.Message


@CapacitorPlugin(name = "EncryptionPlugin")
class EncryptionPlugin : Plugin() {

    val db = getDatabase(context)


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


    @PluginMethod
    suspend fun onUserMessage(call: PluginCall) {

        val conversationId = call.data.getInteger("convoId")
        val from = call.data.getString("from")
        val to = call.data.getString("to")
        val textB64 = call.data.getString("textB64")
        val type = call.data.getInteger("type")
        val text = Base64.decode(textB64, Base64.NO_WRAP)
        val id = call.data.getInteger("id")
        val result = EncryptionWrapper(db, this::sendUserMessage)
            .onUserMessage(from!!, to!!, text, type!!, conversationId!!.toLong(), id!!.toLong())


        call.resolve(dMessageToJsObj(result))
    }


    @PluginMethod
    suspend fun encryptAndSend(call: PluginCall) {
        val conversationId = call.data.getInteger("convoId")!!
        val payloadB64 = call.data.getString("textB64")!!
        val to = call.data.getString("to")!!
        val token = call.data.getString("token")!!
        val payload = Base64.decode(payloadB64, Base64.NO_WRAP)
        val dmsg = EncryptionWrapper(db, this::sendUserMessage).encryptAndSend(
            to,
            conversationId.toLong(),
            payload,
            token
        )

        call.resolve(dMessageToJsObj(dmsg))
    }

    @PluginMethod
    suspend fun getLastMessagesFromAllConversations(call: PluginCall) {
        val msgs = db.messagesDao().getLastMessagesFromAllConversations()
        val arr = JSArray.from(msgs.map { dMessageToJsObj(it) })
        call.resolve(JSObject().put("result", arr))

    }

    @PluginMethod
    suspend fun getLastMessages(call: PluginCall) {
        val from = call.getString("from")!!
        val to = call.getString("to")!!
        val limit = call.getInt("limit")!!
        val before = call.getLong("before")!!

        val msgs = db.messagesDao().getLastMessages(from, to, before, limit)
        val arr = JSArray.from(msgs.map { dMessageToJsObj(it) })
        call.resolve(JSObject().put("result", arr))
    }

    @PluginMethod
    suspend fun getLastMessagesInBetween(call: PluginCall) {
        val from = call.getString("from")!!
        val to = call.getString("to")!!
        val limit = call.getInt("limit")!!
        val before = call.getLong("before")!!

        val msgs = db.messagesDao().getLastMessagesInBetween(from, to, before, limit)
        val arr = JSArray.from(msgs.map { dMessageToJsObj(it) })
        call.resolve(JSObject().put("result", arr))
    }


    @PluginMethod
    suspend fun saveTokens(call: PluginCall) {
        val refreshToken = call.getString("refreshToken")!!
        val accessToken = call.getString("accessToken")!!

        db.keyValueDao().put(KeyValueEntry("auth0RefreshToken", refreshToken))
        db.keyValueDao().put(KeyValueEntry("auth0AccessToken", accessToken))

        call.resolve()
    }


    @PluginMethod
    suspend fun checkSetup(call: PluginCall) {
        EncryptionWrapper(db).checkSetup()
        call.resolve()
    }


    fun sendUserMessage(msg: DMessage) {
        notifyListeners("onUserMessage", dMessageToJsObj(msg))
    }


}
