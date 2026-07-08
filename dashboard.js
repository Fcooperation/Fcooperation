import {
  createClient
}
from "https://esm.sh/@supabase/supabase-js";

const supabase =
createClient(
  "https://pwsxezhugsxosbwhkdvf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hlemh1Z3N4b3Nid2hrZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjgzODcsImV4cCI6MjA2NzUwNDM4N30.T170FX8tC5iZEmdzyY_NjuFQDZ9_7GxxVSrVLzhvnQ0"
);

const greeting =
document.getElementById(
  "greeting"
);

const profilePic =
document.getElementById(
  "profilePic"
);

const username =
document.getElementById(
  "username"
);

const createdAt =
document.getElementById(
  "createdAt"
);

const status =
document.getElementById(
  "status"
);

const verifyBar =
document.getElementById(
  "verifyBar"
);

const resendBtn =
document.getElementById(
  "resendBtn"
);

/* GREETING */

const hour =
new Date()
.getHours();

if(
  hour < 12
){

  greeting.innerText =
  "Good morning ☀️";

}
else if(
  hour < 18
){

  greeting.innerText =
  "Good afternoon 🌤️";

}
else{

  greeting.innerText =
  "Good evening 🌙";

}

/* LOAD ACCOUNT */

async function
loadAccount(){

  try{

    // --------------------
    // GET SESSION
    // --------------------

    const {
      data: {
        session
      }
    } =
    await supabase
    .auth
    .getSession();

    // User not logged in
    if(
      !session
    ){

      location.href =
      "/login";

      return;

    }

    // Access token
    const token =
      session.access_token;

    // --------------------
    // FETCH ACCOUNT
    // --------------------

    const res =
    await fetch(
      "https://fweb-backend.onrender.com/account",
      {
        headers:{
          Authorization:
          `Bearer ${token}`
        }
      }
    );

    const data =
    await res.json();

    if(
      !res.ok
    ){

      throw new Error(
        data.message
      );

    }

    profilePic.src =
      data.profile_pic ||
      "default.png";

    username.innerText =
      "@" +
      data.username;

    createdAt.innerText =
      "Joined " +
      new Date(
        data.created_at
      )
      .toLocaleDateString();

    status.innerText =
      data.status;

    status.classList.add(
      data.status
    );

    if(
      data.status ===
      "pending"
    ){

      verifyBar.style.display =
      "block";

    }

  }
  catch(
    err
  ){

    console.log(
      err
    );

    username.innerText =
    "Failed to load account";

  }

}

loadAccount();

/* RESEND EMAIL */

resendBtn.onclick =
async ()=>{

  resendBtn.disabled =
  true;

  resendBtn.innerText =
  "Sending...";

  const {
    data: {
      session
    }
  } =
  await supabase
  .auth
  .getSession();

  const token =
    session
    ?.access_token;

  const res =
  await fetch(
    "https://fweb-backend.onrender.com/resend-verification",
    {
      method:"POST",
      headers:{
        Authorization:
        `Bearer ${token}`
      }
    }
  );

  const data =
  await res.json();

  resendBtn.innerText =
  data.message;

};