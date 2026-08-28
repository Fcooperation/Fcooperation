document.addEventListener("DOMContentLoaded", () => {

  const search = document.getElementById("search");
  const courseList = document.getElementById("course-list");
  const title = document.getElementById("title");

  const studyingUni =
    localStorage.getItem("studying_uni");

  let courses = [];
  let openCourse = null;


  // -------------------------
  // SAFETY
  // -------------------------

  if (!studyingUni) {

    title.textContent = "No university selected";

    return;
  }


  // -------------------------
  // SHOW UNIVERSITY
  // -------------------------

  title.textContent = studyingUni;


  // -------------------------
  // GET COURSES
  // -------------------------

  async function getCourses() {

    try {

      const response = await fetch(
        window.CONFIG.API_URL + "/admin",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            action: "get_courses",
            university: studyingUni
          })
        }
      );


      if (!response.ok) {
        throw new Error("Failed to get courses");
      }


      const data =
        await response.json();


      if (!data.success) {

        throw new Error(
          data.error || "Failed to get courses"
        );

      }


      courses = data.courses || [];


      renderCourses(courses);


    } catch (error) {

      console.error(error);

      courseList.innerHTML = `
        <div style="
          text-align:center;
          color:red;
          padding:20px;
        ">
          Failed to load courses.
        </div>
      `;

    }

  }


  // -------------------------
  // RENDER COURSES
  // -------------------------

  function renderCourses(list) {

    courseList.innerHTML = "";

    openCourse = null;


    list.forEach(code => {

      const course =
        document.createElement("div");

      course.className = "course";

      course.dataset.code = code;

      course.innerHTML = `
        ${code}

        <div class="dropdown">

       <div
  class="item quiz"
  data-code="${code}"
>
  Practice Quiz
</div>

<div
  class="item past-questions"
  data-code="${code}"
>
  Past Questions
</div>

<div
  class="item practice-exam"
  data-code="${code}"
>
  Practice Exam
</div>

<div
  class="item tutorial"
  data-code="${code}"
>
  Tutorials
</div>

        </div>
      `;


      // -------------------------
      // COURSE CLICK
      // -------------------------

      course.addEventListener("click", (e) => {

        if (
          e.target.classList.contains("item")
        ) {
          return;
        }


        if (
          openCourse &&
          openCourse !== course
        ) {
          openCourse.classList.remove("active");
        }


        course.classList.toggle("active");


        openCourse =
          course.classList.contains("active")
            ? course
            : null;

      });


      // -------------------------
      // QUIZ
      // -------------------------

      course
        .querySelector(".quiz")
        .addEventListener("click", (e) => {

          e.stopPropagation();

          openQuiz(code);

        });

course
  .querySelector(".past-questions")
  .addEventListener("click", (e) => {

    e.stopPropagation();

    openPastQuestions(code);

  });

course
  .querySelector(".practice-exam")
  .addEventListener("click", (e) => {

    e.stopPropagation();

    openPracticeExam(code);

  });
  
      // -------------------------
      // TUTORIAL
      // -------------------------

      course
        .querySelector(".tutorial")
        .addEventListener("click", (e) => {

          e.stopPropagation();

          openTutorial(code);

        });


      courseList.appendChild(course);

    });

  }


  // -------------------------
  // SAVE COURSE
  // -------------------------

  function setStudying(code, mode) {

  localStorage.setItem(
    "studying",
    code
  );

  localStorage.setItem(
    "studying_uni",
    studyingUni
  );

  localStorage.setItem(
    "study_mode",
    mode
  );

}

  // -------------------------
  // OPEN QUIZ
  // -------------------------

  function openQuiz(code) {

  setStudying(code, "practice_quiz");

  window.location.href =
    "quiz";

}

// -------------------------
// OPEN PAST QUESTIONS
// -------------------------

function openPastQuestions(code) {

  setStudying(code, "past_questions");

  window.location.href =
    "past-questions";

}

// -------------------------
// OPEN PRACTICE EXAM
// -------------------------

function openPracticeExam(code) {

  setStudying(code, "practice_exam");

  window.location.href =
    "practice-exam";

}

  // -------------------------
  // OPEN TUTORIAL
  // -------------------------

  function openTutorial(code) {

    setStudying(code, "tutorials");

    window.location.href =
      "tutorials";

  }


  // -------------------------
  // SEARCH
  // -------------------------

  search.addEventListener("input", () => {

    const value =
      search.value
        .toLowerCase()
        .trim();


    const filtered =
      courses.filter(code =>
        code.toLowerCase()
          .includes(value)
      );


    renderCourses(filtered);

  });


  // -------------------------
  // START
  // -------------------------

  getCourses();

});