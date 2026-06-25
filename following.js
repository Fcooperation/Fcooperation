async function loadFollowingVideos(
  page = 1,
  append = false
) {

  try {

    const account =
      JSON.parse(localStorage.getItem("faccount")) || {};

    const userId =
      account.userId || account.id;

    if (!userId) {
      feed.innerHTML = `
        <div style="text-align:center;color:white;padding:40px;">
          Login required
        </div>
      `;
      return;
    }

    const res = await fetch(
  `https://fweb-backend.onrender.com/fvids/following-feed?userId=${userId}&page=${page}`
);

    const newVideos = await res.json();

    if (!newVideos.length) {

      feed.innerHTML = `
        <div style="text-align:center;color:white;padding:40px;">
          Follow creators to see videos here
        </div>
      `;

      return;
    }

    if (!append) {

      videos = newVideos;
      currentIndex = 0;

      renderVideo(0);

    } else {

      videos.push(...newVideos);

    }

  } catch (err) {

    console.error(err);

    feed.innerHTML = `
      <div style="text-align:center;color:white;padding:40px;">
        Failed to load following feed
      </div>
    `;
  }
}