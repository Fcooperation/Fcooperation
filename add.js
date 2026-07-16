const API =
  `${window.CONFIG.API_URL}/add-user`;

const results =
  document.getElementById("results");

const loading =
  document.getElementById("loading");

let users = [];

async function loadUsers() {

  try {

    const res =
      await fetch(API);

    const data =
      await res.json();

    users =
      data.users || [];

    loading.style.display =
      "none";

  } catch(err){

    loading.textContent =
      "Failed to load users";

  }
}

function renderUsers(list){

  results.innerHTML = "";

  const account =
    JSON.parse(
      localStorage.getItem(
        "faccount"
      )
    ) || {};

  const myId =
    account.userId ||
    account.id;

  list.forEach(user=>{

    if(user.id === myId)
      return;

    const card =
      document.createElement("div");

    card.className =
      "card";

    card.innerHTML = `
      <img
        class="pfp"
        src="${
          user.profile_pic ||
          '/default.png'
        }"
      >

      <div class="info">

        <div class="name">
          ${user.username}
        </div>

        <div class="status">
          ${
            user.status_text ||
            "Hey there! I'm using FCHAT 👋"
          }
        </div>

      </div>

      <button class="add-btn">
        Add
      </button>
    `;

    const btn =
      card.querySelector(
        ".add-btn"
      );

    btn.onclick =
      async ()=>{

      btn.disabled = true;
      btn.textContent =
        "Sending...";

      try{

        const res =
          await fetch(API,{
            method:"POST",
            headers:{
              "Content-Type":
              "application/json"
            },
            body:JSON.stringify({
              senderId:myId,
              receiverId:user.id
            })
          });

        const data =
          await res.json();

        if(data.success){

          btn.textContent =
            "Sent";

        }else{

          btn.disabled =
            false;

          btn.textContent =
            "Add";
        }

      }catch{

        btn.disabled =
          false;

        btn.textContent =
          "Add";

      }

    };

    results.appendChild(card);

  });

}

document
.getElementById("searchBtn")
.onclick = ()=>{

  const query =
    document
    .getElementById(
      "searchInput"
    )
    .value
    .toLowerCase();

  const filtered =
    users.filter(
      u =>
        u.username
        ?.toLowerCase()
        .includes(query)
    );

  renderUsers(filtered);
};

document
.getElementById("back-btn")
.onclick = ()=>{

  history.back();

};

loadUsers().then(
  ()=>renderUsers(users)
);