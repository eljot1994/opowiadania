document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');

    // Sprawdź, czy użytkownik jest już zalogowany. Jeśli tak, od razu przenieś go do panelu admina.
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            window.location.href = 'admin.html';
        }
    });

    // Obsłuż formularz logowania.
    if(loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            loginBtn.disabled = true;
            loginBtn.textContent = 'Logowanie...';

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    // Sukces - przekierowanie nastąpi automatycznie
                })
                .catch(error => {
                    alert(`Błąd logowania: ${error.message}`);
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Zaloguj się';
                });
        });
    }
});
