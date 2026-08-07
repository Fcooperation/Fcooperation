import {
createClient
}
from
"https://esm.sh/@supabase/supabase-js";

const supabase =
createClient(

window.CONFIG.SUPABASE_URL,

window.CONFIG.SUPABASE_ANON_KEY

);

const account =
JSON.parse(
localStorage.getItem(
"faccount"
));

window.addEventListener(

"load",

receiveMessages

);

// RECEIVE MESSAGES
async function receiveMessages(){

try{

const res =
await fetch(

window.CONFIG.API_URL +
"/receive-messages",

{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

userId:
account.id

})

}

);

const data =
await res.json();

if(
!data.success ||
!Array.isArray(data.messages)
){

return;

}

const chats =
JSON.parse(
localStorage.getItem(
"fchat_messages"
)
) || {};


/* Make sure this user's storage exists */

if(!chats[account.id]){

chats[account.id] = {};

}


/* Save every message */

data.messages.forEach(
message=>{

const senderId =
message.sender_id;

const receiverId =
message.receiver_id;


/*
The other person in this
conversation
*/

const otherUserId =

senderId === account.id ?

receiverId :

senderId;


/*
Create conversation
if it doesn't exist
*/

if(
!chats[account.id][otherUserId]
){

chats[account.id][otherUserId] =
[];

}


/*
Prevent duplicate messages
*/

const alreadyExists =

chats[account.id][otherUserId]
.some(

saved =>

saved.messageId ===
message.message_id

);

if(alreadyExists){

return;

}


/*
Convert backend message
to FCHAT local format
*/

const createdAt =
new Date(
message.created_at
);

const savedMessage = {

messageId:
message.message_id,

senderId:
message.sender_id,

receiverId:
message.receiver_id,

message:
message.message,

replyToId:
message.reply_to_id,

time:
createdAt.toLocaleTimeString(
[],
{
hour:"numeric",
minute:"2-digit"
}
),

timestamp:
createdAt.getTime(),

status:
message.status === "sent" ?
"Sent" :
message.status,

};


/*
Save it
*/

chats[account.id][otherUserId]
.push(
savedMessage
);

});


/*
Save everything back
*/

localStorage.setItem(

"fchat_messages",

JSON.stringify(chats)

);

alert(
"Saved " +
data.messages.length +
" messages"
);

}catch(err){

alert(
"Receive error: " +
err.message
);

}

}