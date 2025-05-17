// API base URL
const API_URL = 'http://localhost:5000/api';

// Store JWT token
let token = localStorage.getItem('token');

// DOM Elements
const usersLink = document.getElementById('users-link');
const paymentsLink = document.getElementById('payments-link');
const statsLink = document.getElementById('stats-link');
const logoutLink = document.getElementById('logout-link');
const usersSection = document.getElementById('users-section');
const paymentsSection = document.getElementById('payments-section');
const statsSection = document.getElementById('stats-section');
const usersTableBody = document.querySelector('#users-table tbody');
const paymentsTableBody = document.querySelector('#payments-table tbody');
const totalUsers = document.getElementById('total-users');
const totalBets = document.getElementById('total-bets');
const totalWinnings = document.getElementById('total-winnings');
const totalRouletteSpins = document.getElementById('total-roulette-spins');
const totalFruitSpins = document.getElementById('total-fruit-spins');
const totalDiceRolls = document.getElementById('total-dice-rolls');
const totalPayments = document.getElementById('total-payments');
const pendingPayments = document.getElementById('pending-payments');

// Check authentication and admin status on page load
async function checkAuth() {
    if (!token) {
        showLoginAlert();
        return;
    }
    try {
        const response = await fetch(`${API_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await response.json();
        if (!response.ok || !user.isAdmin) {
            showLoginAlert();
        } else {
            // Load initial data
            fetchUsers();
            fetchPayments();
            fetchStats();
            showSection('users-section');
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        showLoginAlert();
    }
}

// Show login alert and redirect
function showLoginAlert() {
    Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'Debes iniciar sesión como administrador.',
        background: '#1e1e1e',
        color: '#fff',
        confirmButtonColor: '#e7a622'
    }).then(() => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
}

// Show section
function showSection(sectionId) {
    usersSection.style.display = 'none';
    paymentsSection.style.display = 'none';
    statsSection.style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
}

// Fetch and display users
async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        if (!response.ok) {
            throw new Error(users.message || 'Error al obtener usuarios.');
        }
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user._id}</td>
                <td><input type="text" value="${user.username}" data-field="username"></td>
                <td><input type="email" value="${user.email}" data-field="email"></td>
                <td><input type="number" value="${user.balance}" data-field="balance"></td>
                <td><input type="number" value="${user.rouletteSpins}" data-field="rouletteSpins"></td>
                <td><input type="number" value="${user.fruitSpins}" data-field="fruitSpins"></td>
                <td><input type="number" value="${user.diceRolls}" data-field="diceRolls"></td>
                <td><input type="checkbox" ${user.isAdmin ? 'checked' : ''} data-field="isAdmin"></td>
                <td>
                    <button onclick="updateUser('${user._id}', this)">Actualizar</button>
                    <button onclick="deleteUser('${user._id}')">Eliminar</button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
    }
}

// Update user
async function updateUser(userId, button) {
    const row = button.closest('tr');
    const inputs = row.querySelectorAll('input');
    const userData = {
        username: inputs[0].value,
        email: inputs[1].value,
        balance: parseInt(inputs[2].value) || 0,
        rouletteSpins: parseInt(inputs[3].value) || 0,
        fruitSpins: parseInt(inputs[4].value) || 0,
        diceRolls: parseInt(inputs[5].value) || 0,
        isAdmin: inputs[6].checked
    };
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Error al actualizar usuario.');
        }
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: result.message,
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
        fetchUsers(); // Refresh table
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
    }
}

// Delete user
async function deleteUser(userId) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e7a622',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#1e1e1e',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Error al eliminar usuario.');
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: result.message,
                    background: '#1e1e1e',
                    color: '#fff',
                    confirmButtonColor: '#e7a622'
                });
                fetchUsers(); // Refresh table
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                    background: '#1e1e1e',
                    color: '#fff',
                    confirmButtonColor: '#e7a622'
                });
            }
        }
    });
}

// Fetch and display payments
async function fetchPayments() {
    try {
        const response = await fetch(`${API_URL}/admin/payments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const payments = await response.json();
        if (!response.ok) {
            throw new Error(payments.message || 'Error al obtener pagos.');
        }
        paymentsTableBody.innerHTML = '';
        payments.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment._id}</td>
                <td>${payment.userId.username}</td>
                <td>${payment.email}</td>
                <td>${payment.game}</td>
                <td>${payment.count}</td>
                <td>${payment.prize}</td>
                <td>${payment.status}</td>
                <td>${payment.receiptUrl ? `<a href="${payment.receiptUrl}" target="_blank">Ver</a>` : 'N/A'}</td>
                <td>
                    ${payment.status === 'pending' ? `
                        <button onclick="updatePayment('${payment._id}', 'approved')">Aprobar</button>
                        <button onclick="updatePayment('${payment._id}', 'rejected')">Rechazar</button>
                    ` : 'N/A'}
                </td>
            `;
            paymentsTableBody.appendChild(row);
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
    }
}

// Update payment status
async function updatePayment(paymentId, status) {
    Swal.fire({
        title: `¿${status === 'approved' ? 'Aprobar' : 'Rechazar'} pago?`,
        text: `Esta acción cambiará el estado del pago a ${status === 'approved' ? 'aprobado' : 'rechazado'}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e7a622',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        background: '#1e1e1e',
        color: '#fff'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/admin/payments/${paymentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Error al actualizar pago.');
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: result.message,
                    background: '#1e1e1e',
                    color: '#fff',
                    confirmButtonColor: '#e7a622'
                });
                fetchPayments(); // Refresh table
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                    background: '#1e1e1e',
                    color: '#fff',
                    confirmButtonColor: '#e7a622'
                });
            }
        }
    });
}

// Fetch and display statistics
async function fetchStats() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await response.json();
        if (!response.ok) {
            throw new Error(stats.message || 'Error al obtener estadísticas.');
        }
        totalUsers.textContent = stats.totalUsers;
        totalBets.textContent = `$${stats.totalBets.toLocaleString()}`;
        totalWinnings.textContent = `$${stats.totalWinnings.toLocaleString()}`;
        totalRouletteSpins.textContent = stats.totalSpins.roulette;
        totalFruitSpins.textContent = stats.totalSpins.fruits;
        totalDiceRolls.textContent = stats.totalSpins.dice;
        totalPayments.textContent = stats.totalPayments;
        pendingPayments.textContent = stats.pendingPayments;
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#e7a622'
        });
    }
}

// Event listeners for navigation
usersLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('users-section');
    fetchUsers();
});

paymentsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('payments-section');
    fetchPayments();
});

statsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('stats-section');
    fetchStats();
});

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: 'Serás redirigido a la página principal.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e7a622',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        background: '#1e1e1e',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        }
    });
});
// Mostrar secciones según navegación
document.getElementById("users-link").addEventListener("click", () => {
    mostrarSeccion("users-section");
});
document.getElementById("payments-link").addEventListener("click", () => {
    mostrarSeccion("payments-section");
});
document.getElementById("stats-link").addEventListener("click", () => {
    mostrarSeccion("stats-section");
});
document.getElementById("logout-link").addEventListener("click", () => {
    Swal.fire("Sesión cerrada", "Has salido del panel.", "info");
    // Aquí podrías redireccionar al login si deseas
});

function mostrarSeccion(id) {
    document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// Agrega esta opción al menú para navegar a la nueva sección
const nav = document.querySelector(".navigation");
const nuevaOpcion = document.createElement("a");
nuevaOpcion.textContent = "Asignar Fichas";
nuevaOpcion.href = "#";
nuevaOpcion.onclick = () => mostrarSeccion("assign-credit-section");
nav.appendChild(nuevaOpcion);

// Funciones del panel de asignación de fichas
let nicknameActual = "";

function buscarUsuario() {
    const nickname = document.getElementById("nickname").value;
    fetch(`http://localhost:8000/users/profile/${nickname}`)
        .then(res => {
            if (!res.ok) throw new Error("Usuario no encontrado");
            return res.json();
        })
        .then(data => {
            nicknameActual = data.nickname;
            document.getElementById("nombre").innerText = data.name;
            document.getElementById("correo").innerText = data.email;
            document.getElementById("fichas").innerText = data.credit;
            document.getElementById("info").style.display = "block";
            document.getElementById("estado").innerText = "";
        })
        .catch(err => {
            document.getElementById("estado").innerText = err.message;
            document.getElementById("info").style.display = "none";
        });
}

function asignarFichas() {
    const monto = parseInt(document.getElementById("monto").value);
    const codigo = document.getElementById("codigo").value;

    fetch("http://localhost:8000/admin/add-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nickname: nicknameActual,
            amount: monto,
            code: codigo
        })
    })
    .then(res => res.json())
    .then(data => {
        Swal.fire("Fichas Asignadas", data.msg, "success");
        buscarUsuario();
    })
    .catch(err => {
        Swal.fire("Error", err.message, "error");
    });
}
// Initialize page
checkAuth();