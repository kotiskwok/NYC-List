import UserNotifications

/// Adds the spot's photo to "Spotted Lucali On The Map!!" (the push from /api/extract carries its URL in `photo`).
/// iOS gives this about 30 seconds; without a photo the notification still shows, just without the picture.
class NotificationService: UNNotificationServiceExtension {
    private var handler: ((UNNotificationContent) -> Void)?
    private var content: UNMutableNotificationContent?

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        handler = contentHandler
        content = request.content.mutableCopy() as? UNMutableNotificationContent
        guard let content = content, let link = content.userInfo["photo"] as? String, let url = URL(string: link),
              url.scheme == "https" else {
            contentHandler(request.content)
            return
        }
        let task = URLSession.shared.downloadTask(with: url) { [weak self] location, response, _ in
            if let location = location, (response as? HTTPURLResponse)?.statusCode == 200 {
                let file = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".jpg")
                if (try? FileManager.default.moveItem(at: location, to: file)) != nil,
                   let photo = try? UNNotificationAttachment(identifier: "photo", url: file, options: nil) {
                    content.attachments = [photo]
                }
            }
            self?.deliver()
        }
        task.resume()
    }

    override func serviceExtensionTimeWillExpire() {
        deliver()
    }

    private func deliver() {
        guard let handler = handler, let content = content else { return }
        self.handler = nil
        handler(content)
    }
}
