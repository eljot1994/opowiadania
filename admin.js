document.getElementById('addStoryForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const content = document.getElementById('content').value;
    const submitBtn = document.getElementById('submitBtn');

    // Prosta walidacja
    if (!title.trim() || !date || !content.trim()) {
        alert('Wszystkie pola muszą być wypełnione.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Dodawanie...';
    submitBtn.classList.add('bg-gray-500');

    // Dodaj nowy dokument do kolekcji "stories" w Firestore
    db.collection("stories").add({
        title: title,
        date: date,
        content: content // Zapisujemy surowy tekst z textarea
    })
    .then((docRef) => {
        console.log("Opowiadanie dodane z ID: ", docRef.id);
        alert("Opowiadanie zostało pomyślnie dodane!");
        document.getElementById('addStoryForm').reset();
    })
    .catch((error) => {
        console.error("Błąd podczas dodawania dokumentu: ", error);
        alert("Wystąpił błąd podczas dodawania opowiadania. Sprawdź konsolę deweloperską.");
    })
    .finally(() => {
        // Przywróć przycisk do stanu początkowego
        submitBtn.disabled = false;
        submitBtn.textContent = 'Dodaj opowiadanie';
        submitBtn.classList.remove('bg-gray-500');
    });
});
