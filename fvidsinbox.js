const authArea = document.getElementById("auth-area");
const inboxContainer = document.getElementById("inbox-container");

// NEW: create reload button state
let canReload = true;

function render() {

  const account = JSON.parse(localStorage.getItem("faccount"));

  const isLoggedIn = account && (account.userId || account.id);

  if (isLoggedIn) {

    inboxContainer.classList.remove("hidden");
    authArea.innerHTML = "";

    setupInboxNavigation();

// Show cached inbox first
const cached = loadInbox();

if(cached){
  renderInbox(cached, false);
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

  likesBox.onclick = () => {

    localStorage.setItem(
        "finbox-page",
        "likes"
    );

    window.location.href =
      "finboxlikes.html";

};
  commentsBox.onclick = () => {

    localStorage.setItem(
        "finbox-page",
        "comments"
    );

    window.location.href =
      "finboxcomments.html";

};
  followsBox.onclick = () => {

    localStorage.setItem(
        "finbox-page",
        "follows"
    );

    window.location.href =
      "finboxfollows.html";

};
  systemBox.onclick = () => {

    localStorage.setItem(
        "finbox-page",
        "system"
    );

    window.location.href =
      "finboxsystem.html";

};
}

// Render inbox data 
function renderInbox(data, showDots = true) {

  renderCard(
  data.likes || [],
  "likesAvatar",
  "likesPreview",
  "likesDot",
  "liked your video",
  showDots
);

  renderCard(
  data.comments || [],
  "commentsAvatar",
  "commentsPreview",
  "commentsDot",
  "commented on your video",
  showDots
);

  renderCard(
  data.follows || [],
  "followsAvatar",
  "followsPreview",
  "followsDot",
  "started following you",
  showDots
);

}

// Render Cards
function renderCard(
  list,
  avatarId,
  previewId,
  dotId,
  actionText,
  showDot
) {

  const avatar = document.getElementById(avatarId);
  const preview = document.getElementById(previewId);
  const dot = document.getElementById(dotId);

  if (!list.length) {

    avatar.innerHTML = "";
    preview.innerText = "No new notifications";
    dot.classList.add("hidden");
    return;

  }

  const last = list[0];

  preview.innerText =
    `${last.username} ${actionText}`;

  if(showDot){
    dot.classList.remove("hidden");
}else{
    dot.classList.add("hidden");
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

}

// Helper to fetch or load data from localstorage
function saveInbox(newData){

  const oldData = loadInbox() || {};

  function merge(newList = [], oldList = [], idField){

    const map = new Map();

    [...newList, ...oldList].forEach(item => {
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
    ),

    comments: merge(
      newData.comments,
      oldData.comments,
      "user_id"
    ),

    follows: merge(
      newData.follows,
      oldData.follows,
      "follower_id"
    ),

    system: merge(
      newData.system,
      oldData.system,
      "id"
    )

  };

  localStorage.setItem(
    "finbox-main",
    JSON.stringify(merged)
  );

}
function loadInbox(){

  return JSON.parse(
    localStorage.getItem("finbox-main")
  );

}

// ==========================
// NEW: FETCH INBOX FUNCTION
// ==========================
async function fetchInbox() {

  const account = JSON.parse(localStorage.getItem("faccount"));
  if (!account) return;

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

    saveInbox(data.data);

    console.log("📩 FinBox data:", data);

    if (!data.success) return;

const likes = data.data.likes || [];
const comments = data.data.comments || [];
const follows = data.data.follows || [];

renderInbox(loadInbox(), true);
    
  } catch (err) {
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