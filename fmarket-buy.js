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

    const materialPage =
      document.getElementById(
        "material-page"
      );

    const buyBar =
      document.getElementById(
        "buy-bar"
      );

    const buyBtn =
      document.getElementById(
        "buy-btn"
      );

    const messageBtn =
      document.getElementById(
        "message-btn"
      );

    const status =
      document.getElementById(
        "status"
      );


    /* =========================
       API
    ========================= */

    const API_URL =
      "https://fweb-backend.onrender.com/fmarket-buy";


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
       GET MATERIAL
    ========================= */

    let material = null;

    try {

      material =
        JSON.parse(
          localStorage.getItem(
            "fmarket_material"
          )
        );

    } catch {

      material = null;

    }


    /* =========================
       CHECK MATERIAL
    ========================= */

    if (!material) {

      showError(
        "No material was selected."
      );

      return;

    }


    /* =========================
       STATUS
    ========================= */

    function showStatus(
      message,
      type = "info"
    ) {

      status.textContent =
        message;

      status.className =
        `status ${type}`;

      status.classList.remove(
        "hidden"
      );

    }


    function hideStatus() {

      status.classList.add(
        "hidden"
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

      materialPage.classList.add(
        "hidden"
      );

      buyBar.classList.add(
        "hidden"
      );

      errorMessage.textContent =
        message;

      errorBox.classList.remove(
        "hidden"
      );

    }


    /* =========================
       FORMAT CATEGORY
    ========================= */

    function formatCategory(
  category
) {

  switch (
    category
  ) {

    case "past-questions":
    case "past_questions":
      return "Past Questions";

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
       FORMAT PRICE
    ========================= */

    function formatPrice(
      price
    ) {

      const amount =
        Number(price) || 0;

      if (amount === 0) {

        return "FREE";

      }

      return `₣${amount.toLocaleString()}`;

    }


    /* =========================
       SET OPTIONAL ROW
    ========================= */

    function setRow(
      rowId,
      valueId,
      value
    ) {

      const row =
        document.getElementById(
          rowId
        );

      const element =
        document.getElementById(
          valueId
        );


      if (
        value !== undefined &&
        value !== null &&
        String(value).trim()
      ) {

        element.textContent =
          value;

        row.classList.remove(
          "hidden"
        );

      } else {

        row.classList.add(
          "hidden"
        );

      }

    }


    /* =========================
       RENDER MATERIAL
    ========================= */

    function renderMaterial() {

      const image =
        document.getElementById(
          "material-image"
        );

      const placeholder =
        document.getElementById(
          "image-placeholder"
        );


      /* =========================
         IMAGE
      ========================= */

      if (
        material.image_url
      ) {

        image.src =
          material.image_url;

        image.alt =
          material.title ||
          "Market material";

        image.classList.remove(
          "hidden"
        );

        placeholder.classList.add(
          "hidden"
        );

      } else {

        image.classList.add(
          "hidden"
        );

        placeholder.textContent =
          getCategoryIcon(
            material.category
          );

        placeholder.classList.remove(
          "hidden"
        );

      }


      /* =========================
         TITLE
      ========================= */

      document.getElementById(
        "material-title"
      ).textContent =
        material.title ||
        "Untitled material";


      /* =========================
         CATEGORY
      ========================= */

      document.getElementById(
        "material-category"
      ).textContent =
        formatCategory(
          material.category
        );


      /* =========================
         PRICE
      ========================= */

      const priceText =
        formatPrice(
          material.price
        );


      document.getElementById(
        "material-price"
      ).textContent =
        priceText;


      document.getElementById(
        "bottom-price"
      ).textContent =
        priceText;


      /* =========================
         DESCRIPTION
      ========================= */

      document.getElementById(
        "material-description"
      ).textContent =
        material.description ||
        "No description provided.";


      /* =========================
         META
      ========================= */

      setRow(
        "university-row",
        "material-university",
        material.university
      );


      setRow(
        "course-row",
        "material-course",
        material.course
      );


      setRow(
        "department-row",
        "material-department",
        material.department
      );


      setRow(
        "location-row",
        "material-location",
        material.location
      );


      setRow(
        "condition-row",
        "material-condition",
        material.condition
      );


      /* =========================
         SELLER
      ========================= */

      document.getElementById(
        "seller-name"
      ).textContent =
        material.seller_name ||
        "Unknown seller";


      /* =========================
         SHOW PAGE
      ========================= */

      loading.classList.add(
        "hidden"
      );

      errorBox.classList.add(
        "hidden"
      );

      materialPage.classList.remove(
        "hidden"
      );

      buyBar.classList.remove(
        "hidden"
      );

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
      return "📚";

    case "handouts":
      return "📑";

    default:
      return "🛍️";

  }

}


/* =========================
   SAVE PURCHASED MATERIAL
========================= */

function savePurchasedMaterial(
  purchasedMaterial
) {

  /* =========================
     GET ACCOUNT
  ========================= */

  let currentAccount = {};

  try {

    currentAccount =
      JSON.parse(
        localStorage.getItem(
          "faccount"
        )
      ) || {};

  } catch {

    currentAccount = {};

  }


  /* =========================
     GET SOURCE
  ========================= */

  const source =
    purchasedMaterial?.source ||
    material?.source ||
    "manual";


  /* =========================
     GET NOTE DATA
     BOTH FSTUDY NOTES AND
     PAST QUESTIONS USE THIS
  ========================= */

  const originalData =
    purchasedMaterial?.note_data;


  if (
    !originalData ||
    typeof originalData !== "object"
  ) {

    throw new Error(
      "This material does not contain valid study data."
    );

  }


  /* ==================================================
     FSTUDY NOTE
  ================================================== */

  if (
    source === "fstudy_note"
  ) {

    /* =========================
       ACCOUNT-SPECIFIC KEY
    ========================= */

    let notesKey =
      "myfstudynote";

    if (
      currentAccount.id
    ) {

      notesKey =
        `myfstudynote_${currentAccount.id}`;

    }


    /* =========================
       GET EXISTING NOTES
    ========================= */

    let myNotes = [];

    const existing =
      localStorage.getItem(
        notesKey
      );

    if (existing) {

      try {

        const parsed =
          JSON.parse(
            existing
          );

        if (
          Array.isArray(
            parsed
          )
        ) {

          myNotes =
            parsed;

        }

      } catch {

        myNotes = [];

      }

    }


    /* =========================
       CHECK DUPLICATE
    ========================= */

    const existingNote =
      myNotes.find(
        note =>
          note.fmarket_id ===
          purchasedMaterial.id
      );


    /* =========================
       OPEN EXISTING PURCHASE
    ========================= */

    if (
      existingNote
    ) {

      localStorage.setItem(
        "viewing_note",
        JSON.stringify(
          existingNote
        )
      );

      return {
        type: "fstudy_note",
        data: existingNote
      };

    }


    /* =========================
       PRESERVE FSTUDY IMAGES
    ========================= */

    let noteFiles = [];

    if (
      Array.isArray(
        originalData.files
      )
    ) {

      noteFiles =
        originalData.files.map(
          file => ({

            id:
              file?.id ||
              null,

            name:
              file?.name ||
              "Study image",

            type:
              file?.type ||
              "image/jpeg",

            size:
              file?.size ||
              0,

            url:
              file?.url ||
              null

          })
        );

    }


    /* =========================
       CREATE PURCHASED NOTE
    ========================= */

    const materialToSave = {

      ...originalData,

      files:
        noteFiles,

      fmarket_id:
        purchasedMaterial.id,

      source:
        "fmarket",

      owner_id:
        currentAccount.id ||
        null,

      purchased_at:
        new Date().toISOString(),

      fmarket_image_url:
        purchasedMaterial.image_url ||
        null

    };


    /* =========================
       SAVE NOTE
    ========================= */

    myNotes.push(
      materialToSave
    );

    localStorage.setItem(
      notesKey,
      JSON.stringify(
        myNotes
      )
    );


    /* =========================
       CURRENT NOTE
    ========================= */

    localStorage.setItem(
      "viewing_note",
      JSON.stringify(
        materialToSave
      )
    );


    return {
      type: "fstudy_note",
      data: materialToSave
    };

  }


  /* ==================================================
     PAST QUESTIONS
  ================================================== */

  if (
    source === "past_questions"
  ) {

    /* =========================
       ACCOUNT-SPECIFIC KEY
    ========================= */

    let questionsKey =
      "my_past_questions";

    if (
      currentAccount.id
    ) {

      questionsKey =
        `my_past_questions_${currentAccount.id}`;

    }


    /* =========================
       GET EXISTING QUESTIONS
    ========================= */

    let myQuestions = [];

    const existing =
      localStorage.getItem(
        questionsKey
      );

    if (existing) {

      try {

        const parsed =
          JSON.parse(
            existing
          );

        if (
          Array.isArray(
            parsed
          )
        ) {

          myQuestions =
            parsed;

        }

      } catch {

        myQuestions = [];

      }

    }


    /* =========================
       NORMALIZE QUESTION DATA
    ========================= */

    let questions = [];


    /*
     * Past Questions may have been
     * stored directly as an array.
     */

    if (
      Array.isArray(
        originalData
      )
    ) {

      questions =
        originalData;

    }

    /*
     * Or the data may contain a
     * questions array.
     */

    else if (
      Array.isArray(
        originalData.questions
      )
    ) {

      questions =
        originalData.questions;

    }

    else {

      /*
       * Single question object.
       */

      questions = [
        originalData
      ];

    }


    if (
      questions.length === 0
    ) {

      throw new Error(
        "This Past Questions material contains no questions."
      );

    }


    /* =========================
       ADD PURCHASE METADATA
    ========================= */

    const purchasedQuestions =
      questions.map(
        question => ({

          ...question,

          fmarket_id:
            purchasedMaterial.id,

          source:
            "fmarket",

          owner_id:
            currentAccount.id ||
            null,

          purchased_at:
            new Date().toISOString(),

          fmarket_image_url:
            purchasedMaterial.image_url ||
            null

        })
      );


    /* =========================
       CHECK IF ALREADY OWNED
    ========================= */

    const alreadyOwned =
      myQuestions.some(
        question =>
          question.fmarket_id ===
          purchasedMaterial.id
      );


    /* =========================
       SAVE QUESTIONS
    ========================= */

    if (
      !alreadyOwned
    ) {

      myQuestions.push(
        ...purchasedQuestions
      );

      localStorage.setItem(
        questionsKey,
        JSON.stringify(
          myQuestions
        )
      );

    }


    /* =========================
       SAVE CURRENT BATCH
    ========================= */

    const questionsToView =
      alreadyOwned
        ? myQuestions.filter(
            question =>
              question.fmarket_id ===
              purchasedMaterial.id
          )
        : purchasedQuestions;


    localStorage.setItem(
      "viewing_past_questions_batch",
      JSON.stringify(
        questionsToView
      )
    );


    /*
     * Also save the first question
     * for compatibility with the
     * existing Past Question page.
     */

    if (
      questionsToView.length > 0
    ) {

      localStorage.setItem(
        "viewing_past_question",
        JSON.stringify(
          questionsToView[0]
        )
      );

    }


    return {
      type: "past_questions",
      data: questionsToView
    };

  }


  /* ==================================================
     OTHER FMARKET MATERIAL
  ================================================== */

  return {
    type: "other",
    data: purchasedMaterial
  };

}


/* =========================
   BUY MATERIAL
========================= */

async function buyMaterial() {

  if (
    !material ||
    !material.id
  ) {

    showStatus(
      "This material is unavailable.",
      "error"
    );

    return;

  }


  if (
    !account.id
  ) {

    showStatus(
      "Please log in before buying a material.",
      "error"
    );

    return;

  }


  buyBtn.disabled =
    true;


  showStatus(
    "Processing purchase...",
    "info"
  );


  try {

    /* =========================
       BACKEND PURCHASE
    ========================= */

    const response =
      await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              userId:
                account.id,

              materialId:
                material.id

            })

        }
      );


    const data =
      await response.json();


    /* =========================
       BACKEND FAILURE
    ========================= */

    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.error ||
        "Purchase failed."
      );

    }


    /* =========================
       GET PURCHASED MATERIAL
    ========================= */

    const purchasedMaterial =
      data.material;


    if (
      !purchasedMaterial
    ) {

      throw new Error(
        "Purchase succeeded, but the material data was not returned."
      );

    }


    /* =========================
       GET SOURCE
    ========================= */

    const source =
      purchasedMaterial.source ||
      material.source ||
      "manual";


    /* =========================
       NOTE DATA REQUIRED FOR
       FSTUDY + PAST QUESTIONS
    ========================= */

    if (
      (
        source === "fstudy_note" ||
        source === "past_questions"
      ) &&
      (
        !purchasedMaterial.note_data ||
        typeof purchasedMaterial.note_data !== "object"
      )
    ) {

      throw new Error(
        "Purchase succeeded, but the study data was not returned."
      );

    }


    /* =========================
       SAVE PURCHASE
    ========================= */

    const savedMaterial =
      savePurchasedMaterial(
        purchasedMaterial
      );


    /* =========================
       UPDATE ACCOUNT FCOINS
    ========================= */

    if (
      data.fcoins !==
      undefined
    ) {

      account.fcoins =
        Number(
          data.fcoins
        ) || 0;

      localStorage.setItem(
        "faccount",
        JSON.stringify(
          account
        )
      );

    }


    /* =========================
       SUCCESS MESSAGE
    ========================= */

    showStatus(
      "Purchase successful! Opening material...",
      "success"
    );


    /* =========================
       OPEN CORRECT MATERIAL
    ========================= */

    setTimeout(
      () => {

        if (
          savedMaterial.type ===
          "fstudy_note"
        ) {

          window.location.href =
            "view-note";

          return;

        }


        if (
          savedMaterial.type ===
          "past_questions"
        ) {

          window.location.href =
            "view-past-question";

          return;

        }


        /*
         * Generic FMarket material
         */

        window.location.href =
          "fmarket";

      },
      700
    );


  } catch (error) {

    showStatus(
      error.message ||
      "Unable to complete purchase.",
      "error"
    );


    buyBtn.disabled =
      false;

  }

}


    /* =========================
       MESSAGE SELLER
    ========================= */

    if (
      messageBtn
    ) {

      messageBtn.addEventListener(
        "click",
        () => {

          if (
            !material.seller_id
          ) {

            showStatus(
              "Seller information is unavailable.",
              "error"
            );

            return;

          }


          localStorage.setItem(
            "chatting_with",
            material.seller_id
          );


          localStorage.setItem(
            "fmarket_chat_seller_name",
            material.seller_name ||
            ""
          );


          window.location.href =
            "/chat";

        }
      );

    }


    /* =========================
       BUY BUTTON
    ========================= */

    buyBtn.addEventListener(
      "click",
      buyMaterial
    );


    /* =========================
       BACK
    ========================= */

    backBtn.addEventListener(
      "click",
      () => {

        window.location.href =
          "/fmarket";

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
       INITIAL RENDER
    ========================= */

    renderMaterial();

  }
);