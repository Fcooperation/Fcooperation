import {
createClient
}
from "https://esm.sh/@supabase/supabase-js";

const supabase =
createClient(
"https://pwsxezhugsxosbwhkdvf.supabase.co",
"YOUR_ANON_KEY"
);

const signupBtn =
document.getElementById(
"signupBtn"
);

const googleBtn =
document.getElementById(
"googleBtn"
);

const message =
document.getElementById(
"message"
);

/* PASSWORD VISIBILITY */

document
.querySelectorAll(
".toggle-eye"
)
.forEach(
eye => {

eye.onclick = () => {

const input =
document.getElementById(
eye.dataset.target
);

if(
input.type ===
"password"
){

input.type = "text";

eye.classList.remove(
"fa-eye"
);

eye.classList.add(
"fa-eye-slash"
);

}else{

input.type =
"password";

eye.classList.remove(
"fa-eye-slash"
);

eye.classList.add(
"fa-eye"
);

}

};

}
);

/* NORMAL SIGNUP */

signupBtn.onclick =
async e => {

e.preventDefault();

signupBtn.disabled =
true;

signupBtn.textContent =
"Signing Up...";

const payload = {

username:
username.value,

firstName:
firstName.value,

lastName:
lastName.value,

email:
email.value,

password:
password.value

};

const res =
await fetch(
"https://fweb-backend.onrender.com/signup",
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:
JSON.stringify(
payload
)
}
);

const data =
await res.json();

message.innerText =
data.message;

signupBtn.disabled =
false;

signupBtn.textContent =
"Sign Up";

};

/* GOOGLE LOGIN */

googleBtn.onclick =
async () => {

googleBtn.disabled =
true;

googleBtn.textContent =
"Continuing...";

await supabase
.auth
.signInWithOAuth({

provider:
"google",

options:{

redirectTo:
"https://pwsxezhugsxosbwhkdvf.supabase.co/auth/v1/callback"

}

});

};