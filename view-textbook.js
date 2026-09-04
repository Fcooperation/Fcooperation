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
      
      /* =========================
   READER ENGINES
========================= */

const pdfReader =
  document.getElementById(
    "pdf-reader"
  );

const epubReader =
  document.getElementById(
    "epub-reader"
  );

const docxReader =
  document.getElementById(
    "docx-reader"
  );

const epubContainer =
  document.getElementById(
    "epub-container"
  );

const docxContainer =
  document.getElementById(
    "docx-container"
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
   FAI CONVERSATION
========================= */

let faiMessages = [];

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
   DETECT TEXTBOOK TYPE
========================= */

function getTextbookType() {

  const fileType =
    String(
      textbook.file_type ||
      textbook.mime_type ||
      ""
    ).toLowerCase();


  const fileUrl =
    String(
      textbook.file_url ||
      ""
    ).toLowerCase();


  const fileName =
    String(
      textbook.file_name ||
      textbook.filename ||
      textbook.original_name ||
      ""
    ).toLowerCase();


  if (
    fileType ===
      "application/pdf" ||
    fileUrl.endsWith(".pdf") ||
    fileName.endsWith(".pdf")
  ) {

    return "pdf";

  }


  if (
    fileType ===
      "application/epub+zip" ||
    fileUrl.endsWith(".epub") ||
    fileName.endsWith(".epub")
  ) {

    return "epub";

  }


  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileUrl.endsWith(".docx") ||
    fileName.endsWith(".docx")
  ) {

    return "docx";

  }


  return "unknown";

}


    /* =========================
       STATE
    ========================= */

    let pdf = null;

let epubBook = null;

let epubRendition = null;

let readerType = null;

    let currentPage = 1;

    let totalPages = 0;

    let scale = 1;

    let baseScale = 0;

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
  readerType !== "pdf" ||
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
    readerWidth - 40
  ) /
  viewport.width;

const heightScale =
  (
    readerHeight - 40
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


  if (
    readerType ===
    "pdf"
  ) {

    renderPage(
      page
    );

    return;

  }


  if (
    readerType ===
    "epub"
  ) {

    goToEPUBPage(
      page
    );

    return;

  }


  if (
    readerType ===
    "docx"
  ) {

    goToDOCXPage(
      page
    );

    return;

  }

}

/* =========================
   EPUB NAVIGATION
========================= */

async function goToEPUBPage(
  page
) {

  if (
    !epubBook ||
    !epubRendition
  ) {

    return;

  }


  const target =
    Math.max(
      1,
      Math.min(
        page,
        totalPages
      )
    );


  const section =
    epubBook.spine.get(
      target - 1
    );


  if (
    !section
  ) {

    return;

  }


  await epubRendition.display(
    section.href
  );


  currentPage =
    target;


  pageNumber.textContent =
    currentPage;


  saveProgress();

  updateNavigation();

}

/* =========================
   DOCX NAVIGATION
========================= */

function goToDOCXPage(
  page
) {

  if (
    !docxContainer
  ) {

    return;

  }


  const pages =
    docxContainer.querySelectorAll(
      ".docx"
    );


  if (
    !pages.length
  ) {

    return;

  }


  const target =
    Math.max(
      1,
      Math.min(
        page,
        pages.length
      )
    );


  const targetPage =
    pages[
      target - 1
    ];


  if (
    !targetPage
  ) {

    return;

  }


  targetPage.scrollIntoView({
    behavior:
      "smooth",
    block:
      "start"
  });


  currentPage =
    target;


  pageNumber.textContent =
    currentPage;


  totalPages =
    pages.length;


  pageCount.textContent =
    totalPages;


  saveProgress();

  updateNavigation();

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

let pinchStartScrollLeft =
  0;

let pinchStartScrollTop =
  0;

let pinchStartCenterX =
  0;

let pinchStartCenterY =
  0;

let pinchStartCanvasWidth =
  0;

let pinchStartCanvasHeight =
  0;

let panActive =
  false;

let panLastX =
  0;

let panLastY =
  0;


/* =========================
   POINTER HELPERS
========================= */

function getPointerArray() {

  return [
    ...pointers.values()
  ];

}


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
   LIMIT ZOOM
========================= */

function clampScale(
  value
) {

  return Math.max(
    1,
    Math.min(
      value,
      3
    )
  );

}


/* =========================
   APPLY PINCH ZOOM
========================= */

function applyPinchZoom(
  newScale
) {

  if (
    !canvas.width ||
    !canvas.height
  ) {

    return;

  }


  /*
    The page was originally rendered
    at pinchStartScale.

    Calculate the new dimensions
    directly instead of using CSS
    transform.

    This keeps the scroll area in
    sync with what the user sees.
  */

  const ratio =
    newScale /
    pinchStartScale;


  const newWidth =
    pinchStartCanvasWidth *
    ratio;

  const newHeight =
    pinchStartCanvasHeight *
    ratio;


  canvas.style.width =
    `${newWidth}px`;

  canvas.style.height =
    `${newHeight}px`;


  /*
    Keep the point between the
    fingers stationary.

    Convert the finger center into
    coordinates inside the scroll
    area.
  */

  const newScrollLeft =
    (
      pinchStartScrollLeft +
      pinchStartCenterX
    ) *
      ratio -
    pinchStartCenterX;


  const newScrollTop =
    (
      pinchStartScrollTop +
      pinchStartCenterY
    ) *
      ratio -
    pinchStartCenterY;


  pageStage.scrollLeft =
    Math.max(
      0,
      newScrollLeft
    );

  pageStage.scrollTop =
    Math.max(
      0,
      newScrollTop
    );

}


/* =========================
   POINTER DOWN
========================= */

pageStage.addEventListener(
  "pointerdown",
  event => {

    if (
      event.pointerType ===
      "mouse" &&
      event.button !== 0
    ) {

      return;

    }


    pointers.set(
      event.pointerId,
      {
        clientX:
          event.clientX,

        clientY:
          event.clientY
      }
    );


    try {

      pageStage.setPointerCapture(
        event.pointerId
      );

    } catch {}


    /*
      ========================
      TWO FINGERS
      ========================
    */

    if (
      pointers.size === 2
    ) {

      panActive =
        false;


      const [
        first,
        second
      ] =
        getPointerArray();


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


      const stageRect =
        pageStage.getBoundingClientRect();


      /*
        Finger center relative
        to the visible reader.
      */

      pinchStartCenterX =
        center.x -
        stageRect.left;

      pinchStartCenterY =
        center.y -
        stageRect.top;


      pinchStartScrollLeft =
        pageStage.scrollLeft;

      pinchStartScrollTop =
        pageStage.scrollTop;


      pinchStartCanvasWidth =
        canvas.getBoundingClientRect()
          .width;

      pinchStartCanvasHeight =
        canvas.getBoundingClientRect()
          .height;

    }


    /*
      ========================
      ONE FINGER
      ========================
    */

    else if (
      pointers.size === 1 &&
      scale > 1
    ) {

      panActive =
        true;


      panLastX =
        event.clientX;

      panLastY =
        event.clientY;

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
      {
        clientX:
          event.clientX,

        clientY:
          event.clientY
      }
    );


    /*
      ========================
      PINCH ZOOM
      ========================
    */

    if (
      pointers.size === 2
    ) {

      const [
        first,
        second
      ] =
        getPointerArray();


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


      const newScale =
        clampScale(
          pinchStartScale *
          ratio
        );


      scale =
        newScale;


      updateZoomLabel();


      applyPinchZoom(
        newScale
      );


      return;

    }


    /*
      ========================
      ONE-FINGER PAN
      ========================
    */

    if (
      pointers.size === 1 &&
      panActive &&
      scale > 1
    ) {

      const dx =
        event.clientX -
        panLastX;

      const dy =
        event.clientY -
        panLastY;


      pageStage.scrollLeft -=
        dx;

      pageStage.scrollTop -=
        dy;


      panLastX =
        event.clientX;

      panLastY =
        event.clientY;

    }

  }
);


/* =========================
   FINISH PINCH
========================= */

async function finishPinch() {

  if (
    pinchStartDistance <= 0
  ) {

    return;

  }


  const finalScale =
    scale;


  /*
    Save the current scroll
    position before PDF.js
    re-renders the page.
  */

  const finalScrollLeft =
    pageStage.scrollLeft;

  const finalScrollTop =
    pageStage.scrollTop;


  /*
    PDF.js now renders the page
    at the actual final zoom.
  */

  await renderPage(
    currentPage
  );


  /*
    Restore approximately the
    same visible area.

    Because the actual canvas now
    has the correct dimensions,
    there is no temporary transform
    jump.
  */

  if (
    finalScale > 1
  ) {

    requestAnimationFrame(
      () => {

        const ratio =
          finalScale /
          pinchStartScale;


        pageStage.scrollLeft =
          Math.max(
            0,
            finalScrollLeft
          );

        pageStage.scrollTop =
          Math.max(
            0,
            finalScrollTop
          );

      }
    );

  }


  pinchStartDistance =
    0;

}


/* =========================
   POINTER UP / CANCEL
========================= */

function finishPointer(
  event
) {

  pointers.delete(
    event.pointerId
  );


  /*
    Finish the pinch when
    one of the two fingers
    is released.
  */

  if (
    pointers.size < 2 &&
    pinchStartDistance > 0
  ) {

    finishPinch();

  }


  if (
    pointers.size === 0
  ) {

    panActive =
      false;

    pinchStartDistance =
      0;

  }


  try {

    if (
      pageStage.hasPointerCapture(
        event.pointerId
      )
    ) {

      pageStage.releasePointerCapture(
        event.pointerId
      );

    }

  } catch {}

}


pageStage.addEventListener(
  "pointerup",
  finishPointer
);


pageStage.addEventListener(
  "pointercancel",
  finishPointer
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
    3
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
    1
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

  /* =========================
     PDF
  ========================= */

  if (
    readerType ===
    "pdf"
  ) {

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
     EPUB
  ========================= */

  if (
    readerType ===
    "epub"
  ) {

    try {

      const contents =
        epubRendition
          ?.getContents?.();


      if (
        !contents ||
        !contents.length
      ) {

        return "";

      }


      const textParts = [];


      contents.forEach(
        content => {

          const body =
            content.document
              ?.body;


          if (
            body
          ) {

            textParts.push(
              body.innerText ||
              body.textContent ||
              ""
            );

          }

        }
      );


      return textParts
        .join("\n")
        .trim();

    } catch {

      return "";

    }

  }


  /* =========================
     DOCX
  ========================= */

  if (
    readerType ===
    "docx"
  ) {

    try {

      const pages =
        docxContainer.querySelectorAll(
          ".docx"
        );


      const page =
        pages[
          currentPage - 1
        ];


      if (
        !page
      ) {

        return "";

      }


      return (
        page.innerText ||
        page.textContent ||
        ""
      ).trim();

    } catch {

      return "";

    }

  }


  return "";

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
      "https://fweb-backend.onrender.com/fai2";


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
    "fai-thinking",
    false
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

              messages:
                faiMessages.slice(
                  -7
                ),

              context: {

  type:
    "digital_textbook",

  textbookId:
    textbook.id || null,

  title:
    textbook.title || "",

  course:
    textbook.course || "",

  page:
    currentPage,

  pageText:
    pageText,

  fileType:
    readerType

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
  id = "",
  saveToHistory = true
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

  if (id) {

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


  /*
    Save only real messages.
    Do not save the temporary
    "FAI is thinking..." message.
  */

  if (
    saveToHistory &&
    !id
  ) {

    faiMessages.push({

      role:
        type === "user"
          ? "user"
          : "assistant",

      content:
        String(message)

    });


    /*
      Keep only the latest 7
      messages.
    */

    if (
      faiMessages.length > 7
    ) {

      faiMessages =
        faiMessages.slice(
          -7
        );

    }

  }

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

    openFai();

    const pageText =
      await getCurrentPageText();

    if (
      pageText
    ) {

      sendFaiButtonWithContext(
        `Summarize this textbook page in simple student-friendly language. Give me the key points and important things to remember.

Page ${currentPage}:
${pageText}`
      );

    } else {

      sendToFAI(
        `Summarize the textbook content on page ${currentPage} in simple student-friendly language. Highlight the most important points I should remember.`
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

    openFai();

    const pageText =
      await getCurrentPageText();

    if (
      pageText
    ) {

      sendFaiButtonWithContext(
        `Quiz me on the content of this textbook page.

Ask me one question at a time and wait for my answer before giving me the next question.

Start with question 1.

Page ${currentPage}:
${pageText}`
      );

    } else {

      sendToFAI(
        `Quiz me on page ${currentPage}. Ask me one question at a time.`
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

  faiContent.innerHTML = "";

  /*
    Do not manually add the user
    message here.

    sendToFAI() will add it once
    and save it to the 7-message
    conversation history.
  */

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
   SHOW READER ENGINE
========================= */

function showReaderEngine(
  type
) {

  pdfReader.classList.add(
    "hidden"
  );

  epubReader.classList.add(
    "hidden"
  );

  docxReader.classList.add(
    "hidden"
  );


  if (
    type === "pdf"
  ) {

    pdfReader.classList.remove(
      "hidden"
    );

  }


  if (
    type === "epub"
  ) {

    epubReader.classList.remove(
      "hidden"
    );

  }


  if (
    type === "docx"
  ) {

    docxReader.classList.remove(
      "hidden"
    );

  }

}

/* =========================
   LOAD EPUB
========================= */

async function loadEPUB() {

  if (
    typeof ePub ===
    "undefined"
  ) {

    throw new Error(
      "The EPUB reader could not be loaded."
    );

  }


  epubBook =
    ePub(
      textbook.file_url
    );


  epubRendition =
    epubBook.renderTo(
      epubContainer,
      {
        width: "100%",
        height: "100%",
        flow: "paginated",
        manager: "default"
      }
    );


  await epubBook.ready;


  await epubRendition.display();


  /*
   * EPUB does not use PDF-style
   * numeric pages in the same way.
   *
   * We use the EPUB location
   * information for navigation.
   */

  totalPages =
    epubBook.spine.length || 1;

  currentPage = 1;


  pageNumber.textContent =
    currentPage;

  pageCount.textContent =
    totalPages;


  updateNavigation();


  epubRendition.on(
    "relocated",
    location => {

      if (
        location &&
        location.start
      ) {

        currentPage =
          location.start.index + 1;

        pageNumber.textContent =
          currentPage;

        saveProgress();

      }

    }
  );

}

/* =========================
   LOAD DOCX
========================= */

async function loadDOCX() {

  if (
    typeof docx ===
    "undefined"
  ) {

    throw new Error(
      "The DOCX reader could not be loaded."
    );

  }


  const response =
    await fetch(
      textbook.file_url
    );


  if (
    !response.ok
  ) {

    throw new Error(
      "Unable to download the DOCX textbook."
    );

  }


  const blob =
    await response.blob();


  docxContainer.innerHTML =
    "";


  await docx.renderAsync(
    blob,
    docxContainer,
    null,
    null,
    {
      className:
        "docx",

      inWrapper:
        true,

      breakPages:
        true,

      ignoreWidth:
        false,

      ignoreHeight:
        false,

      ignoreFonts:
        false,

      renderHeaders:
        true,

      renderFooters:
        true,

      renderFootnotes:
        true,

      renderEndnotes:
        true
    }
  );


  /*
   * DOCX does not have a
   * native PDF-style page API.
   *
   * docx-preview creates the
   * rendered pages in the DOM.
   */

  const pages =
    docxContainer.querySelectorAll(
      ".docx"
    );


  totalPages =
    pages.length || 1;


  currentPage = 1;


  pageNumber.textContent =
    currentPage;

  pageCount.textContent =
    totalPages;


  updateNavigation();

}


/* =========================
   LOAD TEXTBOOK
========================= */

async function loadTextbook() {

  try {

    readerType =
      getTextbookType();


    /* =========================
       CHECK TYPE
    ========================= */

    if (
      readerType ===
      "unknown"
    ) {

      throw new Error(
        "This textbook format is not supported."
      );

    }


    /* =========================
       SHOW READER
    ========================= */

    showReaderEngine(
      readerType
    );


    /* =========================
       PDF
    ========================= */

    if (
      readerType ===
      "pdf"
    ) {

      if (
        typeof pdfjsLib ===
        "undefined"
      ) {

        throw new Error(
          "The PDF reader could not be loaded."
        );

      }


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


      await renderPage(
        currentPage
      );

    }


    /* =========================
       EPUB
    ========================= */

    else if (
      readerType ===
      "epub"
    ) {

      await loadEPUB();

    }


    /* =========================
       DOCX
    ========================= */

    else if (
      readerType ===
      "docx"
    ) {

      await loadDOCX();

    }


    /* =========================
       SHOW UI
    ========================= */

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


  } catch (error) {

    showError(
      error.message ||
      "This textbook could not be opened."
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