const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const webResults = document.getElementById("webResults");

searchButton.addEventListener("click", search);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    search();
  }
});

async function search() {
  const query = searchInput.value.trim();

  if (!query) {
    searchInput.focus();
    return;
  }

  // Enter searching state
  document.body.classList.add("searching");

  // Show loading state
  webResults.innerHTML = "<p>Searching...</p>";

  console.log("Search:", query);

  try {
    const response = await fetch(
      `${CONFIG.API_URL}/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();

    console.log("Search results:", data);

    // Show whatever the backend returned
    webResults.innerHTML = `
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;

  } catch (error) {
    console.error("Search error:", error);

    webResults.innerHTML = `
      <p>Unable to load search results.</p>
    `;
  }
}