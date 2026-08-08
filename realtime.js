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


alert(
  "Realtime: starting"
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

  alert(
    "🔥 REALTIME INSERT RECEIVED\n\n" +

    "Sender:\n" +
    payload.new?.sender_id +

    "\n\nReceiver:\n" +
    payload.new?.receiver_id +

    "\n\nMy account ID:\n" +
    account.id +

    "\n\nMessage:\n" +
    payload.new?.message
  );


  const message =
  payload.new;


  if(
    !message
  ){

    alert(
      "❌ No message data"
    );

    return;

  }


  alert(
    "📩 INSERT DATA EXISTS\n\n" +
    "Receiver comparison:\n\n" +

    message.receiver_id +
    "\n===\n" +
    account.id
  );


  if(
  String(message.receiver_id) ===
  String(account.id)
){

  alert(
    "✅ RECEIVER MATCHED\n\n" +
    "MESSAGE:\n" +
    message.message
  );


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


  alert(
    "🟢 RENDERING MESSAGE\n\n" +
    receivedMessage.message
  );


  renderMessage(
    receivedMessage
  );


  chatBody.scrollTop =
  chatBody.scrollHeight;

}

);


/* ---------- SUBSCRIBE ---------- */

alert(
  "Realtime: subscribing..."
);


channel

.subscribe(

  status=>{

    alert(

      "Realtime status:\n" +
      status

    );


    if(
      status === "SUBSCRIBED"
    ){

      alert(

        "✅ REALTIME READY\n\n" +
        "Now send the message."

      );

    }

  }

);