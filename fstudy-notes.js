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

    const title =
      document.getElementById(
        "title"
      );

    const subtitle =
      document.getElementById(
        "subtitle"
      );

    const loading =
      document.getElementById(
        "loading"
      );

    const error =
      document.getElementById(
        "error"
      );

    const empty =
      document.getElementById(
        "empty"
      );

    const topicList =
      document.getElementById(
        "topic-list"
      );

const uploadNotesBtn =
  document.getElementById(
    "upload-notes-btn"
  );
  
  const myNotesSection =
  document.getElementById(
    "my-notes-section"
  );

const myNotesList =
  document.getElementById(
    "my-notes-list"
  );
  
  const exploreMarketBtn =
  document.getElementById(
    "explore-market-btn"
  );
  
    /* =========================
       LOCAL STORAGE
    ========================= */

    const studyingUni =
      localStorage.getItem(
        "studying_uni"
      );

    const studying =
      localStorage.getItem(
        "studying"
      );


    /* =========================
       SAFETY
    ========================= */

    if (
      !studyingUni ||
      !studying
    ) {

      loading.classList.add(
        "hidden"
      );

      error.textContent =
        "No university or course selected.";

      error.classList.remove(
        "hidden"
      );

      return;

    }


    /* =========================
       HEADER
    ========================= */

    title.textContent =
      "FSTUDY NOTES";

    subtitle.textContent =
      `${studyingUni} • ${studying}`;


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
   LOAD MY NOTES
========================= */

function loadMyNotes() {

  if (
    !myNotesSection ||
    !myNotesList
  ) {
    return;
  }


  myNotesList.innerHTML = "";


  /* =========================
     GET SAVED NOTES
  ========================= */

  const stored =
    localStorage.getItem(
      "myfstudynote"
    );


  if (!stored) {

    myNotesSection.classList.add(
      "hidden"
    );

    return;

  }


  let myNotes;


  try {

    myNotes =
      JSON.parse(stored);

  } catch {

    myNotesSection.classList.add(
      "hidden"
    );

    return;

  }


  if (
    !Array.isArray(myNotes) ||
    !myNotes.length
  ) {

    myNotesSection.classList.add(
      "hidden"
    );

    return;

  }


  /* =========================
     SHOW MY NOTES SECTION
  ========================= */

  myNotesSection.classList.remove(
    "hidden"
  );


  /* =========================
     RENDER NOTES
  ========================= */

  myNotes.forEach(
    (note, index) => {

      if (
        !note ||
        typeof note !== "object"
      ) {
        return;
      }


      const card =
        document.createElement(
          "div"
        );

      card.className =
        "my-note-card";


      /* =========================
         NOTE INFORMATION
      ========================= */

      const info =
        document.createElement(
          "div"
        );

      info.className =
        "my-note-info";


      const label =
        document.createElement(
          "div"
        );

      label.className =
        "my-note-label";

      label.textContent =
        "My Note";


      const noteTitle =
        document.createElement(
          "div"
        );

      noteTitle.className =
        "my-note-title";

      noteTitle.textContent =
        note.title ||
        note.topic ||
        "Untitled Note";


      const noteMeta =
        document.createElement(
          "div"
        );

      noteMeta.className =
        "my-note-meta";

      noteMeta.textContent =
        `${note.course || ""} • ${
          note.topic || ""
        }`;


      info.appendChild(
        label
      );

      info.appendChild(
        noteTitle
      );

      info.appendChild(
        noteMeta
      );


      /* =========================
         OPEN ARROW
      ========================= */

      const arrow =
        document.createElement(
          "div"
        );

      arrow.className =
        "my-note-arrow";

      arrow.textContent =
        "›";


      /* =========================
         CARD
      ========================= */

      card.appendChild(
        info
      );

      card.appendChild(
        arrow
      );


      /* =========================
         OPEN NOTE
      ========================= */

      card.addEventListener(
        "click",
        () => {

          /*
           * Save the selected
           * note for view-note.
           */

          localStorage.setItem(
            "viewing_note",
            JSON.stringify(
              note
            )
          );


          window.location.href =
            "view-note";

        }
      );


      myNotesList.appendChild(
        card
      );

    }
  );

}

    /* =========================
       LOAD TOPICS
    ========================= */

    async function loadTopics() {

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
                    "retrieve_notes_topics",

                  university:
                    studyingUni,

                  course:
                    studying

                })

            }
          );


        if (!response.ok) {

          throw new Error(
            "Failed to load note topics."
          );

        }


        const data =
          await response.json();


        if (!data.success) {

          throw new Error(
            data.error ||
            "Failed to load note topics."
          );

        }


        const topics =
          data.topics || [];


        loading.classList.add(
          "hidden"
        );


        if (!topics.length) {

          empty.classList.remove(
            "hidden"
          );

          return;

        }


        renderTopics(
          topics
        );


      } catch (err) {

        loading.classList.add(
          "hidden"
        );

        error.textContent =
          err.message ||
          "Failed to load note topics.";

        error.classList.remove(
          "hidden"
        );

      }

    }

/* =========================
   CREATE NOTE SHARE LINK
========================= */

function createNoteShareLink(
  topic
) {

  const params =
    new URLSearchParams({

      university:
        studyingUni,

      course:
        studying,

      topic:
        topic

    });


  return (
    window.location.origin +
    "/share/note?" +
    params.toString()
  );

}

/* =========================
   RENDER TOPICS
========================= */

function renderTopics(
  topics
) {

  topicList.innerHTML = "";

  topicList.classList.remove(
    "hidden"
  );


  topics.forEach(topic => {

    const card =
      document.createElement("div");

    card.className =
      "topic-card";


    /* =========================
       CARD INFORMATION
    ========================= */

    const cardInfo =
      document.createElement("div");

    cardInfo.className =
      "topic-info";


    const label =
      document.createElement("div");

    label.className =
      "topic-label";

    label.textContent =
      "Topic";


    const topicName =
      document.createElement("div");

    topicName.className =
      "topic-name";

    topicName.textContent =
      topic;


    cardInfo.appendChild(
      label
    );

    cardInfo.appendChild(
      topicName
    );


    /* =========================
       THREE DOTS
    ========================= */

    const menuWrapper =
      document.createElement("div");

    menuWrapper.className =
      "card-menu";


    const menuBtn =
      document.createElement("button");

    menuBtn.type =
      "button";

    menuBtn.className =
      "card-menu-btn";

    menuBtn.textContent =
      "⋮";

    menuBtn.setAttribute(
      "aria-label",
      "More options"
    );


    /* =========================
       DROPDOWN
    ========================= */

    const dropdown =
      document.createElement("div");

    dropdown.className =
      "card-dropdown hidden";


    const shareBtn =
      document.createElement("button");

    shareBtn.type =
      "button";

    shareBtn.className =
      "card-dropdown-item";

    shareBtn.textContent =
      "Share";


    dropdown.appendChild(
      shareBtn
    );


    menuWrapper.appendChild(
      menuBtn
    );

    menuWrapper.appendChild(
      dropdown
    );


    /* =========================
       OPEN MENU
    ========================= */

    menuBtn.addEventListener(
      "click",
      event => {

        event.stopPropagation();


        /* Close other menus */

        document
          .querySelectorAll(
            ".card-dropdown"
          )
          .forEach(menu => {

            if (
              menu !== dropdown
            ) {

              menu.classList.add(
                "hidden"
              );

            }

          });


        dropdown.classList.toggle(
          "hidden"
        );

      }
    );


    /* =========================
       SHARE
    ========================= */

    shareBtn.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        dropdown.classList.add(
          "hidden"
        );

        openShareInterface(
          topic
        );

      }
    );


    /* =========================
       CARD LAYOUT
    ========================= */

    card.appendChild(
      cardInfo
    );

    card.appendChild(
      menuWrapper
    );


    /* =========================
       OPEN TOPIC
    ========================= */

    card.addEventListener(
      "click",
      () => {

        openTopic(
          topic
        );

      }
    );


    topicList.appendChild(
      card
    );

  });

}


    /* =========================
       OPEN TOPIC
    ========================= */

    function openTopic(
      topic
    ) {

      const viewingNote = {

        university:
          studyingUni,

        course:
          studying,

        topic:
          topic

      };


      localStorage.setItem(
        "viewing_note",
        JSON.stringify(
          viewingNote
        )
      );


      window.location.href =
        "view-note";

    }

/* =========================
   SHARE INTERFACE
========================= */

function openShareInterface(topic) {

  const overlay =
    document.createElement("div");

  overlay.className =
    "share-overlay";


  const sheet =
    document.createElement("div");

  sheet.className =
    "share-sheet";


  /* =========================
     HEADER
  ========================= */

  const header =
    document.createElement("div");

  header.className =
    "share-header";


  const title =
    document.createElement("h2");

  title.textContent =
    "Share Note";


  const closeBtn =
    document.createElement("button");

  closeBtn.type =
    "button";

  closeBtn.className =
    "share-close-btn";

  closeBtn.textContent =
    "×";


  header.appendChild(
    title
  );

  header.appendChild(
    closeBtn
  );


  /* =========================
     DESCRIPTION
  ========================= */

  const description =
    document.createElement("p");

  description.className =
    "share-description";

  description.textContent =
    `${studyingUni} • ${studying} • ${topic}`;


  /* =========================
     LINK
  ========================= */

  const link =
    createNoteShareLink(
      topic
    );


  const linkBox =
    document.createElement("div");

  linkBox.className =
    "share-link-box";


  const linkText =
    document.createElement("span");

  linkText.textContent =
    link;


  linkBox.appendChild(
    linkText
  );


  /* =========================
     COPY BUTTON
  ========================= */

  const copyBtn =
    document.createElement("button");

  copyBtn.type =
    "button";

  copyBtn.className =
    "share-copy-btn";

  copyBtn.textContent =
    "Copy Link";


  copyBtn.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          link
        );


        copyBtn.textContent =
          "Copied!";


        setTimeout(() => {

          copyBtn.textContent =
            "Copy Link";

        }, 1500);


      } catch {

        const input =
          document.createElement(
            "input"
          );

        input.value =
          link;

        document.body.appendChild(
          input
        );

        input.select();

        document.execCommand(
          "copy"
        );

        input.remove();


        copyBtn.textContent =
          "Copied!";


        setTimeout(() => {

          copyBtn.textContent =
            "Copy Link";

        }, 1500);

      }

    }
  );


  /* =========================
     NATIVE SHARE
  ========================= */

  const nativeShareBtn =
    document.createElement("button");

  nativeShareBtn.type =
    "button";

  nativeShareBtn.className =
    "share-native-btn";

  nativeShareBtn.textContent =
    "Share";


  nativeShareBtn.addEventListener(
    "click",
    async () => {

      if (
        navigator.share
      ) {

        try {

          await navigator.share({

            title:
              `${studying} Notes - ${topic}`,

            text:
              `Check out these ${studying} notes from ${studyingUni} on ${topic}.`,

            url:
              link

          });

        } catch {

          /*
            User cancelled
            the share sheet.
          */

        }

      } else {

        try {

          await navigator.clipboard.writeText(
            link
          );

          nativeShareBtn.textContent =
            "Link Copied!";

        } catch {

          nativeShareBtn.textContent =
            "Copy the link above";

        }

      }

    }
  );


  /* =========================
     APPEND
  ========================= */

  sheet.appendChild(
    header
  );

  sheet.appendChild(
    description
  );

  sheet.appendChild(
    linkBox
  );

  sheet.appendChild(
    copyBtn
  );

  sheet.appendChild(
    nativeShareBtn
  );


  overlay.appendChild(
    sheet
  );


  document.body.appendChild(
    overlay
  );


  /* =========================
     CLOSE BUTTON
  ========================= */

  closeBtn.addEventListener(
    "click",
    () => {

      overlay.remove();

    }
  );


  /* =========================
     CLOSE OUTSIDE
  ========================= */

  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target === overlay
      ) {

        overlay.remove();

      }

    }
  );

}

/* =========================
   UPLOAD NOTES
========================= */

if (uploadNotesBtn) {

  uploadNotesBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "upload-notes";

    }
  );

}

/* =========================
   EXPLORE FMARKET
========================= */

if (exploreMarketBtn) {

  exploreMarketBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "/fmarket";

    }
  );

}

    /* =========================
       START
    ========================= */

    loadTopics();
loadMyNotes();

  }
);