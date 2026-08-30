document.addEventListener("DOMContentLoaded", () => {

  const title =
    document.getElementById("title");

  const subtitle =
    document.getElementById("subtitle");

  const loading =
    document.getElementById("loading");

  const error =
    document.getElementById("error");

  const empty =
    document.getElementById("empty");

  const list =
    document.getElementById(
      "past-question-list"
    );

  const backBtn =
    document.getElementById("back-btn");


  /* =========================
     LOCAL STORAGE
  ========================= */

  const studyingUni =
    localStorage.getItem("studying_uni");

  const studying =
    localStorage.getItem("studying");


  /* =========================
     SAFETY
  ========================= */

  if (!studyingUni || !studying) {

    loading.classList.add("hidden");

    error.textContent =
      "No university or course selected.";

    error.classList.remove("hidden");

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
     LOAD PAST QUESTIONS
  ========================= */

  async function getPastQuestions() {

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
      method: "POST",
      body: formData
    }
  );


      if (!response.ok) {

        throw new Error(
          "Failed to load past questions"
        );

      }


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.error ||
          "Failed to load past questions"
        );

      }


      loading.classList.add("hidden");


      const years =
  data.years || [];


if (!years.length) {

  empty.classList.remove(
    "hidden"
  );

  return;

}


renderPastQuestions(
  years
);


    } catch (err) {

      console.error(err);

      loading.classList.add(
        "hidden"
      );

      error.textContent =
        err.message ||
        "Failed to load past questions.";

      error.classList.remove(
        "hidden"
      );

    }

  }


  /* =========================
     RENDER
  ========================= */

  function renderPastQuestions(
  questions
) {

  list.innerHTML = "";


  questions.forEach(item => {

    const card =
      document.createElement("div");

    card.className =
      "past-question-card";


    /* =========================
       CARD INFORMATION
    ========================= */

    const cardInfo =
      document.createElement("div");

    cardInfo.className =
      "past-question-info";


    const year =
      document.createElement("div");

    year.className =
      "year";

    year.textContent =
      item.year ||
      "Unknown Year";


    const count =
      document.createElement("div");

    count.className =
      "question-count";

    const questionCount =
      item.question_count || 0;

    count.textContent =
      `${questionCount} questions`;


    cardInfo.appendChild(
      year
    );

    cardInfo.appendChild(
      count
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
          item
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
       OPEN PAST QUESTION
    ========================= */

    card.addEventListener(
      "click",
      () => {

        localStorage.setItem(
          "past_question_year",
          item.year
        );


        localStorage.setItem(
          "past_question_data",
          JSON.stringify(
            item.questions || []
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


        location.href =
          "view-past-question";

      }
    );


    list.appendChild(
      card
    );

  });

}

/* =========================
   SHARE INTERFACE
========================= */

function openShareInterface(item) {

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
    "Share Past Question";


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
    `${studyingUni} • ${studying} • ${item.year}`;


  /* =========================
     LINK
  ========================= */

  const linkBox =
    document.createElement("div");

  linkBox.className =
    "share-link-box";


  const linkText =
    document.createElement("span");

  linkText.textContent =
    createPastQuestionShareLink(
      item
    );


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

      const link =
        createPastQuestionShareLink(
          item
        );


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

        /* Fallback */

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
              `${studying} Past Questions - ${item.year}`,

            text:
              `Check out these ${studying} past questions from ${studyingUni} (${item.year}).`,

            url:
              link

          });

        } catch (err) {

          /*
            User cancelled the
            native share sheet.
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
        event.target === overlay
      ) {

        overlay.remove();

      }

    }
  );

}

/* =========================
   CREATE SHARE LINK
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

  getPastQuestions();

});