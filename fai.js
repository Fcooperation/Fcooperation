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

const cameraBtn =
document.getElementById("camera-btn");

const photosBtn =
document.getElementById("photos-btn");

const filesBtn =
document.getElementById("files-btn");

const cameraInput =
document.getElementById("camera-input");

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

    div.innerHTML = marked.parse(msg.text);

    chatBox.appendChild(div);

  });

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

if (cameraBtn && cameraInput) {

  cameraBtn.onclick = () => {

    cameraInput.click();

    uploadMenu.classList.remove("show");

  };

}

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

  if (cameraInput) {
    cameraInput.value = "";
  }

  if (photosInput) {
    photosInput.value = "";
  }

  if (filesInput) {
    filesInput.value = "";
  }

};

}


if (cameraInput) {

  cameraInput.addEventListener("change", () => {

    const file = cameraInput.files[0];

    if (file) {

      selectedFile = file;

      showFilePreview(file);

    }

  });

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

  /* ------------------------------
     ADD USER MESSAGE
  ------------------------------ */

  let displayText = "";

if (prompt) {
  displayText = prompt;
}

if (file) {

  if (displayText) {
    displayText += "\n\n";
  }

  displayText += "📎 " + file.name;

}

messages.push({
  role: "user",
  text: displayText
});

  renderMessages();
  saveMessages();

  /* ------------------------------
     CLEAR INPUT
  ------------------------------ */

  promptInput.value = "";
  promptInput.style.height = "auto";

  showTyping();

  try {

    const account =
      JSON.parse(
        localStorage.getItem("faccount")
      ) || {};

    const userId =
      account?.userId ||
      account?.id ||
      "guest";

    /* ------------------------------
       CHAT CONTEXT
    ------------------------------ */

    const contextMessages =
      messages.slice(-7);

    const newChatMode =
      localStorage.getItem(
        "fai_new_chat"
      ) === "true";

    /* ------------------------------
       CREATE FORMDATA
    ------------------------------ */

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

    /* ------------------------------
       ADD FILE
    ------------------------------ */

    if (file) {

      formData.append(
        "file",
        file
      );

    }

    /* ------------------------------
       SEND TO FAI
    ------------------------------ */

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

    /* ------------------------------
       READ SSE STREAM
    ------------------------------ */

    const reader =
      res.body.getReader();

    const decoder =
      new TextDecoder();

    let aiText = "";

    let buffer = "";

    /* ------------------------------
       CREATE AI MESSAGE
    ------------------------------ */

    messages.push({
      role: "ai",
      text: ""
    });

    const aiMessage =
      messages[
        messages.length - 1
      ];

    /* ------------------------------
       READ STREAM
    ------------------------------ */

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
              event.message;

            renderMessages();

          }

        } catch (err) {

          console.error(
            "Stream parsing error:",
            err
          );

        }

      }

    }

    /* ------------------------------
       CLEAR ATTACHMENT
    ------------------------------ */

    selectedFile = null;

if (cameraInput) {
  cameraInput.value = "";
}

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

    /* ------------------------------
       SAVE CHAT
    ------------------------------ */

    saveMessages();

  } catch (err) {

    console.error(err);

    removeTyping();

    messages.push({
      role: "ai",
      text:
        "Failed to connect to FAI."
    });

    renderMessages();
    saveMessages();

  }
isSending = false;
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
    text: ""
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