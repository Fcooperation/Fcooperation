const container =
document.getElementById(
"followsContainer"
);

const inbox =
JSON.parse(
localStorage.getItem(
"finbox-main"
)
);

const follows =
inbox?.follows || [];

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

follows.forEach(follow=>{

const card=
document.createElement("div");

card.className=
"follow-card";

let avatar;

if(follow.profile_pic){

avatar=`
<div class="avatar">
<img src="${follow.profile_pic}">
</div>
`;

}else{

const initials=
(follow.username||"?")
.substring(0,2)
.toUpperCase();

avatar=`
<div class="avatar">
${initials}
</div>
`;

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