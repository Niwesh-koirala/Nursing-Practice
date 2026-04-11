const setupScreen = document.getElementById('setupScreen');
const examScreen = document.getElementById('examScreen');
const resultScreen = document.getElementById('resultScreen');

const bankCount = document.getElementById('bankCount');
const loadStatus = document.getElementById('loadStatus');
const questionCountInput = document.getElementById('questionCountInput');
const shuffleQuestionsInput = document.getElementById('shuffleQuestionsInput');
const showRationaleInput = document.getElementById('showRationaleInput');
const startExamBtn = document.getElementById('startExamBtn');

const questionCounter = document.getElementById('questionCounter');
const timeElapsed = document.getElementById('timeElapsed');
const questionPrompt = document.getElementById('questionPrompt');
const answersForm = document.getElementById('answersForm');
const progressDots = document.getElementById('progressDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const flagBtn = document.getElementById('flagBtn');
const submitExamBtn = document.getElementById('submitExamBtn');

const scorePercent = document.getElementById('scorePercent');
const scoreLine = document.getElementById('scoreLine');
const totalQuestionsOut = document.getElementById('totalQuestionsOut');
const correctOut = document.getElementById('correctOut');
const incorrectOut = document.getElementById('incorrectOut');
const flaggedOut = document.getElementById('flaggedOut');
const timeUsedOut = document.getElementById('timeUsedOut');
const rationaleReview = document.getElementById('rationaleReview');
const restartBtn = document.getElementById('restartBtn');

const calculatorModal = document.getElementById('calculatorModal');
const calculatorBtn = document.getElementById('calculatorBtn');
const closeCalculatorBtn = document.getElementById('closeCalculatorBtn');
const calculatorDisplay = document.getElementById('calculatorDisplay');

let questionBank = [];
let examQuestions = [];
let currentIndex = 0;
let answers = [];
let flagged = [];
let startTime = null;
let timerInterval = null;
let showRationale = true;

function showScreen(screen) {
  [setupScreen, examScreen, resultScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function startTimer() {
  startTime = Date.now();
  timeElapsed.textContent = '00:00:00';
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed.textContent = formatTime(Date.now() - startTime);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  return startTime ? formatTime(Date.now() - startTime) : '00:00:00';
}

function renderProgressDots() {
  progressDots.innerHTML = '';
  examQuestions.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (idx === currentIndex) dot.classList.add('current');
    if (answers[idx] !== null && answers[idx] !== undefined) dot.classList.add('answered');
    if (flagged[idx]) dot.classList.add('flagged');
    progressDots.appendChild(dot);
  });
}

function renderQuestion() {
  const q = examQuestions[currentIndex];
  questionCounter.textContent = `Question: ${currentIndex + 1} of ${examQuestions.length}`;
  questionPrompt.textContent = q.question;

  answersForm.innerHTML = '';
  q.options.forEach((option, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'answer-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.id = `option-${idx}`;
    input.checked = answers[currentIndex] === idx;
    input.addEventListener('change', () => {
      answers[currentIndex] = idx;
      renderProgressDots();
    });

    const label = document.createElement('label');
    label.setAttribute('for', `option-${idx}`);
    label.textContent = option;

    wrap.appendChild(input);
    wrap.appendChild(label);
    answersForm.appendChild(wrap);
  });

  flagBtn.textContent = flagged[currentIndex] ? 'UNFLAG' : 'FLAG';
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === examQuestions.length - 1;
  renderProgressDots();
}

function startExam() {
  const totalAvailable = questionBank.length;
  let requested = parseInt(questionCountInput.value, 10);

  if (!requested || requested < 1) {
    alert('Enter a valid number of questions.');
    return;
  }

  if (requested > totalAvailable) {
    requested = totalAvailable;
    questionCountInput.value = totalAvailable;
  }

  showRationale = showRationaleInput.checked;

  const source = shuffleQuestionsInput.checked ? shuffleArray(questionBank) : [...questionBank];
  examQuestions = source.slice(0, requested);
  currentIndex = 0;
  answers = Array(requested).fill(null);
  flagged = Array(requested).fill(false);

  showScreen(examScreen);
  startTimer();
  renderQuestion();
}

function calculateResults() {
  let correct = 0;
  examQuestions.forEach((q, idx) => {
    if (answers[idx] === q.correctIndex) correct += 1;
  });
  return {
    correct,
    total: examQuestions.length,
    incorrect: examQuestions.length - correct,
    flaggedCount: flagged.filter(Boolean).length
  };
}

function buildReview() {
  rationaleReview.innerHTML = '';
  if (!showRationale) return;

  examQuestions.forEach((q, idx) => {
    const item = document.createElement('div');
    const isCorrect = answers[idx] === q.correctIndex;
    item.className = `rationale-item ${isCorrect ? 'correct' : 'incorrect'}`;

    const badge = document.createElement('div');
    badge.className = `rationale-label ${isCorrect ? 'correct' : 'incorrect'}`;
    badge.textContent = isCorrect ? 'CORRECT' : 'INCORRECT';

    const title = document.createElement('h4');
    title.textContent = `Question ${idx + 1}`;

    const prompt = document.createElement('p');
    prompt.innerHTML = `<strong>Prompt:</strong> ${q.question}`;

    const yourAnswer = document.createElement('p');
    const selected = answers[idx] !== null && answers[idx] !== undefined
      ? q.options[answers[idx]]
      : 'No answer selected';
    yourAnswer.innerHTML = `<strong>Your answer:</strong> ${selected}`;

    const correctAnswer = document.createElement('p');
    correctAnswer.innerHTML = `<strong>Correct answer:</strong> ${q.options[q.correctIndex]}`;

    const rationale = document.createElement('p');
    rationale.innerHTML = `<strong>Rationale:</strong> ${q.rationale || 'No rationale provided.'}`;

    item.appendChild(badge);
    item.appendChild(title);
    item.appendChild(prompt);
    item.appendChild(yourAnswer);
    item.appendChild(correctAnswer);
    item.appendChild(rationale);
    rationaleReview.appendChild(item);
  });
}

function submitExam() {
  const timeUsed = stopTimer();
  const { correct, total, incorrect, flaggedCount } = calculateResults();
  const percentage = total ? Math.round((correct / total) * 100) : 0;

  scorePercent.textContent = `${percentage}%`;
  scoreLine.textContent = `You got ${correct} out of ${total} correct.`;
  totalQuestionsOut.textContent = total;
  correctOut.textContent = correct;
  incorrectOut.textContent = incorrect;
  flaggedOut.textContent = flaggedCount;
  timeUsedOut.textContent = timeUsed;

  buildReview();
  showScreen(resultScreen);
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map(v => v.trim());
}

function pickField(rowObj, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(rowObj, key) && String(rowObj[key]).trim()) {
      return String(rowObj[key]).trim();
    }
  }
  return '';
}

function normalizeCorrectAnswer(rawValue, optionsLength) {
  const value = String(rawValue || '').trim().toUpperCase();
  if (!value) return -1;

  if (/^\d+$/.test(value)) {
    const numericIndex = Number(value) - 1;
    return numericIndex >= 0 && numericIndex < optionsLength ? numericIndex : -1;
  }

  const letterIndex = 'ABCD'.indexOf(value);
  return letterIndex >= 0 && letterIndex < optionsLength ? letterIndex : -1;
}

function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '""';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += char;
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.trim()) rows.push(current.trim());
      if (char === '\r' && next === '\n') i++;
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) rows.push(current.trim());

  if (rows.length < 2) return [];

  const headers = parseCSVLine(rows[0]).map(h => h.replace(/^"|"$/g, '').trim());
  const mapped = [];

  for (let i = 1; i < rows.length; i++) {
    const values = parseCSVLine(rows[i]).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
    if (values.every(v => !v)) continue;

    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = values[index] ?? '';
    });

    const options = [
      pickField(rowObj, ['option1', 'A.', 'A', 'Option 1', 'Option1']),
      pickField(rowObj, ['option2', 'B.', 'B', 'Option 2', 'Option2']),
      pickField(rowObj, ['option3', 'C.', 'C', 'Option 3', 'Option3']),
      pickField(rowObj, ['option4', 'D.', 'D', 'Option 4', 'Option4'])
    ].filter(Boolean);

    const questionText = pickField(rowObj, ['question', 'Question Text', 'Prompt', 'Detail']);
    const correctAnswerRaw = pickField(rowObj, ['correctAnswer', 'CorrectAnswer', 'Correct Answer']);
    const correctIndex = normalizeCorrectAnswer(correctAnswerRaw, options.length);
    const rationale = pickField(rowObj, ['rationale', 'Rationale', 'Explanation']);
    const id = pickField(rowObj, ['id', 'ID', 'Question', '#']) || String(i);

    if (!questionText || options.length < 2 || correctIndex < 0) continue;

    mapped.push({
      id,
      question: questionText,
      options,
      correctIndex,
      rationale
    });
  }

  return mapped;
}

async function loadQuestionBank() {
  try {
    const response = await fetch('questions.csv', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Could not load questions.csv (${response.status})`);
    }

    const text = await response.text();
    questionBank = parseCSV(text);

    if (!questionBank.length) {
      throw new Error('questions.csv was found, but no valid questions could be parsed.');
    }

    bankCount.textContent = questionBank.length;
    questionCountInput.max = questionBank.length;
    questionCountInput.value = Math.min(10, questionBank.length);
    loadStatus.textContent = 'Question bank loaded successfully.';
    startExamBtn.disabled = false;
  } catch (error) {
    console.error(error);
    bankCount.textContent = '0';
    loadStatus.textContent = `Error: ${error.message}`;
    startExamBtn.disabled = true;
  }
}

startExamBtn.addEventListener('click', startExam);

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentIndex < examQuestions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  }
});

flagBtn.addEventListener('click', () => {
  flagged[currentIndex] = !flagged[currentIndex];
  renderQuestion();
});

submitExamBtn.addEventListener('click', () => {
  const unanswered = answers.filter(v => v === null || v === undefined).length;
  const proceed = unanswered
    ? confirm(`You still have ${unanswered} unanswered question(s). Submit anyway?`)
    : true;
  if (proceed) submitExam();
});

restartBtn.addEventListener('click', () => {
  showScreen(setupScreen);
});

document.getElementById('closeBtn').addEventListener('click', () => {
  if (confirm('Close this practice exam?')) {
    showScreen(setupScreen);
    stopTimer();
  }
});

// Calculator
let calcExpression = '';
let calcMemory = 0;

function updateCalculatorDisplay(value) {
  calculatorDisplay.textContent = value || '0';
}

function safeEval(expr) {
  if (!/^[0-9+\-*/.()\s]+$/.test(expr)) return 'Error';
  try {
    const result = Function(`"use strict"; return (${expr})`)();
    if (result === undefined || Number.isNaN(result) || !Number.isFinite(result)) return 'Error';
    return String(result);
  } catch {
    return 'Error';
  }
}

function handleCalcInput(val) {
  if (val === 'clear') {
    calcExpression = '';
    updateCalculatorDisplay('0');
    return;
  }
  if (val === 'back') {
    calcExpression = calcExpression.slice(0, -1);
    updateCalculatorDisplay(calcExpression || '0');
    return;
  }
  if (val === '=') {
    calcExpression = safeEval(calcExpression);
    updateCalculatorDisplay(calcExpression);
    return;
  }
  if (val === 'mc') {
    calcMemory = 0;
    return;
  }
  if (val === 'mr') {
    calcExpression += String(calcMemory);
    updateCalculatorDisplay(calcExpression);
    return;
  }
  if (val === 'mplus') {
    const value = Number(safeEval(calcExpression || '0'));
    if (!Number.isNaN(value)) calcMemory += value;
    return;
  }
  if (val === 'mminus') {
    const value = Number(safeEval(calcExpression || '0'));
    if (!Number.isNaN(value)) calcMemory -= value;
    return;
  }

  calcExpression += val;
  updateCalculatorDisplay(calcExpression);
}

calculatorBtn.addEventListener('click', () => calculatorModal.classList.remove('hidden'));
closeCalculatorBtn.addEventListener('click', () => calculatorModal.classList.add('hidden'));
calculatorModal.addEventListener('click', (e) => {
  if (e.target === calculatorModal) calculatorModal.classList.add('hidden');
});

document.querySelectorAll('.calc-btn').forEach(btn => {
  btn.addEventListener('click', () => handleCalcInput(btn.dataset.calc));
});

loadQuestionBank();
