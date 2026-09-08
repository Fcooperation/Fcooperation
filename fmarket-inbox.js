document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =========================
       ELEMENTS
    ========================= */

    const backBtn =
      document.getElementById(
        "back-btn"
      );

    const loading =
      document.getElementById(
        "loading"
      );

    const error =
      document.getElementById(
        "error"
      );

    const errorMessage =
      document.getElementById(
        "error-message"
      );

    const retryBtn =
      document.getElementById(
        "retry-btn"
      );

    const empty =
      document.getElementById(
        "empty"
      );

    const inbox =
      document.getElementById(
        "inbox"
      );

    const notificationCard =
      document.getElementById(
        "notification-card"
      );

    const notificationIcon =
      document.getElementById(
        "notification-icon"
      );

    const notificationTitle =
      document.getElementById(
        "notification-title"
      );

    const notificationMessage =
      document.getElementById(
        "notification-message"
      );

    const notificationTime =
      document.getElementById(
        "notification-time"
      );

    const unreadDot =
      document.getElementById(
        "unread-dot"
      );

    const unreadLabel =
      document.getElementById(
        "unread-label"
      );

    const markReadBtn =
      document.getElementById(
        "mark-read-btn"
      );

    const viewOrderBtn =
      document.getElementById(
        "view-order-btn"
      );


    /* =========================
       CONFIG
    ========================= */

    const API_URL =
      "https://fweb-backend.onrender.com/fmarket-inbox";


    /* =========================
       ACCOUNT
    ========================= */

    let account = null;

    try {

      account =
        JSON.parse(
          localStorage.getItem(
            "faccount"
          )
        );

    } catch (e) {

      account = null;

    }


    /* =========================
       INBOX CHECKPOINT
    ========================= */

    let lastEventId =
      localStorage.getItem(
        "fmarket_inbox_last_event_id"
      ) || null;

    let lastEventAt =
      localStorage.getItem(
        "fmarket_inbox_last_event_at"
      ) || null;


    /*
      Notifications received from
      the backend.

      We keep them in memory so the
      newest one can be displayed.
    */

    let notifications = [];


    /* =========================
       HELPERS
    ========================= */

    function show(element) {

      if (!element) {
        return;
      }

      element.classList.remove(
        "hidden"
      );

    }


    function hide(element) {

      if (!element) {
        return;
      }

      element.classList.add(
        "hidden"
      );

    }


    function formatTime(
      timestamp
    ) {

      if (!timestamp) {
        return "";
      }


      const date =
        new Date(timestamp);

      const now =
        new Date();

      const diff =
        Math.floor(
          (now - date) / 1000
        );


      if (diff < 60) {
        return "Just now";
      }


      if (diff < 3600) {

        const minutes =
          Math.floor(
            diff / 60
          );

        return `${minutes}m ago`;

      }


      if (diff < 86400) {

        const hours =
          Math.floor(
            diff / 3600
          );

        return `${hours}h ago`;

      }


      if (diff < 604800) {

        const days =
          Math.floor(
            diff / 86400
          );

        return `${days}d ago`;

      }


      return date.toLocaleDateString(
        undefined,
        {
          day: "numeric",
          month: "short",
          year: "numeric"
        }
      );

    }


    function getIcon(
      type,
      title
    ) {

      const text =
        `${type || ""} ${title || ""}`
          .toLowerCase();


      if (
        text.includes(
          "delivery"
        )
      ) {

        return "🚚";

      }


      if (
        text.includes(
          "payment"
        ) ||
        text.includes(
          "fee"
        )
      ) {

        return "💰";

      }


      if (
        text.includes(
          "cancel"
        )
      ) {

        return "❌";

      }


      if (
        text.includes(
          "complete"
        ) ||
        text.includes(
          "received"
        )
      ) {

        return "✅";

      }


      if (
        text.includes(
          "ready"
        )
      ) {

        return "📦";

      }


      return "📦";

    }


    /* =========================
       SAVE CHECKPOINT
    ========================= */

    function saveCheckpoint(
      id,
      timestamp
    ) {

      if (id) {

        lastEventId = id;

        localStorage.setItem(
          "fmarket_inbox_last_event_id",
          id
        );

      }


      if (timestamp) {

        lastEventAt =
          timestamp;

        localStorage.setItem(
          "fmarket_inbox_last_event_at",
          timestamp
        );

      }

    }


    /* =========================
       LOAD INBOX
    ========================= */

    async function loadInbox(
      initialLoad = false
    ) {

      if (
        !account ||
        !account.id
      ) {

        hide(loading);
        hide(inbox);
        hide(empty);

        errorMessage.textContent =
          "Please log in to view your FMarket inbox.";

        show(error);

        return;

      }


      if (initialLoad) {

        hide(error);
        hide(empty);
        hide(inbox);

        show(loading);

      }


      try {

        const response =
          await fetch(
            API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                action:
                  "get_inbox",

                userId:
                  account.id,

                lastEventId:
                  lastEventId,

                lastEventAt:
                  lastEventAt

              })

            }
          );


        const result =
          await response.json();


        if (
          !response.ok ||
          !result.success
        ) {

          throw new Error(
            result.error ||
            "Unable to load inbox."
          );

        }


        /*
          Backend sends:

          notifications: []

          We append any new
          notifications received.
        */

        if (
          Array.isArray(
            result.notifications
          ) &&
          result.notifications.length
        ) {

          notifications =
            notifications.concat(
              result.notifications
            );


          /*
            The backend response has
            now successfully reached
            the frontend.

            Save the newest checkpoint.
          */

          const latest =
            result.notifications[
              result.notifications.length - 1
            ];


          saveCheckpoint(
            latest.id,
            latest.created_at
          );

        }


        /*
          If backend returned its
          checkpoint even without
          notifications, keep it.
        */

        if (
          result.last_event_id
        ) {

          lastEventId =
            result.last_event_id;

        }


        if (
          result.last_event_at
        ) {

          lastEventAt =
            result.last_event_at;

        }


        hide(loading);


        /*
          Display the newest
          notification.
        */

        renderLatest();


      } catch (err) {

        hide(loading);

        /*
          Don't destroy an already
          displayed notification if
          a background poll fails.
        */

        if (
          initialLoad ||
          !notifications.length
        ) {

          errorMessage.textContent =
            err.message ||
            "Unable to load inbox.";

          show(error);

        }

      }

    }


    /* =========================
       RENDER LATEST
    ========================= */

    function renderLatest() {

      /*
        No notification has ever
        been received.
      */

      if (
        !notifications.length
      ) {

        hide(inbox);
        show(empty);

        return;

      }


      const data =
        notifications[
          notifications.length - 1
        ];


      show(inbox);
      hide(empty);


      notificationTitle.textContent =
        data.title ||
        "FMarket update";


      notificationMessage.textContent =
        data.message ||
        "There is an update on your FMarket activity.";


      notificationTime.textContent =
        formatTime(
          data.created_at
        );


      notificationIcon.textContent =
        getIcon(
          data.type,
          data.title
        );


      /*
        A newly received notification
        is unread until the user marks
        it as read.
      */

      notificationCard.classList.add(
        "unread"
      );


      show(unreadDot);


      unreadLabel.textContent =
        "New update";


      show(markReadBtn);


      /* =========================
         VIEW ORDER
      ========================= */

      if (
        data.order_id
      ) {

        show(viewOrderBtn);


        viewOrderBtn.onclick =
          () => {

            window.location.href =
              `/fmarket-orders?orderId=${encodeURIComponent(
                data.order_id
              )}`;

          };

      } else {

        hide(viewOrderBtn);

      }

    }


    /* =========================
       MARK READ
    ========================= */

    function markAsRead() {

      /*
        The inbox is a checkpoint,
        not a notification database.

        Once the user has seen the
        latest notification, simply
        remove its unread state.
      */

      hide(unreadDot);


      unreadLabel.textContent =
        "Latest update";


      hide(markReadBtn);


      notificationCard.classList.remove(
        "unread"
      );

    }


    /* =========================
       EVENTS
    ========================= */

    backBtn.onclick =
      () => {

        history.back();

      };


    retryBtn.onclick =
      () => {

        loadInbox(true);

      };


    markReadBtn.onclick =
      () => {

        markAsRead();

      };


    /* =========================
       INITIAL LOAD
    ========================= */

    loadInbox(true);


    /* =========================
       LIGHT POLLING
    ========================= */

    setInterval(
      () => {

        if (
          document.hidden
        ) {

          return;

        }


        loadInbox(false);

      },
      5000
    );

  }
);