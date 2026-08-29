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

const viewCorrectionsBtn =
  document.getElementById(
    "view-corrections-btn"
  );
  
const submitBtn =
  document.getElementById("submit-btn");

const submitModal =
  document.getElementById("submit-modal");

const submitSummary =
  document.getElementById("submit-summary");

const cancelSubmit =
  document.getElementById("cancel-submit");

const confirmSubmit =
  document.getElementById("confirm-submit");

  /* =========================
     LOCAL STORAGE
  ========================= */

  const studyingUni =
    localStorage.getItem("studying_uni");

  const studying =
    localStorage.getItem("studying");

  /* =========================
     STATE
  ========================= */

  let questions = [];

  let currentIndex = 0;

  let answers = [];

  let questionTimer = null;

  let remainingSeconds = 0;
let examQuestionCount = 0;
let examTimeLimit = 0;

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
    studying

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

examQuestionCount =
  Number(data.exam_question_count) || 35;

examTimeLimit =
  Number(data.exam_time_limit) || 25;

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
    examQuestionCount
  );


      answers =
        new Array(
          questions.length
        ).fill(null);


      loading.classList.add("hidden");

      exam.classList.remove("hidden");


      startExamTimer();

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
     RENDER QUESTION
  ========================= */

  function renderQuestion() {

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
   EXAM TIMER
========================= */

function startExamTimer() {

  remainingSeconds =
    examTimeLimit * 60;

  updateTimer();

  questionTime.textContent =
    `Exam time: ${formatTime(remainingSeconds)}`;

  questionTimer =
    setInterval(
      () => {

        remainingSeconds--;

        updateTimer();

        questionTime.textContent =
          `Exam time: ${formatTime(
            Math.max(
              remainingSeconds,
              0
            )
          )}`;

        if (
          remainingSeconds <= 0
        ) {

          clearTimer();

          finishExam();

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
   SUBMIT CONFIRMATION
========================= */

function openSubmitModal() {

  const answered =
    answers.filter(
      answer => answer !== null
    ).length;

  const unanswered =
    questions.length - answered;

  submitSummary.textContent =
    `You have answered ${answered} of ${questions.length} questions. ` +
    `${unanswered} question${unanswered === 1 ? "" : "s"} unanswered.`;

  submitModal.classList.remove("hidden");

}


function closeSubmitModal() {

  submitModal.classList.add("hidden");

}

submitBtn.addEventListener(
  "click",
  () => {

    if (examFinished) {
      return;
    }

    openSubmitModal();

  }
);


cancelSubmit.addEventListener(
  "click",
  () => {

    closeSubmitModal();

  }
);


confirmSubmit.addEventListener(
  "click",
  () => {

    closeSubmitModal();

    finishExam();

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

let review = [];


    questions.forEach(
  (item, index) => {

    const userAnswer =
      answers[index];

    review.push({
      question:
        item.question || "",

      options:
        Array.isArray(item.options)
          ? item.options
          : [],

      correct:
        item.answer || "",

      selected:
        userAnswer,

      explanation:
        item.explanation ||
        "No explanation available."
    });


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

localStorage.setItem(
  "quizResult",
  JSON.stringify({
    review: review,
    score: correct,
    total: questions.length,
    percentage: percentage,
    course: studying,
    university: studyingUni,
    source: "practice-exam",
    timestamp: Date.now()
  })
);

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

// View Correction button
viewCorrectionsBtn.addEventListener(
  "click",
  () => {

    window.location.href =
      "/explanations";

  }
);

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