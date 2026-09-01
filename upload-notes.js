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

    filesInput.addEventListener(
      "change",
      () => {

        addFiles(
          Array.from(
            filesInput.files
          )
        );

        filesInput.value = "";

      }
    );


    /* =========================
       DRAG / DROP
    ========================= */

    fileDrop.addEventListener(
      "dragover",
      event => {

        event.preventDefault();

        fileDrop.classList.add(
          "dragging"
        );

      }
    );


    fileDrop.addEventListener(
      "dragleave",
      () => {

        fileDrop.classList.remove(
          "dragging"
        );

      }
    );


    fileDrop.addEventListener(
      "drop",
      event => {

        event.preventDefault();

        fileDrop.classList.remove(
          "dragging"
        );

        addFiles(
          Array.from(
            event.dataTransfer.files
          )
        );

      }
    );


    /* =========================
       ADD FILES
    ========================= */

    function addFiles(files) {

      for (const file of files) {

        if (
          selectedFiles.length >= 20
        ) {

          showStatus(
            "You can upload a maximum of 20 files.",
            "error"
          );

          break;

        }


        /*
         * Prevent duplicate files
         */

        const duplicate =
          selectedFiles.some(
            existing =>
              existing.name === file.name &&
              existing.size === file.size &&
              existing.lastModified ===
                file.lastModified
          );


        if (duplicate) {
          continue;
        }


        selectedFiles.push(file);

      }


      renderFiles();

    }


    /* =========================
       RENDER FILES
    ========================= */

    function renderFiles() {

      fileList.innerHTML = "";

      fileCount.textContent =
        `${selectedFiles.length} / 20`;


      selectedFiles.forEach(
        (file, index) => {

          const item =
            document.createElement(
              "div"
            );

          item.className =
            "file-item";


          const info =
            document.createElement(
              "div"
            );

          info.className =
            "file-info";


          const name =
            document.createElement(
              "div"
            );

          name.className =
            "file-name";

          name.textContent =
            file.name;


          const size =
            document.createElement(
              "div"
            );

          size.className =
            "file-size";

          size.textContent =
            formatFileSize(
              file.size
            );


          info.appendChild(
            name
          );

          info.appendChild(
            size
          );


          const remove =
            document.createElement(
              "button"
            );

          remove.type =
            "button";

          remove.className =
            "remove-file";

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


          item.appendChild(
            info
          );

          item.appendChild(
            remove
          );


          fileList.appendChild(
            item
          );

        }
      );

    }


    /* =========================
       FILE SIZE
    ========================= */

    function formatFileSize(
      bytes
    ) {

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


          /*
           * Add files
           */

          selectedFiles.forEach(
            file => {

              formData.append(
                "files",
                file,
                file.name
              );

            }
          );


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

            noteData =
              JSON.parse(
                cleanJson(
                  answer
                )
              );

          } catch {

            console.error(
              "FAI returned:",
              answer
            );

            throw new Error(
              "FAI did not return valid note JSON."
            );

          }


          /* =========================
             VALIDATE NOTE
          ========================= */

          validateNote(
            noteData
          );


          generatedNote =
            noteData;


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

    function cleanJson(
      text
    ) {

      let clean =
        text.trim();


      /*
       * Remove Markdown code fences
       */

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


      /*
       * Find the actual JSON object
       */

      const first =
        clean.indexOf(
          "{"
        );

      const last =
        clean.lastIndexOf(
          "}"
        );


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
      async () => {

        if (!generatedNote) {

          showStatus(
            "There is no generated note to save.",
            "error"
          );

          return;

        }


        saveBtn.disabled =
          true;


        showStatus(
          "Saving note...",
          "info"
        );


        try {

          const response =
            await fetch(
              window.CONFIG.API_URL +
              "/admin",
              {

                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify({

                    action:
                      "save_note",

                    note:
                      generatedNote

                  })

              }
            );


          const data =
            await response.json();


          if (
            !response.ok ||
            !data.success
          ) {

            throw new Error(
              data.error ||
              "Failed to save note."
            );

          }


          /*
           * Save locally too.
           * This allows your existing
           * view-notes.html to render
           * immediately.
           */

          localStorage.setItem(
            "viewing_note",
            JSON.stringify(
              generatedNote
            )
          );


          /*
           * Redirect to viewer
           */

          const params =
            new URLSearchParams({

              university:
                generatedNote.university,

              course:
                generatedNote.course,

              topic:
                generatedNote.topic

            });


          window.location.href =
            `view-notes.html?${params.toString()}`;


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