// ---------------- LOAD FOLLOWING VIDEOS ----------------
async function loadFollowingVideos(page = 1, append = false) {

  try {

    const account =
      JSON.parse(localStorage.getItem("faccount")) || {};

    const userId =
      account.userId || account.id;

    if (!userId) {
      feed.innerHTML = `
        <div style="text-align:center;color:white;padding:40px;">
          Sign in to see videos from people you follow.
        </div>
      `;
      return;
    }

    if (!append) {
      feed.innerHTML = `
        <div style="text-align:center;color:white;padding:40px;">
          🎬 Loading following...
        </div>
      `;
    }

    const res = await fetch(
  `https://fweb-backend.onrender.com/fvids/following-feed?userId=${userId}&page=${page}`
);

    const newVideos = await res.json();

    if (!newVideos || newVideos.length === 0) {

      hasMoreVideos = false;

      if (!append) {
        feed.innerHTML = `
          <div style="text-align:center;color:white;padding:40px;">
            You're not following anyone yet.
          </div>
        `;
      }

      return;
    }

    // First load
    if (!append) {

      videos = newVideos;
      currentIndex = 0;

      renderVideo(0);

    }

    // Load more
    else {

      videos.push(...newVideos);

    }

  } catch (err) {

    console.error(err);

    feed.innerHTML = `
      <div style="text-align:center;color:white;padding:40px;">
        Failed to load following feed.
      </div>
    `;

  }

}