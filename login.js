document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const html = document.documentElement;
    const toggleTheme = document.getElementById('toggleTheme');
    const themeIcon = document.getElementById('themeIcon');

    // --- Logika Motywów (pozostaje bez zmian) ---
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
        if (theme === "light") themeIcon.className = "fas fa-sun";
        else if (theme === "poetic") themeIcon.className = "fas fa-feather-alt";
        else themeIcon.className = "fas fa-moon";
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

    // --- POPRAWIONA LOGIKA UWIERZYTELNIANIA ---

    // 1. Sprawdź, czy użytkownik jest już zalogowany. Jeśli tak, od razu przenieś go do panelu admina.
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log("Użytkownik jest już zalogowany. Przekierowuję do /admin.html");
            window.location.href = 'admin.html';
        } else {
            console.log("Brak zalogowanego użytkownika.");
        }
    });

    // 2. Obsłuż formularz logowania.
    if(loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert("Proszę podać email i hasło.");
                return;
            }

            loginBtn.disabled = true;
            loginBtn.textContent = 'Logowanie...';

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Sukces - przekierowanie nastąpi automatycznie dzięki listenerowi onAuthStateChanged powyżej
                    console.log("Logowanie udane!");
                })
                .catch(error => {
                    alert(`Błąd logowania: ${error.message}`);
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Zaloguj się';
                });
        });
    }
});
