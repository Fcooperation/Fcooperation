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

  topicList.innerHTML =
    "";

  topicList.classList.remove(
    "hidden"
  );


  topics.forEach(
    topic => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "topic-card";


      /* =========================
         CARD CONTENT
      ========================= */

      card.innerHTML = `

        <div class="topic-left">

          <div class="topic-label">
            Topic
          </div>

          <div class="topic-name"></div>

        </div>

        <button
          type="button"
          class="topic-menu-btn"
          aria-label="More options"
        >
          ⋮
        </button>

        <div class="topic-menu hidden">

          <button
            type="button"
            class="topic-menu-item share-topic-btn"
          >
            Share
          </button>

        </div>

      `;


      /* =========================
         TOPIC NAME
      ========================= */

      card.querySelector(
        ".topic-name"
      ).textContent =
        topic;


      /* =========================
         ELEMENTS
      ========================= */

      const menuBtn =
        card.querySelector(
          ".topic-menu-btn"
        );

      const menu =
        card.querySelector(
          ".topic-menu"
        );

      const shareBtn =
        card.querySelector(
          ".share-topic-btn"
        );


/* =========================
   OPEN TOPIC
========================= */

card.addEventListener(
  "click",
  event => {

    /*
      Do not open the topic when
      clicking the three-dot menu
      or anything inside it.
    */

    if (
      event.target.closest(
        ".topic-menu"
      ) ||
      event.target.closest(
        ".topic-menu-btn"
      )
    ) {

      return;

    }


    openTopic(
      topic
    );

  }
);


      /* =========================
         THREE DOTS
      ========================= */

      menuBtn.addEventListener(
        "click",
        event => {

          /*
            Prevent the card click
            from opening the note.
          */

          event.stopPropagation();


          /*
            Close other open menus.
          */

          document
            .querySelectorAll(
              ".topic-menu"
            )
            .forEach(
              otherMenu => {

                if (
                  otherMenu !== menu
                ) {

                  otherMenu.classList.add(
                    "hidden"
                  );

                }

              }
            );


          /*
            Toggle this menu.
          */

          menu.classList.toggle(
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


    const shareLink =
      createNoteShareLink(
        topic
      );


    openShareInterface(
      shareLink,
      `FSTUDY • ${studying} • ${topic}`
    );


    menu.classList.add(
      "hidden"
    );

  }
);


      topicList.appendChild(
        card
      );

    }
  );

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
       START
    ========================= */

    loadTopics();

  }
);