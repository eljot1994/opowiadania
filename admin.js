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
    
    // Elementy podglądu
    const previewBtn = document.getElementById('previewBtn');
    const previewWrapper = document.getElementById('preview-wrapper');
    const previewStoryContainer = document.getElementById('preview-story-container');

    // Elementy "Znajdź i zamień"
    const findInput = document.getElementById('find-input');
    const replaceInput = document.getElementById('replace-input');
    const replaceBtn = document.getElementById('replace-btn');
    const replaceAllBtn = document.getElementById('replace-all-btn');

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
        submitBtn.classList.remove('bg-blue-500');
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
        submitBtn.classList.remove('bg-green-500');
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
                storiesListContainer.innerHTML = '<p>Brak opowiadań w bazie danych.</p>';
                return;
            }
            querySnapshot.forEach((doc) => {
                const story = { id: doc.id, ...doc.data() };
                const storyElement = document.createElement('div');
                storyElement.className = 'story-list-item';
                storyElement.innerHTML = `
                    <div>
                        <h3 class="font-bold">${story.title}</h3>
                        <p class="text-sm">${story.date}</p>
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

        if (!title.trim() || !date || !content.
