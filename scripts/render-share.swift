// Renders native/ios/App/ShareExtension's ShareCard to PNGs on a Mac (macOS 13+): see .github/workflows/swift-check.yml.
@MainActor func render(_ saved: Bool, _ link: String, _ name: String) {
  let v = ShareCard(saved: saved, link: link, done: {}).frame(width: 390, height: 520).background(Color(red: 0.93, green: 0.94, blue: 0.97))
  let r = ImageRenderer(content: v); r.scale = 3
  if let img = r.nsImage, let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff), let png = rep.representation(using: .png, properties: [:]) { try? png.write(to: URL(fileURLWithPath: name)) }
}
@main struct Main { @MainActor static func main() {
  render(true, "https://www.instagram.com/reel/DcKKxNZxsxL/", "saved.png")
  render(false, "", "nolink.png")
} }
