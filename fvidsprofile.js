const userId =
  localStorage.getItem(
    "view_profile"
  );

const account =
  JSON.parse(
    localStorage.getItem("faccount")
  ) || {};

const viewerId =
  account.userId ||
  account.id ||
  null;

const isLoggedIn = !!viewerId;

const cachedProfile =
  JSON.parse(
    localStorage.getItem(
      "viewing_user_profile"
    )
  );

const username =
  document.getElementById(
    "username"
  );

const profilePic =
  document.getElementById(
    "profile-pic"
  );

const followersEl =
  document.getElementById(
    "followers-count"
  );

const followingEl =
  document.getElementById(
    "following-count"
  );

const likesEl =
  document.getElementById(
    "likes-count"
  );

const videosCountEl =
  document.getElementById(
    "videos-count"
  );

const videosGrid =
  document.getElementById(
    "videos-grid"
  );

const followBtn =
  document.getElementById(
    "follow-btn"
  );

const messageBtn =
  document.getElementById(
    "message-btn"
  );

// ---------------- BACK ----------------

document
  .getElementById("back-btn")
  .onclick = () => {

    window.location.href =
      localStorage.getItem(
        "redirect"
      ) || "fvids.html";

};

// ---------------- LOAD CACHE ----------------

if (
  cachedProfile &&
  String(cachedProfile.id) ===
  String(userId)
) {

  username.textContent =
    cachedProfile.username ||
    "User";

  if (
    cachedProfile.profile_pic
  ) {

    profilePic.src =
      cachedProfile.profile_pic;

  }

}

// ---------------- FETCH ----------------

fetch(
`https://fweb-backend.onrender.com/fvids-user-details?id=${encodeURIComponent(userId)}&viewerId=${encodeURIComponent(viewerId || "")}`
)
.then(res => res.json())
.then(data => {

  console.log(
    "Profile:",
    data
  );

  // Keep username/profile pic
  data.id = userId;
// Save latest profile
data.id = userId;

localStorage.setItem(
  "viewing_user_profile",
  JSON.stringify(data)
);

updateProfile(data);
})
.catch(err => {

  console.error(err);

});

// ---------------- UPDATE ----------------

function updateProfile(
  data
){

  username.textContent =
    data.username ||
    "User";

  if (
    data.profile_pic
  ) {

    profilePic.src =
      data.profile_pic;

  }

  followersEl.textContent =
    data.followers_count || 0;

  followingEl.textContent =
    data.following_count || 0;

  likesEl.textContent =
    data.likes_received || 0;

  videosCountEl.textContent =
    data.videos_count || 0;

  // ---------------- FOLLOW BUTTON ----------------

if (viewerId && viewerId !== userId) {

  followBtn.style.display =
    "block";

  if (data.following) {

    followBtn.textContent =
      "Unfollow";

    followBtn.classList.add(
      "following"
    );

  } else {

    followBtn.textContent =
      "Follow";

    followBtn.classList.remove(
      "following"
    );

  }

} else {

  followBtn.style.display =
    "none";

}

  videosGrid.innerHTML = "";

(data.videos || []).forEach(video => {

  videosGrid.innerHTML += `

<div
class="video-card">

<img
class="video-thumbnail"
src="${video.thumbnail_url}">

</div>

`;

});

// ---------------- OPEN VIDEO ----------------

videosGrid
  .querySelectorAll(".video-card")
  .forEach((card, index) => {

    card.onclick = () => {

      const selectedVideo = {
        ...data.videos[index],

        user: {
          username: data.username,
          profile_pic: data.profile_pic
        }
      };

      // Save selected video
      localStorage.setItem(
        "currently_viewing",
        JSON.stringify(selectedVideo)
      );

      // Tell FVIDS where to return
      localStorage.setItem(
        "redirect",
        "fvidsprofile.html"
      );

      // Open video
      window.location.href =
        "fvids.html";

    };

  });

  // ---------------- FOLLOW / UNFOLLOW ----------------

followBtn.onclick = async () => {

  try {

    const action =
      followBtn.textContent ===
      "Unfollow"
      ? "unfollow"
      : "follow";

    const res =
      await fetch(
        "https://fweb-backend.onrender.com/follow",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            followerId:
              viewerId,

            followingId:
              userId,

            action

          })

        }
      );

    const result =
      await res.json();

    if (!result.success)
      return;

    if (action === "follow") {

      followBtn.textContent =
        "Unfollow";

      followBtn.classList.add(
        "following"
      );

      followersEl.textContent =
        Number(
          followersEl.textContent
        ) + 1;

    } else {

      followBtn.textContent =
        "Follow";

      followBtn.classList.remove(
        "following"
      );

      followersEl.textContent =
        Math.max(
          0,
          Number(
            followersEl.textContent
          ) - 1
        );

    }

  } catch (err) {

    console.error(err);

  }

};

  //Message button on click 
  messageBtn.onclick = () => {

  // NOT LOGGED IN
  if (!isLoggedIn) {

    messageBtn.textContent =
      "Must sign in to message";

    messageBtn.style.background =
      "gray";

    // create login button if not exists
    let loginBtn =
      document.getElementById("login-btn");

    if (!loginBtn) {

      loginBtn =
        document.createElement("button");

      loginBtn.id = "login-btn";

      loginBtn.textContent =
        "Sign In";

      loginBtn.style.marginTop =
        "10px";

      loginBtn.onclick = () => {

        // save redirect back
        localStorage.setItem(
          "redirect_after_login",
          "fvidsprofile.html"
        );

        window.location.href =
          "login.html";

      };

      messageBtn.parentElement.appendChild(
        loginBtn
      );

    }

    return;
  }

  // LOGGED IN → OPEN CHAT

  localStorage.setItem(
    "chatting_with",
    JSON.stringify({

      id: userId,
      username: username.textContent,
      profile_pic: profilePic.src

    })
  );

  window.location.href =
    "chat.html";

};

}