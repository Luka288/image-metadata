import exifr from "exifr";

export async function extractMetadata(file) {
  const raw = await exifr.parse(file, {
    tiff: true,
    exif: true,
    gps: true,
    iptc: true,
    xmp: true,
    reviveValues: true,
    translateKeys: true,
    translateValues: true,
  });

  if (!raw) return { raw: {}, exif: {}, gps: {} };

  const cleanRaw = Object.fromEntries(
    Object.entries(raw).filter(
      ([key, val]) =>
        key !== "makerNote" &&
        val !== undefined &&
        val !== null &&
        !isBinaryData(val),
    ),
  );

  return {
    raw: cleanRaw,
    exif: extractEXIF(cleanRaw),
    gps: extractGPS(raw),
  };
}

function extractEXIF(data) {
  const exifKeys = [
    "Make",
    "Model",
    "ISO",
    "FNumber",
    "ExposureTime",
    "DateTimeOriginal",
  ];

  return Object.fromEntries(
    Object.entries(data).filter(([key]) => exifKeys.includes(key)),
  );
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
    latitude: data.latitude ?? data.gpsLatitude,
    longitude: data.longitude ?? data.gpsLongitude,
  };
}

function isBinaryData(val) {
  return ArrayBuffer.isView(val);
}
