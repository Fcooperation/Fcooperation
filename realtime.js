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


// ---------- REALTIME TEST ----------



const channel =

supabase

.channel(

"fchat-test-" +
account.id +
"-" +
Date.now()

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

/* ---------- STEP 10 ---------- */

const message =
payload.new;


if(
  !message
){

  return;

}

/* ---------- CHECK RECEIVER ---------- */

if(
  message.receiver_id ===
  account.id
){


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