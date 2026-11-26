
document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */

  const topic = document.getElementById("topic");
  const noteContent = document.getElementById("note-content");

  const fileInput = document.getElementById("note-files");
  const uploadArea = document.getElementById("upload-area");
  const fileList = document.getElementById("file-list");
  const fileCount = document.getElementById("file-count");

  const generateBtn = document.getElementById("send-to-fai");
  const buttonText = document.getElementById("send-button-text");
  const status = document.getElementById("status");

  const faiResult = document.getElementById("fai-result");
  const faiJson = document.getElementById("fai-json");
  const faiExtra = document.getElementById("fai-extra");
  const continueBtn = document.getElementById("continue-to-note");

  let selectedFiles = [];

  /* =========================
     INDEXEDDB SETTINGS
  ========================= */

  const FSTUDY_DB_NAME = "fstudy_files";
  const FSTUDY_DB_VERSION = 2;
  const FSTUDY_STORE = "images";


  /* =========================
     FILE INPUT
  ========================= */

  fileInput.addEventListener("change", () => {
    addFiles(fileInput.files);
    fileInput.value = "";
  });


  uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.classList.add("dragging");
  });


  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragging");
  });


  uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadArea.classList.remove("dragging");
    addFiles(event.dataTransfer.files);
  });


  /* =========================
     ADD FILES
  ========================= */

  function addFiles(files) {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "text/plain"
    ];

    for (const file of files) {

      if (!allowedTypes.includes(file.type)) {
        showStatus(
          `${file.name} has an unsupported format.`,
          "error"
        );
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        showStatus(
          `${file.name} is larger than 10MB.`,
          "error"
        );
        continue;
      }

      if (selectedFiles.length >= 20) {
        showStatus(
          "You can upload a maximum of 20 files.",
          "error"
        );
        break;
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


  /* =========================
     RENDER FILES
  ========================= */

  function renderFiles() {

    fileList.innerHTML = "";

    selectedFiles.forEach((file, index) => {

      const item = document.createElement("div");
      item.className = "file-item";

      const name = document.createElement("span");
      name.textContent = file.name;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute(
        "aria-label",
        "Remove " + file.name
      );

      remove.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        renderFiles();
      });

      item.append(name, remove);
      fileList.appendChild(item);

    });

    fileCount.textContent = selectedFiles.length
      ? `${selectedFiles.length} file(s) selected`
      : "No files selected";
  }


  /* =========================
     IMAGE COMPRESSION
  ========================= */

  async function compressImage(file) {

    if (!file.type.startsWith("image/")) {
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

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      const blob = await new Promise(resolve => {
        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.82
        );
      });

      if (!blob) {
        return file;
      }

      return new File(
        [blob],
        file.name.replace(/\.[^.]+$/, ".jpg"),
        {
          type: "image/jpeg",
          lastModified: Date.now()
        }
      );

    } finally {
      URL.revokeObjectURL(imageURL);
    }
  }


  /* =========================
     OPEN / UPGRADE INDEXEDDB
  ========================= */

  function openFstudyDB() {

    return new Promise((resolve, reject) => {

      const request = indexedDB.open(
        FSTUDY_DB_NAME,
        FSTUDY_DB_VERSION
      );


      request.onupgradeneeded = (event) => {

        const db = event.target.result;
        const transaction = event.target.transaction;

        /* Create the correct store if missing */

        if (!db.objectStoreNames.contains(FSTUDY_STORE)) {

          db.createObjectStore(FSTUDY_STORE, {
            keyPath: "id"
          });

          return;
        }


        /*
         * Migrate the old student store if it
         * was created without keyPath: "id".
         */

        const oldStore = transaction.objectStore(
          FSTUDY_STORE
        );

        if (oldStore.keyPath !== "id") {

          const records = [];

          const cursorRequest = oldStore.openCursor();

          cursorRequest.onsuccess = () => {

            const cursor = cursorRequest.result;

            if (cursor) {

              const oldValue = cursor.value;
              const oldId = cursor.primaryKey;

              let record;

              if (oldValue instanceof Blob) {

                record = {
                  id: oldId,
                  name: oldValue.name || "",
                  type: oldValue.type || "",
                  size: oldValue.size,
                  file: oldValue,
                  createdAt: Date.now()
                };

              } else {

                record = {
                  id: oldValue.id || oldId,
                  name: oldValue.name || "",
                  type: oldValue.type || "",
                  size: oldValue.size || (
                    oldValue.file
                      ? oldValue.file.size
                      : 0
                  ),
                  file: oldValue.file || oldValue,
                  createdAt: oldValue.createdAt || Date.now()
                };

              }

              records.push(record);

              cursor.continue();

            } else {

              /*
               * Cursor finished.
               * Recreate the store with keyPath "id".
               */

              db.deleteObjectStore(FSTUDY_STORE);

              const newStore = db.createObjectStore(
                FSTUDY_STORE,
                {
                  keyPath: "id"
                }
              );

              records.forEach(record => {
                newStore.put(record);
              });

            }

          };

        }

      };


      request.onsuccess = () => {

        const db = request.result;

        /*
         * Close this connection if another page
         * requests a database version upgrade.
         */

        db.onversionchange = () => {
          db.close();
        };

        resolve(db);
      };


      request.onerror = () => {
        reject(
          request.error ||
          new Error("Could not open FStudy image database.")
        );
      };


      request.onblocked = () => {
        console.warn(
          "FStudy database upgrade is blocked. Close other FStudy tabs and reload."
        );
      };

    });
  }


  /* =========================
     SAVE IMAGE TO INDEXEDDB
  ========================= */

  async function saveImageToDB(file) {

    const db = await openFstudyDB();

    const compressed = await compressImage(file);

    const imageId =
      "IMG-" +
      Date.now() +
      "-" +
      Math.random().toString(36).slice(2, 8);


    return new Promise((resolve, reject) => {

      const transaction = db.transaction(
        FSTUDY_STORE,
        "readwrite"
      );

      const store = transaction.objectStore(
        FSTUDY_STORE
      );


      /*
       * SAME RECORD STRUCTURE AS ADMIN
       */

      store.put({

        id: imageId,

        name: file.name,

        type: compressed.type || file.type,

        size: compressed.size,

        file: compressed,

        createdAt: Date.now()

      });


      transaction.oncomplete = () => {
        resolve(imageId);
      };


      transaction.onerror = () => {
        reject(
          transaction.error ||
          new Error(`Failed to save ${file.name}`)
        );
      };


      transaction.onabort = () => {
        reject(
          transaction.error ||
          new Error(`Saving ${file.name} was interrupted.`)
        );
      };

    });
  }


  /* =========================
     GET IMAGE FROM INDEXEDDB
  ========================= */

  async function getImageFromDB(id) {

    const db = await openFstudyDB();

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(
        FSTUDY_STORE,
        "readonly"
      );

      const store = transaction.objectStore(
        FSTUDY_STORE
      );

      const request = store.get(id);


      request.onsuccess = () => {
        resolve(request.result || null);
      };


      request.onerror = () => {
        reject(
          request.error ||
          new Error("Failed to retrieve image.")
        );
      };

    });
  }


  /* =========================
     JSON VALIDATION
  ========================= */

  function validateNote(note) {

    if (
      !note ||
      typeof note !== "object" ||
      Array.isArray(note)
    ) {
      throw new Error(
        "FAI returned an invalid note structure."
      );
    }

    if (
      note.success !== true ||
      typeof note.university !== "string" ||
      typeof note.course !== "string" ||
      typeof note.topic !== "string" ||
      typeof note.title !== "string" ||
      typeof note.uploaded_by !== "string" ||
      !Array.isArray(note.sections) ||
      note.sections.length === 0
    ) {
      throw new Error(
        "FAI returned an incomplete note structure."
      );
    }

    for (const section of note.sections) {

      if (
        typeof section.title !== "string" ||
        typeof section.content !== "string" ||
        !section.content.trim()
      ) {
        throw new Error(
          "One of the generated sections is invalid."
        );
      }
    }

    return true;
  }


  /* =========================
     STATUS
  ========================= */

  function showStatus(message, type = "info") {

    status.textContent = message;
    status.className = type;

  }


  /* =========================
     DISPLAY GENERATED NOTE
  ========================= */

  function displayResult(generatedNote) {

    faiJson.textContent = JSON.stringify(
      generatedNote,
      null,
      2
    );

    faiExtra.innerHTML = "";

    generatedNote.sections.forEach((section, index) => {

      const item = document.createElement("div");
      item.className = "fai-extra-item";

      const heading = document.createElement("strong");

      heading.textContent =
        `SECTION ${index + 1}: ${section.title}`;

      const content = document.createElement("p");
      content.textContent = section.content;

      item.append(heading, content);

      faiExtra.appendChild(item);

    });

    faiResult.hidden = false;

    faiResult.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }


  /* =========================
     GENERATE NOTE
  ========================= */

  generateBtn.addEventListener("click", async () => {

    const topicValue = topic.value.trim();
    const contentValue = noteContent.value.trim();

    if (!topicValue) {

      showStatus(
        "Please enter a topic.",
        "error"
      );

      return;
    }

    if (!contentValue && selectedFiles.length === 0) {

      showStatus(
        "Please paste your notes or upload a file.",
        "error"
      );

      return;
    }


    generateBtn.disabled = true;

    buttonText.textContent = "Sending to FAI...";

    showStatus(
      "FAI is studying your materials...",
      "info"
    );

    faiResult.hidden = true;


    try {

      const formData = new FormData();

      formData.append("topic", topicValue);

      formData.append("note_content", contentValue);


      /* Attach uploaded files */

      for (const file of selectedFiles) {

        const processedFile = await compressImage(file);

        formData.append(
          "files",
          processedFile,
          processedFile.name
        );

      }


      buttonText.textContent = "Generating sections...";


      /* Send to dedicated FAI endpoint */

      const response = await fetch(
        window.CONFIG.API_URL + "/fai-generate-notes",
        {
          method: "POST",
          body: formData
        }
      );


      const noteData = await response.json();


      if (!response.ok) {

        throw new Error(
          noteData.error ||
          "FAI could not process your materials."
        );

      }


      validateNote(noteData);


      buttonText.textContent = "Preparing note...";

      showStatus(
        "Preparing your study note...",
        "info"
      );


      /* =========================
         SAVE IMAGE REFERENCES
      ========================= */

      const noteFiles = [];

      for (const file of selectedFiles) {

        if (file.type.startsWith("image/")) {

          showStatus(
            `Saving ${file.name}...`,
            "info"
          );

          const imageId = await saveImageToDB(file);

          noteFiles.push({

            id: imageId,

            name: file.name,

            type: "image/jpeg",

            size: file.size

          });

        }

      }


      /* =========================
         CREATE COMPLETE NOTE
      ========================= */

      const generatedNote = {

        ...noteData,

        files: noteFiles

      };


      /* =========================
         SAVE FOR VIEW-NOTE
      ========================= */

      const savedNote = JSON.stringify(generatedNote);

      localStorage.setItem(
        "viewing_note",
        savedNote
      );


      /* =========================
         SAVE TO MY NOTES
      ========================= */

      let account = {};

      try {

        account = JSON.parse(
          localStorage.getItem("faccount")
        ) || {};

      } catch {

        account = {};

      }


      const notesKey = account.id
        ? `myfstudynote_${account.id}`
        : "myfstudynote";


      let myNotes = [];

      try {

        myNotes = JSON.parse(
          localStorage.getItem(notesKey)
        ) || [];

        if (!Array.isArray(myNotes)) {
          myNotes = [];
        }

      } catch {

        myNotes = [];

      }


      myNotes.push(generatedNote);

      localStorage.setItem(
        notesKey,
        JSON.stringify(myNotes)
      );


      /* =========================
         DISPLAY GENERATED NOTE
      ========================= */

      displayResult(generatedNote);

      showStatus(
        "FAI successfully generated your study note.",
        "success"
      );

      buttonText.textContent = "Generated successfully";


    } catch (error) {

      console.error(
        "FStudy note generation error:",
        error
      );

      showStatus(
        error.message ||
        "Something went wrong. Please try again.",
        "error"
      );

      generateBtn.disabled = false;

      buttonText.textContent = "Send to FAI";

    }

  });


  /* =========================
     CONTINUE TO NOTE
  ========================= */

  continueBtn.addEventListener("click", () => {

    const savedNote = localStorage.getItem("viewing_note");

    if (!savedNote) {

      showStatus(
        "Your generated note could not be found. Please generate it again.",
        "error"
      );

      return;
    }

    location.href = "/view-note";

  });

});
