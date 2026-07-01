const container =
document.getElementById("commentsContainer");

const inbox =
JSON.parse(
localStorage.getItem("finbox-main")
) || {};

const comments =
inbox.comments || [];

// Time logic 
function formatTime(dateString) {

  const now = new Date();
  const date = new Date(dateString);

  const diff = now - date;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) {

    const mins = Math.max(1, Math.floor(diff / minute));
    return `${mins}m ago`;

  }

  if (diff < day) {

    const hrs = Math.floor(diff / hour);
    return `${hrs}h ago`;

  }

  if (diff < day * 2) {

    return `Yesterday ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })}`;

  }

  if (date.getFullYear() === now.getFullYear()) {

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short"
    });

  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

}

if(comments.length===0){

container.innerHTML=`
<div style="
text-align:center;
margin-top:40px;
color:#888;
">
No comments yet
</div>
`;

}else{

const newComments =
comments.filter(comment => comment.is_new);

const oldComments =
comments.filter(comment => !comment.is_new);

// Show NEW banner
if(newComments.length){

const banner =
document.createElement("div");

banner.className =
"new-banner";

banner.innerText =
"New";

container.appendChild(banner);

}

renderComments(newComments);

// Show Earlier banner
if(newComments.length && oldComments.length){

const banner =
document.createElement("div");

banner.className =
"new-banner";

banner.innerText =
"Earlier";

container.appendChild(banner);

}

renderComments(oldComments);

// Mark all as viewed
inbox.comments =
comments.map(comment => ({
...comment,
is_new:false
}));

localStorage.setItem(
"finbox-main",
JSON.stringify(inbox)
);

}

function renderComments(list){

list.forEach(comment=>{

const card =
document.createElement("div");

card.className =
"comment-card";

let avatar;

if(comment.profile_pic){

avatar=
`<div class="avatar">
<img src="${comment.profile_pic}" alt="">
</div>`;

}else{

const initials=
(comment.username||"?")
.substring(0,2)
.toUpperCase();

avatar=
`<div class="avatar">
${initials}
</div>`;

}

  const time = formatTime(comment.created_at);
  
card.innerHTML = `

${avatar}

<div class="details">

<div class="username">
${comment.username}
</div>

<div class="action">
${
  comment.type === "comment_reply"
    ? "replied to your comment "
  : comment.type === "reply_reply"
    ? "replied to your reply "
  : "commented on your video 💬"
}
</div>

<div class="comment-text">
"${
  comment.type === "comment_reply" ||
  comment.type === "reply_reply"
    ? (comment.reply_text || "")
    : (comment.comment_text || "")
}"
</div>
<div class="time">
${time}
</div>

</div>

<div class="video-thumb">

<img
src="${comment.video?.thumbnail_url || ""}"
alt=""
>

</div>

`;

  // Card redirect function 
  card.addEventListener("click", () => {

  if (!comment.video) return;

  localStorage.setItem(
    "currently_viewing",
    JSON.stringify(comment.video)
  );

  window.location.href = "fvids.html";

});

container.appendChild(card);

});

}