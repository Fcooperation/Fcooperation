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

const account = JSON.parse(localStorage.getItem("faccount"));

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

/* ---------- SEND ---------- */

async function sendPrompt() {

  const prompt =
  promptInput.value.trim();

  if (!prompt) return;
  
  messages.push({
    role: "user",
    text: prompt
  });

  renderMessages();
  saveMessages();

  promptInput.value = "";
  promptInput.style.height = "auto";
  showTyping();

  try {

    const account = JSON.parse(localStorage.getItem("faccount")) || {};

const userId = account?.userId || account?.id || "guest";

// get last 7 messages INCLUDING current user message
const contextMessages = messages.slice(-7);

// detect if new chat mode is active
const newChatMode = localStorage.getItem("fai_new_chat") === "true";

const res = await fetch(
  "https://fweb-backend.onrender.com/fai",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      messages: newChatMode ? [] : contextMessages,
      prompt
    })
  }
);

const reader =
  res.body.getReader();

const decoder =
  new TextDecoder();

let aiText = "";

let buffer = "";

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

      if (
  event.type === "chunk"
) {

  // First chunk has arrived
  if (aiText === "") {
    removeTyping();
  }

  aiText += event.text;

  aiMessage.text =
    aiText;

  renderMessages();

}

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

saveMessages();

  } catch (err) {
    removeTyping();

    messages.push({
      role: "ai",
      text:
      "Failed to connect to FAI."
    });

  }

  renderMessages();
  saveMessages();

}

/* ---------- BUTTONS ---------- */

if (sendBtn) {

  sendBtn.onclick =
  sendPrompt;

}

if (promptInput) {
  promptInput.addEventListener("keydown", e => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
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