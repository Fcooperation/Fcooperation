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


          card.innerHTML = `

            <div class="topic-left">

              <div class="topic-label">
                Topic
              </div>

              <div class="topic-name"></div>

            </div>

            <div class="topic-arrow">
              →
            </div>

          `;


          card.querySelector(
            ".topic-name"
          ).textContent =
            topic;


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