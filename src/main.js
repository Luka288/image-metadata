import "./style.css";
import { extractMetadata } from "./services/metadata.service";
import { formatSize } from "./utils/formatSize";
import { formatKey } from "./utils/keyformat";
import { handleHeic } from "./services/heic.service";

const fileUploadBtn = document.getElementById("fileUploadInput");
const fileInput = document.getElementById("fileInput");
const metadataSec = document.getElementById("metadata");
const demoImage = document.getElementById("demoImage");
const nav = document.querySelectorAll(".tabNav");
const upload = document.getElementById("upload");

let currentMetadata = null;
let currentFile = null;
let activeTab = "BASIC";

fileUploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (event) => {
  const image = event.target.files[0];

  handleFile(image);
});

upload.addEventListener("dragover", (e) => {
  e.preventDefault();
  upload.classList.add("drag-drop");
});

upload.addEventListener("dragleave", (e) => {
  if (!upload.contains(e.relatedTarget)) {
    upload.classList.remove("drag-drop");
  }
});

upload.addEventListener("drop", (e) => {
  e.preventDefault();
  upload.classList.remove("drag-drop");

  const file = e.dataTransfer.files[0];

  if (!file) return;

  handleFile(file);
});

async function handleFile(file) {
  showLoading();

  nav.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      nav.forEach((t) => t.classList.remove("active"));

      const el = e.currentTarget;
      el.classList.add("active");

      activeTab = el.dataset.type;

      renderData();
    });
  });

  try {
    const isHeic =
      file.name.toLowerCase().endsWith(".heic") || file.type === "image/heic";

    let previewUrl;
    let metadata;
    const imageTitle = document.getElementById("imageTitle");
    const imageDetail = document.getElementById("imageDetail");

    if (isHeic) {
      const converted = await handleHeic(file);

      previewUrl = converted.url;

      metadata = await extractMetadata(file);
    } else {
      previewUrl = URL.createObjectURL(file);
      metadata = await extractMetadata(file);
    }

    currentMetadata = metadata;
    currentFile = file;

    imageTitle.innerHTML = file.name;
    imageDetail.innerHTML = file.type
      ? `${file.type} • ${file.lastModified}`
      : file.lastModified;

    metadataSec.style.display = "flex";
    demoImage.src = previewUrl;

    renderData();
  } finally {
    hideLoading();
  }
}

function renderData() {
  if (!currentMetadata || !currentFile) return;

  const data = document.querySelector(".data");

  data.innerHTML = "";

  let displayData = {};

  switch (activeTab) {
    case "BASIC":
      displayData = getBasicData(currentFile);

      if (Object.keys(displayData).length === 0) {
        data.innerHTML = `<p class="no-data">Metadata is unavailable for this image.</p>`;
      }
      break;
    case "EXIF":
      displayData = currentMetadata.exif || {};

      if (Object.keys(displayData).length === 0) {
        data.innerHTML = `<p class="no-data">EXIF metadata is unavailable for this image.</p>`;
      }

      break;
    case "GPS":
      displayData = currentMetadata.gps || {};

      console.log(currentMetadata.gps);

      if (Object.keys(displayData).length === 0) {
        data.innerHTML = `<p class="no-data">GPS metadata is unavailable for this image.</p>`;
      }

      break;
    case "RAW":
      displayData = currentMetadata.raw || {};

      if (Object.keys(displayData).length === 0) {
        data.innerHTML = `<p class="no-data">RAW metadata is unavailable for this image.</p>`;
      }
      break;
  }

  renderList(displayData);
}

function renderList(obj) {
  const data = document.querySelector(".data");
  if (!obj || Object.keys(obj).length === 0) return;

  const ul = document.createElement("ul");
  ul.classList.add = "metadataUl";

  Object.entries(obj).forEach(([key, value]) => {
    const li = document.createElement("li");

    li.innerHTML = `<span>${formatKey(key)}:</span> ${typeof value === "object" ? JSON.stringify(value) : value === "" ? "UNKNOWN" : value}`;

    ul.appendChild(li);
  });

  if (obj.latitude && obj.longitude) {
    const mapLi = document.createElement("li");
    mapLi.className = "maps-row";

    const mapUrl = `https://www.google.com/maps?q=${obj.latitude},${obj.longitude}`;

    mapLi.innerHTML = `
      <span>Location:</span>
      <a href="${mapUrl}" target="_blank" class="maps-link">View on Google Maps</a>
    `;
    ul.appendChild(mapLi);
  }

  data.appendChild(ul);
}

function getBasicData(file) {
  const date = new Date(file.lastModified);

  return {
    name: file.name,
    type: file.type,
    size: formatSize(file.size),
    lastModified: date.toLocaleDateString(),
  };
}

function showLoading() {
  document.querySelector(".overlay").style.display = "flex";
}

function hideLoading() {
  document.querySelector(".overlay").style.display = "none";
}
