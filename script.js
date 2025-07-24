let stories = [];
let filteredStories = [];
let currentIndex = 0;

const storyList = document.getElementById("story-list");
const storyContainer = document.querySelector(".story-container");
const prevStoryBtn = document.getElementById("prevStoryBtn");
const nextStoryBtn = document.getElementById("nextStoryBtn");
const searchInput = document.getElementById("storySearch");
const searchMode = document.getElementById("searchMode");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const author = "Jarosław Derda";

function highlight(text) {
  if (!text) return "";
  const query = searchInput?.value.toLowerCase().trim();
  if (!query || query.length < 2) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = searchMode.checked ? `\\b${escaped}\\b` : escaped;

  const regex = new RegExp(`(${pattern})`, "gi");

  return text.replace(
    regex,
    '<mark class="bg-amber-200 dark:bg-amber-600 text-black dark:text-white rounded px-1">$1</mark>'
  );
}

// Rysowanie listy opowiadań (teraz po tytułach)
function renderStoryList() {
  storyList.innerHTML = "";
  // Opcjonalnie sortuj alfabetycznie: filteredStories.sort((a, b) => a.title.localeCompare(b.title));

  filteredStories.forEach((story, index) => {
    const storyItem = document.createElement("div");
    storyItem.className = `sidebar-item ${
      index === currentIndex ? "bg-active" : ""
    }`;
    storyItem.dataset.index = index;
    // Zamiast daty, wyświetlamy tytuł opowiadania
    storyItem.innerHTML = `<div class="text-active">${
      story.title || "Bez tytułu"
    }</div>`;

    storyItem.addEventListener("click", () => {
      currentIndex = index;
      renderCurrentStory();
      updateSidebarActiveItem();
    });

    storyList.appendChild(storyItem);
  });
}

// Wyświetlanie opowiadania
function renderCurrentStory() {
  if (!filteredStories[currentIndex]) return;

  storyContainer.innerHTML = "";

  const story = filteredStories[currentIndex];
  const storyElement = document.createElement("div");
  storyElement.className = "poem p-8 md:p-12 flex flex-col justify-center"; // Używam klasy .poem, by zachować style

  storyElement.innerHTML = `
    <div class="poem-title text-2xl font-serif text-gray-600 dark:text-gray-300 mb-6">${highlight(
      story.title
    )}</div>
    <div class="text-lg md:text-xl font-serif leading-relaxed max-w-2xl mx-auto text-gray-500 dark:text-gray-300 prose prose-sm prose-gray break-words">
      ${highlight(story.content)}
    </div>
    <div class="text-sm text-gray-400 mt-6 text-right max-w-2xl mx-auto italic">— ${author}</div>
  `;

  storyContainer.appendChild(storyElement);
  storyContainer.scrollTo(0, 0);
  if (window.MathJax) {
    MathJax.typesetPromise([storyContainer]);
  }
}

function updateSidebarActiveItem() {
  document.querySelectorAll(".sidebar-item").forEach((item, index) => {
    item.classList.toggle(
      "bg-active",
      parseInt(item.dataset.index) === currentIndex
    );
  });
}

// Nawigacja
prevStoryBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentStory();
    updateSidebarActiveItem();
  }
});

nextStoryBtn.addEventListener("click", () => {
  if (currentIndex < filteredStories.length - 1) {
    currentIndex++;
    renderCurrentStory();
    updateSidebarActiveItem();
  }
});

// Wyszukiwanie + reset
function runSearch() {
  const query = searchInput.value.toLowerCase().trim();

  if (!query || query.length < 2) {
    filteredStories = [...stories];
    currentIndex = 0;
    renderStoryList();
    renderCurrentStory();
    return;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = searchMode.checked ? `\\b${escaped}\\b` : escaped;

  const queryRegex = new RegExp(pattern, "i");

  filteredStories = stories.filter(
    (story) =>
      (story.title && queryRegex.test(story.title)) ||
      (story.content && queryRegex.test(story.content))
  );

  currentIndex = 0;
  renderStoryList();
  renderCurrentStory();
}

searchInput.addEventListener("input", () => {
  clearSearchBtn.classList.toggle(
    "hidden",
    searchInput.value.trim().length === 0
  );
  runSearch();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    clearSearch();
  }
});

clearSearchBtn.addEventListener("click", clearSearch);

function clearSearch() {
  searchInput.value = "";
  clearSearchBtn.classList.add("hidden");
  filteredStories = [...stories];
  currentIndex = 0;
  renderStoryList();
  renderCurrentStory();
}
searchMode.addEventListener("change", () => {
  if (searchInput.value.trim().length >= 2) {
    runSearch();
  }
});

// Pobranie opowiadań z nowego pliku
fetch("./stories.json")
  .then((response) => response.json())
  .then((data) => {
    stories = data.filter(
      (story) =>
        typeof story.content === "string" &&
        story.content.trim().length > 0 &&
        story.title &&
        story.title.trim().length > 0
    );

    if (stories.length === 0) {
      storyList.innerHTML =
        '<div class="p-4 text-sm text-gray-500">Brak dostępnych opowiadań.</div>';
      storyContainer.innerHTML = "";
      return;
    }

    currentIndex = 0;
    filteredStories = [...stories];
    renderStoryList();
    renderCurrentStory();
  });
