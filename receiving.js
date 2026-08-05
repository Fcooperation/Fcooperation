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

const chattingWith =
JSON.parse(
localStorage.getItem(
"chatting_with"
));

window.addEventListener(

"load",

receiveMessages

);

// RECEIVE MESSAGES 
function receiveMessages(){

const channel =

supabase

.channel(

"messages"

)

.on(

"postgres_changes",

{

event:"INSERT",

schema:"public",

table:"messages"

},

payload=>{

console.log(
payload
);

}

)

.subscribe(

status=>{

console.log(
"Realtime:",
status
);

}

);

}