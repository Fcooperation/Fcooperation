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


/* ---------- REALTIME ---------- */

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