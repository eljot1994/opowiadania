// Przykładowe opowiadania, analogicznie do Twoich wierszy
const allStories = [
  {
    date: "2025-07-15",
    title: "Nieznajomy w deszczu",
    content: `Deszcz spływał po oknach kawiarni, zamazując świat na zewnątrz.  
W kącie siedział nieznajomy, którego twarz skrywał kaptur.

Jego oczy jednak mówiły więcej niż tysiąc słów...`
  },
  {
    date: "2025-07-14",
    title: "Powrót do domu",
    content: `Droga powrotna była dłuższa niż się spodziewałem.  
Miasto tonęło w złotym blasku zachodzącego słońca, a ja szedłem w milczeniu.

Wszystko wydawało się inne, a jednak znajome...`
  },
  {
    date: "2025-07-10",
    title: "Cień na ścianie",
    content: `Wieczorny cień padał na starą ścianę domu.  
W ciszy słychać było tylko szelest liści i oddech wiatru.

Nagle, zza rogu, wyłoniła się postać...`
  }
];

// Sortujemy po dacie malejąco (najnowsze pierwsze)
allStories.sort((a, b) => new Date(b.date) - new Date(a.date));

const listEl = document.getElementById("story-list");
const titleEl = document.getElementById("story-title");
const dateEl = document.getElementById("story-date");
const textEl = document.getElementById("story-text");

// Renderowanie listy opowiadań po lewej
function renderStoryList() {
  allStories.forEach(story => {
    const li = document.createElement("li");
    li.textContent = story.title;
    li.dataset.date = story.date;
    li.addEventListener("click", () => setActiveStory(story.date));
    listEl.appendChild(li);
  });
}

// Pokazywanie wybranego opowiadania
function setActiveStory(date) {
  const story = allStories.find(s => s.date === date);
  if (!story) return;

  titleEl.textContent = story.title;
  dateEl.textContent = formatDate(story.date);
  textEl.textContent = story.content;

  // Podświetlamy aktywne w menu
  Array.from(listEl.children).forEach(li => {
    li.classList.toggle("active", li.dataset.date === date);
  });
}

// Formatowanie daty na polski, np. 15 lipca 2025
function formatDate(dateStr) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("pl-PL", options);
}

// Inicjalizacja
renderStoryList();
if (allStories.length) {
  setActiveStory(allStories[0].date); // pokazujemy najnowsze
} else {
  titleEl.textContent = "Brak opowiadań";
  dateEl.textContent = "";
  textEl.textContent = "";
}
