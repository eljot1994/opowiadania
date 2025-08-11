document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elementy DOM ---
    const loader = document.getElementById('loader');
    const adminPanel = document.getElementById('admin-panel');
    const addStoryForm = document.getElementById('addStoryForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const html = document.documentElement;
    const toggleTheme = document.getElementById('toggleTheme');
    const themeIcon = document.getElementById('themeIcon');
    const storiesListContainer = document.getElementById('stories-list-container');
    const storyIdInput = document.getElementById('storyId');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const titleInput = document.getElementById('title');
    const dateInput = document.getElementById('date');
    const previewBtn = document.getElementById('previewBtn');
    const previewWrapper = document.getElementById('preview-wrapper');
    const previewContainer = document.getElementById('preview-container');

    // --- Inicjalizacja edytora Pell ---
    const editor = pell.init({
        element: document.getElementById('editor'),
        onChange: () => {}, // Można dodać logikę, jeśli potrzebna
        // Ustawia, że enter tworzy <p>
        defaultParagraphSeparator: 'p', 
        styleWithCSS: false,
        // Definiujemy, które przyciski mają być widoczne
        actions: [
            'bold',
            'italic',
            'underline'
        ],
        // Tłumaczenia tooltipów
        classes: {
            actionbar: 'pell-actionbar',
            button: 'pell-button',
            content: 'pell-content',
            selected: 'pell-button-selected'
        }
    });

    // --- Logika Motywów ---
    const themes = ["light", "poetic", "dark"];
    let currentThemeIndex = 0;

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
            themeIcon.className = "fas fa-sun";
        } else if (theme === "poetic") {
            themeIcon.className = "fas fa-feather-alt";
        } else {
            themeIcon.className = "fas fa-moon";
        }
    }

    function cycleTheme() {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        setTheme(themes[currentThemeIndex]);
    }
    toggleTheme.addEventListener('click', cycleTheme);
    const storedTheme = localStorage.getItem("theme");
    const initialTheme = themes.includes(storedTheme) ? storedTheme : "poetic";
    currentThemeIndex = themes.indexOf(initialTheme);
    setTheme(initialTheme);
    
    // --- Logika Uwierzytelniania ---
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loader.style.display = 'none';
            adminPanel.style.display = 'grid';
            loadStories();
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Logika CRUD ---
    const setEditMode = (story) => {
        formTitle.textContent = 'Edytuj Opowiadanie';
        submitBtn.textContent = 'Zapisz zmiany';
        submitBtn.classList.remove('bg-blue-500', 'hover:bg-blue-700');
        submitBtn.classList.add('bg-green-500', 'hover:bg-green-700');
        cancelEditBtn.classList.remove('hidden');
        previewWrapper.classList.add('hidden');

        storyIdInput.value = story.id;
        titleInput.value = story.title;
        dateInput.value = story.date;
        // Wypełniamy edytor Pell treścią z bazy
        editor.content.innerHTML = story.content;
    };

    const setAddMode = () => {
        formTitle.textContent = 'Dodaj Nowe Opowiadanie';
        submitBtn.textContent = 'Dodaj opowiadanie';
        submitBtn.classList.remove('bg-green-500', 'hover:bg-green-700');
        submitBtn.classList.add('bg-blue-500', 'hover:bg-blue-700');
        cancelEditBtn.classList.add('hidden');
        previewWrapper.classList.add('hidden');
        
        addStoryForm.reset();
        storyIdInput.value = '';
        // Czyścimy edytor Pell
        editor.content.innerHTML = '';
    };

    cancelEditBtn.addEventListener('click', setAddMode);

    const loadStories = () => {
        db.collection("stories").orderBy("date", "desc").onSnapshot((querySnapshot) => {
            storiesListContainer.innerHTML = '';
            if (querySnapshot.empty) {
                storiesListContainer.innerHTML = '<p class="text-gray-500">Brak opowiadań w bazie danych.</p>';
                return;
            }
            querySnapshot.forEach((doc) => {
                const story = { id: doc.id, ...doc.data() };
                const storyElement = document.createElement('div');
                storyElement.className = 'story-list-item';
                storyElement.innerHTML = `
                    <div>
                        <h3 class="font-bold">${story.title}</h3>
                        <p class="text-sm text-gray-500">${story.date}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="edit-btn" data-id="${story.id}"><i class="fas fa-edit text-blue-500 hover:text-blue-700"></i></button>
                        <button class="delete-btn" data-id="${story.id}"><i class="fas fa-trash text-red-500 hover:text-red-700"></i></button>
                    </div>
                `;
                storiesListContainer.appendChild(storyElement);
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.closest('button').dataset.id;
                    db.collection("stories").doc(id).get().then((doc) => {
                        if (doc.exists) {
                           setEditMode({ id: doc.id, ...doc.data() });
                           window.scrollTo(0, 0);
                        }
                    });
                });
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.closest('button').dataset.id;
                    if (confirm('Czy na pewno chcesz usunąć to opowiadanie? Tej operacji nie można cofnąć.')) {
                        db.collection("stories").doc(id).delete().then(() => {
                            alert('Opowiadanie usunięte!');
                            if(storyIdInput.value === id) {
                                setAddMode();
                            }
                        });
                    }
                });
            });
        });
    };

    addStoryForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = titleInput.value;
        const date = dateInput.value;
        // Pobieramy treść jako HTML z edytora Pell
        const content = editor.content.innerHTML;
        const storyId = storyIdInput.value;

        if (!title.trim() || !date || !content.trim()) {
            alert('Tytuł, data i treść nie mogą być puste.');
            return;
        }

        submitBtn.disabled = true;
        const storyData = { title, date, content };

        if (storyId) {
            submitBtn.textContent = 'Zapisywanie...';
            db.collection("stories").doc(storyId).update(storyData)
                .then(() => {
                    alert("Opowiadanie zaktualizowane!");
                    setAddMode();
                }).finally(() => { submitBtn.disabled = false; });
        } else {
            submitBtn.textContent = 'Dodawanie...';
            db.collection("stories").add(storyData)
                .then(() => {
                    alert("Opowiadanie dodane!");
                    setAddMode();
                }).finally(() => { submitBtn.disabled = false; });
        }
    });

    // Logika przycisku podglądu
    previewBtn.addEventListener('click', () => {
        const contentHTML = editor.content.innerHTML;
        if (!contentHTML.trim()) {
            alert("Nie ma treści do podglądu.");
            return;
        }
        previewContainer.innerHTML = contentHTML;
        // Pokaż lub ukryj kontener podglądu
        previewWrapper.classList.toggle('hidden');
    });

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
});
