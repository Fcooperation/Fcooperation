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
CHECK NOTE DATA
========================= */

const originalNote =
purchasedMaterial?.note_data;

if (
!originalNote ||
typeof originalNote !== "object"
) {

throw new Error(
  "This material does not contain a valid FStudy note."
);

}

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

if (existingNote) {

localStorage.setItem(
  "viewing_note",
  JSON.stringify(
    existingNote
  )
);

return existingNote;

}

/* =========================
PRESERVE FSTUDY IMAGES
FROM CLOUDINARY
========================= */

let noteFiles = [];

if (
Array.isArray(
originalNote.files
)
) {

noteFiles =
  originalNote.files.map(
    file => ({

      /*
       * Permanent Cloudinary URL
       * uploaded by FMarket seller.
       */

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

/*
 * Start with the complete
 * FStudy note JSON.
 */

...originalNote,


/*
 * Replace files with the
 * permanent marketplace
 * image references.
 */

files:
  noteFiles,


/* =========================
   FMARKET INFORMATION
========================= */

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
SAVE TO MY NOTES
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
SAVE CURRENT NOTE
========================= */

localStorage.setItem(
"viewing_note",
JSON.stringify(
materialToSave
)
);

return materialToSave;

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
           SUCCESS ONLY
           SAVE MATERIAL
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


if (
  !purchasedMaterial.note_data
) {

  throw new Error(
    "Purchase succeeded, but the FStudy note data was not returned."
  );

}


        /*
         * Save ONLY after the
         * backend says success.
         */

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
           SUCCESS
        ========================= */

        showStatus(
          "Purchase successful! Opening material...",
          "success"
        );


        /*
         * Small delay so the user
         * can see the success state.
         */

        setTimeout(
          () => {

            window.location.href =
              "view-note";

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