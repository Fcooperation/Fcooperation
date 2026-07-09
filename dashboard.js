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

const profileInput =
document.getElementById(
  "profileInput"
);

const profileBtn =
document.getElementById(
  "profileBtn"
);

let selectedFile =
null;

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

//Profile pic 
profileInput.onchange =
()=>{

  const file =
  profileInput.files[0];

  if(
    !file
  ){
    return;
  }

  selectedFile =
  file;

  profilePic.src =
  URL.createObjectURL(
    file
  );

  profileBtn.innerText =
  "Save Photo";

};

async function
uploadProfilePic(){

  try{

    profileBtn.disabled =
    true;

    profileBtn.innerText =
    "Uploading...";

    const {
      data:{
        session
      }
    } =
    await supabase
    .auth
    .getSession();

    const formData =
    new FormData();

    formData.append(
      "profile_pic",
      selectedFile
    );

    const res =
    await fetch(
      "https://fweb-backend.onrender.com/dashboard",
      {
        method:"POST",

        headers:{
          Authorization:
          `Bearer ${
            session.access_token
          }`
        },

        body:
        formData
      }
    );

    const data =
    await res.json();

    if(
      data.success
    ){

        profilePic.src =
        data.profile_pic;

        profileBtn.innerText =
        "Update Photo";

        selectedFile =
        null;

    }
    else{

      alert(
        data.message
      );

      profileBtn.innerText =
      "Save Photo";

    }

  }
  catch(err){

    console.log(err);

    profileBtn.innerText =
    "Save Photo";

  }

  profileBtn.disabled =
  false;

}

profileBtn.onclick =
()=>{

  if(
    !selectedFile
  ){

    profileInput.click();
    return;

  }

  uploadProfilePic();

};
