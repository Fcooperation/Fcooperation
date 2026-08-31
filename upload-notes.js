const API_URL =
"https://fweb-backend.onrender.com";

const fileInput =
document.getElementById("fileInput");

const selectBtn =
document.getElementById("selectBtn");

const uploadBtn =
document.getElementById("uploadBtn");

const fileList =
document.getElementById("fileList");

const filesSection =
document.getElementById("filesSection");

const fileCount =
document.getElementById("fileCount");

const status =
document.getElementById("status");

let selectedFiles = [];

// ------------------------------------
// SELECT FILE BUTTON
// ------------------------------------

selectBtn.addEventListener("click", () => {
fileInput.click();
});

// ------------------------------------
// FILE SELECTION
// ------------------------------------

fileInput.addEventListener("change", () => {

const incomingFiles =
Array.from(fileInput.files);

if (!incomingFiles.length) {
return;
}

// Maximum 20 files

for (const file of incomingFiles) {

if (selectedFiles.length >= 20) {
  break;
}


// Prevent duplicate files

const duplicate =
  selectedFiles.some(
    existing =>
      existing.name === file.name &&
      existing.size === file.size
  );


if (duplicate) {
  continue;
}


selectedFiles.push(file);

}

renderFiles();

// Reset input so the same file
// can be selected again later

fileInput.value = "";

});

// ------------------------------------
// RENDER FILES
// ------------------------------------

function renderFiles() {

fileList.innerHTML = "";

fileCount.textContent =
`${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}`;

if (selectedFiles.length === 0) {

filesSection.hidden = true;

uploadBtn.disabled = true;

return;

}

filesSection.hidden = false;

uploadBtn.disabled = false;

selectedFiles.forEach(
(file, index) => {

  const item =
    document.createElement("div");

  item.className =
    "file-item";


  // --------------------------------
  // PREVIEW
  // --------------------------------

  const preview =
    document.createElement("div");

  preview.className =
    "file-preview";


  // IMAGE

  if (
    file.type.startsWith("image/")
  ) {

    const img =
      document.createElement("img");

    const imageURL =
      URL.createObjectURL(file);

    img.src =
      imageURL;

    img.onload = () => {
      URL.revokeObjectURL(imageURL);
    };

    preview.appendChild(img);

  }


  // PDF

  else {

    const pdf =
      document.createElement("div");

    pdf.className =
      "pdf-icon";

    pdf.textContent =
      "📄";

    preview.appendChild(pdf);

  }


  // --------------------------------
  // FILE INFORMATION
  // --------------------------------

  const info =
    document.createElement("div");

  info.className =
    "file-info";


  const name =
    document.createElement("div");

  name.className =
    "file-name";

  name.textContent =
    file.name;


  const size =
    document.createElement("div");

  size.className =
    "file-size";

  size.textContent =
    formatFileSize(file.size);


  info.appendChild(name);
  info.appendChild(size);


  // --------------------------------
  // REMOVE BUTTON
  // --------------------------------

  const remove =
    document.createElement("button");

  remove.className =
    "remove-btn";

  remove.type =
    "button";

  remove.textContent =
    "×";


  remove.addEventListener(
    "click",
    () => {

      selectedFiles.splice(
        index,
        1
      );

      renderFiles();

    }
  );


  // --------------------------------
  // BUILD FILE ITEM
  // --------------------------------

  item.appendChild(preview);

  item.appendChild(info);

  item.appendChild(remove);

  fileList.appendChild(item);

}

);

}

// ------------------------------------
// UPLOAD
// ------------------------------------

uploadBtn.addEventListener(
"click",
async () => {

if (!selectedFiles.length) {
  return;
}


uploadBtn.disabled = true;

uploadBtn.textContent =
  "Uploading...";


showStatus(
  "Uploading your notes..."
);


const formData =
  new FormData();


// --------------------------------
// ADD ALL FILES
// --------------------------------

selectedFiles.forEach(
  file => {

    formData.append(
      "images",
      file
    );

  }
);


// --------------------------------
// OPTIONAL USER ID
// --------------------------------

const account =
  localStorage.getItem(
    "faccount"
  );


if (account) {

  try {

    const user =
      JSON.parse(account);


    if (user.userId) {

      formData.append(
        "userId",
        user.userId
      );

    }

  } catch (err) {

    // Ignore invalid account data

  }

}


// --------------------------------
// SEND TO BACKEND
// --------------------------------

try {

  const response =
    await fetch(
      `${API_URL}/past-question`,
      {
        method: "POST",
        body: formData
      }
    );


  const result =
    await response.json();


  if (!response.ok) {

    throw new Error(
      result.error ||
      "Upload failed"
    );

  }


  // --------------------------------
  // SUCCESS
  // --------------------------------

  showStatus(
    result.message ||
    "Notes uploaded successfully!"
  );


  selectedFiles = [];

  renderFiles();


  uploadBtn.textContent =
    "Upload Notes";


  console.log(
    "Upload result:",
    result
  );


} catch (error) {

  console.error(
    "Upload error:",
    error
  );


  showStatus(
    error.message ||
    "Unable to upload notes."
  );


  uploadBtn.disabled = false;

  uploadBtn.textContent =
    "Upload Notes";

}

}
);

// ------------------------------------
// FILE SIZE
// ------------------------------------

function formatFileSize(bytes) {

if (bytes < 1024) {

return `${bytes} B`;

}

if (bytes < 1024 * 1024) {

return `${(
  bytes / 1024
).toFixed(1)} KB`;

}

return "${( bytes / (1024 * 1024) ).toFixed(1)} MB";

}

// ------------------------------------
// STATUS
// ------------------------------------

function showStatus(message) {

status.hidden = false;

status.textContent =
message;

}

// ------------------------------------
// BACK BUTTON
// ------------------------------------

function goBack() {

if (history.length > 1) {

history.back();

} else {

window.location.href =
  "fstudy.html";

}

}