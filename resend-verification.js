const emailInput =
document.getElementById(
  "email"
);

const resendBtn =
document.getElementById(
  "resendBtn"
);

const message =
document.getElementById(
  "message"
);

// --------------------
// PREFILL EMAIL
// --------------------

const params =
new URLSearchParams(
  location.search
);

const email =
params.get(
  "email"
);

if(email){

  emailInput.value =
  decodeURIComponent(
    email
  );

}

// --------------------
// RESEND EMAIL
// --------------------

resendBtn.onclick =
async ()=>{

  const email =
  emailInput.value
  .trim();

  if(!email){

    message.style.display =
    "block";

    message.className =
    "message error";

    message.innerText =
    "Please enter your email.";

    return;

  }

  resendBtn.disabled =
  true;

  resendBtn.innerText =
  "Resending...";

  message.style.display =
  "none";

  try{

    const res =
    await fetch(
      "https://fweb-backend.onrender.com/verifyemail",
      {
        method:"POST",
        headers:{
          "Content-Type":
          "application/json"
        },
        body:JSON.stringify({
          email
        })
      }
    );

    const data =
    await res.json();

    message.style.display =
    "block";

    if(
      data.success
    ){

      message.className =
      "message success";

      message.innerText =
      "Verification email sent successfully. Please check your inbox and spam folder.";

    }
    else{

      message.className =
      "message error";

      message.innerText =
      data.message ||
      "Failed to send email.";

    }

  }
  catch{

    message.style.display =
    "block";

    message.className =
    "message error";

    message.innerText =
    "Unable to contact server.";

  }

  resendBtn.disabled =
  false;

  resendBtn.innerText =
  "Resend Verification Email";

};