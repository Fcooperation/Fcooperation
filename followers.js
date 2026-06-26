const account =
  JSON.parse(
    localStorage.getItem("faccount")
  ) || {};

const myUserId =
  account.userId ||
  account.id;

const viewingUserId =
  localStorage.getItem(
    "view-follow-user"
  );

const followersList =
  document.getElementById(
    "followers-list"
  );

const loadMoreBtn =
  document.getElementById(
    "load-more-btn"
  );

const CACHE_KEY =
  `followers-${viewingUserId}`;

let page = 1;
let loading = false;
let hasMore = true;

// ---------------- BACK ----------------

document
  .getElementById("back-btn")
  .onclick = () => {

  history.back();

};

// Render Followers
function renderFollowers(
  users,
  append = false
) {

  if (!append) {
    followersList.innerHTML = "";
  }

  users.forEach(user => {

    const card =
      document.createElement("div");

    card.className =
      "follow-card";

    card.innerHTML = `

<img
class="follow-pic"
src="${
user.profile_pic ||
"https://via.placeholder.com/150"
}">

<div class="follow-info">

<div class="follow-name">
${user.username || "User"}
</div>

</div>

<button class="message-btn">
Message
</button>

<button class="follow-btn ${
user.following
? "following"
: ""
}">
${
user.following
? "Following"
: "Follow Back"
}
</button>

`;

    // profile
    card.onclick = () => {

      localStorage.setItem(
        "view_profile",
        user.follower_id
      );

      window.location.href =
        "fvidsprofile.html";

    };

    // message
    card.querySelector(".message-btn")
      .onclick = e => {

      e.stopPropagation();

      localStorage.setItem(

        "chatting_with",

        JSON.stringify({

          id:user.follower_id,

          username:user.username,

          profile_pic:user.profile_pic

        })

      );

      window.location.href =
        "chat.html";

    };

    // follow
    card.querySelector(".follow-btn")
      .onclick = async e => {

      e.stopPropagation();

      const btn = e.target;

      try {

        const res =
          await fetch(
"https://fweb-backend.onrender.com/follow",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

followerId:myUserId,

followingId:user.follower_id

})

}
);

        const result =
          await res.json();

        if(result.success){

          btn.innerHTML =
            result.following
            ? "Following"
            : "Follow Back";

          btn.classList.toggle(
            "following",
            result.following
          );

          // update cache

          const cached =
            JSON.parse(
              localStorage.getItem(CACHE_KEY)
            ) || [];

          const updated =
            cached.map(x => {

              if(
                x.follower_id ===
                user.follower_id
              ){

                return {

                  ...x,

                  following:
                    result.following

                };

              }

              return x;

            });

          localStorage.setItem(

            CACHE_KEY,

            JSON.stringify(updated)

          );

        }

      } catch(err){

        console.error(err);

      }

    };

    followersList.appendChild(card);

  });

}

// ---------------- LOAD ----------------

async function loadFollowers(
  append = false
) {

  if (
    loading ||
    !hasMore
  ) return;

  loading = true;

  if (!append) {

    followersList.innerHTML =
      `<div class="loading">
        Loading followers...
      </div>`;

  }

  try {

    const res =
      await fetch(
`https://fweb-backend.onrender.com/fvids/followers?id=${viewingUserId}&page=${page}`
      );

    const data =
      await res.json();

    if(page===1){

  localStorage.setItem(

    CACHE_KEY,

    JSON.stringify(data)

  );

}else{

  const old =
    JSON.parse(
      localStorage.getItem(CACHE_KEY)
    ) || [];

  localStorage.setItem(

    CACHE_KEY,

    JSON.stringify([

      ...old,

      ...data

    ])

  );

    }

    if (!append) {

      followersList.innerHTML = "";

    }

    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {

      hasMore = false;

      if (!append) {

        followersList.innerHTML =
          `<div class="empty">
            No followers
          </div>`;

      }

      loadMoreBtn.classList.add(
        "hidden"
      );

      return;

    }
renderFollowers(
  data,
  append
);

  }

  catch (err) {

    console.error(err);

    followersList.innerHTML =
      `<div class="empty">
        Failed to load followers
      </div>`;

  }

  loading = false;

}

// ---------------- LOAD MORE ----------------

loadMoreBtn.onclick = () => {

  loadFollowers(true);

};

// ---------------- INIT ----------------

const cached =
  JSON.parse(
    localStorage.getItem(CACHE_KEY)
  );

if(
  cached &&
  cached.length
){

  renderFollowers(cached);

}

loadFollowers();