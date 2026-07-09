import {
  createClient
}
from "https://esm.sh/@supabase/supabase-js";

const supabase =
createClient(
  "https://pwsxezhugsxosbwhkdvf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hlemh1Z3N4b3Nid2hrZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjgzODcsImV4cCI6MjA2NzUwNDM4N30.T170FX8tC5iZEmdzyY_NjuFQDZ9_7GxxVSrVLzhvnQ0"
);

const loginBtn =
document.getElementById(
  "loginBtn"
);

const googleBtn =
document.getElementById(
  "googleBtn"
);

const message =
document.getElementById(
  "message"
);

const verifyBtn =
document.getElementById(
  "verifyBtn"
);

/* PASSWORD EYE */

document
.querySelectorAll(
  ".toggle-eye"
)
.forEach(
  eye=>{

    eye.onclick=()=>{

      const input=
      document.getElementById(
        eye.dataset.target
      );

      if(
        input.type===
        "password"
      ){

        input.type=
        "text";

        eye.classList.replace(
          "fa-eye",
          "fa-eye-slash"
        );

      }
      else{

        input.type=
        "password";

        eye.classList.replace(
          "fa-eye-slash",
          "fa-eye"
        );

      }

    };

  }
);

/* LOGIN */

loginBtn.onclick =
async e=>{

  e.preventDefault();

  message.style.display =
  "none";

  verifyBtn.style.display =
"none";

  loginBtn.disabled =
  true;

  loginBtn.innerText =
  "Logging in...";

  try{

    const res =
    await fetch(
      "https://fweb-backend.onrender.com/login",
      {
        method:"POST",
        headers:{
          "Content-Type":
          "application/json"
        },
        body:JSON.stringify({
          email:
          email.value.trim(),

          password:
          password.value
        })
      }
    );

    const data =
    await res.json();

    message.style.display =
    "block";

    message.innerText =
    data.message;

    if(
  data.success
){

  // Save session into browser
  await supabase
  .auth
  .setSession({

    access_token:
    data.access_token,

    refresh_token:
    data.refresh_token

  });

  // Optional local account cache
  localStorage.setItem(
    "faccount",
    JSON.stringify(
      data.user
    )
  );

  message.className =
  "message success";

  setTimeout(
    ()=>{

      location.href =
      "/dashboard";

    },
    330
  );

}
    else{

  message.className =
  "message error";

  if(
    data.message
    .toLowerCase()
    .includes(
      "email not confirmed"
    )
  ){

    verifyBtn.style.display =
    "block";

  }

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}

  }
  catch{

    message.style.display =
    "block";

    message.className =
    "message error";

    message.innerText =
    "Login failed";

  }

  loginBtn.disabled =
  false;

  loginBtn.innerText =
  "Login";

};

verifyBtn.onclick =
()=>{

  const emailAddress =
  encodeURIComponent(
    email.value.trim()
  );

  location.href =
  `/resend-verification.html?email=${emailAddress}`;

};

/* GOOGLE LOGIN */

googleBtn.onclick =
async ()=>{

  await supabase
  .auth
  .signInWithOAuth({

    provider:
    "google",

    options:{

      redirectTo:
      window.location.origin +
      "/dashboard"

    }

  });

};