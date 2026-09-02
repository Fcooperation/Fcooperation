document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =========================
       ELEMENTS
    ========================= */

    const searchInput =
      document.getElementById(
        "search-input"
      );

    const productGrid =
      document.getElementById(
        "product-grid"
      );

    const emptySearch =
      document.getElementById(
        "empty-search"
      );

    const seeAllBtn =
      document.getElementById(
        "see-all-btn"
      );

    const sellBtn =
      document.getElementById(
        "sell-btn"
      );

    const balanceValue =
      document.getElementById(
        "balance-value"
      );
      
      const balanceNaira =
  document.getElementById(
    "balance-naira"
  );

    const categoryButtons =
      document.querySelectorAll(
        ".category-card"
      );

const balanceEye =
  document.getElementById(
    "balance-eye"
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
     * The user's ID is stored
     * directly as faccount.id
     */

    const userId =
      account.id || null;


const urlParams =
  new URLSearchParams(
    window.location.search
  );

const sharedItemId =
  urlParams.get("id");

if (sharedItemId) {

  window.location.href =
    `/fmarket-buy?id=${encodeURIComponent(
      sharedItemId
    )}`;

  return;
}

    /* =========================
       API
    ========================= */

    const API_URL =
      "https://fweb-backend.onrender.com/fmarket";


    /* =========================
       STATE
    ========================= */

    let currentPage = 1;

    let totalPages = 1;

    let activeCategory =
      "all";

    let currentMaterials = [];
    
    let balanceHidden = false;


    /* =========================
       LOADING
    ========================= */

    function showLoading() {

      productGrid.innerHTML = `
        <div class="market-loading">
          Loading materials...
        </div>
      `;

      emptySearch.classList.add(
        "hidden"
      );

    }


    /* =========================
       EMPTY
    ========================= */

    function showEmpty(
      message =
        "No materials available."
    ) {

      productGrid.innerHTML = "";

      emptySearch.classList.remove(
        "hidden"
      );

      const text =
        emptySearch.querySelector(
          "p"
        );

      if (text) {
        text.textContent =
          message;
      }

    }

/* =========================
   UPDATE BALANCE DISPLAY
========================= */

function updateBalanceDisplay(
  fcoins
) {

  balanceValue.dataset.value =
    fcoins;


  const naira =
    Math.floor(
      fcoins * 1.5
    );


  if (balanceHidden) {

    balanceValue.textContent =
      "••••••";

    balanceNaira.textContent =
      "₦••••••";


    balanceEye.innerHTML = `
      <svg
        class="eye-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 3L21 21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />

        <path
          d="M10.58 10.58A2 2 0 0 0 13.42 13.42"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />

        <path
          d="M9.88 5.09A10.74 10.74 0 0 1 12 4.8c6.5 0 10 7.2 10 7.2a18.6 18.6 0 0 1-3.05 3.87"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <path
          d="M6.61 6.61C3.6 8.72 2 12 2 12s3.5 7.2 10 7.2c1.61 0 3.04-.38 4.29-1.02"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;


    balanceEye.setAttribute(
      "aria-label",
      "Show balance"
    );


  } else {

    balanceValue.textContent =
      fcoins.toLocaleString(
        "en-NG"
      );

    balanceNaira.textContent =
      `₦${naira.toLocaleString(
        "en-NG"
      )}`;


    balanceEye.innerHTML = `
      <svg
        class="eye-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    `;


    balanceEye.setAttribute(
      "aria-label",
      "Hide balance"
    );

  }

}

    /* =========================
       LOAD FMARKET
    ========================= */

    async function loadMarket(
      page = 1
    ) {

      showLoading();


      try {

        const params =
          new URLSearchParams();


        params.set(
          "page",
          page
        );


        /*
         * Send user ID so the
         * backend can return
         * the user's FCoins.
         */

        if (userId) {

          params.set(
            "userId",
            userId
          );

        }


        /*
         * Send category to backend
         * when a specific category
         * is selected.
         */

        if (
          activeCategory !==
          "all"
        ) {

          params.set(
            "category",
            activeCategory
          );

        }


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
            "Failed to load FMarket"
          );

        }


        /* =========================
           FCOINS
        ========================= */

        const fcoins =
          Number(
            data.fcoins
          ) || 0;


        updateBalanceDisplay(
  fcoins
);


        /*
         * Keep localStorage
         * synchronized too.
         */

        if (account) {

          account.fcoins =
            fcoins;

          localStorage.setItem(
            "faccount",
            JSON.stringify(
              account
            )
          );

        }


        /* =========================
           MATERIALS
        ========================= */

        currentMaterials =
          data.materials || [];


        /* =========================
           PAGINATION
        ========================= */

        currentPage =
          data.pagination?.page ||
          page;


        totalPages =
          data.pagination?.total_pages ||
          1;


        renderMaterials();


      } catch (error) {

        productGrid.innerHTML = `
          <div class="market-loading">
            Failed to load FMarket.
          </div>
        `;

        emptySearch.classList.add(
          "hidden"
        );

      }

    }


    /* =========================
       RENDER MATERIALS
    ========================= */

    function renderMaterials() {

      const query =
        searchInput.value
          .trim()
          .toLowerCase();


      const filtered =
        currentMaterials.filter(
          material => {

            if (!query) {
              return true;
            }


            const searchableText =
              [
                material.title,
                material.description,
                material.category,
                material.course,
                material.university,
                material.department,
                material.location,
                material.seller_name
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            return searchableText.includes(
              query
            );

          }
        );


      productGrid.innerHTML = "";


      if (
        filtered.length === 0
      ) {

        showEmpty(
          query
            ? "Try searching for another material."
            : "No materials available yet."
        );

        return;

      }


      emptySearch.classList.add(
        "hidden"
      );


      filtered.forEach(
        material => {

          const card =
            createProductCard(
              material
            );


          productGrid.appendChild(
            card
          );

        }
      );

    }

/* =========================
   SHARE BOX
========================= */

function openShareBox(material) {

  /* =========================
     REMOVE EXISTING BOX
  ========================= */

  const existing =
    document.getElementById(
      "fmarket-share-overlay"
    );

  if (existing) {
    existing.remove();
  }


  /* =========================
     SHARE URL
  ========================= */

  const shareUrl =
    `${window.location.origin}/fmarket?id=${encodeURIComponent(
      material.id
    )}`;


  /* =========================
     OVERLAY
  ========================= */

  const overlay =
    document.createElement(
      "div"
    );

  overlay.id =
    "fmarket-share-overlay";

  overlay.className =
    "fmarket-share-overlay";


  /* =========================
     SHARE BOX
  ========================= */

  const box =
    document.createElement(
      "div"
    );

  box.id =
    "fmarket-share-box";

  box.className =
    "fmarket-share-box";


  /* =========================
     HEADER
  ========================= */

  const header =
    document.createElement(
      "div"
    );

  header.className =
    "share-box-header";


  const title =
    document.createElement(
      "strong"
    );

  title.textContent =
    "Share this item";


  const closeButton =
    document.createElement(
      "button"
    );

  closeButton.type =
    "button";

  closeButton.className =
    "share-close-btn";

  closeButton.setAttribute(
    "aria-label",
    "Close"
  );

  closeButton.textContent =
    "×";


  header.appendChild(
    title
  );

  header.appendChild(
    closeButton
  );


  /* =========================
     LINK SECTION
  ========================= */

  const linkRow =
    document.createElement(
      "div"
    );

  linkRow.className =
    "share-link-row";


  const input =
    document.createElement(
      "input"
    );

  input.type =
    "text";

  input.className =
    "share-link-input";

  input.value =
    shareUrl;

  input.readOnly =
    true;


  const copyButton =
    document.createElement(
      "button"
    );

  copyButton.type =
    "button";

  copyButton.className =
    "share-copy-btn";

  copyButton.textContent =
    "Copy";


  linkRow.appendChild(
    input
  );

  linkRow.appendChild(
    copyButton
  );


  /* =========================
     BUILD BOX
  ========================= */

  box.appendChild(
    header
  );

  box.appendChild(
    linkRow
  );

  overlay.appendChild(
    box
  );

  document.body.appendChild(
    overlay
  );


  /* =========================
     CLOSE
  ========================= */

  closeButton.addEventListener(
    "click",
    () => {
      overlay.remove();
    }
  );


  /* =========================
     CLICK OUTSIDE
  ========================= */

  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        overlay
      ) {
        overlay.remove();
      }

    }
  );


  /* =========================
     COPY
  ========================= */

  copyButton.addEventListener(
    "click",
    async () => {

      try {

        if (
          navigator.clipboard &&
          navigator.clipboard.writeText
        ) {

          await navigator.clipboard.writeText(
            shareUrl
          );

        } else {

          input.focus();
          input.select();

          document.execCommand(
            "copy"
          );

        }


        copyButton.textContent =
          "Copied!";


        setTimeout(
          () => {

            if (
              copyButton.isConnected
            ) {

              copyButton.textContent =
                "Copy";

            }

          },
          1800
        );


      } catch {

        input.focus();
        input.select();

        copyButton.textContent =
          "Select & copy";

      }

    }
  );


  /* =========================
     SELECT LINK
  ========================= */

  input.addEventListener(
    "click",
    () => {
      input.select();
    }
  );

}

    /* =========================
       CREATE PRODUCT CARD
    ========================= */

    function createProductCard(
  material
) {

  const article =
    document.createElement(
      "article"
    );


  article.className =
    "product-card";

/* =========================
   THREE DOT MENU
========================= */

const menuButton =
  document.createElement(
    "button"
  );

menuButton.type =
  "button";

menuButton.className =
  "product-menu-btn";

menuButton.textContent =
  "⋮";

menuButton.setAttribute(
  "aria-label",
  "More options"
);


const menu =
  document.createElement(
    "div"
  );

menu.className =
  "product-menu";

menu.innerHTML = `
  <button
    type="button"
    class="product-menu-share"
  >
    Share
  </button>
`;


menuButton.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    /*
     * Close other open menus
     */
    document
      .querySelectorAll(
        ".product-menu.open"
      )
      .forEach(
        otherMenu => {

          if (
            otherMenu !== menu
          ) {

            otherMenu.classList.remove(
              "open"
            );

          }

        }
      );


    menu.classList.toggle(
      "open"
    );

  }
);


menu.addEventListener(
  "click",
  event => {

    event.stopPropagation();

  }
);


article.appendChild(
  menuButton
);

article.appendChild(
  menu
);

/* =========================
   SHARE ITEM
========================= */

const shareButton =
  menu.querySelector(
    ".product-menu-share"
  );


shareButton.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    menu.classList.remove(
      "open"
    );

    openShareBox(
      material
    );

  }
);

  /* =========================
     OPEN MATERIAL
  ========================= */

  article.addEventListener(
    "click",
    () => {

      localStorage.setItem(
        "fmarket_material",
        JSON.stringify(
          material
        )
      );

      window.location.href =
        "/fmarket-buy";

    }
  );


  article.dataset.category =
    material.category ||
    "";


      /* =========================
         IMAGE
      ========================= */

      const imageArea =
        document.createElement(
          "div"
        );


      imageArea.className =
        "product-image";


      if (
        material.image_url
      ) {

        const image =
          document.createElement(
            "img"
          );


        image.src =
          material.image_url;


        image.alt =
          material.title ||
          "Market material";


        image.loading =
          "lazy";


        imageArea.appendChild(
          image
        );


      } else {

        const placeholder =
          document.createElement(
            "div"
          );


        placeholder.className =
          "image-placeholder";


        placeholder.textContent =
          getCategoryIcon(
            material.category
          );


        imageArea.appendChild(
          placeholder
        );

      }


      const type =
        document.createElement(
          "span"
        );


      type.className =
        "product-type";


      type.textContent =
        formatCategory(
          material.category
        );


      imageArea.appendChild(
        type
      );


      /* =========================
         CONTENT
      ========================= */

      const content =
        document.createElement(
          "div"
        );


      content.className =
        "product-content";


      /* =========================
         TITLE
      ========================= */

      const title =
        document.createElement(
          "h3"
        );


      title.textContent =
        material.title ||
        "Untitled material";


      /* =========================
         DESCRIPTION
      ========================= */

      const description =
        document.createElement(
          "p"
        );


      description.className =
        "product-description";


      description.textContent =
        material.description ||
        "No description provided.";


      /* =========================
         META
      ========================= */

      const meta =
        document.createElement(
          "div"
        );


      meta.className =
        "product-meta";


      if (
        material.university
      ) {

        const university =
          document.createElement(
            "span"
          );


        university.textContent =
          `🎓 ${material.university}`;


        meta.appendChild(
          university
        );

      }


      if (
        material.course
      ) {

        const course =
          document.createElement(
            "span"
          );


        course.textContent =
          material.course;


        meta.appendChild(
          course
        );

      }


      /* =========================
         FOOTER
      ========================= */

      const footer =
        document.createElement(
          "div"
        );


      footer.className =
        "product-footer";


      const sellerArea =
        document.createElement(
          "div"
        );


      const price =
        document.createElement(
          "div"
        );


      price.className =
        "product-price";


      const fcoinPrice =
  Number(
    material.price || 0
  );

price.innerHTML = `
  <div class="price-fcoins">
    ₣${fcoinPrice.toLocaleString("en-NG")}
  </div>

  <div class="price-naira">
    ₦${Math.floor(
      fcoinPrice * 1.5
    ).toLocaleString("en-NG")}
  </div>
`;


      const seller =
        document.createElement(
          "div"
        );


      seller.className =
        "seller-name";


      seller.textContent =
        material.seller_name ||
        "Unknown seller";


      sellerArea.appendChild(
        price
      );

      sellerArea.appendChild(
        seller
      );


      /* =========================
         MESSAGE
      ========================= */

      const messageButton =
        document.createElement(
          "button"
        );


      messageButton.type =
        "button";


      messageButton.className =
        "message-btn";


      messageButton.textContent =
        "💬";


      /*
       * Store the real seller ID,
       * not just the seller name.
       */

      messageButton.dataset.seller =
        material.seller_id || "";


      messageButton.dataset.sellerName =
        material.seller_name || "";


      messageButton.addEventListener(
  "click",
  event => {

    /* =========================
       STOP CARD CLICK
    ========================= */

    event.stopPropagation();


    /* =========================
       CHECK SELLER
    ========================= */

    if (
      !material.seller_id
    ) {

      return;

    }


    /* =========================
       SAVE SELLER ID
    ========================= */

    localStorage.setItem(
      "chatting_with",
      material.seller_id
    );


    /* =========================
       OPTIONAL SELLER NAME
    ========================= */

    localStorage.setItem(
      "fmarket_chat_seller_name",
      material.seller_name || ""
    );


    /* =========================
       OPEN CHAT
    ========================= */

    window.location.href =
      "/chat";

  }
);


      footer.appendChild(
        sellerArea
      );


      footer.appendChild(
        messageButton
      );


      content.appendChild(
        title
      );

      content.appendChild(
        description
      );

      content.appendChild(
        meta
      );

      content.appendChild(
        footer
      );


      article.appendChild(
        imageArea
      );

      article.appendChild(
        content
      );


      return article;

    }


    /* =========================
       CATEGORY ICON
    ========================= */

   function getCategoryIcon(
  category
) {

  switch (
    category
  ) {

    case "notes":
      return "📝";

    case "past-questions":
    case "past_questions":
      return "📄";

    case "textbooks":
    case "textbook":
      return "📚";

    case "handouts":
    case "handout":
      return "📑";

    default:
      return "🛍️";

  }

}


    /* =========================
       CATEGORY NAME
    ========================= */

    function formatCategory(
  category
) {

  switch (
    category
  ) {

    case "past-questions":
    case "past_questions":
      return "Past Qs";

    case "textbooks":
    case "textbook":
      return "Textbook";

    case "notes":
      return "Notes";

    case "handouts":
    case "handout":
      return "Handout";

    default:
      return "Material";

  }

}


    /* =========================
       CATEGORY BUTTONS
    ========================= */

    categoryButtons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            categoryButtons.forEach(
              item => {

                item.classList.remove(
                  "active"
                );

              }
            );


            button.classList.add(
              "active"
            );


            activeCategory =
              button.dataset.category ||
              "all";


            currentPage = 1;


            loadMarket(
              1
            );

          }
        );

      }
    );


    /* =========================
       SEARCH
    ========================= */

    if (searchInput) {

      searchInput.addEventListener(
        "input",
        () => {

          renderMaterials();

        }
      );

    }


    /* =========================
       SEE ALL
    ========================= */

    if (seeAllBtn) {

      seeAllBtn.addEventListener(
        "click",
        () => {

          activeCategory =
            "all";


          currentPage = 1;


          categoryButtons.forEach(
            button => {

              button.classList.toggle(
                "active",
                button.dataset.category ===
                "all"
              );

            }
          );


          searchInput.value =
            "";


          loadMarket(
            1
          );

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
            "/fmarket-me";

        }
      );

    }


    /* =========================
       INITIAL LOAD
    ========================= */

    loadMarket(
      1
    );

// Balance eye 
balanceEye.addEventListener(
  "click",
  () => {

    balanceHidden =
      !balanceHidden;


    const currentFcoins =
      Number(
        balanceValue.dataset.value ||
        0
      );


    updateBalanceDisplay(
      currentFcoins
    );

  }
);

  }
);