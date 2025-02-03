import { dailyThemes } from './data.js';

// Estado do jogo
let guessedAnswers = new Set();
let gameActive = true;
let currentDate = new Date();
let selectedDate = new Date();

// Elementos do DOM
const guessInput = document.getElementById('guessInput');
const submitGuess = document.getElementById('submitGuess');
const newGameBtn = document.getElementById('newGame');
const giveUpBtn = document.getElementById('giveUp');
const squares = document.querySelectorAll('.square');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorialBtn = document.getElementById('closeTutorial');
const howToPlayLink = document.getElementById('howToPlay');
const calendarModal = document.getElementById('calendarModal');
const calendarContent = document.getElementById('calendar-content');
const closeCalendarBtn = document.getElementById('closeCalendar');
const dailyThemeElement = document.getElementById('dailyTheme');

// Função para formatar data
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Função para obter o tema do dia
function getDailyTheme() {
  const today = new Date();
  const dateStr = formatDate(today);
  
  // Encontra o tema para hoje
  const todayTheme = dailyThemes.find(theme => theme.date === dateStr);
  
  // Se não houver tema para hoje, use o primeiro tema como fallback
  return todayTheme || dailyThemes[0];
}

// Função para verificar se é um novo dia
function isNewDay(lastPlayedDate) {
  if (!lastPlayedDate) return true;
  
  const today = new Date();
  const last = new Date(lastPlayedDate);
  
  return formatDate(today) !== formatDate(last);
}

// Função para salvar progresso
function saveProgress() {
  const progress = {
    lastPlayedDate: formatDate(new Date()),
    guessedAnswers: Array.from(guessedAnswers),
    gameStatus: gameActive ? 'active' : 'completed'
  };
  
  localStorage.setItem('gameProgress', JSON.stringify(progress));
}

// Função para carregar progresso
function loadProgress() {
  const savedProgress = localStorage.getItem('gameProgress');
  if (!savedProgress) return false;
  
  const progress = JSON.parse(savedProgress);
  
  // Se for um novo dia, reinicie o jogo
  if (isNewDay(progress.lastPlayedDate)) {
    localStorage.removeItem('gameProgress');
    return false;
  }
  
  // Restaura o progresso
  progress.guessedAnswers.forEach(index => guessedAnswers.add(index));
  gameActive = progress.gameStatus === 'active';
  
  // Atualiza a interface
  updateInterface();
  
  return true;
}

// Função para atualizar a interface
function updateInterface() {
  const dailyTheme = getDailyTheme();
  // Atualiza o título do tema
  dailyThemeElement.textContent = `Adivinhe: ${dailyTheme.theme}`;
  
  // Atualiza os quadrados com as respostas já encontradas
  guessedAnswers.forEach(index => {
    const square = document.querySelector(`[data-position="${index + 1}"]`);
    square.textContent = dailyTheme.answers[index];
    square.classList.add('revealed');
  });
  
  // Desabilita input se o jogo não estiver ativo
  if (!gameActive) {
    guessInput.disabled = true;
    submitGuess.disabled = true;
  }
}

//  
function checkGuess(guess) {
  const dailyTheme = getDailyTheme();
  const normalizedGuess = guess.toLowerCase().trim();
  const index = dailyTheme.answers.findIndex(answer => 
    answer.toLowerCase() === normalizedGuess
  );

  if (index !== -1 && !guessedAnswers.has(index)) {
    guessedAnswers.add(index);
    const square = document.querySelector(`[data-position="${index + 1}"]`);
    square.textContent = dailyTheme.answers[index];
    square.classList.add('revealed');

    // Salva o progresso
    saveProgress();

    // Verifica se o jogo acabou
    if (guessedAnswers.size === dailyTheme.answers.length) {
      gameActive = false;
      saveGameStatus('completed');
      alert('Parabéns! Você completou o jogo!');
    }
    return true;
  }
  return false;
}

// Função para mostrar erro
function showError() {
  const errorMessage = document.querySelector('.error-message');
  guessInput.classList.add('error');
  errorMessage.classList.add('show');
  
  setTimeout(() => {
    guessInput.classList.remove('error');
    errorMessage.classList.remove('show');
  }, 2000);
}

// Função para revelar todas as respostas
function revealAllAnswers() {
  const dailyTheme = getDailyTheme();
  dailyTheme.answers.forEach((answer, index) => {
    const square = document.querySelector(`[data-position="${index + 1}"]`);
    square.textContent = answer;
    square.classList.add('revealed');
  });
  gameActive = false;
  guessInput.disabled = true;
  submitGuess.disabled = true;
  saveGameStatus('gaveup');
  saveProgress();
}

// Função para salvar o status do jogo
function saveGameStatus(status) {
  const dateStr = formatDate(selectedDate);
  localStorage.setItem(`game_status_${dateStr}`, status);
}

// Função para obter o status do jogo para uma data
function getGameStatus(dateStr) {
  return localStorage.getItem(`game_status_${dateStr}`);
}

// Função para verificar se uma data é jogável
function isPlayableDate(date) {
  const startDate = new Date(2025, 0, 1); // Janeiro de 2025
  return date >= startDate && date <= currentDate;
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

newGameBtn.addEventListener('click', showCalendar);
closeCalendarBtn.addEventListener('click', () => {
  calendarModal.classList.remove('show');
});

// Event listeners para o modal tutorial
closeTutorialBtn.addEventListener('click', () => {
  tutorialModal.classList.remove('show');
  localStorage.setItem('tutorialSeen', 'true');
});

howToPlayLink.addEventListener('click', (e) => {
  e.preventDefault();
  tutorialModal.classList.add('show');
});

// Fechar modais ao clicar fora
tutorialModal.addEventListener('click', (e) => {
  if (e.target === tutorialModal) {
    tutorialModal.classList.remove('show');
  }
});

calendarModal.addEventListener('click', (e) => {
  if (e.target === calendarModal) {
    calendarModal.classList.remove('show');
  }
});

// Tecla Enter para enviar
guessInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    submitGuess.click();
  }
});

// Mostrar tutorial na primeira visita
if (!localStorage.getItem('tutorialSeen')) {
  tutorialModal.classList.add('show');
}

// Inicializar o jogo
function initGame() {
  // Se houver progresso salvo, carrega-o
  if (loadProgress()) return;
  
  // Caso contrário, inicia um novo jogo
  guessedAnswers.clear();
  gameActive = true;
  squares.forEach(square => {
    square.textContent = square.dataset.position;
    square.classList.remove('revealed');
  });
  guessInput.value = '';
  guessInput.disabled = false;
  submitGuess.disabled = false;
  
  // Atualiza a interface com o tema do dia
  updateInterface();
}

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


// Inicializar o jogo quando a página carrega
document.addEventListener('DOMContentLoaded', initGame);