const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

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

  } catch (error) {
    console.error("Search error:", error);
  }
}