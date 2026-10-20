// ========================================
// FSTUDY: ELEMENTS
// ========================================

const searchBar = document.getElementById("search-bar");
const clearSearch = document.getElementById("clear-search");

const uniList = document.getElementById("uni-list");
const uniLoading = document.getElementById("uni-loading");
const uniEmpty = document.getElementById("uni-empty");
const uniError = document.getElementById("uni-error");

const pickText = document.getElementById("pick-text");
const resultsCount = document.getElementById("results-count");

const emptyTitle = document.getElementById("empty-title");
const emptyDescription = document.getElementById("empty-description");

const retryButton = document.getElementById("retry-loading");


// ========================================
// STATE
// ========================================

let universities = [];
let isLoading = false;
let hasLoaded = false;

let searchTimer = null;
let searchRequestId = 0;


// ========================================
// HELPERS
// ========================================

function showLoading() {
  isLoading = true;

  uniLoading.hidden = false;
  uniList.replaceChildren();

  uniEmpty.hidden = true;
  uniError.hidden = true;

  resultsCount.textContent = "";
}

function hideLoading() {
  isLoading = false;
  uniLoading.hidden = true;
}

function showError(message) {
  hideLoading();

  uniList.replaceChildren();

  uniEmpty.hidden = true;
  uniError.hidden = false;

  const paragraph = uniError.querySelector("p");

  if (paragraph) {
    paragraph.textContent =
      message || "Check your connection and try again.";
  }

  resultsCount.textContent = "";
}


// ========================================
// NORMALIZE UNIVERSITY
// ========================================

function normalizeUniversity(item) {
  if (typeof item === "string") {
    const name = item.trim();

    if (!name) return null;

    return {
      id: name,
      name,
      acronym: "",
      country: "",
      state: "",
      region: ""
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const name =
    item.name ||
    item.university_name ||
    item.university ||
    item.school ||
    "";

  if (typeof name !== "string" || !name.trim()) {
    return null;
  }

  return {
    ...item,

    id: item.id ?? item.university_id ?? name.trim(),

    name: name.trim(),

    acronym:
      typeof item.acronym === "string"
        ? item.acronym.trim()
        : "",

    country:
      typeof item.country === "string"
        ? item.country.trim()
        : "",

    state:
      typeof item.state === "string"
        ? item.state.trim()
        : "",

    region:
      typeof item.region === "string"
        ? item.region.trim()
        : ""
  };
}


// ========================================
// SEARCH TEXT
// ========================================

function getUniversitySearchText(university) {
  return [
    university.name,
    university.acronym,
    university.country,
    university.state,
    university.region
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}


// ========================================
// REMOVE DUPLICATES
// ========================================

function removeDuplicateUniversities(list) {
  const seen = new Set();

  return list.filter(university => {
    const key = String(
      university.id ??
      `${university.name}|${university.country}`
    ).toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}


// ========================================
// LOAD UNIVERSITIES
// ========================================

async function getUniversities() {
  if (isLoading) return;

  showLoading();

  pickText.textContent = "Finding universities";

  try {
    if (!window.CONFIG || !window.CONFIG.API_URL) {
      throw new Error("The API configuration is missing.");
    }

    const response = await fetch(
      `${window.CONFIG.API_URL}/admin`,
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
      throw new Error(
        `Server returned status ${response.status}.`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        data.error || "Failed to load universities."
      );
    }

    if (!Array.isArray(data.universities)) {
      throw new Error("Invalid university list received.");
    }

    universities = removeDuplicateUniversities(
      data.universities
        .map(normalizeUniversity)
        .filter(Boolean)
    );

    hasLoaded = true;

    hideLoading();

    pickText.textContent = "Choose your university";

    // Respect an existing search when reloading.
    const query = searchBar.value.trim().toLowerCase();

    if (query) {
      renderUniversities(
        universities.filter(university =>
          getUniversitySearchText(university).includes(query)
        )
      );

      searchUniversitiesBackend(query, ++searchRequestId);
    } else {
      renderUniversities(universities);
    }

  } catch (error) {
    console.error("FStudy university loading error:", error);

    hasLoaded = false;

    pickText.textContent = "Universities";

    showError(
      "We couldn't retrieve the university list. Please try again."
    );
  }
}


// ========================================
// BACKEND UNIVERSITY SEARCH
// ========================================

async function searchUniversitiesBackend(query, requestId) {
  try {
    if (!window.CONFIG || !window.CONFIG.API_URL) {
      throw new Error("The API configuration is missing.");
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

    // Ignore outdated responses.
    if (requestId !== searchRequestId) {
      return;
    }

    if (
      searchBar.value.trim().toLowerCase() !== query.toLowerCase()
    ) {
      return;
    }

    const backendResults = data.universities
      .map(normalizeUniversity)
      .filter(Boolean);

    const localResults = universities.filter(university =>
      getUniversitySearchText(university).includes(
        query.toLowerCase()
      )
    );

    // Put backend results first, then add any local matches.
    const combined = removeDuplicateUniversities([
      ...backendResults,
      ...localResults
    ]);

    renderUniversities(combined);

  } catch (error) {
    console.error("Backend university search error:", error);

    // Local results remain visible if the backend search fails.
  }
}


// ========================================
// RENDER UNIVERSITIES
// ========================================

function renderUniversities(list) {
  hideLoading();

  uniError.hidden = true;
  uniList.replaceChildren();

  const query = searchBar.value.trim();

  clearSearch.hidden = query.length === 0;

  if (!list.length) {
    uniEmpty.hidden = false;

    resultsCount.textContent = "0 found";

    if (query) {
      emptyTitle.textContent = "No universities found";

      emptyDescription.textContent =
        "Try another university name or acronym.";
    } else {
      emptyTitle.textContent = "No universities available";

      emptyDescription.textContent =
        "The university list is currently empty.";
    }

    return;
  }

  uniEmpty.hidden = true;

  resultsCount.textContent =
    `${list.length} ${list.length === 1 ? "result" : "results"}`;

  const fragment = document.createDocumentFragment();

  list.forEach(university => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "uni-card";

    // University name
    const name = document.createElement("span");

    name.className = "uni-card-name";
    name.textContent = university.name;

    card.appendChild(name);

    // University acronym
    if (university.acronym) {
      const acronym = document.createElement("span");

      acronym.className = "uni-card-acronym";
      acronym.textContent = university.acronym;

      card.appendChild(acronym);
    }

    // Country
    if (university.country) {
      const country = document.createElement("span");

      country.className = "uni-card-country";
      country.textContent = university.country;

      card.appendChild(country);
    }

    // State and region
    const locationParts = [
      university.state,
      university.region
    ].filter(Boolean);

    if (locationParts.length) {
      const location = document.createElement("span");

      location.className = "uni-card-location";
      location.textContent = locationParts.join(" · ");

      card.appendChild(location);
    }

    // Arrow
    const arrow = document.createElement("span");

    arrow.className = "uni-card-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";

    card.appendChild(arrow);

    card.addEventListener("click", () => {
      selectUniversity(university);
    });

    fragment.appendChild(card);
  });

  uniList.appendChild(fragment);
}


// ========================================
// SELECT UNIVERSITY
// ========================================

function selectUniversity(university) {
  try {
    localStorage.setItem(
      "studying_uni",
      university.name
    );

    localStorage.setItem(
      "studying_uni_data",
      JSON.stringify(university)
    );

    location.href = "schoolstudy.html";

  } catch (error) {
    console.error(
      "Could not save selected university:",
      error
    );

    alert(
      "We couldn't save your university selection. Please try again."
    );
  }
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

  clearTimeout(searchTimer);

  if (!query) {
    if (hasLoaded) {
      renderUniversities(universities);
    }

    return;
  }

  // Search loaded universities immediately.
  if (hasLoaded) {
    const localResults = universities.filter(university =>
      getUniversitySearchText(university).includes(query)
    );

    renderUniversities(localResults);
  }

  // Send the query to the backend after typing pauses.
  searchTimer = setTimeout(() => {
    searchUniversitiesBackend(query, currentRequestId);
  }, 350);
});


// ========================================
// CLEAR SEARCH
// ========================================

clearSearch.addEventListener("click", () => {
  searchRequestId++;

  clearTimeout(searchTimer);

  searchBar.value = "";

  clearSearch.hidden = true;

  searchBar.focus();

  if (hasLoaded) {
    renderUniversities(universities);
  }
});


// ========================================
// RETRY
// ========================================

retryButton.addEventListener("click", () => {
  getUniversities();
});


// ========================================
// START
// ========================================

getUniversities();