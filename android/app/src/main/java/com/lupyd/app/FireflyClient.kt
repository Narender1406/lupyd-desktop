package com.lupyd.app

import android.content.Context
import android.util.Log
import firefly.Message
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject
import uniffi.firefly_signal.ConnectionState
import uniffi.firefly_signal.FfiConversation
import uniffi.firefly_signal.FfiFireflyWsClient
import uniffi.firefly_signal.FireflyWsClientCallback
import uniffi.firefly_signal.GroupInfo
import uniffi.firefly_signal.GroupMessage
import uniffi.firefly_signal.LastMessageAndUnreadCount
import uniffi.firefly_signal.MessagesStore
import uniffi.firefly_signal.TokenResponse
import uniffi.firefly_signal.UpdateRoleProposalFfi
import uniffi.firefly_signal.UpdateUserProposalFfi
import uniffi.firefly_signal.UserMessage
import uniffi.firefly_signal.initLogger
import java.io.File

class FireflyClient() {

    companion object {
        private const val TAG = "lupyd-firefly"
        private var instance: FireflyClient? = null

        fun getInstance(ctx: Context): FireflyClient {
            if (instance == null) {
                val logPath = File(ctx.filesDir, "libfirefly.log").canonicalPath
                Log.i(TAG, "using logpath: ${logPath}")
                initLogger(logPath)
                instance = FireflyClient(ctx)
            }
            return instance!!
        }
    }

    lateinit var notificationHandler: NotificationHandler

    private constructor(ctx: Context) : this() {
        notificationHandler = NotificationHandler(ctx)
    }

    private val tag = TAG


    var client: FfiFireflyWsClient? = null
    var messagesStore: MessagesStore? = null

    private val onMessageCallbacks = mutableSetOf<(UserMessage) -> Unit>()
    private val onGroupMessageCallbacks = mutableSetOf<(GroupMessage) -> Unit>()

    fun addOnMessageCallback(cb: (UserMessage) -> Unit) {
        onMessageCallbacks.add(cb)
    }

    fun removeOnMessageCallback(cb: (UserMessage) -> Unit) {
        onMessageCallbacks.remove(cb)
    }

    fun addOnGroupMessageCallback(cb: (GroupMessage) -> Unit) {
        onGroupMessageCallbacks.add(cb)
    }

    fun removeOnGroupMessageCallback(cb: (GroupMessage) -> Unit) {
        onGroupMessageCallbacks.remove(cb)
    }


    suspend fun initialize(ctx: Context) {
        notificationHandler = NotificationHandler(ctx)

        try {
            if (messagesStore == null) {
                messagesStore =
                    MessagesStore.fromPath(ctx.getDatabasePath("user_messages.db").absolutePath)
            }

            if (client == null) {
                val callbacks = object : FireflyWsClientCallback {
                    override suspend fun onMessage(message: UserMessage) {
                        try {
                            onUserMessage(message)
                        } catch (e: Exception) {
                            Log.e(tag, "failed to handle message: ${e.toString()}")
                        }

                    }

                    override suspend fun onGroupMessage(groupMessage: GroupMessage) {
                        try {
                            onGroupMessageCb(groupMessage)
                        } catch (e: Exception) {
                            Log.e(tag, "failed to handle group message: $e")
                        }
                    }
                }
                val dbPath = ctx.getDatabasePath("firefly.db").absolutePath

                client = FfiFireflyWsClient.create(
                    Constants.FIREFLY_API_URL, Constants.FIREFLY_WS_URL, 1000.toULong(),
                    callbacks,
                    dbPath,
                    5000.toULong(),
                    Constants.AUTH0_CLIENT_ID,
                    Constants.AUTH0_DOMAIN,
                )
            }
            if (client!!.getConnectionState() == ConnectionState.DISCONNECTED) {
                GlobalScope.launch {
                    Log.e(tag, " fireflyWs initializing with retrying");
                    try {
                        client!!.initializeWithRetrying()

                    } catch (e: Exception) {
                        Log.e(tag, "failed to initialize client: ${e.toString()}")
                    }

                }
            }




        } catch (e: Exception) {
            Log.e(tag, "firefly client ended ${e}")

        }
    }

    suspend fun waitUntilConnected(timeoutInMs: Long) {
        val intervalInMs = 100L
        var triesLeft = timeoutInMs / intervalInMs
        while (client!!.getConnectionState() != ConnectionState.CONNECTED) {
            if (triesLeft <= 0) {
                throw Exception("timeout failed to connect to internet")
            }
            delay(intervalInMs)
            triesLeft -= 1
        }
    }

    suspend fun onGroupMessageCb(msg: GroupMessage) {
        for (onMessageCb in onGroupMessageCallbacks) {
            onMessageCb(msg)
        }
    }

    suspend fun onUserMessage(msg: UserMessage) {
        val msgInner = Message.UserMessageInner.parseFrom(msg.message)

        if (msgInner.hasCallMessage()) {
            val callMsg = msgInner.callMessage

            Log.i(tag, "Received call message type: ${callMsg.type}")

            if (callMsg.type == Message.CallMessageType.candidate
                || callMsg.type == Message.CallMessageType.offer
                || callMsg.type == Message.CallMessageType.answer
            ) {


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

                    val messages =
                        messagesStore!!.getLastMessagesOf(msg.other, cursor.toLong(), limit.toLong())

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
                            .setJsonBody(
                                JSONObject()
                                    .put("duration", msg.id - startMessage.id)
                                    .toString()
                            )
                            .build()

                        val newInner = Message.UserMessageInner.newBuilder(msgInner)
                            .setCallMessage(newCallMessage).build()


                        val newMsg = UserMessage(
                            msg.id,
                            msg.other,
                            newInner.toByteArray(),
                            msg.sentByOther
                        )


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
                    notificationHandler.showCallNotification(
                        msg.other,
                        callMsg.sessionId
                    )
                }
            }
        }


        saveMessage(msg)

        for (onMessageCb in onMessageCallbacks) {
            onMessageCb(msg)
        }
    }

    suspend fun encryptAndSend(message: ByteArray, to: String): UserMessage {

        val message = client!!.encryptAndSend(to, message)
        onUserMessage(message)

        return message
    }

    suspend fun encryptAndSendGroup(message: ByteArray, groupId: Long) : Long {
        val messageId = client!!.encryptAndSendGroup(groupId.toULong(), message)

        return messageId.toLong()

    }

    suspend fun createGroup(name: String): GroupInfo {
        return client!!.createGroup(name, "")
    }

    suspend fun getAllGroups(): List<GroupInfo> {
        return client!!.groupInfoStore().getAllFfi()
    }

    suspend fun getGroupMessages(groupId: Long, startBefore: Long, limit: Long): List<GroupMessage> {
        return client!!.groupMessageStore().getFfi(groupId.toULong(), startBefore.toULong(), limit.toUInt())
    }

    suspend fun updateAuthTokens(accessToken: String, refreshToken: String) {
        val tokens = TokenResponse(accessToken, refreshToken)
        client!!.setAuthTokens(tokens)
    }

    suspend fun getLastConversations(): List<LastMessageAndUnreadCount> {
        return messagesStore!!.getLastMessageFromAllConversations()
    }

    suspend fun getLastMessagesOf(other: String, before: Long, limit: Long): List<UserMessage> {
        Log.d(tag, "getting last messages of ${other} ${before} ${limit}")
        if (messagesStore == null) {
            throw Exception("messagesStore is unitialized")
        }



        return messagesStore!!.getLastMessagesOf(other, before, limit)
    }

    suspend fun saveMessage(message: UserMessage) {
        Log.i(
            tag,
            "Saving message id: ${message.id} other: ${message.other} sentByOther: ${message.sentByOther}"
        )
        messagesStore!!.insertUserMessage(message)
    }

    suspend fun markAsReadUntil(other: String, id: Long) {
        messagesStore!!.markAsReadUntil(other, id)
    }

    suspend fun sendFcmTokenToServer(token: String?) {
        client!!.uploadFcmToken(token)
    }

    suspend fun getGroupExtension(groupId: Long): ByteArray {
        return client!!.getGroupExtension(groupId.toULong())
    }

    suspend fun getGroupInfo(groupId: Long): GroupInfo {
        return client!!.groupInfoStore().getFfi(groupId.toULong())
    }

    suspend fun getGroupLastMessages(): List<GroupMessage> {
        return client!!.groupMessageStore().getAllLastMessagesFfi()
    }

    suspend fun updateGroupChannel(groupId: Long, id: Int, delete: Boolean, name: String, channelTy: UByte, defaultPermissions: Int): Long {
        return client!!.updateGroupChannel(groupId.toULong(), id.toUInt(), delete, name, channelTy, defaultPermissions.toUInt()).toLong()
    }

    suspend fun updateGroupRoles(groupId: Long, roles: List<UpdateRoleProposalFfi>): Long {
        return client!!.updateGroupRoles(groupId.toULong(), roles).toLong()
    }

    suspend fun updateGroupRolesInChannel(groupId: Long, channelId: Int, roles: List<UpdateRoleProposalFfi>): Long {
        return client!!.updateGroupRolesInChannel(groupId.toULong(), channelId.toUInt(), roles).toLong()
    }

    suspend fun updateGroupUsers(groupId: Long, users: List<UpdateUserProposalFfi>): Long {
        return client!!.updateGroupUsers(groupId.toULong(), users).toLong()
    }

    suspend fun dispose() {
        client!!.dispose()
    }

    suspend fun getConversations(token: String): List<FfiConversation> {
        return client!!.getConversations(token)
    }

    fun getConnectionState(): ConnectionState {
        return client!!.getConnectionState()
    }

    suspend fun initializeWithRetrying() {
        client!!.initializeWithRetrying()
    }

    fun groupInfoStore() = client!!.groupInfoStore()
    
    fun groupMessageStore() = client!!.groupMessageStore()

    suspend fun setAuthTokens(tokens: TokenResponse) {
        client!!.setAuthTokens(tokens)
    }

    suspend fun uploadFcmToken(token: String?) {
        client!!.uploadFcmToken(token)
    }

}
