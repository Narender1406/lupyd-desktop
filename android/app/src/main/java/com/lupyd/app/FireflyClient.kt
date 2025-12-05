package com.lupyd.app

import android.content.Context
import android.util.Log
import firefly.Message
import org.json.JSONObject
import uniffi.firefly_signal.FfiFireflyWsClient
import uniffi.firefly_signal.FireflyWsClientCallback
import uniffi.firefly_signal.LastMessageAndUnreadCount
import uniffi.firefly_signal.MessagesStore
import uniffi.firefly_signal.TokenResponse
import uniffi.firefly_signal.UserMessage

class FireflyClient() {

    companion object {
        private var instance: FireflyClient? = null

        fun getInstance(ctx: Context): FireflyClient {
            if (instance == null) {
                instance = FireflyClient(ctx)
            }
            return instance!!
        }
    }
    lateinit var notificationHandler: NotificationHandler

    private constructor(ctx: Context) : this() {
        notificationHandler = NotificationHandler(ctx)
    }

    val tag = "lupyd-firefly"

    var isRunning = false

    lateinit var client: FfiFireflyWsClient
    lateinit var messagesStore: MessagesStore

    private val onMessageCallbacks = mutableSetOf<(UserMessage) -> Unit>()

    fun addOnMessageCallback(cb: (UserMessage) -> Unit) {
        onMessageCallbacks.add(cb)
    }

    fun removeOnMessageCallback(cb: (UserMessage) -> Unit) {
        onMessageCallbacks.remove(cb)
    }

    suspend fun initialize(ctx: Context) {
        notificationHandler = NotificationHandler(ctx)

        try {

            if (isRunning) {
                return
            }

            isRunning = true
            val dbPath = ctx.getDatabasePath("firefly/firefly.db").absolutePath

            messagesStore = MessagesStore.fromPath(ctx.getDatabasePath("user_messages/user_messages.db").absolutePath)

            val callbacks = object: FireflyWsClientCallback {
                override suspend fun onMessage(message: UserMessage) {
                    try {
                        onUserMessage(message)
                    } catch (e: Exception) {
                        Log.e(tag, "failed to handle message: ${e.toString()}")
                    }

                }
            }

            client = FfiFireflyWsClient.create(Constants.FIREFLY_API_URL, Constants.FIREFLY_WS_URL, 1000.toULong(),
                callbacks,
                dbPath,
                5000.toULong(),
                Constants.AUTH0_CLIENT_ID,
                Constants.AUTH0_DOMAIN,
                )

            client.initializeWithRetrying()

        } catch (e: Exception) {
            Log.e(tag, "firefly client ended ${e}")
        } finally {
            isRunning = false
        }
    }

    suspend fun onUserMessage(msg: UserMessage) {
        val msgInner = Message.UserMessageInner.parseFrom(msg.message)

        if (msgInner.hasCallMessage()) {
            val callMsg = msgInner.callMessage

            Log.i(tag, "Received call message type: ${callMsg.type}")

            if (callMsg.type == Message.CallMessageType.candidate
                || callMsg.type == Message.CallMessageType.offer
                || callMsg.type == Message.CallMessageType.answer) {


                for (onMessageCb in onMessageCallbacks) {
                    onMessageCb(msg)
                }
                return
            }


            if (callMsg.type == Message.CallMessageType.end || callMsg.type == Message.CallMessageType.reject) {
                val maxLimit = 1000
                val limit = 100
                var cursor = msg.id
                var msgsProcessed = 0

                notificationHandler.cancelCallNotification(callMsg.sessionId)

                while (msgsProcessed < maxLimit) {

                    val messages = messagesStore.getLastMessagesOf(msg.other, cursor.toLong(), limit.toLong())

                    if (messages.isEmpty()) {
                        break
                    }

                    msgsProcessed += messages.size
                    cursor = messages.last().id

                    val startMessage = messages.find {
                        val curInner = Message.UserMessageInner.parseFrom(it.message)
                        if (curInner.hasCallMessage()) {
                            val curCallMessage = curInner.callMessage
                            if (curCallMessage.sessionId == callMsg.sessionId && curCallMessage.type == Message.CallMessageType.request) {
                                return@find true
                            }
                        }
                        false
                    }

                    if (startMessage != null) {
                        val newCallMessage = Message.CallMessage.newBuilder(callMsg)
                            .setType(Message.CallMessageType.ended)
                            .setJsonBody(JSONObject()
                                .put("duration", msg.id - startMessage.id)
                                .toString())
                            .build()

                        val newInner = Message.UserMessageInner.newBuilder(msgInner)
                            .setCallMessage(newCallMessage).build()


                        val newMsg = UserMessage(msg.id, msg.convoId, msg.other, newInner.toByteArray(), msg.sentByOther)


                            for (onMessageCb in onMessageCallbacks) {
                                onMessageCb(msg)
                                onMessageCb(newMsg)
                            }
                        saveMessage(newMsg)
                        return
                    }
                }
            }

            if (callMsg.type == Message.CallMessageType.request) {

                if (msg.sentByOther) {
                    notificationHandler.showCallNotification(msg.other, msg.convoId.toLong(), callMsg.sessionId)
                }
            }
        }

        Log.i(tag, "Saving message ${msg}")
        saveMessage(msg)

        for (onMessageCb in onMessageCallbacks) {
            onMessageCb(msg)
        }
    }

    suspend fun encryptAndSend(message: ByteArray, convoId: Long, to: String) : UserMessage {
        val message = client.encryptAndSend(to, message, convoId.toULong())
        onUserMessage(message)

        return message
    }


    suspend fun updateAuthTokens(accessToken: String, refreshToken: String) {
        val tokens = TokenResponse(accessToken, refreshToken)
        client.setAuthTokens(tokens)
    }

    suspend fun getLastConversations(): List<LastMessageAndUnreadCount> {
        return messagesStore.getLastMessageFromAllConversations()
    }

    suspend fun getLastMessagesOf(other: String, before: Long, limit: Long): List<UserMessage> {
        return messagesStore.getLastMessagesOf(other, before, limit)
    }

    suspend fun saveMessage(message: UserMessage) {
        messagesStore.insertUserMessage(message)
    }

    suspend fun markAsReadUntil(other: String, id: Long) {
        messagesStore.markAsReadUntil(other, id)
    }

    suspend fun sendFcmTokenToServer(token: String?) {
        client.uploadFcmToken(token)
    }

}