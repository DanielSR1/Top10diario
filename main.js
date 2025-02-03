let currentDate = new Date();
let selectedDate = new Date();

// Função para formatar data
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Função para verificar se uma data é jogável
function isPlayableDate(date) {
    const startDate = new Date(2024, 0, 1); // Janeiro de 2024
    return date >= startDate && date <= currentDate;
}

// Função para obter o status do jogo para uma data
function getGameStatus(dateStr) {
    const status = localStorage.getItem(`game_status_${dateStr}`);
    return status || null;
}

// Função para criar o calendário
function createCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    let calendarHTML = 
        `<div class="calendar-header">
            <button class="btn calendar-nav" id="prevMonth">&lt;</button>
            <h3>${monthNames[month]} ${year}</h3>
            <button class="btn calendar-nav" id="nextMonth">&gt;</button>
        </div>
        <div class="calendar-grid">
            <div class="weekday">Dom</div>
            <div class="weekday">Seg</div>
            <div class="weekday">Ter</div>
            <div class="weekday">Qua</div>
            <div class="weekday">Qui</div>
            <div class="weekday">Sex</div>
            <div class="weekday">Sáb</div>`;

    let day = 1;
    let calendar = '';

    // Preencher dias vazios no início
    for (let i = 0; i < startingDay; i++) {
        calendar += '<div class="calendar-day empty"></div>';
    }

    // Preencher os dias do mês
    while (day <= monthLength) {
        const currentDate = new Date(year, month, day);
        const dateStr = formatDate(currentDate);
        const status = getGameStatus(dateStr);
        const isPlayable = isPlayableDate(currentDate);

        let classes = 'calendar-day';
        if (!isPlayable) classes += ' future';
        if (status === 'completed') classes += ' completed';
        if (status === 'gaveup') classes += ' gaveup';

        calendar += 
            `<div class="${classes}" data-date="${dateStr}">
                ${day}
            </div>`;
        day++;
    }

    calendarHTML += calendar + '</div>';
    return calendarHTML;
}

// Função para mostrar o calendário
function showCalendar() {
    const calendarModal = document.getElementById('calendarModal');
    calendarModal.style.display = 'flex';
    setTimeout(() => calendarModal.classList.add('show'), 10);
    updateCalendar();
}

// Função para fechar o calendário
function closeCalendar() {
    const calendarModal = document.getElementById('calendarModal');
    calendarModal.classList.remove('show');
    setTimeout(() => calendarModal.style.display = 'none', 300);
}

// Função para atualizar o calendário
function updateCalendar() {
    const calendarContent = document.getElementById('calendar-content');
    calendarContent.innerHTML = createCalendar(selectedDate.getFullYear(), selectedDate.getMonth());
    
    // Event listeners para navegação do calendário
    document.getElementById('prevMonth').addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() - 1);
        updateCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        const nextMonth = new Date(selectedDate);
        nextMonth.setMonth(selectedDate.getMonth() + 1);
        if (nextMonth <= currentDate) {
            selectedDate = nextMonth;
            updateCalendar();
        }
    });

    // Event listeners para os dias
    const days = document.querySelectorAll('.calendar-day:not(.empty):not(.future)');
    days.forEach(day => {
        day.addEventListener('click', () => {
            const dateStr = day.dataset.date;
            if (dateStr) {
                window.location.href = `/diarios/${dateStr}.html`;
            }
        });
    });
}

// Função para carregar o jogo diário baseado na data
function loadDailyGame() {
    const currentDate = formatDate(new Date());
    const gameUrl = `/diarios/${currentDate}.html`;
    window.location.href = gameUrl;
}

// Função para mostrar o modal de tutorial
function showTutorial() {
    const modal = document.getElementById('tutorialModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

// Função para fechar o modal de tutorial
function closeTutorial() {
    const modal = document.getElementById('tutorialModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Event Listeners
document.getElementById('howToPlay').addEventListener('click', (e) => {
    e.preventDefault();
    showTutorial();
});

document.getElementById('closeTutorial').addEventListener('click', closeTutorial);

document.getElementById('playToday').addEventListener('click', loadDailyGame);

document.getElementById('playPrevious').addEventListener('click', showCalendar);

document.getElementById('closeCalendar').addEventListener('click', closeCalendar);

// Simulação de estatísticas
document.getElementById('todayPlayers').textContent = '142';
document.getElementById('totalGames').textContent = '1,837';