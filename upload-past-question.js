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

    const yearInput =
      document.getElementById(
        "year"
      );

    const sessionInput =
      document.getElementById(
        "session"
      );

    const difficultyInput =
      document.getElementById(
        "difficulty"
      );

    const instructorInput =
      document.getElementById(
        "instructor"
      );

    const questionInput =
      document.getElementById(
        "question"
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

    let generatedQuestions = [];


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
      async function () {

        const files =
          Array.from(
            this.files || []
          );

        if (!files.length) {
          return;
        }

        await addFiles(files);

        this.value = "";

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
      async event => {

        event.preventDefault();

        fileDrop.classList.remove(
          "dragging"
        );

        const files =
          Array.from(
            event.dataTransfer?.files ||
            []
          );

        if (!files.length) {
          return;
        }

        await addFiles(files);

      }
    );


    /* =========================
       ADD FILES
    ========================= */

    async function addFiles(files) {

      for (
        const file
        of files
      ) {

        if (
          selectedFiles.length >= 20
        ) {

          showStatus(
            "You can upload a maximum of 20 images.",
            "error"
          );

          break;

        }


        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          showStatus(
            `${file.name} is not an image.`,
            "error"
          );

          continue;

        }


        const duplicate =
          selectedFiles.some(
            existing =>
              existing.name ===
                file.name &&
              existing.size ===
                file.size
          );

        if (duplicate) {
          continue;
        }


        showStatus(
          `Compressing ${file.name}...`,
          "info"
        );


        const processedFile =
          await compressImage(
            file
          );


        selectedFiles.push(
          processedFile
        );

        renderFiles();

      }


      if (
        selectedFiles.length > 0
      ) {

        showStatus(
          `${selectedFiles.length} image${
            selectedFiles.length > 1
              ? "s"
              : ""
          } ready.`,
          "success"
        );

      }

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

      if (
        bytes <
        1024 * 1024
      ) {

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
        !questionInput.value.trim() &&
        selectedFiles.length === 0
      ) {

        showStatus(
          "Enter the question or upload at least one image.",
          "error"
        );

        return false;

      }


      return true;

    }


    /* =========================
       COMPRESS IMAGE
    ========================= */

    async function compressImage(
      file
    ) {

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        return file;

      }


      return new Promise(
        resolve => {

          const img =
            new Image();

          const objectUrl =
            URL.createObjectURL(
              file
            );


          img.onload = () => {

            URL.revokeObjectURL(
              objectUrl
            );


            const MAX_WIDTH =
              2000;

            const MAX_HEIGHT =
              2000;


            let width =
              img.width;

            let height =
              img.height;


            if (
              width >
                MAX_WIDTH ||
              height >
                MAX_HEIGHT
            ) {

              const ratio =
                Math.min(
                  MAX_WIDTH /
                    width,
                  MAX_HEIGHT /
                    height
                );


              width =
                Math.round(
                  width * ratio
                );

              height =
                Math.round(
                  height * ratio
                );

            }


            const canvas =
              document.createElement(
                "canvas"
              );

            canvas.width =
              width;

            canvas.height =
              height;


            const ctx =
              canvas.getContext(
                "2d"
              );


            ctx.drawImage(
              img,
              0,
              0,
              width,
              height
            );


            canvas.toBlob(
              blob => {

                if (!blob) {

                  resolve(
                    file
                  );

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
                      type:
                        "image/jpeg",

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


          img.src =
            objectUrl;

        }
      );

    }


    /* =========================
       INDEXEDDB
    ========================= */

    const DB_NAME =
      "fstudy_files";

    const DB_VERSION =
      1;

    const STORE_NAME =
      "images";


    function openDB() {

      return new Promise(
        (resolve, reject) => {

          const request =
            indexedDB.open(
              DB_NAME,
              DB_VERSION
            );


          request.onupgradeneeded =
            event => {

              const db =
                event.target.result;


              if (
                !db.objectStoreNames.contains(
                  STORE_NAME
                )
              ) {

                db.createObjectStore(
                  STORE_NAME,
                  {
                    keyPath: "id"
                  }
                );

              }

            };


          request.onsuccess =
            () => {

              resolve(
                request.result
              );

            };


          request.onerror =
            () => {

              reject(
                request.error ||
                new Error(
                  "Failed to open image database."
                )
              );

            };

        }
      );

    }


    /* =========================
       SAVE IMAGE
    ========================= */

    async function saveImageToDB(
      file
    ) {

      const db =
        await openDB();


      return new Promise(
        (resolve, reject) => {

          const transaction =
            db.transaction(
              STORE_NAME,
              "readwrite"
            );


          const store =
            transaction.objectStore(
              STORE_NAME
            );


          const id =
            "pqimg_" +
            Date.now() +
            "_" +
            Math.random()
              .toString(36)
              .slice(2);


          const request =
            store.put({

              id,

              name:
                file.name,

              type:
                file.type,

              size:
                file.size,

              file,

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
       GENERATE
    ========================= */

    generateBtn.addEventListener(
      "click",
      async () => {

        if (
          !validateInputs()
        ) {

          return;

        }


        generatedQuestions =
  [];


        previewCard.classList.add(
          "hidden"
        );


        generateBtn.disabled =
          true;


        showStatus(
          "FAI is examining the past question...",
          "info"
        );


        try {

          const formData =
            new FormData();


          /* =========================
             METADATA
          ========================== */

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
            "year",
            yearInput.value.trim() ||
              "0"
          );

          formData.append(
            "session",
            sessionInput.value.trim()
          );

          formData.append(
            "difficulty",
            difficultyInput.value
          );

          formData.append(
            "instructor",
            instructorInput.value.trim()
          );


          /* =========================
             QUESTION
          ========================== */

          formData.append(
            "question",
            questionInput.value.trim()
          );


          /* =========================
             MODE
          ========================== */

          formData.append(
            "mode",
            "generate_past_question"
          );


          /* =========================
             FILES
          ========================== */

          for (
            const file
            of selectedFiles
          ) {

            formData.append(
              "files",
              file,
              file.name
            );

          }


          /* =========================
             SEND TO FAI
          ========================== */

          const response =
            await fetch(
              window.CONFIG.API_URL +
                "/fai",
              {
                method:
                  "POST",

                body:
                  formData
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
          ========================== */

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
              events.pop() ||
              "";


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
                    event.text ||
                    "";

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
             PARSE JSON
          ========================== */

          let questionsData;

try {

  questionsData =
    JSON.parse(
      cleanJson(
        answer
      )
    );

} catch {

  previewCard.classList.remove(
    "hidden"
  );

  preview.textContent =
    answer ||
    "(FAI returned nothing)";

  showStatus(
    "FAI returned invalid JSON. The raw response is shown below.",
    "error"
  );

  previewCard.scrollIntoView({
    behavior:
      "smooth",

    block:
      "start"
  });

  throw new Error(
    "FAI did not return valid JSON."
  );

}


          /* =========================
             VALIDATE
          ========================== */

          validateQuestions(
            questionData
          );


          /* =========================
             SAVE IMAGES
          ========================== */

          const questionFiles =
  [];

for (
  const file
  of selectedFiles
) {

  showStatus(
    `Saving ${file.name}...`,
    "info"
  );

  const imageId =
    await saveImageToDB(
      file
    );

  questionFiles.push({

    id:
      imageId,

    name:
      file.name,

    type:
      file.type,

    size:
      file.size

  });

}


          /* =========================
             COMPLETE QUESTION
          ========================== */

          generatedQuestions =
  questionsData.map(
    question => ({

      ...question,

      files:
        questionFiles

    })
  );


          /* =========================
             PREVIEW
          ========================== */

          preview.textContent =
  JSON.stringify(
    generatedQuestions,
    null,
    2
  );


          previewCard.classList.remove(
            "hidden"
          );


          showStatus(
  `FAI successfully created ${generatedQuestions.length} past questions. Review them below.`,
  "success"
);


          previewCard.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start"
          });


        } catch (error) {

          showStatus(
            error.message ||
              "Failed to generate past question.",
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

  /* =========================
     REMOVE CODE FENCES
  ========================= */

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

  /* =========================
     FIND JSON ARRAY
  ========================= */

  const first =
    clean.indexOf("[");

  const last =
    clean.lastIndexOf("]");

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
       VALIDATE QUESTION
    ========================= */

    function validateQuestions(
  questions
) {

  /* =========================
     ARRAY CHECK
  ========================= */

  if (
    !Array.isArray(
      questions
    )
  ) {

    throw new Error(
      "FAI must return an array of past questions."
    );

  }

  if (
    questions.length === 0
  ) {

    throw new Error(
      "FAI returned no past questions."
    );

  }

  /* =========================
     VALIDATE EACH QUESTION
  ========================= */

  const requiredFields = [

    "id",
    "university",
    "course",
    "question",
    "options",
    "answer",
    "explanation",
    "formula",
    "difficulty",
    "topic",
    "type",
    "year",
    "session",
    "question_number",
    "xp_reward",
    "instructor",
    "verified"

  ];

  const ids =
    new Set();

  const numbers =
    new Set();

  questions.forEach(
    (question, index) => {

      if (
        !question ||
        typeof question !==
          "object" ||
        Array.isArray(question)
      ) {

        throw new Error(
          `Past question ${index + 1} is invalid.`
        );

      }

      /* =========================
         REQUIRED FIELDS
      ========================= */

      for (
        const field
        of requiredFields
      ) {

        if (
          !(field in question)
        ) {

          throw new Error(
            `Past question ${
              index + 1
            } is missing "${field}".`
          );

        }

      }

      /* =========================
         ID
      ========================= */

      if (
        typeof question.id !==
        "string" ||
        !question.id.trim()
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } has an invalid ID.`
        );

      }

      if (
        ids.has(
          question.id
        )
      ) {

        throw new Error(
          `Duplicate question ID: ${question.id}`
        );

      }

      ids.add(
        question.id
      );

      /* =========================
         QUESTION TEXT
      ========================= */

      if (
        typeof question.question !==
          "string" ||
        !question.question.trim()
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } has empty question text.`
        );

      }

      /* =========================
         OPTIONS
      ========================= */

      if (
        !Array.isArray(
          question.options
        )
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } options must be an array.`
        );

      }

      if (
        question.options.length !==
        4
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } must contain exactly 4 options.`
        );

      }

      question.options.forEach(
        (option, optionIndex) => {

          if (
            typeof option !==
              "string" ||
            !option.trim()
          ) {

            throw new Error(
              `Past question ${
                index + 1
              } option ${
                optionIndex + 1
              } is invalid.`
            );

          }

        }
      );

      /* =========================
         ANSWER
      ========================= */

      if (
        typeof question.answer !==
          "string" ||
        !question.answer.trim()
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } has no answer.`
        );

      }

      /* =========================
         FORMULA
      ========================= */

      if (
        typeof question.formula !==
        "string"
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } has an invalid formula.`
        );

      }

      /* =========================
         TYPE
      ========================= */

      if (
        question.type !==
        "mcq"
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } must have type "mcq".`
        );

      }

      /* =========================
         YEAR
      ========================= */

      if (
        typeof question.year !==
        "number"
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } has an invalid year.`
        );

      }

      /* =========================
         QUESTION NUMBER
      ========================= */

      if (
        typeof question.question_number !==
        "number"
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } has an invalid question number.`
        );

      }

      if (
        numbers.has(
          question.question_number
        )
      ) {

        throw new Error(
          `Duplicate question number: ${
            question.question_number
          }`
        );

      }

      numbers.add(
        question.question_number
      );

      /* =========================
         XP
      ========================= */

      if (
        typeof question.xp_reward !==
        "number"
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } has an invalid XP reward.`
        );

      }

      /* =========================
         VERIFIED
      ========================= */

      if (
        question.verified !==
        true
      ) {

        throw new Error(
          `Past question ${
            index + 1
          } must have verified=true.`
        );

      }

    }
  );

  return true;

}


    /* =========================
       SAVE QUESTION
    ========================= */

    saveBtn.addEventListener(
  "click",
  () => {

    if (
      !Array.isArray(
        generatedQuestions
      ) ||
      generatedQuestions.length === 0
    ) {

      showStatus(
        "There are no generated questions to save.",
        "error"
      );

      return;

    }

    saveBtn.disabled =
      true;

    showStatus(
      `Saving ${generatedQuestions.length} past questions...`,
      "info"
    );

    try {

      /* =========================
         ACCOUNT
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
         ACCOUNT KEY
      ========================= */

      let questionsKey =
        "my_past_questions";

      if (
        account.id
      ) {

        questionsKey =
          `my_past_questions_${account.id}`;

      }

      /* =========================
         EXISTING QUESTIONS
      ========================= */

      let myQuestions =
        [];

      const existing =
        localStorage.getItem(
          questionsKey
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

            myQuestions =
              parsed;

          }

        } catch {

          myQuestions =
            [];

        }

      }

      /* =========================
         ADD OWNER + SAVE TIME
      ========================= */

      const questionsToSave =
        generatedQuestions.map(
          question => ({

            ...question,

            owner_id:
              account.id ||
              null,

            saved_at:
              new Date()
                .toISOString()

          })
        );

      /* =========================
         SAVE ALL 20
      ========================= */

      myQuestions.push(
        ...questionsToSave
      );

      localStorage.setItem(
        questionsKey,
        JSON.stringify(
          myQuestions
        )
      );

      /* =========================
         CURRENT QUESTION
         FIRST QUESTION
      ========================= */

      localStorage.setItem(
        "viewing_past_question",
        JSON.stringify(
          questionsToSave[0]
        )
      );

      /* =========================
         SAVE ENTIRE BATCH
      ========================= */

      localStorage.setItem(
        "viewing_past_questions_batch",
        JSON.stringify(
          questionsToSave
        )
      );

      /* =========================
         REDIRECT
      ========================= */

      window.location.href =
        "/view-past-question";

    } catch (error) {

      showStatus(
        error.message ||
          "Failed to save past questions.",
        "error"
      );

      saveBtn.disabled =
        false;

    }

  }
);

  }
);