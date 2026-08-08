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
  )
);


/* ---------- CREATE CHANNEL ---------- */

const channel =

supabase

.channel(

  "fchat-" +
  account.id +
  "-" +
  Date.now()

);


/* ---------- LISTEN ---------- */

channel

.on(

  "postgres_changes",

  {

    event:"INSERT",

    schema:"public",

    table:"messages"

  },

  payload => {


  const message =
  payload.new;


  if(
    !message
  ){

    return;

  }


  if(
  String(message.receiver_id) ===
  String(account.id)
){

  const createdAt =
  new Date(
    message.created_at
  );


  const receivedMessage = {

    messageId:
    message.message_id,

    senderId:
    message.sender_id,

    receiverId:
    message.receiver_id,

    message:
    message.message,

    replyToId:
    message.reply_to_id ||
    null,

    replyToText:
    null,

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
    "Received"

  };

/* ---------- SAVE TO LOCAL STORAGE ---------- */

const chats =
JSON.parse(
  localStorage.getItem(
    "fchat_messages"
  )
) || {};


if(
  !chats[account.id]
){

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


/* ---------- PREVENT DUPLICATE ---------- */

const exists =

chats[account.id][otherUserId]
.some(

  saved =>

  saved.messageId ===
  receivedMessage.messageId

);


if(
  exists
){

  return;

}


/* ---------- SAVE ---------- */

chats[account.id][otherUserId]
.push(
  receivedMessage
);


localStorage.setItem(

  "fchat_messages",

  JSON.stringify(
    chats
  )

);

  renderMessage(
    receivedMessage
  );


  chatBody.scrollTop =
  chatBody.scrollHeight;

}

}

);


/* ---------- SUBSCRIBE ---------- */

channel

.subscribe(

  status=>{


    if(
      status === "SUBSCRIBED"
    ){

    }

  }

);