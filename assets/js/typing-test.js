const wpmText = document.getElementById('wpm');
const timerText = document.getElementById('time');
const errorText = document.getElementById('errors');
const textArea = document.getElementById('textarea');
const typeText = document.getElementById('type-text');
const accuracyText = document.getElementById('accuracy');

let errors = 0;
let accuracy = 0;
let timeLeft = 0;
let timeElapsed = 0;
let typedCharacter = 0;
let timer = null;
let hasStarted = false;
let TEXT = '';
let TIME_LIMIT = 0;

document.addEventListener('DOMContentLoaded', () => {
  fetch('https://baconipsum.com/api/?type=meat-and-filler&sentences=1')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      TEXT = data[0];
      TIME_LIMIT = Math.trunc(TEXT.length * 0.5);
      initializeTest({ timeLimit: TIME_LIMIT, text: TEXT });
      textArea.addEventListener('input', update);
    })
    .catch(error => {
      console.error('Fetch error:', error);
      typeText.innerHTML = 'Failed to load text. Please try again.';
    });
});

function initializeTest({ timeLimit, text }) {
  timerText.innerHTML = timeLimit;
  typeText.innerHTML = '';
  text.split('').forEach(character => {
    typeText.innerHTML += `<span>${character}</span>`;
  });
}

function update() {
  if (!hasStarted) {
    timer = setInterval(updateTimer, 1000);
    hasStarted = true;
  }
  typedCharacter++;
  maxCharacter();
  updateCharactersStatus();
  updateErrors();
  updateAccuracy();
}

function maxCharacter() {
  const { length } = TEXT;
  textArea.setAttribute('maxLength', length);
}

function updateCharactersStatus() {
  const characterArray = [...textArea.value];
  let index = 0;
  for (const span of typeText.children) {
    if (!characterArray[index]) {
      span.className = '';
    } else if (span.innerHTML === characterArray[index]) {
      span.className = 'correct-char';
    } else {
      span.className = 'incorrect-char';
    }
    index++;
  }
}

function updateAccuracy() {
  if (typedCharacter === 0) {
    accuracyText.innerHTML = 100;
    return;
  }
  accuracyText.innerHTML = Math.round(((typedCharacter - errors) / typedCharacter) * 100);
}

function updateErrors() {
  errors = typeText.querySelectorAll('.incorrect-char').length;
  errorText.innerHTML = errors;
}

function updateWpm() {
  if (timeElapsed === 0) return;
  wpmText.innerHTML = Math.round((typedCharacter / 5 / timeElapsed) * 60);
}

function updateTimer() {
  timeLeft = TIME_LIMIT - timeElapsed;
  timerText.innerHTML = timeLeft;
  if (timeLeft <= 0) {
    finishTest();
  }
  if (timeElapsed > 0) {
    updateWpm();
  }
  updateErrors();
  timeElapsed++;
}

function finishTest() {
  textArea.disabled = true;
  clearInterval(timer);
}
