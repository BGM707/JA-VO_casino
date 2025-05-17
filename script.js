// API base URL (update to your backend URL)
const API_URL = 'http://localhost:5000/api';

// Store JWT token
let token = localStorage.getItem('token');

// DOM Elements
const homeLink = document.getElementById('home-link');
const gamesLink = document.getElementById('games-link');
const paymentLink = document.getElementById('payment-link');
const logoutLink = document.getElementById('logout-link');
const homeSection = document.getElementById('home-section');
const gamesSection = document.getElementById('games-section');
const paymentSection = document.getElementById('payment-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const playButtons = document.querySelectorAll('.play-button');
const guestPlayButton = document.getElementById('guest-play-button');
const guestToRegisterButton = document.getElementById('guest-to-register');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('transfer-receipt');
const submitPayment = document.getElementById('submit-payment');
const promoModal = document.getElementById('promo-modal');
const closeModalBtn = document.getElementById('close-modal');
const acceptPromoBtn = document.getElementById('accept-promo');
const randomPlayerNumber = document.getElementById('random-player-number');
const rouletteLayout = document.getElementById('roulette-layout');
const fruitsLayout = document.getElementById('fruits-layout');
const diceLayout = document.getElementById('dice-layout');
const guestRouletteLayout = document.getElementById('guest-roulette-layout');

// Check if user is logged in
function checkAuth() {
    if (token) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        logoutLink.style.display = 'inline';
        fetchUserProfile();
    } else {
        loginForm.style.display = 'block';
        logoutLink.style.display = 'none';
    }
}

// Fetch user profile and update balances
async function fetchUserProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();
        if (response.ok) {
            document.getElementById('roulette-balance').textContent = `$${user.balance.toLocaleString()}`;
            document.getElementById('fruit-balance').textContent = `$${user.balance.toLocaleString()}`;
            document.getElementById('dice-balance').textContent = `$${user.balance.toLocaleString()}`;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: user.message,
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
            localStorage.removeItem('token');
            token = null;
            checkAuth();
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

// Register a new user
async function registerUser(username, email, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            checkAuth();
            showSection('home-section');
            Swal.fire({
                icon: 'success',
                title: '¡Registro Exitoso!',
                text: data.message || 'Tu cuenta ha sido creada. ¡Bienvenido a Casino Royal!',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al registrarse. Intenta de nuevo.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
    }
}

// Show section
function showSection(sectionId) {
    homeSection.style.display = 'none';
    gamesSection.style.display = 'none';
    paymentSection.style.display = 'none';
    rouletteLayout.style.display = 'none';
    fruitsLayout.style.display = 'none';
    diceLayout.style.display = 'none';
    guestRouletteLayout.style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
}

// Show game
function showGame(gameId) {
    if (!token) {
        Swal.fire({
            icon: 'info',
            title: 'Inicia Sesión',
            text: 'Por favor inicia sesión para jugar.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        showSection('home-section');
        return;
    }
    rouletteLayout.style.display = 'none';
    fruitsLayout.style.display = 'none';
    diceLayout.style.display = 'none';
    guestRouletteLayout.style.display = 'none';
    if (gameId === 'roulette') {
        rouletteLayout.style.display = 'block';
        createRouletteWheel('roulette-wheel');
    } else if (gameId === 'fruits') {
        fruitsLayout.style.display = 'block';
        setupFruitMachine();
    } else if (gameId === 'dice') {
        diceLayout.style.display = 'block';
        setupDiceGame();
    }
}

// Show guest roulette
function showGuestRoulette() {
    showSection('home-section');
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    rouletteLayout.style.display = 'none';
    fruitsLayout.style.display = 'none';
    diceLayout.style.display = 'none';
    guestRouletteLayout.style.display = 'block';
    createRouletteWheel('guest-roulette-wheel');
    document.getElementById('guest-roulette-balance').textContent = '$10,000';
    document.getElementById('guest-roulette-spins').textContent = '5';
    document.getElementById('guest-current-bet').textContent = '$1,000';
}

// Navigation
homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('home-section');
    checkAuth();
});
gamesLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('games-section');
});
paymentLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (!token) {
        Swal.fire({
            icon: 'info',
            title: 'Inicia Sesión',
            text: 'Por favor inicia sesión para realizar un pago.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        showSection('home-section');
        return;
    }
    showSection('payment-section');
});
logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    token = null;
    checkAuth();
    showSection('home-section');
});

// Guest play
guestPlayButton.addEventListener('click', () => {
    showGuestRoulette();
});

// Guest to register
guestToRegisterButton.addEventListener('click', () => {
    showSection('home-section');
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    guestRouletteLayout.style.display = 'none';
});

// Login/Register toggle
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});
showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
});

// Login
loginButton.addEventListener('click', async () => {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            checkAuth();
            showSection('home-section');
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Inicio de sesión exitoso.',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al iniciar sesión.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
    }
});

// Register
registerButton.addEventListener('click', () => {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // Client-side validation
    if (!username || !email || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Campos Incompletos',
            text: 'Por favor completa todos los campos.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Correo Inválido',
            text: 'Por favor ingresa un correo electrónico válido.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }
    if (password.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Contraseña Corta',
            text: 'La contraseña debe tener al menos 6 caracteres.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }
    if (username.length < 3) {
        Swal.fire({
            icon: 'error',
            title: 'Usuario Inválido',
            text: 'El nombre de usuario debe tener al menos 3 caracteres.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }

    registerUser(username, email, password);
});

// Play buttons
playButtons.forEach(button => {
    button.addEventListener('click', () => {
        showSection('games-section');
        showGame(button.dataset.game);
    });
});

// Payment form
submitPayment.addEventListener('click', () => {
    const name = document.getElementById('payment-name').value;
    const rut = document.getElementById('payment-rut').value;
    const email = document.getElementById('payment-email').value;
    const game = document.getElementById('game-select').value;
    const count = document.getElementById('game-count').value;
    const prize = document.getElementById('prize-select').value;
    const terms = document.getElementById('terms').checked;
    if (!name || !rut || !email || !game || !count || !prize || !terms) {
        Swal.fire({
            icon: 'error',
            title: 'Formulario Incompleto',
            text: 'Por favor completa todos los campos requeridos y acepta los términos.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Correo Inválido',
            text: 'Correo electrónico inválido.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }
    Swal.fire({
        icon: 'success',
        title: 'Pago Enviado',
        text: 'Pago enviado correctamente. Pendiente de aprobación.',
        background: '#1e1e1e',
        color: '#fff',
        confirmButtonColor: '#e7a622'
    });
});

// File upload
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => e.preventDefault());
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
});
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && !['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
        Swal.fire({
            icon: 'error',
            title: 'Archivo No Válido',
            text: 'Solo se permiten archivos PNG, JPEG o PDF.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        fileInput.value = '';
    }
    if (file && file.size > 5 * 1024 * 1024) {
        Swal.fire({
            icon: 'error',
            title: 'Archivo Demasiado Grande',
            text: 'El archivo no debe exceder los 5MB.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        fileInput.value = '';
    }
});

// Modal
closeModalBtn.addEventListener('click', () => {
    promoModal.style.display = 'none';
});
acceptPromoBtn.addEventListener('click', () => {
    promoModal.style.display = 'none';
    showSection('payment-section');
});
randomPlayerNumber.textContent = Math.floor(Math.random() * 1000) + 1;
setTimeout(() => promoModal.style.display = 'flex', 5000);

// Roulette (shared for both guest and authenticated)
function createRouletteWheel(wheelId) {
    const wheel = document.getElementById(wheelId);
    wheel.innerHTML = '';
    const sections = [
        { value: '0', color: '#2ecc71', win: false }, // Losing section
        { value: '1', color: '#e74c3c', win: true },
        { value: '2', color: '#333', win: true }
    ];
    const angle = 360 / sections.length;
    sections.forEach((section, index) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'roulette-section';
        sectionDiv.style.transform = `rotate(${index * angle}deg) skewY(-${90 - angle}deg)`;
        sectionDiv.style.borderColor = `${section.color} transparent`;
        sectionDiv.innerHTML = `<span style="transform: rotate(${angle / 2}deg)">${section.value}</span>`;
        wheel.appendChild(sectionDiv);
    });
}

// Guest Roulette Spin
document.getElementById('guest-spin-roulette').addEventListener('click', () => {
    const wheel = document.getElementById('guest-roulette-wheel');
    const spins = document.getElementById('guest-roulette-spins');
    const balanceSpan = document.getElementById('guest-roulette-balance');
    const betSpan = document.getElementById('guest-current-bet');
    let spinsLeft = parseInt(spins.textContent);
    const bet = parseInt(betSpan.textContent.replace('$', '').replace(',', ''));

    if (spinsLeft <= 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin Giros',
            text: 'No te quedan giros. ¡Regístrate para jugar más!',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }
    if (parseInt(balanceSpan.textContent.replace('$', '').replace(',', '')) < bet) {
        Swal.fire({
            icon: 'info',
            title: 'Saldo Insuficiente',
            text: 'Saldo insuficiente. ¡Regístrate para obtener más fondos!',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }

    spinsLeft--;
    spins.textContent = spinsLeft;
    let balance = parseInt(balanceSpan.textContent.replace('$', '').replace(',', '')) - bet;
    balanceSpan.textContent = `$${balance.toLocaleString()}`;

    // Always land on section 0 (losing)
    const fixedAngle = 0 + 720; // Spin to section 0
    wheel.style.transform = `rotate(${fixedAngle}deg)`;

    setTimeout(() => {
        document.getElementById('guest-roulette-results').innerHTML += `<span>0</span>`;
        Swal.fire({
            icon: 'info',
            title: '¡Sigue Intentando!',
            text: 'No ganaste esta vez. ¡Regístrate para tener la oportunidad de ganar!',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
    }, 3000);
});

// Guest Bet Buttons
document.querySelectorAll('#guest-roulette-layout .bet-button').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('guest-current-bet').textContent = button.textContent;
    });
});

// Authenticated Roulette Spin
document.getElementById('spin-roulette').addEventListener('click', async () => {
    const wheel = document.getElementById('roulette-wheel');
    const spins = document.getElementById('roulette-spins');
    const balanceSpan = document.getElementById('roulette-balance');
    const betSpan = document.getElementById('current-bet');
    let spinsLeft = parseInt(spins.textContent);
    const bet = parseInt(betSpan.textContent.replace('$', '').replace(',', ''));

    if (spinsLeft <= 0) {
        Swal.fire({
            icon: 'info',
            title: 'Sin Giros',
            text: 'No te quedan giros.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        return;
    }

    try {
        const response = await fetch(`${API_URL}/play/roulette`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bet })
        });
        const data = await response.json();
        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
            return;
        }

        spinsLeft--;
        spins.textContent = spinsLeft;
        const randomAngle = Math.floor(Math.random() * 360) + 720;
        wheel.style.transform = `rotate(${randomAngle}deg)`;

        setTimeout(() => {
            const result = data.result;
            balanceSpan.textContent = `$${data.newBalance.toLocaleString()}`;
            document.getElementById('roulette-results').innerHTML += `<span>${result}</span>`;
            Swal.fire({
                icon: data.winnings > 0 ? 'success' : 'info',
                title: data.winnings > 0 ? '¡Ganaste!' : 'Sigue Intentando',
                text: `Resultado: ${result}. Ganaste $${data.winnings.toLocaleString()}!`,
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        }, 3000);
    } catch (error) {
        console.error('Error playing roulette:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al jugar ruleta.',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
    }
});

document.querySelectorAll('#roulette-layout .bet-button').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('current-bet').textContent = button.textContent;
    });
});

// Fruit Machine
function setupFruitMachine() {
    const fruits = ['🍎', '🍊', '🍇', '🍒', '🍋'];
    const slots = [
        document.getElementById('fruit-slot-1'),
        document.getElementById('fruit-slot-2'),
        document.getElementById('fruit-slot-3')
    ];
    const spinButton = document.getElementById('spin-fruits');
    const balanceSpan = document.getElementById('fruit-balance');
    const betSpan = document.getElementById('fruit-bet-amount');
    const spins = document.getElementById('fruit-spins');
    const decreaseBet = document.getElementById('decrease-bet');
    const increaseBet = document.getElementById('increase-bet');

    decreaseBet.addEventListener('click', () => {
        let bet = parseInt(betSpan.textContent.replace('$', '').replace(',', ''));
        if (bet > 1000) bet -= 1000;
        betSpan.textContent = `$${bet.toLocaleString()}`;
    });

    increaseBet.addEventListener('click', () => {
        let bet = parseInt(betSpan.textContent.replace('$', '').replace(',', ''));
        bet += 1000;
        betSpan.textContent = `$${bet.toLocaleString()}`;
    });

    spinButton.addEventListener('click', async () => {
        let spinsLeft = parseInt(spins.textContent);
        const bet = parseInt(betSpan.textContent.replace('$', '').replace(',', ''));

        if (spinsLeft <= 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin Giros',
                text: 'No te quedan giros.',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/play/fruits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bet })
            });
            const data = await response.json();
            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message,
                    background: '#1e1e1e',
                    color: '#fff',
                    confirmButtonColor: '#e7a622'
                });
                return;
            }

            spinsLeft--;
            spins.textContent = spinsLeft;
            slots.forEach(slot => {
                slot.textContent = fruits[Math.floor(Math.random() * fruits.length)];
            });

            balanceSpan.textContent = `$${data.newBalance.toLocaleString()}`;
            Swal.fire({
                icon: data.winnings > 0 ? 'success' : 'info',
                title: data.winnings > 0 ? '¡Ganaste!' : 'Sigue Intentando',
                text: data.winnings > 0 ? `¡Ganaste $${data.winnings.toLocaleString()}!` : 'No ganaste esta vez.',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        } catch (error) {
            console.error('Error playing fruits:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al jugar frutillas.',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        }
    });
}

// Dice Game
function setupDiceGame() {
    const rollButton = document.getElementById('roll-dice');
    const dice1 = document.getElementById('dice-1');
    const dice2 = document.getElementById('dice-2');
    const balanceSpan = document.getElementById('dice-balance');
    const betSpan = document.getElementById('dice-current-bet');
    const rolls = document.getElementById('dice-rolls');
    let currentBetOption = null;

    document.querySelectorAll('.dice-bet-option').forEach(button => {
        button.addEventListener('click', () => {
            currentBetOption = button.dataset.option;
            document.querySelectorAll('.dice-bet-option').forEach(btn => btn.style.backgroundColor = '');
            button.style.backgroundColor = '#f7b632';
        });
    });

    document.querySelectorAll('#dice-layout .bet-button').forEach(button => {
        button.addEventListener('click', () => {
            betSpan.textContent = button.textContent;
        });
    });

    rollButton.addEventListener('click', async () => {
        let rollsLeft = parseInt(rolls.textContent);
        const bet = parseInt(betSpan.textContent.replace('$', '').replace(',', ''));

        if (!currentBetOption) {
            Swal.fire({
                icon: 'info',
                title: 'Selecciona una Apuesta',
                text: 'Por favor selecciona una opción de apuesta.',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
            return;
        }
        if (rollsLeft <= 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin Lanzamientos',
                text: 'No te quedan lanzamientos.',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
            return;
        }

        try {
            const response = await fetch(`${API_URL}/play/dice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bet, option: currentBetOption })
            });
            const data = await response.json();
            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message,
                    background: '#1e1e1e',
                    color: '#fff',
                    confirmButtonColor: '#e7a622'
                });
                return;
            }

            rollsLeft--;
            rolls.textContent = rollsLeft;
            dice1.textContent = data.roll1;
            dice2.textContent = data.roll2;

            balanceSpan.textContent = `$${data.newBalance.toLocaleString()}`;
            document.getElementById('dice-results').innerHTML += `<span>${data.roll1} + ${data.roll2} = ${data.roll1 + data.roll2}</span>`;
            Swal.fire({
                icon: data.winnings > 0 ? 'success' : 'info',
                title: data.winnings > 0 ? '¡Ganaste!' : 'Sigue Intentando',
                text: data.winnings > 0 ? `¡Ganaste $${data.winnings.toLocaleString()}!` : 'No ganaste esta vez.',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        } catch (error) {
            console.error('Error playing dice:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al jugar dados.',
                background: '#1e1e1e',
                color: '#fff',
                confirmButtonColor: '#e7a622'
            });
        }
    });
}

// Initialize
checkAuth();