const container =
document.getElementById("systemContainer");

const inbox =
JSON.parse(
localStorage.getItem("finbox-main")
) || {};

const system =
inbox.system || [];

if(system.length===0){

container.innerHTML=`
<div style="
text-align:center;
margin-top:40px;
color:#888;
">
No system notifications
</div>
`;

}else{

const newSystem =
system.filter(item => item.is_new);

const oldSystem =
system.filter(item => !item.is_new);

// Show NEW banner
if(newSystem.length){

const banner =
document.createElement("div");

banner.className =
"new-banner";

banner.innerText =
"New";

container.appendChild(banner);

}

renderSystem(newSystem);

// Show Earlier banner
if(newSystem.length && oldSystem.length){

const banner =
document.createElement("div");

banner.className =
"new-banner";

banner.innerText =
"Earlier";

container.appendChild(banner);

}

renderSystem(oldSystem);

// Mark all as viewed
inbox.system =
system.map(item => ({
...item,
is_new:false
}));

localStorage.setItem(
"finbox-main",
JSON.stringify(inbox)
);

}

function renderSystem(list){

list.forEach(item=>{

const card =
document.createElement("div");

card.className =
"system-card";

card.innerHTML = `

<div class="avatar">
S
</div>

<div class="details">

<div class="title">
${item.title}
</div>

<div class="message">
${item.message}
</div>

<div class="time">
${time}
</div>

</div>

`;

container.appendChild(card);

});

}