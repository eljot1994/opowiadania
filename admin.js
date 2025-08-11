document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elementy DOM ---
    const loader = document.getElementById('loader');
    const adminPanel = document.getElementById('admin-panel');
    const addStoryForm = document.getElementById('addStoryForm');
    const logoutBtn = document.getElementById('logoutBtn');
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
        defaultParagraphSeparator: 'p', 
        styleWithCSS: false,
        actions: ['bold', 'italic', 'underline'],
        classes: {
            actionbar: 'pell-actionbar',
            button: 'pell-button',
            content: 'pell-content',
            selected: 'pell-button-selected'
        }
    });
    
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
                            if(storyIdInput.value === id) { setAddMode(); }
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
                .then(() => { setAddMode(); })
                .finally(() => { submitBtn.disabled = false; });
        } else {
            submitBtn.textContent = 'Dodawanie...';
            db.collection("stories").add(storyData)
                .then(() => { setAddMode(); })
                .finally(() => { submitBtn.disabled = false; });
        }
    });

    previewBtn.addEventListener('click', () => {
        const contentHTML = editor.content.innerHTML;
        previewContainer.innerHTML = contentHTML;
        previewWrapper.classList.toggle('hidden');
    });

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
});
