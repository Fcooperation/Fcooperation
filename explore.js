const sections = [
    "trendingList",
    "hashtagsList",
    "categoriesList",
    "creatorsList"
];

sections.forEach(id=>{

    const container =
        document.getElementById(id);

    for(let i=0;i<8;i++){

        const card =
            document.createElement("div");

        card.className="placeholder";

        container.appendChild(card);

    }

});

const pageState = {
    trending: 1,
    hashtags: 1,
    categories: 1,
    creators: 1
};

const loading = {
    trending: false,
    hashtags: false,
    categories: false,
    creators: false
};

const hasMore = {
    trending: true,
    hashtags: true,
    categories: true,
    creators: true
};

const account =
    JSON.parse(
        localStorage.getItem("faccount")
    ) || {};

const userId =
    account.userId || account.id || "";

async function loadExplore(section){

    if(
        loading[section] ||
        !hasMore[section]
    ) return;

    loading[section] = true;

    try{

        const res = await fetch(

`https://fweb-backend.onrender.com/explore?section=${section}&page=${pageState[section]}&userId=${userId}`

        );

        const data = await res.json();

        renderSection(
            section,
            data.items
        );

        hasMore[section] =
            data.hasMore;

        pageState[section]++;

    }

    finally{

        loading[section] = false;

    }

}

function renderSection(section,data){

    switch(section){

        case "trending":

            renderTrending(data);

            break;

        case "hashtags":

            renderHashtags(data);

            break;

        case "categories":

            renderCategories(data);

            break;

        case "creators":

            renderCreators(data);

            break;

    }

}

function renderTrending(videos){

    const container =
        document.getElementById("trendingList");

    // Remove placeholders ONLY after first backend response
    if(pageState.trending === 1){
        container.innerHTML = "";
    }

    videos.forEach(video=>{

        const card =
            document.createElement("div");

        card.className = "trend-card";

        card.innerHTML = `

<img
    class="trend-thumb"
    src="${video.thumbnail_url}"
>

<div class="trend-info">

    <div class="trend-user">
        ${video.username}
    </div>

    <div class="trend-details">
        ${video.details || ""}
    </div>

    <div class="trend-stats">

        <span class="stat">

            <svg viewBox="0 0 24 24" class="stat-icon">
                <path d="M12 5C6.5 5 2 12 2 12s4.5 7 10 7 10-7 10-7-4.5-7-10-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" fill="currentColor"/>
                <circle cx="12" cy="12" r="2.2" fill="currentColor"/>
            </svg>

            ${video.views_count || 0}

        </span>

        <span class="stat">

            <svg viewBox="0 0 24 24" class="stat-icon">
                <path d="M12 21s-7-4.4-9.5-8.1C.3 9.9 2.2 5.5 6.3 5.5c2.2 0 3.5 1.3 4.2 2.4.7-1.1 2-2.4 4.2-2.4 4.1 0 6 4.4 3.8 7.4C19 16.6 12 21 12 21z" fill="currentColor"/>
            </svg>

            ${video.likes_count || 0}

        </span>

    </div>

</div>

`;

        card.onclick=()=>{

            localStorage.setItem(
                "currentlyViewing",
                JSON.stringify(video)
            );

            location.href="fvids.html";

        };

        container.appendChild(card);

    });

}

function renderHashtags(tags){

    const container =
        document.getElementById("hashtagsList");

    if(pageState.hashtags===1){
        container.innerHTML="";
    }

    tags.forEach(tag=>{

        const card =
            document.createElement("div");

        card.className="hashtag-card";

        card.innerHTML = `
<span class="hash">#</span>${tag.name}
`;

        card.onclick=()=>{

            localStorage.setItem(
                "fvidsearchtag",
                tag.name
            );

            location.href="fvidsearch.html";

        };

        container.appendChild(card);

    });

}

function renderCategories(categories){

    const container =
        document.getElementById("categoriesList");

    if(pageState.categories===1){
        container.innerHTML="";
    }

    categories.forEach(category=>{

        const card =
            document.createElement("div");

        card.className="category-card";

        card.innerHTML=`

            <div>

                ${category.name}

            </div>

            <small>

                ${category.count} videos

            </small>

        `;

        card.onclick=()=>{

            localStorage.setItem(
                "fvid_category",
                category.name
            );

            location.href="fvidsearch.html";

        };

        container.appendChild(card);

    });

}


function renderCreators(users){

    const container =
        document.getElementById("creatorsList");

    if(pageState.creators===1){
        container.innerHTML="";
    }

    users.forEach(user=>{

        const card =
            document.createElement("div");

        card.className="creator-card";

        card.innerHTML=`

            <img src="${user.profile_pic}">

            <div>

                ${user.username}

            </div>

            <small>

                ${user.followers} Followers

            </small>

            <small>

                ${user.following} Following

            </small>

        `;

        card.onclick=()=>{

            localStorage.setItem(
                "fvidprofile",
                JSON.stringify(user)
            );

            location.href="fprofile.html";

        };

        container.appendChild(card);

    });

}

loadExplore("trending");

loadExplore("hashtags");

loadExplore("categories");

loadExplore("creators");

const trendingList =
document.getElementById("trendingList");

trendingList.addEventListener("scroll",()=>{

    if(

        trendingList.scrollLeft+
        trendingList.clientWidth>=
        trendingList.scrollWidth-300

    ){

        loadExplore("trending");

    }

});