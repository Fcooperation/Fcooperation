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
      
      const deliveryModal =
  document.getElementById(
    "delivery-modal"
  );

const closeDeliveryModal =
  document.getElementById(
    "close-delivery-modal"
  );

const pickupOption =
  document.getElementById(
    "pickup-option"
  );

const deliveryOption =
  document.getElementById(
    "delivery-option"
  );

const deliveryLocationInput =
  document.getElementById(
    "delivery-location-input"
  );

const saveDeliveryBtn =
  document.getElementById(
    "save-delivery-btn"
  );
  
  let currentDeliveryOrder = null;

let selectedDeliveryMethod =
  "pickup";


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


      const pickupLocation =
  order.material?.pickup_location ||
  "Not provided";

const deliveryLocation =
  order.delivery_method === "delivery"
    ? (
        order.delivery_location ||
        "Not provided"
      )
    : "Not required for pickup";

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

  <div class="price-row">
    <span>Item</span>
    <strong>
      ₣${price.toLocaleString()}
    </strong>
  </div>

  ${
    order.delivery_method === "delivery" &&
    Number(order.delivery_fee) > 0
      ? `
        <div class="price-row delivery-price-row">
          <span>Delivery</span>
          <strong>
            ₣${Number(
              order.delivery_fee
            ).toLocaleString()}
          </strong>
        </div>

        <div class="price-total-row">
          <span>Total</span>
          <strong>
            ₣${(
              price +
              Number(order.delivery_fee)
            ).toLocaleString()}
          </strong>
        </div>
      `
      : ""
  }

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
    Pickup Location
  </span>

  <strong>
    ${escapeHtml(pickupLocation)}
  </strong>

</div>


<div class="detail-row">

  <span>
    Delivery Location
  </span>

  <strong>
    ${escapeHtml(deliveryLocation)}
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


${
  role === "buyer" &&
  [
    "pending",
    "accepted"
  ].includes(order.status)
    ? `
      <button
        class="delivery-edit-btn"
        type="button"
        data-delivery-order="${escapeHtml(order.id)}"
      >
        ${
          order.delivery_method &&
          order.delivery_location
            ? "Edit Delivery Details"
            : "Set Delivery Details"
        }
      </button>
    `
    : ""
}

      `;


      const actions =
        card.querySelector(
          ".order-actions"
        );
        
        const deliveryButton =
  card.querySelector(
    "[data-delivery-order]"
  );


if (deliveryButton) {

  deliveryButton.addEventListener(
    "click",
    () => {

      openDeliveryModal(
        order
      );

    }
  );

}


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


  const method =
    order.delivery_method;


  const deliveryDetailsSet =
    Boolean(
      method &&
      (
        method === "pickup" ||
        order.delivery_location
      )
    );


  const deliveryFeeStatus =
    order.delivery_fee_status ||
    "not_required";


  /* =========================
     SELLER ACTIONS
  ========================= */

  if (
    role === "seller"
  ) {

    /* -------------------------
       ACCEPT ORDER
    ------------------------- */

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


    /* -------------------------
       ACCEPTED
    ------------------------- */

    if (
      status === "accepted"
    ) {

      /*
         PICKUP

         No delivery fee is needed.
         Buyer only needs to choose pickup.
      */

      if (
        method === "pickup"
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


      /*
         DELIVERY

         Buyer has selected delivery,
         but seller still needs to
         propose a delivery fee.

         The fee UI will be added
         in the next step.
      */

      else if (
        method === "delivery"
      ) {

       if (
  deliveryFeeStatus ===
  "pending"
) {

  const feeBox =
    document.createElement(
      "div"
    );

  feeBox.className =
    "delivery-fee-box";


  feeBox.innerHTML = `

    <div class="delivery-fee-title">
      Set Delivery Fee
    </div>

    <div class="delivery-fee-location">
      Deliver to:
      <strong>
        ${escapeHtml(
          order.delivery_location ||
          "Buyer location"
        )}
      </strong>
    </div>

    <div class="delivery-fee-input-row">

      <span class="fcoin-symbol">
        ₣
      </span>

      <input
        type="number"
        class="delivery-fee-input"
        min="1"
        max="1000000"
        step="1"
        placeholder="Enter fee"
      >

    </div>

    <button
      type="button"
      class="order-action primary-action delivery-fee-submit"
    >
      Propose Fee
    </button>

  `;


  const feeInput =
    feeBox.querySelector(
      ".delivery-fee-input"
    );


  const submitButton =
    feeBox.querySelector(
      ".delivery-fee-submit"
    );


  submitButton.addEventListener(
    "click",
    () => {

      proposeDeliveryFee(
        order.id,
        feeInput,
        submitButton
      );

    }
  );


  container.appendChild(
    feeBox
  );

}


        else if (
  deliveryFeeStatus ===
  "proposed"
) {

  if (
    role === "seller"
  ) {

    const waiting =
      document.createElement(
        "div"
      );

    waiting.className =
      "order-waiting";

    waiting.textContent =
      "Waiting for the buyer to accept the delivery fee.";

    container.appendChild(
      waiting
    );

  }

}


        else if (
          deliveryFeeStatus ===
          "accepted"
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

      }


      else {

        const waiting =
          document.createElement(
            "div"
          );

        waiting.className =
          "order-waiting";

        waiting.textContent =
          "Waiting for the buyer to choose pickup or delivery.";

        container.appendChild(
          waiting
        );

      }

    }


    /* -------------------------
       READY
    ------------------------- */

    if (
      status === "ready"
    ) {

      if (
        method === "delivery"
      ) {

        addAction(
          container,
          "Start Delivery",
          "primary-action",
          () =>
            updateOrder(
              order.id,
              "out_for_delivery"
            )
        );

      }

      else {

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


    /* -------------------------
       OUT FOR DELIVERY
    ------------------------- */

    if (
      status === "out_for_delivery"
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


  /* =========================
     BUYER ACTIONS
  ========================= */

  if (
    role === "buyer"
  ) {
    
    /* =========================
   DELIVERY FEE PROPOSAL
========================= */

if (
  status === "accepted" &&
  order.delivery_method === "delivery" &&
  order.delivery_fee_status === "proposed"
) {

  const fee =
    Number(
      order.delivery_fee
    ) || 0;


  const feeBox =
    document.createElement(
      "div"
    );

  feeBox.className =
    "delivery-fee-box buyer-fee-box";


  feeBox.innerHTML = `

    <div class="delivery-fee-title">
      Delivery Fee Proposal
    </div>

    <div class="delivery-fee-proposed">

      <span>
        Delivery fee
      </span>

      <strong>
        ₣${fee.toLocaleString()}
      </strong>

    </div>

    <div class="delivery-fee-total">

      <span>
        Item + delivery
      </span>

      <strong>
        ₣${(
          Number(order.price || 0) +
          fee
        ).toLocaleString()}
      </strong>

    </div>

    <div class="delivery-fee-actions">

      <button
        type="button"
        class="order-action primary-action"
        data-fee-accept
      >
        Accept Fee
      </button>

      <button
        type="button"
        class="order-action danger-action"
        data-fee-reject
      >
        Reject Fee
      </button>

    </div>

  `;


  const acceptButton =
    feeBox.querySelector(
      "[data-fee-accept]"
    );


  const rejectButton =
    feeBox.querySelector(
      "[data-fee-reject]"
    );


  acceptButton.addEventListener(
    "click",
    () =>
      respondToDeliveryFee(
        order.id,
        "accept_delivery_fee",
        acceptButton,
        rejectButton
      )
  );


  rejectButton.addEventListener(
    "click",
    () =>
      respondToDeliveryFee(
        order.id,
        "reject_delivery_fee",
        acceptButton,
        rejectButton
      )
  );


  container.appendChild(
    feeBox
  );

}

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


  /* =========================
     CANCELLATION
  ========================= */

  /*
     Once the seller has marked the
     order ready, fulfillment has begun.

     For delivery orders, accepting
     the delivery fee will also lock
     the agreement. The backend will
     enforce this too.
  */

  const fulfillmentStarted =
    [
      "ready",
      "out_for_delivery",
      "handed_over",
      "received",
      "completed"
    ].includes(status);


  const deliveryAgreementLocked =
    method === "delivery" &&
    deliveryFeeStatus === "accepted";


  const cancelLocked =
    fulfillmentStarted ||
    deliveryAgreementLocked;


  if (
    !cancelLocked
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
   DELIVERY DETAILS
========================= */

function openDeliveryModal(order) {

  currentDeliveryOrder =
    order;

  selectedDeliveryMethod =
    order.delivery_method ||
    "pickup";


  if (
    selectedDeliveryMethod === "delivery"
  ) {

    deliveryLocationInput.value =
      order.delivery_location ||
      "";

  } else {

    deliveryLocationInput.value =
      "";

  }


  updateDeliveryMethodUI();


  deliveryModal.classList.remove(
    "hidden"
  );

}

function closeDeliveryModalWindow() {

  deliveryModal.classList.add(
    "hidden"
  );

  currentDeliveryOrder =
    null;

}


function updateDeliveryMethodUI() {

  pickupOption.classList.toggle(
    "active",
    selectedDeliveryMethod === "pickup"
  );

  deliveryOption.classList.toggle(
    "active",
    selectedDeliveryMethod === "delivery"
  );


  if (
    selectedDeliveryMethod === "pickup"
  ) {

    deliveryLocationInput.value = "";

    deliveryLocationInput.classList.add(
      "hidden"
    );

    document
      .getElementById(
        "delivery-location-label"
      )
      .classList.add(
        "hidden"
      );

    document
      .getElementById(
        "delivery-location-hint"
      )
      .classList.add(
        "hidden"
      );

  } else {

    deliveryLocationInput.classList.remove(
      "hidden"
    );

    document
      .getElementById(
        "delivery-location-label"
      )
      .classList.remove(
        "hidden"
      );

    document
      .getElementById(
        "delivery-location-hint"
      )
      .classList.remove(
        "hidden"
      );

    deliveryLocationInput.placeholder =
      "Enter the location where you want the textbook delivered...";

  }

}


pickupOption.addEventListener(
  "click",
  () => {

    selectedDeliveryMethod =
      "pickup";

    deliveryLocationInput.value =
      "";

    updateDeliveryMethodUI();

  }
);


deliveryOption.addEventListener(
  "click",
  () => {

    selectedDeliveryMethod =
      "delivery";

    if (
      currentDeliveryOrder
    ) {

      deliveryLocationInput.value =
        currentDeliveryOrder
          .delivery_location ||
        "";

    }

    updateDeliveryMethodUI();

  }
);


closeDeliveryModal.addEventListener(
  "click",
  closeDeliveryModalWindow
);


deliveryModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      deliveryModal
    ) {

      closeDeliveryModalWindow();

    }

  }
);


saveDeliveryBtn.addEventListener(
  "click",
  saveDeliveryDetails
);


async function saveDeliveryDetails() {

  if (
    !currentDeliveryOrder
  ) {

    return;

  }


  const location =
    deliveryLocationInput.value.trim();


  /* =========================
     PICKUP
  ========================= */

  if (
    selectedDeliveryMethod ===
    "pickup"
  ) {

    const pickupLocation =
      currentDeliveryOrder
        .material
        ?.pickup_location;


    if (
      !pickupLocation
    ) {

      showStatus(
        "The seller has not provided a pickup location."
      );

      return;

    }

  }


  /* =========================
     DELIVERY
  ========================= */

  if (
    selectedDeliveryMethod ===
    "delivery"
  ) {

    if (!location) {

      showStatus(
        "Please enter your delivery location."
      );

      return;

    }


    if (
      location.length < 3
    ) {

      showStatus(
        "Please enter a valid delivery location."
      );

      return;

    }

  }


  saveDeliveryBtn.disabled =
    true;

  saveDeliveryBtn.textContent =
    "Saving...";


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
              "set_delivery",

            userId:
              account.id,

            orderId:
              currentDeliveryOrder.id,

            deliveryMethod:
              selectedDeliveryMethod,

            deliveryLocation:
              selectedDeliveryMethod ===
              "delivery"
                ? location
                : ""

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
        "Unable to save delivery details."
      );

    }


    closeDeliveryModalWindow();


    showStatus(
      data.message ||
      "Delivery details saved."
    );


    await loadOrders();


  } catch (error) {

    showStatus(
      error.message ||
      "Unable to save delivery details."
    );

  } finally {

    saveDeliveryBtn.disabled =
      false;

    saveDeliveryBtn.textContent =
      "Save Delivery Details";

  }

}

/* =========================
   PROPOSE DELIVERY FEE
========================= */

async function proposeDeliveryFee(
  orderId,
  input,
  button
) {

  const fee =
    Number(
      input.value
    );


  if (
    !Number.isInteger(fee) ||
    fee <= 0
  ) {

    showStatus(
      "Enter a valid delivery fee."
    );

    input.focus();

    return;

  }


  if (
    fee > 1000000
  ) {

    showStatus(
      "Delivery fee is too high."
    );

    input.focus();

    return;

  }


  button.disabled =
    true;

  button.textContent =
    "Proposing...";


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
              "propose_delivery_fee",

            userId:
              account.id,

            orderId,

            deliveryFee:
              fee

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
        "Unable to propose delivery fee."
      );

    }


    showStatus(
      data.message ||
      "Delivery fee proposed."
    );


    await loadOrders();


  } catch (error) {

    showStatus(
      error.message ||
      "Unable to propose delivery fee."
    );

  } finally {

    button.disabled =
      false;

    button.textContent =
      "Propose Fee";

  }

}

/* =========================
   DELIVERY FEE RESPONSE
========================= */

async function respondToDeliveryFee(
  orderId,
  action,
  acceptButton,
  rejectButton
) {

  acceptButton.disabled =
    true;

  rejectButton.disabled =
    true;


  acceptButton.textContent =
    action === "accept_delivery_fee"
      ? "Accepting..."
      : "Accept Fee";

  rejectButton.textContent =
    action === "reject_delivery_fee"
      ? "Rejecting..."
      : "Reject Fee";


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

            action,

            userId:
              account.id,

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
        "Unable to update delivery fee."
      );

    }


    showStatus(
      data.message ||
      "Delivery fee updated."
    );


    await loadOrders();


  } catch (error) {

    showStatus(
      error.message ||
      "Unable to update delivery fee."
    );


    acceptButton.disabled =
      false;

    rejectButton.disabled =
      false;

  }

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

out_for_delivery:
  "Out for Delivery",

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