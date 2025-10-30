package com.lupyd.app

import androidx.room.*


@Entity(tableName = "user_messages",
    primaryKeys = ["conversationId", "msgId"],
    indices = [Index(value=["from", "to", "msgId"])]
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

    @Query("SELECT t1.*\n" +
            "FROM user_messages t1\n" +
            "WHERE t1.msgId = (\n" +
            "  SELECT MAX(t2.msgId)\n" +
            "  FROM user_messages t2\n" +
            "  WHERE t2.mfrom = t1.mfrom AND t2.mto = t1.mto\n" +
            ");\n ")
    suspend fun getLastMessagesFromAllConversations(): List<DMessage>
}
