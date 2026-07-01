const container =
document.getElementById(
"commentsContainer"
);

const inbox =
JSON.parse(
localStorage.getItem(
"finbox-main"
)
);

const comments =
inbox?.comments || [];

// Latest first
comments.reverse();

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

comments.forEach(comment=>{

const card=
document.createElement("div");

card.className=
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

card.innerHTML=`

${avatar}

<div class="details">

<div class="username">

${comment.username}

</div>

<div class="action">

commented on your video 💬

</div>

</div>

`;

container.appendChild(card);

});

}