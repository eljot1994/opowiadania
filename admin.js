document.addEventListener('DOMContentLoaded', () => {
    
    // Elementy DOM
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
    const contentInput = document.getElementById('content');


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
    // --- Koniec Logiki Motywów ---


    // --- Logika Uwierzytelniania ---
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loader.style.display = 'none';
            adminPanel.style.display = 'grid';
            loadStories(); // Załaduj opowiadania po zalogowaniu
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Logika CRUD ---

    // Przełączanie formularza w tryb edycji
    const setEditMode = (story) => {
        formTitle.textContent = 'Edytuj Opowiadanie';
        submitBtn.textContent = 'Zapisz zmiany';
        submitBtn.classList.remove('bg-blue-500', 'hover:bg-blue-700');
        submitBtn.classList.add('bg-green-500', 'hover:bg-green-700');
        cancelEditBtn.classList.remove('hidden');

        storyIdInput.value = story.id;
        titleInput.value = story.title;
        dateInput.value = story.date;
        contentInput.value = story.content;
    };

    // Resetowanie formularza do trybu dodawania
    const setAddMode = () => {
        formTitle.textContent = 'Dodaj Nowe Opowiadanie';
        submitBtn.textContent = 'Dodaj opowiadanie';
        submitBtn.classList.remove('bg-green-500', 'hover:bg-green-700');
        submitBtn.classList.add('bg-blue-500', 'hover:bg-blue-700');
        cancelEditBtn.classList.add('hidden');
        
        addStoryForm.reset();
        storyIdInput.value = '';
    };

    cancelEditBtn.addEventListener('click', setAddMode);

    // Ładowanie i wyświetlanie listy opowiadań
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
                        <button class="edit-btn" data-id="${story.id}"><i class="fas fa-edit text-blue-500"></i></button>
                        <button class="delete-btn" data-id="${story.id}"><i class="fas fa-trash text-red-500"></i></button>
                    </div>
                `;
                storiesListContainer.appendChild(storyElement);
            });

            // Dodanie event listenerów do przycisków edycji
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    db.collection("stories").doc(id).get().then((doc) => {
                        if (doc.exists) {
                           setEditMode({ id: doc.id, ...doc.data() });
                           window.scrollTo(0, 0); // Przewiń na górę strony
                        }
                    });
                });
            });

            // Dodanie event listenerów do przycisków usuwania
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    if (confirm('Czy na pewno chcesz usunąć to opowiadanie? Tej operacji nie można cofnąć.')) {
                        db.collection("stories").doc(id).delete().then(() => {
                            alert('Opowiadanie usunięte!');
                            if(storyIdInput.value === id) { // Jeśli usunięto edytowane opowiadanie
                                setAddMode();
                            }
                        }).catch(error => {
                            console.error("Błąd podczas usuwania: ", error);
                            alert('Wystąpił błąd podczas usuwania opowiadania.');
                        });
                    }
                });
            });
        });
    };

    // Obsługa formularza (Dodawanie i Aktualizacja)
    addStoryForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = titleInput.value;
        const date = dateInput.value;
        const content = contentInput.value;
        const storyId = storyIdInput.value;

        if (!title.trim() || !date || !content.trim()) {
            alert('Wszystkie pola muszą być wypełnione.');
            return;
        }

        submitBtn.disabled = true;
        const storyData = { title, date, content };

        if (storyId) {
            // Tryb aktualizacji
            submitBtn.textContent = 'Zapisywanie...';
            db.collection("stories").doc(storyId).update(storyData)
                .then(() => {
                    alert("Opowiadanie zostało pomyślnie zaktualizowane!");
                    setAddMode();
                })
                .catch((error) => {
                    console.error("Błąd podczas aktualizacji: ", error);
                    alert("Wystąpił błąd. Sprawdź konsolę.");
                })
                .finally(() => {
                    submitBtn.disabled = false;
                });
        } else {
            // Tryb dodawania
            submitBtn.textContent = 'Dodawanie...';
            db.collection("stories").add(storyData)
                .then(() => {
                    alert("Opowiadanie zostało pomyślnie dodane!");
                    setAddMode();
                })
                .catch((error) => {
                    console.error("Błąd podczas dodawania: ", error);
                    alert("Wystąpił błąd. Sprawdź konsolę.");
                })
                .finally(() => {
                    submitBtn.disabled = false;
                });
        }
    });

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
});
