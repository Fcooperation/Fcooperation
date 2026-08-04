const API =
`${window.CONFIG.API_URL}`;

const account =
JSON.parse(
localStorage.getItem(
"faccount"
));

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

const CHAT_STORAGE =
"fchat_messages";

/* ---------- LOAD MESSAGES ---------- */
function loadMessages(){
const chats =
JSON.parse(
localStorage.getItem(
CHAT_STORAGE
)
) || {};

const messages =

chats[account.id]?.[chattingWith.id]

|| [];

messages.forEach(

message=>{

renderMessage(
message
);

}

);

requestAnimationFrame(()=>{

chatBody.scrollTop =
chatBody.scrollHeight;

});

}

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
loadMessages();
}

/* ---------- RENDER ---------- */
function renderMessage(
message
){

const bubble =
document.createElement("div");

bubble.className =

message.senderId === account.id ?

"message sent" :

"message received";

bubble.dataset.id =
message.messageId;

const messageText =
document.createElement("div");

messageText.className =
"message-text";

messageText.textContent =
message.message;

bubble.appendChild(
messageText
);

const timeElement =
document.createElement("div");

timeElement.className =
"message-time";

timeElement.textContent =
message.time;

bubble.appendChild(
timeElement
);

const messageStatus =
document.createElement("div");

messageStatus.className =
"message-status";

messageStatus.textContent =
message.status;

bubble.appendChild(
messageStatus
);

enableReplyJump(
bubble
);

enableReplySwipe(
bubble
);

chatBody.appendChild(
bubble
);

return {

bubble,

messageStatus

};

}


/* ---------- SEND ---------- */

sendBtn.onclick =
sendMessage;

async function sendMessage(){

const text =
input.value.trim();
const now =
new Date();

const timestamp =
Date.now();

const time =
now.toLocaleTimeString(
[],
{
hour:"numeric",
minute:"2-digit"
}
);

if(!text) return;

const messageId =
"msg_" +
Date.now() +
"_" +
Math.floor(
Math.random()*10000
);

const payload = {

messageId,

senderId: account.id,
receiverId: chattingWith.id,

message:
text,

replyToId:
replyingTo ?
replyingTo.id :
null

};

const savedMessage = {

...payload,

time,

timestamp,

status:"Sending"

};

const chats =
JSON.parse(
localStorage.getItem(
CHAT_STORAGE
)
) || {};

if(!chats[account.id]){

chats[account.id] = {};

}

if(!chats[account.id][chattingWith.id]){

chats[account.id][chattingWith.id] = [];

}

chats[account.id][chattingWith.id]
.push(savedMessage);

localStorage.setItem(

CHAT_STORAGE,

JSON.stringify(chats)

);

const rendered =

renderMessage(
savedMessage
);

input.value="";

replyingTo = null;

replyPreview.hidden = true;

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

try{

const res =
await fetch(
API +
"/send-message",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify(
payload
)

});

if(res.ok){

rendered.messageStatus.textContent =
"Sent";

savedMessage.status =
"Sent";

localStorage.setItem(

CHAT_STORAGE,

JSON.stringify(chats)

);

}else{

rendered.messageStatus.textContent =
"Pending";

savedMessage.status =
"Pending";

localStorage.setItem(

CHAT_STORAGE,

JSON.stringify(chats)

);
}

}catch(err){

rendered.messageStatus.textContent =
"Pending";

savedMessage.status =
"Pending";

localStorage.setItem(

CHAT_STORAGE,

JSON.stringify(chats)

);

}

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