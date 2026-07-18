const chattingWith =
JSON.parse(
localStorage.getItem(
"chatting_with"
)
);

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


// ----------------------
// Load User
// ----------------------

if(chattingWith){

username.textContent =
chattingWith.username;

status.textContent =
"Active now";

if(chattingWith.profilePic){

profilePic.innerHTML =
`<img
src="${chattingWith.profilePic}"
style="
width:100%;
height:100%;
border-radius:50%;
object-fit:cover;
">`;

}else{

profilePic.textContent =
chattingWith.username
.charAt(0)
.toUpperCase();

}

}


// ----------------------
// Send Message
// ----------------------

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

input.value="";

chatBody.scrollTop =
chatBody.scrollHeight;

}


// ----------------------

sendBtn.onclick =
sendMessage;


// ----------------------

input.addEventListener(
"keydown",
e=>{

if(
e.key==="Enter" &&
!e.shiftKey
){

e.preventDefault();

sendMessage();

}

}
);