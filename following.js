const account =
JSON.parse(
localStorage.getItem("faccount")
) || {};

const myUserId =
account.userId ||
account.id;

const viewingUserId =
localStorage.getItem(
"view-follow-user"
);

const followingList =
document.getElementById(
"following-list"
);

const loadMoreBtn =
document.getElementById(
"load-more-btn"
);

let page = 1;
let loading = false;
let hasMore = true;

// ---------------- BACK ----------------

document
.getElementById("back-btn")
.onclick = () => {

history.back();

};

// ---------------- LOAD ----------------

async function loadFollowing(
append = false
){

if(
loading ||
!hasMore
) return;

loading = true;

if(!append){

followingList.innerHTML = `
<div class="loading">
Loading following...
</div>
`;

}

try{

const res =
await fetch(
`https://fweb-backend.onrender.com/fvids/following?id=${viewingUserId}&page=${page}&limit=20`
);

const data =
await res.json();

if(!append){

followingList.innerHTML = "";

}

if(
!Array.isArray(data) ||
data.length===0
){

hasMore=false;

if(!append){

followingList.innerHTML=`
<div class="empty">
No following
</div>
`;

}

loadMoreBtn.classList.add(
"hidden"
);

return;

}

data.forEach(user=>{

const card =
document.createElement("div");

card.className =
"follow-card";

card.innerHTML=`

<img
class="follow-pic"
src="${
user.profile_pic ||
'https://via.placeholder.com/150'
}">

<div class="follow-info">

<div class="follow-name">
${user.username}
</div>

</div>

<button class="message-btn">
Message
</button>

<button class="follow-btn following">
Unfollow
</button>

`;

card.onclick=()=>{

localStorage.setItem(
"view_profile",
user.following_id
);

window.location.href =
"fvidsprofile.html";

};

// MESSAGE

card
.querySelector(".message-btn")
.onclick=e=>{

e.stopPropagation();

localStorage.setItem(
"chatting_with",

JSON.stringify({

id:user.following_id,

username:user.username,

profile_pic:user.profile_pic

})
);

window.location.href =
"chat.html";

};

// UNFOLLOW

card
.querySelector(".follow-btn")
.onclick=async e=>{

e.stopPropagation();

const btn=e.target;

try{

const res=
await fetch(
"https://fweb-backend.onrender.com/follow",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

followerId:myUserId,

followingId:user.following_id,

action:"unfollow"

})

}

);

const result =
await res.json();

if(result.success){

card.remove();

}

}catch(err){

console.error(err);

}

};

followingList.appendChild(card);

});

page++;

loadMoreBtn.classList.remove(
"hidden"
);

}catch(err){

console.error(err);

followingList.innerHTML=`
<div class="empty">
Failed to load following
</div>
`;

}

loading=false;

}

loadMoreBtn.onclick=()=>{

loadFollowing(true);

};

loadFollowing();