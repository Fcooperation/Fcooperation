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

window.addEventListener(
"load",
receiveMessages
);

async function receiveMessages(){

try{

const res =
await fetch(

API +
"/receive-messages",

{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

userId:
account.id,

chattingWithId:
chattingWith.id

})

}

);

const data =
await res.json();

console.log(data);

}catch(err){

console.error(err);

}

}