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
    "Realtime error: account not found"
  );

  throw new Error(
    "FCHAT account not found"
  );

}


/* ---------- SAVE INCOMING MESSAGE ---------- */

function saveIncomingMessage(
  message
){

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


  const senderId =
  message.sender_id;

  const receiverId =
  message.receiver_id;


  /*
  The other person in this conversation
  */

  const otherUserId =

  senderId === account.id ?

  receiverId :

  senderId;


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


  if(
    alreadyExists
  ){

    return false;

  }


  /*
  Find the replied-to message
  */

  let replyToText =
  null;


  if(
    message.reply_to_id
  ){

    for(
      const conversation of
      Object.values(
        chats[account.id]
      )
    ){

      if(
        !Array.isArray(
          conversation
        )
      ){

        continue;

      }


      const original =
      conversation.find(

        saved =>

        saved.messageId ===
        message.reply_to_id

      );


      if(original){

        replyToText =
        original.message;

        break;

      }

    }

  }


  /*
  Convert Supabase row
  into FCHAT local format
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
  Save message
  */

  chats[account.id][otherUserId]
  .push(
    savedMessage
  );


  localStorage.setItem(

    CHAT_STORAGE,

    JSON.stringify(
      chats
    )

  );


  return savedMessage;

}


/* ---------- REALTIME ---------- */

const channel =

supabase

.channel(
  "fchat-debug-" +
  account.id +
  "-" +
  Date.now()
)

.on(
  "postgres_changes",
  {
    event: "INSERT",
    schema: "public",
    table: "messages"
  },
  payload => {

    alert(
      "🔥 REALTIME MESSAGE RECEIVED\n\n" +

      "Message ID: " +
      payload.new.message_id +

      "\n\nSender: " +
      payload.new.sender_id +

      "\n\nReceiver: " +
      payload.new.receiver_id +

      "\n\nLogged-in user: " +
      account.id
    );

  }
)

.subscribe(
  status => {

    alert(
      "REALTIME STATUS\n\n" +
      status
    );

  }
);