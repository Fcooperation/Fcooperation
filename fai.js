document.addEventListener("DOMContentLoaded", () => {

const STORAGE_KEY = "fai_chat";

const chatBox =
document.getElementById("chat-box");

const promptInput =
document.getElementById("prompt");

const sendBtn =
document.getElementById("send-btn");

const clearBtn =
document.getElementById("clear-btn");

const newChatBtn =
document.getElementById("new-chat-btn");

const plusBtn =
document.getElementById("plus-btn");

const uploadMenu =
document.getElementById("upload-menu");

const generateImageBtn =
document.getElementById("generate-image-btn");

const imageGenerationMode =
document.getElementById("image-generation-mode");

const imageGenerationPrompt =
document.getElementById("image-generation-prompt");

const cancelImageGeneration =
document.getElementById("cancel-image-generation");

const imageEditUploadBtn =
document.getElementById("image-edit-upload-btn");

const photosBtn =
document.getElementById("photos-btn");

const filesBtn =
document.getElementById("files-btn");

const photosInput =
document.getElementById("photos-input");

const filesInput =
document.getElementById("files-input");

const imagePreview =
document.getElementById("image-preview");

const account =
  JSON.parse(localStorage.getItem("faccount")) || {};
  
  const renderer = new marked.Renderer();

renderer.code = function(token) {

  const code = token.text || "";

  const language = token.lang || "";

  const lang =
    language
      ? ` class="language-${escapeHtml(language)}"`
      : "";

  return `
    <pre>
      <code${lang}>${escapeHtml(code)}</code>
    </pre>
  `;
};

function escapeHtml(text) {

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let isSending = false;
let selectedFile = null;

let imageGenerationModeActive = false;

  function autoResize() {
  promptInput.style.height = "auto";
  promptInput.style.height = promptInput.scrollHeight + "px";
  }
  
  promptInput.addEventListener("input", autoResize);

if (imageGenerationPrompt) {

  imageGenerationPrompt.addEventListener(
    "input",
    () => {

      imageGenerationPrompt.style.height =
        "auto";

      imageGenerationPrompt.style.height =
        imageGenerationPrompt.scrollHeight +
        "px";

    }
  );

}

let messages =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || [];

// Update Inout mode
function updateInputMode() {

  if (!promptInput) return;

  if (imageGenerationModeActive) {

    promptInput.style.display = "none";

  } else {

    promptInput.style.display = "";

  }

}

/* ---------- IMAGE GENERATION MODE ---------- */

function enterImageGenerationMode() {

  imageGenerationModeActive = true;

  if (imageGenerationMode) {
    imageGenerationMode.classList.add("active");
  }

  updateInputMode();

  if (imageGenerationPrompt) {
    imageGenerationPrompt.value = "";
    imageGenerationPrompt.focus();
  }

  if (uploadMenu) {
    uploadMenu.classList.remove("show");
  }
}


function exitImageGenerationMode() {

  imageGenerationModeActive = false;

  if (imageGenerationMode) {
    imageGenerationMode.classList.remove("active");
  }
  
updateInputMode();

  if (imageGenerationPrompt) {
  imageGenerationPrompt.value = "";
}

  /*
    If the user cancels image generation,
    remove any image they selected for editing.
  */

  selectedFile = null;

  if (photosInput) {
    photosInput.value = "";
  }

  if (filesInput) {
    filesInput.value = "";
  }

  if (imagePreview) {
    imagePreview.innerHTML = "";
    imagePreview.classList.remove("show");
  }
}

/* ---------- RELOAD AI RESPONSE ---------- */

async function reloadAIResponse(msg) {

  if (isSending) return;

  if (!msg.retryPrompt) {
    return;
  }

  const index =
    messages.indexOf(msg);

  if (index === -1) {
    return;
  }

  isSending = true;

  /* Change this message back to loading */

  msg.text = "";
msg.status = "streaming";

renderMessages();
saveMessages();

  try {

    const account =
      JSON.parse(
        localStorage.getItem("faccount")
      ) || {};

    const userId =
      account?.userId ||
      account?.id ||
      "guest";

    const formData =
      new FormData();

    formData.append(
      "userId",
      userId
    );

    formData.append(
      "prompt",
      msg.retryPrompt
    );

    formData.append(
      "messages",
      JSON.stringify(
        messages
  .filter(m => m !== msg)
  .slice(-7)
  .map(m => ({
    role: m.role,
    text: m.text || ""
  }))
      )
    );

    const res =
      await fetch(
        "https://fweb-backend.onrender.com/fai",
        {
          method: "POST",
          body: formData
        }
      );

    if (!res.ok) {

      const errorText =
        await res.text();

      throw new Error(
        errorText ||
        `HTTP ${res.status}`
      );

    }

    if (!res.body) {
      throw new Error(
        "FAI returned no response body."
      );
    }

    const reader =
      res.body.getReader();

    const decoder =
      new TextDecoder();

    let buffer = "";
    let aiText = "";

    let streamCompleted = false;

    while (true) {

      const {
        value,
        done
      } = await reader.read();

      if (done) {

        if (!streamCompleted) {

          streamCompleted = true;

          removeTyping();

          msg.text =
            aiText;

          msg.status =
            "complete";

          renderMessages();
          saveMessages();

        }

        break;
      }

      buffer +=
        decoder.decode(
          value,
          {
            stream: true
          }
        );

      const lines =
        buffer.split("\n");

      buffer =
        lines.pop() || "";

      for (const line of lines) {

        if (!line.startsWith("data:")) {
          continue;
        }

        const jsonText =
          line
            .replace(/^data:\s*/, "")
            .trim();

        if (!jsonText) continue;

        try {

          const event =
            JSON.parse(jsonText);

          /* ---------- CHUNK ---------- */

          if (
            event.type === "chunk"
          ) {

            if (aiText === "") {
              removeTyping();
            }

            aiText +=
              event.text || "";

            msg.text =
              aiText;

            msg.status =
              "streaming";

            renderMessages();

          }

          /* ---------- ERROR ---------- */

          if (
            event.type === "error"
          ) {

            removeTyping();

            msg.text =
              event.message ||
              "FAI failed to generate a response.";

            msg.status =
              "complete";

            renderMessages();
            saveMessages();

            streamCompleted = true;

          }

          /* ---------- DONE ---------- */

          if (
            event.type === "done"
          ) {

            removeTyping();

            msg.text =
              aiText;

            msg.status =
              "complete";

            renderMessages();
            saveMessages();

            streamCompleted = true;

          }

        } catch (err) {

          console.error(
            "Reload stream parsing error:",
            err
          );

        }

      }

    }

  } catch (err) {

    removeTyping();

    console.error(
      "❌ FAI RELOAD ERROR:",
      err
    );

    msg.text =
      "Couldn't reload this response.";

    msg.status =
      "complete";

    renderMessages();
    saveMessages();

  } finally {

    isSending = false;

  }

}

/* ---------- RENDER ---------- */

function renderMessages() {

  if (!chatBox) return;

  chatBox.innerHTML = "";

  messages.forEach(msg => {

    const div =
      document.createElement("div");

    div.className =
      `message ${msg.role}`;

    /* ------------------------------
       USER ATTACHMENT
    ------------------------------ */

    if (
      msg.role === "user" &&
      msg.attachment
    ) {

      const attachment =
        document.createElement("div");

      attachment.className =
        "sent-attachment";

      if (
        msg.attachment.type === "image" &&
        msg.attachment.data
      ) {

        const img =
          document.createElement("img");

        img.src =
          msg.attachment.data;

        img.alt =
          msg.attachment.name ||
          "Attached image";

        img.className =
          "sent-image";

        attachment.appendChild(img);

      } else {

        const fileCard =
          document.createElement("div");

        fileCard.className =
          "sent-file";

        const fileIcon =
          document.createElement("div");

        fileIcon.className =
          "sent-file-icon";

        fileIcon.textContent =
          "FILE";

        const fileName =
          document.createElement("div");

        fileName.className =
          "sent-file-name";

        fileName.textContent =
          msg.attachment.name ||
          "Attached file";

        fileCard.appendChild(fileIcon);
        fileCard.appendChild(fileName);

        attachment.appendChild(fileCard);
      }

      div.appendChild(attachment);

      if (msg.text) {

        const text =
          document.createElement("div");

        text.className =
          "sent-text";

        text.innerHTML =
          marked.parse(
            msg.text || "",
            {
              html: false
            }
          );

        div.appendChild(text);
      }

    }

    /* ------------------------------
       AI GENERATED IMAGE
    ------------------------------ */

    else if (
      msg.role === "ai" &&
      msg.image
    ) {

      const img =
        document.createElement("img");

      img.src =
        msg.image;

      img.alt =
        "AI generated image";

      img.className =
        "generated-image";

      div.appendChild(img);

      if (msg.text) {

        const text =
          document.createElement("div");

        text.className =
          "generated-text";

        text.innerHTML =
          marked.parse(
            msg.text || "",
            {
              html: false
            }
          );

        div.appendChild(text);
      }

    }

    /* ------------------------------
       NORMAL MESSAGE
    ------------------------------ */

    else {

      div.innerHTML =
  marked.parse(
    msg.text || "",
    {
      html: false,
      renderer
    }
  );

/* --------------------------------
   WRAP INLINE IMAGES
-------------------------------- */

const messageImages =
  div.querySelectorAll("img");

messageImages.forEach(img => {

  /* Don't interfere with special images */
  if (
    img.classList.contains("sent-image") ||
    img.classList.contains("generated-image")
  ) {
    return;
  }

  const box =
    document.createElement("div");

  box.className =
    "message-image-box";

  img.parentNode.insertBefore(
    box,
    img
  );

  box.appendChild(img);

  /* --------------------------------
     HANDLE FAILED IMAGES
  -------------------------------- */

  img.addEventListener("error", () => {

  console.log(
    "❌ IMAGE FAILED:",
    img.src
  );

  box.classList.add(
    "image-load-failed"
  );

  box.innerHTML = `
    <div class="image-failed">
      <span>🖼️</span>
      <div>Image couldn't load</div>
    </div>
  `;

});

  /* --------------------------------
     SUCCESSFUL IMAGE
  -------------------------------- */

  img.addEventListener("load", () => {

    box.classList.add(
      "image-loaded"
    );

  });

});

      /* ------------------------------
         AI RESPONSE STATUS
      ------------------------------ */

      if (msg.role === "ai") {

        /* ------------------------------
           STILL GENERATING
        ------------------------------ */

        if (msg.status === "streaming") {

          const loadingBtn =
            document.createElement("button");

          loadingBtn.className =
            "response-loading-btn";

          loadingBtn.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
          `;

          loadingBtn.disabled = true;

          div.appendChild(
            loadingBtn
          );
        }

        /* ------------------------------
           RESPONSE COMPLETE
        ------------------------------ */

        else if (
          msg.status === "complete" &&
          msg.text
        ) {

          const actions =
            document.createElement("div");

          actions.className =
            "response-actions";

          /* ------------------------------
             COPY BUTTON
          ------------------------------ */

          const copyBtn =
            document.createElement("button");

          copyBtn.className =
            "response-copy-btn";

          copyBtn.textContent =
            "Copy";

          copyBtn.onclick = async () => {

            try {

              await navigator.clipboard.writeText(
                msg.text
              );

              copyBtn.textContent =
                "Copied";

              setTimeout(() => {

                copyBtn.textContent =
                  "Copy";

              }, 1500);

            } catch (err) {

              copyBtn.textContent =
                "Failed";

              setTimeout(() => {

                copyBtn.textContent =
                  "Copy";

              }, 1500);
            }
          };

          /* ------------------------------
             RELOAD BUTTON
          ------------------------------ */

          const reloadBtn =
            document.createElement("button");

          reloadBtn.className =
            "response-reload-btn";

          reloadBtn.textContent =
            "Reload";

          reloadBtn.onclick = () => {

            reloadAIResponse(msg);

          };

          actions.appendChild(
            copyBtn
          );

          actions.appendChild(
            reloadBtn
          );

          div.appendChild(
            actions
          );
        }
      }
    }

    chatBox.appendChild(div);

  });

  setupCodeBlocks(chatBox);

  chatBox.scrollTop =
    chatBox.scrollHeight;
}

/* ---------- SAVE ---------- */

function saveMessages() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(messages)
  );

}

// three dot typing 
function showTyping() {

  const typing =
  document.createElement("div");

  typing.className =
  "message ai";

  typing.id =
  "typing-indicator";

  typing.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  chatBox.appendChild(typing);

  chatBox.scrollTop =
  chatBox.scrollHeight;
}

function removeTyping() {

  const typing =
  document.getElementById(
    "typing-indicator"
  );

  if (typing) {
    typing.remove();
  }

}

/* ---------- UPLOAD MENU ---------- */

if (plusBtn && uploadMenu) {

  plusBtn.onclick = () => {

    uploadMenu.classList.toggle("show");

  };

}

/* ---------- GENERATE IMAGE BUTTON ---------- */

if (generateImageBtn) {

  generateImageBtn.onclick = () => {

    enterImageGenerationMode();

  };

}


/* ---------- CANCEL IMAGE GENERATION ---------- */

if (cancelImageGeneration) {

  cancelImageGeneration.onclick = () => {

    exitImageGenerationMode();

  };

}

/* ---------- IMAGE EDIT UPLOAD ---------- */

if (imageEditUploadBtn) {

  imageEditUploadBtn.onclick = () => {

    if (photosInput) {
      photosInput.click();
    }

  };

}

document.addEventListener("click", e => {

  if (
    uploadMenu &&
    plusBtn &&
    !uploadMenu.contains(e.target) &&
    !plusBtn.contains(e.target)
  ) {

    uploadMenu.classList.remove("show");

  }

});

/* ---------- IMAGE PICKER ---------- */

if (photosBtn && photosInput) {

  photosBtn.onclick = () => {

    photosInput.click();

    uploadMenu.classList.remove("show");

  };

}

if (filesBtn && filesInput) {

  filesBtn.onclick = () => {

    filesInput.click();

    uploadMenu.classList.remove("show");

  };

}

/* ---------- PREVIEW ---------- */

function showFilePreview(file) {

  if (!file || !imagePreview) return;

  const isImage =
    file.type.startsWith("image/");

  if (isImage) {

    const reader =
      new FileReader();

    reader.onload = e => {

      imagePreview.innerHTML = `
        <div class="preview-content">

          <img
            src="${e.target.result}"
            alt="Selected image"
          >

          <button
            type="button"
            class="preview-cancel"
            id="preview-cancel"
          >
            ×
          </button>

        </div>
      `;

      imagePreview.classList.add("show");

      setupPreviewCancel();

    };

    reader.readAsDataURL(file);

  } else {

    imagePreview.innerHTML = `
      <div class="preview-content file-preview">

        <div class="file-box">
          FILE
        </div>

        <div class="file-name">
          ${file.name}
        </div>

        <button
          type="button"
          class="preview-cancel"
          id="preview-cancel"
        >
          ×
        </button>

      </div>
    `;

    imagePreview.classList.add("show");

    setupPreviewCancel();

  }

}

function setupPreviewCancel() {

  const cancelBtn =
    document.getElementById("preview-cancel");

  if (!cancelBtn) return;

  cancelBtn.onclick = () => {

  imagePreview.innerHTML = "";

  imagePreview.classList.remove("show");

  selectedFile = null;

  if (photosInput) {
    photosInput.value = "";
  }

  if (filesInput) {
    filesInput.value = "";
  }

};

}

if (photosInput) {

  photosInput.addEventListener("change", () => {

    const file =
      photosInput.files[0];

    if (!file) return;

    selectedFile = file;

    showFilePreview(file);

  });

}

if (filesInput) {

  filesInput.addEventListener("change", () => {

    const file = filesInput.files[0];

    if (file) {

      selectedFile = file;

      showFilePreview(file);

    }

  });

}

/* ---------- IMAGE COMPRESSION ---------- */

async function compressImage(
  file,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.75
) {

  // Only compress images
  if (
    !file ||
    !file.type ||
    !file.type.startsWith("image/")
  ) {
    return file;
  }

  return new Promise((resolve, reject) => {

    const img =
      new Image();

    const url =
      URL.createObjectURL(file);

    img.onload = () => {

      URL.revokeObjectURL(url);

      let width =
        img.width;

      let height =
        img.height;

      // Keep original aspect ratio
      if (
        width > maxWidth ||
        height > maxHeight
      ) {

        const scale =
          Math.min(
            maxWidth / width,
            maxHeight / height
          );

        width =
          Math.round(
            width * scale
          );

        height =
          Math.round(
            height * scale
          );

      }

      const canvas =
        document.createElement(
          "canvas"
        );

      canvas.width =
        width;

      canvas.height =
        height;

      const ctx =
        canvas.getContext("2d");

      ctx.drawImage(
        img,
        0,
        0,
        width,
        height
      );

      canvas.toBlob(
        blob => {

          if (!blob) {

            reject(
              new Error(
                "Image compression failed."
              )
            );

            return;
          }

          const compressedFile =
            new File(
              [blob],
              "compressed-image.jpg",
              {
                type: "image/jpeg",
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

      URL.revokeObjectURL(url);

      reject(
        new Error(
          "Could not load image for compression."
        )
      );

    };

    img.src = url;

  });

}

/* ---------- RETRY PENDING REQUEST ---------- */

async function retryPendingMessage(msg) {

  if (isSending) return;

  if (!msg.retryPrompt) return;

  /* Remove the old failed AI message */

  const index =
    messages.indexOf(msg);

  if (index !== -1) {
    messages.splice(index, 1);
  }

  renderMessages();
  saveMessages();

  /* Put the original prompt back into the input */

  promptInput.value =
    msg.retryPrompt;

  autoResize();

  /* Send it again */

  await sendPrompt();

}

/* ---------- CODE COPY BUTTONS ---------- */

function setupCodeBlocks(container) {

  const codeBlocks =
    container.querySelectorAll("pre");

  codeBlocks.forEach(pre => {

    /* Prevent duplicate buttons */

    if (
      pre.querySelector(".code-copy-btn")
    ) {
      return;
    }

    const button =
      document.createElement("button");

    button.className =
      "code-copy-btn";

    button.textContent =
      "Copy";

    button.onclick = async () => {

      const code =
        pre.querySelector("code");

      if (!code) return;

      try {

        await navigator.clipboard.writeText(
          code.innerText
        );

        button.textContent =
          "Copied";

        setTimeout(() => {

          button.textContent =
            "Copy";

        }, 1500);

      } catch (err) {

        button.textContent =
          "Failed";

        setTimeout(() => {

          button.textContent =
            "Copy";

        }, 1500);

      }

    };

    pre.appendChild(button);

  });

}

/* ==========================================
   IMAGE GENERATION REQUEST
========================================== */

async function sendImageGenerationRequest(
  prompt,
  file
) {

  if (isSending) return;

  if (!prompt && !file) {
    return;
  }

  isSending = true;

  /*
    -----------------------------------------
    SHOW USER MESSAGE
    -----------------------------------------
  */

  let attachment = null;

  if (file) {

    const isImage =
      file.type &&
      file.type.startsWith("image/");

    attachment = {
      type: isImage ? "image" : "file",
      name:
        file.name ||
        "Attached image"
    };

    /*
      Create local preview
      so the user sees the image
      they are asking FAI2 to edit.
    */

    if (isImage) {

      try {

        const imageData =
          await new Promise(
            (resolve, reject) => {

              const reader =
                new FileReader();

              reader.onload = () => {
                resolve(
                  reader.result
                );
              };

              reader.onerror = () => {
                reject(
                  new Error(
                    "Could not read image"
                  )
                );
              };

              reader.readAsDataURL(
                file
              );

            }
          );

        attachment.data =
          imageData;

      } catch (err) {

        console.error(
          "Image preview error:",
          err
        );

        attachment.data = null;

      }

    }

  }

  messages.push({
    role: "user",
    text: prompt,
    attachment,
    imageGeneration: true
  });

  renderMessages();
  saveMessages();

  /*
    -----------------------------------------
    CLEAR INPUT
    -----------------------------------------
  */

  promptInput.value = "";
  promptInput.style.height = "auto";

  /*
    -----------------------------------------
    ACCOUNT
    -----------------------------------------
  */

  const account =
    JSON.parse(
      localStorage.getItem(
        "faccount"
      )
    ) || {};

  const userId =
    account?.userId ||
    account?.id ||
    "guest";

  /*
    -----------------------------------------
    FORM DATA
    -----------------------------------------
  */

  const formData =
    new FormData();

  formData.append(
    "userId",
    userId
  );

  formData.append(
    "prompt",
    prompt
  );

  /*
    -----------------------------------------
    ATTACHED IMAGE
    -----------------------------------------
  */

  if (file) {

    let uploadFile = file;

    /*
      Compress image before sending.
    */

    if (
      file.type &&
      file.type.startsWith(
        "image/"
      )
    ) {

      uploadFile =
        await compressImage(file);

    }

    formData.append(
      "file",
      uploadFile,
      uploadFile.name ||
      "image.jpg"
    );

  }

  /*
    -----------------------------------------
    SHOW TYPING
    -----------------------------------------
  */

  showTyping();

  /*
    -----------------------------------------
    SEND TO FAI2
    -----------------------------------------
  */

  try {

    const res =
      await fetch(
        "https://fweb-backend.onrender.com/fai-generate-image",
        {
          method: "POST",
          body: formData
        }
      );

    if (!res.ok) {

      const errorText =
        await res.text();

      throw new Error(
        errorText ||
        `HTTP ${res.status}`
      );

    }

    /*
      IMPORTANT:
      We will handle the exact response
      from fai2.js here once we define
      its response format.
    */

    const contentType =
      res.headers.get(
        "content-type"
      ) || "";

    /*
      -------------------------------------
      JSON RESPONSE
      -------------------------------------
    */

    if (
      contentType.includes(
        "application/json"
      )
    ) {

      const data =
        await res.json();

      removeTyping();

      /*
        Expected structure can be:

        {
          success: true,
          image: "https://...",
          answer: "..."
        }
      */

      if (
        data.success === false
      ) {

        throw new Error(
          data.message ||
          "Image generation failed."
        );

      }

      messages.push({

        role: "ai",

        text:
          data.answer ||
          "",

        image:
          data.image ||
          null,

        status:
          "complete",

        imageGeneration:
          true

      });

      renderMessages();
      saveMessages();

    }

    /*
      -------------------------------------
      SSE RESPONSE
      -------------------------------------
    */

    else {

      /*
        If fai2.js eventually streams its
        response using SSE, this gives us
        a place to support it.

        For now we read the response as text.
      */

      const text =
        await res.text();

      removeTyping();

      let imageUrl = null;
      let answer = "";

      /*
        Try to detect JSON if the endpoint
        returns it as text.
      */

      try {

        const data =
          JSON.parse(text);

        imageUrl =
          data.image ||
          data.imageUrl ||
          null;

        answer =
          data.answer ||
          data.message ||
          "";

      } catch {

        answer = text;

      }

      messages.push({

        role: "ai",

        text: answer,

        image: imageUrl,

        status: "complete",

        imageGeneration: true

      });

      renderMessages();
      saveMessages();

    }

  } catch (err) {

    console.error(
      "❌ IMAGE GENERATION ERROR:",
      err
    );

    removeTyping();

    messages.push({

      role: "ai",

      text:
        "Couldn't generate the image. Please try again.",

      status: "complete",

      imageGeneration: true

    });

    renderMessages();
    saveMessages();

  } finally {

    /*
      Clear image-generation state
      after the request.
    */

    selectedFile = null;

    if (photosInput) {
      photosInput.value = "";
    }

    if (filesInput) {
      filesInput.value = "";
    }

    if (imagePreview) {

      imagePreview.innerHTML = "";

      imagePreview.classList.remove(
        "show"
      );

    }

    /*
      Return to normal FAI mode.
    */

    exitImageGenerationMode();

    isSending = false;

  }

}

/* ---------- SEND ---------- */

async function sendPrompt() {

  if (isSending) return;

  const prompt =
  imageGenerationModeActive
    ? imageGenerationPrompt.value.trim()
    : promptInput.value.trim();

const file =
  selectedFile;

  /*
    IMAGE GENERATION MODE
    ---------------------
    If the user activated Generate Image,
    do NOT send the request to /fai.

    Send it to /fai-generate-image instead.
  */

  if (imageGenerationModeActive) {

    await sendImageGenerationRequest(
      prompt,
      file
    );

    return;
  }

  if (!prompt && !file) {
    return;
  }

  isSending = true;

  /* --------------------------------
     SHOW USER MESSAGE FIRST
  -------------------------------- */

  let attachment = null;

  if (file) {

    const isImage =
      file.type &&
      file.type.startsWith("image/");

    attachment = {
      type: isImage ? "image" : "file",
      name: file.name || "Attached file"
    };

    /*
      We only create the local preview
      here. The actual File object is
      still kept in `file` for FormData.
    */

    if (isImage) {

      try {

        const imageData =
          await new Promise((resolve, reject) => {

            const reader =
              new FileReader();

            reader.onload = () => {
              resolve(reader.result);
            };

            reader.onerror = () => {
              reject(
                new Error("Could not read camera image")
              );
            };

            reader.onabort = () => {
              reject(
                new Error("Camera image reading was aborted")
              );
            };

            reader.readAsDataURL(file);

          });

        attachment.data = imageData;

      } catch (err) {

        console.error(
          "❌ Attachment preview error:",
          err
        );

        /*
          Don't stop the request just because
          local preview conversion failed.
        */

        attachment.data = null;

      }

    }

  }

  messages.push({
    role: "user",
    text: prompt,
    attachment
  });

  renderMessages();
  saveMessages();

  /* --------------------------------
     CLEAR INPUT
  -------------------------------- */

  promptInput.value = "";
  promptInput.style.height = "auto";

  /*
    IMPORTANT:
    Show typing BEFORE doing anything else.
  */

  try {

    /* --------------------------------
       ACCOUNT
    -------------------------------- */

    const account =
      JSON.parse(
        localStorage.getItem("faccount")
      ) || {};

    const userId =
      account?.userId ||
      account?.id ||
      "guest";

    /* --------------------------------
       CHAT CONTEXT
    -------------------------------- */

    const contextMessages =
  messages
    .slice(-7)
    .map(msg => {

      const cleanMsg = {
        role: msg.role,
        text: msg.text || ""
      };

      /*
        Never send generated images,
        attachments, base64 data, or
        other frontend-only data to FAI.
      */

      return cleanMsg;

    });

    const newChatMode =
      localStorage.getItem(
        "fai_new_chat"
      ) === "true";

    /* --------------------------------
       FORMDATA
    -------------------------------- */

    const formData =
      new FormData();

    formData.append(
      "userId",
      userId
    );

    formData.append(
      "prompt",
      prompt
    );

    formData.append(
      "messages",
      JSON.stringify(
        newChatMode
          ? []
          : contextMessages
      )
    );

/* --------------------------------
   ATTACH FILE
-------------------------------- */

if (file) {

  console.log(
    "📤 Original file:",
    {
      name: file.name,
      type: file.type,
      size: file.size
    }
  );

  let uploadFile = file;

  // Compress images before sending
  if (
    file.type &&
    file.type.startsWith("image/")
  ) {

    uploadFile =
      await compressImage(file);

    console.log(
      "🗜️ Compressed image:",
      {
        name: uploadFile.name,
        type: uploadFile.type,
        size: uploadFile.size
      }
    );

  }

  formData.append(
    "file",
    uploadFile,
    uploadFile.name ||
    "image.jpg"
  );

}

showTyping();
    /* --------------------------------
       SEND REQUEST
    -------------------------------- */

    console.log(
      "🚀 Sending FAI request..."
    );

    const res =
      await fetch(
        "https://fweb-backend.onrender.com/fai",
        {
          method: "POST",
          body: formData
        }
      );

    console.log(
      "📥 FAI response:",
      res.status,
      res.statusText
    );

    if (!res.ok) {

      const errorText =
        await res.text();

      throw new Error(
        errorText ||
        `HTTP ${res.status}`
      );

    }

    if (!res.body) {
      throw new Error(
        "FAI returned no response body."
      );
    }

    /* --------------------------------
       READ SSE
    -------------------------------- */

    const reader =
      res.body.getReader();

    const decoder =
      new TextDecoder();

    let aiText = "";
    let buffer = "";

    /* --------------------------------
       CREATE AI MESSAGE
    -------------------------------- */

    messages.push({
  role: "ai",
  text: "",
  status: "streaming",
  retryPrompt: prompt
});

const aiMessage =
  messages[messages.length - 1];

    /* --------------------------------
       STREAM
    -------------------------------- */

    let streamCompleted = false;

while (true) {

  const {
    value,
    done
  } = await reader.read();

  /* --------------------------------
     STREAM CLOSED
  -------------------------------- */

  if (done) {

    if (!streamCompleted) {

      streamCompleted = true;

      removeTyping();

      aiMessage.status =
        "complete";

      renderMessages();

      saveMessages();

    }

    break;
  }

  buffer +=
    decoder.decode(
      value,
      {
        stream: true
      }
    );

  const lines =
    buffer.split("\n");

  buffer =
    lines.pop() || "";

  for (const line of lines) {

    if (
      !line.startsWith("data:")
    ) {
      continue;
    }

    const jsonText =
      line
        .replace(
          /^data:\s*/,
          ""
        )
        .trim();

    if (!jsonText) continue;

    try {

      const event =
        JSON.parse(
          jsonText
        );

      /* ------------------------------
         AI CHUNK
      ------------------------------ */

      if (
        event.type === "chunk"
      ) {

        if (aiText === "") {
          removeTyping();
        }

        aiText +=
          event.text;

        aiMessage.text =
          aiText;

        aiMessage.status =
          "streaming";

        renderMessages();

      }

      /* ------------------------------
         AI ERROR
      ------------------------------ */

      if (
        event.type === "error"
      ) {

        removeTyping();

        aiMessage.text =
          event.message ||
          "FAI failed to respond.";

        aiMessage.status =
          "complete";

        renderMessages();

        saveMessages();

        streamCompleted = true;

      }

      /* ------------------------------
         DONE
      ------------------------------ */

      if (
        event.type === "done"
      ) {

        removeTyping();

        aiMessage.status =
          "complete";

        renderMessages();

        saveMessages();

        streamCompleted = true;

      }

    } catch (err) {

      console.error(
        "❌ Stream parsing error:",
        err
      );

    }

  }

}

    /* --------------------------------
       CLEAR ATTACHMENT
    -------------------------------- */

    selectedFile = null;

    if (photosInput) {
      photosInput.value = "";
    }

    if (filesInput) {
      filesInput.value = "";
    }

    if (imagePreview) {

      imagePreview.innerHTML = "";

      imagePreview.classList.remove(
        "show"
      );

    }

    saveMessages();

  } catch (err) {

    console.error(
      "❌ FAI SEND ERROR:",
      err
    );

    removeTyping();

    messages.push({
  role: "ai",
  text:
  "Couldn't get a response.",
  pending: true,
  retryPrompt: prompt
});

    renderMessages();
    saveMessages();

  } finally {

    isSending = false;

  }

}

/* ---------- BUTTONS ---------- */

if (sendBtn) {

  sendBtn.onclick =
  sendPrompt;

}

if (promptInput) {
  promptInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {
  return;
}

  });
}

if (clearBtn) {

  clearBtn.onclick = () => {

    if (
      confirm(
        "Delete chat history?"
      )
    ) {

      localStorage.removeItem(
        STORAGE_KEY
      );

      messages = [];

      renderMessages();

    }

  };

}

if (newChatBtn) {

  newChatBtn.onclick = () => {

  localStorage.setItem("fai_new_chat", "true");

  messages = [{
    role: "ai",
    text: "📚 New Study FAI chat started."
  }];

  renderMessages();
  saveMessages();
};

}

// Fai features notice
const notice = document.getElementById("fai-notice");



if (!account) {
  if (notice) {
    notice.classList.remove("hidden");

    setTimeout(() => {
      notice.classList.add("hidden");
    }, 8000);
  }
}

/* ---------- START ---------- */

renderMessages();

/* ---------- AUTO REVIEW CHECK ---------- */

const reviewData = localStorage.getItem("fai_review");

if (reviewData) {

  try {

    const parsed =
      JSON.parse(reviewData);

    if (
      parsed &&
      parsed.review &&
      parsed.review.length
    ) {

   

messages.push({
  role: "user",
  text: "Please explain my quiz answers in a much better and simpler way."
});

renderMessages();
saveMessages();

showTyping();

      const reviewPrompt = `
You are FAI helping a student.

Give short but very clear explanations.

For each question:
- Correct answer
- Why it's correct
- Simple explanation

Quiz Review:
${JSON.stringify(parsed, null, 2)}
`.trim();

fetch(
  "https://fweb-backend.onrender.com/fai",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId:
        account?.userId ||
        account?.id ||
        "guest",

      messages: [],

      prompt: reviewPrompt
    })
  }
)
.then(async res => {

  const reader =
    res.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";
  let aiText = "";

  messages.push({
  role: "ai",
  text: "",
  status: "streaming",
  retryPrompt: `
You are FAI helping a student.

Give short but very clear explanations.

For each question:
- Correct answer
- Why it's correct
- Simple explanation

Quiz Review:
${JSON.stringify(parsed, null, 2)}
  `.trim()
});

  const aiMessage =
    messages[messages.length - 1];

    let reviewStreamCompleted = false;

  while (true) {

    const {
      value,
      done
    } = await reader.read();

    /* --------------------------------
       STREAM CLOSED
    -------------------------------- */

    if (done) {

      if (!reviewStreamCompleted) {

        reviewStreamCompleted = true;

        removeTyping();

        aiMessage.status =
          "complete";

        renderMessages();

        saveMessages();

      }

      break;
    }

    buffer += decoder.decode(
      value,
      { stream: true }
    );

    const lines =
      buffer.split("\n");

    buffer =
      lines.pop() || "";

    for (const line of lines) {

      if (!line.startsWith("data:")) {
        continue;
      }

      const jsonText =
        line
          .replace(/^data:\s*/, "")
          .trim();

      if (!jsonText) continue;

      try {

        const event =
          JSON.parse(jsonText);

        /* ------------------------------
           AI CHUNK
        ------------------------------ */

        if (event.type === "chunk") {

          if (aiText === "") {
            removeTyping();
          }

          aiText +=
            event.text;

          aiMessage.text =
            aiText;

          aiMessage.status =
            "streaming";

          renderMessages();

        }

        /* ------------------------------
           AI ERROR
        ------------------------------ */

        if (event.type === "error") {

          removeTyping();

          aiMessage.text =
            event.message ||
            "FAI failed to generate the review.";

          aiMessage.status =
            "complete";

          renderMessages();

          saveMessages();

          reviewStreamCompleted = true;

        }

        /* ------------------------------
           DONE
        ------------------------------ */

        if (event.type === "done") {

          removeTyping();

          aiMessage.status =
            "complete";

          renderMessages();

          saveMessages();

          reviewStreamCompleted = true;

        }

      } catch (err) {

        console.error(
          "Review stream parsing error:",
          err
        );

      }

    }

  }

  localStorage.removeItem("fai_review");

  saveMessages();

})
.catch(err => {

  removeTyping();

  localStorage.removeItem("fai_review");

  messages.push({
    role: "ai",
    text:
      "Failed to generate review explanation."
  });

  renderMessages();
  saveMessages();

  console.error(err);

});

    }

  } catch (err) {

    console.error(
      "Review parse error:",
      err
    );

  }

}


});