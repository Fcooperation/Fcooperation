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


const CHAT_STORAGE =
"fchat_messages";


/* ---------- SAFETY ---------- */

if(
  !account ||
  !account.id
){

  alert(
    "Realtime: account not found"
  );

  throw new Error(
    "FCHAT account not found"
  );

}


alert(
  "Realtime: starting..."
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


    /* ---------- RECEIVE ---------- */

    const message =
    payload.new;


    if(
      !message
    ){

      return;

    }


    alert(
      "Realtime: message received"
    );


    /* ---------- FILTER ---------- */

    if(
      message.receiver_id !==
      account.id
    ){

      alert(
        "Realtime: message ignored"
      );

      return;

    }


    alert(
      "Realtime: message is for me"
    );


    /* ---------- CONVERT MESSAGE ---------- */

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


    /* ---------- SAVE ---------- */

    const chats =
    JSON.parse(
      localStorage.getItem(
        CHAT_STORAGE
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


    /* ---------- DUPLICATE CHECK ---------- */

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

      alert(
        "Realtime: duplicate ignored"
      );

      return;

    }


    /* ---------- SAVE MESSAGE ---------- */

    chats[account.id][otherUserId]
    .push(
      receivedMessage
    );


    localStorage.setItem(

      CHAT_STORAGE,

      JSON.stringify(
        chats
      )

    );


    /* ---------- SHOW MESSAGE ---------- */

    window.dispatchEvent(

      new CustomEvent(
        "fchat-new-message",

        {

          detail:
          receivedMessage

        }

      )

    );


    alert(

      "✅ Message received\n\n" +

      receivedMessage.message

    );

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