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
"Realtime script loaded"
);


// ---------- REALTIME TEST ----------

const channel =

supabase

.channel(
"fchat-test-" +
account.id +
"-" +
Date.now()
)

.on(

"postgres_changes",

{

event:"*",

schema:"public",

table:"messages"

},

payload=>{

alert(

"REALTIME ACTION: " +
payload.eventType +

"\n\nMessage ID: " +
(
payload.new?.message_id ||
payload.old?.message_id ||
"Unknown"
)

);

}

)

.subscribe(

status=>{

alert(
"REALTIME STATUS: " +
status
);

}

);