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


          /* =========================
             TOP AREA
          ========================= */

          const sectionTop =
            document.createElement(
              "div"
            );

          sectionTop.className =
            "section-top";


          const sectionHeading =
            document.createElement(
              "div"
            );

          sectionHeading.className =
            "section-heading";


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


          sectionHeading.appendChild(
            number
          );

          sectionHeading.appendChild(
            heading
          );


          /* =========================
             ASK FAI BUTTON
          ========================= */

          const askFaiBtn =
            document.createElement(
              "button"
            );

          askFaiBtn.type =
            "button";

          askFaiBtn.className =
            "ask-fai-btn";

          askFaiBtn.textContent =
            "Ask FAI";


          sectionTop.appendChild(
            sectionHeading
          );

          sectionTop.appendChild(
            askFaiBtn
          );


          /* =========================
             CONTENT
          ========================= */

          const content =
            document.createElement(
              "div"
            );

          content.className =
            "section-content";

          content.textContent =
            section.content ||
            "";


          /* =========================
             FAI MENU
          ========================= */

          const faiMenu =
            document.createElement(
              "div"
            );

          faiMenu.className =
            "fai-menu hidden";

/* =========================
   FAI CANCEL BUTTON
========================= */

const cancelFaiBtn =
  document.createElement(
    "button"
  );

cancelFaiBtn.type =
  "button";

cancelFaiBtn.className =
  "fai-cancel-btn";

cancelFaiBtn.textContent =
  "Cancel";

faiMenu.appendChild(
  cancelFaiBtn
);

          const faiActions =
            document.createElement(
              "div"
            );

          faiActions.className =
            "fai-actions";


          /* SUMMARIZE */

          const summarizeBtn =
            document.createElement(
              "button"
            );

          summarizeBtn.type =
            "button";

          summarizeBtn.className =
            "fai-action";

          summarizeBtn.textContent =
            "Summarize";


          /* QUIZ ME */

          const quizBtn =
            document.createElement(
              "button"
            );

          quizBtn.type =
            "button";

          quizBtn.className =
            "fai-action";

          quizBtn.textContent =
            "Quiz Me";


          /* ASK FAI */

          const askQuestionBtn =
            document.createElement(
              "button"
            );

          askQuestionBtn.type =
            "button";

          askQuestionBtn.className =
            "fai-action";

          askQuestionBtn.textContent =
            "Ask FAI";


          faiActions.appendChild(
            summarizeBtn
          );

          faiActions.appendChild(
            quizBtn
          );

          faiActions.appendChild(
            askQuestionBtn
          );


          faiMenu.appendChild(
            faiActions
          );


          /* =========================
             ASK FAI TOGGLE
          ========================= */

          askFaiBtn.addEventListener(
  "click",
  () => {

    const isOpening =
      faiMenu.classList.contains(
        "hidden"
      );


    faiMenu.classList.toggle(
      "hidden"
    );


    if (isOpening) {

      setTimeout(() => {

        faiMenu.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });

      }, 50);

    }

  }
);

/* =========================
   FAI CANCEL
========================= */

cancelFaiBtn.addEventListener(
  "click",
  () => {

    /* Remove FAI output */
    faiMenu.querySelectorAll(
  ".fai-summary, .fai-loading, .fai-error, .fai-quiz"
)
      .forEach(
        element => element.remove()
      );


    /* Restore action buttons */
    faiActions.classList.remove(
      "hidden"
    );


    /* Close menu */
    faiMenu.classList.add(
      "hidden"
    );

  }
);

          /* =========================
             SUMMARIZE
          ========================= */

          summarizeBtn.addEventListener(
            "click",
            async () => {

              await summarizeSection(
                section,
                faiMenu,
                faiActions,
                summarizeBtn
              );

            }
          );


          /* =========================
             FUTURE FEATURES
          ========================= */

          quizBtn.addEventListener(
  "click",
  async () => {

    await quizSection(
      section,
      faiMenu,
      faiActions,
      quizBtn
    );

  }
);


          askQuestionBtn.addEventListener(
            "click",
            () => {

              // Coming next

            }
          );


          /* =========================
             APPEND
          ========================= */

          sectionElement.appendChild(
            sectionTop
          );

          sectionElement.appendChild(
            content
          );

          sectionElement.appendChild(
            faiMenu
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
   MARKDOWN TO HTML
========================= */

function renderMarkdown(text) {

  if (!text) return "";

  let html = text;

  /* Escape HTML first */
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");


  /* =========================
     HEADINGS
  ========================= */

  html = html.replace(
    /^#### (.*)$/gm,
    "<h4>$1</h4>"
  );

  html = html.replace(
    /^### (.*)$/gm,
    "<h3>$1</h3>"
  );

  html = html.replace(
    /^## (.*)$/gm,
    "<h2>$1</h2>"
  );

  html = html.replace(
    /^# (.*)$/gm,
    "<h1>$1</h1>"
  );


  /* =========================
     BOLD
  ========================= */

  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );


  /* =========================
     ITALIC
  ========================= */

  html = html.replace(
    /\*(.*?)\*/g,
    "<em>$1</em>"
  );


  /* =========================
     BULLET POINTS
  ========================= */

  html = html.replace(
    /^[-•] (.*)$/gm,
    "<li>$1</li>"
  );


  /* =========================
     GROUP LIST ITEMS
  ========================= */

  html = html.replace(
    /(<li>.*?<\/li>\n?)+/g,
    match => `<ul>${match}</ul>`
  );


  /* =========================
     LINE BREAKS
  ========================= */

  html = html.replace(
    /\n/g,
    "<br>"
  );


  return html;

}

/* =========================
   SUMMARIZE SECTION
========================= */

async function summarizeSection(
  section,
  faiMenu,
  faiActions,
  summarizeBtn
) {

  const sectionContent =
    section.content || "";


  if (!sectionContent.trim()) {
    return;
  }


  /* =========================
     HIDE BUTTONS
  ========================= */

  faiActions.classList.add(
    "hidden"
  );


  /* =========================
     LOADING
  ========================= */

  const loadingText =
    document.createElement(
      "p"
    );

  loadingText.className =
    "fai-loading";

  loadingText.textContent =
    "FAI is summarizing...";


  faiMenu.appendChild(
    loadingText
  );


  /* =========================
     AUTO SCROLL
  ========================= */

  setTimeout(() => {

    faiMenu.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }, 50);


  try {

    /* =========================
       SEND TO FAI
    ========================= */

    const response =
      await fetch(
        window.CONFIG.API_URL +
        "/fai",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              prompt:
                `Summarize the following FSTUDY note section clearly for a student.

Keep the important concepts, definitions, facts, examples, and relationships.

Do not leave out important academic information.

Do not introduce information that is not present in the section.

Section title:
${section.title || "Untitled Section"}

Section content:
${sectionContent}`,

              source:
                "fstudy",

              university:
                university,

              course:
                course,

              topic:
                topic,

              section_title:
                section.title || ""

            })

        }
      );


    if (!response.ok) {

      throw new Error(
        "FAI request failed."
      );

    }


    /* =========================
       READ SSE STREAM
    ========================= */

    if (!response.body) {

      throw new Error(
        "FAI did not return a readable response."
      );

    }


    const reader =
      response.body.getReader();


    const decoder =
      new TextDecoder();


    let buffer = "";

    let summary = "";


    while (true) {

      const {
        value,
        done
      } =
        await reader.read();


      if (done) {
        break;
      }


      buffer +=
        decoder.decode(
          value,
          {
            stream: true
          }
        );


      const events =
        buffer.split("\n\n");


      buffer =
        events.pop() || "";


      for (
        const eventText
        of events
      ) {

        const lines =
          eventText.split("\n");


        for (
          const line
          of lines
        ) {

          if (
            !line.startsWith("data:")
          ) {
            continue;
          }


          const jsonText =
            line
              .replace(
                /^data:\s*/,
                ""
              )
              .trim();


          if (!jsonText) {
            continue;
          }


          try {

            const event =
              JSON.parse(
                jsonText
              );


            /* =========================
               CHUNK
            ========================= */

            if (
              event.type ===
              "chunk"
            ) {

              summary +=
                event.text || "";

            }


            /* =========================
               ERROR
            ========================= */

            if (
              event.type ===
              "error"
            ) {

              throw new Error(
                event.message ||
                "FAI failed to summarize this section."
              );

            }

          } catch (parseError) {

            /*
              Ignore incomplete SSE
              fragments.
            */

            if (
              parseError.message &&
              !parseError.message.includes(
                "Unexpected"
              )
            ) {

              throw parseError;

            }

          }

        }

      }

    }


    /* =========================
       REMOVE LOADING
    ========================= */

    loadingText.remove();


    if (!summary.trim()) {

      throw new Error(
        "FAI returned an empty response."
      );

    }


    /* =========================
       SHOW SUMMARY
    ========================= */

    const summaryElement =
  document.createElement(
    "div"
  );

summaryElement.className =
  "fai-summary";

summaryElement.innerHTML =
  renderMarkdown(
    summary.trim()
  );

faiMenu.appendChild(
  summaryElement
);


    /* =========================
       SCROLL TO SUMMARY
    ========================= */

    setTimeout(() => {

      faiMenu.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);


  } catch (err) {

    loadingText.remove();


    const errorElement =
      document.createElement(
        "p"
      );

    errorElement.className =
      "fai-error";

    errorElement.textContent =
      err.message ||
      "Failed to summarize section.";


    faiMenu.appendChild(
      errorElement
    );


    /* =========================
       ALLOW RETRY
    ========================= */

    faiActions.classList.remove(
      "hidden"
    );


    setTimeout(() => {

      faiMenu.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);

  }

}

/* =========================
   QUIZ SECTION
========================= */

async function quizSection(
  section,
  faiMenu,
  faiActions,
  quizBtn
) {

  const sectionContent =
    section.content || "";


  if (!sectionContent.trim()) {
    return;
  }


  /* =========================
     HIDE BUTTONS
  ========================= */

  faiActions.classList.add(
    "hidden"
  );


  /* =========================
     LOADING
  ========================= */

  const loadingText =
    document.createElement(
      "p"
    );

  loadingText.className =
    "fai-loading";

  loadingText.textContent =
    "FAI is preparing your quiz...";


  faiMenu.appendChild(
    loadingText
  );


  setTimeout(() => {

    faiMenu.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }, 50);


  try {

    /* =========================
       SEND TO FAI
    ========================= */

    const response =
      await fetch(
        window.CONFIG.API_URL +
        "/fai",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              prompt:
                `You are generating a quiz for a student using ONLY the provided FSTUDY section.

Generate exactly 5 multiple-choice questions.

STRICT RULES:

1. Use ONLY information contained in the provided section.
2. Do not introduce outside information.
3. Every question must have exactly 4 options.
4. Only one option may be correct.
5. Questions should test understanding, not just randomly copy sentences.
6. Provide the correct answer as a zero-based option index.
7. Provide a short explanation for the correct answer.
8. Return ONLY valid JSON.
9. Do not use Markdown.
10. Do not wrap the JSON in code blocks.
11. Do not write anything before or after the JSON.
12. The response must begin with { and end with }.
13. The JSON must follow this exact structure:

{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correct_answer": 0,
      "explanation": "Explanation"
    }
  ]
}

FSTUDY SECTION:

Section title:
${section.title || "Untitled Section"}

Section content:
${sectionContent}`,

              source:
                "fstudy",

              university:
                university,

              course:
                course,

              topic:
                topic,

              section_title:
                section.title || ""

            })

        }
      );


    if (!response.ok) {

      throw new Error(
        "FAI quiz request failed."
      );

    }


    /* =========================
       READ SSE STREAM
    ========================= */

    if (!response.body) {

      throw new Error(
        "FAI did not return a readable response."
      );

    }


    const reader =
      response.body.getReader();


    const decoder =
      new TextDecoder();


    let buffer = "";

    let quizText = "";


    while (true) {

      const {
        value,
        done
      } =
        await reader.read();


      if (done) {
        break;
      }


      buffer +=
        decoder.decode(
          value,
          {
            stream: true
          }
        );


      const events =
        buffer.split("\n\n");


      buffer =
        events.pop() || "";


      for (
        const eventText
        of events
      ) {

        const lines =
          eventText.split("\n");


        for (
          const line
          of lines
        ) {

          if (
            !line.startsWith("data:")
          ) {
            continue;
          }


          const jsonText =
            line
              .replace(
                /^data:\s*/,
                ""
              )
              .trim();


          if (!jsonText) {
            continue;
          }


          try {

            const event =
              JSON.parse(
                jsonText
              );


            if (
              event.type ===
              "chunk"
            ) {

              quizText +=
                event.text || "";

            }


            if (
              event.type ===
              "error"
            ) {

              throw new Error(
                event.message ||
                "FAI failed to create the quiz."
              );

            }

          } catch (parseError) {

            if (
              parseError.message &&
              !parseError.message.includes(
                "Unexpected"
              )
            ) {

              throw parseError;

            }

          }

        }

      }

    }


    loadingText.remove();


    if (!quizText.trim()) {

      throw new Error(
        "FAI returned an empty quiz."
      );

    }


    /* =========================
       PARSE QUIZ JSON
    ========================= */

    let quizData;

    try {

      quizData =
        JSON.parse(
          quizText.trim()
        );

    } catch {

      throw new Error(
        "FAI returned invalid quiz data."
      );

    }


    /* =========================
       VALIDATE QUIZ
    ========================= */

    if (
      !quizData.questions ||
      !Array.isArray(
        quizData.questions
      ) ||
      quizData.questions.length !== 5
    ) {

      throw new Error(
        "FAI returned an invalid quiz."
      );

    }


    quizData.questions.forEach(
      question => {

        if (
          !question.question ||
          !Array.isArray(
            question.options
          ) ||
          question.options.length !== 4 ||
          typeof question.correct_answer !==
            "number" ||
          question.correct_answer < 0 ||
          question.correct_answer > 3
        ) {

          throw new Error(
            "FAI returned an invalid question."
          );

        }

      }
    );


    /* =========================
       SHOW QUIZ
    ========================= */

    renderQuiz(
      quizData,
      faiMenu
    );


  } catch (err) {

    loadingText.remove();


    const errorElement =
      document.createElement(
        "p"
      );

    errorElement.className =
      "fai-error";

    errorElement.textContent =
      err.message ||
      "Failed to create quiz.";


    faiMenu.appendChild(
      errorElement
    );


    faiActions.classList.remove(
      "hidden"
    );


    setTimeout(() => {

      faiMenu.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);

  }

}

/* =========================
   RENDER QUIZ
========================= */

function renderQuiz(
  quizData,
  faiMenu
) {

  const questions =
    quizData.questions;


  let currentQuestion =
    0;

  const answers =
    new Array(
      questions.length
    ).fill(null);


  /* =========================
     QUIZ CONTAINER
  ========================= */

  const quizElement =
    document.createElement(
      "div"
    );

  quizElement.className =
    "fai-quiz";


  faiMenu.appendChild(
    quizElement
  );


  function renderQuestion() {

    quizElement.innerHTML =
      "";


    const question =
      questions[
        currentQuestion
      ];


    /* =========================
       PROGRESS
    ========================= */

    const progress =
      document.createElement(
        "div"
      );

    progress.className =
      "quiz-progress";

    progress.textContent =
      `Question ${currentQuestion + 1} of ${questions.length}`;


    quizElement.appendChild(
      progress
    );


    /* =========================
       QUESTION
    ========================= */

    const questionText =
      document.createElement(
        "div"
      );

    questionText.className =
      "quiz-question";

    questionText.textContent =
      question.question;


    quizElement.appendChild(
      questionText
    );


    /* =========================
       OPTIONS
    ========================= */

    const options =
      document.createElement(
        "div"
      );

    options.className =
      "quiz-options";


    question.options.forEach(
      (optionText, index) => {

        const option =
          document.createElement(
            "button"
          );

        option.type =
          "button";

        option.className =
          "quiz-option";

        option.textContent =
          optionText;


        if (
          answers[
            currentQuestion
          ] === index
        ) {

          option.classList.add(
            "selected"
          );

        }


        option.addEventListener(
          "click",
          () => {

            answers[
              currentQuestion
            ] = index;


            renderQuestion();

          }
        );


        options.appendChild(
          option
        );

      }
    );


    quizElement.appendChild(
      options
    );


    /* =========================
       NAVIGATION
    ========================= */

    const navigation =
      document.createElement(
        "div"
      );

    navigation.className =
      "quiz-navigation";


    if (
      currentQuestion <
      questions.length - 1
    ) {

      const nextBtn =
        document.createElement(
          "button"
        );

      nextBtn.type =
        "button";

      nextBtn.className =
        "quiz-next-btn";

      nextBtn.textContent =
        "Next";


      nextBtn.addEventListener(
        "click",
        () => {

          if (
            answers[
              currentQuestion
            ] === null
          ) {

            return;

          }


          currentQuestion++;

          renderQuestion();

        }
      );


      navigation.appendChild(
        nextBtn
      );

    } else {

      const submitBtn =
        document.createElement(
          "button"
        );

      submitBtn.type =
        "button";

      submitBtn.className =
        "quiz-submit-btn";

      submitBtn.textContent =
        "Submit Quiz";


      submitBtn.addEventListener(
        "click",
        () => {

          if (
            answers.includes(
              null
            )
          ) {

            return;

          }


          submitQuiz();

        }
      );


      navigation.appendChild(
        submitBtn
      );

    }


    quizElement.appendChild(
      navigation
    );


    setTimeout(() => {

      faiMenu.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 50);

  }


  /* =========================
     SUBMIT QUIZ
  ========================= */

  function submitQuiz() {

    let score = 0;


    questions.forEach(
      (question, index) => {

        if (
          answers[index] ===
          question.correct_answer
        ) {

          score++;

        }

      }
    );


    renderQuizResults(
      questions,
      answers,
      score,
      quizElement
    );

  }


  renderQuestion();

}

/* =========================
   QUIZ RESULTS
========================= */

function renderQuizResults(
  questions,
  answers,
  score,
  quizElement
) {

  quizElement.innerHTML =
    "";


  /* =========================
     SCORE
  ========================= */

  const scoreElement =
    document.createElement(
      "div"
    );

  scoreElement.className =
    "quiz-score";

  scoreElement.textContent =
    `You scored ${score} / ${questions.length}`;


  quizElement.appendChild(
    scoreElement
  );


  /* =========================
     CORRECTIONS
  ========================= */

  questions.forEach(
    (question, index) => {

      const correction =
        document.createElement(
          "div"
        );

      correction.className =
        "quiz-correction";


      const questionTitle =
        document.createElement(
          "div"
        );

      questionTitle.className =
        "correction-question";

      questionTitle.textContent =
        `${index + 1}. ${question.question}`;


      correction.appendChild(
        questionTitle
      );


      const selected =
        answers[index];


      const correct =
        question.correct_answer;


      const result =
        document.createElement(
          "div"
        );

      result.className =
        selected === correct
          ? "correction-result correct"
          : "correction-result wrong";


      if (
        selected === correct
      ) {

        result.textContent =
          "✓ Correct";

      } else {

        result.textContent =
          "✗ Incorrect";

      }


      correction.appendChild(
        result
      );


      const answer =
        document.createElement(
          "div"
        );

      answer.className =
        "correct-answer";


      answer.textContent =
        `Correct answer: ${question.options[correct]}`;


      correction.appendChild(
        answer
      );


      if (
        selected !== correct
      ) {

        const yourAnswer =
          document.createElement(
            "div"
          );

        yourAnswer.className =
          "your-answer";


        yourAnswer.textContent =
          `Your answer: ${question.options[selected]}`;


        correction.appendChild(
          yourAnswer
        );

      }


      const explanation =
        document.createElement(
          "div"
        );

      explanation.className =
        "quiz-explanation";

      explanation.textContent =
        question.explanation;


      correction.appendChild(
        explanation
      );


      quizElement.appendChild(
        correction
      );

    }
  );


  setTimeout(() => {

    quizElement.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });

  }, 50);

}

    /* =========================
       START
    ========================= */

    loadNote();

  }
);