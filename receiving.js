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

window.addEventListener(

"load",

receiveMessages

);

// RECEIVE MESSAGES
async function receiveMessages(){

const res =
await fetch(

window.CONFIG.API_URL +
"/receive-messages",

{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

userId:
account.id

})

}

);

const data =
await res.json();

alert(
"Loaded " +
data.messages.length +
" messages"
);

}