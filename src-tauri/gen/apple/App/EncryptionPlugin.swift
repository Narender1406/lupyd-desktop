import Foundation

@objcMembers
class EncryptionPlugin: NSObject {
    override init() {
        super.init()
        loadLibrary()
    }

    private func loadLibrary() {
        // Load the native library
        guard let path = Bundle.main.path(forResource: "app_lib", ofType: nil) else {
            print("Failed to load library: app_lib")
            return
        }
        let result = dlopen(path, RTLD_NOW)
        if result == nil {
            print("Failed to load library: \(String(cString: dlerror()))")
        }
    }

    func initializeFireflyClient(appDataDir: String) {
        // Call the external function to initialize the Firefly client
        // This function should be implemented in the native library
        // Example: externalFunction(appDataDir)
    }
}