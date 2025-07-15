let stories = [];
let filteredStories = [];
let currentIndex = 0;

const storyList = document.getElementById('story-list');
const storyContainer = document.querySelector('.story-container');
const prevStoryBtn = document.getElementById('prevStoryBtn');
const nextStoryBtn = document.getElementById('nextStoryBtn');
const searchInput = document.getElementById('storySearch');
const searchMode = document.getElementById('searchMode');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const author = "Jarosław Derda";

// Formatowanie daty
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMonthHeader(dateString) {
  return new Date(dateString).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

function highlight(text) {
  const query = searchInput?.value.toLowerCase().trim();
  if (!query || query.length < 2) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = searchMode.checked
    ? `\\b${escaped}\\b`  // tylko całe słowo
    : escaped;            // dowolny fragment

  const regex = new RegExp(`(${pattern})`, 'gi');

  return text.replace(regex, '<mark class="bg-amber-200 dark:bg-amber-600 text-black dark:text-white rounded px-1">$1</mark>');
}

// Rysowanie listy opowiadań
function renderStoryList() {
  storyList.innerHTML = '';
  filteredStories.sort((a, b) => new Date(b.date) - new Date(a.date));

  const monthGroups = new Map();
  const currentStoryMonth = formatMonthHeader(filteredStories[currentIndex]?.date);

  filteredStories.forEach((story, index) => {
    const storyMonth = formatMonthHeader(story.date);

    if (!monthGroups.has(storyMonth)) {
      const groupWrapper = document.createElement('div');
      groupWrapper.classList.add('month-group');

      const monthHeader = document.createElement('div');
      monthHeader.className = 'month-header flex items-center gap-2 cursor-pointer';

      const icon = document.createElement('i');
      icon.className = storyMonth === currentStoryMonth
        ? 'fas fa-chevron-down text-inherit text-sm w-5 text-center inline-block align-middle'
        : 'fas fa-chevron-right text-inherit text-sm w-5 text-center inline-block align-middle';

      const title = document.createElement('span');
      title.textContent = storyMonth;

      monthHeader.appendChild(icon);
      monthHeader.appendChild(title);

      monthHeader.addEventListener('click', () => {
        groupWrapper.classList.toggle('collapsed');
        icon.className = groupWrapper.classList.contains('collapsed')
          ? 'fas fa-chevron-right text-inherit text-sm w-5 text-center inline-block align-middle'
          : 'fas fa-chevron-down text-inherit text-sm w-5 text-center inline-block align-middle';
      });

      if (storyMonth !== currentStoryMonth) {
        groupWrapper.classList.add('collapsed');
      }

      groupWrapper.appendChild(monthHeader);
      storyList.appendChild(groupWrapper);
      monthGroups.set(storyMonth, groupWrapper);
    }

    const group = monthGroups.get(storyMonth);
    const storyItem = document.createElement('div');
    storyItem.className = `sidebar-item ${index === currentIndex ? 'bg-active' : ''}`;
    storyItem.dataset.index = index;
    storyItem.innerHTML = `<div class="text-active">${formatDate(story.date)}</div>`;

    storyItem.addEventListener('click', () => {
      currentIndex = index;
      renderCurrentStory();
      updateSidebarActiveItem();
    });

    group.appendChild(storyItem);
  });

  // Usuwamy puste miesiące
  document.querySelectorAll('.month-group').forEach(group => {
    const children = group.querySelectorAll('.sidebar-item');
    if (children.length === 0) {
      group.remove();
    }
  });
}

// Wyświetlanie opowiadania
function renderCurrentStory() {
  if (!filteredStories[currentIndex]) return;

  storyContainer.innerHTML = '';

  const story = filteredStories[currentIndex];
  const storyElement = document.createElement('div');
  storyElement.className = 'story p-8 md:p-12 flex flex-col justify-center';

  storyElement.innerHTML = `
    <div class="story-date text-2xl font-serif text-gray-700 dark:text-gray-200 mb-1">${formatDate(story.date)}</div>
    ${story.subdate ? `<div class="text-sm italic text-gray-400 mb-3">${story.subdate}</div>` : ''}
${story.title ? `<div class="story-title text-2xl font-serif text-gray-600 dark:text-gray-300 mb-6">${highlight(story.title)}</div>` : ''}
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
  document.querySelectorAll('.sidebar-item').forEach((item, index) => {
    item.classList.toggle('bg-active', index === currentIndex);
  });
}

// Nawigacja
prevStoryBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentStory();
    updateSidebarActiveItem();
  }
});

nextStoryBtn.addEventListener('click', () => {
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
    const today = new Date().toISOString().slice(0, 10);
    const todayIndex = stories.findIndex(story => story.date === today);
    currentIndex = todayIndex !== -1 ? todayIndex : 0;
    renderStoryList();
    renderCurrentStory();
    return;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = searchMode.checked
    ? `\\b${escaped}\\b`
    : escaped;

  const queryRegex = new RegExp(pattern, 'i');

  filteredStories = stories.filter(story =>
    queryRegex.test(formatDate(story.date)) ||
    (story.title && queryRegex.test(story.title)) ||
    (story.content && queryRegex.test(story.content))
  );

  currentIndex = 0;
  renderStoryList();
  renderCurrentStory();
}

searchInput.addEventListener('input', () => {
  clearSearchBtn.classList.toggle('hidden', searchInput.value.trim().length === 0);
  runSearch();
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    clearSearch();
  }
});

clearSearchBtn.addEventListener('click', clearSearch);

function clearSearch() {
  searchInput.value = '';
  clearSearchBtn.classList.add('hidden');
  filteredStories = [...stories];
  const today = new Date().toISOString().slice(0, 10);
  const todayIndex = stories.findIndex(story => story.date === today);
  currentIndex = todayIndex !== -1 ? todayIndex : 0;
  renderStoryList();
  renderCurrentStory();
}
searchMode.addEventListener('change', () => {
  if (searchInput.value.trim().length >= 2) {
    runSearch();
  }
});

// Pobranie opowiadań
fetch('./stories.json')
  .then(response => response.json())
  .then(data => {
    stories = data.filter(story =>
      typeof story.content === 'string' &&
      story.content.trim().length > 0
    );

    if (stories.length === 0) {
      storyList.innerHTML = '<div class="p-4 text-sm text-gray-500">Brak dostępnych opowiadań.</div>';
      storyContainer.innerHTML = '';
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const todayIndex = stories.findIndex(story => story.date === today);
    currentIndex = todayIndex !== -1 ? todayIndex : 0;

    filteredStories = [...stories];
    renderStoryList();
    renderCurrentStory();
  });
