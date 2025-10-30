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

    fun saveUserMessage(msg: DMessage) {
        db.messagesDao().put(dmsg)
        notifyListeners("onUserMessage", dMessageToJsObj((msg)))
    }


    @PluginMethod
    fun onUserMessage(call: PluginCall) {

        val conversationId = call.data.getInteger("convoId")
        val from = call.data.getString("from")
        val to = call.data.getString("to")
        val textB64 = call.data.getString("textB64")
        val type = call.data.getInteger("type")
        val text = Base64.decode(textB64, Base64.NO_WRAP)
        val id = call.data.getInteger("id")
        val result = EncryptionWrapper(db)
            .decrypt(from, text, type)

        val dmsg = DMessage(id, conversationId, from, to, result)
        saveUserMessage(dmsg)

        call.resolve(dMessageToJsObj(dmsg))
    }


    @PluginMethod
    suspend fun encryptAndSend(call: PluginCall) {
        val apiUrl = call.data.getString("apiUrl")!!
        val conversationId = call.data.getInteger("convoId")!!
        val payloadB64 = call.data.getString("textB64")!!
        val to = call.data.getString("to")!!
        val token = call.data.getString("token")!!
        val payload = Base64.decode(payloadB64, Base64.NO_WRAP)
        val dmsg = EncryptionWrapper(db).encryptAndSend(apiUrl, to, conversationId.toLong(), payload, token)

        saveUserMessage(dmsg)
        
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
}
