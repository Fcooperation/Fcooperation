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

  paragraph.textContent =
    message || "Check your connection and try again.";

  resultsCount.textContent = "";
}

function normalizeUniversity(item) {
  // Supports both older string entries and newer objects.
  if (typeof item === "string") {
    return {
      name: item.trim(),
      country: "",
      id: item.trim()
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
    name: name.trim(),

    country:
      typeof item.country === "string"
        ? item.country.trim()
        : "",

    id:
      item.id ??
      item.university_id ??
      item.slug ??
      name.trim()
  };
}

function getUniversitySearchText(university) {
  return [
    university.name,
    university.country,
    university.country_code,
    university.city,
    university.state,
    university.region,
    university.slug
  ]
    .filter(value => typeof value === "string")
    .join(" ")
    .toLowerCase();
}


// ========================================
// LOAD UNIVERSITIES
// ========================================

async function getUniversities() {
  if (isLoading) return;

  showLoading();

  pickText.textContent = "Finding universities";

  try {
    if (
      !window.CONFIG ||
      !window.CONFIG.API_URL
    ) {
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
      throw new Error(
        "The server returned an invalid university list."
      );
    }

    universities = data.universities
      .map(normalizeUniversity)
      .filter(Boolean);

    // Remove duplicate entries by name and country.
    const seen = new Set();

    universities = universities.filter(university => {
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

    hasLoaded = true;

    hideLoading();

    pickText.textContent = "Choose your university";

    renderUniversities(universities);

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
        "Try another name, country, or search term.";
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
    // Use a button for keyboard and screen-reader accessibility.
    const card = document.createElement("button");

    card.type = "button";
    card.className = "uni-card";

    const name = document.createElement("span");

    name.className = "uni-card-name";
    name.textContent = university.name;

    card.appendChild(name);

    // Display country when the backend provides it.
    if (university.country) {
      const country = document.createElement("span");

      country.className = "uni-card-country";
      country.textContent = university.country;

      card.appendChild(country);
    }

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
    // Keep the existing key for compatibility.
    localStorage.setItem(
      "studying_uni",
      university.name
    );

    // Also save the structured record for future features.
    localStorage.setItem(
      "studying_uni_data",
      JSON.stringify(university)
    );

    location.href = "schoolstudy.html";

  } catch (error) {
    console.error("Could not save selected university:", error);

    alert(
      "We couldn't save your university selection. Please try again."
    );
  }
}


// ========================================
// SEARCH
// ========================================

searchBar.addEventListener("input", function () {
  const query = this.value.trim().toLowerCase();

  clearSearch.hidden = query.length === 0;

  if (!hasLoaded) {
    return;
  }

  const filtered = universities.filter(university => {
    return getUniversitySearchText(university)
      .includes(query);
  });

  renderUniversities(filtered);
});


// ========================================
// CLEAR SEARCH
// ========================================

clearSearch.addEventListener("click", () => {
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