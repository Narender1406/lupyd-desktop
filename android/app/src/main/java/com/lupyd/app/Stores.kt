package com.lupyd.app


import android.content.Context

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase


val TAG = "lupyd-store"

@Database(entities = [

    DMessageNotification::class,
                     ], version = 1)
abstract class AppDatabase : RoomDatabase() {


    abstract fun userMessageNotificationsDao(): UserMessageNotificationsDao
}

fun getDatabase(context: Context): AppDatabase {
    val db = Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
        .fallbackToDestructiveMigration(true)
        .build()
    return db
}

