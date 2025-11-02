package com.lupyd.app


import android.content.Context
import org.signal.libsignal.protocol.SignalProtocolAddress



import androidx.room.*
import kotlinx.coroutines.runBlocking
import org.signal.libsignal.protocol.IdentityKey
import org.signal.libsignal.protocol.IdentityKeyPair
import org.signal.libsignal.protocol.ecc.ECPublicKey
import org.signal.libsignal.protocol.state.IdentityKeyStore
import org.signal.libsignal.protocol.state.KyberPreKeyRecord
import org.signal.libsignal.protocol.state.KyberPreKeyStore
import org.signal.libsignal.protocol.state.PreKeyRecord
import org.signal.libsignal.protocol.state.PreKeyStore
import org.signal.libsignal.protocol.state.SessionRecord
import org.signal.libsignal.protocol.state.SessionStore
import org.signal.libsignal.protocol.state.SignedPreKeyRecord
import org.signal.libsignal.protocol.state.SignedPreKeyStore

@Entity(tableName = "pre_keys")
class PreKeyEntry (
    @PrimaryKey val id: Int,
    val record: ByteArray,
)

@Dao
interface PreKeysDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: PreKeyEntry)

    @Query("SELECT record FROM pre_keys WHERE id = :id")
    suspend fun get(id: Int): ByteArray?

    @Query("DELETE FROM pre_keys WHERE id = :id")
    suspend fun delete(id: Int)
}

@Entity(tableName = "signed_pre_keys")
class SignedPreKeyEntry (
    @PrimaryKey val id: Int,
    val record: ByteArray,
)

@Dao
interface SignedPreKeysDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: SignedPreKeyEntry)

    @Query("SELECT record FROM signed_pre_keys WHERE id = :id")
    suspend fun get(id: Int): ByteArray?

    @Query("SELECT record FROM signed_pre_keys")
    suspend fun getAll(): List<ByteArray>

    @Query("DELETE FROM signed_pre_keys WHERE id = :id")
    suspend fun delete(id: Int)
}

@Entity(tableName = "kyber_pre_keys")
class KyberPreKeyEntry (
    @PrimaryKey val id: Int,
    val record: ByteArray,
)

@Dao
interface KyberPreKeysDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: KyberPreKeyEntry)

    @Query("SELECT record FROM kyber_pre_keys WHERE id = :id")
    suspend fun get(id: Int): ByteArray?

    @Query("SELECT record FROM kyber_pre_keys")
    suspend fun getAll(): List<ByteArray>

    @Query("DELETE FROM kyber_pre_keys WHERE id = :id")
    suspend fun delete(id: Int)
}

@Entity(tableName = "sessions", primaryKeys = ["name", "deviceId"])
class SessionEntry (
    val name: String,
    val deviceId: Int,
    val record: ByteArray,
)

@Dao
interface SessionsDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: SessionEntry)

    @Query("SELECT record FROM sessions WHERE name = :name AND deviceId = :deviceId")
    suspend fun get(name: String, deviceId: Int): ByteArray?

    @Query("SELECT deviceId FROM sessions WHERE name = :name")
    suspend fun getSubDeviceSessions(name: String): List<Int>

    @Query("DELETE FROM sessions WHERE name = :name AND deviceId = :deviceId")
    suspend fun delete(name: String, deviceId: Int)

    @Query("DELETE FROM sessions WHERE name = :name")
    suspend fun deleteAll(name: String)
}

@Entity(tableName = "identities")
class IdentityEntry (
    @PrimaryKey val id: Int = 0,
    val identityKeyPair: ByteArray,
    val registrationId: Int
)

@Entity(tableName = "trusted_keys", primaryKeys = ["name", "deviceId"])
class TrustedKeyEntry(
    val name: String,
    val deviceId: Int,
    val identityKey: ByteArray
)

@Dao
interface IdentitiesDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: IdentityEntry)

    @Query("SELECT * FROM identities WHERE id = 0")
    suspend fun get(): IdentityEntry?
}

@Dao
interface TrustedKeysDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: TrustedKeyEntry)

    @Query("SELECT identityKey FROM trusted_keys WHERE name = :name AND deviceId = :deviceId")
    suspend fun get(name: String, deviceId: Int): ByteArray?
}

@Entity(tableName = "key_value_store")
class KeyValueEntry(
    @PrimaryKey val k: String,
    val v: String
)

@Dao
interface KeyValueDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: KeyValueEntry)

    @Query("SELECT v FROM key_value_store WHERE k = :key")
    suspend fun get(key: String): String?

    @Query("DELETE FROM key_value_store WHERE k = :key")
    suspend fun delete(key: String)
}

@Database(entities = [
    DMessage::class,
    KeyValueEntry::class,
    PreKeyEntry::class,
    SignedPreKeyEntry::class,
    KyberPreKeyEntry::class,
    SessionEntry::class,
    IdentityEntry::class,
    TrustedKeyEntry::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun preKeysDao(): PreKeysDao
    abstract fun signedPreKeysDao(): SignedPreKeysDao
    abstract fun kyberPreKeysDao(): KyberPreKeysDao
    abstract fun sessionsDao(): SessionsDao
    abstract fun identitiesDao(): IdentitiesDao
    abstract fun trustedKeysDao(): TrustedKeysDao
    abstract fun keyValueDao(): KeyValueDao
    abstract fun messagesDao(): DMessagesDao
}


fun getDatabase(context: Context): AppDatabase {
    val db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db").build()
    return db
}



public class SqlPreKeyStore (val db: AppDatabase) : PreKeyStore {
    override fun loadPreKey(preKeyId: Int): PreKeyRecord? {
        val value = runBlocking {
            db.preKeysDao().get(preKeyId)
        }
        if (value == null) {
            return null
        }
        return PreKeyRecord(value)
    }

    override fun storePreKey(
        preKeyId: Int,
        record: PreKeyRecord?
    ) {
        if (record == null) {
            return
        }
        runBlocking {
            db.preKeysDao().put(PreKeyEntry(preKeyId, record.serialize()))
        }
    }

    override fun containsPreKey(preKeyId: Int): Boolean {
        return loadPreKey(preKeyId) != null
    }

    override fun removePreKey(preKeyId: Int) {
        runBlocking {
            db.preKeysDao().delete(preKeyId)
        }
    }
}

public class SqlSessionStore(val db: AppDatabase) : SessionStore {
    override fun loadSession(address: SignalProtocolAddress?): SessionRecord? {
        if (address == null) {
            return null
        }
        val value = runBlocking {
            db.sessionsDao().get(address.name, address.deviceId)
        }
        if (value == null) {
            return null
        }
        return SessionRecord(value)
    }

    override fun loadExistingSessions(addresses: List<SignalProtocolAddress?>?): List<SessionRecord> {
        if (addresses == null) {
            return emptyList()
        }
        return addresses.mapNotNull { loadSession(it) }
    }

    override fun getSubDeviceSessions(name: String?): List<Int> {
        if (name == null) {
            return emptyList()
        }
        return runBlocking {
            db.sessionsDao().getSubDeviceSessions(name)
        }
    }

    override fun storeSession(
        address: SignalProtocolAddress?,
        record: SessionRecord?
    ) {
        if (address == null || record == null) {
            return
        }
        runBlocking {
            db.sessionsDao().put(SessionEntry(address.name, address.deviceId, record.serialize()))
        }
    }

    override fun containsSession(address: SignalProtocolAddress?): Boolean {
        return loadSession(address) != null
    }

    override fun deleteSession(address: SignalProtocolAddress?) {
        if (address == null) {
            return
        }
        runBlocking {
            db.sessionsDao().delete(address.name, address.deviceId)
        }
    }

    override fun deleteAllSessions(name: String?) {
        if (name == null) {
            return
        }
        runBlocking {
            db.sessionsDao().deleteAll(name)
        }
    }
}

public class SqlIdentityKeyStore(val db: AppDatabase): IdentityKeyStore {
    override fun getIdentityKeyPair(): IdentityKeyPair? {
        val value = runBlocking {
            db.identitiesDao().get()
        }

        val key = runBlocking {
            db.withTransaction {
                val entry = db.identitiesDao().get()
                if (entry == null) {
                    val newKey = IdentityKeyPair.generate()
                    db.identitiesDao().put(IdentityEntry(0, newKey.serialize(), 1));
                    newKey
                } else {
                    IdentityKeyPair(entry.identityKeyPair)
                }
            }
        }

        return key
    }

    override fun getLocalRegistrationId(): Int {
        val value = runBlocking {
            db.identitiesDao().get()
        }
        return value?.registrationId ?: 1
    }

    override fun saveIdentity(
        address: SignalProtocolAddress?,
        identityKey: IdentityKey?
    ): IdentityKeyStore.IdentityChange? {
        if (address == null || identityKey == null) {
            return null
        }
        val existing = getIdentity(address)
        runBlocking {
            db.trustedKeysDao().put(TrustedKeyEntry(address.name, address.deviceId, identityKey.serialize()))
        }
        if (existing == null || existing == identityKey) {
            return IdentityKeyStore.IdentityChange.NEW_OR_UNCHANGED
        }
        return IdentityKeyStore.IdentityChange.REPLACED_EXISTING
    }

    override fun isTrustedIdentity(
        address: SignalProtocolAddress?,
        identityKey: IdentityKey?,
        direction: IdentityKeyStore.Direction?
    ): Boolean {
        if (address == null || identityKey == null) {
            return false
        }
        val trusted = getIdentity(address)
        return trusted == null || trusted == identityKey
    }

    override fun getIdentity(address: SignalProtocolAddress?): IdentityKey? {
        if (address == null) {
            return null
        }
        val value = runBlocking {
            db.trustedKeysDao().get(address.name, address.deviceId)
        } ?: return null
        return IdentityKey(value, 0)
    }

}

public class SqlSignedPreKeyStore(val db: AppDatabase): SignedPreKeyStore {
    override fun loadSignedPreKey(signedPreKeyId: Int): SignedPreKeyRecord? {
        val value = runBlocking {
            db.signedPreKeysDao().get(signedPreKeyId)
        }
        if (value == null) {
            return null
        }
        return SignedPreKeyRecord(value)
    }

    override fun loadSignedPreKeys(): List<SignedPreKeyRecord> {
        val values = runBlocking {
            db.signedPreKeysDao().getAll()
        }
        return values.map { SignedPreKeyRecord(it) }
    }

    override fun storeSignedPreKey(
        signedPreKeyId: Int,
        record: SignedPreKeyRecord?
    ) {
        if (record == null) {
            return
        }
        runBlocking {
            db.signedPreKeysDao().put(SignedPreKeyEntry(signedPreKeyId, record.serialize()))
        }
    }

    override fun containsSignedPreKey(signedPreKeyId: Int): Boolean {
        return loadSignedPreKey(signedPreKeyId) != null
    }

    override fun removeSignedPreKey(signedPreKeyId: Int) {
        runBlocking {
            db.signedPreKeysDao().delete(signedPreKeyId)
        }
    }

}

public class SqlKyberPreKeyStore(val db: AppDatabase): KyberPreKeyStore {
    override fun loadKyberPreKey(kyberPreKeyId: Int): KyberPreKeyRecord? {
        val value = runBlocking {
            db.kyberPreKeysDao().get(kyberPreKeyId)
        }
        if (value == null) {
            return null
        }
        return KyberPreKeyRecord(value)
    }

    override fun loadKyberPreKeys(): List<KyberPreKeyRecord> {
        val values = runBlocking {
            db.kyberPreKeysDao().getAll()
        }
        return values.map { KyberPreKeyRecord(it) }
    }

    override fun storeKyberPreKey(
        kyberPreKeyId: Int,
        record: KyberPreKeyRecord?
    ) {
        if (record == null) {
            return
        }
        runBlocking {
            db.kyberPreKeysDao().put(KyberPreKeyEntry(kyberPreKeyId, record.serialize()))
        }
    }

    override fun containsKyberPreKey(kyberPreKeyId: Int): Boolean {
        return loadKyberPreKey(kyberPreKeyId) != null
    }

    override fun markKyberPreKeyUsed(
        kyberPreKeyId: Int,
        signedPreKeyId: Int,
        baseKey: ECPublicKey?
    ) {
//        super.markKyberPreKeyUsed(kyberPreKeyId, signedPreKeyId, baseKey)
    }

}

class SqlKeyValueStore(private val db: AppDatabase) {
    fun put(key: String, value: String) {
        runBlocking {
            db.keyValueDao().put(KeyValueEntry(key, value))
        }
    }

    fun get(key: String): String? {
        return runBlocking {
            db.keyValueDao().get(key)
        }
    }

    fun delete(key: String) {
        runBlocking {
            db.keyValueDao().delete(key)
        }
    }
}
