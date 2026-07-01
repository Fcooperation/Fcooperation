const container =
document.getElementById("commentsContainer");

const inbox =
JSON.parse(
localStorage.getItem("finbox-main")
) || {};

const comments =
inbox.comments || [];

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

card.innerHTML = `

${avatar}

<div class="details">

<div class="username">
${comment.username}
</div>

<div class="action">
commented on your video 💬
</div>

<div class="comment-text">
"${comment.comment_text || ""}"
</div>

</div>

<div class="video-thumb">

<img
src="${comment.thumbnail_url}"
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