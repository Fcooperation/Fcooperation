const SUPABASE_URL =
"https://pwsxezhugsxosbwhkdvf.supabase.co";

const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hlemh1Z3N4b3Nid2hrZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjgzODcsImV4cCI6MjA2NzUwNDM4N30.T170FX8tC5iZEmdzyY_NjuFQDZ9_7GxxVSrVLzhvnQ0";

const supabase =
window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const signupForm =
document.getElementById(
  "signupForm"
);

const signupBtn =
document.getElementById(
  "signupBtn"
);

const message =
document.getElementById(
  "message"
);

signupForm.addEventListener(
"submit",
async (e)=>{

e.preventDefault();

signupBtn.textContent =
"Signing Up...";

signupBtn.disabled = true;

const username =
document.getElementById(
"username"
).value.trim();

const firstName =
document.getElementById(
"firstName"
).value.trim();

const lastName =
document.getElementById(
"lastName"
).value.trim();

const email =
document.getElementById(
"email"
).value.trim();

const password =
document.getElementById(
"password"
).value;

const confirmPassword =
document.getElementById(
"confirmPassword"
).value;

if(password !== confirmPassword){

message.textContent =
"Passwords do not match.";

signupBtn.textContent =
"Sign Up";

signupBtn.disabled = false;

return;

}

const {
data,
error
} =
await supabase.auth.signUp({

email,
password,

options:{
emailRedirectTo:
`${window.location.origin}/login`,

data:{
username,
first_name:firstName,
last_name:lastName
}

}

});

if(error){

message.textContent =
error.message;

signupBtn.textContent =
"Sign Up";

signupBtn.disabled = false;

return;

}

message.textContent =
"Verification email sent.";

signupBtn.textContent =
"Check your email";

}
);

document
.getElementById(
"googleBtn"
)
.onclick =
async ()=>{

await supabase.auth.signInWithOAuth({

provider:"google",

options:{

redirectTo:
`${window.location.origin}`

}

});

};

function togglePassword(
id
){

const input =
document.getElementById(id);

input.type =
input.type === "password"
? "text"
: "password";

}