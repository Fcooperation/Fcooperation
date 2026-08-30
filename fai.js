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
  
let isSending = false;
let selectedFile = null;

  function autoResize() {
  promptInput.style.height = "auto";
  promptInput.style.height = promptInput.scrollHeight + "px";
  }
  
  promptInput.addEventListener("input", autoResize);

let messages =
JSON.parse(
localStorage.getItem(STORAGE_KEY)
) || [];

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
          marked.parse(msg.text);

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
          marked.parse(msg.text);

        div.appendChild(text);

      }

    }

/* ---------- NORMAL MESSAGE ---------- */

else {

  div.innerHTML =
    marked.parse(msg.text || "");


  /* ---------- AI RESPONSE STATUS ---------- */

  if (
    msg.role === "ai" &&
    msg.text
  ) {

    /* --------------------------------
       STILL GENERATING
    -------------------------------- */

    if (
      msg.status === "streaming"
    ) {

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


    /* --------------------------------
       RESPONSE COMPLETE
    -------------------------------- */

    else if (
      msg.status === "complete"
    ) {

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

      div.appendChild(
        copyBtn
      );

    }

  }


  /* ---------- RETRY BUTTON ---------- */

  if (
    msg.role === "ai" &&
    msg.pending
  ) {

    const retryBtn =
      document.createElement("button");

    retryBtn.className =
      "retry-btn";

    retryBtn.textContent =
      "Retry";

    retryBtn.onclick = () => {

      retryPendingMessage(msg);

    };

    div.appendChild(
      retryBtn
    );

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

    const file = photosInput.files[0];

    if (file) {

      selectedFile = file;

      showFilePreview(file);

    }

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

/* ---------- SEND ---------- */

async function sendPrompt() {

  if (isSending) return;

  const prompt =
    promptInput.value.trim();

  const file =
    selectedFile;

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
      messages.slice(-7);

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
  text: ""
});

const aiMessage =
  messages[messages.length - 1];

    /* --------------------------------
       STREAM
    -------------------------------- */

    while (true) {

      const {
        value,
        done
      } = await reader.read();

      if (done) break;

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

            renderMessages();

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

      prompt: `
You are FAI helping a student.

Give short but very clear explanations.

For each question:
- Correct answer
- Why it's correct
- Simple explanation

Quiz Review:
${JSON.stringify(parsed, null, 2)}
      `.trim()
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
  status: "streaming"
});

  const aiMessage =
    messages[messages.length - 1];

  while (true) {

    const {
      value,
      done
    } = await reader.read();

    if (done) break;

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

        if (event.type === "chunk") {

  if (aiText === "") {
    removeTyping();
  }

  aiText += event.text;

  aiMessage.text =
    aiText;

  renderMessages();
}

        if (event.type === "error") {

  removeTyping();

  aiMessage.text =
    event.message;

  renderMessages();
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