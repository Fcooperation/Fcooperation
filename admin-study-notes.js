document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* =========================
       ELEMENTS
    ========================= */

    const university =
      document.getElementById(
        "university"
      );

    const course =
      document.getElementById(
        "course"
      );

    const noteTitle =
      document.getElementById(
        "note-title"
      );

    const topic =
      document.getElementById(
        "topic"
      );

    const uploadedBy =
      document.getElementById(
        "uploaded-by"
      );

    const sections =
      document.getElementById(
        "sections"
      );

    const addSectionBtn =
      document.getElementById(
        "add-section-btn"
      );

    const saveBtn =
      document.getElementById(
        "save-btn"
      );

    const jsonInput =
      document.getElementById(
        "json-input"
      );

    const uploadJsonBtn =
      document.getElementById(
        "upload-json-btn"
      );

    const jsonFile =
      document.getElementById(
        "json-file"
      );

    const uploadFileBtn =
      document.getElementById(
        "upload-file-btn"
      );

    const status =
      document.getElementById(
        "status"
      );

    const backBtn =
      document.getElementById(
        "back-btn"
      );


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
       STATUS
    ========================= */

    function showStatus(
      message,
      isError = false
    ) {

      status.textContent =
        message;

      status.classList.remove(
        "hidden"
      );

      status.style.background =
        isError
          ? "#c62828"
          : "#222";


      setTimeout(
        () => {

          status.classList.add(
            "hidden"
          );

        },
        4000
      );

    }


    /* =========================
       API
    ========================= */

    async function sendNotes(
      note
    ) {

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
                  "upload_notes",

                note

              })

          }
        );


      if (!response.ok) {

        throw new Error(
          "Failed to upload notes."
        );

      }


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.error ||
          "Failed to upload notes."
        );

      }


      return data;

    }


    /* =========================
       LOAD UNIVERSITIES
    ========================= */

    async function loadUniversities() {

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
                    "get_universities"

                })

            }
          );


        const data =
          await response.json();


        if (!data.success) {

          throw new Error(
            data.error ||
            "Failed to load universities."
          );

        }


        data.universities.forEach(
          name => {

            const option =
              document.createElement(
                "option"
              );

            option.value =
              name;

            option.textContent =
              name;

            university.appendChild(
              option
            );

          }
        );

      } catch (err) {

        showStatus(
          err.message,
          true
        );

      }

    }


    /* =========================
       LOAD COURSES
    ========================= */

    university.addEventListener(
      "change",
      async () => {

        const selectedUniversity =
          university.value;


        course.innerHTML =
          `
          <option value="">
            Select Course
          </option>
          `;

        course.disabled =
          true;


        if (!selectedUniversity) {

          return;

        }


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
                      "get_courses",

                    university:
                      selectedUniversity

                  })

              }
            );


          const data =
            await response.json();


          if (!data.success) {

            throw new Error(
              data.error ||
              "Failed to load courses."
            );

          }


          data.courses.forEach(
            name => {

              const option =
                document.createElement(
                  "option"
                );

              option.value =
                name;

              option.textContent =
                name;

              course.appendChild(
                option
              );

            }
          );


          course.disabled =
            false;

        } catch (err) {

          showStatus(
            err.message,
            true
          );

        }

      }
    );


    /* =========================
       ADD SECTION
    ========================= */

    function addSection(
      titleValue = "",
      contentValue = ""
    ) {

      const section =
        document.createElement(
          "div"
        );

      section.className =
        "note-section";


      const sectionNumber =
        sections.children.length + 1;


      section.innerHTML = `

        <div class="note-section-header">

          <div class="note-section-title">
            Section ${sectionNumber}
          </div>

          <button
            type="button"
            class="remove-section"
          >
            Remove
          </button>

        </div>


        <label>
          Title
        </label>

        <input
          type="text"
          class="section-title"
          placeholder="Section title"
        >


        <label>
          Content
        </label>

        <textarea
          class="section-content"
          placeholder="Write the section content here..."
        ></textarea>

      `;


      section.querySelector(
        ".section-title"
      ).value =
        titleValue;


      section.querySelector(
        ".section-content"
      ).value =
        contentValue;


      section.querySelector(
        ".remove-section"
      ).addEventListener(
        "click",
        () => {

          section.remove();

          refreshSectionNumbers();

        }
      );


      sections.appendChild(
        section
      );

    }


    /* =========================
       SECTION NUMBERS
    ========================= */

    function refreshSectionNumbers() {

      [
        ...sections.children
      ].forEach(
        (section, index) => {

          section.querySelector(
            ".note-section-title"
          ).textContent =
            `Section ${index + 1}`;

        }
      );

    }


    addSectionBtn.addEventListener(
      "click",
      () => {

        addSection();

      }
    );


    // Start with one section

    addSection();


    /* =========================
       COLLECT MANUAL NOTE
    ========================= */

    function collectManualNote() {

      const sectionElements =
        [
          ...sections.children
        ];


      const sectionData =
        sectionElements.map(
          (section, index) => {

            return {

              title:
                section.querySelector(
                  ".section-title"
                ).value.trim(),

              content:
                section.querySelector(
                  ".section-content"
                ).value.trim(),

              section_order:
                index + 1

            };

          }
        );


      return {

        university:
          university.value.trim(),

        course:
          course.value.trim(),

        title:
          noteTitle.value.trim(),

        topic:
          topic.value.trim(),

        uploaded_by:
          uploadedBy.value.trim(),

        sections:
          sectionData

      };

    }


    /* =========================
       VALIDATE NOTE
    ========================= */

    function validateNote(
      note
    ) {

      if (!note.university) {

        throw new Error(
          "Select a university."
        );

      }


      if (!note.course) {

        throw new Error(
          "Select a course."
        );

      }


      if (!note.title) {

        throw new Error(
          "Enter a note title."
        );

      }


      if (
        !note.sections ||
        !note.sections.length
      ) {

        throw new Error(
          "Add at least one section."
        );

      }


      for (
        let i = 0;
        i < note.sections.length;
        i++
      ) {

        if (
          !note.sections[i].title
        ) {

          throw new Error(
            `Section ${i + 1} needs a title.`
          );

        }


        if (
          !note.sections[i].content
        ) {

          throw new Error(
            `Section ${i + 1} needs content.`
          );

        }

      }

    }


    /* =========================
       SAVE MANUAL NOTE
    ========================= */

    saveBtn.addEventListener(
      "click",
      async () => {

        try {

          const note =
            collectManualNote();


          validateNote(
            note
          );


          saveBtn.disabled =
            true;

          saveBtn.textContent =
            "Saving...";


          await sendNotes(
            note
          );


          showStatus(
            "Note uploaded successfully."
          );


          saveBtn.textContent =
            "Saved";


        } catch (err) {

          showStatus(
            err.message,
            true
          );

          saveBtn.disabled =
            false;

          saveBtn.textContent =
            "Save Note";

        }

      }
    );


    /* =========================
       PARSE JSON
    ========================= */

    function parseJSON(
      text
    ) {

      let parsed;


      try {

        parsed =
          JSON.parse(
            text
          );

      } catch {

        throw new Error(
          "Invalid JSON."
        );

      }


      validateNote(
        parsed
      );


      return parsed;

    }


    /* =========================
       UPLOAD JSON TEXT
    ========================= */

    uploadJsonBtn.addEventListener(
      "click",
      async () => {

        try {

          if (
            !jsonInput.value.trim()
          ) {

            throw new Error(
              "Paste the JSON first."
            );

          }


          const note =
            parseJSON(
              jsonInput.value
            );


          uploadJsonBtn.disabled =
            true;

          uploadJsonBtn.textContent =
            "Uploading...";


          await sendNotes(
            note
          );


          showStatus(
            "JSON note uploaded successfully."
          );


          uploadJsonBtn.textContent =
            "Uploaded";


        } catch (err) {

          showStatus(
            err.message,
            true
          );

          uploadJsonBtn.disabled =
            false;

          uploadJsonBtn.textContent =
            "Upload JSON";

        }

      }
    );


    /* =========================
       UPLOAD JSON FILE
    ========================= */

    uploadFileBtn.addEventListener(
      "click",
      () => {

        const file =
          jsonFile.files[0];


        if (!file) {

          showStatus(
            "Select a JSON file first.",
            true
          );

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          async event => {

            try {

              const note =
                parseJSON(
                  event.target.result
                );


              uploadFileBtn.disabled =
                true;

              uploadFileBtn.textContent =
                "Uploading...";


              await sendNotes(
                note
              );


              showStatus(
                "JSON file uploaded successfully."
              );


              uploadFileBtn.textContent =
                "Uploaded";


            } catch (err) {

              showStatus(
                err.message,
                true
              );

              uploadFileBtn.disabled =
                false;

              uploadFileBtn.textContent =
                "Upload JSON File";

            }

          };


        reader.onerror =
          () => {

            showStatus(
              "Could not read the JSON file.",
              true
            );

          };


        reader.readAsText(
          file
        );

      }
    );


    /* =========================
       START
    ========================= */

    loadUniversities();

  }
);