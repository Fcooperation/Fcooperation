const API =
  `${window.CONFIG.API_URL}/fchat-contacts`;

const usersList =
  document.getElementById(
    "users-list"
  );

const updateLog =
  document.getElementById(
    "update-log"
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

let contacts = [];

async function loadContacts(){

  try{

    updateLog.textContent =
      "Loading chats...";

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

    contacts =
      data.contacts || [];

    renderContacts(
      contacts
    );

    updateLog.textContent =
      `${contacts.length} chats`;

  }catch(err){

    updateLog.textContent =
      "Failed to load chats";

  }

}

function renderContacts(
  list
){

  usersList.innerHTML =
    "";

  if(
    list.length === 0
  ){

    usersList.innerHTML =
      `
<div id="empty-state">

No chats yet.<br><br>

Tap the blue + button to add friends.

</div>
      `;

    return;
  }

  list.forEach(
    user => {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "fcard";

      card.innerHTML = `
<div class="pfp">

${
  user.profile_pic
  ?
  `<img
     src="${user.profile_pic}"
     style="
       width:100%;
       height:100%;
       border-radius:50%;
       object-fit:cover;
     "
   >`
  :
  user.username
    ?.charAt(0)
    ?.toUpperCase()
}

</div>

<div class="info">

<div class="username">
${user.username}
</div>

<div class="last-msg">
${
  user.status_text ||
  "Hey there! I'm using FCHAT 👋"
}
</div>

</div>
      `;

      const pfp =
        card.querySelector(
          ".pfp"
        );

      pfp.onclick =
        (e)=>{

        e.stopPropagation();

        document
          .getElementById(
            "modal-img"
          )
          .src =
          user.profile_pic ||
          "/default.png";

        document
          .getElementById(
            "profile-modal"
          )
          .style.display =
          "flex";

      };

      card.onclick =
        ()=>{

        localStorage.setItem(
          "chatting_with",
          user.id
        );

        window.location.href =
          "/chat";

      };

      usersList.appendChild(
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
    .style.display =
    "none";

};

document
.getElementById(
  "add-btn"
)
.onclick = ()=>{

  location.href =
    "adduser.html";

};

document
.getElementById(
  "search-bar"
)
.addEventListener(
  "input",
  e => {

    const q =
      e.target.value
      .toLowerCase();

    const filtered =
      contacts.filter(
        user =>
          user.username
          .toLowerCase()
          .includes(q)
      );

    renderContacts(
      filtered
    );

  }
);

document
.getElementById(
  "menu-btn"
)
.onclick = ()=>{

  document
    .getElementById(
      "menu-dropdown"
    )
    .classList
    .toggle(
      "show"
    );

};

window.onclick =
  e => {

  if(
    !e.target.closest(
      "#menu-container"
    )
  ){

    document
      .getElementById(
        "menu-dropdown"
      )
      .classList
      .remove(
        "show"
      );

  }

};

loadContacts();

//Add button 
        document
  .getElementById(
    "add-btn"
  )
  .onclick = ()=>{

  window.location.href =
    "/add";

};

// Menu
const menuBtn =
  document.getElementById(
    "menu-btn"
  );

const menuDropdown =
  document.getElementById(
    "menu-dropdown"
  );

menuBtn.onclick =
  (e)=>{

  e.stopPropagation();

  menuDropdown
    .classList
    .toggle(
      "show"
    );

};

document.addEventListener(
  "click",
  (e)=>{

    if(
      !e.target.closest(
        "#menu-container"
      )
    ){

      menuDropdown
        .classList
        .remove(
          "show"
        );

    }

  }
);
