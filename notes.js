document.addEventListener("DOMContentLoaded", () => {

  const topic = document.getElementById("topic");
  const noteContent = document.getElementById("note-content");

  const fileInput = document.getElementById("note-files");
  const uploadArea = document.getElementById("upload-area");
  const fileList = document.getElementById("file-list");
  const fileCount = document.getElementById("file-count");

  const generateBtn = document.getElementById("send-to-fai");
  const status = document.getElementById("status");

  let selectedFiles = [];

  const FSTUDY_DB_NAME = "fstudy_files";
  const FSTUDY_DB_VERSION = 1;
  const FSTUDY_STORE = "images";

  /* =========================
     FILE HANDLING
  ========================= */

  fileInput.addEventListener("change", () => {
    addFiles(fileInput.files);
    fileInput.value = "";
  });

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragging");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragging");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragging");
    addFiles(e.dataTransfer.files);
  });

  function addFiles(files) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain"
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) continue;

      if (file.size > 10 * 1024 * 1024) {
        showStatus(`${file.name} is larger than 10MB.`, "error");
        continue;
      }

      const duplicate = selectedFiles.some(
        existing =>
          existing.name === file.name &&
          existing.size === file.size
      );

      if (!duplicate) {
        selectedFiles.push(file);
      }
    }

    renderFiles();
  }

  function renderFiles() {
    fileList.innerHTML = "";

    selectedFiles.forEach((file, index) => {
      const item = document.createElement("div");

      item.className = "file-item";

      item.innerHTML = `
        <span>${escapeHTML(file.name)}</span>
        <button type="button" data-index="${index}">×</button>
      `;

      item.querySelector("button").addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderFiles();
      });

      fileList.appendChild(item);
    });

    fileCount.textContent = selectedFiles.length;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  /* =========================
     IMAGE COMPRESSION
  ========================= */

  async function compressImage(file) {
    if (!file.type.startsWith("image/") || file.type === "image/gif") {
      return file;
    }

    const image = new Image();

    const imageURL = URL.createObjectURL(file);

    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageURL;
      });

      const maxSize = 2000;

      let width = image.width;
      let height = image.height;

      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(
          maxSize / width,
          maxSize / height
        );

        width *= ratio;
        height *= ratio;
      }

      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, "image/jpeg", 0.82);
      });

      if (!blob) return file;

      return new File(
        [blob],
        file.name.replace(/\.[^.]+$/, ".jpg"),
        { type: "image/jpeg" }
      );

    } finally {
      URL.revokeObjectURL(imageURL);
    }
  }

  /* =========================
     INDEXED DB
  ========================= */

  function openFstudyDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        FSTUDY_DB_NAME,
        FSTUDY_DB_VERSION
      );

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(FSTUDY_STORE)) {
          db.createObjectStore(FSTUDY_STORE);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveImageToDB(file) {
    const db = await openFstudyDB();

    const compressed = await compressImage(file);

    const imageId =
      "img_" + Date.now() + "_" +
      Math.floor(Math.random() * 100000);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        FSTUDY_STORE,
        "readwrite"
      );

      transaction.objectStore(FSTUDY_STORE).put(
        compressed,
        imageId
      );

      transaction.oncomplete = () => {
        db.close();
        resolve(imageId);
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  }

  /* =========================
     JSON CLEANING
  ========================= */

  function cleanJson(answer) {
    let cleaned = answer.trim();

    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    return cleaned;
  }

  /* =========================
     JSON VALIDATION
  ========================= */

  function validateNote(note) {
    if (!note || typeof note !== "object" || Array.isArray(note)) {
      throw new Error("FAI returned an invalid note structure.");
    }

    if (!Object.keys(note).length) {
      throw new Error("The generated note is empty.");
    }

    return true;
  }

  /* =========================
     STATUS
  ========================= */

  function showStatus(message, type = "info") {
    status.textContent = message;
    status.className = "status " + type;
  }

  /* =========================
     GENERATE NOTE
  ========================= */

  generateBtn.addEventListener("click", async () => {

    const topicValue = topic.value.trim();
    const contentValue = noteContent.value.trim();

    if (!topicValue) {
      showStatus("Please enter a topic.", "error");
      return;
    }

    if (!contentValue && selectedFiles.length === 0) {
      showStatus("Please paste your notes or upload a file.", "error");
      return;
    }

    generateBtn.disabled = true;

    showStatus("FAI is studying your materials...", "info");

    try {

      const university =
        localStorage.getItem("studying_uni") || "";

      const universityData =
        JSON.parse(
          localStorage.getItem("studying_uni_data") || "{}"
        );

      const formData = new FormData();

      formData.append("university", university);
      formData.append("course", "");
      formData.append("topic", topicValue);
      formData.append("title", topicValue);
      formData.append("uploaded_by", "Student");
      formData.append("note_content", contentValue);
      formData.append("mode", "generate_note");

      for (const file of selectedFiles) {
        const processedFile = await compressImage(file);

        formData.append(
          "files",
          processedFile,
          processedFile.name
        );
      }

      const response = await fetch(
        window.CONFIG.API_URL + "/fai",
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("FAI could not process your materials.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let answer = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const rawData = line.slice(5).trim();

          if (!rawData) continue;

          let event;

          try {
            event = JSON.parse(rawData);
          } catch {
            continue;
          }

          if (event.type === "chunk") {
            answer += event.text || "";
          }

          if (event.type === "error") {
            throw new Error(
              event.message || "FAI generation failed."
            );
          }
        }
      }

      if (!answer.trim()) {
        throw new Error("FAI returned an empty response.");
      }

      showStatus("Preparing your study note...", "info");

      const noteData = JSON.parse(cleanJson(answer));

      validateNote(noteData);

      /* =========================
         SAVE IMAGE REFERENCES
      ========================= */

      const noteFiles = [];

      for (const file of selectedFiles) {
        if (file.type.startsWith("image/")) {
          const imageId = await saveImageToDB(file);

          noteFiles.push({
            id: imageId,
            name: file.name,
            type: file.type,
            size: file.size
          });
        }
      }

      /* =========================
         GENERATED NOTE
      ========================= */

      const generatedNote = {
        ...noteData,
        university: university,
        university_data: universityData,
        topic: topicValue,
        files: noteFiles,
        created_at: new Date().toISOString()
      };

      localStorage.setItem(
        "fStudyGeneratedNote",
        JSON.stringify(generatedNote)
      );

      showStatus("Your study note is ready!", "success");

      location.href = "/view-note";

    } catch (error) {

      console.error("FStudy note generation error:", error);

      showStatus(
        error.message || "Something went wrong. Please try again.",
        "error"
      );

      generateBtn.disabled = false;
    }

  });

});
