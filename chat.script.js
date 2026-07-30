const chattingWith =
JSON.parse(
localStorage.getItem(
"chatting_with"
));

const profilePic =
document.getElementById(
"profile-pic"
);

const username =
document.getElementById(
"username"
);

const status =
document.getElementById(
"status"
);

const chatBody =
document.getElementById(
"chat-body"
);

const input =
document.getElementById(
"message-input"
);

const sendBtn =
document.getElementById(
"send-btn"
);

const replyPreview =
document.getElementById(
"reply-preview"
);

const replyName =
document.getElementById(
"reply-name"
);

const replyText =
document.getElementById(
"reply-text"
);

const replyClose =
document.getElementById(
"reply-close"
);

let replyingTo =
null;


/* ---------- USER ---------- */

if(chattingWith){

username.textContent =
chattingWith.username;

status.textContent =
"Active now";

if(chattingWith.profilePic){

profilePic.innerHTML=
`
<img
src="${chattingWith.profilePic}"
style="
width:100%;
height:100%;
border-radius:50%;
object-fit:cover;
">
`;

}else{

profilePic.textContent =
chattingWith.username[0]
.toUpperCase();

}

}


/* ---------- SEND ---------- */

sendBtn.onclick =
sendMessage;

function sendMessage(){

const text =
input.value.trim();
const now =
new Date();

const time =
now.toLocaleTimeString(
[],
{
hour:"numeric",
minute:"2-digit"
}
);

if(!text) return;

const bubble =
document.createElement("div");

bubble.className =
"message sent";

const messageId =
"msg_" +
Date.now() +
"_" +
Math.floor(
Math.random()*10000
);

bubble.dataset.id =
messageId;


if(replyingTo){

const linked =
document.createElement("div");

linked.className =
"linked-preview";

linked.dataset.target =
replyingTo.id;

linked.innerHTML =
`
<div class="linked-name">
${replyName.textContent}
</div>

<div class="linked-text">
${replyingTo.text}
</div>
`;

bubble.appendChild(
linked
);

}


const messageText =
document.createElement("div");

messageText.className =
"message-text";

messageText.textContent =
text;

bubble.appendChild(
messageText
);

const timestamp =
document.createElement("div");

timestamp.className =
"message-time";

timestamp.textContent =
time;

bubble.appendChild(
timestamp
);

enableReplyJump(
bubble
);

chatBody.appendChild(
bubble
);

enableReplySwipe(
bubble
);

input.value="";

replyingTo = null;

replyPreview.hidden = true;

chatBody.scrollTop =
chatBody.scrollHeight;

}


/* ---------- SWIPE ---------- */

function enableReplySwipe(
message
){

let startX = 0;

let triggered = false;

message.onpointerdown =
e=>{

startX =
e.clientX;

triggered =
false;

};

message.onpointermove =
e=>{

const diff =
e.clientX -
startX;

if(diff<0)
return;

message.style.transform =
`translateX(${Math.min(diff,70)}px)`;

if(
diff>55 &&
!triggered
){

triggered=true;

navigator.vibrate?.(
20
);

replyingTo = {

id: message.dataset.id,

text: message.lastElementChild.textContent,

sender: replyName.textContent,

element: message

};

replyName.textContent =
chattingWith.username;

replyText.textContent =
replyingTo.text;

replyPreview.hidden =
false;

}

};

function reset(){

message.style.transform =
"translateX(0)";

}

message.onpointerup =
reset;

message.onpointercancel =
reset;

}

// Scroll and highlight message on preview click
function enableReplyJump(
message
){

const preview =

message.querySelector(
".linked-preview"
);

if(!preview)
return;

preview.onclick =
()=>{

const target =

document.querySelector(
`[data-id="${preview.dataset.target}"]`
);

if(!target)
return;

target.scrollIntoView({

behavior:"smooth",

block:"center"

});

let lastTop =
null;

const wait =
setInterval(()=>{

const top =
target.getBoundingClientRect().top;

if(
lastTop !== null &&
Math.abs(top - lastTop) < 1
){

clearInterval(wait);

target.classList.add(
"reply-highlight"
);

setTimeout(()=>{

target.classList.remove(
"reply-highlight"
);

},1200);

}

lastTop = top;

},16);

};

}

/* ---------- CLOSE ---------- */

replyClose.onclick=()=>{

replyingTo=null;

replyPreview.hidden=true;

};