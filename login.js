document.addEventListener('DOMContentLoaded', () => {
    
    // Elementy DOM
    const loader = document.getElementById('loader');
    const adminPanel = document.getElementById('admin-panel');
    const addStoryForm = document.getElementById('addStoryForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const html = document.documentElement;
    const toggleTheme = document.getElementById('toggleTheme');
    const themeIcon = document.getElementById('themeIcon');
    const generateIdeaBtn = document.getElementById('generateIdeaBtn');
    const continueWritingBtn = document.getElementById('continueWritingBtn');
    const titleInput = document.getElementById('title');
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

    // --- Logika Uwierzytelniania ---
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loader.style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Logika Formularza ---
    addStoryForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const title = titleInput.value;
        const date = document.getElementById('date').value;
        const content = contentInput.value;
        const submitBtn = document.getElementById('submitBtn');

        if (!title.trim() || !date || !content.trim()) {
            alert('Wszystkie pola muszą być wypełnione.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Dodawanie...';

        db.collection("stories").add({ title, date, content })
        .then(() => {
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
        });
    });

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        });
    });

    // --- Logika Gemini API ---
    async function callGemini(prompt, button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Myślę...';

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = "" 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Błąd API: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                return result.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Otrzymano nieprawidłową odpowiedź z API.");
            }
        } catch (error) {
            console.error("Błąd Gemini API:", error);
            alert("Wystąpił błąd podczas komunikacji z AI. Spróbuj ponownie.");
            return null;
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    generateIdeaBtn.addEventListener('click', async () => {
        const title = titleInput.value;
        if (!title.trim()) {
            alert("Najpierw wpisz tytuł opowiadania.");
            return;
        }
        const prompt = `Napisz intrygujący, pierwszy akapit opowiadania o tytule "${title}". Pisz w języku polskim.`;
        const generatedText = await callGemini(prompt, generateIdeaBtn);
        if (generatedText) {
            contentInput.value = generatedText;
        }
    });

    continueWritingBtn.addEventListener('click', async () => {
        const currentContent = contentInput.value;
        if (!currentContent.trim()) {
            alert("Pole treści jest puste. Użyj 'Wygeneruj pomysł' lub napisz coś sam.");
            return;
        }
        const prompt = `Jesteś autorem opowiadań. Kontynuuj płynnie poniższą historię, dodając kolejny akapit. Nie powtarzaj istniejącego tekstu. Pisz w języku polskim. Oto dotychczasowa treść:\n\n${currentContent}`;
        const generatedText = await callGemini(prompt, continueWritingBtn);
        if (generatedText) {
            contentInput.value += "\n\n" + generatedText;
        }
    });
});
