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


/* ---------- REALTIME TEST ---------- */

alert(
  "1. Starting completely unfiltered Realtime test..."
);


const channel =

supabase

.channel(

  "fchat-unfiltered-" +
  account.id +
  "-" +
  Date.now()

)


.on(

  "postgres_changes",

  {

    event:
    "INSERT",

    schema:
    "public",

    table:
    "messages"

  },

  payload => {

    alert(

      "🔥 MESSAGE RECEIVED!\n\n" +

      "This client received an INSERT\n\n" +

      "Message ID:\n" +
      payload.new.message_id +

      "\n\nSender ID:\n" +
      payload.new.sender_id +

      "\n\nReceiver ID:\n" +
      payload.new.receiver_id +

      "\n\nMessage:\n" +
      payload.new.message

    );

  }

)


.subscribe(

  status => {

    alert(

      "REALTIME STATUS\n\n" +

      status

    );


    if(
      status ===
      "SUBSCRIBED"
    ){

      alert(

        "✅ REALTIME SUBSCRIBED\n\n" +

        "This listener has NO sender filter.\n" +

        "It has NO receiver filter.\n\n" +

        "Any INSERT into public.messages " +
        "should trigger it."

      );

    }

  }

);