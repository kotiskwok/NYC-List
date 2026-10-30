import UIKit
import Capacitor

/// The app's web view, plus the app's own native plugin (the share-sheet inbox).
class ViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppGroupPlugin())
    }
}
