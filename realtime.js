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


const CHAT_STORAGE =
"fchat_messages";


// ---------- REALTIME ----------

const channel =

supabase

.channel(
"fchat-" +
account.id
)

.on(

"postgres_changes",

{

event:"INSERT",

schema:"public",

table:"messages",

filter:
"receiver_id=eq." +
account.id

},

payload=>{

const message =
payload.new;


/*
Save the new message
locally
*/

const chats =

JSON.parse(
localStorage.getItem(
CHAT_STORAGE
)
) || {};


if(!chats[account.id]){

chats[account.id] = {};

}


const otherUserId =
message.sender_id;


if(
!chats[account.id][otherUserId]
){

chats[account.id][otherUserId] =
[];

}


/*
Prevent duplicate
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
Find the message
being replied to
*/

let replyToText =
null;


if(message.reply_to_id){

Object.values(
chats[account.id]
).forEach(
conversation=>{

conversation.forEach(
savedMessage=>{

if(
savedMessage.messageId ===
message.reply_to_id
){

replyToText =
savedMessage.message;

}

});

});

}


/*
Create local message
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

replyToText:

replyToText,

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
message.status

};


/*
Save it
*/

chats[account.id][otherUserId]
.push(
savedMessage
);


localStorage.setItem(

CHAT_STORAGE,

JSON.stringify(chats)

);


/*
Tell the chat UI that
a new message arrived
*/

window.dispatchEvent(

new CustomEvent(
"fchat-new-message",

{

detail:
savedMessage

}

)

);

}

)

.subscribe(

status=>{

alert(
"Realtime: " +
status
);

}

);