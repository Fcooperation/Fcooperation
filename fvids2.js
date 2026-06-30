document.addEventListener("DOMContentLoaded", () => {

  let currentVideoId = null;
  let currentVideoUrl = null;
  let sheet;
let startY = 0;
  let commentPage = 1;
let commentHasMore = true;
let loadingComments = false;
let replyingTo = null;
let replyingToReply = false;
let replyingReplyId = null;
  
const replyPages = {};
const replyHasMore = {};
const loadingReplies = {}; 
const COMMENT_PREVIEW_LENGTH = 120;
const USERNAME_LIMIT = 16;
  
  sheet = document.getElementById("comments-sheet");

  // Reload Button 
  const reloadBtn =
  document.getElementById("reload-page-btn");

if (reloadBtn) {

  reloadBtn.addEventListener(
    "click",
    () => {

      reloadBtn.disabled = true;

      reloadBtn.textContent =
        "Reloading...";

      location.reload();
    }
  );
}

  // ---------------- OPEN COMMENTS ----------------
  window.openComments = function(videoId, videoUrl) {

  currentVideoId = videoId;
  currentVideoUrl = videoUrl;

  commentPage = 1;
  commentHasMore = true;

  document.getElementById("comments-list").innerHTML = "";

  document.getElementById("comments-sheet")
    .classList.remove("hidden");

  setTimeout(() => {
    document.getElementById("comments-sheet")
      .classList.add("show");

    history.pushState({ commentsOpen: true }, "");
  }, 10);

  loadComments(videoId, 1);
};

  // ---------------- LOAD COMMENTS ----------------
  async function loadComments(videoId, page = 1, append = false) {

  if (loadingComments || !commentHasMore) return;

  loadingComments = true;

  const list = document.getElementById("comments-list");
  const noComments = document.getElementById("no-comments");
    const spinner =
  document.getElementById("comments-loading");

spinner.classList.remove("hidden");

  try {

    const account =
  JSON.parse(localStorage.getItem("faccount")) || {};

const myId =
  account.userId || account.id || "";

const res = await fetch(
  `https://fweb-backend.onrender.com/fvids/comments?videoId=${videoId}&userId=${myId}&page=${page}&limit=20`
);

    const data = await res.json();

    spinner.classList.add("hidden");

    const comments = data.comments || [];

    if (!append) list.innerHTML = "";

    if (comments.length === 0 && page === 1) {

  noComments.style.display = "block";

  commentHasMore = false;

  spinner.classList.add("hidden");

  loadingComments = false;

  return;
}

    noComments.style.display = "none";

    comments.forEach(c => {

  const div = document.createElement("div");

div.className = "comment-item";

div.dataset.commentId = c.id;
  replyPages[c.id] = 1;
  replyHasMore[c.id] = true;
  loadingReplies[c.id] = false;

  let username = c.username || "Unknown";

  if (username.length > USERNAME_LIMIT) {
    username =
      username.slice(0, USERNAME_LIMIT) + "...";
  }

  const account =
    JSON.parse(
      localStorage.getItem("faccount")
    ) || {};

  const myId =
    account.userId || account.id;

  if (String(myId) === String(c.userId)) {
    username = "You";
  }

  let creatorBadge = "";

  if (
    String(c.userId) ===
    String(c.creatorId)
  ) {
    creatorBadge =
      `<span class="creator-badge">
        (creator)
      </span>`;
  }

  const fullText = c.text || "";

  let previewText = fullText;

  let readMoreHTML = "";

  if (
    fullText.length >
    COMMENT_PREVIEW_LENGTH
  ) {

    previewText =
      fullText.slice(
        0,
        COMMENT_PREVIEW_LENGTH
      ) + "...";

    readMoreHTML = `
  <span
    class="read-more-btn"
    data-full="${encodeURIComponent(fullText)}">
    Read more
  </span>
`;
  }

const profilePic = c.profile_pic;
const likeIcon = c.liked ? "❤️" : "🤍";
const initials = (username || "U")
  .replace("You", account.username || "You")
  .trim()
  .split(/\s+/)
  .map(name => name[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

div.innerHTML = `
  <div class="comment-header">

    ${
  profilePic
    ? `
      <img
        class="comment-avatar"
        src="${profilePic}"
        alt="profile"
      >
    `
    : `
      <div class="comment-avatar comment-avatar-fallback">
        ${initials}
      </div>
    `
}

    <div class="comment-user-block">

      <div class="comment-username">
  ${username}
  ${creatorBadge}
</div>

      <div class="comment-body">

  <div class="comment-text">
    ${previewText}
  </div>

  <div
    class="comment-like"
    data-comment-id="${c.id}"
    data-comment-user="${c.userId}"
  >

    <span class="comment-like-icon">${likeIcon}</span>

    <span class="comment-like-count">
      ${c.comment_likes_count || 0}
    </span>

  </div>

</div>

    </div>

  </div>

  <div class="replies-container"></div>

  <button
    class="view-replies-btn hidden"
    data-comment-id="${c.id}">
  </button>

  ${readMoreHTML}
`;

  list.appendChild(div);
      const viewBtn =
div.querySelector(".view-replies-btn");

if ((c.comment_replies_count || 0) > 0) {

  viewBtn.classList.remove("hidden");

  viewBtn.textContent =
    `View ${c.comment_replies_count} repl${c.comment_replies_count === 1 ? "y" : "ies"}`;

}
      
      div.addEventListener("click", (e) => {

  if (
  e.target.closest(".view-replies-btn") ||
  e.target.closest(".comment-like") ||
  e.target.closest(".reply-like") ||
  e.target.closest(".read-more-btn")
) {
  return;
}

  replyingTo = c;
  replyingToReply = false;
  replyingReplyId = null;

  let replyName = username;

  if (replyName.length > 15) {
    replyName = replyName.slice(0, 15) + "...";
  }

  commentInput.placeholder =
    `Reply to ${replyName}`;

  commentInput.focus();

  document.body.classList.add("reply-mode");

});
});

    commentHasMore = data.hasMore;

  } catch (err) {
    console.error("comments load error:", err);
  } finally {
    spinner.classList.add("hidden");
loadingComments = false;
  }
}

  // Load replies function 
  async function loadReplies(commentId,parent){

if(loadingReplies[commentId]) return;

if(replyHasMore[commentId]===false) return;

loadingReplies[commentId]=true;

const container =
parent.querySelector(".replies-container");

const btn =
parent.querySelector(".view-replies-btn");

    const originalText = btn.textContent;

btn.disabled = true;

btn.textContent = "Viewing...";

btn.style.opacity = "0.6";

btn.style.cursor = "wait";
    
try{

const account =
  JSON.parse(localStorage.getItem("faccount")) || {};

const userId =
  account.userId || account.id || "";

const res = await fetch(
  `https://fweb-backend.onrender.com/fvids-reply-comments?commentId=${commentId}&userId=${userId}&page=${replyPages[commentId]}&limit=5`
);

const data =
await res.json();

const replies =
data.replies || [];

if(replies.length===0){

replyHasMore[commentId]=false;

btn.remove();

return;

}

replies.forEach(r=>{

const username =
r.username || "Unknown";

const initials =
username
.split(/\s+/)
.map(x=>x[0])
.join("")
.slice(0,2)
.toUpperCase();

const div =
document.createElement("div");

div.className="reply-item";

div.innerHTML=`

<div class="comment-header">

${

r.profile_pic ?

`<img class="reply-avatar" src="${r.profile_pic}">`

:

`<div class="reply-avatar reply-avatar-fallback">${initials}</div>`

}

<div class="comment-user-block">

<div class="comment-username">

${
r.reply
?
`${username} → ${r.replyingToUsername}`
:
username
}

</div>

<div class="comment-body">

  <div class="comment-text">
    ${r.text}
  </div>

  <div
    class="reply-like"
    data-reply-id="${r.id}"
  >

    <span class="reply-like-icon">
      ${r.liked ? "❤️" : "🤍"}
    </span>

    <span class="reply-like-count">
      ${r.reply_likes_count || 0}
    </span>

  </div>

</div>

</div>

</div>

`;

container.appendChild(div);
 
  div.addEventListener("click", (e) => {

  if (
    e.target.closest(".reply-like")
  ) return;

  replyingTo = r;

  replyingToReply = true;

  replyingReplyId = r.id;

  commentInput.placeholder =
    `Reply to ${r.username}`;

  commentInput.focus();

  document.body.classList.add("reply-mode");

});

});

replyPages[commentId]++;

if (data.hasMore) {

  btn.disabled = false;

  btn.style.opacity = "1";

  btn.style.cursor = "pointer";

  btn.textContent = "View more replies";

} else {

  replyHasMore[commentId] = false;

  btn.remove();

}

}catch(err){

console.error(err);
  
  btn.disabled = false;

btn.style.opacity = "1";

btn.style.cursor = "pointer";

btn.textContent = originalText;

}

loadingReplies[commentId]=false;

}
  
  // Scroll to load more comments 
  document.getElementById("comments-list").addEventListener("scroll", () => {

  const list = document.getElementById("comments-list");

  if (
    list.scrollTop + list.clientHeight >= list.scrollHeight - 20
  ) {
    if (commentHasMore && !loadingComments) {
      commentPage++;
      loadComments(currentVideoId, commentPage, true);
    }
  }
});

  // Readmore logic 
  document.addEventListener("click", (e) => {

  if (!e.target.classList.contains("read-more-btn")) {
    return;
  }

  e.stopPropagation();

  const btn = e.target;

  const fullText = decodeURIComponent(
    btn.dataset.full
  );

  const commentText =
    btn.parentElement.querySelector(".comment-text");

  if (!commentText) return;

  commentText.textContent = fullText;

  btn.remove();
});

  // view replies button logic
  document.addEventListener("click", (e) => {

  const btn = e.target.closest(".view-replies-btn");

  if (!btn) return;

  e.stopPropagation();

  const parent =
    btn.closest(".comment-item");

  loadReplies(
    btn.dataset.commentId,
    parent
  );

});

  // ---------------- POST COMMENT ----------------
  const postBtn =
  document.getElementById("post-comment");
const commentInput =
document.getElementById("comment-input");
  
let postingComment = false;

  postBtn.addEventListener("click", async () => {

    if (postingComment) return;



    const account =
      JSON.parse(localStorage.getItem("faccount")) || {};

    const userId =
      account.userId || account.id;

    const input =
      document.getElementById("comment-input");

    const text =
      input.value.trim();

    if (!text) return;

    if (!userId) {
      showToast("Login required to comment");
      return;
    }

    postingComment = true;

postBtn.disabled = true;
postBtn.textContent = "Posting...";

    try {

      let url;
let payload;

if (replyingTo) {

  url =
    "https://fweb-backend.onrender.com/fvids-reply-comments";

  payload = {

    videoId: currentVideoId,

    commentId:
      replyingToReply
        ? replyingTo.commentId
        : replyingTo.id,

    commentUser: replyingTo.userId,

    videoUrl: currentVideoUrl,

    userId,

    replyText: text,

    reply: replyingToReply,

    replyId: replyingReplyId

};

} else {

  url =
    "https://fweb-backend.onrender.com/fvids/comment";

  payload = {

    videoId: currentVideoId,

    videoUrl: currentVideoUrl,

    userId,

    commentText: text

  };

}
      

      const res = await fetch(
  url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to post comment"
        );
      } 

      // ---------------- REPLY ----------------

if (replyingTo) {

const parentCommentId =
  replyingToReply
    ? replyingTo.commentId
    : replyingTo.id;

const parent = document.querySelector(
  `.comment-item[data-comment-id="${parentCommentId}"]`
);

  if (parent) {

    let username = account.username || "You";

    if (username.length > 15) {
      username =
        username.slice(0, 15) + "...";
    }

    const profilePic =
      account.profile_pic;

    const initials = username
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join("")
      .slice(0,2)
      .toUpperCase();

    const reply = document.createElement("div");

    reply.className = "reply-item";

    reply.innerHTML = `

<div class="comment-header">

  ${
    profilePic
      ? `
      <img
        class="reply-avatar"
        src="${profilePic}"
        alt="profile">
      `
      : `
      <div class="reply-avatar reply-avatar-fallback">
        ${initials}
      </div>
      `
  }

  <div class="comment-user-block">

    <div class="reply-username">

${
replyingToReply
?
`You → ${replyingTo.username}`
:
`You`
}

</div>

    <div class="comment-body">

      <div class="reply-text">
        ${text}
      </div>

    </div>

  </div>

</div>

`;

    
let repliesContainer =
  parent.querySelector(".replies-container");

if (!repliesContainer) {

  repliesContainer =
    document.createElement("div");

  repliesContainer.className =
    "replies-container";

  parent.appendChild(repliesContainer);

}

// Show the button if it was hidden
const btn =
  parent.querySelector(".view-replies-btn");

btn.classList.remove("hidden");

// Reload replies from the server

replyPages[parentCommentId] = 1;

repliesContainer.innerHTML = "";

loadReplies(parentCommentId, parent);

  }

  clearReplyMode();

  input.value = "";

  postingComment = false;

  postBtn.disabled = false;

  postBtn.textContent = "Post";

  return;

}

      // ---------- SAVE TO LOCAL STORAGE ----------
const localKey = `fvid_comments_${currentVideoId}`;

const existing =
  JSON.parse(localStorage.getItem(localKey)) || [];

existing.unshift({
  id: data.comment.id,
  text,
  userId,
  comment_likes_count: 0,
  createdAt: Date.now()
});

localStorage.setItem(
  localKey,
  JSON.stringify(existing)
);

      
      // ---------- UI SUCCESS ----------
      const list =
        document.getElementById("comments-list");

      const div =
document.createElement("div");

div.className = "comment-item";

div.dataset.commentId =
data.comment.id;

      const profilePic = account.profile_pic;

const initials = (account.username || "U")
  .trim()
  .split(/\s+/)
  .map(name => name[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

div.innerHTML = `
  <div class="comment-header">

    ${
      profilePic
        ? `
          <img
            class="comment-avatar"
            src="${profilePic}"
            alt="profile"
          >
        `
        : `
          <div class="comment-avatar comment-avatar-fallback">
            ${initials}
          </div>
        `
    }

    <div class="comment-user-block">

      <div class="comment-username">
        You
      </div>

      <div class="comment-body">

  <div class="comment-text">
    ${text}
  </div>

  <div
    class="comment-like"
    data-comment-id="${data.comment.id}"
    data-comment-user="${userId}"
  >

    <span class="comment-like-icon">🤍</span>

    <span class="comment-like-count">
      0
    </span>

  </div>

</div>

    </div>

  </div>
`;

      list.prepend(div);

      // Update comment count UI
const commentCount =
  document.querySelector(".comment-count");

if (commentCount) {

  let current =
    parseInt(commentCount.textContent || "0");

  const updated = current + 1;

  commentCount.textContent = updated;
}

// Update in-memory video object
const currentVideo =
  videos.find(v =>
    String(v.id || v._id) ===
    String(currentVideoId)
  );

if (currentVideo) {

  currentVideo.comment_count =
    (currentVideo.comment_count || 0) + 1;
}

      document.getElementById(
        "no-comments"
      ).style.display = "none";

      input.value = "";

    } catch (err) {

      console.error(err);

      showToast(
        err.message || "Failed to post comment"
      );
    } finally {

  postingComment = false;

  postBtn.disabled = false;

  postBtn.textContent = "Post";
    }

  });

  // Close comments section 
  document.addEventListener("click", (e) => {

  // Ignore Read more clicks
  if (e.target.closest(".read-more-btn")) {
    return;
  }

  const isOpen =
    sheet && sheet.classList.contains("show");

  if (!isOpen) return;

  const isInside =
    sheet.contains(e.target);

  if (!isInside) {
    closeComments();
  }
});

//Swipe down to close comments 
  sheet.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});
  sheet.addEventListener("touchend", (e) => {

  const endY = e.changedTouches[0].clientY;

  if (endY - startY > 80) {
    closeComments();
  }
});

  // Back button closes comments
window.addEventListener("popstate", () => {

  if (sheet.classList.contains("show")) {
    clearReplyMode();
    closeComments();
  }
});

  // Clear reply mode
  function clearReplyMode(){

  replyingTo = null;

  replyingToReply = false;

  replyingReplyId = null;

  commentInput.placeholder =
    "Write a comment...";

  document.body.classList.remove("reply-mode");

  }

  // Close function 

  function closeComments() {

  sheet.classList.remove("show");
    replyingTo = null;

commentInput.placeholder =
"Write a comment...";

document.body.classList.remove(
"reply-mode"
);

  setTimeout(() => {
    sheet.classList.add("hidden");
  }, 200);
  }

  // Comments like function
  document.addEventListener("click", async (e) => {

  const likeBtn =
    e.target.closest(".comment-like");

  if (!likeBtn) return;

  const account =
    JSON.parse(
      localStorage.getItem("faccount")
    ) || {};

  const userId =
    account.userId || account.id;

  if (!userId) {
    showToast("Login required");
    return;
  }

  const icon =
    likeBtn.querySelector(
      ".comment-like-icon"
    );

  const countEl =
    likeBtn.querySelector(
      ".comment-like-count"
    );

  const commentId =
    likeBtn.dataset.commentId;

  const commentUser =
    likeBtn.dataset.commentUser;

  let count =
    parseInt(countEl.textContent) || 0;

  const liked =
    icon.textContent === "❤️";

  if (liked) {

    icon.textContent = "🤍";
    count--;

  } else {

    icon.textContent = "❤️";
    count++;

    icon.classList.remove("liked-pop");

    void icon.offsetWidth;

    icon.classList.add("liked-pop");

  }

  countEl.textContent =
    Math.max(0, count);

    // ---------------- UPDATE LOCAL STORAGE ----------------
const localKey = `fvid_comments_${currentVideoId}`;

const localComments =
  JSON.parse(localStorage.getItem(localKey)) || [];

const comment = localComments.find(
  c => String(c.id) === String(commentId)
);

if (comment) {
  comment.comment_likes_count = Math.max(0, count);

  localStorage.setItem(
    localKey,
    JSON.stringify(localComments)
  );
}



  try {

    await fetch(
      "https://fweb-backend.onrender.com/fvids-like-comments",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          videoId: currentVideoId,

          commentId,

          commentUser,

          userId

        })

      }
    );

  } catch (err) {

    console.error(err);

  }

});

  // ---------------- REPLY LIKES ----------------
document.addEventListener("click", async (e) => {

  const likeBtn =
    e.target.closest(".reply-like");

  if (!likeBtn) return;

  const account =
    JSON.parse(localStorage.getItem("faccount")) || {};

  const userId =
    account.userId || account.id;

  if (!userId) {
    showToast("Login required");
    return;
  }

  const icon =
    likeBtn.querySelector(".reply-like-icon");

  const countEl =
    likeBtn.querySelector(".reply-like-count");

  const replyId =
    likeBtn.dataset.replyId;

  let count =
    parseInt(countEl.textContent) || 0;

  const liked =
    icon.textContent === "❤️";

  if (liked) {

    icon.textContent = "🤍";
    count--;

  } else {

    icon.textContent = "❤️";
    count++;

    icon.classList.remove("liked-pop");

    void icon.offsetWidth;

    icon.classList.add("liked-pop");

  }

  countEl.textContent =
    Math.max(0, count);

  try {

    await fetch(
      "https://fweb-backend.onrender.com/fvids-like-reply",
      {
        method: "POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          replyId,
          userId
        })
      }
    );

  } catch(err){

    console.error(err);

  }

});

  
  // Cancel reply mode
document.addEventListener("click",(e)=>{
  if(!replyingTo) return;

  if(
    e.target.closest(".comment-item") ||
    e.target.closest("#comment-input") ||
    e.target.closest("#post-comment")
  ){
    return;
  }

  clearReplyMode();

});
  
  // ---------------- TOAST ----------------
  function showToast(message) {

    let toast =
      document.getElementById("toast");

    if (!toast) {

      toast =
        document.createElement("div");

      toast.id = "toast";

      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = "toast show";

    setTimeout(() => {
      toast.className = "toast";
    }, 2500);
  }

});