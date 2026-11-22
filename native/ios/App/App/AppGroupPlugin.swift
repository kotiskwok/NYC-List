import Foundation
import Capacitor
import UserNotifications

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
        CAPPluginMethod(name: "takeSent", returnType: CAPPluginReturnPromise)
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
}
