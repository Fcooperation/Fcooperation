document.addEventListener(
  "DOMContentLoaded",
  () => {

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

    const list =
      document.getElementById(
        "past-question-list"
      );

    const backBtn =
      document.getElementById(
        "back-btn"
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
       SHOW COURSE
    ========================= */

    title.textContent =
      "Past Questions";

    subtitle.textContent =
      `${studyingUni} • ${studying}`;


    /* =========================
       BACK BUTTON
    ========================= */

    backBtn.addEventListener(
      "click",
      () => {

        history.back();

      }
    );


    /* =========================
       TOP ACTIONS
    ========================= */

    createActionButtons();


    /* =========================
       LOAD EVERYTHING
    ========================= */

    async function loadPastQuestions() {

      loading.classList.remove(
        "hidden"
      );

      error.classList.add(
        "hidden"
      );

      empty.classList.add(
        "hidden"
      );

      list.innerHTML = "";


      let backendYears = [];


      /* =========================
         LOAD BACKEND QUESTIONS
      ========================= */

      try {

        const formData =
          new FormData();

        formData.append(
          "university",
          studyingUni
        );

        formData.append(
          "course",
          studying
        );


        const response =
          await fetch(
            window.CONFIG.API_URL +
              "/past-question",
            {
              method:
                "POST",

              body:
                formData
            }
          );


        if (!response.ok) {

          throw new Error(
            "Failed to load past questions."
          );

        }


        const data =
          await response.json();


        if (!data.success) {

          throw new Error(
            data.error ||
              "Failed to load past questions."
          );

        }


        backendYears =
          Array.isArray(
            data.years
          )
            ? data.years
            : [];


      } catch (err) {

        /*
          Backend failure should not
          prevent My Past Questions
          from being displayed.
        */

        backendYears = [];

      }


      /* =========================
         RENDER BACKEND
      ========================= */

      if (
        backendYears.length
      ) {

        renderSectionTitle(
          "Past Questions"
        );

        renderBackendQuestions(
          backendYears
        );

      }


      /* =========================
         LOAD MY QUESTIONS
      ========================= */

      const myQuestions =
        getMyPastQuestions();


      /* =========================
         RENDER MY QUESTIONS
      ========================= */

      if (
        myQuestions.length
      ) {

        renderSectionTitle(
          "My Past Questions"
        );

        renderMyPastQuestions(
          myQuestions
        );

      }


      /* =========================
         FINISH LOADING
      ========================= */

      loading.classList.add(
        "hidden"
      );


      if (
        !backendYears.length &&
        !myQuestions.length
      ) {

        empty.classList.remove(
          "hidden"
        );

      }

    }


    /* =========================
       GET MY QUESTIONS
    ========================= */

    function getMyPastQuestions() {

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


      let key =
        "my_past_questions";


      if (
        account.id
      ) {

        key =
          `my_past_questions_${account.id}`;

      }


      const saved =
        localStorage.getItem(
          key
        );


      if (!saved) {

        return [];

      }


      try {

        const parsed =
          JSON.parse(
            saved
          );


        if (
          !Array.isArray(
            parsed
          )
        ) {

          return [];

        }


        /*
          Only show questions belonging
          to the currently selected
          university and course.
        */

        return parsed.filter(
          question => {

            const sameUniversity =
              String(
                question.university ||
                  ""
              ).trim()
              .toLowerCase() ===
              String(
                studyingUni
              ).trim()
              .toLowerCase();


            const sameCourse =
              String(
                question.course ||
                  ""
              ).trim()
              .toLowerCase() ===
              String(
                studying
              ).trim()
              .toLowerCase();


            return (
              sameUniversity &&
              sameCourse
            );

          }
        );

      } catch {

        return [];

      }

    }


    /* =========================
       SECTION TITLE
    ========================= */

    function renderSectionTitle(
      text
    ) {

      const section =
        document.createElement(
          "div"
        );

      section.className =
        "past-question-section-title";

      section.textContent =
        text;

      list.appendChild(
        section
      );

    }


    /* =========================
       BACKEND QUESTIONS
    ========================= */

    function renderBackendQuestions(
      years
    ) {

      years.forEach(
        item => {

          const card =
            createQuestionCard(
              item.year,
              item.question_count,
              item.questions || [],
              item,
              false
            );

          list.appendChild(
            card
          );

        }
      );

    }


    /* =========================
       MY QUESTIONS
    ========================= */

    function renderMyPastQuestions(
      questions
    ) {

      /*
        Group individual questions
        into years.
      */

      const grouped =
        {};


      questions.forEach(
        question => {

          const year =
            question.year ||
            "Unknown Year";


          if (
            !grouped[year]
          ) {

            grouped[year] =
              [];

          }


          grouped[year].push(
            question
          );

        }
      );


      /*
        Sort years newest first.
      */

      const years =
        Object.keys(
          grouped
        ).sort(
          (a, b) => {

            const yearA =
              Number(a);

            const yearB =
              Number(b);


            if (
              Number.isNaN(yearA) ||
              Number.isNaN(yearB)
            ) {

              return String(b)
                .localeCompare(
                  String(a)
                );

            }


            return (
              yearB - yearA
            );

          }
        );


      years.forEach(
        year => {

          const yearQuestions =
            grouped[year];


          const card =
            createQuestionCard(
              year,
              yearQuestions.length,
              yearQuestions,
              {
                year,
                questions:
                  yearQuestions
              },
              true
            );


          list.appendChild(
            card
          );

        }
      );

    }


    /* =========================
       CREATE CARD
    ========================= */

    function createQuestionCard(
      year,
      questionCount,
      questions,
      originalItem,
      isLocal
    ) {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "past-question-card";


      /* =========================
         CARD INFORMATION
      ========================= */

      const cardInfo =
        document.createElement(
          "div"
        );

      cardInfo.className =
        "past-question-info";


      const yearElement =
        document.createElement(
          "div"
        );

      yearElement.className =
        "year";

      yearElement.textContent =
        year ||
        "Unknown Year";


      const count =
        document.createElement(
          "div"
        );

      count.className =
        "question-count";

      count.textContent =
        `${questionCount || 0} questions`;


      cardInfo.appendChild(
        yearElement
      );

      cardInfo.appendChild(
        count
      );


      /* =========================
         THREE DOTS
      ========================= */

      const menuWrapper =
        document.createElement(
          "div"
        );

      menuWrapper.className =
        "card-menu";


      const menuBtn =
        document.createElement(
          "button"
        );

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
        document.createElement(
          "div"
        );

      dropdown.className =
        "card-dropdown hidden";


      const shareBtn =
        document.createElement(
          "button"
        );

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


          document
            .querySelectorAll(
              ".card-dropdown"
            )
            .forEach(
              menu => {

                if (
                  menu !==
                  dropdown
                ) {

                  menu.classList.add(
                    "hidden"
                  );

                }

              }
            );


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
            originalItem
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
         OPEN QUESTIONS
      ========================= */

      card.addEventListener(
        "click",
        () => {

          const batch =
            Array.isArray(
              questions
            )
              ? questions
              : [];


          if (!batch.length) {

            return;

          }


          localStorage.setItem(
            "past_question_year",
            String(year)
          );


          localStorage.setItem(
            "past_question_data",
            JSON.stringify(
              batch
            )
          );


          localStorage.setItem(
            "past_question_university",
            studyingUni
          );


          localStorage.setItem(
            "past_question_course",
            studying
          );


          /*
            Also save the batch used by
            view-past-question.js.
          */

          localStorage.setItem(
            "viewing_past_questions_batch",
            JSON.stringify(
              batch
            )
          );


          localStorage.setItem(
            "viewing_past_question",
            JSON.stringify(
              batch[0]
            )
          );


          location.href =
            "/view-past-question";

        }
      );


      return card;

    }


    /* =========================
       ACTION BUTTONS
    ========================= */

    function createActionButtons() {

      const container =
        document.createElement(
          "div"
        );

      container.className =
        "past-question-actions";


      /* =========================
         UPLOAD BUTTON
      ========================= */

      const uploadBtn =
        document.createElement(
          "button"
        );

      uploadBtn.type =
        "button";

      uploadBtn.className =
        "past-question-action upload";

      uploadBtn.textContent =
        "Upload Past Questions";


      uploadBtn.addEventListener(
        "click",
        () => {

          location.href =
            "/upload-past-questions";

        }
      );


      /* =========================
         MARKET BUTTON
      ========================= */

      const marketBtn =
        document.createElement(
          "button"
        );

      marketBtn.type =
        "button";

      marketBtn.className =
        "past-question-action market";

      marketBtn.textContent =
        "Explore Other Materials";


      marketBtn.addEventListener(
        "click",
        () => {

          location.href =
            "/fmarket";

        }
      );


      container.appendChild(
        uploadBtn
      );

      container.appendChild(
        marketBtn
      );


      /*
        Put buttons directly before
        the question list.
      */

      list.parentNode.insertBefore(
        container,
        list
      );

    }


    /* =========================
       SHARE INTERFACE
    ========================= */

    function openShareInterface(
      item
    ) {

      const overlay =
        document.createElement(
          "div"
        );

      overlay.className =
        "share-overlay";


      const sheet =
        document.createElement(
          "div"
        );

      sheet.className =
        "share-sheet";


      /* =========================
         HEADER
      ========================= */

      const header =
        document.createElement(
          "div"
        );

      header.className =
        "share-header";


      const shareTitle =
        document.createElement(
          "h2"
        );

      shareTitle.textContent =
        "Share Past Question";


      const closeBtn =
        document.createElement(
          "button"
        );

      closeBtn.type =
        "button";

      closeBtn.className =
        "share-close-btn";

      closeBtn.textContent =
        "×";


      header.appendChild(
        shareTitle
      );

      header.appendChild(
        closeBtn
      );


      /* =========================
         DESCRIPTION
      ========================= */

      const description =
        document.createElement(
          "p"
        );

      description.className =
        "share-description";


      const itemYear =
        item?.year ||
        "Unknown Year";


      description.textContent =
        `${studyingUni} • ${studying} • ${itemYear}`;


      /* =========================
         LINK
      ========================= */

      const linkBox =
        document.createElement(
          "div"
        );

      linkBox.className =
        "share-link-box";


      const linkText =
        document.createElement(
          "span"
        );


      linkText.textContent =
        createPastQuestionShareLink(
          item
        );


      linkBox.appendChild(
        linkText
      );


      /* =========================
         COPY
      ========================= */

      const copyBtn =
        document.createElement(
          "button"
        );

      copyBtn.type =
        "button";

      copyBtn.className =
        "share-copy-btn";

      copyBtn.textContent =
        "Copy Link";


      copyBtn.addEventListener(
        "click",
        async () => {

          const link =
            createPastQuestionShareLink(
              item
            );


          try {

            await navigator
              .clipboard
              .writeText(
                link
              );


            copyBtn.textContent =
              "Copied!";


            setTimeout(
              () => {

                copyBtn.textContent =
                  "Copy Link";

              },
              1500
            );


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


            setTimeout(
              () => {

                copyBtn.textContent =
                  "Copy Link";

              },
              1500
            );

          }

        }
      );


      /* =========================
         NATIVE SHARE
      ========================= */

      const nativeShareBtn =
        document.createElement(
          "button"
        );

      nativeShareBtn.type =
        "button";

      nativeShareBtn.className =
        "share-native-btn";

      nativeShareBtn.textContent =
        "Share";


      nativeShareBtn.addEventListener(
        "click",
        async () => {

          const link =
            createPastQuestionShareLink(
              item
            );


          if (
            navigator.share
          ) {

            try {

              await navigator.share({

                title:
                  `${studying} Past Questions - ${itemYear}`,

                text:
                  `Check out these ${studying} past questions from ${studyingUni} (${itemYear}).`,

                url:
                  link

              });

            } catch {

              /*
                User cancelled.
              */

            }

          } else {

            try {

              await navigator
                .clipboard
                .writeText(
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
         CLOSE
      ========================= */

      closeBtn.addEventListener(
        "click",
        () => {

          overlay.remove();

        }
      );


      overlay.addEventListener(
        "click",
        event => {

          if (
            event.target ===
            overlay
          ) {

            overlay.remove();

          }

        }
      );

    }


    /* =========================
       SHARE LINK
    ========================= */

    function createPastQuestionShareLink(
      item
    ) {

      const params =
        new URLSearchParams({

          university:
            studyingUni,

          course:
            studying,

          year:
            item.year

        });


      return (
        window.location.origin +
        "/share/past-question?" +
        params.toString()
      );

    }


    /* =========================
       START
    ========================= */

    loadPastQuestions();

  }
);