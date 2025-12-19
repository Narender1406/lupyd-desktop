package com.lupyd.app


import android.content.Context
import android.util.Log
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import org.signal.libsignal.protocol.SignalProtocolAddress



import androidx.room.*
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
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

val TAG = "lupyd-store"

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

@Entity(tableName = "last_seen_timestamps")
class LastSeenTimestamp(
    @PrimaryKey val username: String,
    val lastMessageSeenTimestamp: Long
)

@Dao
interface LastSeenTimestampDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(entry: LastSeenTimestamp)

    @Query("SELECT lastMessageSeenTimestamp FROM last_seen_timestamps WHERE username = :username")
    suspend fun get(username: String): Long?
}

@Database(entities = [
    KeyValueEntry::class,
    PreKeyEntry::class,
    SignedPreKeyEntry::class,
    KyberPreKeyEntry::class,
    SessionEntry::class,
    IdentityEntry::class,
    TrustedKeyEntry::class,
    LastSeenTimestamp::class,
    DMessageNotification::class,
                     ], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun preKeysDao(): PreKeysDao
    abstract fun signedPreKeysDao(): SignedPreKeysDao
    abstract fun kyberPreKeysDao(): KyberPreKeysDao
    abstract fun sessionsDao(): SessionsDao
    abstract fun identitiesDao(): IdentitiesDao
    abstract fun trustedKeysDao(): TrustedKeysDao
    abstract fun keyValueDao(): KeyValueDao

    abstract fun lastSeenTimestampDao(): LastSeenTimestampDao

    abstract fun userMessageNotificationsDao(): UserMessageNotificationsDao
}

fun getDatabase(context: Context): AppDatabase {
    val db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
        .fallbackToDestructiveMigration(true)
        .build()
    return db
}



public class SqlPreKeyStore (val db: AppDatabase) : PreKeyStore {
    override fun loadPreKey(preKeyId: Int): PreKeyRecord? {
        val value = runBlocking {
            db.preKeysDao().get(preKeyId)
        }
        Log.d(TAG, "loadPreKey $preKeyId ${value != null}")
        if (value == null) {
            return null
        }
        return PreKeyRecord(value)
    }

    override fun storePreKey(
        preKeyId: Int,
        record: PreKeyRecord?
    ) {
        Log.d(TAG, "storePreKey $preKeyId")
        if (record == null) {
            return
        }
        runBlocking {
            db.preKeysDao().put(PreKeyEntry(preKeyId, record.serialize()))
        }
    }

    override fun containsPreKey(preKeyId: Int): Boolean {
        val result = loadPreKey(preKeyId) != null
        Log.d(TAG, "containsPreKey $preKeyId $result")
        return result
    }

    override fun removePreKey(preKeyId: Int) {
        Log.d(TAG, "removePreKey $preKeyId")
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
        Log.d(TAG, "loadSession ${address.name}:${address.deviceId} ${value != null}")
        if (value == null) {
            return null
        }
        return SessionRecord(value)
    }

    override fun loadExistingSessions(addresses: List<SignalProtocolAddress?>?): List<SessionRecord> {
        if (addresses == null) {
            return emptyList()
        }
        val result = addresses.mapNotNull { loadSession(it) }
        Log.d(TAG, "loadExistingSessions ${addresses.size} $result")
        return result
    }

    override fun getSubDeviceSessions(name: String?): List<Int> {
        if (name == null) {
            return emptyList()
        }
        val result = runBlocking {
            db.sessionsDao().getSubDeviceSessions(name)
        }
        Log.d(TAG, "getSubDeviceSessions $name $result")
        return result
    }

    override fun storeSession(
        address: SignalProtocolAddress?,
        record: SessionRecord?
    ) {
        if (address == null || record == null) {
            return
        }
        Log.d(TAG, "storeSession ${address.name}:${address.deviceId}")
        runBlocking {
            db.sessionsDao().put(SessionEntry(address.name, address.deviceId, record.serialize()))
        }
    }

    override fun containsSession(address: SignalProtocolAddress?): Boolean {
        val result = loadSession(address) != null
        Log.d(TAG, "containsSession ${address?.name}:${address?.deviceId} $result")
        return result
    }

    override fun deleteSession(address: SignalProtocolAddress?) {
        if (address == null) {
            return
        }
        Log.d(TAG, "deleteSession ${address.name}:${address.deviceId}")
        runBlocking {
            db.sessionsDao().delete(address.name, address.deviceId)
        }
    }

    override fun deleteAllSessions(name: String?) {
        if (name == null) {
            return
        }
        Log.d(TAG, "deleteAllSessions $name")
        runBlocking {
            db.sessionsDao().deleteAll(name)
        }
    }
}

public class SqlIdentityKeyStore(val db: AppDatabase): IdentityKeyStore {
    override fun getIdentityKeyPair(): IdentityKeyPair? {
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
        Log.d(TAG, "getIdentityKeyPair null ${key != null}")
        return key
    }

    override fun getLocalRegistrationId(): Int {
        val value = runBlocking {
            db.identitiesDao().get()
        }
        val result = value?.registrationId ?: 1
        Log.d(TAG, "getLocalRegistrationId null $result")
        return result
    }

    override fun saveIdentity(
        address: SignalProtocolAddress?,
        identityKey: IdentityKey?
    ): IdentityKeyStore.IdentityChange? {
        if (address == null || identityKey == null) {
            return null
        }
        Log.d(TAG, "saveIdentity ${address.name}:${address.deviceId}")
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
//        val trusted = getIdentity(address)
//        val result = trusted == null || trusted == identityKey
        val result = true
        Log.d(TAG, "isTrustedIdentity ${address?.name}:${address?.deviceId} $result")
        return result
    }

    override fun getIdentity(address: SignalProtocolAddress?): IdentityKey? {
        if (address == null) {
            return null
        }
        val value = runBlocking {
            db.trustedKeysDao().get(address.name, address.deviceId)
        }
        Log.d(TAG, "getIdentity ${address.name}:${address.deviceId} ${value != null}")
        if (value == null) {
            return null
        }
        return IdentityKey(value, 0)
    }

}

public class SqlSignedPreKeyStore(val db: AppDatabase): SignedPreKeyStore {
    override fun loadSignedPreKey(signedPreKeyId: Int): SignedPreKeyRecord? {
        val value = runBlocking {
            db.signedPreKeysDao().get(signedPreKeyId)
        }
        Log.d(TAG, "loadSignedPreKey $signedPreKeyId ${value != null}")
        if (value == null) {
            return null
        }
        return SignedPreKeyRecord(value)
    }

    override fun loadSignedPreKeys(): List<SignedPreKeyRecord> {
        val values = runBlocking {
            db.signedPreKeysDao().getAll()
        }
        Log.d(TAG, "loadSignedPreKeys null ${values.size}")
        return values.map { SignedPreKeyRecord(it) }
    }

    override fun storeSignedPreKey(
        signedPreKeyId: Int,
        record: SignedPreKeyRecord?
    ) {
        if (record == null) {
            return
        }
        Log.d(TAG, "storeSignedPreKey $signedPreKeyId")
        runBlocking {
            db.signedPreKeysDao().put(SignedPreKeyEntry(signedPreKeyId, record.serialize()))
        }
    }

    override fun containsSignedPreKey(signedPreKeyId: Int): Boolean {
        val result = loadSignedPreKey(signedPreKeyId) != null
        Log.d(TAG, "containsSignedPreKey $signedPreKeyId $result")
        return result
    }

    override fun removeSignedPreKey(signedPreKeyId: Int) {
        Log.d(TAG, "removeSignedPreKey $signedPreKeyId")
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
        Log.d(TAG, "loadKyberPreKey $kyberPreKeyId ${value != null}")
        if (value == null) {
            return null
        }
        return KyberPreKeyRecord(value)
    }

    override fun loadKyberPreKeys(): List<KyberPreKeyRecord> {
        val values = runBlocking {
            db.kyberPreKeysDao().getAll()
        }
        Log.d(TAG, "loadKyberPreKeys null ${values.size}")
        return values.map { KyberPreKeyRecord(it) }
    }

    override fun storeKyberPreKey(
        kyberPreKeyId: Int,
        record: KyberPreKeyRecord?
    ) {
        if (record == null) {
            return
        }
        Log.d(TAG, "storeKyberPreKey $kyberPreKeyId")
        runBlocking {
            db.kyberPreKeysDao().put(KyberPreKeyEntry(kyberPreKeyId, record.serialize()))
        }
    }

    override fun containsKyberPreKey(kyberPreKeyId: Int): Boolean {
        val result = loadKyberPreKey(kyberPreKeyId) != null
        Log.d(TAG, "containsKyberPreKey $kyberPreKeyId $result")
        return result
    }

    override fun markKyberPreKeyUsed(
        kyberPreKeyId: Int,
        signedPreKeyId: Int,
        baseKey: ECPublicKey?
    ) {
        Log.d(TAG, "markKyberPreKeyUsed $kyberPreKeyId")
//        super.markKyberPreKeyUsed(kyberPreKeyId, signedPreKeyId, baseKey)
    }

}

class SqlKeyValueStore(private val db: AppDatabase) {
    fun put(key: String, value: String) {
        Log.d(TAG, "put $key")
        runBlocking {
            db.keyValueDao().put(KeyValueEntry(key, value))
        }
    }

    fun get(key: String): String? {
        val value = runBlocking {
            db.keyValueDao().get(key)
        }
        Log.d(TAG, "get $key ${value != null}")
        return value
    }

    fun delete(key: String) {
        Log.d(TAG, "delete $key")
        runBlocking {
            db.keyValueDao().delete(key)
        }
    }
}
