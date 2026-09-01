document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =========================
       ELEMENTS
    ========================= */

    const username =
      document.getElementById(
        "username"
      );

    const balanceValue =
      document.getElementById(
        "balance-value"
      );

    const topupBtn =
      document.getElementById(
        "topup-btn"
      );

    const sellBtn =
      document.getElementById(
        "sell-btn"
      );


    /* =========================
       ACCOUNT
    ========================= */

    const account =
      JSON.parse(
        localStorage.getItem(
          "faccount"
        )
      ) || {};


    /*
     * User ID is stored as:
     *
     * faccount.id
     */

    const userId =
      account.id || null;


    /* =========================
       USERNAME
    ========================= */

    username.textContent =
      account.username ||
      account.name ||
      "User";


    /* =========================
       API
    ========================= */

    const API_URL =
      "https://fweb-backend.onrender.com/fmarket";


    /* =========================
       LOAD ACCOUNT DATA
    ========================= */

    async function loadMarketAccount() {

      try {

        /*
         * The backend needs the
         * user's ID to return
         * their FCoins.
         */

        if (!userId) {

          balanceValue.textContent =
            "0";

          return;

        }


        const params =
          new URLSearchParams();


        params.set(
          "userId",
          userId
        );


        params.set(
          "page",
          "1"
        );


        const response =
          await fetch(
            `${API_URL}?${params.toString()}`
          );


        if (!response.ok) {

          throw new Error(
            `Request failed: ${response.status}`
          );

        }


        const data =
          await response.json();


        if (
          !data.success
        ) {

          throw new Error(
            data.error ||
            "Failed to load account"
          );

        }


        /* =========================
           FCOINS
        ========================= */

        const fcoins =
          Number(
            data.fcoins
          ) || 0;


        balanceValue.textContent =
          fcoins.toLocaleString();


        /*
         * Update localStorage too.
         */

        account.fcoins =
          fcoins;


        localStorage.setItem(
          "faccount",
          JSON.stringify(
            account
          )
        );


      } catch {

        /*
         * Keep the UI safe if
         * the request fails.
         */

        balanceValue.textContent =
          "0";

      }

    }


    /* =========================
       TOP UP
    ========================= */

    if (topupBtn) {

      topupBtn.addEventListener(
        "click",
        () => {

          window.location.href =
            "/fmarket-topup";

        }
      );

    }


    /* =========================
       SELL
    ========================= */

    if (sellBtn) {

      sellBtn.addEventListener(
        "click",
        () => {

          window.location.href =
            "/fmarket-sell";

        }
      );

    }


    /* =========================
       START
    ========================= */

    loadMarketAccount();

  }
);