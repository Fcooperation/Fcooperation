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

let page = 1;
let loading = false;
let hasMore = true;

// ---------------- BACK ----------------

document
  .getElementById("back-btn")
  .onclick = () => {

  history.back();

};

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

    data.forEach(user => {

      const card =
        document.createElement("div");

      card.className =
        "follow-card";

      card.innerHTML = `

<img
class="follow-pic"
src="${
user.profile_pic ||
'https://via.placeholder.com/150'
}">

<div class="follow-info">

<div class="follow-name">
${user.username || "User"}
</div>

</div>

<button class="message-btn">
Message
</button>

<button class="follow-btn">
Follow Back
</button>

`;

      // ---------------- OPEN PROFILE ----------------

      card.onclick = () => {

        localStorage.setItem(
          "view_profile",
          user.follower_id
        );

        window.location.href =
          "fvidsprofile.html";

      };

      // ---------------- MESSAGE ----------------

      card
      .querySelector(
        ".message-btn"
      )
      .onclick = e => {

        e.stopPropagation();

        localStorage.setItem(
          "chatting_with",

          JSON.stringify({

            id:
              user.follower_id,

            username:
              user.username,

            profile_pic:
              user.profile_pic

          })
        );

        window.location.href =
          "chat.html";

      };

      // ---------------- FOLLOW ----------------

      card
      .querySelector(
        ".follow-btn"
      )
      .onclick = async e => {

        e.stopPropagation();

        const btn =
          e.target;

        try {

          const res =
            await fetch(
"https://fweb-backend.onrender.com/follow",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

followerId:
myUserId,

followingId:
user.follower_id

})

}
);

          const result =
            await res.json();

          if (
            result.success
          ) {

            btn.innerHTML =
              "Following";

            btn.classList.add(
              "following"
            );

          }

        } catch (err) {

          console.error(err);

        }

      };

      followersList.appendChild(
        card
      );

    });

    page++;

    loadMoreBtn.classList.remove(
      "hidden"
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

loadFollowers();