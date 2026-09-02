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

    const categoryButtons =
      document.querySelectorAll(
        ".category-card"
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


        balanceValue.textContent =
          fcoins.toLocaleString();


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


      price.textContent =
        `₣${Number(
          material.price || 0
        ).toLocaleString()}`;


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
          return "📄";

        case "textbooks":
          return "📚";

        case "handouts":
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
          return "Past Qs";

        case "textbooks":
          return "Textbook";

        case "notes":
          return "Notes";

        case "handouts":
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

  }
);