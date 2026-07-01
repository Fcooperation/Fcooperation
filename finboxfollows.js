const container =
document.getElementById("followsContainer");

const inbox =
JSON.parse(
localStorage.getItem("finbox-main")
) || {};

const follows =
inbox.follows || [];

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

card.innerHTML=`

${avatar}

<div class="details">

<div class="username">
${follow.username}
</div>

<div class="action">
started following you 👤
</div>

</div>

`;

container.appendChild(card);

});

}