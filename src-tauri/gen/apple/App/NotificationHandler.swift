import UserNotifications
import UIKit

class NotificationHandler: NSObject {
    
    static let shared = NotificationHandler()
    
    private override init() {
        super.init()
        requestNotificationPermissions()
    }
    
    private func requestNotificationPermissions() {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if let error = error {
                print("Error requesting notification permissions: \(error)")
            }
        }
    }
    
    func showUserBundledNotification(title: String, messages: [[String: Any]]) {
        let content = UNMutableNotificationContent()
        content.title = title
        
        var latestText = ""
        let inboxStyle = UNMutableNotificationContent()
        
        for message in messages {
            if let text = message["text"] as? String {
                inboxStyle.body += "\(text)\n"
                latestText = text
            }
        }
        
        if messages.count > 1 {
            inboxStyle.body += "\(messages.count) messages"
        }
        
        content.body = latestText
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error adding notification: \(error)")
            }
        }
    }
}