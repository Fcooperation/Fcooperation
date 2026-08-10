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

  // Empty search
  if (!query) {
    console.log("[FWEB] Search cancelled: empty query.");
    searchInput.focus();
    return;
  }

  // Enter searching state
  document.body.classList.add("searching");

  // Show loading state
  webResults.innerHTML = "<p>Searching...</p>";

  console.log("[FWEB] =============================");
  console.log("[FWEB] Search started");
  console.log("[FWEB] Query:", query);
  console.log("[FWEB] Backend:", CONFIG.API_URL);

  const endpoint =
    `${CONFIG.API_URL}/search?q=${encodeURIComponent(query)}`;

  console.log("[FWEB] Endpoint:", endpoint);
  console.log("[FWEB] Sending request...");

  try {
    const response = await fetch(endpoint);

    console.log("[FWEB] Backend responded");
    console.log("[FWEB] HTTP status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log("[FWEB] Reading response...");

    const data = await response.json();

    console.log("[FWEB] Response received:", data);

    // Check for no results
    if (
      data === null ||
      data === undefined ||
      (Array.isArray(data) && data.length === 0)
    ) {
      console.log("[FWEB] No results returned.");

      webResults.innerHTML = `
        <p>No results found.</p>
      `;

      return;
    }

    console.log("[FWEB] Results found.");
    console.log(
      "[FWEB] Number of results:",
      Array.isArray(data) ? data.length : "Unknown"
    );

    // Temporary display of backend response
    webResults.innerHTML = `
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;

    console.log("[FWEB] Results rendered.");

  } catch (error) {
    console.error("[FWEB] Search failed.");
    console.error("[FWEB] Error:", error);

    webResults.innerHTML = `
      <p>Unable to load search results.</p>
    `;

  } finally {
    console.log("[FWEB] Search finished.");
    console.log("[FWEB] =============================");
  }
}