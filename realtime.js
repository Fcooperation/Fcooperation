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
));


alert(
"1. Realtime script loaded"
);


// ---------- CHECK MESSAGES TABLE ----------

async function checkMessagesTable(){

alert(
"2. Checking messages table..."
);


const {
data,
error,
count
} =

await supabase

.from("messages")

.select(
"*",
{
count:"exact",
head:false
}
);


if(error){

alert(

"3. TABLE ERROR\n\n" +
error.message

);

return;

}


alert(

"3. TABLE FOUND\n\n" +
"Rows found: " +
(
count ??
data.length
)

);

}


// Run table check

checkMessagesTable();

const {
  data: {
    session
  },
  error: sessionError
} = await supabase.auth.getSession();

alert(
  "AUTH CHECK\n\n" +
  "Session exists: " +
  !!session +
  "\n\n" +
  "Auth user ID:\n" +
  (session?.user?.id || "NONE") +
  "\n\n" +
  "Local account ID:\n" +
  (account?.id || "NONE") +
  "\n\n" +
  "Session error:\n" +
  (sessionError?.message || "None")
);

// ---------- REALTIME TEST ----------

alert(
"4. Creating Realtime channel..."
);


const channel =

supabase

.channel(

"fchat-test-" +
account.id +
"-" +
Date.now()

);


alert(
"5. Channel created"
);


// ---------- LISTEN FOR ALL ACTIONS ----------

channel

.on(

"postgres_changes",

{

event:"*",

schema:"public",

table:"messages"

},

payload=>{

alert(

"6. REALTIME ACTION RECEIVED\n\n" +

"Type: " +
payload.eventType +

"\n\n" +

"Message ID: " +

(
payload.new?.message_id ||
payload.old?.message_id ||
"Unknown"
)

);

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
