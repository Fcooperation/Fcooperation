document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =========================
       CONFIG
    ========================= */

    const API_URL =
      "https://fweb-backend.onrender.com/fmarket-orders";


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

    const ordersPage =
      document.getElementById(
        "orders-page"
      );

    const buyingTab =
      document.getElementById(
        "buying-tab"
      );

    const sellingTab =
      document.getElementById(
        "selling-tab"
      );

    const buyingSection =
      document.getElementById(
        "buying-section"
      );

    const sellingSection =
      document.getElementById(
        "selling-section"
      );

    const buyingOrders =
      document.getElementById(
        "buying-orders"
      );

    const sellingOrders =
      document.getElementById(
        "selling-orders"
      );

    const noBuying =
      document.getElementById(
        "no-buying-orders"
      );

    const noSelling =
      document.getElementById(
        "no-selling-orders"
      );

    const statusBox =
      document.getElementById(
        "status"
      );


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

    } catch {
      account = null;
    }


    if (
      !account ||
      !account.id
    ) {

      showError(
        "Please log in to view your FMarket orders."
      );

      return;

    }


    /* =========================
       BACK BUTTON
    ========================= */

    backBtn.addEventListener(
      "click",
      () => {

        window.history.back();

      }
    );


    retryBtn.addEventListener(
      "click",
      loadOrders
    );


    /* =========================
       TABS
    ========================= */

    buyingTab.addEventListener(
      "click",
      () => {

        buyingTab.classList.add(
          "active"
        );

        sellingTab.classList.remove(
          "active"
        );

        buyingSection.classList.remove(
          "hidden"
        );

        sellingSection.classList.add(
          "hidden"
        );

      }
    );


    sellingTab.addEventListener(
      "click",
      () => {

        sellingTab.classList.add(
          "active"
        );

        buyingTab.classList.remove(
          "active"
        );

        sellingSection.classList.remove(
          "hidden"
        );

        buyingSection.classList.add(
          "hidden"
        );

      }
    );


    /* =========================
       LOAD ORDERS
    ========================= */

    async function loadOrders() {

      loading.classList.remove(
        "hidden"
      );

      error.classList.add(
        "hidden"
      );

      ordersPage.classList.add(
        "hidden"
      );

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
                action: "get_orders",
                userId: account.id
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
            "Unable to load orders."
          );

        }


        renderOrders(
          data.buying || [],
          data.selling || []
        );


        loading.classList.add(
          "hidden"
        );

        ordersPage.classList.remove(
          "hidden"
        );

      } catch (err) {

        loading.classList.add(
          "hidden"
        );

        showError(
          err.message ||
          "Unable to load orders."
        );

      }

    }


    /* =========================
       RENDER
    ========================= */

    function renderOrders(
      buying,
      selling
    ) {

      buyingOrders.innerHTML = "";
      sellingOrders.innerHTML = "";


      noBuying.classList.toggle(
        "hidden",
        buying.length !== 0
      );

      noSelling.classList.toggle(
        "hidden",
        selling.length !== 0
      );


      buying.forEach(
        order => {

          buyingOrders.appendChild(
            createOrderCard(
              order,
              "buyer"
            )
          );

        }
      );


      selling.forEach(
        order => {

          sellingOrders.appendChild(
            createOrderCard(
              order,
              "seller"
            )
          );

        }
      );

    }


    /* =========================
       CREATE ORDER CARD
    ========================= */

    function createOrderCard(
      order,
      role
    ) {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "order-card";


      const title =
        escapeHtml(
          order.material?.title ||
          order.title ||
          "Physical Textbook"
        );


      const status =
        String(
          order.status ||
          "pending"
        );


      const statusText =
        formatStatus(
          status
        );


      const price =
        Number(
          order.price
        ) || 0;


      const otherPerson =
        role === "buyer"
          ? (
              order.seller?.name ||
              order.seller_name ||
              "Seller"
            )
          : (
              order.buyer?.name ||
              order.buyer_name ||
              "Buyer"
            );


      const deliveryMethod =
        order.delivery_method ||
        "Not selected";


      const location =
        order.delivery_location ||
        "Not provided";


      const date =
        formatDate(
          order.created_at
        );


      card.innerHTML = `

        <div class="order-header">

          <div>

            <h2 class="order-title">
              ${title}
            </h2>

            <div class="order-id">
              Order ID:
              ${escapeHtml(order.id)}
            </div>

          </div>

          <span
            class="order-status status-${escapeHtml(status)}"
          >
            ${escapeHtml(statusText)}
          </span>

        </div>


        <div class="order-price">
          ₣${price.toLocaleString()}
        </div>


        <div class="order-details">

          <div class="detail-row">

            <span>
              ${role === "buyer"
                ? "Seller"
                : "Buyer"}
            </span>

            <strong>
              ${escapeHtml(otherPerson)}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Method
            </span>

            <strong>
              ${escapeHtml(
                formatDeliveryMethod(
                  deliveryMethod
                )
              )}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Location
            </span>

            <strong>
              ${escapeHtml(location)}
            </strong>

          </div>


          <div class="detail-row">

            <span>
              Ordered
            </span>

            <strong>
              ${escapeHtml(date)}
            </strong>

          </div>

        </div>


        ${
          order.buyer_note
            ? `
              <div class="order-note">
                <strong>Buyer note:</strong>
                ${escapeHtml(
                  order.buyer_note
                )}
              </div>
            `
            : ""
        }


        ${
          order.seller_note
            ? `
              <div class="order-note">
                <strong>Seller note:</strong>
                ${escapeHtml(
                  order.seller_note
                )}
              </div>
            `
            : ""
        }


        <div
          class="order-actions"
          data-order-id="${escapeHtml(order.id)}"
        ></div>

      `;


      const actions =
        card.querySelector(
          ".order-actions"
        );


      renderActions(
        actions,
        order,
        role
      );


      return card;

    }


    /* =========================
       ACTIONS
    ========================= */

    function renderActions(
      container,
      order,
      role
    ) {

      const status =
        order.status;


      if (
        role === "seller"
      ) {

        if (
          status === "pending"
        ) {

          addAction(
            container,
            "Accept Order",
            "primary-action",
            () =>
              updateOrder(
                order.id,
                "accept"
              )
          );

        }


        if (
          status === "accepted"
        ) {

          addAction(
            container,
            "Mark Ready",
            "primary-action",
            () =>
              updateOrder(
                order.id,
                "ready"
              )
          );

        }


        if (
          status === "ready"
        ) {

          addAction(
            container,
            "Mark Handed Over",
            "primary-action",
            () =>
              updateOrder(
                order.id,
                "handed_over"
              )
          );

        }

      }


      if (
        role === "buyer"
      ) {

        if (
          status === "handed_over"
        ) {

          addAction(
            container,
            "Confirm Received",
            "primary-action",
            () =>
              updateOrder(
                order.id,
                "received"
              )
          );

        }

      }


      if (
        status === "pending" ||
        status === "accepted"
      ) {

        addAction(
          container,
          "Cancel",
          "danger-action",
          () =>
            updateOrder(
              order.id,
              "cancel"
            )
        );

      }

    }


    function addAction(
      container,
      text,
      className,
      handler
    ) {

      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        `order-action ${className}`;

      button.textContent =
        text;

      button.addEventListener(
        "click",
        handler
      );

      container.appendChild(
        button
      );

    }


    /* =========================
       UPDATE ORDER
    ========================= */

    async function updateOrder(
      orderId,
      action
    ) {

      try {

        showStatus(
          "Updating order..."
        );


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
                action,
                userId: account.id,
                orderId
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
            "Unable to update order."
          );

        }


        showStatus(
          data.message ||
          "Order updated."
        );


        await loadOrders();

      } catch (error) {

        showStatus(
          error.message ||
          "Unable to update order."
        );

      }

    }


    /* =========================
       HELPERS
    ========================= */

    function formatStatus(
      status
    ) {

      const map = {

        pending:
          "Pending",

        accepted:
          "Accepted",

        ready:
          "Ready",

        handed_over:
          "Handed Over",

        received:
          "Received",

        completed:
          "Completed",

        cancelled:
          "Cancelled",

        disputed:
          "Disputed"

      };


      return (
        map[status] ||
        status
      );

    }


    function formatDeliveryMethod(
      method
    ) {

      if (
        method === "pickup"
      ) {
        return "Pickup";
      }

      if (
        method === "delivery"
      ) {
        return "Delivery";
      }

      return "Not selected";

    }


    function formatDate(
      value
    ) {

      if (!value) {
        return "Unknown";
      }


      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "Unknown";

      }


      return date.toLocaleString();

    }


    function escapeHtml(
      value
    ) {

      const div =
        document.createElement(
          "div"
        );

      div.textContent =
        String(
          value ?? ""
        );

      return div.innerHTML;

    }


    function showError(
      message
    ) {

      errorMessage.textContent =
        message;

      error.classList.remove(
        "hidden"
      );

      ordersPage.classList.add(
        "hidden"
      );

      loading.classList.add(
        "hidden"
      );

    }


    function showStatus(
      message
    ) {

      statusBox.textContent =
        message;

      statusBox.classList.remove(
        "hidden"
      );


      clearTimeout(
        showStatus.timer
      );


      showStatus.timer =
        setTimeout(
          () => {

            statusBox.classList.add(
              "hidden"
            );

          },
          3000
        );

    }


    /* =========================
       START
    ========================= */

    loadOrders();

  }
);