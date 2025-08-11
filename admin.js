// Czekaj, aż cała strona (HTML) zostanie w pełni załadowana
document.addEventListener('DOMContentLoaded', () => {
    
    const loader = document.getElementById('loader');
    const adminPanel = document.getElementById('admin-panel');
    const addStoryForm = document.getElementById('addStoryForm');
    const logoutBtn = document.getElementById('logoutBtn');

    // Sprawdź stan uwierzytelnienia użytkownika
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Użytkownik jest zalogowany. Pokaż panel admina.
            console.log('Użytkownik zalogowany:', user.email);
            loader.style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            // Użytkownik nie jest zalogowany. Przekieruj na stronę logowania.
            console.log('Brak zalogowanego użytkownika. Przekierowanie...');
            window.location.href = 'login.html';
        }
    });

    // Logika formularza dodawania opowiadania
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

        db.collection("stories").add({
            title: title,
            date: date,
            content: content
        })
        .then((docRef) => {
            console.log("Opowiadanie dodane z ID: ", docRef.id);
            alert("Opowiadanie zostało pomyślnie dodane!");
            addStoryForm.reset();
        })
        .catch((error) => {
            console.error("Błąd podczas dodawania dokumentu: ", error);
            alert("Wystąpił błąd podczas dodawania opowiadania. Sprawdź konsolę deweloperską.");
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Dodaj opowiadanie';
            submitBtn.classList.remove('bg-gray-500');
        });
    });

    // Logika przycisku wylogowania
    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            console.log('Wylogowano pomyślnie.');
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Błąd wylogowania:', error);
        });
    });
});
