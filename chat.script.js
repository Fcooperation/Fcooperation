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

if(!text) return;

const bubble =
document.createElement("div");

bubble.className =
"message sent";

bubble.textContent =
text;

chatBody.appendChild(
bubble
);

enableReplySwipe(
bubble
);

input.value="";

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

replyingTo =
message;

replyName.textContent =
chattingWith.username;

replyText.textContent =
message.textContent;

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


/* ---------- CLOSE ---------- */

replyClose.onclick=()=>{

replyingTo=null;

replyPreview.hidden=true;

};