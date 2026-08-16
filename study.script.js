// ===============================
// ELEMENTS
// ===============================

const searchBar = document.getElementById("search-bar");
const uniList = document.getElementById("uni-list");

const progressCircle = document.querySelector(".progress");
const loadingText = document.getElementById("loading-text");


// ===============================
// LOADING CIRCLE
// ===============================

let percent = 0;

const radius = 35;
const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = circumference;


function setProgress(p) {

  const offset =
    circumference - (p / 100) * circumference;

  progressCircle.style.strokeDashoffset = offset;

  loadingText.textContent = `${p}%`;

  if (p === 100) {
    loadingText.textContent = "READY ✔";
  }

}


// ===============================
// UNIVERSITIES
// ===============================

let universities = [];


// ===============================
// GET UNIVERSITIES
// ===============================

async function getUniversities() {

  try {

    const response = await fetch(
  window.CONFIG.API_URL + "/admin",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          action: "get universities"
        })
      }
    );


    if (!response.ok) {
      throw new Error("Failed to get universities");
    }


    const data = await response.json();


    universities = data.universities || [];


    renderUniversities(universities);


  } catch (error) {

    console.error("Failed to load universities");

    uniList.innerHTML = `
      <div class="uni-error">
        Failed to load universities.
      </div>
    `;

  }

}


// ===============================
// CREATE UNIVERSITY CARDS
// ===============================

function renderUniversities(list) {

  uniList.innerHTML = "";


  list.forEach(university => {

    const card = document.createElement("div");

    card.className = "uni-card";

    card.textContent = university.name;


    card.addEventListener("click", () => {

      // Save selected university
      localStorage.setItem(
        "studying_uni",
        university.name
      );


      // Go to the universal school page
      location.href = "schoolstudy.html";

    });


    uniList.appendChild(card);

  });

}


// ===============================
// SEARCH UNIVERSITIES
// ===============================

searchBar.addEventListener("input", function () {

  const query =
    this.value.toLowerCase().trim();


  const filtered =
    universities.filter(university => {

      return university.name
        .toLowerCase()
        .includes(query);

    });


  renderUniversities(filtered);

});


// ===============================
// START
// ===============================

getUniversities();


// ===============================
// LOADING ANIMATION
// ===============================

const loader = setInterval(() => {

  percent += 2;


  if (percent > 100) {
    percent = 100;
  }


  setProgress(percent);


  if (percent === 100) {
    clearInterval(loader);
  }

}, 50);