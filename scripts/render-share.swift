// Renders the share card (ShareViewController.swift's ShareCard) to PNGs on a Mac, macOS 13+.
@MainActor func render(_ saved: Bool, _ link: String, _ name: String) {
  let bg = ZStack {
    LinearGradient(colors: [Color(red: 1, green: 0.6, blue: 0.36), Color(red: 0.96, green: 0.37, blue: 0.63), Color(red: 0.18, green: 0.72, blue: 0.65)], startPoint: .topLeading, endPoint: .bottomTrailing)
  }
  let v = ZStack(alignment: .top) { bg; ShareCard(saved: saved, link: link, city: "NYC", done: {}, undo: {}, preview: true).padding(.top, 50) }.frame(width: 390, height: 420)
  let r = ImageRenderer(content: v); r.scale = 3
  if let img = r.nsImage, let tiff = img.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff), let png = rep.representation(using: .png, properties: [:]) { try? png.write(to: URL(fileURLWithPath: name)) }
}
@main struct Main { @MainActor static func main() {
  render(true, "https://www.instagram.com/reel/DcKKxNZxsxL/", "saved.png")
  render(false, "", "nolink.png")
} }
