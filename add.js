const API =
  `${window.CONFIG.API_URL}/add-user`;

const SEARCH_API =
  `${window.CONFIG.API_URL}/add-user/search`;

const results =
  document.getElementById("results");

const loading =
  document.getElementById("loading");

let users = [];

let currentPage = 1;
let hasMore = true;
let isLoading = false;

async function loadUsers(
  page = 1,
  append = false
) {

  if (
    isLoading ||
    !hasMore
  ) return;

  isLoading = true;

  try {

    const account =
      JSON.parse(
        localStorage.getItem(
          "faccount"
        )
      ) || {};

    const myId =
      account.userId ||
      account.id;

    const res =
      await fetch(
`${API}?page=${page}&limit=20&userId=${myId}`
      );

    const data =
      await res.json();

    const newUsers =
      data.users || [];

    if (append) {

      users.push(
        ...newUsers
      );

    } else {

      users =
        newUsers;

    }

    hasMore =
      data.hasMore;

    currentPage =
      page;

    loading.style.display =
      "none";

    renderUsers(users);

  } catch(err){

    loading.textContent =
      "Failed to load users";

  }

  isLoading = false;

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
    user.fchat
      ? (
          user.status_text ||
          "Hey there! I'm using FCHAT 👋"
        )
      : "Not on FCHAT"
  }
</div>

      </div>

      ${
  user.fchat
  ? `
    <button class="add-btn">
      Add
    </button>
  `
  : ""
}
    `;

    const btn =
      card.querySelector(
        ".add-btn"
      );
      
      if(!btn){
  results.appendChild(card);
  return;
}

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
.getElementById(
  "searchBtn"
)
.onclick =
async ()=>{

  const query =
    document
    .getElementById(
      "searchInput"
    )
    .value
    .trim();

  // Empty search
  if (!query) {

    currentPage = 1;
    hasMore = true;

    await loadUsers(
      1,
      false
    );

    return;
  }

  loading.style.display =
    "block";

  loading.textContent =
    "Searching...";

  try {

    const res =
      await fetch(
`${SEARCH_API}?q=${encodeURIComponent(query)}`
      );

    const data =
      await res.json();

    loading.style.display =
      "none";

    renderUsers(
      data.users || []
    );

  } catch {

    loading.textContent =
      "Search failed";

  }

};

document
.getElementById("back-btn")
.onclick = ()=>{

  history.back();

};

loadUsers();

window.addEventListener(
  "scroll",
  async ()=>{

    if (
      window.innerHeight +
      window.scrollY >=
      document.body.offsetHeight - 300
    ) {

      if (
        hasMore &&
        !isLoading
      ) {

        await loadUsers(
          currentPage + 1,
          true
        );

      }

    }

  }
);