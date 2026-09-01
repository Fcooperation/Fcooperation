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

    const switchBtn =
      document.getElementById(
        "switch-btn"
      );

    const inputLabel =
      document.getElementById(
        "input-label"
      );

    const currencySymbol =
      document.getElementById(
        "currency-symbol"
      );

    const amountInput =
      document.getElementById(
        "amount-input"
      );

    const resultValue =
      document.getElementById(
        "result-value"
      );

    const resultBreakdown =
      document.getElementById(
        "result-breakdown"
      );

    const continueBtn =
      document.getElementById(
        "continue-btn"
      );

    const cards =
      document.querySelectorAll(
        ".topup-card"
      );


    /* =========================
       SETTINGS
    ========================= */

    const NAIRA_PER_FCOINS =
      1500 / 1000;

    const FCOINS_PER_NAIRA =
      1000 / 1500;

    const FEE_RATE = 0.05;

    const MIN_NAIRA = 150;

    const MAX_NAIRA = 150000;


    let inputMode = "naira";

    let selectedNaira = 150;


    /* =========================
       FORMAT
    ========================= */

    function formatNumber(
      number
    ) {

      return Math.floor(
        number
      ).toLocaleString(
        "en-NG"
      );

    }


    /* =========================
       CALCULATE
    ========================= */

    function calculate() {

      let value =
        Number(
          amountInput.value
        );


      if (!value || value < 0) {

        resultValue.textContent =
          "0 FCoins";

        resultBreakdown.textContent =
          "Enter an amount to calculate";

        selectedNaira = 0;

        return;
      }


      let grossNaira;


      if (
        inputMode === "naira"
      ) {

        grossNaira = value;

      } else {

        /*
         * FCoins requested by the user.
         *
         * Convert requested FCoins
         * into the amount needed before fee.
         */

        grossNaira =
          value /
          FCOINS_PER_NAIRA;
      }


      const fee =
        grossNaira *
        FEE_RATE;


      const netNaira =
        grossNaira -
        fee;


      const receivedFcoins =
        Math.floor(
          netNaira *
          FCOINS_PER_NAIRA
        );


      selectedNaira =
        grossNaira;


      if (
        inputMode === "naira"
      ) {

        resultValue.textContent =
          `${formatNumber(
            receivedFcoins
          )} FCoins`;

        resultBreakdown.textContent =
          `₦${formatNumber(
            grossNaira
          )} top-up • ₦${formatNumber(
            fee
          )} charge`;

      } else {

        resultValue.textContent =
          `₦${formatNumber(
            netNaira
          )}`;

        resultBreakdown.textContent =
          `${formatNumber(
            value
          )} FCoins requested • ₦${formatNumber(
            fee
          )} charge`;

      }


      continueBtn.disabled =
        grossNaira < MIN_NAIRA ||
        grossNaira > MAX_NAIRA;

    }


    /* =========================
       SWITCH INPUT
    ========================= */

    switchBtn.addEventListener(
      "click",
      () => {

        if (
          inputMode === "naira"
        ) {

          inputMode = "fcoins";

          inputLabel.textContent =
            "Amount in FCoins";

          currencySymbol.textContent =
            "₣";

          switchBtn.textContent =
            "Switch to Naira";

          amountInput.placeholder =
            "100";

        } else {

          inputMode = "naira";

          inputLabel.textContent =
            "Amount in Naira";

          currencySymbol.textContent =
            "₦";

          switchBtn.textContent =
            "Switch to FCoins";

          amountInput.placeholder =
            "150";

        }


        amountInput.value = "";

        selectedNaira = 0;

        calculate();

      }
    );


    /* =========================
       INPUT
    ========================= */

    amountInput.addEventListener(
      "input",
      () => {

        cards.forEach(
          card => {
            card.classList.remove(
              "selected"
            );
          }
        );

        calculate();

      }
    );


    /* =========================
       QUICK CARDS
    ========================= */

    cards.forEach(
      card => {

        card.addEventListener(
          "click",
          () => {

            const naira =
              Number(
                card.dataset.naira
              );


            cards.forEach(
              item => {
                item.classList.remove(
                  "selected"
                );
              }
            );

            card.classList.add(
              "selected"
            );


            inputMode =
              "naira";

            inputLabel.textContent =
              "Amount in Naira";

            currencySymbol.textContent =
              "₦";

            switchBtn.textContent =
              "Switch to FCoins";


            amountInput.value =
              naira;


            calculate();

          }
        );

      }
    );


/* =========================
   CONTINUE
========================= */

continueBtn.addEventListener(
  "click",
  async () => {

    const naira =
      Math.floor(
        Number(
          selectedNaira
        )
      );


    /* =========================
       VALIDATION
    ========================= */

    if (
      !naira ||
      naira < MIN_NAIRA
    ) {

      alert(
        "Minimum top-up is ₦150."
      );

      return;
    }


    if (
      naira > MAX_NAIRA
    ) {

      alert(
        "Maximum top-up is ₦150,000."
      );

      return;
    }


    /* =========================
       GET ACCOUNT
    ========================= */

    const account =
      JSON.parse(
        localStorage.getItem(
          "faccount"
        )
      ) || {};


    const userId =
      account.id || null;

    const email =
      account.email || null;


    if (!userId) {

      alert(
        "Please log in before topping up."
      );

      return;
    }


    if (!email) {

      alert(
        "Your account email is required for payment."
      );

      return;
    }


    /* =========================
       BUTTON STATE
    ========================= */

    continueBtn.disabled =
      true;

    continueBtn.textContent =
      "Preparing payment...";


    try {

      /* =========================
         CALL FMARKET BACKEND
      ========================= */

      const response =
        await fetch(
          "https://fweb-backend.onrender.com/fmarket-topup",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              userId:
                userId,

              email:
                email,

              amount:
                naira

            })

          }
        );


      const data =
        await response.json();


      /* =========================
         BACKEND ERROR
      ========================= */

      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.error ||
          "Unable to initialize payment."
        );

      }


      /* =========================
         MONNIFY CHECKOUT
      ========================= */

      if (
        !data.checkout_url
      ) {

        throw new Error(
          "Monnify did not return a payment URL."
        );

      }


      /*
       * Send the user to Monnify.
       *
       * After payment, Monnify
       * redirects them to:
       *
       * /fmarket-topup-callback
       */

      window.location.href =
        data.checkout_url;


    } catch (error) {

      alert(
        error.message ||
        "Something went wrong while starting payment."
      );


      continueBtn.disabled =
        false;

      continueBtn.textContent =
        "Continue to Payment";

    }

  }
);


    /* =========================
       BACK
    ========================= */

    backBtn.addEventListener(
      "click",
      () => {

        window.history.back();

      }
    );


    /* =========================
       INITIAL
    ========================= */

    amountInput.value =
      "150";

    cards[0]?.classList.add(
      "selected"
    );

    calculate();

  }
);