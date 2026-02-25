import Vision
import AppKit

/**
 * 🕵️‍♂️ VISION FACE DETECTOR (2026)
 * 
 * Gebruikt het macOS Vision framework om gezichten te detecteren.
 * Output: JSON met bounding box (genormaliseerd 0.0 - 1.0)
 */

let arguments = CommandLine.arguments
guard arguments.count > 1 else {
    print("Usage: face-detector <image-path>")
    exit(1)
}

let imagePath = arguments[1]
let imageUrl = URL(fileURLWithPath: imagePath)

guard let image = NSImage(contentsOf: imageUrl),
      let tiffData = image.tiffRepresentation,
      let ciImage = CIImage(data: tiffData) else {
    print("Error: Could not load image at \(imagePath)")
    exit(1)
}

let request = VNDetectFaceRectanglesRequest()
let handler = VNImageRequestHandler(ciImage: ciImage, options: [:])

do {
    try handler.perform([request])
    
    guard let results = request.results else {
        print("[]")
        exit(0)
    }
    
    let faces = results.map { result -> [String: Double] in
        let box = result.boundingBox
        return [
            "x": Double(box.origin.x),
            "y": Double(box.origin.y),
            "width": Double(box.size.width),
            "height": Double(box.size.height)
        ]
    }
    
    let jsonData = try JSONSerialization.data(withJSONObject: faces, options: [])
    if let jsonString = String(data: jsonData, encoding: .utf8) {
        print(jsonString)
    }
} catch {
    print("Error: \(error)")
    exit(1)
}
