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


      const content =
        document.createElement(
          "div"
        );

      content.className =
        "section-content";

      content.textContent =
        section.content ||
        "";


      sectionElement.appendChild(
        number
      );

      sectionElement.appendChild(
        heading
      );

      sectionElement.appendChild(
        content
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
   START
========================= */

loadNote();

}
);