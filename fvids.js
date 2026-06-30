// ---------------- VIDEO FEED STATE ----------------
const feed = document.getElementById("video-feed");
const uploadQueue = document.getElementById("upload-queue");
const videoCache = {};

// ---------------- DEEP LINK SUPPORT ----------------
const urlParams = new URLSearchParams(window.location.search);
const sharedVideoId = urlParams.get("id");

function updateLikeUI(wrapper, delta) {
  const likeCount = wrapper.querySelector(".like-count");
  if (!likeCount) return;

  let current = parseInt(likeCount.textContent || "0");
  let updated = current + delta;
let currentFeed = "foryou";
  
  // 🔥 NEVER go below 0
  updated = Math.max(0, updated);

  // 🔥 hide if 0, otherwise show
  if (updated === 0) {
    likeCount.style.display = "none";
    likeCount.textContent = "0"; 
  } else {
    likeCount.style.display = "block";
    likeCount.textContent = updated;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem("faccount");
}

let videos = [];
let currentIndex = 0;
let currentPage = 1;
let isLoadingMore = false;
let hasMoreVideos = true;
let swipeStartX = 0;
let swipeStartY = 0;
let swipeActive = false;


// Stop all vids 
function stopAllVideos() {
  document.querySelectorAll("#video-feed video").forEach(v => {
    try {
      v.pause();
    } catch (e) {}
  });
}


// ---------------- TAB SWITCH ----------------
function switchTab(tab) {

  currentFeed = tab;

  currentPage = 1;
  currentIndex = 0;
  hasMoreVideos = true;

  // 🔥 STOP EVERYTHING FIRST (IMPORTANT FIX)
  stopAllVideos();

  videos = [];

  feed.innerHTML = `
    <div style="text-align:center; margin-top:20px; color:white;">
      🎬 Loading...
    </div>
  `;

  if (tab === "foryou") {
    loadVideos();
  }

  if (tab === "tutorials") {
    loadTutorialVideos();
  }
  if (tab === "following") {
  loadFollowingVideos();
  }
}

// ---------------- LOAD VIDEOS FROM BACKEND ----------------
async function loadVideos(page = 1, append = false) {

  try {

    const account =
      JSON.parse(localStorage.getItem("faccount")) || {};

    const userId =
      account.userId || account.id;

    if (!append) {
      feed.innerHTML = `
        <div style="text-align:center; margin-top:20px; color:white;">
          🎬 Fetching videos...
        </div>
      `;
    }

    const res = await fetch(
      `https://fweb-backend.onrender.com/fvids?userId=${userId || ""}&page=${page}`
    );

    const newVideos = await res.json();

    if (!newVideos || newVideos.length === 0) {
      hasMoreVideos = false;

      if (!append) {
        feed.innerHTML = `
          <div style="text-align:center; margin-top:20px; color:white;">
            No videos found
          </div>
        `;
      }

      return;
    }

    // ---------------- FIRST LOAD ----------------
if (!append) {

videos = newVideos;
currentIndex = 0;
renderVideo(0);
}

    // ---------------- LOAD MORE ----------------
    else {
      videos.push(...newVideos);
    }

  } catch (err) {
    console.error(err);
    feed.innerHTML = `
      <div style="text-align:center; margin-top:20px; color:white;">
        Error loading videos
      </div>
    `;
  }
}

// apply video fit 
function applyVideoFit(video) {
  const setFit = () => {
    const isVertical = video.videoHeight > video.videoWidth;
    video.style.objectFit = isVertical ? "cover" : "contain";
  };

  if (video.videoWidth && video.videoHeight) {
    setFit();
  } else {
    video.addEventListener("loadedmetadata", setFit, { once: true });
  }
}

// ---------------- DEVICE ID ----------------

function getDeviceId() {

  let deviceId =
    localStorage.getItem("fvid_device_id");

  if (!deviceId) {

    deviceId =
      crypto.randomUUID();

    localStorage.setItem(
      "fvid_device_id",
      deviceId
    );

  }

  return deviceId;

}

// ---------------- SEND VIEW ----------------

async function sendView(video) {

  try {

    const account =
  JSON.parse(localStorage.getItem("faccount")) || {};

const userId =
  account.userId || account.id;

const payload = {
  publicId: video.public_id
};

if (userId) {
  // Logged in → identify by account only
  payload.userId = userId;
} else {
  // Logged out → identify by device only
  payload.deviceId = getDeviceId();
}

await fetch(
  "https://fweb-backend.onrender.com/fviews",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }
);

  } catch (err) {

    console.error(
      "View failed",
      err
    );

  }

}

// ---------------- RENDER SINGLE VIDEO ----------------
function renderVideo(index, direction = "next") {

  // stop previous video ONLY
const currentVideo = feed.querySelector("video");
if (currentVideo) currentVideo.pause();

// clear UI safely
feed.innerHTML = "";

  const vid = videos[index];
  if (!vid) return;
  

  const wrapper = document.createElement("div");
  wrapper.className = "video-wrapper";

  let video;

if (videoCache[vid.video_url]) {

  video = videoCache[vid.video_url];
  applyVideoFit(video);

} else {

  video = document.createElement("video");
  video.src = vid.video_url;
  applyVideoFit(video);
  
  video.addEventListener("loadedmetadata", () => {
  const isVertical = video.videoHeight > video.videoWidth;

  video.style.objectFit = isVertical ? "cover" : "contain";
});
}

video.className = "video";
video.loop = true;
video.muted = false;
video.playsInline = true;
video.autoplay = true;

applyVideoFit(video);

video.addEventListener("playing", () => {
  playOverlay.style.display = "none";
});

// ---------------- VIEW TRACKING ----------------

let viewSent = false;

video.addEventListener("timeupdate", () => {

  if (viewSent) return;

  if (!video.duration) return;

  const watched =
    video.currentTime / video.duration;

  if (watched >= 0.4) {

    viewSent = true;

    sendView(vid);

  }

});

// ---------------- END VIEW TRACKING ----------------

wrapper.appendChild(video);

  const thumbnail = document.createElement("img");

thumbnail.className = "video-thumbnail-overlay";

thumbnail.src = vid.thumbnail_url || "";

wrapper.appendChild(thumbnail);
  
  const playOverlay = document.createElement("div");
playOverlay.className = "play-overlay";
playOverlay.innerHTML = "▶";

wrapper.appendChild(playOverlay);
  
  const pauseIcon = document.createElement("div");
pauseIcon.className = "pause-icon";
wrapper.appendChild(pauseIcon);

  // animation
  wrapper.style.transform = direction === "next"
    ? "translateY(100%)"
    : "translateY(-100%)";

  wrapper.style.transition = "transform 0.25s ease";

  
// ---------------- PROFILE PIC + FOLLOW ----------------

const profileWrap = document.createElement("div");
profileWrap.className = "video-profile-wrap";

const profileImg = document.createElement("img");
profileImg.className = "video-profile-pic";

profileImg.src =
  vid.user?.profile_pic ||
  "https://via.placeholder.com/100";

const loggedInUser =
  JSON.parse(localStorage.getItem("faccount")) || {};

const currentUserId =
  String(loggedInUser.userId || loggedInUser.id || "");

const videoOwnerId =
  String(vid.user_id || "");

  const followStorageKey =
  `fvid_following_${currentUserId}`;

const followedUsers =
  JSON.parse(
    localStorage.getItem(followStorageKey)
  ) || {};

// backend is source of truth
const alreadyFollowing =
  Boolean(vid.following);

// sync local storage from backend
if (vid.following) {
  followedUsers[videoOwnerId] = true;

  localStorage.setItem(
    followStorageKey,
    JSON.stringify(followedUsers)
  );
}

if (currentUserId !== videoOwnerId) {

  const followBtn = document.createElement("div");
  followBtn.className = "follow-btn";
  followBtn.textContent = alreadyFollowing ? "✓" : "+";

if (alreadyFollowing) {
  followBtn.style.display = "none";
}

  followBtn.addEventListener("click", async (e) => {
  e.stopPropagation();

  if (!currentUserId) {
    showSigninBanner();
    return;
  }

  followBtn.classList.add("following");
  followBtn.textContent = "✓";

  try {

    await fetch(
  "https://fweb-backend.onrender.com/follow",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      followerId: currentUserId,
      followingId: videoOwnerId
    })
  }
);

// Update every loaded video from this creator
videos.forEach(v => {
  if (String(v.user_id) === videoOwnerId) {
    v.following = true;
  }
});

// update local cache
followedUsers[videoOwnerId] = true;

localStorage.setItem(
  followStorageKey,
  JSON.stringify(followedUsers)
);

    

    setTimeout(() => {
      followBtn.style.display = "none";
    }, 800);

  } catch (err) {
    console.error(err);

    followBtn.classList.remove("following");
    followBtn.textContent = "+";
  }
});

  profileWrap.appendChild(followBtn);
}

profileWrap.appendChild(profileImg);

wrapper.appendChild(profileWrap);

  // ---------------- USER INFO ----------------

const userInfo = document.createElement("div");
userInfo.className = "video-user-info";

// Username
const username = document.createElement("div");
username.className = "video-username";
username.textContent = vid.user?.username || "Unknown";

// Description
const description = document.createElement("div");
description.className = "video-description";

const fullDescription = vid.details || "";

description.textContent = fullDescription;

// Check after it's rendered
requestAnimationFrame(() => {

  if (description.scrollHeight > description.clientHeight + 2) {

    description.innerHTML =
      fullDescription +
      ` <span class="read-more">...more</span>`;

    description.dataset.expanded = "false";

    description.addEventListener("click", () => {

      if (description.dataset.expanded === "false") {

        description.style.webkitLineClamp = "unset";
        description.querySelector(".read-more").textContent = " ";
        description.dataset.expanded = "true";

      } else {

        description.style.webkitLineClamp = "1";
        description.querySelector(".read-more").textContent = "...more";
        description.dataset.expanded = "false";

      }

    });

  }

});
  
// Hashtags
const hashtags = document.createElement("div");
hashtags.className = "video-hashtags";

(vid.hashtags || []).forEach(tag => {

  const span = document.createElement("span");

  span.textContent = "#" + tag;
  span.className = "hashtag";

  span.addEventListener("click", (e) => {

    e.stopPropagation();

    localStorage.setItem(
      "fvidsearchtag",
      tag
    );

    window.location.href = "fvidsearch.html";

  });

  hashtags.appendChild(span);
  hashtags.append(" ");

});

userInfo.appendChild(username);
userInfo.appendChild(description);
userInfo.appendChild(hashtags);

wrapper.appendChild(userInfo);
  
  const likeBtn = document.createElement("div");
likeBtn.className = "like-heart";
const likeCount = document.createElement("div");
likeCount.className = "like-count";

  const initialLikes = Math.max(0, vid.likes_count || 0);

if (initialLikes === 0) {
  likeCount.style.display = "none";
} else {
  likeCount.style.display = "block";
  likeCount.textContent = initialLikes;
}

  const account =
  JSON.parse(localStorage.getItem("faccount")) || {};

const userId = account.userId || account.id;

const videoKey = vid._id || vid.id;

// get per-account storage
const likedVideos =
  JSON.parse(localStorage.getItem(`fvid_likes_${userId}`)) || {};

// IMPORTANT: fallback priority = backend first, then local
const isLiked =
  Boolean(vid.liked) || Boolean(likedVideos[videoKey]);

// apply UI
if (isLiked) {
  likeBtn.classList.add("liked");
  likeBtn.innerHTML = "❤️";
} else {
  likeBtn.classList.remove("liked");
  likeBtn.innerHTML = "🤍";
}

// OPTIONAL: attach video id
likeBtn.dataset.id = vid._id || vid.id;

// toggle logic
likeBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  toggleLike();
});
wrapper.appendChild(likeBtn);
wrapper.appendChild(likeCount);
  
  const commentBtn = document.createElement("div");
commentBtn.className = "comment-btn";
commentBtn.innerHTML = "💬";

commentBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent pause/video click

  const videoId = vid._id || vid.id;
  openComments(videoId, vid.video_url);
});

  const commentCount = document.createElement("div");
commentCount.className = "comment-count";
commentCount.textContent = vid.comment_count || 0;

wrapper.appendChild(commentCount);
wrapper.appendChild(commentBtn);

  // Share button 
  const shareBtn = document.createElement("div");

shareBtn.className = "share-btn";

shareBtn.innerHTML = "➦";

shareBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (window.shareVideo) {
    window.shareVideo(vid);
  }
});

wrapper.appendChild(shareBtn);
  wrapper.dataset.publicId = vid.public_id;
  const shareCount = document.createElement("div");
shareCount.className = "share-count";

// use backend value (fallback 0)
shareCount.textContent = vid.share_count || 0;

wrapper.appendChild(shareCount);

let lastTap = 0;
let tapCount = 0;
let tapTimer = null;
let clickTimer = null;

video.addEventListener("click", (e) => {

  const currentTime = Date.now();
  const tapLength = currentTime - lastTap;

  const likeBtn = wrapper.querySelector(".like-heart");

  // DOUBLE TAP
  if (tapLength < 300 && tapLength > 0) {

    clearTimeout(clickTimer);

    const alreadyLiked =
  likeBtn.classList.contains("liked");

// only send if not already liked
const account =
  JSON.parse(localStorage.getItem("faccount")) || {};

const userId = account.userId || account.id;

if (!userId) {
  showHeartPop(e.clientX, e.clientY); // still show animation
  return; // 🚫 DO NOT like
}

if (!alreadyLiked) {

  likeBtn.classList.add("liked");
  likeBtn.innerHTML = "❤️";

  updateLikeUI(wrapper, 1);

  sendDoubleTapLike();
}

showHeartPop(
  e.clientX,
  e.clientY
);

    tapCount++;

    clearTimeout(tapTimer);

    tapTimer = setTimeout(() => {
      tapCount = 0;
    }, 800);

    if (tapCount > 2) {
      showHeartPop(e.clientX, e.clientY);
    }

    // Prevent accidental pause after spam likes
    lastTap = Date.now();

    return;
  }

  lastTap = currentTime;

  clearTimeout(clickTimer);

  clickTimer = setTimeout(() => {

    const pauseIcon =
      wrapper.querySelector(".pause-icon");

    if (video.paused) {

      video.play();

      pauseIcon.classList.remove("show");

    } else {

      video.pause();

      pauseIcon.classList.add("show");
    }

  }, 350);

});
// handle likes
function handleLike() {

  const likeBtn = wrapper.querySelector(".like-heart");

  if (!likeBtn) return;

  // ONLY LIKE (no toggle here anymore)
  likeBtn.classList.add("liked");
  likeBtn.innerHTML = "❤️";
}
  feed.appendChild(wrapper);

  requestAnimationFrame(() => {
    wrapper.style.transform = "translateY(0)";
  });

  requestAnimationFrame(() => {

  video.play().then(() => {

    playOverlay.style.display = "none";
    thumbnail.style.display = "none";

}).catch(() => {

    playOverlay.style.display = "flex";
    thumbnail.style.display = "block";

});

});

// Play button
  playOverlay.onclick = (e) => {

    e.stopPropagation();

    video.play().then(() => {

        playOverlay.style.display = "none";
        thumbnail.style.display = "none";

    });

};


  // Start background download after 3 seconds watched

let offlineTimer = setTimeout(() => {

  const nextVideo = videos[index + 1];

  if (nextVideo) {
    downloadVideoForOffline(nextVideo);
  }

}, 3000);

video.addEventListener("pause", () => {
  clearTimeout(offlineTimer);
});

video.addEventListener("ended", () => {
  clearTimeout(offlineTimer);
});
  
  // Toggle like function 
  async function toggleLike() {
  const likeBtn = wrapper.querySelector(".like-heart");
  if (!likeBtn) return;

  const account = JSON.parse(localStorage.getItem("faccount")) || {};
  const userId = account.userId || account.id;
  if (!userId) {
    showToast("Login required");
    return;
  }

  const videoId = vid._id || vid.id;
  const wasLiked = likeBtn.classList.contains("liked");
  const likeCount = wrapper.querySelector(".like-count");
  let currentCount = parseInt(likeCount.textContent || "0");

  // ---------- UPDATE UI FIRST (Optimistic UI) ----------
  if (wasLiked) {
    likeBtn.classList.remove("liked");
    likeBtn.innerHTML = "🤍";
  } else {
    likeBtn.classList.add("liked");
    likeBtn.innerHTML = "❤️";
  }

  try {
    const res = await fetch("https://fweb-backend.onrender.com/fvids/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId,
        userId,
        action: wasLiked ? "unlike" : "like"
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");

    // ---------- SYNC IN-MEMORY GLOBAL ARRAY ----------
    vid.liked = !wasLiked;
    vid.likes_count = wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

    // ---------- SAVE TO STORAGE (Using matching user-specific key) ----------
    const storageKey = `fvid_likes_${userId}`;
    const likedVideos = JSON.parse(localStorage.getItem(storageKey)) || {};
    
    if (wasLiked) {
      delete likedVideos[videoId];
    } else {
      likedVideos[videoId] = true;
    }

    updateLikeUI(wrapper, wasLiked ? -1 : 1);

// extra safety clamp (prevents backend weirdness)
const likeCount = wrapper.querySelector(".like-count");
let safe = parseInt(likeCount.textContent || "0");
safe = Math.max(0, safe);

if (safe === 0) {
  likeCount.style.display = "none";
  likeCount.textContent = "0"; 
}
    localStorage.setItem(storageKey, JSON.stringify(likedVideos));

  } catch (err) {
    console.error(err);
    // rollback UI on failure
    if (wasLiked) {
      likeBtn.classList.add("liked");
      likeBtn.innerHTML = "❤️";
    } else {
      likeBtn.classList.remove("liked");
      likeBtn.innerHTML = "🤍";
    }
    showToast("Failed to update like");
  }
}


// Handle double click to send like 
async function sendDoubleTapLike() {
  const account = JSON.parse(localStorage.getItem("faccount")) || {};
  const userId = account.userId || account.id;
  if (!userId) return;

  const videoId = vid._id || vid.id;

  try {
    const res = await fetch("https://fweb-backend.onrender.com/fvids/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId,
        userId,
        action: "like"
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");

    // ---------- SYNC IN-MEMORY GLOBAL ARRAY ----------
    // Since double tap ONLY likes, we force true
    const alreadyLiked = vid.liked;
    vid.liked = true;
    if (!alreadyLiked) {
      vid.likes_count = (vid.likes_count || 0) + 1;
    }

    // ---------- SAVE TO STORAGE (Using matching user-specific key) ----------
    const storageKey = `fvid_likes_${userId}`;
    const likedVideos = JSON.parse(localStorage.getItem(storageKey)) || {};
    likedVideos[videoId] = true;
    
    localStorage.setItem(storageKey, JSON.stringify(likedVideos));

  } catch (err) {
    console.error("Double tap like failed:", err);
  }
}


// preload next videos
preloadVideos(index);
}
// ---------------- SWIPE LOGIC ----------------
let startY = 0;
let isSwiping = false;

function commentsAreOpen() {
  const sheet =
    document.getElementById("comments-sheet");

  return sheet &&
    sheet.classList.contains("show");
}

document.addEventListener("touchstart", (e) => {

  if (commentsAreOpen()) return;

  startY = e.touches[0].clientY;
  isSwiping = true;

}, { passive: true });

document.addEventListener("touchmove", (e) => {

  if (commentsAreOpen()) return;

  if (!isSwiping) return;

  e.preventDefault();

}, { passive: false });

document.addEventListener("touchend", (e) => {

  if (commentsAreOpen()) return;

  if (!isSwiping) return;

  isSwiping = false;

  let endY = e.changedTouches[0].clientY;
  let diff = startY - endY;

  if (diff > 60) {
    nextVideo();
  }

  if (diff < -60) {
    prevVideo();
  }
});

// Load more videos 
async function loadMoreVideos() {

  if (isLoadingMore || !hasMoreVideos) return;

  isLoadingMore = true;
  currentPage++;

  try {

    if (currentFeed === "tutorials") {

  await loadTutorialVideos(
    currentPage,
    true
  );

}
else if (currentFeed === "following") {

  await loadFollowingVideos(
    currentPage,
    true
  );

}
else {

  await loadVideos(
    currentPage,
    true
  );

}

  } finally {
    isLoadingMore = false;
  }
}

// ---------------- NAVIGATION ----------------
async function nextVideo() {

  if (currentIndex < videos.length - 1) {

    const currentVideo = feed.querySelector("video");
    if (currentVideo) currentVideo.pause();

    currentIndex++;

    renderVideo(currentIndex, "next");

    if (currentIndex >= videos.length - 5) {
      loadMoreVideos();
    }
  }
}

function prevVideo() {
  if (currentIndex > 0) {
    // 👇 Pause the current video first!
    const currentVideo = feed.querySelector("video");
    if (currentVideo) {
      currentVideo.pause();
    }

    currentIndex--;
    renderVideo(currentIndex, "prev");
  }
}

// Offline Download
const offlineDownloads = new Set();

async function downloadVideoForOffline(videoObj) {

  if (!videoObj) return;

  const videoId = videoObj._id || videoObj.id;

  if (offlineDownloads.has(videoId)) return;

  offlineDownloads.add(videoId);

  try {

    console.log("📥 Downloading for offline:", videoObj.video_url);

    const res = await fetch(videoObj.video_url);

    const blob = await res.blob();

    // TODO:
    // save blob into IndexedDB here later

    console.log(
      "✅ Offline video downloaded:",
      videoId,
      Math.round(blob.size / 1024 / 1024),
      "MB"
    );

  } catch (err) {

    console.error(
      "❌ Offline download failed:",
      err
    );
  }
}

// Preload vid function 
function preloadVideos(startIndex) {

  for (let i = 1; i <= 2; i++) {

    const nextIndex = startIndex + i;

    if (!videos[nextIndex]) continue;

    const url = videos[nextIndex].video_url;

    if (videoCache[url]) continue;

    const preloadVideo = document.createElement("video");

    preloadVideo.src = url;
    preloadVideo.preload = "auto";
    preloadVideo.muted = true;

    preloadVideo.load();

    videoCache[url] = preloadVideo;

    console.log("Preloading:", url);
  }
}

// Show Upload Banner
function showUploadBanner() {

  const shouldShow =
    localStorage.getItem("showUploadBanner");

  if (shouldShow !== "true") return;

  const banner =
    document.getElementById("upload-banner");

  const viewBtn =
    document.getElementById("view-upload-btn");

  banner.classList.remove("hidden");

  // show only once
  localStorage.removeItem("showUploadBanner");

  viewBtn.onclick = () => {

    banner.classList.add("hidden");

    window.location.href =
      "fvidsme.html";
  };

  // auto hide after 8 seconds
  setTimeout(() => {
    banner.classList.add("hidden");
  }, 8000);
}

// ---------------- UPLOAD QUEUE (DRAFT UI) ----------------
function createUploadItem() {

  const draft = JSON.parse(localStorage.getItem("fvid_draft"));
  if (!draft) return;

  const item = document.createElement("div");
  item.className = "upload-item";

  const media = document.createElement("img");
  media.src = draft.thumbnail;
  media.className = "upload-thumb";

  const info = document.createElement("div");
  info.className = "upload-info";

  info.innerHTML = `
    <div>Ready to upload</div>
    <div class="upload-status">draft</div>
  `;

  item.appendChild(media);
  item.appendChild(info);

  uploadQueue.appendChild(item);

  return { item, info };
}

// Plus button logic 
function handlePlusClick(e) {

  if (!isLoggedIn()) {
    showToast("Must sign-in to access this feature");
    return;
  }

  window.location.href = "fvidsadd.html";
}

// toast message 
function showToast(message) {

  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = "toast show";

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

// ---------------- SIGN IN BANNER ----------------
function showSigninBanner() {

  let banner =
    document.getElementById("signin-banner");

  // create once
  if (!banner) {

    banner = document.createElement("div");
    banner.id = "signin-banner";

    banner.innerHTML = `
      Sign in is required
      <span id="signin-link">Sign In</span>
    `;

    document.body.appendChild(banner);

    banner
      .querySelector("#signin-link")
      .addEventListener("click", () => {

        window.location.href =
          "login.html";
      });
  }

  banner.classList.add("show");

  clearTimeout(banner.hideTimer);

  banner.hideTimer = setTimeout(() => {
    banner.classList.remove("show");
  }, 3000);
}

// Poping heart function 
function showHeartPop(x, y) {

  const heart = document.createElement("div");

  heart.className = "floating-heart";
  heart.innerHTML = "❤️";

  heart.style.left = x + "px";
  heart.style.top = y + "px";

  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 800);
}

// ---------------- LOAD SINGLE VIDEO (SHARE LINK) ----------------
async function loadSingleVideo(videoId) {
  try {

    feed.innerHTML = `
      <div style="text-align:center; margin-top:20px; color:white;">
        Loading video...
      </div>
    `;

    const account =
  JSON.parse(localStorage.getItem("faccount")) || {};

const userId =
  account.userId || account.id;

const res = await fetch(
  `https://fweb-backend.onrender.com/fvids/single?id=${videoId}&userId=${userId || ""}`
);

    const video = await res.json();

    if (!video || !video._id && !video.id) {
      feed.innerHTML = `
        <div style="text-align:center; margin-top:20px; color:white;">
          Video not found
        </div>
      `;
      return;
    }

    videos = [video];
    currentIndex = 0;

    renderVideo(0);

  } catch (err) {
    console.error("Shared video load failed:", err);

    feed.innerHTML = `
      <div style="text-align:center; margin-top:20px; color:white;">
        Failed to load video
      </div>
    `;
  }
}

// Tabs highlight 
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const selectedTab = tab.dataset.tab;

    // remove active state from all tabs
    document.querySelectorAll(".tab").forEach(t => {
      t.classList.remove("active");
    });

    // highlight current tab
    tab.classList.add("active");

    switchTab(selectedTab);
  });
});

// Show bar
function showProfileViewerBar() {

  const redirect =
    localStorage.getItem("redirect");

  document.body.classList.add(
    "profile-view-mode"
  );

  const backBtn =
    document.getElementById("back-btn");

  if (backBtn) {

    backBtn.style.display = "block";

    backBtn.onclick = () => {

      localStorage.removeItem("redirect");
      
      
      window.location.href =
        redirect || "fvidsme.html";

    };

  }

}

// Open Current video profile
function openCurrentVideoProfile() {

  const vid = videos[currentIndex];
  if (!vid) return;

  const account =
    JSON.parse(localStorage.getItem("faccount")) || {};

  const viewerId =
    String(account.userId || account.id || "");

  const userId =
    String(vid.user_id || "");

  if (!userId) return;

  // 🚫 Viewing your own video
  if (viewerId === userId) {
    return;
  }

  // save WHO you're viewing
  localStorage.setItem("view_profile", userId);

  localStorage.setItem(
    "profile_viewer",
    viewerId || ""
  );

  if (vid.user) {
    localStorage.setItem(
      "viewing_user_profile",
      JSON.stringify({
        id: userId,
        username: vid.user.username,
        profile_pic: vid.user.profile_pic
      })
    );
  }

  

  window.location.href = "fvidsprofile.html";
}

// Swipe logic
document.addEventListener("touchstart", (e) => {
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
  swipeActive = true;
}, { passive: true });

document.addEventListener("touchend", (e) => {
  if (!swipeActive) return;
  swipeActive = false;

  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;

  const diffX = endX - swipeStartX;
  const diffY = endY - swipeStartY;

  // ignore vertical scroll
  if (Math.abs(diffY) > Math.abs(diffX)) return;

  // 🔥 LEFT SWIPE → OPEN PROFILE
  if (diffX < -70) {
    openCurrentVideoProfile();
  }
});

// ---------------- INIT ----------------
window.onload = () => {

  createUploadItem();

  showUploadBanner();

  // ---------------- PROFILE OPEN ----------------

  const currentVideo =
    JSON.parse(
      localStorage.getItem(
        "currently_viewing"
      )
    );

  if (currentVideo) {

    videos = [currentVideo];
    currentIndex = 0;

    renderVideo(0);

    localStorage.removeItem(
      "currently_viewing"
    );

    showProfileViewerBar();

    return;
  }


  // ---------------- SHARED LINK ----------------

  if (sharedVideoId) {
    loadSingleVideo(sharedVideoId);
  } else {
    loadVideos();
  }

};

// Stop vid on page or app exit
window.addEventListener("pagehide", stopAllVideos);
window.addEventListener("beforeunload", stopAllVideos);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAllVideos();
});