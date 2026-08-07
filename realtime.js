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


/* ---------- REALTIME ---------- */

alert(
  "1. Realtime script loaded"
);


const channel =

supabase

.channel(

  "fchat-any-event-" +
  account.id +
  "-" +
  Date.now()

);


channel

.on(

  "postgres_changes",

  {

    event:
    "*",

    schema:
    "public",

    table:
    "messages"

  },

  payload => {

    alert(

      "🔥 REALTIME ACTION RECEIVED\n\n" +

      "Event:\n" +
      payload.eventType +

      "\n\nMessage ID:\n" +
      (
        payload.new?.message_id ||
        payload.old?.message_id ||
        "Unknown"
      ) +

      "\n\nSender:\n" +
      (
        payload.new?.sender_id ||
        payload.old?.sender_id ||
        "Unknown"
      ) +

      "\n\nReceiver:\n" +
      (
        payload.new?.receiver_id ||
        payload.old?.receiver_id ||
        "Unknown"
      )

    );

  }

);


alert(
  "2. Subscribing..."
);


channel

.subscribe(

  status => {

    alert(

      "3. REALTIME STATUS\n\n" +
      status

    );

  }

);