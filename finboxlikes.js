const container =
document.getElementById(
"likesContainer"
);

const inbox =
JSON.parse(
localStorage.getItem(
"finbox-main"
)
);

const likes =
inbox?.likes || [];

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

likes.forEach(like=>{

const card=
document.createElement("div");

card.className=
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

card.innerHTML=`

${avatar}

<div class="details">

<div class="username">

${like.username}

</div>

<div class="action">

liked your video ❤️

</div>

</div>

`;

container.appendChild(card);

});

}