const container =
document.getElementById(
"systemContainer"
);

const inbox =
JSON.parse(
localStorage.getItem(
"finbox-main"
)
);

const system =
inbox?.system || [];

system.reverse();

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

system.forEach(item=>{

const card=
document.createElement("div");

card.className=
"system-card";

card.innerHTML=`

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

</div>

`;

container.appendChild(card);

});

}