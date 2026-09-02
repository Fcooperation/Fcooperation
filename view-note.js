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
      
      const notePreviewContainer =
  document.getElementById(
    "note-preview-container"
  );

const notePreviewBtn =
  document.getElementById(
    "note-preview-btn"
  );

const notePreviewImage =
  document.getElementById(
    "note-preview-image"
  );

const noteImageOverlay =
  document.getElementById(
    "note-image-overlay"
  );

const noteImageViewer =
  document.getElementById(
    "note-image-viewer"
  );

const noteOverlayImage =
  document.getElementById(
    "note-overlay-image"
  );

const noteImagePage =
  document.getElementById(
    "note-image-page"
  );

const noteImageCancel =
  document.getElementById(
    "note-image-cancel"
  );

const noteImagePrev =
  document.getElementById(
    "note-image-prev"
  );
  
const noteImageNext =
  document.getElementById(
    "note-image-next"
  );

const noteImageZoomIn =
  document.getElementById(
    "note-image-zoom-in"
  );

const noteImageZoomOut =
  document.getElementById(
    "note-image-zoom-out"
  );

const noteImageZoomReset =
  document.getElementById(
    "note-image-zoom-reset"
  );

const noteImageStage =
  document.getElementById(
    "note-image-stage"
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


/* =========================
   CHECK URL PARAMETERS
========================= */

const urlParams =
  new URLSearchParams(
    window.location.search
  );

const urlUniversity =
  urlParams.get("university");

const urlCourse =
  urlParams.get("course");

const urlTopic =
  urlParams.get("topic");


/* =========================
   USE SHARED LINK IF AVAILABLE
========================= */

if (
  urlUniversity &&
  urlCourse &&
  urlTopic
) {

  viewingNote = {

    university:
      urlUniversity,

    course:
      urlCourse,

    topic:
      urlTopic

  };

}


/* =========================
   OTHERWISE USE LOCALSTORAGE
========================= */

else {

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

// Contains English function
function containsEnglish(text) {

  if (!text || !text.trim()) {
    return false;
  }

  const words =
    text
      .trim()
      .split(/\s+/);

  if (words.length < 5) {
    return false;
  }

  const englishWords = [
    "the",
    "is",
    "are",
    "and",
    "of",
    "to",
    "in",
    "a",
    "an",
    "for",
    "with",
    "this",
    "that",
    "from",
    "on",
    "as",
    "it",
    "was",
    "be",
    "by"
  ];

  let englishCount = 0;

  words.forEach(word => {

    const clean =
      word
        .toLowerCase()
        .replace(
          /[^a-z]/g,
          ""
        );

    if (
      englishWords.includes(
        clean
      )
    ) {
      englishCount++;
    }

  });

  return (
    englishCount / words.length
  ) >= 0.15;

}

    /* =========================
       LOAD NOTE
    ========================= */

    async function loadNote() {
      
/* =========================
   FMARKET MATERIAL
========================= */

if (
  viewingNote &&
  viewingNote.source === "fmarket"
) {

  renderFMarketMaterial(
    viewingNote
  );

  return;

}

  try {

    /* =========================
       USE LOCAL NOTE FIRST
    ========================= */

    if (
      viewingNote &&
      Array.isArray(
        viewingNote.sections
      ) &&
      viewingNote.sections.length
    ) {

      await renderNote(
  viewingNote,
  viewingNote.sections
);

return;

    }


    /* =========================
       OTHERWISE LOAD FROM SERVER
    ========================= */

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


    await renderNote(
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

    async function renderNote(
  noteData,
  sectionData
) {

  loading.classList.add(
    "hidden"
  );

  note.classList.remove(
    "hidden"
  );


  /* =========================
     LOAD NOTE IMAGES
  ========================= */

  await setupNoteImages(
    noteData
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


          /* =========================
   TRANSLATE TO ENGLISH
========================= */

const translateBtn =
  document.createElement(
    "button"
  );

translateBtn.type =
  "button";

translateBtn.className =
  "fai-action";

translateBtn.textContent =
  "Translate to English";

if (
  containsEnglish(
    section.content || ""
  )
) {

  translateBtn.classList.add(
    "hidden"
  );

}


/* =========================
   ADD ACTION BUTTONS
========================= */

faiActions.appendChild(
  summarizeBtn
);

faiActions.appendChild(
  quizBtn
);

faiActions.appendChild(
  askQuestionBtn
);

faiActions.appendChild(
  translateBtn
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
    faiMenu.querySelectorAll(
  ".fai-summary, .fai-loading, .fai-error, .fai-quiz, .fai-translation"
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
  async () => {

    await quizSection(
      section,
      faiMenu,
      faiActions,
      quizBtn
    );

  }
);


          askQuestionBtn.addEventListener(
  "click",
  () => {

    openAskFai(
      section,
      faiMenu,
      faiActions
    );

  }
);

/* =========================
   TRANSLATE TO ENGLISH
========================= */

translateBtn.addEventListener(
  "click",
  async () => {

    await translateSection(
      section,
      faiMenu,
      faiActions,
      translateBtn
    );

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
   TRANSLATE SECTION
========================= */

async function translateSection(
  section,
  faiMenu,
  faiActions,
  translateBtn
) {

  const sectionContent =
    section.content || "";

  if (!sectionContent.trim()) {
    return;
  }


  /* =========================
     HIDE ACTION BUTTONS
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
    "FAI is translating to English...";

  faiMenu.appendChild(
    loadingText
  );


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
`You are FAI, the academic assistant inside FSTUDY.

Translate the following academic section into clear, natural English.

STRICT RULES:

1. Translate ONLY the provided section.
2. Do not summarize it.
3. Do not remove important information.
4. Do not add new information.
5. Preserve the original meaning.
6. Preserve academic terminology.
7. Preserve headings where possible.
8. Preserve bullet points and numbering.
9. If a word or phrase is already English, keep it.
10. The source may be Igbo or mixed Igbo and English.
11. Return ONLY the English translation.
12. Do not add explanations before or after the translation.

SECTION TITLE:

${section.title || "Untitled Section"}

SECTION CONTENT:

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
        "FAI translation request failed."
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

    let translation = "";


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

              translation +=
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
                "FAI failed to translate this section."
              );

            }

          } catch (
            parseError
          ) {

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


    if (!translation.trim()) {

      throw new Error(
        "FAI returned an empty translation."
      );

    }


    /* =========================
       SHOW TRANSLATION
    ========================= */

    const translationElement =
      document.createElement(
        "div"
      );

    translationElement.className =
      "fai-summary fai-translation";


    const translationTitle =
      document.createElement(
        "h3"
      );

    translationTitle.textContent =
      "English Translation";


    const translationContent =
      document.createElement(
        "div"
      );

    translationContent.innerHTML =
      renderMarkdown(
        translation.trim()
      );


    translationElement.appendChild(
      translationTitle
    );

    translationElement.appendChild(
      translationContent
    );


    faiMenu.appendChild(
      translationElement
    );


    /* =========================
       SCROLL
    ========================= */

    setTimeout(() => {

      translationElement.scrollIntoView({
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
      "Failed to translate section.";


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
   QUIZ SECTION
========================= */

async function quizSection(
  section,
  faiMenu,
  faiActions,
  quizBtn
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
    "FAI is preparing your quiz...";


  faiMenu.appendChild(
    loadingText
  );


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
                `You are generating a quiz for a student using ONLY the provided FSTUDY section.

Generate exactly 5 multiple-choice questions.

STRICT RULES:

1. Use ONLY information contained in the provided section.
2. Do not introduce outside information.
3. Every question must have exactly 4 options.
4. Only one option may be correct.
5. Questions should test understanding, not just randomly copy sentences.
6. Provide the correct answer as a zero-based option index.
7. Provide a short explanation for the correct answer.
8. Return ONLY valid JSON.
9. Do not use Markdown.
10. Do not wrap the JSON in code blocks.
11. Do not write anything before or after the JSON.
12. The response must begin with { and end with }.
13. The JSON must follow this exact structure:

{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correct_answer": 0,
      "explanation": "Explanation"
    }
  ]
}

FSTUDY SECTION:

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
        "FAI quiz request failed."
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

    let quizText = "";


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


            if (
              event.type ===
              "chunk"
            ) {

              quizText +=
                event.text || "";

            }


            if (
              event.type ===
              "error"
            ) {

              throw new Error(
                event.message ||
                "FAI failed to create the quiz."
              );

            }

          } catch (parseError) {

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


    loadingText.remove();


    if (!quizText.trim()) {

      throw new Error(
        "FAI returned an empty quiz."
      );

    }


    /* =========================
       PARSE QUIZ JSON
    ========================= */

    let quizData;

    try {

      quizData =
        JSON.parse(
          quizText.trim()
        );

    } catch {

      throw new Error(
        "FAI returned invalid quiz data."
      );

    }


    /* =========================
       VALIDATE QUIZ
    ========================= */

    if (
      !quizData.questions ||
      !Array.isArray(
        quizData.questions
      ) ||
      quizData.questions.length !== 5
    ) {

      throw new Error(
        "FAI returned an invalid quiz."
      );

    }


    quizData.questions.forEach(
      question => {

        if (
          !question.question ||
          !Array.isArray(
            question.options
          ) ||
          question.options.length !== 4 ||
          typeof question.correct_answer !==
            "number" ||
          question.correct_answer < 0 ||
          question.correct_answer > 3
        ) {

          throw new Error(
            "FAI returned an invalid question."
          );

        }

      }
    );


    /* =========================
       SHOW QUIZ
    ========================= */

    renderQuiz(
      quizData,
      faiMenu
    );


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
      "Failed to create quiz.";


    faiMenu.appendChild(
      errorElement
    );


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
   RENDER QUIZ
========================= */

function renderQuiz(
  quizData,
  faiMenu
) {

  const questions =
    quizData.questions;


  let currentQuestion =
    0;

  const answers =
    new Array(
      questions.length
    ).fill(null);


  /* =========================
     QUIZ CONTAINER
  ========================= */

  const quizElement =
    document.createElement(
      "div"
    );

  quizElement.className =
    "fai-quiz";


  faiMenu.appendChild(
    quizElement
  );


  function renderQuestion() {

    quizElement.innerHTML =
      "";


    const question =
      questions[
        currentQuestion
      ];


    /* =========================
       PROGRESS
    ========================= */

    const progress =
      document.createElement(
        "div"
      );

    progress.className =
      "quiz-progress";

    progress.textContent =
      `Question ${currentQuestion + 1} of ${questions.length}`;


    quizElement.appendChild(
      progress
    );


    /* =========================
       QUESTION
    ========================= */

    const questionText =
      document.createElement(
        "div"
      );

    questionText.className =
      "quiz-question";

    questionText.textContent =
      question.question;


    quizElement.appendChild(
      questionText
    );


    /* =========================
       OPTIONS
    ========================= */

    const options =
      document.createElement(
        "div"
      );

    options.className =
      "quiz-options";


    question.options.forEach(
      (optionText, index) => {

        const option =
          document.createElement(
            "button"
          );

        option.type =
          "button";

        option.className =
          "quiz-option";

        option.textContent =
          optionText;


        if (
          answers[
            currentQuestion
          ] === index
        ) {

          option.classList.add(
            "selected"
          );

        }


        option.addEventListener(
          "click",
          () => {

            answers[
              currentQuestion
            ] = index;


            renderQuestion();

          }
        );


        options.appendChild(
          option
        );

      }
    );


    quizElement.appendChild(
      options
    );


    /* =========================
       NAVIGATION
    ========================= */

    const navigation =
      document.createElement(
        "div"
      );

    navigation.className =
      "quiz-navigation";


    if (
      currentQuestion <
      questions.length - 1
    ) {

      const nextBtn =
        document.createElement(
          "button"
        );

      nextBtn.type =
        "button";

      nextBtn.className =
        "quiz-next-btn";

      nextBtn.textContent =
        "Next";


      nextBtn.addEventListener(
        "click",
        () => {

          if (
            answers[
              currentQuestion
            ] === null
          ) {

            return;

          }


          currentQuestion++;

          renderQuestion();

        }
      );


      navigation.appendChild(
        nextBtn
      );

    } else {

      const submitBtn =
        document.createElement(
          "button"
        );

      submitBtn.type =
        "button";

      submitBtn.className =
        "quiz-submit-btn";

      submitBtn.textContent =
        "Submit Quiz";


      submitBtn.addEventListener(
        "click",
        () => {

          if (
            answers.includes(
              null
            )
          ) {

            return;

          }


          submitQuiz();

        }
      );


      navigation.appendChild(
        submitBtn
      );

    }


    quizElement.appendChild(
      navigation
    );


    setTimeout(() => {

      faiMenu.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);

  }


  /* =========================
     SUBMIT QUIZ
  ========================= */

  function submitQuiz() {

    let score = 0;


    questions.forEach(
      (question, index) => {

        if (
          answers[index] ===
          question.correct_answer
        ) {

          score++;

        }

      }
    );


    renderQuizResults(
      questions,
      answers,
      score,
      quizElement
    );

  }


  renderQuestion();

}

/* =========================
   QUIZ RESULTS
========================= */

function renderQuizResults(
  questions,
  answers,
  score,
  quizElement
) {

  quizElement.innerHTML =
    "";


  /* =========================
     SCORE
  ========================= */

  const scoreElement =
    document.createElement(
      "div"
    );

  scoreElement.className =
    "quiz-score";

  scoreElement.textContent =
    `You scored ${score} / ${questions.length}`;


  quizElement.appendChild(
    scoreElement
  );


  /* =========================
     CORRECTIONS
  ========================= */

  questions.forEach(
    (question, index) => {

      const correction =
        document.createElement(
          "div"
        );

      correction.className =
        "quiz-correction";


      const questionTitle =
        document.createElement(
          "div"
        );

      questionTitle.className =
        "correction-question";

      questionTitle.textContent =
        `${index + 1}. ${question.question}`;


      correction.appendChild(
        questionTitle
      );


      const selected =
        answers[index];


      const correct =
        question.correct_answer;


      const result =
        document.createElement(
          "div"
        );

      result.className =
        selected === correct
          ? "correction-result correct"
          : "correction-result wrong";


      if (
        selected === correct
      ) {

        result.textContent =
          "✓ Correct";

      } else {

        result.textContent =
          "✗ Incorrect";

      }


      correction.appendChild(
        result
      );


      const answer =
        document.createElement(
          "div"
        );

      answer.className =
        "correct-answer";


      answer.textContent =
        `Correct answer: ${question.options[correct]}`;


      correction.appendChild(
        answer
      );


      if (
        selected !== correct
      ) {

        const yourAnswer =
          document.createElement(
            "div"
          );

        yourAnswer.className =
          "your-answer";


        yourAnswer.textContent =
          `Your answer: ${question.options[selected]}`;


        correction.appendChild(
          yourAnswer
        );

      }


      const explanation =
        document.createElement(
          "div"
        );

      explanation.className =
        "quiz-explanation";

      explanation.textContent =
        question.explanation;


      correction.appendChild(
        explanation
      );


      quizElement.appendChild(
        correction
      );

    }
  );


  setTimeout(() => {

    quizElement.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }, 50);

}

/* =========================
   ASK FAI
========================= */

async function openAskFai(
  section,
  faiMenu,
  faiActions
) {

  const sectionContent =
    section.content || "";

  if (!sectionContent.trim()) {
    return;
  }


  /* =========================
     HIDE ACTION BUTTONS
  ========================= */

  faiActions.classList.add(
    "hidden"
  );


  /* =========================
     REMOVE OLD FAI OUTPUT
  ========================= */

  faiMenu
    .querySelectorAll(
      ".fai-summary, .fai-loading, .fai-error, .fai-quiz, .fai-chat"
    )
    .forEach(
      element => element.remove()
    );


  /* =========================
     CHAT STATE
  ========================= */

  const conversation = [];


  /* =========================
     CHAT CONTAINER
  ========================= */

  const chat =
    document.createElement(
      "div"
    );

  chat.className =
    "fai-chat";


  /* =========================
     CHAT HEADER
  ========================= */

  const chatHeader =
    document.createElement(
      "div"
    );

  chatHeader.className =
    "fai-chat-header";

  chatHeader.textContent =
    "Ask FAI about this section";


  chat.appendChild(
    chatHeader
  );


  /* =========================
     MESSAGES
  ========================= */

  const messages =
    document.createElement(
      "div"
    );

  messages.className =
    "fai-chat-messages";


  chat.appendChild(
    messages
  );


  /* =========================
     WELCOME MESSAGE
  ========================= */

  addFaiMessage(
    "Hi! Ask me anything about this section.",
    messages
  );


  /* =========================
     INPUT AREA
  ========================= */

  const inputArea =
    document.createElement(
      "div"
    );

  inputArea.className =
    "fai-chat-input-area";


  const input =
    document.createElement(
      "textarea"
    );

  input.className =
    "fai-chat-input";

  input.placeholder =
    "Ask about this section...";

  input.rows =
    1;


  const sendBtn =
    document.createElement(
      "button"
    );

  sendBtn.type =
    "button";

  sendBtn.className =
    "fai-chat-send";

  sendBtn.textContent =
    "Send";


  inputArea.appendChild(
    input
  );

  inputArea.appendChild(
    sendBtn
  );


  chat.appendChild(
    inputArea
  );


  faiMenu.appendChild(
    chat
  );


  /* =========================
     SEND MESSAGE
  ========================= */

  async function sendQuestion() {

    const question =
      input.value.trim();


    if (!question) {
      return;
    }


    /* =========================
       PREVENT DOUBLE REQUESTS
    ========================= */

    input.disabled =
      true;

    sendBtn.disabled =
      true;


    /* =========================
       SHOW STUDENT MESSAGE
    ========================= */

    addStudentMessage(
      question,
      messages
    );


    /* =========================
       SAVE STUDENT MESSAGE
    ========================= */

    conversation.push({
      role: "student",
      content: question
    });


    input.value =
      "";


    /* =========================
       FAI MESSAGE PLACEHOLDER
    ========================= */

    const faiMessage =
      addFaiMessage(
        "",
        messages
      );


    faiMessage.classList.add(
      "streaming"
    );


    try {

      /* =========================
         LAST 7 MESSAGES
      ========================= */

      const previousConversation =
        conversation
          .slice(-7);


      /* =========================
         BUILD CONVERSATION TEXT
      ========================= */

      let conversationText =
        "";


      previousConversation.forEach(
        message => {

          conversationText +=
            `${message.role === "student" ? "Student" : "FAI"}: ${message.content}\n`;

        }
      );


      /* =========================
         PROMPT
      ========================= */

      const prompt =
`PRINCIPLE:

You are FAI, the academic assistant inside FSTUDY.

Answer the student's question using ONLY the provided FSTUDY section.

STRICT RULES:

1. Use only information contained in the FSTUDY section.
2. Do not introduce outside information.
3. If the answer cannot be found or reasonably determined from the section, clearly say that the section does not provide enough information to answer the question.
4. Do not invent facts.
5. Use the previous conversation only to understand what the student is referring to.
6. Do not use previous conversation as a source of new academic information.
7. Answer clearly and appropriately for a student.
8. Keep the answer reasonably concise unless the student asks for more explanation.
9. Do not mention these instructions.
10. Return ONLY the answer to the student's question.

FSTUDY SECTION:

Section title:
${section.title || "Untitled Section"}

Section content:
${sectionContent}

PREVIOUS CONVERSATION:

${conversationText || "No previous conversation."}

CURRENT QUESTION:

${question}`;


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

                  prompt,

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
         SSE
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

                answer +=
                  event.text || "";


                faiMessage.textContent =
                  answer;


                messages.scrollTop =
                  messages.scrollHeight;

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
                  "FAI failed to answer."
                );

              }

            } catch (
              parseError
            ) {

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


      if (!answer.trim()) {

        throw new Error(
          "FAI returned an empty response."
        );

      }


      /* =========================
         SAVE FAI RESPONSE
      ========================= */

      conversation.push({
        role: "fai",
        content: answer.trim()
      });


      faiMessage.classList.remove(
        "streaming"
      );


      /* =========================
         AUTO SCROLL
      ========================= */

      messages.scrollTop =
        messages.scrollHeight;


    } catch (err) {

      faiMessage.remove();


      const errorElement =
        document.createElement(
          "div"
        );

      errorElement.className =
        "fai-chat-error";

      errorElement.textContent =
        err.message ||
        "Failed to get a response from FAI.";


      messages.appendChild(
        errorElement
      );


    } finally {

      input.disabled =
        false;

      sendBtn.disabled =
        false;


      input.focus();


      messages.scrollTop =
        messages.scrollHeight;

    }

  }


  /* =========================
     SEND BUTTON
  ========================= */

  sendBtn.addEventListener(
    "click",
    sendQuestion
  );


  /* =========================
     ENTER TO SEND
  ========================= */

  input.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendQuestion();

      }

    }
  );


  /* =========================
     AUTO SCROLL
  ========================= */

  setTimeout(() => {

    faiMenu.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

    input.focus();

  }, 50);

}


/* =========================
   FAI MESSAGE
========================= */

function addFaiMessage(
  text,
  container
) {

  const message =
    document.createElement(
      "div"
    );

  message.className =
    "fai-chat-message fai-message";

  message.textContent =
    text;


  container.appendChild(
    message
  );


  container.scrollTop =
    container.scrollHeight;


  return message;

}


/* =========================
   STUDENT MESSAGE
========================= */

function addStudentMessage(
  text,
  container
) {

  const message =
    document.createElement(
      "div"
    );

  message.className =
    "fai-chat-message student-message";

  message.textContent =
    text;


  container.appendChild(
    message
  );


  container.scrollTop =
    container.scrollHeight;


  return message;

}

/* =========================
   NOTE IMAGE VIEWER
========================= */

let noteImages = [];
let currentImageIndex = 0;
let imageZoom = 1;

/* Object URLs created for the images */
let noteImageObjectUrls = [];


/* =========================
   OPEN FSTUDY INDEXEDDB
========================= */

function openFstudyDB() {

  return new Promise((resolve, reject) => {

    const request =
      indexedDB.open(
        "fstudy_files"
      );

    request.onsuccess = () => {

      resolve(
        request.result
      );

    };

    request.onerror = () => {

      reject(
        request.error ||
        new Error(
          "Failed to open image database."
        )
      );

    };

  });

}


/* =========================
   GET IMAGE FROM INDEXEDDB
========================= */

async function getImageFromDB(
  imageId
) {

  const db =
    await openFstudyDB();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(
          "images",
          "readonly"
        );

      const store =
        transaction.objectStore(
          "images"
        );

      const request =
        store.get(
          imageId
        );

      request.onsuccess = () => {

        resolve(
          request.result || null
        );

      };

      request.onerror = () => {

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
   GET NOTE IMAGES
========================= */

async function setupNoteImages(
  noteData
) {

  /* Reset previous images */

  noteImages = [];

  currentImageIndex = 0;


  /* =========================
     CHECK FILES
  ========================= */

  if (
    !noteData ||
    !Array.isArray(
      noteData.files
    )
  ) {

    notePreviewContainer.classList.add(
      "hidden"
    );

    return;

  }


  /* =========================
     CLEAN OLD OBJECT URLS
  ========================= */

  noteImageObjectUrls.forEach(
    url => {

      URL.revokeObjectURL(
        url
      );

    }
  );

  noteImageObjectUrls = [];


  /* =========================
     GET IMAGES FROM INDEXEDDB
  ========================= */

  for (
    const fileReference
    of noteData.files
  ) {

    if (
      !fileReference ||
      !fileReference.id
    ) {

      continue;

    }


    try {

      const storedImage =
        await getImageFromDB(
          fileReference.id
        );


      if (
        !storedImage ||
        !storedImage.file
      ) {

        continue;

      }


      /* =========================
         MAKE BROWSER URL
      ========================= */

      const imageUrl =
        URL.createObjectURL(
          storedImage.file
        );


      noteImageObjectUrls.push(
        imageUrl
      );


      noteImages.push({

        id:
          storedImage.id,

        name:
          storedImage.name,

        type:
          storedImage.type,

        file:
          storedImage.file,

        url:
          imageUrl

      });

    } catch (err) {

      /* Ignore individual
         missing images */

      continue;

    }

  }


  /* =========================
     NO IMAGES
  ========================= */

  if (
    !noteImages.length
  ) {

    notePreviewContainer.classList.add(
      "hidden"
    );

    return;

  }


  /* =========================
     SHOW PREVIEW
  ========================= */

  notePreviewContainer.classList.remove(
    "hidden"
  );


  notePreviewImage.src =
    noteImages[0].url;


  /* =========================
     OPEN VIEWER
  ========================= */

  notePreviewBtn.onclick =
    () => {

      currentImageIndex = 0;

      openNoteImage();

    };

}


/* =========================
   OPEN IMAGE
========================= */

function openNoteImage() {

  if (
    !noteImages.length
  ) {

    return;

  }


  const file =
    noteImages[
      currentImageIndex
    ];


  if (!file) {

    return;

  }


  /*
   * Reset zoom
   */

  imageZoom = 1;

noteOverlayImage.style.transformOrigin =
  "top left";

updateImageZoom();


  /*
   * Set image
   */

  noteOverlayImage.src =
    file.url;


  /*
   * Page indicator
   */

  noteImagePage.textContent =
    `Page ${currentImageIndex + 1} of ${noteImages.length}`;


  /*
   * Previous button
   */

  if (
    currentImageIndex === 0
  ) {

    noteImagePrev.disabled =
      true;

  } else {

    noteImagePrev.disabled =
      false;

  }


  /*
   * Next button
   */

  if (
    currentImageIndex >=
    noteImages.length - 1
  ) {

    noteImageNext.textContent =
      "Done";

  } else {

    noteImageNext.textContent =
      "Next";

  }


  /*
   * Show overlay
   */

  noteImageOverlay.classList.remove(
    "hidden"
  );


  /*
   * Prevent background scrolling
   */

  document.body.style.overflow =
    "hidden";

}


/* =========================
   CLOSE IMAGE
========================= */

function closeNoteImage() {

  noteImageOverlay.classList.add(
    "hidden"
  );


  document.body.style.overflow =
    "";

}


/* =========================
   CANCEL
========================= */

noteImageCancel.addEventListener(
  "click",
  closeNoteImage
);


/* =========================
   NEXT IMAGE
========================= */

noteImageNext.addEventListener(
  "click",
  () => {

    if (
      currentImageIndex <
      noteImages.length - 1
    ) {

      currentImageIndex++;

      openNoteImage();

    } else {

      closeNoteImage();

    }

  }
);

/* =========================
   PREVIOUS IMAGE
========================= */

noteImagePrev.addEventListener(
  "click",
  () => {

    if (
      currentImageIndex > 0
    ) {

      currentImageIndex--;

      openNoteImage();

    }

  }
);

/* =========================
   PINCH TO ZOOM
========================= */

let initialPinchDistance = null;
let initialPinchZoom = 1;


/* =========================
   GET TOUCH DISTANCE
========================= */

function getTouchDistance(
  touch1,
  touch2
) {

  const dx =
    touch1.clientX -
    touch2.clientX;

  const dy =
    touch1.clientY -
    touch2.clientY;

  return Math.sqrt(
    dx * dx +
    dy * dy
  );

}


/* =========================
   PINCH START
========================= */

noteImageViewer.addEventListener(
  "touchstart",
  event => {

    if (
      event.touches.length !== 2
    ) {
      return;
    }


    initialPinchDistance =
      getTouchDistance(
        event.touches[0],
        event.touches[1]
      );


    initialPinchZoom =
      imageZoom;

  },
  {
    passive: true
  }
);


/* =========================
   PINCH MOVE
========================= */

noteImageViewer.addEventListener(
  "touchmove",
  event => {

    if (
      event.touches.length !== 2 ||
      initialPinchDistance === null
    ) {
      return;
    }


    event.preventDefault();


    const currentDistance =
      getTouchDistance(
        event.touches[0],
        event.touches[1]
      );


    const scale =
      currentDistance /
      initialPinchDistance;


    imageZoom =
      initialPinchZoom *
      scale;


    imageZoom =
      Math.max(
        1,
        Math.min(
          imageZoom,
          4
        )
      );


    /*
     * Find the exact point between
     * the user's two fingers.
     */

    const pinchCenterX =
      (
        event.touches[0].clientX +
        event.touches[1].clientX
      ) / 2;


    const pinchCenterY =
      (
        event.touches[0].clientY +
        event.touches[1].clientY
      ) / 2;


    /*
     * Zoom around the pinch center.
     */

    updateImageZoom(
      pinchCenterX,
      pinchCenterY
    );

  },
  {
    passive: false
  }
);


/* =========================
   PINCH END
========================= */

noteImageViewer.addEventListener(
  "touchend",
  event => {

    if (
      event.touches.length < 2
    ) {

      initialPinchDistance =
        null;

    }

  }
);

/* =========================
   UPDATE IMAGE ZOOM
   Keeps zoom centered on
   the user's pinch location
========================= */

function updateImageZoom(
  anchorX = null,
  anchorY = null
) {

  imageZoom =
    Math.max(
      1,
      Math.min(
        imageZoom,
        4
      )
    );


  const image =
    noteOverlayImage;


  const width =
    image.naturalWidth;

  const height =
    image.naturalHeight;


  if (
    !width ||
    !height
  ) {
    return;
  }


  const viewerRect =
    noteImageViewer.getBoundingClientRect();


  /*
   * Size of the image when zoom = 1
   */

  const baseScale =
    Math.min(
      viewerRect.width / width,
      viewerRect.height / height
    );


  const oldWidth =
    noteImageStage.offsetWidth;

  const oldHeight =
    noteImageStage.offsetHeight;


  /*
   * If we are pinch-zooming,
   * calculate where the fingers
   * are relative to the current
   * image.
   */

  let focalX = null;
  let focalY = null;


  if (
    anchorX !== null &&
    anchorY !== null &&
    oldWidth > 0 &&
    oldHeight > 0
  ) {

    const viewerX =
      anchorX -
      viewerRect.left;

    const viewerY =
      anchorY -
      viewerRect.top;


    /*
     * Position of the fingers
     * inside the scrollable image.
     */

    const imagePointX =
      noteImageViewer.scrollLeft +
      viewerX;

    const imagePointY =
      noteImageViewer.scrollTop +
      viewerY;


    /*
     * Convert that position into
     * a percentage of the current
     * image size.
     */

    focalX =
      imagePointX /
      oldWidth;

    focalY =
      imagePointY /
      oldHeight;

  }


  /*
   * Calculate new image size
   */

  const newWidth =
    Math.max(
      viewerRect.width,
      width *
        baseScale *
        imageZoom
    );


  const newHeight =
    Math.max(
      viewerRect.height,
      height *
        baseScale *
        imageZoom
    );


  /*
   * Resize stage
   */

  noteImageStage.style.width =
    `${newWidth}px`;

  noteImageStage.style.height =
    `${newHeight}px`;


  /*
   * Resize image
   */

  image.style.width =
    `${newWidth}px`;

  image.style.height =
    `${newHeight}px`;

  image.style.maxWidth =
    "none";

  image.style.maxHeight =
    "none";

  image.style.transform =
    "none";


  /*
   * Restore the scroll position
   * so the pinch point stays under
   * the user's fingers.
   */

  if (
    focalX !== null &&
    focalY !== null
  ) {

    const viewerX =
      anchorX -
      viewerRect.left;

    const viewerY =
      anchorY -
      viewerRect.top;


    noteImageViewer.scrollLeft =
      (
        focalX *
        newWidth
      ) -
      viewerX;


    noteImageViewer.scrollTop =
      (
        focalY *
        newHeight
      ) -
      viewerY;

  }

}
    /* =========================
       START
    ========================= */

    loadNote();

  }
);