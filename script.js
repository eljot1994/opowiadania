let stories = [];
let filteredStories = [];
let currentIndex = 0;

const storyList = document.getElementById("story-list");
const storyContainer = document.querySelector(".poem-container");
const prevStoryBtn = document.getElementById("prevStoryBtn");
const nextStoryBtn = document.getElementById("nextStoryBtn");
const searchInput = document.getElementById("storySearch");
const searchMode = document.getElementById("searchMode");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const author = "Jarosław Derda";

// Przeniesione zmienne i elementy DOM z index.html
const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const html = document.documentElement;
const themeIcon = document.getElementById("themeIcon");
const toggleTheme = document.getElementById("toggleTheme");

const themes = ["light", "poetic", "dark"];
let currentThemeIndex = 0;

  
function formatContent(content) {
  if (content.includes("<br>") || content.includes("$")) {
    return content;
  }
  return content
    .split("\n")
    .map((line) => (line.trim() === "" ? "<br>" : `<p>${line}</p>`))
    .join("");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

// Funkcja do generowania "slugów" z tytułów opowiadań
function getStorySlug(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFD") // Normalizacja do formy dekompozycyjnej (np. "ó" -> "o")
    .replace(/[\u0300-\u036f]/g, "") // Usunięcie znaków diakrytycznych
    .replace(/[^\w\s-]/g, "") // Usunięcie znaków innych niż słowne, spacje, myślniki
    .replace(/\s+/g, "-") // Zamiana spacji na myślniki
    .replace(/--+/g, "-") // Usunięcie podwójnych myślników
    .trim(); // Usunięcie białych znaków na początku i końcu
}

// Rysowanie listy opowiadań po tytułach
function renderStoryList() {
  storyList.innerHTML = "";
  filteredStories.forEach((story, index) => {
    const storyItem = document.createElement("div");
    storyItem.className = `sidebar-item ${
      index === currentIndex ? "bg-active" : ""
    }`;
    storyItem.dataset.index = index;
    storyItem.dataset.slug = getStorySlug(story.title); // Dodanie sluga jako atrybutu danych
    storyItem.innerHTML = `<div class="text-active">${
      story.title || "Bez tytułu"
    }</div>`;
    storyItem.addEventListener("click", () => {
      // Zamiast bezpośredniego renderowania, zmieniamy hash URL
      window.location.hash = getStorySlug(story.title);
    });
    storyList.appendChild(storyItem);
  });
}

// Wyświetlanie opowiadania z datą
function renderCurrentStory() {
  if (!filteredStories[currentIndex]) return;
  storyContainer.innerHTML = "";
  const story = filteredStories[currentIndex];
  const storyElement = document.createElement("div");
  storyElement.className = "story p-8 md:p-12 flex flex-col justify-center";
  storyElement.innerHTML = `
    <div class="story-date text-l font-serif text-gray-700 dark:text-gray-200 mb-1">${formatDate(
      story.date
    )}</div>
        <div class="text-l text-gray-400 mb-1 text-left italic">${author}</div>
    ${
      story.title
        ? `<div class="story-title text-3xl font-serif text-gray-600 dark:text-gray-300 mb-4">${highlight(
            story.title
          )}</div>`
        : ""
    }
    <div class="text-lg md:text-xl font-serif leading-relaxed max-w-3xl mx-auto text-gray-500 dark:text-gray-300 prose prose-sm prose-gray break-words">
      ${highlight(formatContent(story.content))}
    </div>

  `;
  storyContainer.appendChild(storyElement);
  storyContainer.scrollTo(0, 0);
  if (window.MathJax) {
    MathJax.typesetPromise([storyContainer]);
  }
  updateSidebarActiveItem(); // Upewnij się, że element w sidebarze jest aktywny po renderowaniu
}

function updateSidebarActiveItem() {
  document.querySelectorAll(".sidebar-item").forEach((item) => {
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
    window.location.hash = getStorySlug(filteredStories[currentIndex].title);
  }
});
nextStoryBtn.addEventListener("click", () => {
  if (currentIndex < filteredStories.length - 1) {
    currentIndex++;
    window.location.hash = getStorySlug(filteredStories[currentIndex].title);
  }
});

// Wyszukiwanie
function runSearch() {
  const query = searchInput.value.toLowerCase().trim();
  if (!query || query.length < 2) {
    filteredStories = [...stories];
  } else {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = searchMode.checked ? `\\b${escaped}\\b` : escaped;
    const queryRegex = new RegExp(pattern, "i");
    filteredStories = stories.filter(
      (story) =>
        (story.title && queryRegex.test(story.title)) ||
        (story.content && queryRegex.test(story.content))
    );
  }
  currentIndex = 0; // Resetuj indeks po wyszukaniu
  renderStoryList(); // Renderuj listę wyników wyszukiwania
  renderCurrentStory(); // Wyświetl pierwsze opowiadanie z wyników
  // Po wyszukiwaniu nie zmieniamy hasha URL automatycznie, aby użytkownik mógł dalej linkować do konkretnych opowiadań
}

searchInput.addEventListener("input", () => {
  clearSearchBtn.classList.toggle(
    "hidden",
    searchInput.value.trim().length === 0
  );
  runSearch();
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") clearSearch();
});
clearSearchBtn.addEventListener("click", clearSearch);

function clearSearch() {
  searchInput.value = "";
  clearSearchBtn.classList.add("hidden");
  filteredStories = [...stories];
  // Po wyczyszczeniu wyszukiwania możemy przywrócić stan z hasha, jeśli istnieje
  handleHashChange();
  renderStoryList();
  renderCurrentStory();
}
searchMode.addEventListener("change", () => {
  if (searchInput.value.trim().length >= 2) runSearch();
});

// Funkcja obsługująca zmianę hasha w URL
function handleHashChange() {
  const hash = window.location.hash.substring(1); // Usuń '#'
  const targetSlug = getStorySlug(decodeURIComponent(hash)); // Pobierz sluga z hasha

  let foundIndex = -1;
  if (targetSlug) {
    foundIndex = filteredStories.findIndex(
      (story) => getStorySlug(story.title) === targetSlug
    );
  }

  if (foundIndex !== -1) {
    currentIndex = foundIndex;
  } else {
    // Jeśli hash jest pusty lub nie znaleziono opowiadania, wróć do pierwszego
    currentIndex = 0;
    // Jeśli hash był nieprawidłowy, możemy go usunąć z URL-a, aby nie wprowadzać w błąd
    if (hash && hash !== getStorySlug(filteredStories[0].title)) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
  renderCurrentStory();
  renderStoryList(); // Aktualizacja listy, aby podświetlić właściwy element
}

// Nasłuchiwanie na zmiany hasha w URL
window.addEventListener("hashchange", handleHashChange);

// Funkcje i zdarzenia związane z motywami i sidebar'em, przeniesione z index.html
function setTheme(theme) {
  html.classList.remove("dark", "theme-poetic", "theme-light");
  if (theme === "dark") html.classList.add("dark");
  if (theme === "poetic") html.classList.add("theme-poetic");
  if (theme === "light") html.classList.add("theme-light");
  localStorage.setItem("theme", theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  if (theme === "light") {
    themeIcon.className = "fas fa-sun"; // czarno-biały klasyczny
  } else if (theme === "poetic") {
    themeIcon.className = "fas fa-feather-alt"; // poetycki
  } else {
    themeIcon.className = "fas fa-moon"; // ciemny
  }
}

function cycleTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  setTheme(themes[currentThemeIndex]);
}

toggleTheme.addEventListener("click", cycleTheme);

// Funkcja zapewniająca widoczność sidebara na starcie
function ensureSidebarVisibility() {
  if (window.innerWidth >= 768) {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.add("hidden"); // Upewnij się, że overlay jest ukryty
  } else {
    // Na mniejszych ekranach upewnij się, że jest ukryty, chyba że został otwarty
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  }
}

toggleSidebarBtn.addEventListener("click", () => {
  const isOpen = !sidebar.classList.contains("-translate-x-full");
  sidebar.classList.toggle("-translate-x-full");
  overlay.classList.toggle("hidden", isOpen);
});

overlay.addEventListener("click", () => {
  sidebar.classList.add("-translate-x-full");
  overlay.classList.add("hidden");
});

// Inicjalizacja motywu
const storedTheme = localStorage.getItem("theme");
const initialTheme = themes.includes(storedTheme) ? storedTheme : "light";
currentThemeIndex = themes.indexOf(initialTheme);
setTheme(initialTheme);

db.collection("stories")
  .orderBy("date", "desc") // Sortuj opowiadania od najnowszych
  .get()
  .then((querySnapshot) => {
    stories = []; // Wyczyść tablicę na start
    querySnapshot.forEach((doc) => {
      // Pobierz dane opowiadania i dodaj jego unikalne ID z bazy
      stories.push({ id: doc.id, ...doc.data() });
    });

    if (stories.length === 0) {
      storyList.innerHTML =
        '<div class="p-4 text-sm text-gray-500">Brak opowiadań.</div>';
      storyContainer.innerHTML = "";
      return;
    }
    
    filteredStories = [...stories];
    ensureSidebarVisibility();
    handleHashChange();
  })
  .catch((error) => {
    console.error("Błąd podczas pobierania opowiadań: ", error);
    storyList.innerHTML =
      '<div class="p-4 text-sm text-red-500">Wystąpił błąd podczas ładowania opowiadań. Sprawdź konsolę, by dowiedzieć się więcej.</div>';
  });
