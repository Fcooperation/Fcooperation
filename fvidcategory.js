const categories = [

["🎞️","Animation","animation"],
["🐾","Animals","animals"],
["🎨","Art","art"],
["💄","Beauty","beauty"],
["💼","Business","business"],
["😂","Comedy","comedy"],
["👨‍🍳","Cooking","cooking"],
["🛠️","DIY","diy"],
["📚","Education","education"],
["👗","Fashion","fashion"],
["💰","Finance","finance"],
["💪","Fitness","fitness"],
["🍔","Food","food"],
["🎮","Gaming","gaming"],
["🩺","Health","health"],
["✨","Lifestyle","lifestyle"],
["🚀","Motivation","motivation"],
["🎬","Movies","movies"],
["🎵","Music","music"],
["📰","News","news"],
["📸","Photography","photography"],
["💻","Programming","programming"],
["🔬","Science","science"],
["⚽","Sports","sports"],
["📱","Technology","technology"],
["✈️","Travel","travel"],
["🎓","Tutorial","tutorial"]

];

const grid = document.getElementById("categoryGrid");

const button =
document.getElementById("continueCategory");

const buttonText =
button.querySelector(".btn-text");

const spinner =
button.querySelector(".btn-spinner");

let selected = [];

const allCategories =
  categories.map(c => c[2]);

categories.forEach(c=>{

const item=document.createElement("div");

item.className="category-item";

item.dataset.value=c[2];

item.innerHTML=`

<div class="emoji">${c[0]}</div>

<div class="text">${c[1]}</div>

`;

item.onclick=()=>{

const value=item.dataset.value;

if(selected.includes(value)){

selected=
selected.filter(v=>v!==value);

item.classList.remove("active");

}else{

selected.push(value);

item.classList.add("active");

}

buttonText.textContent =
selected.length
?`Continue (${selected.length})`
:"Continue Anyway";

};

grid.appendChild(item);

});

button.onclick = async () => {

  const account =
    JSON.parse(localStorage.getItem("faccount")) || {};

  const userId =
    account.userId || account.id;

  const category = [...selected];

  // Show loading
  button.classList.add("loading");

  try {

    if (userId) {

  // Only save to backend if user selected categories
  if (category.length > 0) {

    const res = await fetch(
      "https://fweb-backend.onrender.com/fvidscategory",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          category
        })
      }
    );

    if (!res.ok) {
      throw new Error("Request failed");
    }

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Failed");
    }

  }

  localStorage.setItem(
    `fvid_category_selected_${userId}`,
    "true"
  );

} else {

      localStorage.setItem(
  "fvid_category",
  JSON.stringify(
    category.length
      ? category
      : allCategories
  )
);

      localStorage.setItem(
        "fvid_category_selected",
        "true"
      );

    }

    // Redirect ONLY after success
    window.location.replace("fvids.html");

  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "Couldn't save your categories. Please try again."
    );

    // Re-enable button
    button.classList.remove("loading");

  }

};