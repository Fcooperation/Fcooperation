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
    String(message.receiver_id) !==
    String(account.id)
  ){

    alert(
      "🚫 MESSAGE NOT FOR THIS USER"
    );

    return;

  }


  alert(
    "✅ RECEIVER MATCHED\n\n" +

    "MESSAGE:\n" +
    message.message
  );

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