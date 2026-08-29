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


      card.appendChild(year);

      card.appendChild(count);


      /* =========================
         OPEN PAST QUESTION
      ========================= */

      card.addEventListener(
  "click",
  () => {

    /*
      Save the selected year
    */

    localStorage.setItem(
      "past_question_year",
      item.year
    );


    /*
      Save the questions belonging
      to this year.

      This will overwrite whatever
      previous year was saved.
    */

    localStorage.setItem(
      "past_question_data",
      JSON.stringify(
        item.questions || []
      )
    );


    /*
      Save basic course information
      for the viewing page.
    */

    localStorage.setItem(
      "past_question_university",
      studyingUni
    );

    localStorage.setItem(
      "past_question_course",
      studying
    );


    /*
      Open the question viewer
    */

    location.href =
      "view-past-question";

  }
);


      list.appendChild(card);

    });

  }


  /* =========================
     START
  ========================= */

  getPastQuestions();

});