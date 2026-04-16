
# EXIFclean

A fast, browser-based image metadata tool. Inspect what's embedded in your photos, download it as a report, or wipe it clean before sharing — all without uploading anything to a server.


## Features

- Inspect — view EXIF, GPS, and raw metadata organized into tabs
- Download — export all parsed metadata as a JSON file
- Clean — strip all embedded metadata and download the sanitized image
- HEIC support — iPhone HEIC images are automatically converted to JPEG for processing and preview
- Drag and drop — drop an image directly onto the upload zone or browse from disk
- Entirely client-side — your images never leave the browser

## Supported formats
JPEG · PNG · TIFF · HEIC · WebP


## Getting started

To deploy this project run

```bash
    # Install dependencies
    npm install

    # Start dev server
    npm run dev

    # Build for production
    npm run build

    # Preview production build
    npm run preview
```


## Tech Stack

| Package   | Version  | Purpose                                      |
|-----------|----------|----------------------------------------------|
| Vite      | ^8.0.4   | Build tool and dev server                    |
| exifr     | ^7.1.3   | Metadata parsing (EXIF, GPS, IPTC, XMP)      |
| piexifjs  | ^1.0.6   | Metadata removal from JPEG                   |
| heic2any  | ^0.0.4   | HEIC → JPEG conversion in the browser        |
## How it works

### Reading metadata
exifr parses the raw EXIF, GPS, and ICC profile blocks embedded in the image binary. Low-level fields (binary ICC matrices, maker notes, raw typed arrays) are filtered out automatically, leaving only human-readable values.


### Stripping metadata
piexifjs operates on JPEG data URLs. Non-JPEG formats (PNG, WebP) are converted to JPEG via a canvas before stripping. HEIC images are first converted to JPEG using heic2any (WebAssembly, runs entirely in the browser), then passed through the same strip pipeline.

### GPS

When GPS coordinates are present, the GPS tab includes a direct Google Maps link.

## Notes

- Stripping metadata re-encodes the image as JPEG. If you need lossless stripping of PNG or WebP, a server-side solution using exiftool is more appropriate.

- HEIC conversion is done in-browser via WebAssembly — no server, no upload.

- EXIFclean does not store, transmit, or log any image data.
