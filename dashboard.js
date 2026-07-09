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

const fullNameInput =
document.getElementById(
  "fullNameInput"
);

const usernameInput =
document.getElementById(
  "usernameInput"
);

const passwordInput =
document.getElementById(
  "passwordInput"
);

const saveBtn =
document.getElementById(
  "saveBtn"
);

const saveMessage =
document.getElementById(
  "saveMessage"
);

const logoutBtn =
document.getElementById(
  "logoutBtn"
);

const deleteBtn =
document.getElementById(
  "deleteBtn"
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

    fullNameInput.value =
data.full_name || "";

usernameInput.value =
data.username || "";

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

// Save details button 
saveBtn.onclick =
async ()=>{

  saveBtn.disabled =
  true;

  saveBtn.innerText =
  "Saving...";

  saveMessage.innerText =
  "";

  try{

    const {
      data:{
        session
      }
    } =
    await supabase
    .auth
    .getSession();

    const res =
    await fetch(
      "https://fweb-backend.onrender.com/dashboard",
      {
        method:"POST",

        headers:{
          "Content-Type":
          "application/json",

          Authorization:
          `Bearer ${
            session.access_token
          }`
        },

        body:JSON.stringify({

          action:
          "update_details",

          full_name:
          fullNameInput.value.trim(),

          username:
          usernameInput.value.trim(),

          password:
          passwordInput.value.trim()

        })

      }
    );

    const data =
    await res.json();

    if(
      data.success
    ){

      saveMessage.innerText =
      "Changes saved.";

      username.innerText =
      "@" +
      usernameInput.value;

      passwordInput.value =
      "";

    }
    else{

      saveMessage.innerText =
      data.message;

    }

  }
  catch(err){

    console.log(err);

    saveMessage.innerText =
    "Failed to save changes.";

  }

  saveBtn.disabled =
  false;

  saveBtn.innerText =
  "Save Changes";

};

// Logout
logoutBtn.onclick =
async ()=>{

  const confirmLogout =
  confirm(
    "Are you sure you want to logout?"
  );

  if(
    !confirmLogout
  ){
    return;
  }

  await supabase
  .auth
  .signOut();

  localStorage.removeItem(
    "faccount"
  );

  location.href =
  "/login";

};

// Delete account
deleteBtn.onclick =
async ()=>{

  const confirmDelete =
  confirm(
    "This will permanently delete your account. Continue?"
  );

  if(
    !confirmDelete
  ){
    return;
  }

  deleteBtn.disabled =
  true;

  deleteBtn.innerText =
  "Deleting...";

  try{

    const {
      data:{
        session
      }
    } =
    await supabase
    .auth
    .getSession();

    const res =
    await fetch(
      "https://fweb-backend.onrender.com/dashboard",
      {
        method:"POST",

        headers:{
          Authorization:
          `Bearer ${session.access_token}`,

          "Content-Type":
          "application/json"
        },

        body:
        JSON.stringify({
          action:
          "delete_account"
        })
      }
    );

    const data =
    await res.json();

    if(
      data.success
    ){

      await supabase
      .auth
      .signOut();

      localStorage.removeItem(
        "faccount"
      );

      alert(
        "Account deleted successfully."
      );

      location.href =
      "/signup";

    }
    else{

      alert(
        data.message
      );

    }

  }
  catch(err){

    console.log(err);

    alert(
      "Failed to delete account."
    );

  }

  deleteBtn.disabled =
  false;

  deleteBtn.innerText =
  "Delete Account";

};