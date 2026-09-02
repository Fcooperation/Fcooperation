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
         BACKEND
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

      } catch {

        /*
          Backend failure should not
          stop local questions from
          appearing.
        */

        backendYears = [];

      }


      /* =========================
         BACKEND SECTION
      ========================= */

      if (
        backendYears.length > 0
      ) {

        renderSectionTitle(
          "Past Questions"
        );


        renderBackendQuestions(
          backendYears
        );

      }


      /* =========================
         MY PAST QUESTIONS
      ========================= */

      const myQuestions =
        getMyPastQuestions();


      if (
        myQuestions.length > 0
      ) {

        renderSectionTitle(
          "My Past Questions"
        );


        renderMyPastQuestions(
          myQuestions
        );

      }


      /* =========================
         EMPTY
      ========================= */

      loading.classList.add(
        "hidden"
      );


      if (
        backendYears.length === 0 &&
        myQuestions.length === 0
      ) {

        empty.classList.remove(
          "hidden"
        );

      }


      /* =========================
         ACTION BUTTONS
      ========================= */

      createActionButtons();

    }


    /* =========================
       GET MY PAST QUESTIONS
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


      /*
        If logged in, use the account-specific
        storage key.

        Otherwise use the general key.
      */

      let keys = [];


      if (
        account.id
      ) {

        keys.push(
          `my_past_questions_${account.id}`
        );

      }


      keys.push(
        "my_past_questions"
      );


      let allQuestions = [];


      /* =========================
         READ STORAGE
      ========================= */

      keys.forEach(
        key => {

          const saved =
            localStorage.getItem(
              key
            );


          if (!saved) {

            return;

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

              return;

            }


            allQuestions.push(
              ...parsed
            );


          } catch {

            /*
              Ignore invalid storage.
            */

          }

        }
      );


      /* =========================
         REMOVE DUPLICATES
      ========================= */

      const unique =
        new Map();


      allQuestions.forEach(
        question => {

          if (
            !question ||
            typeof question !==
              "object"
          ) {

            return;

          }


          const id =
            question.id;


          if (
            id
          ) {

            unique.set(
              id,
              question
            );

          } else {

            /*
              Keep questions that somehow
              have no ID as well.
            */

            const fallbackId =
              JSON.stringify(
                question
              );


            unique.set(
              fallbackId,
              question
            );

          }

        }
      );


      /*
        NO UNIVERSITY FILTER.
        NO COURSE FILTER.

        Every saved past question
        is displayed.
      */

      return Array.from(
        unique.values()
      );

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
              item
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


      /* =========================
         SORT YEARS
      ========================= */

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
              !Number.isNaN(yearA) &&
              !Number.isNaN(yearB)
            ) {

              return (
                yearB -
                yearA
              );

            }


            return String(b)
              .localeCompare(
                String(a)
              );

          }
        );


      /* =========================
         CREATE CARDS
      ========================= */

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
              }
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
      originalItem
    ) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "past-question-card";


      /* =========================
         INFORMATION
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
         MENU
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
         CARD
      ========================= */

      card.appendChild(
        cardInfo
      );


      card.appendChild(
        menuWrapper
      );


      /* =========================
         OPEN
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


          if (
            batch.length === 0
          ) {

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

      /*
        Remove an existing action
        container first.

        This prevents duplicates if
        the function runs again.
      */

      const oldActions =
        document.querySelector(
          ".past-question-actions"
        );


      if (oldActions) {

        oldActions.remove();

      }


      const container =
        document.createElement(
          "div"
        );


      container.className =
        "past-question-actions";


      /* =========================
         UPLOAD
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
            "/upload-past-question";

        }
      );


      /* =========================
         FMARKET
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


      /* =========================
         APPEND
      ========================= */

      container.appendChild(
        uploadBtn
      );


      container.appendChild(
        marketBtn
      );


      /*
        Put the buttons AFTER
        everything in the list.
      */

      list.parentNode.appendChild(
        container
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
        `${item?.university || studyingUni} • ${item?.course || studying} • ${itemYear}`;


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
                  `${item?.course || studying} Past Questions - ${itemYear}`,

                text:
                  `Check out these past questions from ${item?.university || studyingUni} (${itemYear}).`,

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
            item?.university ||
            studyingUni,

          course:
            item?.course ||
            studying,

          year:
            item?.year ||
            ""

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