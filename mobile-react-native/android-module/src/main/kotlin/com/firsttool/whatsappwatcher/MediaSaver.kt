package com.firsttool.whatsappwatcher

import android.content.Context
import org.json.JSONObject
import java.io.File

object MediaSaver {
    fun saveMedia(context: Context, src: File, sender: String?): File? {
        try {
            val base = context.getExternalFilesDir(null) ?: context.filesDir
            val archive = File(base, "WhatsAppArchive")
            if (!archive.exists()) archive.mkdirs()

            val chatName = sender ?: "Unknown"
            val destDir = File(archive, sanitize(chatName))
            if (!destDir.exists()) destDir.mkdirs()

            val timestamp = System.currentTimeMillis()
            val destName = "${timestamp}_${src.name}"
            val dest = File(destDir, destName)

            src.inputStream().use { input ->
                dest.outputStream().use { output ->
                    input.copyTo(output)
                }
            }

            val meta = JSONObject()
            meta.put("type", "media")
            meta.put("filename", destName)
            meta.put("original_name", src.name)
            meta.put("original_path", src.absolutePath)
            meta.put("timestamp", timestamp)
            if (!sender.isNullOrBlank()) meta.put("sender", sender)

            val logFile = File(destDir, "chat_log.jsonl")
            logFile.appendText(meta.toString() + "\n")

            return dest
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    fun saveMessage(context: Context, chatTitle: String, message: String, direction: String) {
        try {
            val base = context.getExternalFilesDir(null) ?: context.filesDir
            val archive = File(base, "WhatsAppArchive")
            if (!archive.exists()) archive.mkdirs()

            val dir = File(archive, sanitize(chatTitle))
            if (!dir.exists()) dir.mkdirs()

            val meta = JSONObject()
            meta.put("type", "message")
            meta.put("direction", direction)
            meta.put("message", message)
            meta.put("timestamp", System.currentTimeMillis())

            val logFile = File(dir, "chat_log.jsonl")
            logFile.appendText(meta.toString() + "\n")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun sanitize(s: String): String {
        val cleaned = s.replace(Regex("[^A-Za-z0-9 _.-]"), "_")
        return if (cleaned.length > 64) cleaned.substring(0, 64) else cleaned
    }
}
