import AppKit
import AVFoundation
import CoreVideo
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let captures = root.appendingPathComponent("deliverables/demo-captures")
let silentURL = root.appendingPathComponent("deliverables/clearledger-demo-silent.mov")
let audioURL = root.appendingPathComponent("deliverables/clearledger-demo.aiff")
let outputURL = root.appendingPathComponent("deliverables/clearledger-demo.mp4")
let exportURL = root.appendingPathComponent("deliverables/clearledger-demo-export.mp4")

let frames: [(String, Double)] = [
    ("01-hero.png", 6),
    ("02-preflight.png", 7),
    ("03-wallet.png", 7),
    ("04-approved.png", 10),
    ("05-lifecycle-1.png", 6),
    ("06-lifecycle-2.png", 6),
    ("07-lifecycle-3.png", 7),
    ("08-lifecycle-4.png", 8),
]

let width = 1280
let height = 720
let fps: Int32 = 15
let fileManager = FileManager.default
try? fileManager.removeItem(at: silentURL)
try? fileManager.removeItem(at: outputURL)
try? fileManager.removeItem(at: exportURL)

let writer = try AVAssetWriter(outputURL: silentURL, fileType: .mov)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.jpeg,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoQualityKey: 0.82,
    ],
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let attributes: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
]
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: attributes)
guard writer.canAdd(input) else { fatalError("Unable to add video input") }
writer.add(input)
guard writer.startWriting() else { fatalError(writer.error?.localizedDescription ?? "Unable to start writer") }
writer.startSession(atSourceTime: .zero)

var frameNumber: Int64 = 0
for (filename, seconds) in frames {
    let imageURL = captures.appendingPathComponent(filename)
    guard let image = NSImage(contentsOf: imageURL),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        fatalError("Unable to load \(filename)")
    }
    let count = Int(seconds * Double(fps))
    for localFrame in 0..<count {
        while !input.isReadyForMoreMediaData { usleep(2_000) }
        var optionalBuffer: CVPixelBuffer?
        let status = CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &optionalBuffer)
        guard status == kCVReturnSuccess, let buffer = optionalBuffer else { fatalError("Unable to create pixel buffer") }
        CVPixelBufferLockBaseAddress(buffer, [])
        let base = CVPixelBufferGetBaseAddress(buffer)!
        let bytesPerRow = CVPixelBufferGetBytesPerRow(buffer)
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let bitmapInfo = CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)
        let context = CGContext(data: base, width: width, height: height, bitsPerComponent: 8, bytesPerRow: bytesPerRow, space: colorSpace, bitmapInfo: bitmapInfo.rawValue)!
        context.setFillColor(NSColor(calibratedRed: 0.02, green: 0.04, blue: 0.04, alpha: 1).cgColor)
        context.fill(CGRect(x: 0, y: 0, width: width, height: height))
        context.translateBy(x: 0, y: CGFloat(height))
        context.scaleBy(x: 1, y: -1)
        let progress = CGFloat(localFrame) / CGFloat(max(count - 1, 1))
        let zoom = 1 + 0.025 * progress
        let drawWidth = CGFloat(width) * zoom
        let drawHeight = CGFloat(height) * zoom
        let rect = CGRect(x: (CGFloat(width) - drawWidth) / 2, y: (CGFloat(height) - drawHeight) / 2, width: drawWidth, height: drawHeight)
        context.interpolationQuality = .high
        context.draw(cgImage, in: rect)
        CVPixelBufferUnlockBaseAddress(buffer, [])
        let time = CMTime(value: frameNumber, timescale: fps)
        guard adaptor.append(buffer, withPresentationTime: time) else {
            fatalError(writer.error?.localizedDescription ?? "Unable to append frame")
        }
        frameNumber += 1
    }
}

input.markAsFinished()
let writeSemaphore = DispatchSemaphore(value: 0)
writer.finishWriting { writeSemaphore.signal() }
writeSemaphore.wait()
guard writer.status == .completed else { fatalError(writer.error?.localizedDescription ?? "Video encoding failed") }

let videoAsset = AVURLAsset(url: silentURL)
let audioAsset = AVURLAsset(url: audioURL)
let composition = AVMutableComposition()
guard let videoSource = videoAsset.tracks(withMediaType: .video).first,
      let videoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
    fatalError("Unable to prepare video track")
}
try videoTrack.insertTimeRange(CMTimeRange(start: .zero, duration: videoAsset.duration), of: videoSource, at: .zero)
videoTrack.preferredTransform = videoSource.preferredTransform

if let audioSource = audioAsset.tracks(withMediaType: .audio).first,
   let audioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) {
    let audioDuration = CMTimeMinimum(audioAsset.duration, videoAsset.duration)
    try audioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: audioDuration), of: audioSource, at: .zero)
}

guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
    fatalError("Unable to create exporter")
}
exporter.outputURL = exportURL
exporter.outputFileType = .mp4
exporter.shouldOptimizeForNetworkUse = true
let exportSemaphore = DispatchSemaphore(value: 0)
exporter.exportAsynchronously { exportSemaphore.signal() }
exportSemaphore.wait()
guard exporter.status == .completed else { fatalError(exporter.error?.localizedDescription ?? "Export failed") }
try fileManager.moveItem(at: exportURL, to: outputURL)
print(outputURL.path)
