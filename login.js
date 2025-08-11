const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logowanie...';

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Logowanie pomyślne, przekieruj do panelu admina
            console.log('Zalogowano pomyślnie:', userCredential.user);
            window.location.href = 'admin.html';
        })
        .catch((error) => {
            console.error('Błąd logowania:', error);
            alert(`Błąd logowania: ${error.message}`);
            loginBtn.disabled = false;
            loginBtn.textContent = 'Zaloguj się';
        });
});
