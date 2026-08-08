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


alert(
"1. Realtime script loaded"
);

// ---------- REALTIME TEST ----------

alert(
"4. Creating Realtime channel..."
);


const channel =

supabase

.channel(

"fchat-test-" +
account.id +
"-" +
Date.now()

);


alert(
"5. Channel created"
);


// ---------- LISTEN FOR ALL ACTIONS ----------

channel

.on(

"postgres_changes",

{

event:"*",

schema:"public",

table:"messages"

},

payload=>{

alert(

  "6. REALTIME ACTION RECEIVED\n\n" +

  "Type:\n" +
  payload.eventType +

  "\n\n" +

  "Message ID:\n" +
  (
    payload.new?.message_id ||
    payload.old?.message_id ||
    "Unknown"
  ) +

  "\n\n" +

  "Sender:\n" +
  (
    payload.new?.sender_id ||
    payload.old?.sender_id ||
    "Unknown"
  ) +

  "\n\n" +

  "Receiver:\n" +
  (
    payload.new?.receiver_id ||
    payload.old?.receiver_id ||
    "Unknown"
  ) +

  "\n\n" +

  "MESSAGE:\n" +
  (
    payload.new?.message ||
    payload.old?.message ||
    "No message"
  )

);

/* ---------- STEP 10 ---------- */

const message =
payload.new;


if(
  !message
){

  return;

}


alert(

  "10. MESSAGE RECEIVED\n\n" +

  "Sender:\n" +
  message.sender_id +

  "\n\n" +

  "Receiver:\n" +
  message.receiver_id +

  "\n\n" +

  "Chrome user:\n" +
  account.id +

  "\n\n" +

  "Message:\n" +
  message.message

);


/* ---------- CHECK RECEIVER ---------- */

if(
  message.receiver_id ===
  account.id
){

  alert(

    "✅ STEP 10 SUCCESS\n\n" +

    "This message was sent to the " +
    "currently logged-in Chrome user.\n\n" +

    "Message:\n" +
    message.message

  );


  /* ---------- CREATE MESSAGE ---------- */

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


  /* ---------- RENDER BUBBLE ---------- */

  renderMessage(
    receivedMessage
  );


  /* ---------- SCROLL DOWN ---------- */

  chatBody.scrollTop =
  chatBody.scrollHeight;


}

}

);


// ---------- SUBSCRIBE ----------

alert(
"7. Subscribing to Realtime..."
);


channel

.subscribe(

status=>{

alert(

"8. REALTIME STATUS\n\n" +
status

);


if(
status === "SUBSCRIBED"
){

alert(

"9. REALTIME SUBSCRIBED\n\n" +
"Now send a message."

);

}

}

);