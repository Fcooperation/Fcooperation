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

    const fcoinsBalance =
      document.getElementById(
        "fcoins-balance"
      );

    const topupBtn =
      document.getElementById(
        "topup-btn"
      );

    const notesSection =
      document.getElementById(
        "notes-section"
      );

    const myNotesList =
      document.getElementById(
        "my-notes-list"
      );

    const noNotes =
      document.getElementById(
        "no-notes"
      );

    const titleInput =
      document.getElementById(
        "title"
      );

    const categoryInput =
      document.getElementById(
        "category"
      );

    const descriptionInput =
      document.getElementById(
        "description"
      );

    const descriptionCount =
      document.getElementById(
        "description-count"
      );

    const universityInput =
      document.getElementById(
        "university"
      );

    const courseInput =
      document.getElementById(
        "course"
      );

    const departmentInput =
      document.getElementById(
        "department"
      );

    const locationInput =
      document.getElementById(
        "location"
      );

    const conditionInput =
      document.getElementById(
        "condition"
      );

    const priceInput =
      document.getElementById(
        "price"
      );

    const freeItem =
      document.getElementById(
        "free-item"
      );

    const productImage =
      document.getElementById(
        "product-image"
      );

    const imagePreview =
      document.getElementById(
        "image-preview"
      );

    const imagePlaceholder =
      document.getElementById(
        "image-placeholder"
      );

    const removeImage =
      document.getElementById(
        "remove-image"
      );

    const listItemBtn =
      document.getElementById(
        "list-item-btn"
      );

    const status =
      document.getElementById(
        "status"
      );


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


    const userId =
      account.id || null;


    /* =========================
       STUDYING DATA
    ========================= */

    const studyingUni =
      localStorage.getItem(
        "studying_uni"
      ) || "";

    const studying =
      localStorage.getItem(
        "studying"
      ) || "";


    /* =========================
       BACK
    ========================= */

    backBtn.addEventListener(
      "click",
      () => {
        history.back();
      }
    );


    /* =========================
       TOP UP
    ========================= */

    topupBtn.addEventListener(
      "click",
      () => {

        window.location.href =
          "/fmarket-topup";

      }
    );


    /* =========================
       BALANCE
    ========================= */

    function updateBalance(
      balance
    ) {

      const coins =
        Number(balance) || 0;

      fcoinsBalance.textContent =
        coins.toLocaleString();

    }


    updateBalance(
      account.fcoins || 0
    );


    /* =========================
       LOAD BALANCE FROM BACKEND
    ========================= */

    async function loadBalance() {

      if (!userId) {
        return;
      }

      try {

        const response =
          await fetch(
            `${window.CONFIG.API_URL}/fmarket?userId=${encodeURIComponent(userId)}&page=1`
          );


        const data =
          await response.json();


        if (
          response.ok &&
          data.success
        ) {

          const balance =
            Number(
              data.fcoins || 0
            );


          updateBalance(
            balance
          );


          account.fcoins =
            balance;


          localStorage.setItem(
            "faccount",
            JSON.stringify(
              account
            )
          );

        }

      } catch {

        /*
         * Keep the locally stored
         * balance if the request fails.
         */

      }

    }


    loadBalance();


    /* =========================
       LOAD MY FSTUDY NOTES
    ========================= */

    function loadMyNotes() {

      let notesKey =
        "myfstudynote";


      /*
       * Logged-in users get
       * account-specific notes.
       */

      if (
        userId
      ) {

        notesKey =
          `myfstudynote_${userId}`;

      }


      let notes = [];

      const stored =
        localStorage.getItem(
          notesKey
        );


      if (stored) {

        try {

          const parsed =
            JSON.parse(
              stored
            );


          if (
            Array.isArray(
              parsed
            )
          ) {

            notes =
              parsed;

          }

        } catch {

          notes = [];

        }

      }


      myNotesList.innerHTML =
        "";


      if (
        notes.length === 0
      ) {

        noNotes.classList.remove(
          "hidden"
        );

        return;

      }


      noNotes.classList.add(
        "hidden"
      );


      notes.forEach(
        (note, index) => {

          const card =
            document.createElement(
              "div"
            );

          card.className =
            "my-note-card";


          const info =
            document.createElement(
              "div"
            );

          info.className =
            "my-note-info";


          const title =
            document.createElement(
              "div"
            );

          title.className =
            "my-note-title";

          title.textContent =
            note.title ||
            note.topic ||
            "Untitled Note";


          const meta =
            document.createElement(
              "div"
            );

          meta.className =
            "my-note-meta";

          meta.textContent =
            [
              note.course,
              note.topic
            ]
              .filter(Boolean)
              .join(" • ");


          const arrow =
            document.createElement(
              "div"
            );

          arrow.className =
            "my-note-arrow";

          arrow.textContent =
            "›";


          info.appendChild(
            title
          );

          info.appendChild(
            meta
          );


          card.appendChild(
            info
          );

          card.appendChild(
            arrow
          );


          card.addEventListener(
            "click",
            () => {

              selectNote(
                note
              );

            }
          );


          myNotesList.appendChild(
            card
          );

        }
      );

    }


    /* =========================
       SELECT FSTUDY NOTE
    ========================= */

    function selectNote(
      note
    ) {

      titleInput.value =
        note.title ||
        note.topic ||
        "";


      categoryInput.value =
        "notes";


      courseInput.value =
        note.course ||
        studying ||
        "";


      universityInput.value =
        note.university ||
        studyingUni ||
        "";


      /*
       * Use the note topic in
       * the description if there
       * isn't already a description.
       */

      if (
        !descriptionInput.value.trim()
      ) {

        const topic =
          note.topic ||
          "";

        if (topic) {

          descriptionInput.value =
            `FStudy note covering ${topic}.`;

          updateDescriptionCount();

        }

      }


      /*
       * Remember which FStudy
       * note was selected.
       */

      selectedNote =
        note;


      document
        .querySelector(".form-card")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });


      showStatus(
        "FStudy note selected. Review the details before listing it.",
        "info"
      );

    }


    let selectedNote =
      null;


    loadMyNotes();


    /* =========================
       DESCRIPTION COUNT
    ========================= */

    function updateDescriptionCount() {

      descriptionCount.textContent =
        descriptionInput.value.length;

    }


    descriptionInput.addEventListener(
      "input",
      updateDescriptionCount
    );


    /* =========================
       FREE ITEM
    ========================= */

    freeItem.addEventListener(
      "change",
      () => {

        if (
          freeItem.checked
        ) {

          priceInput.value =
            "0";

          priceInput.disabled =
            true;

        } else {

          priceInput.disabled =
            false;

          priceInput.value =
            "";

        }

      }
    );

/* =========================
   COMPRESS IMAGE BEFORE UPLOAD
========================= */

async function compressImage(
  file,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.80
) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload = () => {

        const img =
          new Image();

        img.onload = () => {

          let width =
            img.width;

          let height =
            img.height;


          /* =========================
             RESIZE
          ========================= */

          if (
            width > maxWidth ||
            height > maxHeight
          ) {

            const ratio =
              Math.min(
                maxWidth / width,
                maxHeight / height
              );

            width =
              Math.round(
                width * ratio
              );

            height =
              Math.round(
                height * ratio
              );

          }


          /* =========================
             CANVAS
          ========================= */

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            width;

          canvas.height =
            height;


          const ctx =
            canvas.getContext(
              "2d"
            );


          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );


          /* =========================
             COMPRESS
          ========================= */

          canvas.toBlob(
            (blob) => {

              if (!blob) {

                reject(
                  new Error(
                    "Unable to compress image."
                  )
                );

                return;

              }


              const compressedFile =
                new File(
                  [
                    blob
                  ],
                  file.name
                    .replace(
                      /\.[^/.]+$/,
                      ""
                    ) + ".jpg",
                  {
                    type:
                      "image/jpeg",

                    lastModified:
                      Date.now()
                  }
                );


              resolve(
                compressedFile
              );

            },

            "image/jpeg",

            quality
          );

        };


        img.onerror = () => {

          reject(
            new Error(
              "Unable to read the selected image."
            )
          );

        };


        img.src =
          reader.result;

      };


      reader.onerror = () => {

        reject(
          new Error(
            "Unable to read the image."
          )
        );

      };


      reader.readAsDataURL(
        file
      );

    }
  );

}

/* =========================
   IMAGE PREVIEW
========================= */

let selectedImage =
  null;


productImage.addEventListener(
  "change",
  async () => {

    const file =
      productImage.files?.[0];


    if (!file) {
      return;
    }


    /* =========================
       CHECK IMAGE TYPE
    ========================= */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      showStatus(
        "Please choose an image file.",
        "error"
      );

      productImage.value =
        "";

      return;

    }


    /* =========================
       CHECK ORIGINAL SIZE
    ========================= */

    const maxOriginalSize =
      10 * 1024 * 1024;


    if (
      file.size >
      maxOriginalSize
    ) {

      showStatus(
        "Image is too large. Please choose an image under 10MB.",
        "error"
      );

      productImage.value =
        "";

      return;

    }


    /* =========================
       SHOW COMPRESSING
    ========================= */

    showStatus(
      "Compressing image...",
      "info"
    );


    try {

      /* =========================
         COMPRESS IMAGE
      ========================= */

      const compressedImage =
        await compressImage(
          file,
          1600,
          1600,
          0.80
        );


      /* =========================
         USE COMPRESSED IMAGE
      ========================= */

      selectedImage =
        compressedImage;


      /* =========================
         PREVIEW COMPRESSED IMAGE
      ========================= */

      const objectUrl =
        URL.createObjectURL(
          compressedImage
        );


      imagePreview.src =
        objectUrl;


      imagePreview.classList.remove(
        "hidden"
      );


      imagePlaceholder.classList.add(
        "hidden"
      );


      removeImage.classList.remove(
        "hidden"
      );


      /* =========================
         SHOW RESULT
      ========================= */

      const originalKB =
        Math.round(
          file.size / 1024
        );

      const compressedKB =
        Math.round(
          compressedImage.size / 1024
        );


      showStatus(
        `Image compressed: ${originalKB}KB → ${compressedKB}KB`,
        "success"
      );

    } catch (error) {

      selectedImage =
        null;

      productImage.value =
        "";

      imagePreview.src =
        "";

      imagePreview.classList.add(
        "hidden"
      );

      imagePlaceholder.classList.remove(
        "hidden"
      );

      removeImage.classList.add(
        "hidden"
      );


      showStatus(
        error.message ||
        "Unable to compress image.",
        "error"
      );

    }

  }
);


    /* =========================
       REMOVE IMAGE
    ========================= */

    removeImage.addEventListener(
      "click",
      () => {

        selectedImage =
          null;

        productImage.value =
          "";

        imagePreview.src =
          "";

        imagePreview.classList.add(
          "hidden"
        );

        imagePlaceholder.classList.remove(
          "hidden"
        );

        removeImage.classList.add(
          "hidden"
        );

      }
    );


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

    }


    /* =========================
       VALIDATION
    ========================= */

    function validateForm() {

      if (!userId) {

        showStatus(
          "Please log in before listing an item.",
          "error"
        );

        return false;

      }


      if (
        !titleInput.value.trim()
      ) {

        showStatus(
          "Enter a material title.",
          "error"
        );

        titleInput.focus();

        return false;

      }


      if (
        !categoryInput.value
      ) {

        showStatus(
          "Select a category.",
          "error"
        );

        categoryInput.focus();

        return false;

      }


      if (
        !descriptionInput.value.trim()
      ) {

        showStatus(
          "Add a description for your material.",
          "error"
        );

        descriptionInput.focus();

        return false;

      }


      if (
        !universityInput.value.trim()
      ) {

        showStatus(
          "Enter the university.",
          "error"
        );

        universityInput.focus();

        return false;

      }


      if (
        !courseInput.value.trim()
      ) {

        showStatus(
          "Enter the course.",
          "error"
        );

        courseInput.focus();

        return false;

      }


      if (
        !locationInput.value.trim()
      ) {

        showStatus(
          "Enter the location.",
          "error"
        );

        locationInput.focus();

        return false;

      }


      if (
        !conditionInput.value
      ) {

        showStatus(
          "Select the condition.",
          "error"
        );

        conditionInput.focus();

        return false;

      }


      const price =
        Number(
          priceInput.value
        );


      if (
        !freeItem.checked &&
        (
          !Number.isFinite(price) ||
          price < 0
        )
      ) {

        showStatus(
          "Enter a valid FCoins price or choose Free.",
          "error"
        );

        priceInput.focus();

        return false;

      }


      return true;

    }


    /* =========================
       LIST ITEM
    ========================= */

    listItemBtn.addEventListener(
      "click",
      async () => {

        if (
          !validateForm()
        ) {
          return;
        }


        const price =
          freeItem.checked
            ? 0
            : Math.floor(
                Number(
                  priceInput.value
                )
              );


        listItemBtn.disabled =
          true;

        listItemBtn.textContent =
          "Listing Item...";


        showStatus(
          "Sending your material to FMarket...",
          "info"
        );


        try {

          /*
           * Build request
           */

          const formData =
  new FormData();


formData.append(
  "userId",
  userId
);

formData.append(
  "title",
  titleInput.value.trim()
);

formData.append(
  "description",
  descriptionInput.value.trim()
);

formData.append(
  "category",
  categoryInput.value
);

formData.append(
  "course",
  courseInput.value.trim()
);

formData.append(
  "university",
  universityInput.value.trim()
);

formData.append(
  "department",
  departmentInput.value.trim()
);

formData.append(
  "price",
  String(price)
);

formData.append(
  "location",
  locationInput.value.trim()
);

formData.append(
  "condition",
  conditionInput.value
);

formData.append(
  "source",
  selectedNote
    ? "fstudy_note"
    : "manual"
);


/*
 * Send the selected image.
 */

if (selectedImage) {

  formData.append(
    "image",
    selectedImage
  );

}


const response =
  await fetch(
    `${window.CONFIG.API_URL}/fmarket-sell`,
    {
      method: "POST",

      body:
        formData

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
              "Unable to list your item."
            );

          }


          showStatus(
            "Your item has been listed on FMarket successfully.",
            "success"
          );


          /*
           * Go back to FMarket
           * after successful listing.
           */

          setTimeout(
            () => {

              window.location.href =
                "/fmarket";

            },
            800
          );


        } catch (error) {

          showStatus(
            error.message ||
            "Something went wrong while listing your item.",
            "error"
          );


          listItemBtn.disabled =
            false;

          listItemBtn.textContent =
            "List Item";

        }

      }
    );

  }
);