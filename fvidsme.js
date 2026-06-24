const account =
  JSON.parse(localStorage.getItem("faccount"));

const username =
  document.getElementById("username");

const profilePic =
  document.getElementById("profile-pic");

const stats =
  document.getElementById("profile-stats");

const signInContainer =
  document.getElementById("signin-container");

const videosTab =
  document.getElementById("videos-tab");

// Back button
document
  .getElementById("back-btn")
  .onclick = () => {

  window.location.href =
    "fvids.html";
};

// Sign in button
document
  .getElementById("signin-btn")
  .onclick = () => {

  window.location.href =
    "login.html";
};

// User logged in
if (account) {

  username.textContent =
    account.username ||
    account.name ||
    "User";

  if (account.profile_pic) {
    profilePic.src =
      account.profile_pic;
  }

  stats.classList.remove("hidden");
  videosTab.classList.remove("hidden");
}

// User not logged in
else {

  username.textContent = "Guest";

  signInContainer
    .classList.remove("hidden");
}