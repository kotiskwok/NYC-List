import UIKit
import SwiftUI
import UniformTypeIdentifiers

/// "Share → Spotted In" from TikTok, Instagram, Threads, Google Maps or Safari.
/// Saves the link to the app group's inbox; the app reads it the next time it opens
/// and fills in the spot with AI for you to check.
class ShareViewController: UIViewController {
    private let suite = "group.com.kotiskwok.nyclist"
    private let key = "pendingLinks"
    private let cityKey = "currentCity"   // written by the app (AppGroupPlugin.setCity)

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

    /// Undo: take the link back out of the inbox before the app picks it up.
    private func remove(_ link: String) {
        let defaults = UserDefaults(suiteName: suite)
        let links = (defaults?.stringArray(forKey: key) ?? []).filter { $0 != link }
        defaults?.set(links, forKey: key)
    }

    private func show(saved: Bool, link: String) {
        let city = UserDefaults(suiteName: suite)?.string(forKey: cityKey) ?? ""
        let close: () -> Void = { [weak self] in
            self?.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
        }
        let card = ShareCard(saved: saved, link: link, city: city, done: close, undo: { [weak self] in
            self?.remove(link)
            close()
        })
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

fileprivate func rgb(_ r: Double, _ g: Double, _ b: Double) -> Color { Color(red: r / 255, green: g / 255, blue: b / 255) }

/// Design "C1 · Ticket Toast": a dark liquid-glass ticket that drops in at the top of the screen. A blue stub on
/// the left (yellow pin with a check, SAVED), a dashed tear line, then the title, FROM (where the link came from)
/// and TO (My Map · the app's city), with Undo and a yellow Done. It closes by itself after a few seconds.
/// iOS 15+ APIs only.
struct ShareCard: View {
    let saved: Bool
    let link: String
    let city: String
    let done: () -> Void
    let undo: () -> Void
    var preview = false   // design previews only: show the ticket without the drop-in animation

    @State private var shown = false
    @State private var closing = false

    private let blue = rgb(27, 61, 184)
    private let navy = rgb(16, 24, 63)
    private let yellow = rgb(255, 196, 37)
    private let red = rgb(229, 64, 43)
    private let mono9 = Font.system(size: 9.5, weight: .bold, design: .monospaced)

    /// Where the link is from, like the app's source badges.
    private var source: String {
        let host = (URL(string: link)?.host?.lowercased() ?? "").replacingOccurrences(of: "www.", with: "")
        if host.contains("tiktok") { return "TikTok" }
        if host.contains("instagram") || host.contains("instagr.am") { return "Instagram" }
        if host.contains("threads") { return "Threads" }
        if host.contains("goo.gl") || host.contains("google") { return "Google Maps" }
        return host.isEmpty ? "A Website" : host
    }

    var body: some View {
        ZStack(alignment: .top) {
            Color.black.opacity(shown || preview ? 0.12 : 0).ignoresSafeArea().onTapGesture { close(done) }
            VStack(spacing: 10) {
                ticket
                Text(saved ? "CLOSES BY ITSELF IN A FEW SECONDS" : "TAP ANYWHERE TO CLOSE")
                    .font(mono9).tracking(1.2).foregroundColor(.white.opacity(0.85))
                    .shadow(color: navy.opacity(0.5), radius: 4, x: 0, y: 1)
            }
            .padding(.horizontal, 12)
            .padding(.top, 8)
            .offset(y: shown || preview ? 0 : -220)
            .opacity(shown || preview ? 1 : 0)
        }
        .onAppear {
            withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) { shown = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + (saved ? 3.2 : 4.5)) { close(done) }
        }
    }

    /// Slide the ticket back up, then finish.
    private func close(_ then: @escaping () -> Void) {
        if closing { return }
        closing = true
        withAnimation(.easeIn(duration: 0.22)) { shown = false }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.24) { then() }
    }

    private var ticket: some View {
        HStack(spacing: 0) {
            stub
            DashedLine().stroke(Color.white.opacity(0.3), style: StrokeStyle(lineWidth: 2, dash: [5, 4]))
                .frame(width: 2).padding(.vertical, 12)
            VStack(alignment: .leading, spacing: 10) {
                Text(saved ? "Saved To Spotted In" : "No Link Found")
                    .font(.system(size: 19, weight: .black)).italic()
                    .foregroundColor(.white).lineLimit(1).minimumScaleFactor(0.75)
                if saved {
                    HStack(alignment: .top, spacing: 8) {
                        field("FROM", source)
                        field("TO", city.isEmpty ? "My Map" : "My Map · " + city)
                    }
                    HStack(spacing: 8) {
                        pill("Undo", filled: false) { close(undo) }
                        pill("Done", filled: true) { close(done) }
                    }
                } else {
                    Text("Share A TikTok, Instagram, Threads Or Google Maps Post That Has A Link.")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white.opacity(0.8))
                        .fixedSize(horizontal: false, vertical: true)
                    pill("Done", filled: true) { close(done) }
                }
            }
            .padding(EdgeInsets(top: 14, leading: 14, bottom: 12, trailing: 14))
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .fixedSize(horizontal: false, vertical: true)
        .background(
            ZStack {
                Rectangle().fill(.ultraThinMaterial)
                LinearGradient(colors: [navy.opacity(0.78), navy.opacity(0.56)], startPoint: .topLeading, endPoint: .bottomTrailing)
            }
        )
        .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 30, style: .continuous).stroke(Color.white.opacity(0.22), lineWidth: 1))
        .shadow(color: navy.opacity(0.45), radius: 24, x: 0, y: 14)
        .environment(\.colorScheme, .dark)
    }

    /// The blue stub: a yellow pin with a check (or a red one with a cross) and SAVED.
    private var stub: some View {
        VStack(spacing: 8) {
            ZStack {
                PinShape().fill(red).offset(x: 3, y: 3)
                PinShape().fill(saved ? yellow : red.opacity(0.9))
                Image(systemName: saved ? "checkmark" : "xmark")
                    .font(.system(size: 13, weight: .black))
                    .foregroundColor(saved ? blue : .white)
                    .offset(y: -6)
            }
            .frame(width: 30, height: 45)
            Text(saved ? "SAVED" : "NO LINK").font(mono9).tracking(1.4).foregroundColor(yellow)
        }
        .frame(width: 88)
        .frame(maxHeight: .infinity)
        .background(blue)
    }

    private func field(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label).font(mono9).tracking(1.2).foregroundColor(.white.opacity(0.6))
            Text(value).font(.system(size: 14, weight: .heavy)).foregroundColor(.white)
                .lineLimit(1).minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func pill(_ title: String, filled: Bool, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: filled ? .black : .heavy))
                .italicIf(filled)
                .foregroundColor(filled ? navy : .white)
                .frame(maxWidth: .infinity).frame(height: 38)
                .background(Capsule().fill(filled ? yellow : Color.white.opacity(0.12)))
                .overlay(Capsule().stroke(Color.white.opacity(filled ? 0.5 : 0.25), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}

private extension Text {
    /// `.italic()` only when asked (iOS 15 has no italic(Bool)).
    func italicIf(_ on: Bool) -> Text { on ? self.italic() : self }
}

/// A vertical dashed tear line.
private struct DashedLine: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.midX, y: r.minY))
        p.addLine(to: CGPoint(x: r.midX, y: r.maxY))
        return p
    }
}

/// A map pin, drawn from the icon's 100×150 pin.
private struct PinShape: Shape {
    func path(in r: CGRect) -> Path {
        let sx = r.width / 100, sy = r.height / 150
        func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: r.minX + x * sx, y: r.minY + y * sy) }
        var path = Path()
        path.move(to: p(50, 148))
        path.addCurve(to: p(6, 50), control1: p(50, 148), control2: p(6, 92))
        path.addCurve(to: p(50, 6), control1: p(6, 25.7), control2: p(25.7, 6))     // top half of the pin's circle
        path.addCurve(to: p(94, 50), control1: p(74.3, 6), control2: p(94, 25.7))
        path.addCurve(to: p(50, 148), control1: p(94, 92), control2: p(50, 148))
        path.closeSubpath()
        return path
    }
}
