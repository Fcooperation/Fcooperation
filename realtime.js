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


/* ---------- REALTIME SUBSCRIBE ---------- */

const channel =

supabase

.channel(

  "fchat-" +
  account.id +
  "-" +
  Date.now()

)


.on(

  "postgres_changes",

  {

    event:"INSERT",

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
      message.receiver_id !==
      account.id
    ){

      return;

    }


    /* ---------- SUCCESS ---------- */

    alert(

      "✅ MESSAGE RECEIVED\n\n" +

      "From:\n" +
      message.sender_id +

      "\n\n" +

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


    /* ---------- SCROLL ---------- */

    chatBody.scrollTop =
    chatBody.scrollHeight;

  }

)


/* ---------- SUBSCRIBE ---------- */

.subscribe(

  status=>{

    alert(
      "Realtime: " +
      status
    );

  }

);