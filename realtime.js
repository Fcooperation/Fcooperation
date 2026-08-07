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


// ---------- REALTIME TEST ----------

const channel =

supabase

.channel(
"fchat-test-" +
account.id
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
payload.eventType
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