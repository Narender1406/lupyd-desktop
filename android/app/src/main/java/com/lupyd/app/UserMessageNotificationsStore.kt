package com.lupyd.app

import androidx.room.Dao
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query

@Entity(tableName = "user_message_notifications",
    primaryKeys = ["other", "msgId"],
    )
class DMessageNotification(
    val msgId: Long,
    val other: String,
    val text: ByteArray,
    val sentByMe: Boolean,
)

@Dao
interface UserMessageNotificationsDao {
    @Query("SELECT * FROM user_message_notifications")
    suspend fun getAll(): List<DMessageNotification>


    @Query("SELECT * FROM user_message_notifications WHERE other = :user ORDER BY msgId LIMIT :limit")
    suspend fun getFromUser(user: String, limit: Int): List<DMessageNotification>

    @Insert
    suspend fun put(notification: DMessageNotification)

    @Query("DELETE FROM user_message_notifications")
    suspend fun deleteAll()

    @Query("DELETE FROM user_message_notifications WHERE other = :sender AND msgId <= :messageId")
    suspend fun deleteUntilOfSender(sender: String, messageId: Long)


}
