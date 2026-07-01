const container =
document.getElementById("likesContainer");

const inbox =
JSON.parse(
localStorage.getItem("finbox-main")
) || {};

const likes =
inbox.likes || [];

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

card.innerHTML = `

${avatar}

<div class="details">

<div class="username">
${like.username}
</div>

<div class="action">
liked your video ❤️
</div>

</div>

<div class="video-thumb">

<img
src="${like.thumbnail_url}"
alt=""
>

</div>

`;

container.appendChild(card);

});

}