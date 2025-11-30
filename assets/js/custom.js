document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const resultsDiv = document.querySelector('#form-results');
  const averageP = document.querySelector('#form-average');
  const successMsg = document.querySelector('#form-success');
  const submitBtn = document.querySelector('#contact-submit');

  function onlyLetters(value) {
    return /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s-]+$/.test(value);
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateRatingValue(value) {
    if (!value) {
      return { valid: false, message: 'Įveskite įvertinimą (1–10)' };
    }
    const n = Number(value);
    if (Number.isNaN(n) || n < 1 || n > 10) {
      return { valid: false, message: 'Vertė turi būti tarp 1 ir 10' };
    }
    return { valid: true, message: '' };
  }

  function formatPhone(rawValue) {
    let digits = rawValue.replace(/\D/g, '');

    if (!digits) return '';
    digits = digits.slice(0, 11);

    if (digits.startsWith('86')) {
      digits = '370' + digits.slice(1);
    } else if (digits.startsWith('6')) {
      digits = '370' + digits;
    } else if (!digits.startsWith('370')) {
      digits = '3706' + digits;
    }

    if (!digits.startsWith('3706')) {
      if (digits.startsWith('370')) {
        digits = digits.slice(0, 3) + '6' + digits.slice(3);
      } else {
        digits = '3706' + digits;
      }
    }

    digits = digits.slice(0, 11);

    if (digits.length <= 3) {
      return '+' + digits;
    } else if (digits.length <= 4) {
      return '+' + digits.slice(0, 3) + ' ' + digits.slice(3);
    } else if (digits.length <= 5) {
      return '+' + digits.slice(0, 3) + ' ' + digits.slice(3);
    } else {
      const first = digits.slice(0, 3);
      const middle = digits.slice(3, 6);
      const last = digits.slice(6);
      return '+' + first + ' ' + middle + (last ? ' ' + last : '');
    }
  }

  const fields = {
    firstName: {
      input: form.querySelector('#firstName'),
      error: form.querySelector('[data-error-for="firstName"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite vardą' };
        if (!onlyLetters(value)) return { valid: false, message: 'Vardas turi būti sudarytas tik iš raidžių' };
        return { valid: true, message: '' };
      },
      touched: false
    },
    lastName: {
      input: form.querySelector('#lastName'),
      error: form.querySelector('[data-error-for="lastName"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite pavardę' };
        if (!onlyLetters(value)) return { valid: false, message: 'Pavardė turi būti sudaryta tik iš raidžių' };
        return { valid: true, message: '' };
      },
      touched: false
    },
    email: {
      input: form.querySelector('#email'),
      error: form.querySelector('[data-error-for="email"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite el. paštą' };
        if (!validateEmail(value)) return { valid: false, message: 'Neteisingas el. pašto formatas' };
        return { valid: true, message: '' };
      },
      touched: false
    },
    phone: {
      input: form.querySelector('#phone'),
      error: form.querySelector('[data-error-for="phone"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite telefono numerį' };
        const pattern = /^\+370 6\d{2} \d{5}$/;
        if (!pattern.test(value)) {
          return { valid: false, message: 'Formatas turi būti: +370 6xx xxxxx' };
        }
        return { valid: true, message: '' };
      },
      touched: false
    },
    address: {
      input: form.querySelector('#address'),
      error: form.querySelector('[data-error-for="address"]'),
      validator(value) {
        if (!value) return { valid: false, message: 'Įveskite adresą' };
        return { valid: true, message: '' };
      },
      touched: false
    },
    rating1: {
      input: form.querySelector('#rating1'),
      error: form.querySelector('[data-error-for="rating1"]'),
      validator: validateRatingValue,
      touched: false
    },
    rating2: {
      input: form.querySelector('#rating2'),
      error: form.querySelector('[data-error-for="rating2"]'),
      validator: validateRatingValue,
      touched: false
    },
    rating3: {
      input: form.querySelector('#rating3'),
      error: form.querySelector('[data-error-for="rating3"]'),
      validator: validateRatingValue,
      touched: false
    }
  };

  function setError(fieldKey, valid, message) {
    const field = fields[fieldKey];
    if (!field || !field.input || !field.error) return;

    if (valid) {
      field.input.classList.remove('is-invalid');
      field.error.textContent = '';
    } else {
      field.input.classList.add('is-invalid');
      field.error.textContent = message;
    }
  }

  function validateField(fieldKey, showErrors = true) {
    const field = fields[fieldKey];
    if (!field || !field.input) return true;

    const value = field.input.value.trim();
    const { valid, message } = field.validator(value);

    if (showErrors && field.touched) {
      setError(fieldKey, valid, message);
    }

    return valid;
  }

  function isFormValid() {
    return Object.keys(fields).every((key) => {
      const field = fields[key];
      if (!field || !field.input) return true;
      const value = field.input.value.trim();
      return field.validator(value).valid;
    });
  }

  function updateSubmitState() {
    if (!submitBtn) return;
    submitBtn.disabled = !isFormValid();
  }

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field || !field.input) return;

    field.input.addEventListener('input', () => {
      if (key === 'phone') {
        field.input.value = formatPhone(field.input.value);
      }

      field.touched = true;
      validateField(key, true);
      updateSubmitState();
    });
  });

  updateSubmitState();

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    Object.keys(fields).forEach((key) => {
      fields[key].touched = true;
      validateField(key, true);
    });

    if (!isFormValid()) {
      if (successMsg) {
        successMsg.classList.add('d-none');
      }
      return;
    }

    const data = {
      firstName: fields.firstName.input.value.trim(),
      lastName: fields.lastName.input.value.trim(),
      email: fields.email.input.value.trim(),
      phone: fields.phone.input.value.trim(),
      address: fields.address.input.value.trim(),
      rating1: Number(fields.rating1.input.value),
      rating2: Number(fields.rating2.input.value),
      rating3: Number(fields.rating3.input.value)
    };

    console.log('Kontaktų formos duomenys:', data);

    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <p><strong>Vardas:</strong> ${data.firstName}</p>
        <p><strong>Pavardė:</strong> ${data.lastName}</p>
        <p><strong>El. paštas:</strong> ${data.email}</p>
        <p><strong>Tel. numeris:</strong> ${data.phone}</p>
        <p><strong>Adresas:</strong> ${data.address}</p>
        <p><strong>Įvertinimai:</strong> ${data.rating1}, ${data.rating2}, ${data.rating3}</p>
      `;
    }

    const avg = ((data.rating1 + data.rating2 + data.rating3) / 3).toFixed(1);
    if (averageP) {
      averageP.textContent = `${data.firstName} ${data.lastName}: ${avg}`;
    }

    if (successMsg) {
      successMsg.classList.remove('d-none');
    }
  });
});
document.addEventListener('DOMContentLoaded', function () {
  const board = document.querySelector('#game-board');
  const difficultySelect = document.querySelector('#game-difficulty');
  const startBtn = document.querySelector('#game-start');
  const resetBtn = document.querySelector('#game-reset');
  const movesSpan = document.querySelector('#game-moves');
  const pairsSpan = document.querySelector('#game-pairs');
  const messageEl = document.querySelector('#game-message');
  const timeSpan = document.querySelector('#game-time');
  const bestSpan = document.querySelector('#game-best');

  if (!board || !difficultySelect || !startBtn || !resetBtn || !movesSpan || !pairsSpan) {
    return;
  }

  const symbols = ['💻', '⚡', '🔧', '📡', '🔋', '🧠', '📘', '🎧', '🔐', '🚀', '🖥️', '🧪'];

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matches = 0;
  let moves = 0;
  let totalPairs = 0;
  let timerId = null;
  let secondsElapsed = 0;

  function getDifficultyKey() {
    return difficultySelect.value === 'hard' ? 'hard' : 'easy';
  }

  function getStorageKey() {
    return 'memoryGameBest_' + getDifficultyKey();
  }

  function loadBest() {
    if (!bestSpan) {
      return;
    }
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) {
      bestSpan.textContent = '–';
      return;
    }
    const value = parseInt(raw, 10);
    if (Number.isNaN(value)) {
      bestSpan.textContent = '–';
      return;
    }
    bestSpan.textContent = value + ' ėjimai';
  }

  function maybeUpdateBest() {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    let currentBest = raw ? parseInt(raw, 10) : null;
    if (!currentBest || moves < currentBest) {
      localStorage.setItem(key, String(moves));
      loadBest();
    }
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function updateTimeDisplay() {
    if (timeSpan) {
      timeSpan.textContent = String(secondsElapsed);
    }
  }

  function startTimer() {
    stopTimer();
    secondsElapsed = 0;
    updateTimeDisplay();
    timerId = setInterval(function () {
      secondsElapsed += 1;
      updateTimeDisplay();
    }, 1000);
  }

  function getPairsCount() {
    if (difficultySelect.value === 'hard') {
      return 12;
    }
    return 6;
  }

  function setBoardClass() {
    board.classList.remove('game-board--easy', 'game-board--hard');
    if (difficultySelect.value === 'hard') {
      board.classList.add('game-board--hard');
    } else {
      board.classList.add('game-board--easy');
    }
  }

  function resetState() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matches = 0;
    moves = 0;
    totalPairs = getPairsCount();
    movesSpan.textContent = '0';
    pairsSpan.textContent = '0';
    stopTimer();
    secondsElapsed = 0;
    updateTimeDisplay();
    if (messageEl) {
      messageEl.textContent = '';
      messageEl.classList.add('d-none');
    }
  }

  function createDeck() {
    const pairs = getPairsCount();
    const selected = symbols.slice(0, pairs);
    const deck = [];
    selected.forEach(function (value) {
      deck.push(value);
      deck.push(value);
    });
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
    return deck;
  }

  function handleCardClick(event) {
    const card = event.currentTarget;
    if (lockBoard) {
      return;
    }
    if (card === firstCard) {
      return;
    }
    if (card.classList.contains('is-matched')) {
      return;
    }

    card.classList.add('is-flipped');

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    moves += 1;
    movesSpan.textContent = String(moves);
    checkForMatch();
  }

  function renderBoard() {
    setBoardClass();
    const deck = createDeck();
    board.innerHTML = '';
    deck.forEach(function (value) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'game-card';
      card.dataset.value = value;
      card.innerHTML =
        '<div class="game-card-inner">' +
        '<div class="game-card-front"></div>' +
        '<div class="game-card-back"><span>' + value + '</span></div>' +
        '</div>';
      card.addEventListener('click', handleCardClick);
      board.appendChild(card);
    });
  }

  function checkForMatch() {
    const firstValue = firstCard.dataset.value;
    const secondValue = secondCard.dataset.value;

    if (firstValue === secondValue) {
      firstCard.classList.add('is-matched');
      secondCard.classList.add('is-matched');
      firstCard.removeEventListener('click', handleCardClick);
      secondCard.removeEventListener('click', handleCardClick);
      firstCard = null;
      secondCard = null;
      matches += 1;
      pairsSpan.textContent = String(matches);
      if (matches === totalPairs) {
        stopTimer();
        maybeUpdateBest();
        if (messageEl) {
          messageEl.textContent = 'Sveikinimai! Suradote visas poras.';
          messageEl.classList.remove('d-none');
        }
      }
      return;
    }

    lockBoard = true;
    setTimeout(function () {
      firstCard.classList.remove('is-flipped');
      secondCard.classList.remove('is-flipped');
      firstCard = null;
      secondCard = null;
      lockBoard = false;
    }, 800);
  }

  function startGame() {
    resetState();
    renderBoard();
    resetBtn.disabled = false;
    startTimer();
    loadBest();
  }

  function resetGame() {
    startGame();
  }

  startBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', resetGame);
  difficultySelect.addEventListener('change', function () {
    resetState();
    renderBoard();
    resetBtn.disabled = false;
    startTimer();
    loadBest();
  });

  loadBest();
});