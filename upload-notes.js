document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =========================
       ELEMENTS
    ========================= */

    const backBtn =
      document.getElementById(
        "back-btn"
      );

    const universityInput =
      document.getElementById(
        "university"
      );

    const courseInput =
      document.getElementById(
        "course"
      );

    const topicInput =
      document.getElementById(
        "topic"
      );

    const titleInput =
      document.getElementById(
        "title"
      );

    const uploadedByInput =
      document.getElementById(
        "uploaded-by"
      );

    const noteContentInput =
      document.getElementById(
        "note-content"
      );

    const filesInput =
      document.getElementById(
        "files"
      );

    const fileDrop =
      document.getElementById(
        "file-drop"
      );

    const fileList =
      document.getElementById(
        "file-list"
      );

    const fileCount =
      document.getElementById(
        "file-count"
      );

    const generateBtn =
      document.getElementById(
        "generate-btn"
      );

    const saveBtn =
      document.getElementById(
        "save-btn"
      );

    const status =
      document.getElementById(
        "status"
      );

    const previewCard =
      document.getElementById(
        "preview-card"
      );

    const preview =
      document.getElementById(
        "preview"
      );


    /* =========================
       STATE
    ========================= */

    let selectedFiles = [];

    let generatedNote = null;


    /* =========================
       BACK
    ========================= */

    backBtn.addEventListener(
      "click",
      () => {
        history.back();
      }
    );


/* =========================
   FILE INPUT
========================= */

filesInput.addEventListener("change", async function () {

  const files = Array.from(this.files || []);

  if (!files.length) {
    return;
  }

  await addFiles(files);

  this.value = "";

});


/* =========================
   DRAG / DROP
========================= */

fileDrop.addEventListener("dragover", function (event) {

  event.preventDefault();

  fileDrop.classList.add("dragging");

});


fileDrop.addEventListener("dragleave", function () {

  fileDrop.classList.remove("dragging");

});


fileDrop.addEventListener("drop", async function (event) {

  event.preventDefault();

  fileDrop.classList.remove("dragging");

  const files =
    Array.from(
      event.dataTransfer?.files || []
    );

  if (!files.length) {
    return;
  }

  await addFiles(files);

});


/* =========================
   ADD FILES
========================= */

async function addFiles(files) {

  for (const file of files) {

    if (selectedFiles.length >= 20) {

      showStatus(
        "You can upload a maximum of 20 files.",
        "error"
      );

      break;
    }

    const duplicate =
      selectedFiles.some(
        existing =>
          existing.name === file.name &&
          existing.size === file.size
      );

    if (duplicate) {
      continue;
    }

    /*
     * Compress image immediately
     */

    let processedFile = file;

    if (file.type.startsWith("image/")) {

      showStatus(
        `Compressing ${file.name}...`,
        "info"
      );

      processedFile =
        await compressImage(file);

    }

    selectedFiles.push(processedFile);

    renderFiles();
  }

  if (selectedFiles.length > 0) {

    showStatus(
      `${selectedFiles.length} study material${selectedFiles.length > 1 ? "s" : ""} ready.`,
      "success"
    );

  }

}

/* =========================
   RENDER FILES
========================= */

function renderFiles() {

  /*
   * Make sure the elements actually exist.
   */

  if (!fileList || !fileCount) {
    return;
  }


  fileList.innerHTML = "";


  fileCount.textContent =
    `${selectedFiles.length} / 20`;


  selectedFiles.forEach(
    (file, index) => {

      const item =
        document.createElement("div");

      item.className =
        "file-item";


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


      const remove =
        document.createElement("button");

      remove.type = "button";

      remove.className =
        "remove-file";

      remove.textContent = "×";


      remove.addEventListener(
        "click",
        function () {

          selectedFiles.splice(
            index,
            1
          );

          renderFiles();

        }
      );


      item.appendChild(info);
      item.appendChild(remove);


      fileList.appendChild(item);

    }
  );

}


/* =========================
   FILE SIZE
========================= */

function formatFileSize(bytes) {

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {

    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;

  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;

}


    /* =========================
       STATUS
    ========================= */

    function showStatus(
      message,
      type = "info"
    ) {

      status.textContent =
        message;

      status.className =
        `status ${type}`;

    }


    function hideStatus() {

      status.className =
        "status hidden";

      status.textContent =
        "";

    }


    /* =========================
       VALIDATE
    ========================= */

    function validateInputs() {

      if (
        !universityInput.value.trim()
      ) {

        showStatus(
          "Enter the university.",
          "error"
        );

        universityInput.focus();

        return false;

      }


      if (
        !courseInput.value.trim()
      ) {

        showStatus(
          "Enter the course.",
          "error"
        );

        courseInput.focus();

        return false;

      }


      if (
        !topicInput.value.trim()
      ) {

        showStatus(
          "Enter the topic.",
          "error"
        );

        topicInput.focus();

        return false;

      }


      if (
        !titleInput.value.trim()
      ) {

        showStatus(
          "Enter the note title.",
          "error"
        );

        titleInput.focus();

        return false;

      }


      if (
        !uploadedByInput.value.trim()
      ) {

        showStatus(
          "Enter who uploaded the note.",
          "error"
        );

        uploadedByInput.focus();

        return false;

      }


      if (
        !noteContentInput.value.trim() &&
        selectedFiles.length === 0
      ) {

        showStatus(
          "Enter some note content or upload at least one file.",
          "error"
        );

        return false;

      }


      return true;

    }

/* =========================
   COMPRESS IMAGE
========================= */

async function compressImage(file) {

  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {

    const img = new Image();

    const objectUrl =
      URL.createObjectURL(file);

    img.onload = () => {

      URL.revokeObjectURL(objectUrl);

      const MAX_WIDTH = 2000;
      const MAX_HEIGHT = 2000;

      let width = img.width;
      let height = img.height;

      /* -------------------------
         Resize large images
      ------------------------- */

      if (
        width > MAX_WIDTH ||
        height > MAX_HEIGHT
      ) {

        const ratio = Math.min(
          MAX_WIDTH / width,
          MAX_HEIGHT / height
        );

        width =
          Math.round(width * ratio);

        height =
          Math.round(height * ratio);

      }

      const canvas =
        document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        img,
        0,
        0,
        width,
        height
      );

      /* -------------------------
         Convert to JPEG
      ------------------------- */

      canvas.toBlob(
        blob => {

          if (!blob) {
            resolve(file);
            return;
          }

          const compressedFile =
            new File(
              [blob],
              file.name.replace(
                /\.(png|webp|jpeg|jpg)$/i,
                ".jpg"
              ),
              {
                type: "image/jpeg",
                lastModified:
                  Date.now()
              }
            );

          resolve(
            compressedFile
          );

        },
        "image/jpeg",
        0.82
      );

    };

    img.onerror = () => {

      URL.revokeObjectURL(
        objectUrl
      );

      resolve(file);

    };

    img.src = objectUrl;

  });

}

/* =========================
   FSTUDY IMAGE DATABASE
========================= */

const FSTUDY_DB_NAME = "fstudy_files";
const FSTUDY_DB_VERSION = 1;
const FSTUDY_STORE = "images";


function openFstudyDB() {

  return new Promise((resolve, reject) => {

    const request =
      indexedDB.open(
        FSTUDY_DB_NAME,
        FSTUDY_DB_VERSION
      );


    request.onupgradeneeded = function (event) {

      const db =
        event.target.result;


      if (
        !db.objectStoreNames.contains(
          FSTUDY_STORE
        )
      ) {

        db.createObjectStore(
          FSTUDY_STORE,
          {
            keyPath: "id"
          }
        );

      }

    };


    request.onsuccess = function () {

      resolve(
        request.result
      );

    };


    request.onerror = function () {

      reject(
        request.error ||
        new Error(
          "Failed to open Fstudy file database."
        )
      );

    };

  });

}


/* =========================
   SAVE IMAGE TO INDEXEDDB
========================= */

async function saveImageToDB(file) {

  const db =
    await openFstudyDB();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          FSTUDY_STORE,
          "readwrite"
        );


      const store =
        transaction.objectStore(
          FSTUDY_STORE
        );


      const id =
        "img_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2);


      const request =
        store.put({

          id: id,

          name: file.name,

          type: file.type,

          size: file.size,

          file: file,

          createdAt:
            Date.now()

        });


      request.onsuccess =
        () => {

          resolve(id);

        };


      request.onerror =
        () => {

          reject(
            request.error ||
            new Error(
              `Failed to save ${file.name}`
            )
          );

        };

    }
  );

}


/* =========================
   GET IMAGE FROM INDEXEDDB
========================= */

async function getImageFromDB(id) {

  const db =
    await openFstudyDB();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          FSTUDY_STORE,
          "readonly"
        );


      const store =
        transaction.objectStore(
          FSTUDY_STORE
        );


      const request =
        store.get(id);


      request.onsuccess =
        () => {

          resolve(
            request.result || null
          );

        };


      request.onerror =
        () => {

          reject(
            request.error ||
            new Error(
              "Failed to retrieve image."
            )
          );

        };

    }
  );

}


/* =========================
   DELETE IMAGE
========================= */

async function deleteImageFromDB(id) {

  const db =
    await openFstudyDB();


  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          FSTUDY_STORE,
          "readwrite"
        );


      const store =
        transaction.objectStore(
          FSTUDY_STORE
        );


      const request =
        store.delete(id);


      request.onsuccess =
        () => {

          resolve();

        };


      request.onerror =
        () => {

          reject(
            request.error
          );

        };

    }
  );

}

    /* =========================
       GENERATE NOTE
    ========================= */

    generateBtn.addEventListener(
      "click",
      async () => {

        if (
          !validateInputs()
        ) {
          return;
        }


        generatedNote = null;

        previewCard.classList.add(
          "hidden"
        );

        generateBtn.disabled =
          true;


        showStatus(
          "FAI is examining your study material...",
          "info"
        );


        try {

          const formData =
            new FormData();


          /*
           * Metadata
           */

          formData.append(
            "university",
            universityInput.value.trim()
          );

          formData.append(
            "course",
            courseInput.value.trim()
          );

          formData.append(
            "topic",
            topicInput.value.trim()
          );

          formData.append(
            "title",
            titleInput.value.trim()
          );

          formData.append(
            "uploaded_by",
            uploadedByInput.value.trim()
          );


          /*
           * Typed note content
           */

          formData.append(
            "note_content",
            noteContentInput.value.trim()
          );


          /*
           * Tell backend this is
           * a note-generation request
           */

          formData.append(
            "mode",
            "generate_note"
          );


/* =========================
   COMPRESS + ADD FILES
========================= */

for (const file of selectedFiles) {

  formData.append(
    "files",
    file,
    file.name
  );

}


          /* =========================
             SEND TO FAI
          ========================= */

          const response =
            await fetch(
              window.CONFIG.API_URL +
              "/fai",
              {
                method: "POST",
                body: formData
              }
            );


          if (!response.ok) {

            const errorText =
              await response.text();

            throw new Error(
              errorText ||
              "FAI request failed."
            );

          }


          if (!response.body) {

            throw new Error(
              "FAI did not return a readable response."
            );

          }


          /* =========================
             READ SSE
          ========================= */

          const reader =
            response.body.getReader();

          const decoder =
            new TextDecoder();

          let buffer = "";

          let answer = "";


          while (true) {

            const {
              value,
              done
            } =
              await reader.read();


            if (done) {
              break;
            }


            buffer +=
              decoder.decode(
                value,
                {
                  stream: true
                }
              );


            const events =
              buffer.split(
                "\n\n"
              );


            buffer =
              events.pop() || "";


            for (
              const eventText
              of events
            ) {

              const lines =
                eventText.split(
                  "\n"
                );


              for (
                const line
                of lines
              ) {

                if (
                  !line.startsWith(
                    "data:"
                  )
                ) {
                  continue;
                }


                const jsonText =
                  line
                    .replace(
                      /^data:\s*/,
                      ""
                    )
                    .trim();


                if (!jsonText) {
                  continue;
                }


                let event;


                try {

                  event =
                    JSON.parse(
                      jsonText
                    );

                } catch {

                  continue;

                }


                if (
                  event.type ===
                  "chunk"
                ) {

                  answer +=
                    event.text || "";

                }


                if (
                  event.type ===
                  "error"
                ) {

                  throw new Error(
                    event.message ||
                    "FAI failed."
                  );

                }

              }

            }

          }


          if (
            !answer.trim()
          ) {

            throw new Error(
              "FAI returned an empty response."
            );

          }


/* =========================
   PARSE NOTE JSON
========================= */

let noteData;

try {

  const cleaned =
    cleanJson(answer);

  noteData =
    JSON.parse(cleaned);

} catch (error) {

  console.error(
    "❌ FAI RETURNED INVALID JSON:"
  );

  console.error(answer);

  /* -------------------------
     SHOW RAW FAI RESPONSE
  ------------------------- */

  previewCard.classList.remove(
    "hidden"
  );

  preview.textContent =
    answer || "(FAI returned nothing)";

  showStatus(
    "FAI returned invalid JSON. The raw response is shown below.",
    "error"
  );

  previewCard.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  throw new Error(
    "FAI did not return valid note JSON. See the raw response below."
  );

}


          /* =========================
             VALIDATE NOTE
          ========================= */

          validateNote(
            noteData
          );


/* =========================
   SAVE COMPRESSED IMAGES
   TO INDEXEDDB
========================= */

const noteFiles = [];


for (const file of selectedFiles) {

  if (
    file.type.startsWith("image/")
  ) {

    showStatus(
      `Saving ${file.name}...`,
      "info"
    );


    const imageId =
      await saveImageToDB(file);


    noteFiles.push({

      /*
       * Reference to the
       * actual image in IndexedDB
       */

      id: imageId,

      name: file.name,

      type: file.type,

      size: file.size

    });

  }

}


/* =========================
   CREATE COMPLETE NOTE
========================= */

generatedNote = {
  ...noteData,

  /*
   * Compressed uploaded images
   */
  files: noteFiles
};


          /* =========================
             PREVIEW
          ========================= */

          preview.textContent =
            JSON.stringify(
              noteData,
              null,
              2
            );


          previewCard.classList.remove(
            "hidden"
          );


          showStatus(
            "FAI successfully created the note. Review it below.",
            "success"
          );


          previewCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });


        } catch (error) {

          showStatus(
            error.message ||
            "Failed to generate note.",
            "error"
          );

        } finally {

          generateBtn.disabled =
            false;

        }

      }
    );


/* =========================
   CLEAN JSON
========================= */

function cleanJson(text) {

  if (!text) {
    return "";
  }

  let clean =
    String(text).trim();

  /* Remove JSON Markdown fences */

  clean =
    clean.replace(
      /^```json\s*/i,
      ""
    );

  clean =
    clean.replace(
      /^```\s*/i,
      ""
    );

  clean =
    clean.replace(
      /\s*```$/i,
      ""
    );

  clean =
    clean.trim();

  /* -------------------------
     Find JSON object
  ------------------------- */

  const first =
    clean.indexOf("{");

  const last =
    clean.lastIndexOf("}");

  if (
    first !== -1 &&
    last !== -1 &&
    last > first
  ) {

    clean =
      clean.slice(
        first,
        last + 1
      );

  }

  return clean.trim();

}

    /* =========================
       VALIDATE NOTE JSON
    ========================= */

    function validateNote(
      note
    ) {

      if (
        !note ||
        typeof note !==
          "object"
      ) {

        throw new Error(
          "FAI returned an invalid note."
        );

      }


      const requiredFields = [
        "university",
        "course",
        "topic",
        "title",
        "uploaded_by"
      ];


      for (
        const field
        of requiredFields
      ) {

        if (
          typeof note[field] !==
          "string" ||
          !note[field].trim()
        ) {

          throw new Error(
            `FAI note is missing "${field}".`
          );

        }

      }


      if (
        !Array.isArray(
          note.sections
        )
      ) {

        throw new Error(
          "FAI note has no sections."
        );

      }


      note.sections.forEach(
        (section, index) => {

          if (
            !section ||
            typeof section.title !==
              "string" ||
            typeof section.content !==
              "string"
          ) {

            throw new Error(
              `Invalid section ${index + 1}.`
            );

          }

        }
      );

    }


/* =========================
   SAVE NOTE
========================= */

saveBtn.addEventListener(
  "click",
  () => {

    if (!generatedNote) {

      showStatus(
        "There is no generated note to save.",
        "error"
      );

      return;

    }

    saveBtn.disabled = true;

    showStatus(
      "Saving note...",
      "info"
    );

    try {

      /* =========================
         GET ACCOUNT
      ========================= */

      let account = {};

      try {

        account =
          JSON.parse(
            localStorage.getItem(
              "faccount"
            )
          ) || {};

      } catch {

        account = {};

      }


      /* =========================
         ACCOUNT-SPECIFIC KEY
      ========================= */

      let notesKey =
        "myfstudynote";


      /*
       * If the user is logged in,
       * save notes under their account.
       */

      if (
        account.id
      ) {

        notesKey =
          `myfstudynote_${account.id}`;

      }


      /* =========================
         GET EXISTING NOTES
      ========================= */

      let myNotes = [];

      const existing =
        localStorage.getItem(
          notesKey
        );


      if (existing) {

        try {

          const parsed =
            JSON.parse(
              existing
            );


          if (
            Array.isArray(
              parsed
            )
          ) {

            myNotes =
              parsed;

          }

        } catch {

          myNotes = [];

        }

      }


      /* =========================
         ADD ACCOUNT ID TO NOTE
      ========================= */

      const noteToSave = {

        ...generatedNote,

        /*
         * This lets us know which
         * account created the note.
         */

        owner_id:
          account.id || null

      };


      /* =========================
         SAVE NOTE
      ========================= */

      myNotes.push(
        noteToSave
      );


      localStorage.setItem(
        notesKey,
        JSON.stringify(
          myNotes
        )
      );


      /* =========================
         CURRENT VIEWING NOTE
      ========================= */

      localStorage.setItem(
        "viewing_note",
        JSON.stringify(
          noteToSave
        )
      );


      /* =========================
         REDIRECT
      ========================= */

      window.location.href =
        "view-note";


    } catch (error) {

      showStatus(
        error.message ||
        "Failed to save note.",
        "error"
      );

      saveBtn.disabled =
        false;

    }

  }
);
  }
);