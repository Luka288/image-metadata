import exifr from "exifr";

const TRASH_KEYS = new Set([
  "makerNote",
  "SubjectArea",
  "SubSecTimeDigitized",
  "SubSecTimeOriginal",
  "ModifyDate",
  "OffsetTime",
  "OffsetTimeDigitized",
  "OffsetTimeOriginal",
  "DeviceManufacturer",
  "LensInfo",
  "CompositeImage",
  "PrimaryPlatform",
  "ProfileClass",
  "ProfileConnectionSpace",
  "ProfileCopyright",
  "ProfileDescription",
  "ProfileVersion",
  "ProfileCreator",
  "RenderingIntent",
  "ProfileCMMType",
  "ProfileFileSignature",
  "ColorSpace",
  "BlueMatrixColumn",
  "BlueTRC",
  "GreenMatrixColumn",
  "GreenTRC",
  "RedMatrixColumn",
  "RedTRC",
  "ChromaticAdaptation",
  "MediaWhitePoint",
  "ThumbnailHeight",
  "ThumbnailWidth",
  "DeviceModel",
  "ProfileDateTime",
]);

export async function extractMetadata(file) {
  const raw = await exifr.parse(file, {
    gps: true,
    exif: true,
    reviveValues: true,
  });

  if (!raw) return { raw: {}, exif: {}, gps: {} };

  const cleanRaw = Object.fromEntries(
    Object.entries(raw).filter(
      ([key, val]) =>
        !TRASH_KEYS.has(key) &&
        val !== undefined &&
        val !== null &&
        !isBinaryData(val),
    ),
  );

  return {
    raw: cleanRaw,
    exif: extractExif(cleanRaw),
    gps: extractGPS(raw),
  };
}

function extractGPS(data) {
  if (!data) return {};

  const gpsData = {};

  Object.entries(data).forEach(([key, value]) => {
    if (
      key.toLowerCase().includes("gps") ||
      key === "latitude" ||
      key === "longitude"
    ) {
      gpsData[key] = value;
    }
  });

  return {
    ...gpsData,
    latitude: data.latitude ? data.latitude : data.gpsLatitude,
    longitude: data.longitude ? data.longitude : data.gpsLongitude,
  };
}

function extractExif(data) {
  const EXIF_KEYS = new Set([
    "Make",
    "Model",
    "ISO",
    "FNumber",
    "ExposureTime",
    "FocalLength",
    "LensModel",
    "Orientation",
    "ExifImageWidth",
    "ExifImageHeight",
  ]);

  return Object.fromEntries(
    Object.entries(data || {}).filter(([key]) => EXIF_KEYS.has(key)),
  );
}

function isBinaryData(val) {
  return ArrayBuffer.isView(val);
}
