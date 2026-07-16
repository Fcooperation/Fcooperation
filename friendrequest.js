const API =
  `${window.CONFIG.API_URL}/friend-request`;

const container =
  document.getElementById(
    "requests-container"
  );

const log =
  document.getElementById(
    "log"
  );

const empty =
  document.getElementById(
    "empty"
  );

const account =
  JSON.parse(
    localStorage.getItem(
      "faccount"
    )
  ) || {};

const myId =
  account.userId ||
  account.id;

async function loadRequests(){

  try{

    const res =
      await fetch(
`${API}?userId=${myId}`
      );

    const data =
      await res.json();

    if(
      !data.success
    ){
      throw new Error(
        data.error
      );
    }

    renderRequests(
      data.requests || []
    );

  }catch(err){

    log.textContent =
      "Failed to load requests";

  }

}

function renderRequests(
  requests
){

  container.innerHTML =
    "";

  if(
    requests.length === 0
  ){

    empty.classList.remove(
      "hidden"
    );

    return;

  }

  empty.classList.add(
    "hidden"
  );

  requests.forEach(
    user => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "request-card";

      card.innerHTML = `
<img
  class="pfp"
  src="${
    user.profile_pic ||
    "/default.png"
  }"
>

<div class="info">

  <div class="username">
    ${user.username}
  </div>

  <div class="status">
    ${
      user.status_text ||
      "Hey there! I'm using FCHAT 👋"
    }
  </div>

</div>

<div class="actions">

<button class="accept-btn">
Accept
</button>

<button class="reject-btn">
Reject
</button>

</div>
      `;

      const pfp =
        card.querySelector(
          ".pfp"
        );

      pfp.onclick =
        ()=>{

        document
          .getElementById(
            "profileView"
          )
          .src =
            user.profile_pic ||
            "/default.png";

        document
          .getElementById(
            "profile-modal"
          )
          .classList
          .remove(
            "hidden"
          );

      };

      const acceptBtn =
        card.querySelector(
          ".accept-btn"
        );

      const rejectBtn =
        card.querySelector(
          ".reject-btn"
        );

      acceptBtn.onclick =
        async ()=>{

        acceptBtn.disabled =
          true;

        rejectBtn.disabled =
          true;

        acceptBtn.textContent =
          "Accepting...";

        const res =
          await fetch(
`${API}/accept`,
            {
              method:"POST",
              headers:{
                "Content-Type":
                "application/json"
              },
              body:
              JSON.stringify({
                userId:myId,
                senderId:
                  user.id
              })
            }
          );

        const data =
          await res.json();

        if(
          data.success
        ){

          card.classList.add(
            "fade-out"
          );

          setTimeout(
            ()=>{
              card.remove();
            },
            500
          );

        }

      };

      rejectBtn.onclick =
        async ()=>{

        acceptBtn.disabled =
          true;

        rejectBtn.disabled =
          true;

        rejectBtn.textContent =
          "Rejecting...";

        const res =
          await fetch(
`${API}/reject`,
            {
              method:"POST",
              headers:{
                "Content-Type":
                "application/json"
              },
              body:
              JSON.stringify({
                userId:myId,
                senderId:
                  user.id
              })
            }
          );

        const data =
          await res.json();

        if(
          data.success
        ){

          card.classList.add(
            "fade-out"
          );

          setTimeout(
            ()=>{
              card.remove();
            },
            500
          );

        }

      };

      container.appendChild(
        card
      );

    }
  );

}

document
.getElementById(
  "profile-modal"
)
.onclick = ()=>{

  document
    .getElementById(
      "profile-modal"
    )
    .classList.add(
      "hidden"
    );

};

document
.getElementById(
  "back-btn"
)
.onclick = ()=>{

  history.back();

};

loadRequests();