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
  
  // Fechar modal ao clicar fora
  tutorialModal.addEventListener('click', (e) => {
    if (e.target === tutorialModal) {
      hideModal();
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
    alert('Jogo finalizado! Todas as respostas foram reveladas.');
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
      alert('Tente novamente!');
    }
    guessInput.value = '';
  });
  
  newGameBtn.addEventListener('click', initGame);
  
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