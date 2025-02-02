// Lista
const topAnimals = [
    "Islandia",
    "Dinamarca",
    "Irlanda",
    "Nova Zelândia",
    "Austria",
    "Singapura",
    "Portugal",
    "Eslovenia",
    "Japao",
    "Suiça"
  ];
  
  let guessedAnimals = new Set();
  let gameActive = true;
  let currentDate = new Date();
  let selectedDate = new Date();
  
  // Elementos do DOM
  const guessInput = document.getElementById('guessInput');
  const submitGuess = document.getElementById('submitGuess');
  const newGameBtn = document.getElementById('newGame');
  const giveUpBtn = document.getElementById('giveUp');
  const squares = document.querySelectorAll('.square');
  const virtualKeyboard = document.querySelector('.virtual-keyboard');
  const tutorialModal = document.getElementById('tutorialModal');
  const closeTutorialBtn = document.getElementById('closeTutorial');
  const howToPlayLink = document.getElementById('howToPlay');
  const calendarModal = document.getElementById('calendarModal');
  const calendarContent = document.getElementById('calendar-content');
  const closeCalendarBtn = document.getElementById('closeCalendar');
  
  // Função para formatar data
  function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // Função para verificar se uma data é jogável
  function isPlayableDate(date) {
    const startDate = new Date(2025, 1, 1); // Fevereiro de 2025
    return date >= startDate && date <= currentDate;
  }
  
  // Função para obter o status do jogo para uma data
  function getGameStatus(dateStr) {
    const status = localStorage.getItem(`game_status_${dateStr}`);
    return status || null;
  }
  
  // Função para salvar o status do jogo
  function saveGameStatus(status) {
    const dateStr = formatDate(selectedDate);
    localStorage.setItem(`game_status_${dateStr}`, status);
  }
  
  // Função para criar o calendário
  function createCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
    let calendarHTML = `
        <div class="calendar-header">
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
            <div class="weekday">Sáb</div>
    `;
  
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
  
        calendar += `
            <div class="${classes}" data-date="${dateStr}">
                ${day}
            </div>
        `;
        day++;
    }
  
    calendarHTML += calendar + '</div>';
    return calendarHTML;
  }
  
  // Função para mostrar o calendário
  function showCalendar() {
    calendarModal.classList.add('show');
    updateCalendar();
  }
  
  // Função para atualizar o calendário
  function updateCalendar() {
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
  
  // Função para mostrar erro
  function showError() {
    const input = document.getElementById('guessInput');
    const errorMessage = document.querySelector('.error-message');
    
    input.classList.add('error');
    errorMessage.classList.add('show');
    
    // Remove as classes após a animação
    setTimeout(() => {
        input.classList.remove('error');
        errorMessage.classList.remove('show');
    }, 2000);
  }
  
  // Função para mostrar o modal
  function showModal() {
    tutorialModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  // Função para esconder o modal
  function hideModal() {
    tutorialModal.classList.remove('show');
    document.body.style.overflow = '';
    localStorage.setItem('tutorialSeen', 'true');
  }
  
  // Verificar se é a primeira visita
  if (!localStorage.getItem('tutorialSeen')) {
    showModal();
  }
  
  // Event listeners para o modal
  closeTutorialBtn.addEventListener('click', hideModal);
  howToPlayLink.addEventListener('click', (e) => {
    e.preventDefault();
    showModal();
  });
  
  // Event listeners para o calendário
  newGameBtn.addEventListener('click', showCalendar);
  closeCalendarBtn.addEventListener('click', () => {
    calendarModal.classList.remove('show');
  });
  
  // Fechar modal ao clicar fora
  tutorialModal.addEventListener('click', (e) => {
    if (e.target === tutorialModal) {
        hideModal();
    }
  });
  
  calendarModal.addEventListener('click', (e) => {
    if (e.target === calendarModal) {
        calendarModal.classList.remove('show');
    }
  });
  
  // Função para inicializar o jogo
  function initGame() {
    guessedAnimals.clear();
    gameActive = true;
    squares.forEach(square => {
        square.textContent = square.dataset.position;
        square.classList.remove('revealed');
    });
    guessInput.value = '';
    guessInput.disabled = false;
    submitGuess.disabled = false;
  }
  
  // Função para revelar todas as respostas
  function revealAllAnswers() {
    topAnimals.forEach((animal, index) => {
        const square = document.querySelector(`[data-position="${index + 1}"]`);
        square.textContent = animal;
        square.classList.add('revealed');
    });
    gameActive = false;
    guessInput.disabled = true;
    submitGuess.disabled = true;
    saveGameStatus('gaveup');
  }
  
  // Função para verificar a tentativa
  function checkGuess(guess) {
    const normalizedGuess = guess.toLowerCase().trim();
    const index = topAnimals.findIndex(animal => 
        animal.toLowerCase() === normalizedGuess
    );
  
    if (index !== -1 && !guessedAnimals.has(index)) {
        guessedAnimals.add(index);
        const square = document.querySelector(`[data-position="${index + 1}"]`);
        square.textContent = topAnimals[index];
        square.classList.add('revealed');
  
        // Verificar se o jogo acabou
        if (guessedAnimals.size === topAnimals.length) {
            gameActive = false;
            saveGameStatus('completed');
            alert('Parabéns! Você completou o jogo!');
        }
        return true;
    }
    return false;
  }
  
  // Event Listeners
  submitGuess.addEventListener('click', () => {
    if (!gameActive) return;
    const guess = guessInput.value;
    if (guess.trim() === '') return;
  
    if (!checkGuess(guess)) {
        showError();
    }
    guessInput.value = '';
  });
  
  giveUpBtn.addEventListener('click', () => {
    if (!gameActive) return;
    if (confirm('Tem certeza que deseja desistir? Todas as respostas serão reveladas.')) {
        revealAllAnswers();
    }
  });
  
  // Teclado Virtual
  virtualKeyboard.addEventListener('click', (e) => {
    if (e.target.classList.contains('key')) {
        const key = e.target.textContent;
        
        if (key === '⌫') {
            guessInput.value = guessInput.value.slice(0, -1);
        } else if (key === 'ESPAÇO') {
            guessInput.value += ' ';
        } else {
            guessInput.value += key;
        }
        guessInput.focus();
    }
  });
  
  // Tecla Enter para enviar
  guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitGuess.click();
    }
  });
  
  // Inicializar o jogo
  initGame();