// verified.js

import {
createClient
}
from
"https://esm.sh/@supabase/supabase-js";

const supabase =
createClient(
"https://pwsxezhugsxosbwhkdvf.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hlemh1Z3N4b3Nid2hrZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjgzODcsImV4cCI6MjA2NzUwNDM4N30.T170FX8tC5iZEmdzyY_NjuFQDZ9_7GxxVSrVLzhvnQ0"
);

const timer =
document.getElementById(
"timer"
);

const redirectBtn =
document.getElementById(
"redirectBtn"
);

async function
checkSession(){

// wait a second before
// countdown starts
await new Promise(
resolve=>
setTimeout(
resolve,
1000
)
);

const {
data:{
session
}
} =
await supabase
.auth
.getSession();

// no session found
if(
!session
){

location.href =
"/login";

return;

}

let seconds = 5;

const interval =
setInterval(
()=>{

  seconds--;

  timer.innerText =
  seconds;

  if(
    seconds <= 0
  ){

    clearInterval(
      interval
    );

    location.href =
    "/dashboard";

  }

},
1000

);

}

checkSession();

redirectBtn.onclick =
async ()=>{

const {
data:{
session
}
} =
await supabase
.auth
.getSession();

if(
session
){

location.href =
"/dashboard";

}
else{

location.href =
"/login";

}

};