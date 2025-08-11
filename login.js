document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
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

    const storedTheme = localStorage.getItem("theme");
    const initialTheme = themes.includes(storedTheme) ? storedTheme : "poetic";
    currentThemeIndex = themes.indexOf(initialTheme);
    setTheme(initialTheme);
    // --- Koniec Logiki Motywów ---

    // --- Logika Logowania ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        loginBtn.disabled = true;
        loginBtn.textContent = 'Logowanie...';

        // Ustaw trwałość sesji, aby użytkownik pozostał zalogowany
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                // Po ustawieniu trwałości, zaloguj użytkownika
                return firebase.auth().signInWithEmailAndPassword(email, password);
            })
            .then(() => {
                // Przekieruj do panelu admina po pomyślnym logowaniu
                window.location.href = 'admin.html';
            })
            .catch((error) => {
                alert(`Błąd logowania: ${error.message}`);
                loginBtn.disabled = false;
                loginBtn.textContent = 'Zaloguj się';
            });
    });
});
