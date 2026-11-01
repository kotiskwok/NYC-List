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

fileprivate func rgb(_ r: Double, _ g: Double, _ b: Double) -> Color { Color(red: r / 255, green: g / 255, blue: b / 255) }

// The card shown after "Share → Spotted In": the app's look (blue + yellow + red-orange, the pin-O SPOTTED
// logo and navy "in" pill, frosted glass, mono labels, orange Done button). iOS 15+ APIs only.
private struct ShareCard: View {
    let saved: Bool
    let link: String
    let done: () -> Void

    private let blue = rgb(27, 61, 184)
    private let navy = rgb(16, 24, 63)
    private let yellow = rgb(255, 196, 37)
    private let red = rgb(229, 64, 43)
    private let orange = rgb(255, 107, 26)
    private let green = rgb(31, 157, 107)
    private let cream = rgb(255, 243, 223)
    private let mono = Font.system(size: 11, weight: .bold, design: .monospaced)

    /// Where the link is from, like the app's source badges.
    private var source: (label: String, color: Color) {
        let host = URL(string: link)?.host?.lowercased() ?? ""
        if host.contains("tiktok") { return ("TIKTOK", navy) }
        if host.contains("instagram") || host.contains("instagr.am") { return ("INSTAGRAM", rgb(217, 54, 127)) }
        if host.contains("threads") { return ("THREADS", rgb(43, 43, 43)) }
        if host.contains("goo.gl") || host.contains("google") { return ("GOOGLE MAPS", green) }
        return ("WEBSITE", blue)
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            Color.black.opacity(0.35).ignoresSafeArea().onTapGesture { done() }
            VStack(spacing: 16) {
                Capsule().fill(navy.opacity(0.18)).frame(width: 40, height: 5)
                logo
                HStack(alignment: .center, spacing: 14) {
                    lens
                    VStack(alignment: .leading, spacing: 4) {
                        Text(saved ? "SAVED · READY TO FILL IN" : "NOTHING TO SAVE")
                            .font(mono).tracking(1.2).foregroundColor(saved ? green : red)
                        Text(saved ? "Saved To Spotted In" : "No Link Found")
                            .font(.system(size: 24, weight: .black)).italic()
                            .foregroundColor(navy).lineLimit(1).minimumScaleFactor(0.7)
                    }
                    Spacer(minLength: 0)
                }
                Text(saved ? "Open Spotted In And AI Will Fill In The Spot For You To Check."
                           : "Share A TikTok, Instagram, Threads Or Google Maps Post That Has A Link.")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(navy.opacity(0.75))
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .fixedSize(horizontal: false, vertical: true)
                if !link.isEmpty {
                    HStack(spacing: 10) {
                        Text(source.label).font(mono).tracking(1).foregroundColor(.white)
                            .padding(.horizontal, 10).frame(height: 26)
                            .background(source.color).clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                        Text(link).font(.system(size: 12, weight: .semibold, design: .monospaced))
                            .foregroundColor(navy.opacity(0.6)).lineLimit(1).truncationMode(.middle)
                        Spacer(minLength: 0)
                    }
                    .padding(8)
                    .background(Color.white.opacity(0.7))
                    .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(navy.opacity(0.08), lineWidth: 1))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                Button(action: done) {
                    Text("Done")
                        .font(.system(size: 19, weight: .black)).italic()
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity).frame(height: 54)
                        .background(
                            LinearGradient(colors: [rgbOrangeLight, orange], startPoint: .top, endPoint: .bottom)
                        )
                        .overlay(Capsule().stroke(Color.white.opacity(0.45), lineWidth: 1))
                        .clipShape(Capsule())
                        .shadow(color: orange.opacity(0.35), radius: 12, x: 0, y: 8)
                }
                .buttonStyle(.plain)
            }
            .padding(EdgeInsets(top: 10, leading: 20, bottom: 22, trailing: 20))
            .background(
                ZStack {
                    Rectangle().fill(.ultraThinMaterial)
                    LinearGradient(colors: [Color.white.opacity(0.86), cream.opacity(0.8)], startPoint: .top, endPoint: .bottom)
                }
            )
            .overlay(RoundedRectangle(cornerRadius: 34, style: .continuous).stroke(Color.white.opacity(0.95), lineWidth: 1))
            .clipShape(RoundedRectangle(cornerRadius: 34, style: .continuous))
            .shadow(color: navy.opacity(0.25), radius: 30, x: 0, y: 12)
            .padding(.horizontal, 10)
            .padding(.bottom, 10)
        }
    }

    private var rgbOrangeLight: Color { rgb(255, 150, 90) }

    /// The app logo: SPOTTED with a map pin for the O (yellow, stacked red-orange shadow) and a navy "in" pill,
    /// on the app blue.
    private var logo: some View {
        HStack(spacing: 10) {
            // The pin is capital height (0.71 × the 30pt font) and stands on the baseline, like an O.
            HStack(alignment: .firstTextBaseline, spacing: 1) {
                shadowed(Text("SP"))
                ZStack {
                    PinShape().fill(red).offset(x: 2.4, y: 2.4)
                    PinShape().fill(yellow)
                    Circle().fill(blue).frame(width: 5.5, height: 5.5).offset(y: -3.5)
                }
                .frame(width: 14, height: 21)
                .alignmentGuide(.firstTextBaseline) { d in d[.bottom] }
                shadowed(Text("TTED"))
            }
            HStack(spacing: 6) {
                ZStack {
                    Circle().fill(red.opacity(0.35)).frame(width: 16, height: 16)
                    Circle().fill(red).frame(width: 9, height: 9).overlay(Circle().stroke(Color.white, lineWidth: 1.5))
                }
                Text("in").font(.system(size: 16, weight: .black)).foregroundColor(yellow)
            }
            .padding(EdgeInsets(top: 3, leading: 8, bottom: 5, trailing: 12))
            .background(navy).clipShape(Capsule())
        }
        .padding(.horizontal, 16).frame(height: 50)
        .background(blue)
        .clipShape(Capsule())
        .overlay(Capsule().stroke(Color.white.opacity(0.35), lineWidth: 1))
    }

    private func shadowed(_ t: Text) -> some View {
        let f = Font.system(size: 30, weight: .black)
        return ZStack {
            ForEach(1..<4) { i in t.font(f).foregroundColor(red).offset(x: CGFloat(i) * 0.8, y: CGFloat(i) * 0.8) }
            t.font(f).foregroundColor(yellow)
        }
        .fixedSize()
    }

    /// A glass lens with a check (saved) or a cross (no link).
    private var lens: some View {
        let c = saved ? green : red
        return ZStack {
            Circle().fill(RadialGradient(colors: [Color.white.opacity(0.6), c], center: UnitPoint(x: 0.35, y: 0.28), startRadius: 1, endRadius: 30))
            Circle().stroke(Color.white.opacity(0.8), lineWidth: 1)
            Image(systemName: saved ? "checkmark" : "xmark").font(.system(size: 22, weight: .heavy)).foregroundColor(.white)
        }
        .frame(width: 52, height: 52)
        .shadow(color: c.opacity(0.4), radius: 8, x: 0, y: 5)
    }
}

/// A map pin, drawn from the icon's 100×150 pin.
private struct PinShape: Shape {
    func path(in r: CGRect) -> Path {
        let sx = r.width / 100, sy = r.height / 150
        func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: r.minX + x * sx, y: r.minY + y * sy) }
        var path = Path()
        path.move(to: p(50, 150))
        path.addCurve(to: p(6, 50), control1: p(50, 150), control2: p(6, 94))
        path.addCurve(to: p(50, 6), control1: p(6, 25.7), control2: p(25.7, 6))     // top half of the pin's circle
        path.addCurve(to: p(94, 50), control1: p(74.3, 6), control2: p(94, 25.7))
        path.addCurve(to: p(50, 150), control1: p(94, 94), control2: p(50, 150))
        path.closeSubpath()
        return path
    }
}
