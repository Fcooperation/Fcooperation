document.addEventListener(
  "DOMContentLoaded",
  () => {

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

    const container =
      document.getElementById(
        "question-container"
      );

    const navigation =
      document.getElementById(
        "navigation"
      );

    const counter =
      document.getElementById(
        "question-counter"
      );

    const prevBtn =
      document.getElementById(
        "prev-btn"
      );

    const nextBtn =
      document.getElementById(
        "next-btn"
      );

    const backBtn =
      document.getElementById(
        "back-btn"
      );


    /* =========================
       GET SAVED DATA
    ========================= */

    const university =
      localStorage.getItem(
        "past_question_university"
      );

    const course =
      localStorage.getItem(
        "past_question_course"
      );

    const year =
      localStorage.getItem(
        "past_question_year"
      );

    const savedQuestions =
      localStorage.getItem(
        "past_question_data"
      );


    /* =========================
       SAFETY
    ========================= */

    if (
      !university ||
      !course ||
      !year ||
      !savedQuestions
    ) {

      loading.classList.add(
        "hidden"
      );

      error.textContent =
        "No past question was selected.";

      error.classList.remove(
        "hidden"
      );

      return;

    }


    /* =========================
       PARSE QUESTIONS
    ========================= */

    let questions;

    try {

      questions =
        JSON.parse(
          savedQuestions
        );

    } catch (err) {

      loading.classList.add(
        "hidden"
      );

      error.textContent =
        "Unable to read saved questions.";

      error.classList.remove(
        "hidden"
      );

      return;

    }


    if (
      !Array.isArray(questions) ||
      !questions.length
    ) {

      loading.classList.add(
        "hidden"
      );

      empty.classList.remove(
        "hidden"
      );

      return;

    }


    /* =========================
       PAGE INFO
    ========================= */

    title.textContent =
      "Past Questions";

    subtitle.textContent =
      `${university} • ${course} • ${year}`;


    /* =========================
       STATE
    ========================= */

    let currentIndex = 0;


    /* =========================
       RENDER QUESTION
    ========================= */

    function renderQuestion() {

      const item =
        questions[currentIndex];


      if (!item) {
        return;
      }


      container.innerHTML = "";


      /* =========================
         CARD
      ========================= */

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "question-card";


      /* =========================
         HEADER
      ========================= */

      const questionHeader =
        document.createElement(
          "div"
        );

      questionHeader.className =
        "question-header";


      const instructor =
        document.createElement(
          "div"
        );

      instructor.className =
        "instructor";

      instructor.textContent =
        item.instructor ||
        "FCOOPERATION";


      const number =
        document.createElement(
          "div"
        );

      number.className =
        "question-number";

      number.textContent =
        `Question ${
          item.question_number ||
          currentIndex + 1
        }`;


      questionHeader.appendChild(
        instructor
      );

      questionHeader.appendChild(
        number
      );


      /* =========================
         QUESTION TEXT
      ========================= */

      const question =
        document.createElement(
          "p"
        );

      question.className =
        "question-text";

      question.textContent =
        item.question || "";


      /* =========================
         OPTIONS
      ========================= */

      const optionsContainer =
        document.createElement(
          "div"
        );

      optionsContainer.className =
        "options";


      const options =
        Array.isArray(item.options)
          ? item.options
          : [];


      const optionLetters =
        [
          "A",
          "B",
          "C",
          "D",
          "E",
          "F"
        ];


      options.forEach(
        (option, index) => {

          const optionElement =
            document.createElement(
              "div"
            );

          optionElement.className =
            "option";


          const label =
            document.createElement(
              "span"
            );

          label.className =
            "option-label";

          label.textContent =
            `${optionLetters[index] || ""}.`;


          const text =
            document.createElement(
              "span"
            );

          text.textContent =
            option;


          optionElement.appendChild(
            label
          );

          optionElement.appendChild(
            text
          );


          optionsContainer.appendChild(
            optionElement
          );

        }
      );


      /* =========================
         ANSWER
      ========================= */

      const answerSection =
        document.createElement(
          "div"
        );

      answerSection.className =
        "answer-section";


      const answerTitle =
        document.createElement(
          "div"
        );

      answerTitle.className =
        "answer-title";

      answerTitle.textContent =
        "Answer";


      const answer =
        document.createElement(
          "div"
        );

      answer.className =
        "answer";

      answer.textContent =
        item.answer ||
        "Answer not provided";


      answerSection.appendChild(
        answerTitle
      );

      answerSection.appendChild(
        answer
      );


      /* =========================
         EXPLANATION
      ========================= */

      if (item.explanation) {

        const explanationSection =
          document.createElement(
            "div"
          );

        explanationSection.className =
          "explanation-section";


        const explanationTitle =
          document.createElement(
            "div"
          );

        explanationTitle.className =
          "section-title";

        explanationTitle.textContent =
          "Explanation";


        const explanation =
          document.createElement(
            "p"
          );

        explanation.className =
          "explanation";

        explanation.textContent =
          item.explanation;


        explanationSection.appendChild(
          explanationTitle
        );

        explanationSection.appendChild(
          explanation
        );


        card.appendChild(
          explanationSection
        );

      }


      /* =========================
         FORMULA
      ========================= */

      if (item.formula) {

        const formulaSection =
          document.createElement(
            "div"
          );

        formulaSection.className =
          "formula-section";


        const formulaTitle =
          document.createElement(
            "div"
          );

        formulaTitle.className =
          "section-title";

        formulaTitle.textContent =
          "Formula";


        const formula =
          document.createElement(
            "p"
          );

        formula.className =
          "formula";

        formula.textContent =
          item.formula;


        formulaSection.appendChild(
          formulaTitle
        );

        formulaSection.appendChild(
          formula
        );


        card.appendChild(
          formulaSection
        );

      }


      /* =========================
         BUILD CARD
      ========================= */

      card.insertBefore(
        questionHeader,
        card.firstChild
      );

      card.appendChild(
        question
      );

      if (options.length) {

        card.appendChild(
          optionsContainer
        );

      }

      card.appendChild(
        answerSection
      );


      container.appendChild(
        card
      );


      /* =========================
         UPDATE UI
      ========================= */

      counter.textContent =
        `${currentIndex + 1} / ${questions.length}`;


      prevBtn.disabled =
        currentIndex === 0;


      nextBtn.disabled =
        currentIndex ===
        questions.length - 1;


      loading.classList.add(
        "hidden"
      );

      container.classList.remove(
        "hidden"
      );

      navigation.classList.remove(
        "hidden"
      );

    }


    /* =========================
       PREVIOUS
    ========================= */

    prevBtn.addEventListener(
      "click",
      () => {

        if (
          currentIndex > 0
        ) {

          currentIndex--;

          renderQuestion();

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        }

      }
    );


    /* =========================
       NEXT
    ========================= */

    nextBtn.addEventListener(
      "click",
      () => {

        if (
          currentIndex <
          questions.length - 1
        ) {

          currentIndex++;

          renderQuestion();

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        }

      }
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
       START
    ========================= */

    renderQuestion();

  }
);