import Foundation
import Capacitor

/// Hands links saved by the Share extension ("Share → Spotted In") to the web app.
/// Both live in the app group below, so they can see the same UserDefaults.
@objc(AppGroupPlugin)
public class AppGroupPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppGroupPlugin"
    public let jsName = "AppGroup"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "takeLinks", returnType: CAPPluginReturnPromise)
    ]

    static let suite = "group.com.kotiskwok.nyclist"
    static let key = "pendingLinks"

    @objc func takeLinks(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: AppGroupPlugin.suite)
        let links = defaults?.stringArray(forKey: AppGroupPlugin.key) ?? []
        defaults?.removeObject(forKey: AppGroupPlugin.key)
        call.resolve(["links": links])
    }
}
