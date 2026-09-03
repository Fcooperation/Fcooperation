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
      
      const ownedBar =
  document.getElementById(
    "owned-bar"
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


/* =========================
   GET URL ITEM ID
========================= */

const urlParams =
  new URLSearchParams(
    window.location.search
  );

const sharedItemId =
  urlParams.get("id");


/* =========================
   LOAD MATERIAL
========================= */

async function loadMaterial() {

  /* =========================
     SHARED LINK
  ========================= */

  if (sharedItemId) {

    try {

      const response =
        await fetch(
          "https://fweb-backend.onrender.com/get-fmarket-item",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
  itemId:
    sharedItemId,

  userId:
    account.id || null
})
          }
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data.success ||
        !data.material
      ) {

        throw new Error(
          data.error ||
          "This material could not be found."
        );

      }


      material =
        data.material;
        
        material.owned =
  data.owned === true;


      /* =========================
         SAVE FOR NORMAL FLOW
      ========================= */

      localStorage.setItem(
        "fmarket_material",
        JSON.stringify(
          material
        )
      );


      return;

    } catch (error) {

      showError(
        error.message ||
        "Unable to load this material."
      );

      throw error;

    }

  }


  /* =========================
     NORMAL FMARKET NAVIGATION
  ========================= */

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


  if (!material) {

    showError(
      "No material was selected."
    );

    throw new Error(
      "No material selected."
    );

  }

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
   CHECK LOCAL OWNERSHIP
========================= */

function isLocallyOwnedMaterial() {

  if (
    !material ||
    !material.id
  ) {

    return false;

  }


  /* =========================
     CURRENT MATERIAL
  ========================= */

  const materialId =
    String(
      material.id
    );


  /* =========================
     CHECK FMARKET MATERIAL
  ========================= */

  try {

    const storedMaterial =
      localStorage.getItem(
        "fmarket_material"
      );

    if (
      storedMaterial
    ) {

      const parsed =
        JSON.parse(
          storedMaterial
        );

      if (
        parsed &&
        parsed.id &&
        String(
          parsed.id
        ) === materialId
      ) {

        /*
          Only treat it as owned
          if the stored material
          explicitly says so.
        */

        if (
          parsed.owned === true
        ) {

          return true;

        }

      }

    }

  } catch {

    /* Ignore invalid localStorage */

  }


  /* =========================
     CHECK FSTUDY NOTES
  ========================= */

  try {

    const currentAccount =
      JSON.parse(
        localStorage.getItem(
          "faccount"
        )
      ) || {};

    if (
      currentAccount.id
    ) {

      const notesKey =
        `myfstudynote_${currentAccount.id}`;

      const notes =
        JSON.parse(
          localStorage.getItem(
            notesKey
          )
        ) || [];

      if (
        Array.isArray(
          notes
        )
      ) {

        const foundNote =
          notes.some(
            note =>
              String(
                note?.fmarket_id
              ) === materialId
          );

        if (
          foundNote
        ) {

          return true;

        }

      }

    }

  } catch {

    /* Ignore invalid localStorage */

  }


  /* =========================
     CHECK PAST QUESTIONS
  ========================= */

  try {

    const currentAccount =
      JSON.parse(
        localStorage.getItem(
          "faccount"
        )
      ) || {};

    if (
      currentAccount.id
    ) {

      const questionsKey =
        `my_past_questions_${currentAccount.id}`;

      const questions =
        JSON.parse(
          localStorage.getItem(
            questionsKey
          )
        ) || [];

      if (
        Array.isArray(
          questions
        )
      ) {

        const foundQuestions =
          questions.some(
            question =>
              String(
                question?.fmarket_id
              ) === materialId
          );

        if (
          foundQuestions
        ) {

          return true;

        }

      }

    }

  } catch {

    /* Ignore invalid localStorage */

  }


  return false;

}

/* =========================
   CHECK OWNERSHIP
========================= */

function getOwnedMaterial() {

  if (
    !material
  ) {

    return false;

  }


  return (
    material.owned === true ||
    isLocallyOwnedMaterial()
  );

}

function updateOwnershipUI() {

  const isOwned =
    getOwnedMaterial();


  /* =========================
     OWNED BAR
  ========================= */

  if (
    ownedBar
  ) {

    if (
      isOwned
    ) {

      ownedBar.classList.remove(
        "hidden"
      );

    } else {

      ownedBar.classList.add(
        "hidden"
      );

    }

  }


  /* =========================
     BUY / OPEN BUTTON
  ========================= */

  if (
    buyBtn
  ) {

    buyBtn.textContent =
      isOwned
        ? "Open"
        : (
            Number(
              material.price
            ) === 0
              ? "Open"
              : "Buy Now"
          );

  }


  return isOwned;

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
   BUY / OPEN BUTTON
========================= */

updateOwnershipUI();


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
     GET CATEGORY
  ========================= */

  const category =
  String(
    purchasedMaterial?.category ||
    material?.category ||
    ""
  )
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");


  /* =========================
     GET NOTE DATA
  ========================= */

  let originalData =
    purchasedMaterial?.note_data;


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
    originalData === null ||
    originalData === undefined
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
    category === "notes"
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
        type: "note",
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
      type: "note",
      data: materialToSave
    };

  }


  /* ==================================================
     PAST QUESTIONS
  ================================================== */

  if (
    category === "past_questions" ||
    category === "past-questions"
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
   BUY / OPEN MATERIAL
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

/* =========================
   CHECK BACKEND OWNERSHIP
========================= */

const isOwned =
  getOwnedMaterial();


if (
  isOwned
) {

  const category =
    String(
      material.category ||
      ""
    )
      .toLowerCase()
      .trim()
      .replace(
        /[\s-]+/g,
        "_"
      );


  /* =========================
     OWNED NOTE
  ========================= */

  if (
    category === "notes"
  ) {

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


    const notesKey =
      `myfstudynote_${currentAccount.id}`;


    let notes = [];

    try {

      notes =
        JSON.parse(
          localStorage.getItem(
            notesKey
          )
        ) || [];

    } catch {

      notes = [];

    }


    const ownedNote =
      Array.isArray(notes)
        ? notes.find(
            note =>
              String(
                note?.fmarket_id
              ) ===
              String(
                material.id
              )
          )
        : null;


    if (
      !ownedNote
    ) {

      showStatus(
        "You own this material, but its study data is not available on this device.",
        "error"
      );

      return;

    }


    localStorage.setItem(
      "viewing_note",
      JSON.stringify(
        ownedNote
      )
    );


    showStatus(
      "Opening note...",
      "success"
    );


    setTimeout(
      () => {

        window.location.href =
          "/view-note";

      },
      300
    );


    return;

  }


  /* =========================
     OWNED PAST QUESTIONS
  ========================= */

  if (
    category ===
      "past_questions"
  ) {

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


    const questionsKey =
      `my_past_questions_${currentAccount.id}`;


    let questions = [];

    try {

      questions =
        JSON.parse(
          localStorage.getItem(
            questionsKey
          )
        ) || [];

    } catch {

      questions = [];

    }


    const ownedQuestions =
      Array.isArray(questions)
        ? questions.filter(
            question =>
              String(
                question?.fmarket_id
              ) ===
              String(
                material.id
              )
          )
        : [];


    if (
      ownedQuestions.length ===
      0
    ) {

      showStatus(
        "You own this material, but its questions are not available on this device.",
        "error"
      );

      return;

    }


    localStorage.setItem(
      "viewing_past_questions_batch",
      JSON.stringify(
        ownedQuestions
      )
    );


    localStorage.setItem(
      "viewing_past_question",
      JSON.stringify(
        ownedQuestions[0]
      )
    );


    showStatus(
      "Opening Past Questions...",
      "success"
    );


    setTimeout(
      () => {

        window.location.href =
          "/view-past-question";

      },
      300
    );


    return;

  }

}

/* =========================
   FREE MATERIAL
========================= */

const price =
  Number(
    material.price
  ) || 0;


if (
  price === 0
) {

  /* =========================
     GET CATEGORY
  ========================= */

  const category =
    String(
      material.category ||
      ""
    )
      .toLowerCase()
      .trim()
      .replace(
        /[\s-]+/g,
        "_"
      );


  /* =========================
     NOTES
  ========================= */

  if (
    category === "notes"
  ) {

    if (
      material.note_data ===
        null ||
      material.note_data ===
        undefined
    ) {

      showStatus(
        "This free note has no study data.",
        "error"
      );

      return;

    }


    try {

      const savedMaterial =
        savePurchasedMaterial(
          material
        );


      showStatus(
        "Opening note...",
        "success"
      );


      setTimeout(
        () => {

          if (
            savedMaterial.type ===
            "note"
          ) {

            window.location.href =
              "/view-note";

          }

        },
        300
      );


      return;

    } catch (error) {

      showStatus(
        error.message ||
        "Unable to open this note.",
        "error"
      );

      return;

    }

  }


  /* =========================
     PAST QUESTIONS
  ========================= */

  if (
    category === "past_questions"
  ) {

    if (
      material.note_data ===
        null ||
      material.note_data ===
        undefined
    ) {

      showStatus(
        "This free Past Questions material has no study data.",
        "error"
      );

      return;

    }


    try {

      const savedMaterial =
        savePurchasedMaterial(
          material
        );


      showStatus(
        "Opening Past Questions...",
        "success"
      );


      setTimeout(
        () => {

          if (
            savedMaterial.type ===
            "past_questions"
          ) {

            window.location.href =
              "/view-past-question";

          }

        },
        300
      );


      return;

    } catch (error) {

      showStatus(
        error.message ||
        "Unable to open Past Questions.",
        "error"
      );

      return;

    }

  }


  /* =========================
     DIGITAL / PHYSICAL TEXTBOOK
  ========================= */

  if (
    category === "textbook" ||
    category === "textbooks"
  ) {

    const materialType =
      String(
        material.material_type ||
        ""
      )
        .toLowerCase()
        .trim();


    /* =========================
       DIGITAL TEXTBOOK
    ========================= */

    if (
      materialType === "digital"
    ) {

      if (
        !material.file_url
      ) {

        showStatus(
          "This textbook has no PDF file attached.",
          "error"
        );

        return;

      }


      /* =========================
         SAVE TEXTBOOK
      ========================= */

      localStorage.setItem(
        "viewing_textbook",
        JSON.stringify(
          material
        )
      );


      showStatus(
        "Opening textbook...",
        "success"
      );


      setTimeout(
        () => {

          window.location.href =
            "/view-textbook";

        },
        300
      );


      return;

    }


    /* =========================
       PHYSICAL TEXTBOOK
    ========================= */

    if (
      materialType === "physical"
    ) {

      showStatus(
        "This is a physical textbook.",
        "info"
      );

      return;

    }


    /* =========================
       UNKNOWN TEXTBOOK TYPE
    ========================= */

    showStatus(
      "This textbook type is unavailable.",
      "error"
    );

    return;

  }


  /* =========================
     OTHER FREE MATERIAL
  ========================= */

  showStatus(
    "This free material cannot be opened here.",
    "error"
  );

  return;

}


  /* =========================
     LOGIN REQUIRED
  ========================= */

  if (
    !account.id
  ) {

    showStatus(
      "",
      "error"
    );


    status.innerHTML =
      'Please <a href="/login" class="fmarket-login-link">log in</a> before buying a material.';

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
   NOTES / PAST QUESTIONS
========================= */

else {

  const category =
  String(
    purchasedMaterial.category ||
    material.category ||
    ""
  )
    .toLowerCase()
    .trim()
    .replace(
      /[\s-]+/g,
      "_"
    );


  const isNote =
    category === "notes";


  const isPastQuestions =
    category === "past_questions" ||
    category === "past-questions";


  if (
    isNote ||
    isPastQuestions
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

        if (
          savedMaterial.type ===
          "physical_textbook"
        ) {

          window.location.href =
            "/fmarket-orders";

          return;

        }


        if (
          savedMaterial.type ===
          "digital_textbook"
        ) {

          localStorage.setItem(
            "viewing_textbook",
            JSON.stringify(
              savedMaterial.data
            )
          );


          window.location.href =
            "/view-textbook";

          return;

        }


        if (
  savedMaterial.type ===
  "note"
) {

  window.location.href =
    "/view-note";

  return;

}


        if (
          savedMaterial.type ===
          "past_questions"
        ) {

          window.location.href =
            "/view-past-question";

          return;

        }


        window.location.href =
          "/fmarket";

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
   INITIAL LOAD
========================= */

loadMaterial()
  .then(() => {

    renderMaterial();

  })
  .catch(() => {

    /* Error already displayed */

  });
  }
);