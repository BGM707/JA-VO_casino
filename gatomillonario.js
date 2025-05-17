document.addEventListener('DOMContentLoaded', () => {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    const spinCountDisplay = document.getElementById('spinCount');
    const stats = {
        majorWins: document.getElementById('majorWins'),
        mediumWins: document.getElementById('mediumWins'),
        minorWins: document.getElementById('minorWins'),
        noWins: document.getElementById('noWins')
    };
    
    const totalSections = 29;
    const sectionAngle = 360 / totalSections;
    let spinCount = 0;
    let statsData = { major: 0, medium: 0, minor: 0, none: 0 };

    // Definir premios
    const prizes = [
        { name: 'Premio Mayor', icon: '👑', color: '#FFD700', count: 1 },
        { name: 'Premio Mediano', icon: '💰', color: '#C0C0C0', count: 3 },
        { name: 'Premio Menor', icon: '🎁', color: '#CD7F32', count: 5 },
        { name: 'Sin Premio', icon: '❌', color: '#4B5563', count: 20 }
    ];

    // Crear segmentos
    let sections = [];
    prizes.forEach(prize => {
        for (let i = 0; i < prize.count; i++) {
            sections.push({ name: prize.name, icon: prize.icon, color: prize.color });
        }
    });
    sections = shuffleArray(sections);

    // Generar ruleta
    sections.forEach((section, i) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'wheel-section';
        sectionDiv.style.transform = `rotate(${i * sectionAngle}deg)`;
        sectionDiv.style.backgroundColor = section.color;

        const content = document.createElement('div');
        content.style.transform = `rotate(${90 + sectionAngle / 2}deg)`;
        content.style.marginLeft = '100px';
        content.innerHTML = `<span>${section.icon}</span>`;
        
        sectionDiv.appendChild(content);
        wheel.appendChild(sectionDiv);
    });

    // Evento para girar
    spinButton.addEventListener('click', () => {
        spinButton.disabled = true;
        spinButton.classList.add('opacity-50');
        spinCount++;
        spinCountDisplay.textContent = spinCount;

        wheel.style.transition = 'none';
        wheel.style.transform = `rotate(0deg)`;
        void wheel.offsetWidth; // Forzar reflow

        const randomDegrees = Math.floor(Math.random() * 360);
        const rotations = 5;
        const finalRotation = rotations * 360 + randomDegrees;

        wheel.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.3, 1)';
        wheel.style.transform = `rotate(${finalRotation}deg)`;

        setTimeout(() => {
            const normalizedDegrees = randomDegrees % 360;
            const sectionIndex = Math.floor(normalizedDegrees / sectionAngle);
            const prize = sections[sectionIndex];

            // Actualizar estadísticas
            if (prize.name === 'Premio Mayor') statsData.major++;
            else if (prize.name === 'Premio Mediano') statsData.medium++;
            else if (prize.name === 'Premio Menor') statsData.minor++;
            else statsData.none++;
            
            stats.majorWins.textContent = statsData.major;
            stats.mediumWins.textContent = statsData.medium;
            stats.minorWins.textContent = statsData.minor;
            stats.noWins.textContent = statsData.none;

            // Mostrar resultado con SweetAlert2
            Swal.fire({
                title: prize.name === 'Sin Premio' ? '¡Sigue intentando! 😿' : `¡${prize.name}! 🎉`,
                text: getPrizeMessage(prize.name),
                icon: prize.name === 'Sin Premio' ? 'error' : 'success',
                confirmButtonText: 'Jugar de nuevo',
                confirmButtonColor: '#EAB308',
                background: '#1F2937',
                color: '#FFF',
                showCloseButton: true,
                imageUrl: prize.name !== 'Sin Premio' ? 'https://via.placeholder.com/100' : null,
                imageAlt: 'Premio'
            });

            spinButton.disabled = false;
            spinButton.classList.remove('opacity-50');
        }, 5000);
    });

    // Mensajes personalizados
    function getPrizeMessage(prizeName) {
        switch (prizeName) {
            case 'Premio Mayor': return '¡Increíble! Ganaste el PREMIO MAYOR. El Gato Millonario te aplaude.';
            case 'Premio Mediano': return '¡Bien hecho! Un Premio Mediano para ti. ¡Sigue así!';
            case 'Premio Menor': return '¡Buen giro! Ganaste un Premio Menor. ¡A por el mayor!';
            default: return 'No hay premio esta vez, pero el Gato Millonario cree en ti.';
        }
    }

    // Mezclar array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});