document.addEventListener('DOMContentLoaded', () => {
    
    // Elementy DOM
    const loader = document.getElementById('loader');
    const adminPanel = document.getElementById('admin-panel');
    const addStoryForm = document.getElementById('addStoryForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const html = document.documentElement;
    const toggleTheme = document.getElementById('toggleTheme');
    const themeIcon = document.getElementById('themeIcon');

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

    // Inicjalizacja motywu na starcie
    const storedTheme = localStorage.getItem("theme");
    const initialTheme = themes.includes(storedTheme) ? storedTheme : "poetic";
    currentThemeIndex = themes.indexOf(initialTheme);
    setTheme(initialTheme);
    // --- Koniec Logiki Motywów ---


    // --- Logika Uwierzytelniania ---
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('Użytkownik zalogowany:', user.email);
            loader.style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            console.log('Brak zalogowanego użytkownika. Przekierowanie...');
            window.location.href = 'login.html';
        }
    });

    addStoryForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const date = document.getElementById('date').value;
        const content = document.getElementById('content').value;
        const submitBtn = document.getElementById('submitBtn');

        if (!title.trim() || !date || !content.trim()) {
            alert('Wszystkie pola muszą być wypełnione.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Dodawanie...';
        submitBtn.classList.add('bg-gray-500');

        db.collection("stories").add({ title, date, content })
        .then((docRef) => {
            console.log("Opowiadanie dodane z ID: ", docRef.id);
            alert("Opowiadanie zostało pomyślnie dodane!");
            addStoryForm.reset();
        })
        .catch((error) => {
            console.error("Błąd podczas dodawania dokumentu: ", error);
            alert("Wystąpił błąd. Sprawdź konsolę.");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Dodaj opowiadanie';
            submitBtn.classList.remove('bg-gray-500');
        });
    });

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
});
