
document.addEventListener("DOMContentLoaded", () => {

  const topic = document.getElementById("topic");
  const noteContent = document.getElementById("note-content");

  const fileInput = document.getElementById("note-files");
  const uploadArea = document.getElementById("upload-area");
  const fileList = document.getElementById("file-list");

  const fileCount = document.getElementById("file-count");
  const sendButton = document.getElementById("send-to-fai");
  const status = document.getElementById("status");

  let selectedFiles = [];

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  function showStatus(message, error = false) {
    status.textContent = message;
    status.style.display = "block";
    status.style.color = error ? "#c62828" : "#159bd3";
  }

  function formatSize(bytes) {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function isSupported(file) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain"
    ];

    return allowedTypes.includes(file.type);
  }

  function addFiles(files) {
    [...files].forEach(file => {

      if (!isSupported(file)) {
        showStatus(`${file.name} is not supported.`, true);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showStatus(`${file.name} exceeds 10MB.`, true);
        return;
      }

      const duplicate = selectedFiles.some(existing =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
      );

      if (!duplicate) {
        selectedFiles.push(file);
      }

    });

    renderFiles();
  }

  function renderFiles() {
    fileList.replaceChildren();

    fileCount.textContent =
      selectedFiles.length === 0
        ? "No files selected"
        : `${selectedFiles.length} file(s) selected`;

    selectedFiles.forEach((file, index) => {

      const item = document.createElement("div");
      item.className = "file-item";

      const info = document.createElement("div");
      info.className = "file-info";

      const name = document.createElement("span");
      name.className = "file-name";
      name.textContent = file.name;

      const size = document.createElement("span");
      size.className = "file-size";
      size.textContent = formatSize(file.size);

      info.append(name, size);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-file";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Remove " + file.name);

      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderFiles();
      });

      item.append(info, remove);
      fileList.appendChild(item);

    });
  }

  fileInput.addEventListener("change", event => {
    addFiles(event.target.files);
    fileInput.value = "";
  });

  ["dragenter", "dragover"].forEach(eventName => {
    uploadArea.addEventListener(eventName, event => {
      event.preventDefault();
      uploadArea.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach(eventName => {
    uploadArea.addEventListener(eventName, event => {
      event.preventDefault();
      uploadArea.classList.remove("dragover");
    });
  });

  uploadArea.addEventListener("drop", event => {
    addFiles(event.dataTransfer.files);
  });

  function readFile(file) {
    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onload = () => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result
        });
      };

      reader.onerror = () => {
        reject(new Error("Could not read " + file.name));
      };

      reader.readAsDataURL(file);

    });
  }

  sendButton.addEventListener("click", async () => {

    const topicValue = topic.value.trim();
    const contentValue = noteContent.value.trim();

    if (!topicValue) {
      showStatus("Please enter the topic.", true);
      topic.focus();
      return;
    }

    if (!contentValue && selectedFiles.length === 0) {
      showStatus("Paste your notes or select a file.", true);
      return;
    }

    sendButton.disabled = true;

    const buttonText =
      sendButton.querySelector("span:first-child");

    if (buttonText) {
      buttonText.textContent = "Preparing materials...";
    }

    try {

      const files = [];

      for (const file of selectedFiles) {
        files.push(await readFile(file));
      }

      const noteInput = {
        mode: "student_note",
        topic: topicValue,
        content: contentValue,
        files,
        created_at: new Date().toISOString()
      };

      localStorage.setItem(
        "fStudyNoteInput",
        JSON.stringify(noteInput)
      );

      // Hand materials to the existing FAI page.
      window.location.href = "/fai";

    } catch (error) {

      console.error(error);

      showStatus(
        error.message || "Unable to prepare your notes.",
        true
      );

      sendButton.disabled = false;

      if (buttonText) {
        buttonText.textContent = "Send to FAI";
      }

    }

  });

});
