import {
  createClient
}
from "https://esm.sh/@supabase/supabase-js";

const supabase =
createClient(
  "https://pwsxezhugsxosbwhkdvf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3c3hlemh1Z3N4b3Nid2hrZHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjgzODcsImV4cCI6MjA2NzUwNDM4N30.T170FX8tC5iZEmdzyY_NjuFQDZ9_7GxxVSrVLzhvnQ0"
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

      if (
        input.type ===
        "password"
      ) {

        input.type = "text";

        eye.classList.remove(
          "fa-eye"
        );

        eye.classList.add(
          "fa-eye-slash"
        );

      } else {

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

message.style.display =
"none";

const emailRegex =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(
  !emailRegex.test(
    email.value.trim()
  )
){

  message.style.display =
  "block";

  message.innerText =
  "Please enter a valid email address";

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

  return;
}

if(
  password.value !==
  confirmPassword.value
){

  message.style.display =
  "block";

  message.innerText =
  "Passwords do not match";

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

  return;
}

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

  try {

    const res =
    await fetch(
      "https://fweb-backend.onrender.com/signup",
      {
        method: "POST",
        headers: {
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

  } catch {

    message.innerText =
    "Signup failed";

  }

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

    options: {

      redirectTo:
      window.location.href

    }

  });

};


/* GOOGLE CALLBACK */

const {
  data: {
    session
  }
} =
await supabase.auth.getSession();

if (
  session &&
  session.user
) {

  const user =
  session.user;

  const payload = {

    username:
    user.user_metadata
    ?.full_name
    ?.replace(/\s+/g, "")
    ?.toLowerCase(),

    firstName:
    user.user_metadata
    ?.given_name ||
    "",

    lastName:
    user.user_metadata
    ?.family_name ||
    "",

    email:
    user.email,

    googleId:
    user.id,

    avatar:
    user.user_metadata
    ?.avatar_url ||

    user.user_metadata
    ?.picture ||

    ""

  };

  try {

    const res =
    await fetch(
      "https://fweb-backend.onrender.com/signup",
      {
        method: "POST",
        headers: {
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

  } catch {

    message.innerText =
    "Google signup failed";

  }

}
