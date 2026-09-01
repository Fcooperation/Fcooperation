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
       IMAGE PREVIEW
    ========================= */

    let selectedImage =
      null;

    productImage.addEventListener(
      "change",
      () => {

        const file =
          productImage.files?.[0];


        if (!file) {
          return;
        }


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


        selectedImage =
          file;


        const objectUrl =
          URL.createObjectURL(
            file
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

          const payload = {

            userId:
              userId,

            title:
              titleInput.value.trim(),

            description:
              descriptionInput.value.trim(),

            category:
              categoryInput.value,

            course:
              courseInput.value.trim(),

            university:
              universityInput.value.trim(),

            department:
              departmentInput.value.trim(),

            price:
              price,

            location:
              locationInput.value.trim(),

            condition:
              conditionInput.value,

            /*
             * This identifies a listing
             * created from an FStudy note.
             */

            source:
              selectedNote
                ? "fstudy_note"
                : "manual",

            note:
              selectedNote || null

          };


          const response =
            await fetch(
              `${window.CONFIG.API_URL}/fmarket-sell`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify(
                    payload
                  )

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