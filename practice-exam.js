document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */

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

  const exam =
    document.getElementById("exam");

  const result =
    document.getElementById("result");

  const question =
    document.getElementById("question");

  const options =
    document.getElementById("options");

  const difficulty =
    document.getElementById("difficulty");

  const topic =
    document.getElementById("topic");

  const timer =
    document.getElementById("timer");

  const questionTime =
    document.getElementById("question-time");

  const questionNumber =
    document.getElementById("question-number");

  const answeredCount =
    document.getElementById("answered-count");

  const progressFill =
    document.getElementById("progress-fill");

  const previousBtn =
    document.getElementById("previous-btn");

  const nextBtn =
    document.getElementById("next-btn");

  const backBtn =
    document.getElementById("back-btn");

  const restartBtn =
    document.getElementById("restart-btn");


  /* =========================
     LOCAL STORAGE
  ========================= */

  const studyingUni =
    localStorage.getItem("studying_uni");

  const studying =
    localStorage.getItem("studying");


  /* =========================
     EXAM SETTINGS
  ========================= */

  const EXAM_QUESTION_COUNT = 35;

  /*
    Default question time.

    This is only used when a question
    does not yet have a stored time limit.
  */

  const DEFAULT_QUESTION_TIME = 60;


  /* =========================
     STATE
  ========================= */

  let questions = [];

  let currentIndex = 0;

  let answers = [];

  let questionTimer = null;

  let remainingSeconds =
    DEFAULT_QUESTION_TIME;

  let examFinished = false;


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
     HEADER
  ========================= */

  title.textContent =
    "Practice Exam";

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
     LOAD QUESTIONS
  ========================= */

  async function loadExam() {

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

            body: JSON.stringify({

              action:
                "get_quiz",

              university:
                studyingUni,

              course:
                studying,

              count:
                EXAM_QUESTION_COUNT

            })

          }
        );


      if (!response.ok) {

        throw new Error(
          "Failed to load practice exam."
        );

      }


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.error ||
          "Failed to load practice exam."
        );

      }


      let receivedQuestions =
        data.questions || [];


      if (!receivedQuestions.length) {

        loading.classList.add("hidden");

        empty.classList.remove("hidden");

        return;

      }


      /*
        SHUFFLE

        Practice exam is the shuffled
        version of the past questions.
      */

      questions =
        shuffle(
          receivedQuestions
        );


      /*
        If the backend returns more than
        the requested amount, keep only
        the exam amount.
      */

      questions =
        questions.slice(
          0,
          EXAM_QUESTION_COUNT
        );


      answers =
        new Array(
          questions.length
        ).fill(null);


      loading.classList.add("hidden");

      exam.classList.remove("hidden");


      renderQuestion();

    } catch (err) {

      loading.classList.add("hidden");

      error.textContent =
        err.message ||
        "Failed to load practice exam.";

      error.classList.remove("hidden");

    }

  }


  /* =========================
     SHUFFLE
  ========================= */

  function shuffle(array) {

    const copy =
      [...array];


    for (
      let i = copy.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(
          Math.random() *
          (i + 1)
        );


      [
        copy[i],
        copy[j]
      ] =
      [
        copy[j],
        copy[i]
      ];

    }


    return copy;

  }


  /* =========================
     GET QUESTION TIME
  ========================= */

  function getQuestionTime(item) {

    /*
      Future upload column.

      The code accepts several names
      so we can change the database
      naming later without rewriting
      the whole exam.
    */

    const value =
      item.time_limit ??
      item.time_limit_seconds ??
      item.question_time ??
      null;


    if (value === null) {

      return DEFAULT_QUESTION_TIME;

    }


    const seconds =
      Number(value);


    if (
      !Number.isFinite(seconds) ||
      seconds <= 0
    ) {

      return DEFAULT_QUESTION_TIME;

    }


    return seconds;

  }


  /* =========================
     RENDER QUESTION
  ========================= */

  function renderQuestion() {

    clearTimer();


    const item =
      questions[currentIndex];


    if (!item) {

      finishExam();

      return;

    }


    question.textContent =
      item.question || "";


    difficulty.textContent =
      item.difficulty ||
      "General";


    topic.textContent =
      item.topic ||
      "";


    options.innerHTML =
      "";


    const itemOptions =
      Array.isArray(item.options)
        ? item.options
        : [];


    itemOptions.forEach(
      (optionText, index) => {

        const button =
          document.createElement("button");


        button.className =
          "option";


        const label =
          document.createElement("span");


        label.className =
          "option-label";


        label.textContent =
          String.fromCharCode(
            65 + index
          ) + ".";


        const text =
          document.createElement("span");


        text.textContent =
          optionText;


        button.appendChild(label);

        button.appendChild(text);


        /*
          Restore previously selected
          answer when going backwards.
        */

        if (
          answers[currentIndex] ===
          optionText
        ) {

          button.classList.add(
            "selected"
          );

        }


        button.addEventListener(
          "click",
          () => {

            selectAnswer(
              optionText
            );

          }
        );


        options.appendChild(button);

      }
    );


    previousBtn.disabled =
      currentIndex === 0;


    if (
      currentIndex ===
      questions.length - 1
    ) {

      nextBtn.textContent =
        "Finish";

    } else {

      nextBtn.textContent =
        "Next";

    }


    updateProgress();


    startQuestionTimer(item);

  }


  /* =========================
     SELECT ANSWER
  ========================= */

  function selectAnswer(answer) {

    answers[currentIndex] =
      answer;


    const buttons =
      options.querySelectorAll(
        ".option"
      );


    buttons.forEach(button => {

      const buttonText =
        button
          .querySelector(
            "span:last-child"
          )
          ?.textContent;


      if (
        buttonText === answer
      ) {

        button.classList.add(
          "selected"
        );

      } else {

        button.classList.remove(
          "selected"
        );

      }

    });


    updateProgress();

  }


  /* =========================
     PROGRESS
  ========================= */

  function updateProgress() {

    const total =
      questions.length;


    const current =
      currentIndex + 1;


    questionNumber.textContent =
      `Question ${current} of ${total}`;


    const answered =
      answers.filter(
        answer =>
          answer !== null
      ).length;


    answeredCount.textContent =
      `${answered} answered`;


    const percentage =
      total
        ? (current / total) * 100
        : 0;


    progressFill.style.width =
      `${percentage}%`;

  }


  /* =========================
     QUESTION TIMER
  ========================= */

  function startQuestionTimer(item) {

    remainingSeconds =
      getQuestionTime(item);


    updateTimer();


    questionTime.textContent =
      `Time for this question: ${formatTime(remainingSeconds)}`;


    questionTimer =
      setInterval(
        () => {

          remainingSeconds--;

          updateTimer();


          questionTime.textContent =
            `Time for this question: ${formatTime(
              Math.max(
                remainingSeconds,
                0
              )
            )}`;


          if (
            remainingSeconds <= 0
          ) {

            clearTimer();


            /*
              Automatically move on
              when question time ends.
            */

            goNext();

          }

        },
        1000
      );

  }


  /* =========================
     TIMER DISPLAY
  ========================= */

  function updateTimer() {

    timer.textContent =
      formatTime(
        Math.max(
          remainingSeconds,
          0
        )
      );

  }


  function formatTime(seconds) {

    const mins =
      Math.floor(
        seconds / 60
      );


    const secs =
      seconds % 60;


    return (
      String(mins).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );

  }


  /* =========================
     CLEAR TIMER
  ========================= */

  function clearTimer() {

    if (questionTimer) {

      clearInterval(
        questionTimer
      );

      questionTimer =
        null;

    }

  }


  /* =========================
     NEXT
  ========================= */

  function goNext() {

    clearTimer();


    if (
      currentIndex <
      questions.length - 1
    ) {

      currentIndex++;

      renderQuestion();

    } else {

      finishExam();

    }

  }


  /* =========================
     PREVIOUS
  ========================= */

  function goPrevious() {

    if (
      currentIndex <= 0
    ) {

      return;

    }


    clearTimer();


    currentIndex--;

    renderQuestion();

  }


  /* =========================
     NAVIGATION EVENTS
  ========================= */

  nextBtn.addEventListener(
    "click",
    () => {

      goNext();

    }
  );


  previousBtn.addEventListener(
    "click",
    () => {

      goPrevious();

    }
  );


  /* =========================
     FINISH EXAM
  ========================= */

  function finishExam() {

    if (examFinished) {

      return;

    }


    examFinished = true;


    clearTimer();


    let correct = 0;

    let wrong = 0;

    let unanswered = 0;


    questions.forEach(
      (item, index) => {

        const userAnswer =
          answers[index];


        if (
          userAnswer === null
        ) {

          unanswered++;

          return;

        }


        if (
          String(userAnswer).trim() ===
          String(item.answer).trim()
        ) {

          correct++;

        } else {

          wrong++;

        }

      }
    );


    const total =
      questions.length;


    const percentage =
      total
        ? Math.round(
            (correct / total) *
            100
          )
        : 0;


    exam.classList.add(
      "hidden"
    );


    result.classList.remove(
      "hidden"
    );


    document.getElementById(
      "result-course"
    ).textContent =
      `${studyingUni} • ${studying}`;


    document.getElementById(
      "score"
    ).textContent =
      `${correct} / ${total}`;


    document.getElementById(
      "percentage"
    ).textContent =
      `${percentage}%`;


    document.getElementById(
      "correct"
    ).textContent =
      correct;


    document.getElementById(
      "wrong"
    ).textContent =
      wrong;


    document.getElementById(
      "unanswered"
    ).textContent =
      unanswered;

  }


  /* =========================
     RESTART
  ========================= */

  restartBtn.addEventListener(
    "click",
    () => {

      location.reload();

    }
  );


  /* =========================
     START
  ========================= */

  loadExam();

});