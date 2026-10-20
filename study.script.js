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

  loadingText.textContent = "LOADING...";

  try {

    const response = await fetch(
      window.CONFIG.API_URL + "/admin",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          action: "get_universities"
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get universities");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.error || "Failed to get universities"
      );
    }

    universities = data.universities || [];

    renderUniversities(universities);

    loadingText.textContent = "READY ✔";

  } catch (error) {

    console.error(error);

    loadingText.textContent = "FAILED";

    uniList.innerHTML = `
      <div class="uni-error">
        Failed to load universities.
      </div>
    `;

  }

}

// ========================================
// BACKEND UNIVERSITY SEARCH
// ========================================

async function searchUniversitiesBackend(query, requestId) {
  try {
    if (!window.CONFIG || !window.CONFIG.API_URL) {
      throw new Error("API configuration is missing.");
    }

    const response = await fetch(
      `${window.CONFIG.API_URL}/admin`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          action: "search_universities",
          query: query
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        `Backend search failed: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.universities)) {
      throw new Error(
        data.error || "Invalid search response."
      );
    }

    // Ignore outdated search responses.
    if (requestId !== searchRequestId) {
      return;
    }

    // Ignore responses if the user has changed the query.
    if (
      searchBar.value.trim().toLowerCase() !==
      query.toLowerCase()
    ) {
      return;
    }

    const backendResults = data.universities
      .map(normalizeUniversity)
      .filter(Boolean);

    // Search the already-loaded universities locally too.
    const localResults = universities.filter(university =>
      getUniversitySearchText(university).includes(
        query.toLowerCase()
      )
    );

    // Combine local and backend results.
    const combined = [
      ...localResults,
      ...backendResults
    ];

    // Remove duplicates.
    const seen = new Set();

    const uniqueResults = combined.filter(university => {
      const key = (
        university.name +
        "|" +
        university.country
      ).toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });

    renderUniversities(uniqueResults);

  } catch (error) {
    console.error("Backend university search error:", error);

    // Local results remain available if backend search fails.
    // Don't replace them with an error screen.
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

    card.textContent = university;


    card.addEventListener("click", () => {

      // Save selected university
      localStorage.setItem(
  "studying_uni",
  university
);


      // Go to the universal school page
      location.href = "schoolstudy.html";

    });


    uniList.appendChild(card);

  });

}


// ========================================
// LOCAL + BACKEND SEARCH
// ========================================

searchBar.addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();

  clearSearch.hidden = query.length === 0;

  // Invalidate any previous backend request.
  searchRequestId++;

  const currentRequestId = searchRequestId;

  // Cancel a backend search that hasn't started yet.
  clearTimeout(searchTimer);

  // Empty query: display all locally loaded universities.
  if (!query) {
    if (hasLoaded) {
      renderUniversities(universities);
    }

    return;
  }

  // Search the existing list immediately.
  const localResults = universities.filter(university =>
    getUniversitySearchText(university).includes(query)
  );

  if (hasLoaded) {
    renderUniversities(localResults);
  }

  // Wait briefly before sending the request.
  // This avoids making a request for every keystroke.
  searchTimer = setTimeout(() => {
    searchUniversitiesBackend(
      query,
      currentRequestId
    );
  }, 350);
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