import UIKit
import SwiftUI
import UniformTypeIdentifiers

/// "Share → Spotted In" from TikTok, Instagram, Threads, Google Maps or Safari.
/// Saves the link to the app group's inbox; the app reads it the next time it opens
/// and fills in the spot with AI for you to check.
class ShareViewController: UIViewController {
    private let suite = "group.com.kotiskwok.nyclist"
    private let key = "pendingLinks"

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .clear
        Task { @MainActor in
            let link = await self.findLink()
            if let link = link { self.save(link) }
            self.show(saved: link != nil, link: link ?? "")
        }
    }

    private func save(_ link: String) {
        let defaults = UserDefaults(suiteName: suite)
        var links = defaults?.stringArray(forKey: key) ?? []
        if !links.contains(link) { links.append(link) }
        defaults?.set(links, forKey: key)
    }

    private func show(saved: Bool, link: String) {
        let card = ShareCard(saved: saved, link: link) { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
        }
        let host = UIHostingController(rootView: card)
        host.view.backgroundColor = .clear
        addChild(host)
        host.view.frame = view.bounds
        host.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(host.view)
        host.didMove(toParent: self)
    }

    /// The first web link in what was shared (a URL, or text that contains one).
    private func findLink() async -> String? {
        let items = (extensionContext?.inputItems as? [NSExtensionItem]) ?? []
        var texts: [String] = []
        for item in items {
            for provider in item.attachments ?? [] {
                if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier),
                   let data = try? await provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) {
                    if let url = data as? URL, url.scheme?.hasPrefix("http") == true { return url.absoluteString }
                    if let s = data as? String { texts.append(s) }
                }
                if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier),
                   let data = try? await provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil),
                   let s = data as? String {
                    texts.append(s)
                }
            }
            if let s = item.attributedContentText?.string, !s.isEmpty { texts.append(s) }
        }
        let detector = try? NSDataDetector(types: NSTextCheckingResult.CheckingType.link.rawValue)
        for text in texts {
            let range = NSRange(text.startIndex..<text.endIndex, in: text)
            if let match = detector?.firstMatch(in: text, options: [], range: range),
               let url = match.url, url.scheme?.hasPrefix("http") == true {
                return url.absoluteString
            }
        }
        return nil
    }
}

private struct ShareCard: View {
    let saved: Bool
    let link: String
    let done: () -> Void

    private let blue = Color(red: 27 / 255, green: 61 / 255, blue: 184 / 255)
    private let navy = Color(red: 16 / 255, green: 24 / 255, blue: 63 / 255)
    private let orange = Color(red: 1, green: 107 / 255, blue: 26 / 255)
    private let cream = Color(red: 1, green: 243 / 255, blue: 223 / 255)

    var body: some View {
        ZStack {
            Color.black.opacity(0.35).ignoresSafeArea().onTapGesture { done() }
            VStack(spacing: 12) {
                Text(saved ? "Saved To Spotted In ✓" : "No Link Found")
                    .font(.system(size: 26, weight: .black))
                    .italic()
                    .foregroundColor(blue)
                    .multilineTextAlignment(.center)
                Text(saved ? "Open Spotted In And It’ll Fill In The Spot For You To Check."
                           : "Share A TikTok, Instagram, Threads Or Google Maps Post That Has A Link.")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(navy.opacity(0.8))
                    .multilineTextAlignment(.center)
                if !link.isEmpty {
                    Text(link)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(navy.opacity(0.5))
                        .lineLimit(2)
                        .multilineTextAlignment(.center)
                }
                Button(action: done) {
                    Text("Done")
                        .font(.system(size: 19, weight: .black))
                        .italic()
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(orange)
                        .clipShape(Capsule())
                }
                .padding(.top, 4)
            }
            .padding(22)
            .background(cream)
            .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
            .padding(.horizontal, 24)
        }
    }
}
