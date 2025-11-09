package com.lupyd.app

import android.content.Context
import android.util.Log
import androidx.room.withTransaction
import com.google.protobuf.ByteString
import com.nimbusds.jwt.SignedJWT
import firefly.Message
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.cache.HttpCache
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import org.json.JSONObject
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.SessionBuilder
import org.signal.libsignal.protocol.SessionCipher
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.ecc.ECKeyPair
import org.signal.libsignal.protocol.ecc.ECPublicKey
import org.signal.libsignal.protocol.kem.KEMKeyPair
import org.signal.libsignal.protocol.kem.KEMKeyType
import org.signal.libsignal.protocol.kem.KEMPublicKey
import org.signal.libsignal.protocol.message.CiphertextMessage
import org.signal.libsignal.protocol.message.PreKeySignalMessage
import org.signal.libsignal.protocol.message.SignalMessage
import org.signal.libsignal.protocol.state.KyberPreKeyRecord
import org.signal.libsignal.protocol.state.PreKeyBundle
import org.signal.libsignal.protocol.state.PreKeyRecord
import org.signal.libsignal.protocol.state.SignedPreKeyRecord
import kotlin.random.Random

val httpClient = HttpClient(CIO) {
    install(HttpCache)
}

class EncryptionWrapper(val context: Context, val onMessageCb: ((DMessage) -> Unit)? = null) {

    val tag = "lupyd-ec"

    val db = getDatabase(context)
    val sessionStore = SqlSessionStore(db)
    val identityStore = SqlIdentityKeyStore(db)
    val preKeyStore = SqlPreKeyStore(db)
    val signedPreKeyStore = SqlSignedPreKeyStore(db)
    val kyberPreKeyStore = SqlKyberPreKeyStore(db)


    suspend fun onUserMessage(
        from: String,
        to: String,
        text: ByteArray,
        messageType: Int,
        conversationId: Long,
        msgId: Long
    ): DMessage? {
        try {

            Log.i(tag, "Decrypting message from ${from} to ${to}")

            val decrypted = decrypt(from, text, messageType)

            Log.i(tag, "decrypted message from ${from} to ${to}")
            val dmsg = DMessage(msgId, conversationId, from, to, decrypted)


            if (isACallRequest(dmsg.mfrom, dmsg.conversationId, dmsg.text)) {
                Log.i(tag, "Call Received from ${dmsg.mfrom}")
            }


            handleMessage(dmsg)

            return dmsg
        } catch (e: Exception) {
            Log.e(tag, e.toString())
        }
        return null
    }

    fun isACallRequest(from: String, convoId: Long, text: ByteArray): Boolean {
        val msg = Message.UserMessageInner.parseFrom(text)
        if (msg.callMessage.equals(Message.CallMessage.getDefaultInstance())) {
            return false
        }

        val obj = JSONObject(msg.callMessage.message.toStringUtf8())

        Log.i(tag, "Call Message from $from: $obj")
        if (obj.has("type") && obj.get("type") == "request") {
            val sessionId = obj.getLong("sessionId")
            val expiry = obj.getLong("exp")
            if (expiry > System.currentTimeMillis()) {
                NotificationHandler(context).showCallNotification(from, convoId,sessionId)
                return true
            }
        }

        return false

    }


    fun decrypt(from: String, payload: ByteArray, messageType: Int): ByteArray {
        val session = SessionCipher(
            sessionStore, preKeyStore, signedPreKeyStore,
            kyberPreKeyStore, identityStore,
            SignalProtocolAddress(from, 1)
        )
        if (messageType == CiphertextMessage.PREKEY_TYPE) {
            val msg = PreKeySignalMessage(payload)
            val decrypted = session.decrypt(msg)

            return decrypted

        } else if (messageType == CiphertextMessage.WHISPER_TYPE) {
            val msg = SignalMessage(payload)
            val decrypted = session.decrypt(msg)

            return decrypted
        } else {
            throw Exception("Unhandled Message Type ${messageType}")
        }
    }

    fun encrypt(to: String, payload: ByteArray): CiphertextMessage {
        val session = SessionCipher(
            sessionStore, preKeyStore, signedPreKeyStore,
            kyberPreKeyStore, identityStore,
            SignalProtocolAddress(to, 1)
        )
        val cipherText = session.encrypt(payload)
        return cipherText
    }

    suspend fun sendMessage(
        conversationId: Long,
        text: ByteArray,
        msgType: Int,
        token: String
    ): HttpResponse {
        val originalMsg = Message.UserMessage.newBuilder()
            .setConversationId(conversationId)
            .setText(ByteString.copyFrom(text))
            .setType(msgType)
            .build()

        val body = originalMsg.toByteArray()

        val response = httpClient.post("${Constants.FIREFLY_API_URL}/user/message") {
            headers {
                append(HttpHeaders.Authorization, "Bearer $token")
                append(HttpHeaders.ContentType, "application/x-protobuf; proto=firefly.UserMessage")
            }
            setBody(body)
        }

        return response
    }


    suspend fun createConversation(other: String, token: String): Message.ConversationStart {
        val response =
            httpClient.post("${Constants.FIREFLY_API_URL}/user/conversation?other=${other}") {
                headers {
                    append(HttpHeaders.Authorization, "Bearer $token")
                }
            }

        if (response.status.isSuccess()) {
            return Message.ConversationStart.parseFrom(response.bodyAsBytes())
        }

        throw Exception("Unable to create conversation ${response.status} ${response.bodyAsText()}")
    }


    suspend fun encryptAndSend(
        to: String,
        convoId: Long,
        payload: ByteArray,
        token: String,
    ): DMessage {

        var conversationId = convoId
        if (conversationId == 0L) {
            Log.i(tag, "Creating conversation because conversationId is 0")
            val convo = createConversation(to, token)
            processPreKeyBundle(convo.bundle!!, to)

            conversationId = convo.conversationId
        }

        var cipherText: CiphertextMessage?

        try {
            cipherText = encrypt(to, payload)
        } catch (e: Exception) {
            Log.i(tag, "Failed to encrypt ${e}, trying to recreate conversation")
            val convo = createConversation(to, token)
            processPreKeyBundle(convo.bundle!!, to)

            conversationId = convo.conversationId

            cipherText = encrypt(to, payload)
        }

        val response =
            sendMessage(conversationId, cipherText.serialize(), cipherText.type, token)

        if (response.status.isSuccess()) {
            val body = response.bodyAsBytes()
            val msg = Message.UserMessage.parseFrom(body)
            val dMsg = DMessage(msg.id, msg.conversationId, msg.from, msg.to, payload)
            handleMessage(dMsg)
            return dMsg
        } else if (response.status == HttpStatusCode.NotFound) {
            Log.i(tag, "That conversation id doesn't exist, recreating new one")
            val convo = createConversation(to, token)
            processPreKeyBundle(convo.bundle!!, to)
            conversationId = convo.conversationId
            cipherText = encrypt(to, payload)


            val response = sendMessage(
                conversationId,
                cipherText.serialize(),
                cipherText.type,
                token
            )

            if (response.status.isSuccess()) {
                val body = response.bodyAsBytes()
                val msg = Message.UserMessage.parseFrom(body)
                val dMsg = DMessage(msg.id, msg.conversationId, msg.from, msg.to, payload)

                handleMessage(dMsg)

                return dMsg
            } else {
                Log.e(
                    tag,
                    "unexpected from server: ${response.status} ${response.bodyAsText()}"
                )
            }


        }
        throw Exception("Unable to encrypt and send message")
    }


    fun getUsernameFromToken(token: String): String? {
        try {
            return SignedJWT.parse(token).payload.toJSONObject().get("uname") as String?
        } catch (e: Exception) {
            Log.e(tag, "Failed to get username from token ${e}")
        }
        return null
    }

    fun processPreKeyBundle(bundle: Message.PreKeyBundle, owner: String) {
        Log.i(tag, "Processing key bundle from ${owner} preKeyId: ${bundle.preKeyId}, sPreKeyId: ${bundle.signedPreKeyId}, kyberPreKeyId: ${bundle.kemPreKeyId}")

        if (bundle.equals(Message.PreKeyBundle.getDefaultInstance())) {
            throw Exception("PreKeyBundle is null")
        }


        val session = SessionBuilder(
            sessionStore, preKeyStore, signedPreKeyStore,
            identityStore,
            SignalProtocolAddress(owner, 1)
        )


        val preKeyBundle = PreKeyBundle(
            bundle.registrationId,
            bundle.deviceId,
            bundle.preKeyId,
            ECPublicKey(bundle.prePublicKey.toByteArray()),
            bundle.signedPreKeyId,
            ECPublicKey(bundle.signedPrePublicKey.toByteArray()),
            bundle.signedPreKeySignature.toByteArray(),
            IdentityKey(bundle.identityPublicKey.toByteArray()),
            bundle.kemPreKeyId,
            KEMPublicKey(bundle.kemPrePublicKey.toByteArray()),
            bundle.kemPreKeySignature.toByteArray()
        )

        session.process(preKeyBundle)

        Log.i(tag, "Processed key bundle from ${owner} preKeyId: ${bundle.preKeyId}")
    }

    suspend fun getAccessTokenFromLocalStore(): String? {
        try {
            val oldAccessToken = db.keyValueDao().get("auth0AccessToken") ?: return null

            Log.i(tag, "old access token ${oldAccessToken}")
                val token = SignedJWT.parse(oldAccessToken)

                Log.i(
                    tag,
                    "Parsed Signed Token ${token.header.toJSONObject()} ${token.payload.toJSONObject()} ${token.signature}"
                )

                val payload = token.payload.toJSONObject()

                val expiry = (payload.get("exp") as Number).toLong()
                val _username =
                    payload.get("uname") as String? ?: throw Exception("User not logged in")

                val now = System.currentTimeMillis() / 1000
                if (expiry < now) {
                    Log.i(tag, "Get a new token, because old one expired ${expiry} ${now}")
                    return null
                } else {
                    return oldAccessToken
                }

        } catch (e: Exception) {
            Log.i(tag, "Failed to get access token from local store ${e}")
        }

            return null
    }

    suspend fun getAccessToken(): String {

        val oldAccessToken = getAccessTokenFromLocalStore()

        if (oldAccessToken != null) {
            return oldAccessToken
        }

        Log.i(tag, "Getting new access token, old token: ${oldAccessToken}")
        return getNewAccessToken()
    }

    suspend fun getNewAccessToken(): String {

        val refreshToken = db.keyValueDao().get("auth0RefreshToken")
        if (refreshToken == null) {
            throw Exception("No refresh token")
        }
        val body = JSONObject()
            .put("grant_type", "refresh_token")
            .put("client_id", Constants.AUTH0_CLIENT_ID)
            .put("refresh_token", refreshToken)

        val oldAccessToken = getAccessTokenFromLocalStore()
        if (oldAccessToken != null) { return oldAccessToken }


        val response = httpClient.post("${Constants.AUTH0_DOMAIN}/oauth/token") {
            headers {
                append(HttpHeaders.ContentType, "application/json")
            }
            setBody(body.toString())
        }
        if (response.status.isSuccess()) {
            val body = response.bodyAsText()

            Log.i(tag, "Received Auth0 Response ${body}")
            val obj = JSONObject(body)

            val accessToken = obj.get("access_token") as String
            val refreshToken = obj.get("refresh_token") as String?


            val payload = SignedJWT.parse(accessToken).payload.toJSONObject()
            val username = payload.get("uname") as String?

            if (username == null) {
                throw Exception("User not logged in")
            }

            db.keyValueDao().put(KeyValueEntry("auth0AccessToken", accessToken))
            if (refreshToken != null) {
                db.keyValueDao().put(KeyValueEntry("auth0RefreshToken", refreshToken))
            }

            return accessToken
        } else {
            throw Exception("Unable to refresh token  ${response.status} ${response.bodyAsText()}")
        }
    }

    suspend fun syncUserMessages() {
        val limit = 100
        while (true) {
            var lastUserMessageTimestamp = 0L
            val lastUserMessageTimestampString =
                db.keyValueDao().get("lastUserMessageTimestampInMicroseconds")
            if (lastUserMessageTimestampString != null) {
                lastUserMessageTimestamp = lastUserMessageTimestampString.toLong()
            }
            Log.i(tag, "Syncing since ${lastUserMessageTimestamp}")
            val token = getAccessToken()
            val response = httpClient.get("${Constants.FIREFLY_API_URL}/user/sync") {
                headers {
                    append(HttpHeaders.Authorization, "Bearer ${token}")
                }
                parameter("since", lastUserMessageTimestamp.toString())
                parameter("limit", limit.toString())
            }

            if (response.status.isSuccess()) {
                val body = response.bodyAsBytes()
                Message.UserMessages.parseFrom(body).messagesList.forEach {
                    val dMsg = DMessage(
                        it.id,
                        it.conversationId,
                        it.from,
                        it.to,
                        it.text.toByteArray()
                    )

                    onUserMessage(
                        it.from,
                        it.to,
                        it.text.toByteArray(),
                        it.type,
                        it.conversationId,
                        it.id
                    )

                }

                if (Message.UserMessages.parseFrom(body).messagesCount < limit) {
                    break
                }
            } else {
                throw Exception("Unable to sync user messages ${response.status} ${response.bodyAsText()}")
            }
        }
    }

    suspend fun handleMessage(msg: DMessage) {
        Log.i(tag, "Handling message ${msg.msgId}")
        db.withTransaction {

            val value = db.keyValueDao().get("lastUserMessageTimestampInMicroseconds")

            Log.i(tag, "lastUserMessageTimestampInMicroseconds ${value}")
            if (value != null) {
                val lastSyncTimestamp = value.toLong()
                if (msg.msgId > lastSyncTimestamp) {
                    db.keyValueDao()
                        .put(KeyValueEntry("lastUserMessageTimestampInMicroseconds", msg.msgId.toString()))
                }
            } else {
                db.keyValueDao()
                    .put(KeyValueEntry("lastUserMessageTimestampInMicroseconds", msg.msgId.toString()))
            }
        }

        Log.i(tag, "Saving message ${msg.toString()}")
        db.messagesDao().put(msg)

        if (onMessageCb != null) {
            onMessageCb(msg)
        }
    }

    suspend fun markAsReadUntil(other: String, ts: Long) {
        db.withTransaction {
            val oldTs = db.lastSeenTimestampDao().get(other)
            if (oldTs == null) {
                db.lastSeenTimestampDao().put(LastSeenTimestamp(other, ts))
            } else {
                if (oldTs < ts) {
                    db.lastSeenTimestampDao().put(LastSeenTimestamp(other, ts))
                }
            }
        }
    }


    suspend fun recreateConversations(token: String) {

        Log.i(tag, "recreating conversations");
        val response = httpClient.patch("${Constants.FIREFLY_API_URL}/user/conversations") {
            headers {
                append(HttpHeaders.Authorization, "Bearer ${token}")
            }
        }

        if (!response.status.isSuccess()) {
            throw Exception("Unable to recreate conversations ${response.status} ${response.bodyAsText()}")
        }
    }

    suspend fun checkKeys(token: String) {
        var response = httpClient.get("${Constants.FIREFLY_API_URL}/user/preKeyBundles") {
            headers {
                append(HttpHeaders.Authorization, "Bearer ${token}")
            }
        }

        if (!response.status.isSuccess()) {
            throw Exception("Unable to get my key bundles ${response.status} ${response.bodyAsText()}")
        }


        val bundlesToDelete = ArrayList<Int>()

        val bundles = Message.PreKeyBundles.parseFrom(response.bodyAsBytes()).bundlesList

        Log.i(tag, "Received my pre key bundles length: ${bundles.size}")
        for (bundle in bundles) {
            if (null == db.preKeysDao().get(bundle.preKeyId)) {
                bundlesToDelete.add(bundle.preKeyId)
            }
        }

        Log.i(tag, "Bundles to delete ${bundlesToDelete.joinToString()}")
        if (bundlesToDelete.isNotEmpty()) {
            response = httpClient.delete("${Constants.FIREFLY_API_URL}/user/preKeyBundles") {
                parameter("ids", bundlesToDelete.joinToString(","))
                headers {
                    append(HttpHeaders.Authorization, "Bearer ${token}")
                }
            }
            if (!response.status.isSuccess()) {
                Log.e(tag, "Failed to delete bundles ${response.status} ${response.bodyAsText()}")
            }
        }

        val maxBundlesToKeep = 32
        val bundlesRemained = bundles.size - bundlesToDelete.size


        val bundlesToUpload = maxBundlesToKeep - bundlesRemained
        if (bundlesToUpload <= 0) {
            return
        }

        val preKeyBundles = Message.PreKeyBundles.newBuilder()
        val identityKey = SqlIdentityKeyStore(db).identityKeyPair!!

        for (_i in 0 until bundlesToUpload) {
            val bundle = newPreKeyBundle(identityKey)
            val proto = signalPreKeyBundleToProto(bundle)
            preKeyBundles.addBundles(proto)
        }

        Log.i(tag, "Uploading new pre key bundles ${bundlesToUpload} ${maxBundlesToKeep} ${bundlesRemained}")

        response = httpClient.post("${Constants.FIREFLY_API_URL}/user/preKeyBundles") {
            headers {
                append(HttpHeaders.Authorization, "Bearer ${token}")
                append(
                    HttpHeaders.ContentType,
                    "application/x-protobuf; proto=firefly.PreKeyBundles"
                )
            }
            setBody(preKeyBundles.build().toByteArray())
        }

        if (!response.status.isSuccess()) {
            Log.e(tag, "Failed to upload bundles ${response.status} ${response.bodyAsText()}")
        }
    }

    suspend fun newPreKeyBundle(identityKey: IdentityKeyPair): PreKeyBundle {
        val registrationId = 1
        val deviceId = 1
        val preKeyId = Random.nextInt(65534)
        val signedPreKeyId = Random.nextInt(65534)
        val kyberPreKeyId = Random.nextInt(65534)

        val preKey = ECKeyPair.generate()
        val signedPreKey = ECKeyPair.generate()

        val kemKeyPair = KEMKeyPair.generate(KEMKeyType.KYBER_1024)

        val signedPreKeySignature =
            identityKey.privateKey.calculateSignature(signedPreKey.publicKey.serialize())
        val kemPublicKeySignature =
            identityKey.privateKey.calculateSignature(kemKeyPair.publicKey.serialize())

        db.preKeysDao().put(
            PreKeyEntry(
                preKeyId,
                PreKeyRecord(preKeyId, preKey).serialize()
            )
        )


        db.signedPreKeysDao().put(
            SignedPreKeyEntry(
                signedPreKeyId,
                SignedPreKeyRecord(
                    signedPreKeyId,
                    System.currentTimeMillis(),
                    signedPreKey,
                    signedPreKeySignature
                ).serialize()
            )
        )

        db.kyberPreKeysDao().put(
            KyberPreKeyEntry(
                kyberPreKeyId,
                KyberPreKeyRecord(
                    kyberPreKeyId,
                    System.currentTimeMillis(),
                    kemKeyPair,
                    kemPublicKeySignature
                ).serialize()
            )
        )

        return PreKeyBundle(
            registrationId,
            deviceId,
            preKeyId,
            preKey.publicKey,
            signedPreKeyId,
            signedPreKey.publicKey,
            signedPreKeySignature,
            identityKey.publicKey,
            kyberPreKeyId,
            kemKeyPair.publicKey,
            kemPublicKeySignature
        )
    }

    fun signalPreKeyBundleToProto(bundle: PreKeyBundle): Message.PreKeyBundle {
        return Message.PreKeyBundle.newBuilder()
            .setRegistrationId(bundle.registrationId)
            .setDeviceId(bundle.deviceId)
            .setIdentityPublicKey(ByteString.copyFrom(bundle.identityKey.serialize()))
            .setPreKeyId(bundle.preKeyId)
            .setPrePublicKey(ByteString.copyFrom(bundle.preKey!!.serialize()))
            .setSignedPreKeyId(bundle.signedPreKeyId)
            .setSignedPrePublicKey(ByteString.copyFrom(bundle.signedPreKey.serialize()))
            .setSignedPreKeySignature(ByteString.copyFrom(bundle.signedPreKeySignature))
            .setKEMPreKeyId(bundle.kyberPreKeyId)
            .setKEMPrePublicKey(ByteString.copyFrom(bundle.kyberPreKey.serialize()))
            .setKEMPreKeySignature(ByteString.copyFrom(bundle.kyberPreKeySignature)).build()
    }

    suspend fun sendFcmTokenToServer(accessToken: String? = null) {
        val fcmToken = db.keyValueDao().get("fcmToken")
        if (fcmToken == null) {
            return
        }

        val token = if (accessToken == null) {
            getAccessToken()
        } else {
            accessToken
        }


        val response = httpClient.post("${Constants.FIREFLY_API_URL}/fcmToken") {
            headers {
                append(HttpHeaders.Authorization, "Bearer ${token}")
            }
            setBody(fcmToken)
        }
        if (!response.status.isSuccess()) {
            throw Exception("Unable to upload fcm token ${response.status} ${response.bodyAsText()}")
        }
    }

    suspend fun checkSetup() {

        Log.i(tag, "checking setup")

        val token = getAccessToken()
        sendFcmTokenToServer(token)

        val identity = db.identitiesDao().get()


        if (identity == null) {
            Log.i(tag, "Identity Key does not exist yet, recreating conversation")
            // first time registering user
            recreateConversations(token)
        } else {
            Log.i(tag, "Identitiy Key Exists")
        }

        checkKeys(token)

    }
}


