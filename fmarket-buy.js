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
case "textbook":
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
   TEXTBOOK TYPE
========================= */

setRow(
  "textbook-type-row",
  "material-textbook-type",
  material.material_type === "digital"
    ? "Digital"
    : material.material_type === "physical"
      ? "Physical"
      : null
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
case "textbook":
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
    (
      material?.category === "past_questions" ||
      material?.category === "past-questions"
        ? "past_questions"
        : "manual"
    );


  /* =========================
     GET NOTE DATA
  ========================= */

  let originalData =
    purchasedMaterial?.note_data;


  /*
   * Supabase JSONB normally comes
   * back as an object/array.
   *
   * But if the backend sends it
   * as a JSON string, parse it.
   */

  if (
    typeof originalData ===
    "string"
  ) {

    try {

      originalData =
        JSON.parse(
          originalData
        );

    } catch {

      throw new Error(
        "The material study data could not be read."
      );

    }

  }


  /* =========================
     CHECK DATA
  ========================= */

  if (
    originalData ===
    null ||
    originalData ===
    undefined
  ) {

    throw new Error(
      "This material has no study data attached to it."
    );

  }


  if (
    typeof originalData !==
      "object"
  ) {

    throw new Error(
      "The material study data has an invalid format."
    );

  }


  /* ==================================================
     FSTUDY NOTE
  ================================================== */

  if (
    source === "fstudy_note"
  ) {

    /* =========================
       ACCOUNT KEY
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
       DUPLICATE
    ========================= */

    const existingNote =
      myNotes.find(
        note =>
          String(
            note.fmarket_id
          ) ===
          String(
            purchasedMaterial.id
          )
      );


    /* =========================
       ALREADY OWNED
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
       FILES
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
       CREATE NOTE
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
       SAVE
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
       ACCOUNT KEY
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
       GET EXISTING
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
       GET QUESTIONS
    ========================= */

    let questions = [];


    if (
      Array.isArray(
        originalData
      )
    ) {

      questions =
        originalData;

    }

    else if (
      Array.isArray(
        originalData.questions
      )
    ) {

      questions =
        originalData.questions;

    }

    else {

      questions = [
        originalData
      ];

    }


    if (
      questions.length ===
      0
    ) {

      throw new Error(
        "This Past Questions material contains no questions."
      );

    }


    /* =========================
       CHECK DUPLICATE
    ========================= */

    const alreadyOwned =
      myQuestions.some(
        question =>
          String(
            question.fmarket_id
          ) ===
          String(
            purchasedMaterial.id
          )
      );


    /* =========================
       PREPARE QUESTIONS
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
       SAVE NEW PURCHASE
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
       QUESTIONS TO VIEW
    ========================= */

    const questionsToView =
      alreadyOwned
        ? myQuestions.filter(
            question =>
              String(
                question.fmarket_id
              ) ===
              String(
                purchasedMaterial.id
              )
          )
        : purchasedQuestions;


    /* =========================
       SAVE CURRENT BATCH
    ========================= */

    localStorage.setItem(
      "viewing_past_questions_batch",
      JSON.stringify(
        questionsToView
      )
    );


    /* =========================
       COMPATIBILITY
    ========================= */

    if (
      questionsToView.length >
      0
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


  /* =========================
     OTHER MATERIAL
  ========================= */

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
   CHECK PURCHASE TYPE
========================= */

const purchaseType =
  data.type ||
  "";


/* =========================
   PHYSICAL TEXTBOOK
========================= */

if (
  purchaseType ===
  "physical_textbook"
) {

  /*
   * Physical textbooks do not
   * contain study data that
   * needs to be saved locally.
   */

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


  /*
   * Save the order information
   * so the order page can open it.
   */

  localStorage.setItem(
    "fmarket_current_order",
    JSON.stringify({
      order_id:
        data.order_id,

      material:
        purchasedMaterial
    })
  );

}


/* =========================
   DIGITAL TEXTBOOK
========================= */

else if (
  purchaseType ===
  "digital_textbook"
) {

  if (
    !purchasedMaterial.file_url
  ) {

    throw new Error(
      "Purchase succeeded, but the textbook file was not returned."
    );

  }

}


/* =========================
   FSTUDY / PAST QUESTIONS
========================= */

else {

  const source =
    purchasedMaterial.source ||
    material.source ||
    (
      material.category === "past_questions" ||
      material.category === "past-questions"
        ? "past_questions"
        : "manual"
    );


  if (
    source === "fstudy_note" ||
    source === "past_questions"
  ) {

    if (
      purchasedMaterial.note_data ===
        null ||
      purchasedMaterial.note_data ===
        undefined
    ) {

      throw new Error(
        "Purchase succeeded, but the study data was not returned."
      );

    }

  }

}



    /* =========================
       SAVE PURCHASE
    ========================= */

    let savedMaterial = null;

if (
  data.type ===
  "physical_textbook"
) {

  savedMaterial = {
    type:
      "physical_textbook",

    orderId:
      data.order_id,

    data:
      purchasedMaterial
  };

}

else if (
  data.type ===
  "digital_textbook"
) {

  savedMaterial = {
    type:
      "digital_textbook",

    data:
      purchasedMaterial
  };

}

else {

  savedMaterial =
    savePurchasedMaterial(
      purchasedMaterial
    );

}


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

    /* =========================
       PHYSICAL TEXTBOOK
    ========================= */

    if (
      savedMaterial.type ===
      "physical_textbook"
    ) {

      window.location.href =
        "/fmarket-orders";

      return;

    }


    /* =========================
       DIGITAL TEXTBOOK
    ========================= */

    if (
      savedMaterial.type ===
      "digital_textbook"
    ) {

      /*
       * Save the textbook so
       * the viewer can open it.
       */

      localStorage.setItem(
        "viewing_textbook",
        JSON.stringify(
          savedMaterial.data
        )
      );


      /*
       * We'll create this page
       * next.
       */

      window.location.href =
        "/view-textbook";

      return;

    }


    /* =========================
       FSTUDY NOTE
    ========================= */

    if (
      savedMaterial.type ===
      "fstudy_note"
    ) {

      window.location.href =
        "view-note";

      return;

    }


    /* =========================
       PAST QUESTIONS
    ========================= */

    if (
      savedMaterial.type ===
      "past_questions"
    ) {

      window.location.href =
        "view-past-question";

      return;

    }


    /* =========================
       OTHER
    ========================= */

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