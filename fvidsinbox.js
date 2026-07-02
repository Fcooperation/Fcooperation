const authArea = document.getElementById("auth-area");
const inboxContainer = document.getElementById("inbox-container");

// NEW: create reload button state
let canReload = true;

function getInboxKey() {
  const account = JSON.parse(localStorage.getItem("faccount"));

  if (!account) return "finbox-main-guest";

  const userId = account.userId || account.id;

  return `finbox-main-${userId}`;
}

function render() {

  const account = JSON.parse(localStorage.getItem("faccount"));

  const isLoggedIn = account && (account.userId || account.id);

  if (isLoggedIn) {

    inboxContainer.classList.remove("hidden");
    authArea.innerHTML = "";

    setupInboxNavigation();

// Show only the latest cached notification (without unread badge)
const cached = loadInbox();

if (cached) {

  renderCard(
    cached.likes ? [cached.likes[0]] : [],
    "likesAvatar",
    "likesPreview",
    "likesDot",
    "likesCount",
    false
  );

  renderCard(
    cached.comments ? [cached.comments[0]] : [],
    "commentsAvatar",
    "commentsPreview",
    "commentsDot",
    "commentsCount",
    false
  );

  renderCard(
    cached.follows ? [cached.follows[0]] : [],
    "followsAvatar",
    "followsPreview",
    "followsDot",
    "followsCount",
    false
  );

}

// Then check server
fetchInbox();

  } else {

    inboxContainer.classList.add("hidden");

    authArea.innerHTML = `
      <button class="login-btn" id="loginBtn">
        Login to view Inbox
      </button>
    `;

    document.getElementById("loginBtn").onclick = () => {
      localStorage.setItem("redirectAfterLogin", "fvidsinbox.html");
      window.location.href = "login.html";
    };
  }
}

function setupInboxNavigation() {

  const likesBox = document.querySelectorAll(".inbox-box")[0];
  const commentsBox = document.querySelectorAll(".inbox-box")[1];
  const followsBox = document.querySelectorAll(".inbox-box")[2];
  const systemBox = document.querySelectorAll(".inbox-box")[3];

  likesBox.addEventListener("click", () => {
  localStorage.setItem("finbox-page", "likes");
  window.location.href = "finboxlikes.html";
});

commentsBox.addEventListener("click", () => {
  localStorage.setItem("finbox-page", "comments");
  window.location.href = "finboxcomments.html";
});

followsBox.addEventListener("click", () => {
  localStorage.setItem("finbox-page", "follows");
  window.location.href = "finboxfollows.html";
});

systemBox.addEventListener("click", () => {
  localStorage.setItem("finbox-page", "system");
  window.location.href = "finboxsystem.html";
});
}

// Render inbox data 
function renderInbox(data) {

  renderCard(
  data.likes || [],
  "likesAvatar",
  "likesPreview",
  "likesDot",
  "likesCount",
  hasUnread(data.likes)
);

renderCard(
  data.comments || [],
  "commentsAvatar",
  "commentsPreview",
  "commentsDot",
  "commentsCount",
  hasUnread(data.comments)
);

renderCard(
  data.follows || [],
  "followsAvatar",
  "followsPreview",
  "followsDot",
  "followsCount",
  hasUnread(data.follows)
);
}

// Render Cards
function renderCard(
  list,
  avatarId,
  previewId,
  dotId,
  countId,
  showDot
) {

  const avatar = document.getElementById(avatarId);
  const preview = document.getElementById(previewId);
  const dot = document.getElementById(dotId);
  const count =
  document.getElementById(countId);
  
  const card = dot.closest(".inbox-box");

  if (!list.length) {

    avatar.innerHTML = "";
    preview.innerText = "No new notifications";
    dot.classList.add("hidden");
    count.classList.add("hidden");
count.innerText = "";
    return;

  }

  const last = [...list].sort(
  (a, b) => new Date(b.created_at) - new Date(a.created_at)
)[0];

let actionText;

switch (last.type) {

  case "video_like":
    actionText = "liked your video";
    break;

  case "comment_like":
    actionText = "liked your comment";
    break;

  case "comment_reply":
    actionText = "replied to your comment";
    break;

  case "reply_reply":
    actionText = "replied to your reply";
    break;

    case "follow":
  actionText = "started following you";
  break;

  default:
    actionText = "commented on your video";
}

if (list.length === 1) {

  preview.innerText =
    `${last.username} ${actionText}`;

} else if (list.length === 2) {

  preview.innerText =
    `${last.username} and 1 other ${actionText}`;

} else {

  preview.innerText =
    `${last.username} and ${list.length - 1} others ${actionText}`;

}

  if(showDot){

  dot.classList.remove("hidden");

  count.classList.remove("hidden");
  count.innerText = list.length;

}else{

  dot.classList.add("hidden");

  count.classList.add("hidden");
  count.innerText = "";

  }

  if (last.profile_pic) {

    avatar.innerHTML =
      `<img src="${last.profile_pic}">`;

  } else {

    const initials =
      last.username
        .substring(0,2)
        .toUpperCase();

    avatar.innerHTML =
      `<span>${initials}</span>`;

  }

  card.onclick = () => {

  dot.classList.add("hidden");
  count.classList.add("hidden");
  count.innerText = "";

};

}

// Helper to fetch or load data from localstorage
function saveInbox(newData){

  const oldData = loadInbox() || {};

  // Mark newly fetched notifications
newData.likes = (newData.likes || []).map(item => ({
  ...item,
  is_new: true
}));

newData.comments = (newData.comments || []).map(item => ({
  ...item,
  is_new: true
}));

newData.follows = (newData.follows || []).map(item => ({
  ...item,
  is_new: true
}));

newData.system = (newData.system || []).map(item => ({
  ...item,
  is_new: true
}));

  function merge(newList = [], oldList = [], idField){

    const map = new Map();

    [...oldList, ...newList].forEach(item => {
      map.set(
        item[idField] + "_" + item.created_at,
        item
      );
    });

    return [...map.values()];
  }

  const merged = {

  likes: merge(
    newData.likes,
    oldData.likes,
    "user_id"
  ).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  ),

  comments: merge(
    newData.comments,
    oldData.comments,
    "user_id"
  ).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  ),

  follows: merge(
    newData.follows,
    oldData.follows,
    "follower_id"
  ).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  ),

  system: merge(
    newData.system,
    oldData.system,
    "id"
  ).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

};

  localStorage.setItem(
  getInboxKey(),
  JSON.stringify(merged)
);

}
function loadInbox(){

  return JSON.parse(
  localStorage.getItem(getInboxKey())
);

}

function hasUnread(list = []) {
  return list.some(item => item.is_new);
}

function showLoading(){

document
.getElementById("loadingBanner")
.classList.remove("hidden");

}

function hideLoading(){

document
.getElementById("loadingBanner")
.classList.add("hidden");

}

function getNewItems(newList = [], oldList = [], idField) {

  const existing = new Set(
    oldList.map(
      item => item[idField] + "_" + item.created_at
    )
  );

  return newList.filter(
    item =>
      !existing.has(
        item[idField] + "_" + item.created_at
      )
  );

}

// ==========================
// NEW: FETCH INBOX FUNCTION
// ==========================
async function fetchInbox() {

  const account = JSON.parse(localStorage.getItem("faccount"));
  if (!account) return;

  showLoading();



  try {

    const res = await fetch("https://fweb-backend.onrender.com/finbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  userId: account.userId || account.id,
  type: "main"
})
    });

    const data = await res.json();

    const oldInbox = loadInbox() || {};

saveInbox(data.data);

const inbox = loadInbox();

    const newBatch = {

  likes: getNewItems(
    data.data.likes || [],
    oldInbox.likes || [],
    "user_id"
  ),

  comments: getNewItems(
    data.data.comments || [],
    oldInbox.comments || [],
    "user_id"
  ),

  follows: getNewItems(
    data.data.follows || [],
    oldInbox.follows || [],
    "follower_id"
  )

};

const hasNewLikes = hasUnread(inbox.likes);
const hasNewComments = hasUnread(inbox.comments);
const hasNewFollows = hasUnread(inbox.follows);

    console.log("📩 FinBox data:", data);

    if (!data.success) return;

const likes = data.data.likes || [];
const comments = data.data.comments || [];
const follows = data.data.follows || [];

if (
  newBatch.likes.length ||
  newBatch.comments.length ||
  newBatch.follows.length
) {

  renderInbox(newBatch);

} else {

}

    hideLoading();
    
  } catch (err) {

    hideLoading();
    
    console.error("Inbox fetch error:", err);
  }
}

// ==========================
// NEW: RELOAD BUTTON LOGIC
// ==========================
async function reloadInbox() {

  if (!canReload) return;

  const btn = document.getElementById("reloadBtn");

  canReload = false;

  btn.innerText = "Reloading...";

  await fetchInbox();

  let timeLeft = 5;

  btn.innerText = `Sent ✓ (${timeLeft}s)`;

  const interval = setInterval(() => {

    timeLeft--;

    if (timeLeft > 0) {
      btn.innerText = `Sent ✓ (${timeLeft}s)`;
    } else {

      clearInterval(interval);

      btn.innerText = "Reload";
      canReload = true;
    }

  }, 1000);
}

render();