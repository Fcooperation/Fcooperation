const container =
document.getElementById("followsContainer");

const inbox =
JSON.parse(
localStorage.getItem("finbox-main")
) || {};

const follows =
inbox.follows || [];

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

if(follows.length===0){

container.innerHTML=`
<div style="
text-align:center;
margin-top:40px;
color:#888;
">
No new followers
</div>
`;

}else{

const newFollows =
follows.filter(follow => follow.is_new);

const oldFollows =
follows.filter(follow => !follow.is_new);

// Show NEW banner
if(newFollows.length){

const banner =
document.createElement("div");

banner.className =
"new-banner";

banner.innerText =
"New";

container.appendChild(banner);

}

renderFollows(newFollows);

// Show Earlier banner
if(newFollows.length && oldFollows.length){

const banner =
document.createElement("div");

banner.className =
"new-banner";

banner.innerText =
"Earlier";

container.appendChild(banner);

}

renderFollows(oldFollows);

// Mark all as viewed
inbox.follows =
follows.map(follow => ({
...follow,
is_new:false
}));

localStorage.setItem(
"finbox-main",
JSON.stringify(inbox)
);

}

function renderFollows(list){

list.forEach(follow=>{

const card =
document.createElement("div");

card.className =
"follow-card";

let avatar;

if(follow.profile_pic){

avatar=`
<div class="avatar">
<img src="${follow.profile_pic}">
</div>`;

}else{

const initials=
(follow.username||"?")
.substring(0,2)
.toUpperCase();

avatar=`
<div class="avatar">
${initials}
</div>`;

}

  const time = formatTime(follow.created_at);

card.innerHTML=`

${avatar}

<div class="details">

<div class="username">
${follow.username}
</div>

<div class="action">
started following you 👤
</div>

<div class="time">
${time}
</div>

</div>

`;

  card.addEventListener("click", () => {

  // Save the profile being viewed
  localStorage.setItem(
    "view_profile",
    String(follow.follower_id || follow.user_id || follow.id)
  );

  // Save profile details for instant UI
  localStorage.setItem(
    "viewing_user_profile",
    JSON.stringify({
      id: String(follow.follower_id || follow.user_id || follow.id),
      username: follow.username,
      profile_pic: follow.profile_pic
    })
  );

  // Save where user came from
  localStorage.setItem(
    "redirect",
    "finboxfollows.html"
  );

  // Open profile
  window.location.href = "fvidsprofile.html";

});



container.appendChild(card);

});

}