const container =
document.getElementById("likesContainer");

const inbox =
JSON.parse(
localStorage.getItem("finbox-main")
) || {};

const likes =
inbox.likes || [];

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

if(likes.length===0){

container.innerHTML=`
<div style="
text-align:center;
margin-top:40px;
color:#888;
">
No likes yet
</div>
`;

}else{

const newLikes =
likes.filter(like => like.is_new);

const oldLikes =
likes.filter(like => !like.is_new);

// Show NEW banner
if(newLikes.length){

const banner =
document.createElement("div");

banner.className =
"new-banner";

banner.innerText =
"New";

container.appendChild(banner);

}

renderLikes(newLikes);

// Show Earlier banner
if(newLikes.length && oldLikes.length){

const banner =
document.createElement("div");

banner.className =
"new-banner";

banner.innerText =
"Earlier";

container.appendChild(banner);

}

renderLikes(oldLikes);

// Mark all as viewed
inbox.likes =
likes.map(like => ({
...like,
is_new:false
}));

localStorage.setItem(
"finbox-main",
JSON.stringify(inbox)
);

}


// Render likes list
function renderLikes(list){

list.forEach(like=>{

const card =
document.createElement("div");

card.className =
"like-card";

let avatar;

if(like.profile_pic){

avatar=
`<div class="avatar">
<img src="${like.profile_pic}">
</div>`;

}else{

const initials=
(like.username||"?")
.substring(0,2)
.toUpperCase();

avatar=
`<div class="avatar">
${initials}
</div>`;

}

const time = formatTime(like.created_at);

card.innerHTML = `

${avatar}

<div class="details">

<div class="username">
${like.username}
</div>

<div class="action">
${
  like.type === "comment_like"
    ? `liked your comment "${like.comment_text || ""}" `
    : "liked your video ❤️"
}
</div>

<div class="time">
${time}
</div>

</div>

<div class="video-thumb">

<img
src="${like.video?.thumbnail_url || ""}"
alt=""
>

</div>

`;

  // Card redirect function
card.addEventListener("click", () => {

  if (!like.video) return;

  localStorage.setItem(
    "currently_viewing",
    JSON.stringify(like.video)
  );

  window.location.href = "fvids.html";

});
  
container.appendChild(card);

});

}