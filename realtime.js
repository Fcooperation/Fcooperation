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
  "1. Script loaded"
);


/* ---------- CREATE CHANNEL ---------- */

const channel =

supabase

.channel(

  "fchat-test-" +
  account.id +
  "-" +
  Date.now()

);


alert(
  "2. Channel created"
);


/* ---------- LISTEN FOR INSERT ---------- */

channel

.on(

  "postgres_changes",

  {

    event:"INSERT",

    schema:"public",

    table:"messages"

  },

  payload=>{

    alert(

      "🔥 INSERT RECEIVED\n\n" +

      "Message ID:\n" +
      payload.new?.message_id +

      "\n\n" +

      "Sender:\n" +
      payload.new?.sender_id +

      "\n\n" +

      "Receiver:\n" +
      payload.new?.receiver_id +

      "\n\n" +

      "Message:\n" +
      payload.new?.message

    );

  }

);


/* ---------- SUBSCRIBE ---------- */

alert(
  "3. Subscribing..."
);


channel

.subscribe(

  status=>{

    alert(

      "4. REALTIME STATUS\n\n" +
      status

    );

    if(
      status === "SUBSCRIBED"
    ){

      alert(

        "5. READY\n\n" +
        "Send a message now."

      );

    }

  }

);