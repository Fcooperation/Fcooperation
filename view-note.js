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

    const topSubtitle =
      document.getElementById(
        "top-subtitle"
      );

    const loading =
      document.getElementById(
        "loading"
      );

    const error =
      document.getElementById(
        "error"
      );

    const note =
      document.getElementById(
        "note"
      );

    const noteTopic =
      document.getElementById(
        "note-topic"
      );

    const noteTitle =
      document.getElementById(
        "note-title"
      );

    const noteMeta =
      document.getElementById(
        "note-meta"
      );

    const sections =
      document.getElementById(
        "sections"
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
       GET VIEWING NOTE
    ========================= */

    let viewingNote = null;


    try {

      viewingNote =
        JSON.parse(
          localStorage.getItem(
            "viewing_note"
          )
        );

    } catch {

      viewingNote = null;

    }


    /* =========================
       SAFETY
    ========================= */

    if (
      !viewingNote ||
      !viewingNote.university ||
      !viewingNote.course ||
      !viewingNote.topic
    ) {

      loading.classList.add(
        "hidden"
      );

      error.textContent =
        "No note selected.";

      error.classList.remove(
        "hidden"
      );

      return;

    }


    const university =
      viewingNote.university;

    const course =
      viewingNote.course;

    const topic =
      viewingNote.topic;


    topSubtitle.textContent =
      `${university} • ${course}`;


    /* =========================
       LOAD NOTE
    ========================= */

    async function loadNote() {

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
                    "retrieve_note",

                  university:
                    university,

                  course:
                    course,

                  topic:
                    topic

                })

            }
          );


        if (!response.ok) {

          throw new Error(
            "Failed to load note."
          );

        }


        const data =
          await response.json();


        if (!data.success) {

          throw new Error(
            data.error ||
            "Failed to load note."
          );

        }


        if (!data.note) {

          throw new Error(
            "Note not found."
          );

        }


        renderNote(
          data.note,
          data.sections || []
        );


      } catch (err) {

        loading.classList.add(
          "hidden"
        );

        error.textContent =
          err.message ||
          "Failed to load note.";

        error.classList.remove(
          "hidden"
        );

      }

    }


    /* =========================
       RENDER NOTE
    ========================= */

    function renderNote(
      noteData,
      sectionData
    ) {

      loading.classList.add(
        "hidden"
      );

      note.classList.remove(
        "hidden"
      );


      noteTopic.textContent =
        noteData.topic ||
        topic;


      noteTitle.textContent =
        noteData.title ||
        "Untitled Note";


      noteMeta.textContent =
        `${noteData.university || university} • ` +
        `${noteData.course || course}` +
        (
          noteData.uploaded_by
            ? ` • Uploaded by ${noteData.uploaded_by}`
            : ""
        );


      sections.innerHTML =
        "";


      /* =========================
         SORT SECTIONS
      ========================= */

      const orderedSections =
        [...sectionData].sort(
          (a, b) =>
            Number(a.section_order || 0) -
            Number(b.section_order || 0)
        );


      /* =========================
         RENDER SECTIONS
      ========================= */

      orderedSections.forEach(
        (section, index) => {

          const sectionElement =
            document.createElement(
              "section"
            );


          sectionElement.className =
            "note-section";


          /* =========================
             TOP AREA
          ========================= */

          const sectionTop =
            document.createElement(
              "div"
            );

          sectionTop.className =
            "section-top";


          const sectionHeading =
            document.createElement(
              "div"
            );

          sectionHeading.className =
            "section-heading";


          const number =
            document.createElement(
              "div"
            );

          number.className =
            "section-number";

          number.textContent =
            `Section ${index + 1}`;


          const heading =
            document.createElement(
              "h2"
            );

          heading.className =
            "section-title";

          heading.textContent =
            section.title ||
            "Untitled Section";


          sectionHeading.appendChild(
            number
          );

          sectionHeading.appendChild(
            heading
          );


          /* =========================
             ASK FAI BUTTON
          ========================= */

          const askFaiBtn =
            document.createElement(
              "button"
            );

          askFaiBtn.type =
            "button";

          askFaiBtn.className =
            "ask-fai-btn";

          askFaiBtn.textContent =
            "Ask FAI";


          sectionTop.appendChild(
            sectionHeading
          );

          sectionTop.appendChild(
            askFaiBtn
          );


          /* =========================
             CONTENT
          ========================= */

          const content =
            document.createElement(
              "div"
            );

          content.className =
            "section-content";

          content.textContent =
            section.content ||
            "";


          /* =========================
             FAI MENU
          ========================= */

          const faiMenu =
            document.createElement(
              "div"
            );

          faiMenu.className =
            "fai-menu hidden";

/* =========================
   FAI CANCEL BUTTON
========================= */

const cancelFaiBtn =
  document.createElement(
    "button"
  );

cancelFaiBtn.type =
  "button";

cancelFaiBtn.className =
  "fai-cancel-btn";

cancelFaiBtn.textContent =
  "Cancel";

faiMenu.appendChild(
  cancelFaiBtn
);

          const faiActions =
            document.createElement(
              "div"
            );

          faiActions.className =
            "fai-actions";


          /* SUMMARIZE */

          const summarizeBtn =
            document.createElement(
              "button"
            );

          summarizeBtn.type =
            "button";

          summarizeBtn.className =
            "fai-action";

          summarizeBtn.textContent =
            "Summarize";


          /* QUIZ ME */

          const quizBtn =
            document.createElement(
              "button"
            );

          quizBtn.type =
            "button";

          quizBtn.className =
            "fai-action";

          quizBtn.textContent =
            "Quiz Me";


          /* ASK FAI */

          const askQuestionBtn =
            document.createElement(
              "button"
            );

          askQuestionBtn.type =
            "button";

          askQuestionBtn.className =
            "fai-action";

          askQuestionBtn.textContent =
            "Ask FAI";


          faiActions.appendChild(
            summarizeBtn
          );

          faiActions.appendChild(
            quizBtn
          );

          faiActions.appendChild(
            askQuestionBtn
          );


          faiMenu.appendChild(
            faiActions
          );


          /* =========================
             ASK FAI TOGGLE
          ========================= */

          askFaiBtn.addEventListener(
  "click",
  () => {

    const isOpening =
      faiMenu.classList.contains(
        "hidden"
      );


    faiMenu.classList.toggle(
      "hidden"
    );


    if (isOpening) {

      setTimeout(() => {

        faiMenu.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });

      }, 50);

    }

  }
);

/* =========================
   FAI CANCEL
========================= */

cancelFaiBtn.addEventListener(
  "click",
  () => {

    /* Remove FAI output */
    faiMenu
      .querySelectorAll(
        ".fai-summary, .fai-loading, .fai-error"
      )
      .forEach(
        element => element.remove()
      );


    /* Restore action buttons */
    faiActions.classList.remove(
      "hidden"
    );


    /* Close menu */
    faiMenu.classList.add(
      "hidden"
    );

  }
);

          /* =========================
             SUMMARIZE
          ========================= */

          summarizeBtn.addEventListener(
            "click",
            async () => {

              await summarizeSection(
                section,
                faiMenu,
                faiActions,
                summarizeBtn
              );

            }
          );


          /* =========================
             FUTURE FEATURES
          ========================= */

          quizBtn.addEventListener(
            "click",
            () => {

              // Coming next

            }
          );


          askQuestionBtn.addEventListener(
            "click",
            () => {

              // Coming next

            }
          );


          /* =========================
             APPEND
          ========================= */

          sectionElement.appendChild(
            sectionTop
          );

          sectionElement.appendChild(
            content
          );

          sectionElement.appendChild(
            faiMenu
          );


          sections.appendChild(
            sectionElement
          );

        }
      );


      if (!orderedSections.length) {

        const empty =
          document.createElement(
            "p"
          );

        empty.textContent =
          "This note has no sections.";

        sections.appendChild(
          empty
        );

      }

    }

/* =========================
   MARKDOWN TO HTML
========================= */

function renderMarkdown(text) {

  if (!text) return "";

  let html = text;

  /* Escape HTML first */
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");


  /* =========================
     HEADINGS
  ========================= */

  html = html.replace(
    /^#### (.*)$/gm,
    "<h4>$1</h4>"
  );

  html = html.replace(
    /^### (.*)$/gm,
    "<h3>$1</h3>"
  );

  html = html.replace(
    /^## (.*)$/gm,
    "<h2>$1</h2>"
  );

  html = html.replace(
    /^# (.*)$/gm,
    "<h1>$1</h1>"
  );


  /* =========================
     BOLD
  ========================= */

  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );


  /* =========================
     ITALIC
  ========================= */

  html = html.replace(
    /\*(.*?)\*/g,
    "<em>$1</em>"
  );


  /* =========================
     BULLET POINTS
  ========================= */

  html = html.replace(
    /^[-•] (.*)$/gm,
    "<li>$1</li>"
  );


  /* =========================
     GROUP LIST ITEMS
  ========================= */

  html = html.replace(
    /(<li>.*?<\/li>\n?)+/g,
    match => `<ul>${match}</ul>`
  );


  /* =========================
     LINE BREAKS
  ========================= */

  html = html.replace(
    /\n/g,
    "<br>"
  );


  return html;

}

/* =========================
   SUMMARIZE SECTION
========================= */

async function summarizeSection(
  section,
  faiMenu,
  faiActions,
  summarizeBtn
) {

  const sectionContent =
    section.content || "";


  if (!sectionContent.trim()) {
    return;
  }


  /* =========================
     HIDE BUTTONS
  ========================= */

  faiActions.classList.add(
    "hidden"
  );


  /* =========================
     LOADING
  ========================= */

  const loadingText =
    document.createElement(
      "p"
    );

  loadingText.className =
    "fai-loading";

  loadingText.textContent =
    "FAI is summarizing...";


  faiMenu.appendChild(
    loadingText
  );


  /* =========================
     AUTO SCROLL
  ========================= */

  setTimeout(() => {

    faiMenu.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }, 50);


  try {

    /* =========================
       SEND TO FAI
    ========================= */

    const response =
      await fetch(
        window.CONFIG.API_URL +
        "/fai",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              prompt:
                `Summarize the following FSTUDY note section clearly for a student.

Keep the important concepts, definitions, facts, examples, and relationships.

Do not leave out important academic information.

Do not introduce information that is not present in the section.

Section title:
${section.title || "Untitled Section"}

Section content:
${sectionContent}`,

              source:
                "fstudy",

              university:
                university,

              course:
                course,

              topic:
                topic,

              section_title:
                section.title || ""

            })

        }
      );


    if (!response.ok) {

      throw new Error(
        "FAI request failed."
      );

    }


    /* =========================
       READ SSE STREAM
    ========================= */

    if (!response.body) {

      throw new Error(
        "FAI did not return a readable response."
      );

    }


    const reader =
      response.body.getReader();


    const decoder =
      new TextDecoder();


    let buffer = "";

    let summary = "";


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
        buffer.split("\n\n");


      buffer =
        events.pop() || "";


      for (
        const eventText
        of events
      ) {

        const lines =
          eventText.split("\n");


        for (
          const line
          of lines
        ) {

          if (
            !line.startsWith("data:")
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


          try {

            const event =
              JSON.parse(
                jsonText
              );


            /* =========================
               CHUNK
            ========================= */

            if (
              event.type ===
              "chunk"
            ) {

              summary +=
                event.text || "";

            }


            /* =========================
               ERROR
            ========================= */

            if (
              event.type ===
              "error"
            ) {

              throw new Error(
                event.message ||
                "FAI failed to summarize this section."
              );

            }

          } catch (parseError) {

            /*
              Ignore incomplete SSE
              fragments.
            */

            if (
              parseError.message &&
              !parseError.message.includes(
                "Unexpected"
              )
            ) {

              throw parseError;

            }

          }

        }

      }

    }


    /* =========================
       REMOVE LOADING
    ========================= */

    loadingText.remove();


    if (!summary.trim()) {

      throw new Error(
        "FAI returned an empty response."
      );

    }


    /* =========================
       SHOW SUMMARY
    ========================= */

    const summaryElement =
  document.createElement(
    "div"
  );

summaryElement.className =
  "fai-summary";

summaryElement.innerHTML =
  renderMarkdown(
    summary.trim()
  );

faiMenu.appendChild(
  summaryElement
);


    /* =========================
       SCROLL TO SUMMARY
    ========================= */

    setTimeout(() => {

      faiMenu.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);


  } catch (err) {

    loadingText.remove();


    const errorElement =
      document.createElement(
        "p"
      );

    errorElement.className =
      "fai-error";

    errorElement.textContent =
      err.message ||
      "Failed to summarize section.";


    faiMenu.appendChild(
      errorElement
    );


    /* =========================
       ALLOW RETRY
    ========================= */

    faiActions.classList.remove(
      "hidden"
    );


    setTimeout(() => {

      faiMenu.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);

  }

}


    /* =========================
       START
    ========================= */

    loadNote();

  }
);