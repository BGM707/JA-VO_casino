document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const moleGrid = document.getElementById('moleGrid');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const helpBtn = document.getElementById('helpBtn');
    const hitCountEl = document.getElementById('hitCount');
    const moleCountEl = document.getElementById('moleCount');
    const winProbabilityEl = document.getElementById('winProbability');
    const finalProbabilityEl = document.getElementById('finalProbability');
    const finalHitsEl = document.getElementById('finalHits');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const hammer = document.getElementById('hammer');
    const jackpotAlert = document.getElementById('jackpotAlert');
    
    // Modales
    const winModal = new bootstrap.Modal(document.getElementById('winModal'));
    const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
    
    // Constantes y variables del juego
    const totalMoles = 20; // Cantidad de topos en la cuadrícula
    const initialProbability = 1000; // Probabilidad inicial (1 en 1000)
    let goldMoleIndex = -1; // Índice del topo de oro
    let hitCount = 0; // Contador de golpes
    let moleCount = 0; // Contador de topos eliminados
    let currentProbability = initialProbability; // Probabilidad actual
    let gameActive = false; // Estado del juego
    let holeElements = []; // Array para guardar los elementos de los agujeros
    
    // Inicialización del juego
    function initGame() {
        // Crear cuadrícula de topos
        moleGrid.innerHTML = '';
        holeElements = [];
        
        for (let i = 0; i < totalMoles; i++) {
            const hole = document.createElement('div');
            hole.className = 'mole-hole';
            
            const mole = document.createElement('div');
            mole.className = 'mole';
            mole.dataset.index = i;
            
            hole.appendChild(mole);
            moleGrid.appendChild(hole);
            holeElements.push({ hole, mole });
            
            // Añadir evento de clic
            hole.addEventListener('click', function(e) {
                if (!gameActive) return;
                hitMole(i, e);
            });
        }
        
        // Reiniciar contadores
        hitCount = 0;
        moleCount = 0;
        currentProbability = initialProbability;
        
        // Actualizar UI
        updateStats();
        
        // Actualizar botones
        startBtn.disabled = false;
        resetBtn.disabled = true;
    }
    
    // Función para iniciar el juego
    function startGame() {
        gameActive = true;
        
        // Determinar cuál será el topo de oro (probabilidad 1 en 1000)
        if (Math.random() * initialProbability < 1) {
            goldMoleIndex = Math.floor(Math.random() * totalMoles);
        } else {
            goldMoleIndex = -1; // No hay topo de oro en esta ronda
        }
        
        // Mostrar todos los topos
        holeElements.forEach(({ mole }) => {
            mole.classList.add('mole-visible');
            if (goldMoleIndex === parseInt(mole.dataset.index)) {
                mole.classList.add('mole-gold');
            }
        });
        
        // Actualizar botones
        startBtn.disabled = true;
        resetBtn.disabled = false;
    }
    
    // Función para manejar el golpe a un topo
    function hitMole(index, event) {
        if (!gameActive) return;
        
        hitCount++;
        const { hole, mole } = holeElements[index];
        
        // Mostrar animación de martillo
        showHammer(event);
        
        // Animar golpe
        hole.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
            hole.classList.remove('animate__animated', 'animate__pulse');
        }, 500);
        
        // Verificar si es el topo de oro
        if (index === goldMoleIndex) {
            gameActive = false;
            mole.classList.add('mole-hit');
            triggerWin();
            return;
        }
        
        // Topo normal: eliminarlo
        mole.classList.remove('mole-visible');
        moleCount++;
        
        // Actualizar probabilidad
        if (moleCount < totalMoles) {
            currentProbability = Math.round(initialProbability / (totalMoles - moleCount));
        }
        
        // Actualizar estadísticas
        updateStats();
        
        // Verificar si se eliminaron todos los topos
        if (moleCount === totalMoles) {
            gameActive = false;
            resetBtn.disabled = false;
            startBtn.disabled = true;
        }
    }
    
    // Actualizar estadísticas en la UI
    function updateStats() {
        hitCountEl.textContent = hitCount;
        moleCountEl.textContent = moleCount;
        winProbabilityEl.textContent = `1 en ${currentProbability}`;
    }
    
    // Mostrar animación de martillo
    function showHammer(event) {
        hammer.style.display = 'block';
        hammer.style.left = `${event.clientX - 25}px`;
        hammer.style.top = `${event.clientY - 25}px`;
        
        hammer.classList.add('animate__animated', 'animate__swing');
        setTimeout(() => {
            hammer.classList.remove('animate__animated', 'animate__swing');
            hammer.style.display = 'none';
        }, 500);
    }
    
    // Activar confeti
    function triggerConfetti() {
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.backgroundColor = Math.random() > 0.5 ? 'var(--secondary-color)' : 'var(--primary-color)';
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }
    }
    
    // Activar condición de victoria
    function triggerWin() {
        // Mostrar alerta de jackpot
        jackpotAlert.style.display = 'block';
        setTimeout(() => {
            jackpotAlert.style.display = 'none';
        }, 2000);
        
        // Activar confeti
        triggerConfetti();
        
        // Actualizar modal de victoria
        finalProbabilityEl.textContent = `1 en ${currentProbability}`;
        finalHitsEl.textContent = hitCount;
        
        // Mostrar modal
        winModal.show();
    }
    
    // Reiniciar juego
    function resetGame() {
        gameActive = false;
        goldMoleIndex = -1;
        initGame();
    }
    
    // Event Listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    helpBtn.addEventListener('click', () => helpModal.show());
    playAgainBtn.addEventListener('click', () => {
        winModal.hide();
        resetGame();
    });
    
    // Inicializar juego al cargar
    initGame();
});