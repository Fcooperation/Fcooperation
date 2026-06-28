const input =
document.getElementById("searchInput");

const results =
document.getElementById("results");

document
.getElementById("back-btn")
.onclick = () => history.back();

const searchBtn =
document.getElementById("search-btn");

function doSearch(){

  const q = input.value.trim();

  if(!q){

    results.innerHTML = "";

    return;

  }

  searchVideos(q);

}

// Search button
searchBtn.onclick = doSearch;

// Enter key
input.addEventListener("keydown", e => {

  if(e.key === "Enter"){

    doSearch();

  }

});

// ---------------- CALL BACKEND ----------------

async function searchVideos(query) {

  try {

    results.innerHTML = `
      <div style="padding:20px;text-align:center;">
        Searching...
      </div>
    `;

    const res = await fetch(
      `https://fweb-backend.onrender.com/fvidsearch?q=${encodeURIComponent(query)}`
    );

    const data = await res.json();

    render(data || []);

  } catch (err) {

    console.error(err);

    results.innerHTML = `
      <div style="padding:20px;text-align:center;">
        Search failed
      </div>
    `;

  }

}

// ---------------- RENDER ----------------

function render(data) {

  results.innerHTML = "";

  const videos = data.filter(item => item.type === "video");
const users = data.filter(item => item.type === "user");

  // ---------------- NO RESULTS ----------------

  if (!videos.length && !users.length) {

    results.innerHTML = `
      <div class="empty-search">
        No results found
      </div>
    `;

    return;
  }

  // ==================================================
  // VIDEOS
  // ==================================================

  if (videos.length) {

    const title = document.createElement("h3");
    title.className = "search-heading";
    title.textContent = "Videos";

    results.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "video-grid";

    videos.forEach(video => {

      const card = document.createElement("div");
      card.className = "video-card";

      card.innerHTML = `

  <div class="video-thumb-wrap">

    <img
      class="video-thumb"
      src="${video.thumbnail_url}"
    >

    <div class="video-views">

      <svg
        class="view-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">

        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>

        <circle cx="12" cy="12" r="3"></circle>

      </svg>

      <span class="view-count">
        ${video.views_count || 0}
      </span>

    </div>

  </div>

  <div class="video-meta">

    <div class="video-user">

      <img
        class="mini-profile"
        src="${video.profile_pic}"
      >

      <span>${video.username}</span>

    </div>

    <div class="video-details">

      ${video.details || ""}

    </div>

  </div>

`;

      card.onclick = () => {

        const selectedVideo = {

          ...video,

          user: {
            username: video.username,
            profile_pic: video.profile_pic
          }

        };

        localStorage.setItem(
          "currently_viewing",
          JSON.stringify(selectedVideo)
        );

        localStorage.setItem(
          "redirect",
          "fvidsearch.html"
        );

        window.location.href = "fvids.html";

      };

      grid.appendChild(card);

    });

    results.appendChild(grid);

  }

  // ==================================================
  // USERS
  // ==================================================

  if (users.length) {

    const title = document.createElement("h3");
    title.className = "search-heading";
    title.textContent = "Users";

    results.appendChild(title);

    users.forEach(user => {

      const card = document.createElement("div");

      card.className = "user-card";

      card.innerHTML = `

        <img
          class="user-pic"
          src="${user.profile_pic}"
        >

        <div class="user-info">

          <div class="user-name">

            ${user.username}

          </div>

          <div class="user-stats">

  ${user.followers || 0} Followers •
  ${user.following || 0} Following •
  ${user.videos_count || 0} Videos

</div>

        </div>

      `;

      // Card on click 
      card.onclick = () => {

  const account =
    JSON.parse(localStorage.getItem("faccount")) || {};

  const viewerId = String(
    account.userId || account.id || ""
  );

  const userId = String(user.user_id || "");

  if (!userId) return;

  // Save whose profile is being viewed
  localStorage.setItem(
    "view_profile",
    userId
  );

  // Save viewer (logged in) or empty string
  localStorage.setItem(
    "profile_viewer",
    viewerId || ""
  );

  // Save profile details
  localStorage.setItem(
    "viewing_user_profile",
    JSON.stringify({
      id: userId,
      username: user.username,
      profile_pic: user.profile_pic
    })
  );

  window.location.href = "fvidsprofile.html";

};

      results.appendChild(card);

    });

  }

}