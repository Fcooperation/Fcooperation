document.addEventListener(
  "DOMContentLoaded",
  () => {

    const verifyingState =
      document.getElementById(
        "verifying-state"
      );

    const successState =
      document.getElementById(
        "success-state"
      );

    const failedState =
      document.getElementById(
        "failed-state"
      );

    const amountPaid =
      document.getElementById(
        "amount-paid"
      );

    const fcoinsAdded =
      document.getElementById(
        "fcoins-added"
      );

    const failedMessage =
      document.getElementById(
        "failed-message"
      );

    const backMarketBtn =
      document.getElementById(
        "back-market-btn"
      );

    const failedMarketBtn =
      document.getElementById(
        "failed-market-btn"
      );

    const retryBtn =
      document.getElementById(
        "retry-btn"
      );


    function showState(state) {

      verifyingState.classList.remove(
        "active"
      );

      successState.classList.remove(
        "active"
      );

      failedState.classList.remove(
        "active"
      );

      state.classList.add(
        "active"
      );
    }


    function goToMarket() {
      window.location.href =
        "/fmarket";
    }


    backMarketBtn.addEventListener(
      "click",
      goToMarket
    );

    failedMarketBtn.addEventListener(
      "click",
      goToMarket
    );


    retryBtn.addEventListener(
      "click",
      () => {
        window.location.href =
          "/fmarket-topup";
      }
    );


    async function verifyPayment() {

      const params =
        new URLSearchParams(
          window.location.search
        );

      const paymentReference =
        params.get(
          "paymentReference"
        );

      const transactionReference =
        params.get(
          "transactionReference"
        );


      if (
        !paymentReference &&
        !transactionReference
      ) {

        failedMessage.textContent =
          "No payment reference was found.";

        showState(
          failedState
        );

        return;
      }


      try {

        const response =
          await fetch(
            "https://fweb-backend.onrender.com/fmarket-topup/verify",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                paymentReference:
                  paymentReference,

                transactionReference:
                  transactionReference

              })
            }
          );


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.error ||
            "Payment could not be verified."
          );
        }


        if (
          data.status ===
          "successful"
        ) {

          amountPaid.textContent =
            `₦${Number(
              data.amount_naira || 0
            ).toLocaleString()}`;

          fcoinsAdded.textContent =
            `${Number(
              data.fcoins || 0
            ).toLocaleString()} FCoins`;


          /*
           * Keep local account balance
           * synchronized after payment.
           */

          const account =
            JSON.parse(
              localStorage.getItem(
                "faccount"
              )
            ) || {};


          if (
            typeof data.fcoins_balance ===
            "number"
          ) {

            account.fcoins =
              data.fcoins_balance;

            localStorage.setItem(
              "faccount",
              JSON.stringify(account)
            );

          }


          showState(
            successState
          );

          return;
        }


        failedMessage.textContent =
          data.message ||
          "The payment was not completed.";

        showState(
          failedState
        );

      } catch (error) {

        failedMessage.textContent =
          error.message ||
          "We couldn't verify your payment.";

        showState(
          failedState
        );

      }

    }


    verifyPayment();

  }
);