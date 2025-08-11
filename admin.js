document.addEventListener('DOMContentLoaded', () => {
    
    // --- Elementy DOM ---
    const loader = document.getElementById('loader');
    const adminPanel = document.getElementById('admin-panel');
    const addStoryForm = document.getElementById('addStoryForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const storyIdInput = document.getElementById('storyId');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const titleInput = document.getElementById('title');
    const dateInput = document.getElementById('date');
    
    const previewBtn = document.getElementById('previewBtn');
    const showHtmlBtn = document.getElementById('showHtmlBtn');
    const previewWrapper = document.getElementById('preview-wrapper');
    const previewTitle = document.getElementById('preview-title');
    const visualPreview = document.getElementById('visual-preview');
    const htmlPreview = document.getElementById('html-preview');
    const previewStoryContainer = document.getElementById('preview-story-container');

    const findInput = document.getElementById('find-input');
    const replaceInput = document.getElementById('replace-input');
    const replaceBtn = document.getElementById('replace-btn');
    const replaceAllBtn = document.getElementById('replace-all-btn');

    const showStoriesBtn = document.getElementById('show-stories-btn');
    const storiesModal = document.getElementById('stories-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const storiesListContainer = document.getElementById('stories-list-container');


    // --- Inicjalizacja edytora Pell ---
    const editor = pell.init({
        element: document.getElementById('editor'),
        defaultParagraphSeparator: 'p', 
        styleWithCSS: false,
        actions: ['bold', 'italic', 'underline'],
        classes: { actionbar: 'pell-actionbar', button: 'pell-button', content: 'pell-content', selected: 'pell-button-selected' }
    });
    
    // --- Logika Uwierzytelniania ---
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loader.style.display = 'none';
            adminPanel.style.display = 'block';
            loadStories();
        } else {
            window.location.href = 'login.html';
        }
    });
    
    // --- Logika Modala ---
    showStoriesBtn.addEventListener('click', () => { storiesModal.classList.remove('hidden'); });
    closeModalBtn.addEventListener('click', () => { storiesModal.classList.add('hidden'); });
    storiesModal.addEventListener('click', (e) => { if (e.target === storiesModal) storiesModal.classList.add('hidden'); });

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
                storyElement.innerHTML = `<div><h3 class="font-bold">${story.title}</h3><p class="text-sm">${story.date}</p></div><div class="flex space-x-2"><button class="edit-btn" data-id="${story.id}"><i class="fas fa-edit text-blue-500 hover:text-blue-700"></i></button><button class="delete-btn" data-id="${story.id}"><i class="fas fa-trash text-red-500 hover:text-red-700"></i></button></div>`;
                storiesListContainer.appendChild(storyElement);
            });

            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.closest('button').dataset.id;
                    db.collection("stories").doc(id).get().then((doc) => {
                        if (doc.exists) {
                           setEditMode({ id: doc.id, ...doc.data() });
                           storiesModal.classList.add('hidden');
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
        if (!title.trim() || !date || !content.trim()) { alert('Tytuł, data i treść nie mogą być puste.'); return; }
        submitBtn.disabled = true;
        const storyData = { title, date, content };
        const operation = storyId ? db.collection("stories").doc(storyId).update(storyData) : db.collection("stories").add(storyData);
        operation.then(() => { setAddMode(); }).finally(() => { submitBtn.disabled = false; });
    });

    previewBtn.addEventListener('click', () => {
        const contentHTML = editor.content.innerHTML;
        if (!contentHTML.trim()) { alert("Brak treści do podglądu."); return; }
        const title = titleInput.value || "Przykładowy Tytuł";
        const date = dateInput.value;
        const formattedDate = date ? new Date(date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" }) : "Przykładowa Data";
        const author = "Jarosław Derda";
        previewStoryContainer.innerHTML = `<div class="preview-story-date">${formattedDate}</div><div class="preview-story-author">${author}</div><div class="preview-story-title">${title}</div><div class="preview-prose">${contentHTML}</div>`;
        previewTitle.textContent = 'Podgląd (Styl: Jasny)';
        visualPreview.classList.remove('hidden');
        htmlPreview.classList.add('hidden');
        previewWrapper.classList.remove('hidden');
    });

    showHtmlBtn.addEventListener('click', () => {
        const contentHTML = editor.content.innerHTML;
        if (!contentHTML.trim()) { alert("Brak treści do podglądu."); return; }
        htmlPreview.querySelector('code').textContent = contentHTML;
        previewTitle.textContent = 'Kod HTML';
        visualPreview.classList.add('hidden');
        htmlPreview.classList.remove('hidden');
        previewWrapper.classList.remove('hidden');
    });

    function escapeRegExp(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function formatBreaksToParagraphs(htmlContent) { if (!htmlContent.includes('<br')) return htmlContent; const blocks = htmlContent.split(/<br\s*\/?>/i); return blocks.map(block => block.trim()).filter(block => block.length > 0).map(block => { if (block.startsWith('<p>') && block.endsWith('</p>')) return block; return `<p>${block}</p>`; }).join(''); }

    replaceBtn.addEventListener('click', () => {
        const findText = findInput.value;
        let replaceText = replaceInput.value;
        if (!findText) return;
        let isNewlineReplacement = (replaceText === '\\n');
        if (isNewlineReplacement) replaceText = '<br>';
        editor.content.innerHTML = editor.content.innerHTML.replace(findText, replaceText);
        if (isNewlineReplacement) editor.content.innerHTML = formatBreaksToParagraphs(editor.content.innerHTML);
    });

    replaceAllBtn.addEventListener('click', () => {
        const findText = findInput.value;
        let replaceText = replaceInput.value;
        if (!findText) return;
        let isNewlineReplacement = (replaceText === '\\n');
        if (isNewlineReplacement) replaceText = '<br>';
        const regex = new RegExp(escapeRegExp(findText), 'g');
        editor.content.innerHTML = editor.content.innerHTML.replace(regex, replaceText);
        if (isNewlineReplacement) editor.content.innerHTML = formatBreaksToParagraphs(editor.content.innerHTML);
    });

    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
});
