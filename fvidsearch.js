const input =
document.getElementById("searchInput");

const results =
document.getElementById("results");

let currentData = [];
let activeTab = "Top";
let hashtagSearch = false;

document
.getElementById("back-btn")
.onclick = () => history.back();

const searchBtn =
document.getElementById("search-btn");

// DoSearch function
function doSearch(){

  if (activeTab !== "Hashtags") {
    hashtagSearch = false;
  }

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

//Tabs
const tabs = document.querySelectorAll(".tab");

tabs.forEach(tab => {

  tab.onclick = () => {

    tabs.forEach(t =>
      t.classList.remove("active")
    );

    tab.classList.add("active");

    activeTab = tab.textContent.trim();

    render(currentData);

  };

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

    currentData = data || [];
    render(currentData);

  } catch (err) {

    console.error(err);

    results.innerHTML = `
      <div style="padding:20px;text-align:center;">
        Search failed
      </div>
    `;

  }

}

// Create video card
function createVideoCard(video) {

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

  return card;

}

// Hashtag cards
function createHashtagCard(item) {

  const card = document.createElement("div");
  card.className = "hashtag-card";

  card.innerHTML = `

    <div class="hashtag-name">
      #${item.tag}
    </div>

    <div class="hashtag-count">
      ${item.count} videos
    </div>

  `;

  card.onclick = () => {

    input.value = item.tag;

    activeTab = "Hashtags";

    tabs.forEach(tab => {

      tab.classList.toggle(
        "active",
        tab.textContent.trim() === "Hashtags"
      );

    });

    hashtagSearch = true;
    doSearch();

  };

  return card;

}

// ---------------- RENDER ----------------

function render(data) {

  results.innerHTML = "";

  let videos =
  data.filter(item => item.type === "video");

let users =
  data.filter(item => item.type === "user");

  let hashtags =
  data.filter(item => item.type === "hashtag");
  
  // ---------------- TAB FILTER ----------------

if (activeTab === "Videos") {

  users = [];

}

if (activeTab === "Users") {

  videos = [];

}

  if (activeTab === "Hashtags") {

    if (!hashtagSearch) {

        // Normal hashtag search
        videos = [];
        users = [];

    }

  }

  // Top 3 users by followers
const topUsers = [...users]
  .sort((a, b) => (b.followers || 0) - (a.followers || 0))
  .slice(0, 3);

  

// First 6 videos
const firstVideos = videos.slice(0, 6);

// Remaining videos
const remainingVideos = videos.slice(6);

  
  // ---------------- NO RESULTS ----------------

  if (
    !videos.length &&
    !users.length &&
    !hashtags.length
) {

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

     firstVideos.forEach(video => {
  grid.appendChild(createVideoCard(video));
});

    results.appendChild(grid);

  }

  // ==========================================
// TOP USERS
// ==========================================

if (activeTab === "Top" && topUsers.length) {

  const title = document.createElement("h3");
  title.className = "search-heading";
  title.textContent = "Popular Users";

  results.appendChild(title);

  topUsers.forEach(user => {

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

    card.onclick = () => {

      const account =
        JSON.parse(localStorage.getItem("faccount")) || {};

      const viewerId = String(
        account.userId || account.id || ""
      );

      const userId = String(user.user_id || "");

      if (!userId) return;

      localStorage.setItem("view_profile", userId);

      localStorage.setItem(
        "profile_viewer",
        viewerId || ""
      );

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

  if (remainingVideos.length) {

  const grid2 = document.createElement("div");
  grid2.className = "video-grid";

    remainingVideos.forEach(video => {
  grid2.appendChild(createVideoCard(video));
});

  results.appendChild(grid2);

  }

  if (activeTab === "Users" && users.length) {

  const title = document.createElement("h3");
  title.className = "search-heading";
  title.textContent = "Users";

  results.appendChild(title);

  users
    .sort((a, b) => (b.followers || 0) - (a.followers || 0))
    .forEach(user => {

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

      card.onclick = () => {

        const account =
          JSON.parse(localStorage.getItem("faccount")) || {};

        const viewerId = String(
          account.userId || account.id || ""
        );

        const userId = String(user.user_id || "");

        if (!userId) return;

        localStorage.setItem("view_profile", userId);

        localStorage.setItem(
          "profile_viewer",
          viewerId
        );

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

  // ==========================================
// HASHTAGS
// ==========================================

if (activeTab === "Hashtags") {

    if (!hashtagSearch) {

        // Show hashtag suggestions
        const title = document.createElement("h3");
        title.className = "search-heading";
        title.textContent = "Hashtags";

        results.appendChild(title);

        hashtags.forEach(tag => {
            results.appendChild(createHashtagCard(tag));
        });

    } else {

        // Show the selected hashtag
        const title = document.createElement("h3");
        title.className = "search-heading";
        title.textContent = "#" + input.value;

        results.appendChild(title);

        const count = hashtags[0]?.count || videos.length;

        const info = document.createElement("div");
        info.className = "hashtag-count";
        info.textContent = `${count} videos`;

        results.appendChild(info);

        // Don't render hashtag cards anymore.
        // The existing Videos and Popular Users sections
        // further down in render() will display automatically.
    }

}
  }

  // ---------------- AUTO HASHTAG SEARCH ----------------

const savedTag =
  localStorage.getItem("fvidsearchtag");

if (savedTag) {

  input.value = savedTag;

  activeTab = "Hashtags";

  tabs.forEach(tab => {

    tab.classList.toggle(
      "active",
      tab.textContent.trim() === "Hashtags"
    );

  });
  
  hashtagSearch = true;
  doSearch();

  localStorage.removeItem("fvidsearchtag");

}

