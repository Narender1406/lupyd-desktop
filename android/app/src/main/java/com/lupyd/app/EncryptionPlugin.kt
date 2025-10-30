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

    val db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db").build()


    fun dMessageToJsObj(msg: DMessage): JSObject {
        val base64 = Base64.encodeToString(msg.text, Base64.NO_WRAP)
        val obj = JSObject()
            .put("convoId", msg.conversationId)
            .put("from", msg.mfrom)
            .put("to", msg.mto)
            .put("id", msg.msgId)
            .put("text", base64)

        return obj
    }

    fun sendUserMessage(msg: DMessage) {
        notifyListeners("onUserMessage", dMessageToJsObj((msg)))
    }


    @PluginMethod
    fun onUserMessage(call: PluginCall) {
        val protoBytesBase64 = call.data.getString("proto")
        val protoBytes = Base64.decode(protoBytesBase64, Base64.NO_WRAP)
        val msg = Message.UserMessage.parseFrom(protoBytes)
        val result = EncryptionWrapper( db)
            .decrypt(msg.from, msg.text.toByteArray(), msg.type)

        val dmsg = DMessage(msg.id, msg.conversationId, msg.from, msg.to, result)

        call.resolve(dMessageToJsObj(dmsg))
    }


    @PluginMethod
    suspend fun encryptAndSend(call: PluginCall) {
        val apiUrl = call.data.getString("apiUrl")!!
        val conversationId = call.data.getInteger("convoId")!!
        val payloadB64 = call.data.getString("text")!!
        val to = call.data.getString("to")!!
        val token = call.data.getString("token")!!
        val payload = Base64.decode(payloadB64, Base64.NO_WRAP)
        val msg = EncryptionWrapper(db).encryptAndSend(apiUrl, to, conversationId.toLong(), payload, token)
        call.resolve(dMessageToJsObj(msg))
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
}