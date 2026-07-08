import {
  createClient
}
from "https://esm.sh/@supabase/supabase-js";

const supabase =
createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
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