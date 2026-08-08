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

    event: "INSERT",

    schema: "public",

    table: "messages"

  },

  payload => {

    alert(
      "🔥 MESSAGE EVENT RECEIVED\n\n" +

      "Message:\n" +
      payload.new.message
    );

  }

);


/* ---------- SUBSCRIBE ---------- */

alert(
  "Realtime: subscribing..."
);


channel.subscribe(

  status => {

    alert(
      "Realtime status:\n\n" +
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