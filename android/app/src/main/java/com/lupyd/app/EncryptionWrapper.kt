package com.lupyd.app

import android.R
import android.util.Log
import com.google.protobuf.ByteString
import firefly.Message
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.http.cio.Response
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.SessionBuilder
import org.signal.libsignal.protocol.SessionCipher
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.ecc.ECPublicKey
import org.signal.libsignal.protocol.kem.KEMPublicKey
import org.signal.libsignal.protocol.message.CiphertextMessage
import org.signal.libsignal.protocol.message.PreKeySignalMessage
import org.signal.libsignal.protocol.message.SignalMessage
import org.signal.libsignal.protocol.state.PreKeyBundle

val httpClient = HttpClient(CIO)

class EncryptionWrapper(val db: AppDatabase) {

    val tag = "Encryption"


    val sessionStore = SqlSessionStore(db)
    val identityStore = SqlIdentityKeyStore(db)
    val preKeyStore = SqlPreKeyStore(db)
    val signedPreKeyStore = SqlSignedPreKeyStore(db)
    val kyberPreKeyStore = SqlKyberPreKeyStore(db)


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
        apiUrl: String,
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

        val response = httpClient.post("${apiUrl}/user/message") {
            headers {
                append(HttpHeaders.Authorization, "Bearer $token")
                append(HttpHeaders.ContentType, "application/x-protobuf; proto=firefly.UserMessage")
            }
            setBody(body)
        }

        return response
    }

    suspend fun encryptAndSend(
        apiUrl: String,
        to: String,
        conversationId: Long,
        payload: ByteArray,
        token: String,
    ): DMessage {
        val cipherText = encrypt(to, payload)
        val response = sendMessage(apiUrl, conversationId, cipherText.serialize(), cipherText.type, token)

        if (response.status.isSuccess()) {
            val body = response.bodyAsBytes()
            val msg = Message.UserMessage.parseFrom(body)
            val dMsg = DMessage(msg.id, msg.conversationId, msg.from, msg.to, payload)
            return dMsg
        } else if (response.status == HttpStatusCode.NotFound) {
            val response = httpClient.post("${apiUrl}/user/conversation?other=${to}") {
                headers {
                    append(HttpHeaders.Authorization, "Bearer $token")
                }
            }

            if (response.status.isSuccess()) {
                val conversationStart = Message.ConversationStart.parseFrom(response.bodyAsBytes())
                if (!conversationStart.bundle.equals(Message.PreKeyBundle.getDefaultInstance())) {
                    processPreKeyBundle(conversationStart.bundle, to)
                    val cipherText = encrypt(to, payload)
                    val response = sendMessage(apiUrl,
                        conversationStart.conversationId,
                        cipherText.serialize(),
                        cipherText.type,
                        token
                    )

                    if (response.status.isSuccess()) {
                        val body = response.bodyAsBytes()
                        val msg = Message.UserMessage.parseFrom(body)
                        val dMsg = DMessage(msg.id, msg.conversationId, msg.from, msg.to, payload)
                        return dMsg
                    } else {
                        Log.e(
                            tag,
                            "unexpected from server: ${response.status} ${response.bodyAsText()}"
                        )
                    }
                } else {
                    Log.e(
                        tag,
                        "received no pre key bundle"
                    )
                }
            }
        } else {
            Log.e(tag, "unexpected from server: ${response.status} ${response.bodyAsText()}")
        }
        throw Exception("Unable to encrypt and send message")
    }

    fun processPreKeyBundle(bundle: Message.PreKeyBundle, owner: String) {
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
    }
}
