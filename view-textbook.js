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

    const backErrorBtn =
      document.getElementById(
        "back-error-btn"
      );

    const loading =
      document.getElementById(
        "loading"
      );

    const errorBox =
      document.getElementById(
        "error"
      );

    const errorMessage =
      document.getElementById(
        "error-message"
      );

    const reader =
      document.getElementById(
        "reader"
      );

    const pageStage =
      document.getElementById(
        "page-stage"
      );

    const pageContainer =
      document.getElementById(
        "page-container"
      );

    const canvas =
      document.getElementById(
        "pdf-canvas"
      );

    const pageControls =
      document.getElementById(
        "page-controls"
      );

    const toolbar =
      document.getElementById(
        "toolbar"
      );

    const aiActions =
      document.getElementById(
        "ai-actions"
      );

    const prevBtn =
      document.getElementById(
        "prev-btn"
      );

    const nextBtn =
      document.getElementById(
        "next-btn"
      );

    const pageNumber =
      document.getElementById(
        "page-number"
      );

    const pageCount =
      document.getElementById(
        "page-count"
      );

    const bookTitle =
      document.getElementById(
        "book-title"
      );

    const bookCourse =
      document.getElementById(
        "book-course"
      );

    const swipeHint =
      document.getElementById(
        "swipe-hint"
      );

    const toast =
      document.getElementById(
        "toast"
      );


    /* =========================
       SEARCH
    ========================= */

    const searchPanel =
      document.getElementById(
        "search-panel"
      );

    const searchInput =
      document.getElementById(
        "search-input"
      );

    const searchResults =
      document.getElementById(
        "search-results"
      );

    const closeSearchBtn =
      document.getElementById(
        "close-search-btn"
      );


    /* =========================
       MENU
    ========================= */

    const menuBtn =
      document.getElementById(
        "menu-btn"
      );

    const menuOverlay =
      document.getElementById(
        "menu-overlay"
      );

    const closeMenuBtn =
      document.getElementById(
        "close-menu-btn"
      );

    const menuSearch =
      document.getElementById(
        "menu-search"
      );

    const menuBookmark =
      document.getElementById(
        "menu-bookmark"
      );

    const menuFullscreen =
      document.getElementById(
        "menu-fullscreen"
      );

    const menuToc =
      document.getElementById(
        "menu-toc"
      );


    /* =========================
       AI
    ========================= */

    const askFaiBtn =
      document.getElementById(
        "ask-fai-btn"
      );

    const summarizeBtn =
      document.getElementById(
        "summarize-btn"
      );

    const quizBtn =
      document.getElementById(
        "quiz-btn"
      );

    const faiOverlay =
      document.getElementById(
        "fai-overlay"
      );

    const faiContent =
      document.getElementById(
        "fai-content"
      );

    const faiInput =
      document.getElementById(
        "fai-input"
      );

    const sendFaiBtn =
      document.getElementById(
        "send-fai-btn"
      );

    const closeFaiBtn =
      document.getElementById(
        "close-fai-btn"
      );


    /* =========================
       ZOOM
    ========================= */

    const zoomOutBtn =
      document.getElementById(
        "zoom-out-btn"
      );

    const zoomResetBtn =
      document.getElementById(
        "zoom-reset-btn"
      );

    const zoomInBtn =
      document.getElementById(
        "zoom-in-btn"
      );

    const bookmarkBtn =
      document.getElementById(
        "bookmark-btn"
      );


    /* =========================
       PDF.JS
    ========================= */

    if (
      typeof pdfjsLib ===
      "undefined"
    ) {

      showError(
        "The PDF reader could not be loaded."
      );

      return;

    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


    /* =========================
       GET TEXTBOOK
    ========================= */

    let textbook = null;

    try {

      textbook =
        JSON.parse(
          localStorage.getItem(
            "viewing_textbook"
          )
        );

    } catch {

      textbook = null;

    }


    if (
      !textbook
    ) {

      showError(
        "No textbook was selected."
      );

      return;

    }


    if (
      !textbook.file_url
    ) {

      showError(
        "This textbook has no digital file attached."
      );

      return;

    }


    /* =========================
       STATE
    ========================= */

    let pdf = null;

    let currentPage = 1;

    let totalPages = 0;

    let scale = 1;

    let baseScale = 1;

    let rendering = false;

    let pendingPage = null;

    let pageTextCache =
      new Map();

    let bookmarkedPages =
      new Set();


    /* =========================
       LOCAL STORAGE KEY
    ========================= */

    const textbookId =
      String(
        textbook.id ||
        textbook.file_url
      );

    const progressKey =
      `fmarket_textbook_progress_${textbookId}`;

    const bookmarkKey =
      `fmarket_textbook_bookmarks_${textbookId}`;


    /* =========================
       ACCOUNT
    ========================= */

    let account = {};

    try {

      account =
        JSON.parse(
          localStorage.getItem(
            "faccount"
          )
        ) || {};

    } catch {

      account = {};

    }


    /* =========================
       TITLE
    ========================= */

    bookTitle.textContent =
      textbook.title ||
      "Textbook";

    bookCourse.textContent =
      [
        textbook.course,
        textbook.university
      ]
        .filter(Boolean)
        .join(" • ") ||
      "Digital textbook";


    /* =========================
       TOAST
    ========================= */

    function showToast(
      message
    ) {

      toast.textContent =
        message;

      toast.classList.remove(
        "hidden"
      );

      clearTimeout(
        showToast.timer
      );

      showToast.timer =
        setTimeout(
          () => {

            toast.classList.add(
              "hidden"
            );

          },
          1800
        );

    }


    /* =========================
       ERROR
    ========================= */

    function showError(
      message
    ) {

      loading.classList.add(
        "hidden"
      );

      pageStage.classList.add(
        "hidden"
      );

      pageControls.classList.add(
        "hidden"
      );

      toolbar.classList.add(
        "hidden"
      );

      aiActions.classList.add(
        "hidden"
      );

      errorMessage.textContent =
        message;

      errorBox.classList.remove(
        "hidden"
      );

    }


    /* =========================
       LOAD PROGRESS
    ========================= */

    function loadProgress() {

      try {

        const saved =
          Number(
            localStorage.getItem(
              progressKey
            )
          );

        if (
          saved >= 1 &&
          saved <= totalPages
        ) {

          currentPage =
            saved;

        }

      } catch {

        currentPage = 1;

      }

    }


    /* =========================
       SAVE PROGRESS
    ========================= */

    function saveProgress() {

      try {

        localStorage.setItem(
          progressKey,
          String(
            currentPage
          )
        );

      } catch {}

    }


    /* =========================
       LOAD BOOKMARKS
    ========================= */

    function loadBookmarks() {

      try {

        const saved =
          JSON.parse(
            localStorage.getItem(
              bookmarkKey
            )
          ) || [];

        if (
          Array.isArray(saved)
        ) {

          bookmarkedPages =
            new Set(
              saved.map(
                Number
              )
            );

        }

      } catch {

        bookmarkedPages =
          new Set();

      }

    }


    /* =========================
       SAVE BOOKMARKS
    ========================= */

    function saveBookmarks() {

      try {

        localStorage.setItem(
          bookmarkKey,
          JSON.stringify(
            [
              ...bookmarkedPages
            ]
          )
        );

      } catch {}

    }


    /* =========================
       BOOKMARK
    ========================= */

    function toggleBookmark() {

      if (
        bookmarkedPages.has(
          currentPage
        )
      ) {

        bookmarkedPages.delete(
          currentPage
        );

        showToast(
          "Bookmark removed"
        );

      } else {

        bookmarkedPages.add(
          currentPage
        );

        showToast(
          "Page bookmarked"
        );

      }

      saveBookmarks();

      updateBookmarkUI();

    }


    function updateBookmarkUI() {

      const active =
        bookmarkedPages.has(
          currentPage
        );

      bookmarkBtn.textContent =
        active
          ? "🔖"
          : "🔖";

      bookmarkBtn.classList.toggle(
        "active",
        active
      );

    }


    /* =========================
       RENDER PAGE
    ========================= */

    async function renderPage(
      pageNumberToRender
    ) {

      if (
        !pdf
      ) {

        return;

      }


      if (
        pageNumberToRender < 1
      ) {

        pageNumberToRender =
          1;

      }


      if (
        pageNumberToRender >
        totalPages
      ) {

        pageNumberToRender =
          totalPages;

      }


      if (
        rendering
      ) {

        pendingPage =
          pageNumberToRender;

        return;

      }


      rendering = true;


      try {

        const page =
          await pdf.getPage(
            pageNumberToRender
          );


        const viewport =
          page.getViewport({
            scale: 1
          });


        /*
          Fit the page into the
          available reader area.
        */

        const readerWidth =
          reader.clientWidth;

        const readerHeight =
          reader.clientHeight;


        const widthScale =
          (
            readerWidth - 20
          ) /
          viewport.width;


        const heightScale =
          (
            readerHeight - 20
          ) /
          viewport.height;


        if (
  !baseScale ||
  baseScale <= 0
) {

  baseScale =
    Math.min(
      widthScale,
      heightScale
    );

}


        if (
          !Number.isFinite(
            baseScale
          ) ||
          baseScale <= 0
        ) {

          baseScale =
            1;

        }


        const finalScale =
          baseScale *
          scale;


        const finalViewport =
          page.getViewport({
            scale:
              finalScale
          });


        canvas.width =
          Math.floor(
            finalViewport.width
          );

        canvas.height =
          Math.floor(
            finalViewport.height
          );


        canvas.style.width =
          `${finalViewport.width}px`;

        canvas.style.height =
          `${finalViewport.height}px`;


        const context =
          canvas.getContext(
            "2d"
          );


        await page.render({
          canvasContext:
            context,

          viewport:
            finalViewport
        }).promise;


        pageContainer.style.transform =
          "scale(1)";


        currentPage =
          pageNumberToRender;


        pageNumber.textContent =
          currentPage;

        pageCount.textContent =
          totalPages;


        updateNavigation();

        updateBookmarkUI();

        saveProgress();


        /*
          Save text for AI/search.
        */

        if (
          !pageTextCache.has(
            currentPage
          )
        ) {

          try {

            const textContent =
              await page.getTextContent();

            const text =
              textContent.items
                .map(
                  item =>
                    item.str || ""
                )
                .join(" ");

            pageTextCache.set(
              currentPage,
              text
            );

          } catch {

            pageTextCache.set(
              currentPage,
              ""
            );

          }

        }

      } catch (error) {

        showError(
          "Unable to render this textbook page."
        );

      } finally {

        rendering =
          false;


        if (
          pendingPage !== null
        ) {

          const nextPage =
            pendingPage;

          pendingPage =
            null;

          renderPage(
            nextPage
          );

        }

      }

    }


    /* =========================
       NAVIGATION
    ========================= */

    function goToPage(
      page
    ) {

      if (
        page < 1 ||
        page > totalPages
      ) {

        return;

      }

      renderPage(
        page
      );

    }


    function nextPage() {

      if (
        currentPage <
        totalPages
      ) {

        goToPage(
          currentPage + 1
        );

      } else {

        showToast(
          "You're on the last page"
        );

      }

    }


    function previousPage() {

      if (
        currentPage >
        1
      ) {

        goToPage(
          currentPage - 1
        );

      } else {

        showToast(
          "You're on the first page"
        );

      }

    }


    function updateNavigation() {

      prevBtn.disabled =
        currentPage <= 1;

      nextBtn.disabled =
        currentPage >=
        totalPages;

    }


/* =========================
   PINCH ZOOM + PAN
========================= */

const pointers =
  new Map();

let pinchStartDistance =
  0;

let pinchStartScale =
  1;

let pinchCenterX =
  0;

let pinchCenterY =
  0;


/*
  The page is allowed to move
  naturally when zoomed.
*/

pageStage.style.touchAction =
  "none";


function getDistance(
  first,
  second
) {

  const dx =
    second.clientX -
    first.clientX;

  const dy =
    second.clientY -
    first.clientY;

  return Math.sqrt(
    dx * dx +
    dy * dy
  );

}


function getCenter(
  first,
  second
) {

  return {

    x:
      (
        first.clientX +
        second.clientX
      ) / 2,

    y:
      (
        first.clientY +
        second.clientY
      ) / 2

  };

}


/* =========================
   POINTER DOWN
========================= */

pageStage.addEventListener(
  "pointerdown",
  event => {

    pointers.set(
      event.pointerId,
      event
    );


    try {

      pageStage.setPointerCapture(
        event.pointerId
      );

    } catch {}


    if (
      pointers.size === 2
    ) {

      const [
        first,
        second
      ] =
        [...pointers.values()];


      pinchStartDistance =
        getDistance(
          first,
          second
        );


      pinchStartScale =
        scale;


      const center =
        getCenter(
          first,
          second
        );


      pinchCenterX =
        center.x;

      pinchCenterY =
        center.y;

    }

  }
);


/* =========================
   POINTER MOVE
========================= */

pageStage.addEventListener(
  "pointermove",
  event => {

    if (
      !pointers.has(
        event.pointerId
      )
    ) {

      return;

    }


    pointers.set(
      event.pointerId,
      event
    );


    if (
      pointers.size < 2
    ) {

      return;

    }


    const [
      first,
      second
    ] =
      [...pointers.values()];


    const currentDistance =
      getDistance(
        first,
        second
      );


    if (
      pinchStartDistance <= 0
    ) {

      return;

    }


    const ratio =
      currentDistance /
      pinchStartDistance;


    let newScale =
      pinchStartScale *
      ratio;


    newScale =
      Math.max(
        0.6,
        Math.min(
          newScale,
          3
        )
      );


    scale =
      newScale;


    updateZoomLabel();


    /*
      Re-render the current page
      using the new zoom level.
    */

    renderPage(
      currentPage
    );

  }
);


/* =========================
   POINTER UP
========================= */

function removePointer(
  event
) {

  pointers.delete(
    event.pointerId
  );


  if (
    pointers.size < 2
  ) {

    pinchStartDistance =
      0;

  }

}


pageStage.addEventListener(
  "pointerup",
  removePointer
);


pageStage.addEventListener(
  "pointercancel",
  removePointer
);


pageStage.addEventListener(
  "pointerleave",
  event => {

    if (
      event.pointerType ===
      "mouse"
    ) {

      removePointer(
        event
      );

    }

  }
);


    /* =========================
       KEYBOARD
    ========================= */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "ArrowLeft"
        ) {

          previousPage();

        }

        if (
          event.key ===
          "ArrowRight"
        ) {

          nextPage();

        }

      }
    );


    /* =========================
       ZOOM
    ========================= */

    function updateZoomLabel() {

      zoomResetBtn.textContent =
        `${Math.round(
          scale * 100
        )}%`;

    }


    zoomInBtn.addEventListener(
      "click",
      () => {

        scale =
          Math.min(
            scale + 0.1,
            2.5
          );

        updateZoomLabel();

        renderPage(
          currentPage
        );

      }
    );


    zoomOutBtn.addEventListener(
      "click",
      () => {

        scale =
          Math.max(
            scale - 0.1,
            0.6
          );

        updateZoomLabel();

        renderPage(
          currentPage
        );

      }
    );


    zoomResetBtn.addEventListener(
      "click",
      () => {

        scale =
          1;

        updateZoomLabel();

        renderPage(
          currentPage
        );

      }
    );


    /* =========================
       SEARCH PANEL
    ========================= */

    function openSearch() {

      menuOverlay.classList.add(
        "hidden"
      );

      searchPanel.classList.remove(
        "hidden"
      );

      searchInput.focus();

    }


    function closeSearch() {

      searchPanel.classList.add(
        "hidden"
      );

      searchInput.value =
        "";

      searchResults.innerHTML =
        "";

    }


    closeSearchBtn.addEventListener(
      "click",
      closeSearch
    );


    /*
      Search through loaded PDF
      pages. Pages are loaded lazily.
      Searching all pages loads text
      progressively.
    */

    let searchTimer = null;


    searchInput.addEventListener(
      "input",
      () => {

        clearTimeout(
          searchTimer
        );

        searchTimer =
          setTimeout(
            () => {

              searchText(
                searchInput.value.trim()
              );

            },
            300
          );

      }
    );


    async function searchText(
      query
    ) {

      searchResults.innerHTML =
        "";


      if (
        !query
      ) {

        return;

      }


      const lowerQuery =
        query.toLowerCase();


      const results = [];


      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {

        try {

          let text =
            pageTextCache.get(i);


          if (
            text === undefined
          ) {

            const page =
              await pdf.getPage(i);

            const content =
              await page.getTextContent();

            text =
              content.items
                .map(
                  item =>
                    item.str || ""
                )
                .join(" ");

            pageTextCache.set(
              i,
              text
            );

          }


          if (
            text
              .toLowerCase()
              .includes(
                lowerQuery
              )
          ) {

            results.push(i);

          }


          if (
            results.length >= 30
          ) {

            break;

          }

        } catch {}

      }


      if (
        results.length === 0
      ) {

        searchResults.innerHTML =
          `
            <div class="search-result">
              <span>No results found.</span>
            </div>
          `;

        return;

      }


      results.forEach(
        page => {

          const item =
            document.createElement(
              "div"
            );

          item.className =
            "search-result";

          item.innerHTML =
            `
              <strong>
                Page ${page}
              </strong>

              <span>
                Found "${escapeHtml(
                  query
                )}"
              </span>
            `;


          item.addEventListener(
            "click",
            () => {

              closeSearch();

              goToPage(
                page
              );

            }
          );


          searchResults.appendChild(
            item
          );

        }
      );

    }


    /* =========================
       ESCAPE HTML
    ========================= */

    function escapeHtml(
      text
    ) {

      return String(
        text
      )
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /'/g,
          "&#039;"
        );

    }


    /* =========================
       MENU
    ========================= */

    function openMenu() {

      menuOverlay.classList.remove(
        "hidden"
      );

    }


    function closeMenu() {

      menuOverlay.classList.add(
        "hidden"
      );

    }


    menuBtn.addEventListener(
      "click",
      openMenu
    );


    closeMenuBtn.addEventListener(
      "click",
      closeMenu
    );


    menuOverlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          menuOverlay
        ) {

          closeMenu();

        }

      }
    );


    menuSearch.addEventListener(
      "click",
      openSearch
    );


    menuBookmark.addEventListener(
      "click",
      () => {

        closeMenu();

        toggleBookmark();

      }
    );


    /* =========================
       FULLSCREEN
    ========================= */

    async function toggleFullscreen() {

      try {

        if (
          !document.fullscreenElement
        ) {

          await document.documentElement
            .requestFullscreen();

        } else {

          await document.exitFullscreen();

        }

      } catch {

        showToast(
          "Fullscreen is unavailable."
        );

      }

    }


    menuFullscreen.addEventListener(
      "click",
      () => {

        closeMenu();

        toggleFullscreen();

      }
    );


    /* =========================
       TABLE OF CONTENTS
    ========================= */

    menuToc.addEventListener(
      "click",
      () => {

        closeMenu();

        showToast(
          "Table of contents coming next."
        );

      }
    );


    /* =========================
       BOOKMARK
    ========================= */

    bookmarkBtn.addEventListener(
      "click",
      toggleBookmark
    );


    /* =========================
       AI PANEL
    ========================= */

    function openFai(
      initialPrompt = ""
    ) {

      faiOverlay.classList.remove(
        "hidden"
      );

      if (
        initialPrompt
      ) {

        faiInput.value =
          initialPrompt;

      }

      setTimeout(
        () => {

          faiInput.focus();

        },
        100
      );

    }


    function closeFai() {

      faiOverlay.classList.add(
        "hidden"
      );

    }


    closeFaiBtn.addEventListener(
      "click",
      closeFai
    );


    faiOverlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          faiOverlay
        ) {

          closeFai();

        }

      }
    );


    askFaiBtn.addEventListener(
      "click",
      () => {

        openFai();

      }
    );


    /* =========================
       GET CURRENT PAGE TEXT
    ========================= */

    async function getCurrentPageText() {

      if (
        pageTextCache.has(
          currentPage
        )
      ) {

        return pageTextCache.get(
          currentPage
        );

      }


      try {

        const page =
          await pdf.getPage(
            currentPage
          );

        const content =
          await page.getTextContent();

        const text =
          content.items
            .map(
              item =>
                item.str || ""
            )
            .join(" ");

        pageTextCache.set(
          currentPage,
          text
        );

        return text;

      } catch {

        return "";

      }

    }


    /* =========================
       FAI API
    ========================= */

    /*
      IMPORTANT:

      Replace this with the same
      FAI endpoint/request format
      used by your existing FAI.

      I am leaving the rest of the
      textbook reader independent
      from your FAI implementation.
    */

    const FAI_API_URL =
      "https://fweb-backend.onrender.com/fai";


    /* =========================
       SEND TO FAI
    ========================= */

    async function sendToFAI(
      prompt
    ) {

      if (
        !prompt
      ) {

        return;

      }


      const pageText =
        await getCurrentPageText();


      addFaiMessage(
        prompt,
        "user"
      );


      addFaiMessage(
        "FAI is thinking...",
        "ai",
        "fai-thinking"
      );


      try {

        const response =
          await fetch(
            FAI_API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify({

                  userId:
                    account.id ||
                    null,

                  message:
                    prompt,

                  context: {
                    type:
                      "digital_textbook",

                    textbookId:
                      textbook.id ||
                      null,

                    title:
                      textbook.title ||
                      "",

                    course:
                      textbook.course ||
                      "",

                    page:
                      currentPage,

                    pageText:
                      pageText

                  }

                })

            }
          );


        const data =
          await response.json();


        const thinking =
          document.getElementById(
            "fai-thinking"
          );

        if (
          thinking
        ) {

          thinking.remove();

        }


        if (
          !response.ok ||
          !data.success
        ) {

          throw new Error(
            data.error ||
            "FAI could not answer."
          );

        }


        const answer =
          data.answer ||
          data.response ||
          data.message ||
          "FAI returned no answer.";


        addFaiMessage(
          answer,
          "ai"
        );

      } catch (error) {

        const thinking =
          document.getElementById(
            "fai-thinking"
          );

        if (
          thinking
        ) {

          thinking.remove();

        }


        addFaiMessage(
          error.message ||
          "Unable to reach FAI.",
          "ai"
        );

      }

    }


    /* =========================
       FAI MESSAGE
    ========================= */

    function addFaiMessage(
      message,
      type,
      id = ""
    ) {

      const div =
        document.createElement(
          "div"
        );

      div.className =
        `fai-message ${
          type === "user"
            ? "fai-user"
            : "fai-ai"
        }`;


      if (
        id
      ) {

        div.id =
          id;

      }


      div.textContent =
        message;


      faiContent.appendChild(
        div
      );


      faiContent.scrollTop =
        faiContent.scrollHeight;

    }


    /* =========================
       SEND BUTTON
    ========================= */

    sendFaiBtn.addEventListener(
      "click",
      () => {

        const prompt =
          faiInput.value.trim();

        if (
          !prompt
        ) {

          return;

        }


        faiInput.value =
          "";

        sendToFAI(
          prompt
        );

      }
    );


    /* =========================
       ENTER TO SEND
    ========================= */

    faiInput.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          sendFaiBtn.click();

        }

      }
    );


    /* =========================
       SUMMARIZE
    ========================= */

    summarizeBtn.addEventListener(
      "click",
      async () => {

        openFai(
          `Summarize the textbook content on page ${currentPage} in simple student-friendly language. Highlight the most important points I should remember.`
        );

        const pageText =
          await getCurrentPageText();


        if (
          pageText
        ) {

          sendFaiButtonWithContext(
            `Summarize this textbook page in simple student-friendly language. Give me the key points and important things to remember.\n\nPage ${currentPage}:\n${pageText}`
          );

        }

      }
    );


    /* =========================
       QUIZ ME
    ========================= */

    quizBtn.addEventListener(
      "click",
      async () => {

        openFai(
          `Quiz me on page ${currentPage}.`
        );


        const pageText =
          await getCurrentPageText();


        if (
          pageText
        ) {

          sendFaiButtonWithContext(
            `Quiz me on the content of this textbook page. Ask me one question at a time and wait for my answer before giving me the next question. Start with question 1.\n\nPage ${currentPage}:\n${pageText}`
          );

        }

      }
    );


    /* =========================
       AI ACTION HELPER
    ========================= */

    function sendFaiButtonWithContext(
      prompt
    ) {

      faiContent.innerHTML =
        "";


      addFaiMessage(
        prompt,
        "user"
      );


      sendToFAI(
        prompt
      );

    }


    /* =========================
       BACK
    ========================= */

    backBtn.addEventListener(
      "click",
      () => {

        window.location.href =
          "/fmarket-buy";

      }
    );


    backErrorBtn.addEventListener(
      "click",
      () => {

        window.location.href =
          "/fmarket";

      }
    );


    /* =========================
       LOAD PDF
    ========================= */

    async function loadTextbook() {

      try {

        const loadingTask =
          pdfjsLib.getDocument({
            url:
              textbook.file_url
          });


        pdf =
          await loadingTask.promise;


        totalPages =
          pdf.numPages;


        pageCount.textContent =
          totalPages;


        loadProgress();

        loadBookmarks();


        loading.classList.add(
          "hidden"
        );

        errorBox.classList.add(
          "hidden"
        );

        pageStage.classList.remove(
          "hidden"
        );

        pageControls.classList.remove(
          "hidden"
        );

        toolbar.classList.remove(
          "hidden"
        );

        aiActions.classList.remove(
          "hidden"
        );


        await renderPage(
          currentPage
        );


        /*
          Hide swipe hint after
          a short period.
        */

        setTimeout(
          () => {

            swipeHint.style.opacity =
              "0";

          },
          3000
        );

      } catch (error) {

        showError(
          "This textbook could not be opened. The digital file may be unavailable."
        );

      }

    }


    /* =========================
       BUTTONS
    ========================= */

    prevBtn.addEventListener(
      "click",
      previousPage
    );

    nextBtn.addEventListener(
      "click",
      nextPage
    );


    /* =========================
       RESIZE
    ========================= */

    let resizeTimer = null;


    window.addEventListener(
      "resize",
      () => {

        clearTimeout(
          resizeTimer
        );

        resizeTimer =
          setTimeout(
            () => {

              if (
  pdf
) {

  baseScale =
    0;

  renderPage(
    currentPage
  );

}

            },
            250
          );

      }
    );


    /* =========================
       START
    ========================= */

    loadTextbook();

  }
);