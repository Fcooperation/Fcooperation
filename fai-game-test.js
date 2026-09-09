const API_URL =
  "https://fweb-backend.onrender.com";


/* =========================================================
   NPC
========================================================= */

const NPC_ID =
  "PUT-MARCUS-UUID-HERE";


/* =========================================================
   PLAYER
========================================================= */

let playerId =
  localStorage.getItem(
    "fai_game_test_player"
  );


if (!playerId) {

  playerId =
    crypto.randomUUID();

  localStorage.setItem(
    "fai_game_test_player",
    playerId
  );

}


/* =========================================================
   ELEMENTS
========================================================= */

const conversation =
  document.getElementById(
    "conversation"
  );

const form =
  document.getElementById(
    "chatForm"
  );

const input =
  document.getElementById(
    "messageInput"
  );

const button =
  document.getElementById(
    "sendButton"
  );


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
  type,
  text
) {

  if (!text) return;

  const element =
    document.createElement(
      "div"
    );

  element.className =
    `message ${type}`;

  element.textContent =
    text;

  conversation.appendChild(
    element
  );

  scrollBottom();
}


/* =========================================================
   ADD ACTION
========================================================= */

function addAction(
  action
) {

  if (!action) return;

  const element =
    document.createElement(
      "div"
    );

  element.className =
    "action";

  element.textContent =
    `[ACTION] ${action.description}`;

  conversation.appendChild(
    element
  );

  scrollBottom();
}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

  const element =
    document.createElement(
      "div"
    );

  element.id =
    "typing";

  element.className =
    "typing";

  element.textContent =
    "Marcus is thinking...";

  conversation.appendChild(
    element
  );

  scrollBottom();
}


function removeTyping() {

  const element =
    document.getElementById(
      "typing"
    );

  if (element) {

    element.remove();

  }

}


/* =========================================================
   SCROLL
========================================================= */

function scrollBottom() {

  conversation.scrollTop =
    conversation.scrollHeight;

}


/* =========================================================
   SEND
========================================================= */

form.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const message =
      input.value.trim();

    if (!message) return;


    addMessage(
      "player",
      message
    );


    input.value = "";

    button.disabled =
      true;

    input.disabled =
      true;


    showTyping();


    try {

      const response =
        await fetch(
          `${API_URL}/fai-game-test`,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                npcId:
                  NPC_ID,

                playerId:
                  playerId,

                message:
                  message

              })

          }
        );


      const data =
        await response.json();


      removeTyping();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "NPC request failed."
        );

      }


      const npcResponse =
        data.response;


      /* -------------------------
         SPEECH
      ------------------------- */

      if (
        npcResponse.speech
      ) {

        addMessage(
          "npc",
          npcResponse.speech
        );

      }


      /* -------------------------
         ACTION
      ------------------------- */

      if (
        npcResponse.action
      ) {

        addAction(
          npcResponse.action
        );

      }


      /* -------------------------
         TOTAL SILENCE
      ------------------------- */

      if (
        !npcResponse.speech &&
        !npcResponse.action
      ) {

        addAction({
          description:
            "Marcus doesn't respond."
        });

      }


    } catch (error) {

      removeTyping();

      addAction({
        description:
          `NPC system error: ${error.message}`
      });

    }


    button.disabled =
      false;

    input.disabled =
      false;

    input.focus();

  }
);