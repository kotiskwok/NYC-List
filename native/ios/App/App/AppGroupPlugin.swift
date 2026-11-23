import Foundation
import Capacitor
import UserNotifications
import Security

/// Hands links saved by the Share extension ("Share → Spotted In") to the web app.
/// Both live in the app group below, so they can see the same UserDefaults.
@objc(AppGroupPlugin)
public class AppGroupPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppGroupPlugin"
    public let jsName = "AppGroup"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "takeLinks", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setCity", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "notifications", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setShareKey", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "takeSent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "keep", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "recall", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "forget", returnType: CAPPluginReturnPromise)
    ]

    static let suite = "group.com.kotiskwok.nyclist"
    static let key = "pendingLinks"
    static let cityKey = "currentCity"

    @objc func takeLinks(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: AppGroupPlugin.suite)
        let links = defaults?.stringArray(forKey: AppGroupPlugin.key) ?? []
        defaults?.removeObject(forKey: AppGroupPlugin.key)
        call.resolve(["links": links])
    }

    /// The city the map is set to ("NYC", "SG", "HKG", "TO"), so the share card can say "To My Map · NYC".
    @objc func setCity(_ call: CAPPluginCall) {
        let city = call.getString("city") ?? ""
        UserDefaults(suiteName: AppGroupPlugin.suite)?.set(city, forKey: AppGroupPlugin.cityKey)
        call.resolve()
    }

    /// Notifications let the Share extension show a real "Saved To Spotted In" banner instead of its ticket.
    /// { ask: true } shows iOS's permission prompt if it hasn't been answered yet. Resolves { status }.
    @objc func notifications(_ call: CAPPluginCall) {
        let ask = call.getBool("ask") ?? false
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
            let name: (UNAuthorizationStatus) -> String = { s in
                switch s {
                case .authorized, .provisional, .ephemeral: return "granted"
                case .denied: return "denied"
                default: return "prompt"
                }
            }
            if settings.authorizationStatus == .notDetermined && ask {
                center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
                    call.resolve(["status": granted ? "granted" : "denied"])
                }
            } else {
                call.resolve(["status": name(settings.authorizationStatus)])
            }
        }
    }

    /// This phone's share key (see supabase/share.sql) and the website the share sheet sends links to. Empty key = signed out.
    @objc func setShareKey(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: AppGroupPlugin.suite)
        let key = call.getString("key") ?? ""
        if key.isEmpty { defaults?.removeObject(forKey: "shareKey") } else { defaults?.set(key, forKey: "shareKey") }
        if let site = call.getString("site"), !site.isEmpty { defaults?.set(site, forKey: "siteUrl") }
        call.resolve(["had": defaults?.string(forKey: "shareKey") != nil])
    }

    /// Links the share sheet sent to the server to read ({ link: seconds since 1970 }), cleared as they're handed over.
    @objc func takeSent(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: AppGroupPlugin.suite)
        let sent = defaults?.dictionary(forKey: "sentLinks") as? [String: Double] ?? [:]
        defaults?.removeObject(forKey: "sentLinks")
        call.resolve(["sent": sent])
    }

    // ---- Your sign-in, backed up in the iPhone's Keychain ----
    // The web app keeps its Supabase sign-in in local storage, which iOS can clear. A copy lives here
    // (this device only, readable after the phone's first unlock), so you stay signed in.
    static let service = "com.kotiskwok.nyclist.session"
    private func query(_ key: String) -> [String: Any] {
        return [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: AppGroupPlugin.service, kSecAttrAccount as String: key]
    }

    @objc func keep(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let value = call.getString("value"), let data = value.data(using: .utf8) else { call.reject("key and value needed"); return }
        let q = query(key)
        let attrs: [String: Any] = [kSecValueData as String: data, kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly]
        var status = SecItemUpdate(q as CFDictionary, attrs as CFDictionary)
        if status == errSecItemNotFound { status = SecItemAdd(q.merging(attrs) { $1 } as CFDictionary, nil) }
        call.resolve(["ok": status == errSecSuccess])
    }

    @objc func recall(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.resolve([:]); return }
        var q = query(key)
        q[kSecReturnData as String] = true
        q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: AnyObject?
        if SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let data = out as? Data, let value = String(data: data, encoding: .utf8) {
            call.resolve(["value": value])
        } else {
            call.resolve([:])
        }
    }

    @objc func forget(_ call: CAPPluginCall) {
        if let key = call.getString("key") { SecItemDelete(query(key) as CFDictionary) }
        call.resolve()
    }
}
