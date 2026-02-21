import UIKit
import FirebaseMessaging

class FirebaseMessagingService: MessagingDelegate {
    let TAG = "fcm"

    override init() {
        super.init()
        Messaging.messaging().delegate = self
    }

    func messaging(_ messaging: Messaging, didReceive remoteMessage: MessagingRemoteMessage) {
        print("=== PUSH NOTIFICATION RECEIVED ===")
        print("Received message from: \(remoteMessage.from ?? "")")
        print("Message contains notification: \(remoteMessage.notification != nil)")
        print("Message contains data: \(remoteMessage.appData)")

        if let data = remoteMessage.appData as? [String: Any], data["ty"] as? String == "umsg" {
            do {
                let filesDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path
                EncryptionPlugin.initializeFireflyClient(appDataDir: filesDir ?? "")
            } catch {
                print("Failed to Sync Messages: \(error)")
            }
        } else {
            // handleNotification(remoteMessage)
        }
    }
}