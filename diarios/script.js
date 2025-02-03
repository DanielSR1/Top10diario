// Importa os dados
//funcionando
import { dailyThemes } from "../data.js";

let guessjogo = new Set();
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

const getCurrentDateFromFilename = () => {
  const filename = window.location.pathname.split("/").pop();
  return filename.replace(".html", "");
};

// Encontra o tema correspondente à data
const loadDailyTheme = () => {
  const currentDate = getCurrentDateFromFilename();
  console.log("Data da página:", currentDate);
  
  const themeData = dailyThemes[currentDate];
  if (themeData) {
      document.getElementById("dailyTheme").textContent = themeData.theme;
      
      // Preenche os quadrados com os itens da lista
      
      const squares = document.querySelectorAll(".square");
      themeData.answers.forEach((answer, index) => {
          if (squares[index]) {
              squares[index].setAttribute("data-position", index + 1);
          }
      });
  } else {
      console.warn("Nenhum tema encontrado para esta data.");
      document.getElementById("dailyTheme").textContent = "Tema não encontrado.";
  }
};

// Executa o carregamento ao iniciar a página
document.addEventListener("DOMContentLoaded", loadDailyTheme);
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
  guessjogo.clear();
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
}

// Função para verificar a tentativa
function checkGuess(guess) {
  const normalizedGuess = guess.toLowerCase().trim();
  const dailyTheme = getDailyTheme();
  const index = dailyTheme.answers.findIndex(answer => 
      answer.toLowerCase() === normalizedGuess
  );

  if (index !== -1 && !guessjogo.has(index)) {
      guessjogo.add(index);
      const square = document.querySelector(`[data-position="${index + 1}"]`);
      square.textContent = dailyTheme.answers[index];
      square.classList.add('revealed');

      // Verificar se o jogo acabou
      if (guessjogo.size === dailyTheme.answers.length) {
          gameActive = false;
          saveGameStatus('completed');
          alert('Parabéns! Você completou o jogo!');
      }
      return true;getCurrentDateFromFilename()
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

function getDailyTheme() {
  const dateStr = getCurrentDateFromFilename();
  console.log(dateStr)
  
  // Encontra o tema para hoje
  const todayTheme = dailyThemes[dateStr];
  
  // Se não houver tema para hoje, use o primeiro tema como fallback
  return todayTheme || dailyThemes[0];
}
function updateInterface() {
  const dailyTheme = getDailyTheme();

  
  // Atualiza o título do tema
  document.getElementById('dailyTheme').textContent = `Adivinhe: ${dailyTheme.theme}`;
  
  // Atualiza os quadrados com as respostas já encontradas
  guessjogo.forEach(index => {
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
  
  // Desabilita input se o jogo não estiver ativo
  if (!gameActive) {
    guessInput.disabled = true;
    submitGuess.disabled = true;
  }



// Inicializar o jogo
initGame();