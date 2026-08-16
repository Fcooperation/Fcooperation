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
            Quiz
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
      "study_mode",
      mode
    );

  }


  // -------------------------
  // OPEN QUIZ
  // -------------------------

  function openQuiz(code) {

    setStudying(code, "quiz");

    window.location.href =
      "quiz.html";

  }


  // -------------------------
  // OPEN TUTORIAL
  // -------------------------

  function openTutorial(code) {

    setStudying(code, "tutorials");

    window.location.href =
      "tutorials.html";

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