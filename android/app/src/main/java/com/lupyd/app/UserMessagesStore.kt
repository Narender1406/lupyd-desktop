package com.lupyd.app

import androidx.room.*


@Entity(tableName = "user_messages",
    primaryKeys = ["conversationId", "msgId"],
    indices = [Index(value=["mfrom", "mto", "msgId"])]
    )
class DMessage(
    val msgId: Long,
    val conversationId: Long,
    val mfrom: String,
    val mto: String,
    val text: ByteArray
)


@Dao
interface DMessagesDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun put(msg: DMessage)

    @Query("SELECT * FROM user_messages WHERE mfrom = :from AND mto = :to AND msgId < :before ORDER BY msgId DESC LIMIT :limit")
    suspend fun getLastMessages(from: String, to: String, before: Long, limit: Int): List<DMessage>

    @Query("SELECT * FROM user_messages WHERE ((mfrom = :from AND mto = :to) OR (mfrom = :to AND mto = :from) AND msgId < :before) ORDER BY msgId DESC LIMIT :limit")
    suspend fun getLastMessagesInBetween(from: String, to: String, before: Long, limit: Int): List<DMessage>

    @Query("select t1.* from user_messages t1 where t1.msgId = ( select max(t2.msgId) from user_messages t2 where t2.mfrom = t1.mfrom and t2.mto = t1.mto )")
    suspend fun getLastMessagesFromAllConversations(): List<DMessage>
}
