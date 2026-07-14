const modalOverlay = document.getElementById("modalOverlay");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");

const bookmarkForm = document.getElementById("bookmarkForm");
const titleInput = document.getElementById("titleInput");
const urlInput = document.getElementById("urlInput");

const bookmarkGrid = document.getElementById("bookmarkGrid");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter");

const toast = document.getElementById("toast");

let currentFilter = "all";

let bookmarks = JSON.parse(
    localStorage.getItem("retromark-bookmarks")
) || [];


function saveBookmarks() {
    localStorage.setItem(
        "retromark-bookmarks",
        JSON.stringify(bookmarks)
    );
}


function openBookmarkModal() {
    modalOverlay.classList.add("active");

    setTimeout(() => {
        titleInput.focus();
    }, 300);
}


function closeBookmarkModal() {
    modalOverlay.classList.remove("active");
}


openModal.addEventListener("click", openBookmarkModal);

closeModal.addEventListener("click", closeBookmarkModal);


modalOverlay.addEventListener("click", (event) => {

    if (event.target === modalOverlay) {
        closeBookmarkModal();
    }

});


document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeBookmarkModal();
    }

});


function getYouTubeId(url) {

    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtu\.be\/([^?]+)/,
        /youtube\.com\/shorts\/([^?]+)/,
        /youtube\.com\/embed\/([^?]+)/
    ];

    for (const pattern of patterns) {

        const match = url.match(pattern);

        if (match) {
            return match[1];
        }

    }

    return null;
}


function getBookmarkType(url) {

    return getYouTubeId(url)
        ? "youtube"
        : "web";

}


bookmarkForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();

    const bookmark = {
        id: Date.now(),
        title,
        url,
        type: getBookmarkType(url)
    };

    bookmarks.unshift(bookmark);

    saveBookmarks();
    renderBookmarks();

    bookmarkForm.reset();

    closeBookmarkModal();

    showToast("BOOKMARK SAVED");

});


function deleteBookmark(id) {

    bookmarks = bookmarks.filter(
        bookmark => bookmark.id !== id
    );

    saveBookmarks();
    renderBookmarks();

    showToast("BOOKMARK REMOVED");

}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


function createBookmarkCard(bookmark, index) {

    const youtubeId = getYouTubeId(bookmark.url);

    const preview = youtubeId
        ? `
            <img
                class="thumbnail"
                src="https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg"
                alt="${escapeHTML(bookmark.title)}"
                loading="lazy"
            >
        `
        : `
            <div class="web-placeholder">
                <span>↗</span>
            </div>
        `;


    return `
        <article
            class="card"
            style="animation-delay: ${index * 0.05}s"
        >

            ${preview}

            <div class="card-content">

                <span class="card-type">
                    // ${bookmark.type.toUpperCase()}
                </span>

                <h3 title="${escapeHTML(bookmark.title)}">
                    ${escapeHTML(bookmark.title)}
                </h3>

                <p class="card-url">
                    ${escapeHTML(bookmark.url)}
                </p>

                <div class="card-actions">

                    <a
                        href="${escapeHTML(bookmark.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="visit-btn"
                    >
                        OPEN LINK ↗
                    </a>

                    <button
                        class="delete-btn"
                        onclick="deleteBookmark(${bookmark.id})"
                        aria-label="Delete bookmark"
                    >
                        ×
                    </button>

                </div>

            </div>

        </article>
    `;

}


function renderBookmarks() {

    const query = searchInput.value
        .toLowerCase()
        .trim();


    const filteredBookmarks = bookmarks.filter(bookmark => {

        const matchesSearch =
            bookmark.title.toLowerCase().includes(query) ||
            bookmark.url.toLowerCase().includes(query);


        const matchesFilter =
            currentFilter === "all" ||
            bookmark.type === currentFilter;


        return matchesSearch && matchesFilter;

    });


    if (filteredBookmarks.length === 0) {

        bookmarkGrid.innerHTML = "";

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    bookmarkGrid.innerHTML = filteredBookmarks
        .map((bookmark, index) =>
            createBookmarkCard(bookmark, index)
        )
        .join("");

}


searchInput.addEventListener("input", renderBookmarks);


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(filter => {
            filter.classList.remove("active");
        });


        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderBookmarks();

    });

});


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}


renderBookmarks();
