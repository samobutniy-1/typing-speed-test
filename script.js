const input = document.getElementById("typing-input");
const textDisplay = document.getElementById("text-display");
const statValue = document.getElementById("cpm");
const timerEl = document.getElementById("timer");
const accuracyEl = document.getElementById("accuracy");
const progressEl = document.getElementById("progress");
const btnReset = document.getElementById("btn-reset");
const btnStart = document.getElementById("btn-start");
const resultCpm = document.getElementById("result-cpm");
const resultAcc = document.getElementById("result-acc");
const resultChars = document.getElementById("result-chars");

const texts = {
  default: "Typing fast is a skill that saves you hours every week.",
  easy: "The sun was bright and the sky was clear and blue. A dog ran fast down the road and stopped near a big red barn. The wind moved the tall grass from side to side.",
  medium:
    "Learning to type well takes time and daily effort, but the results are worth it. Most people see clear progress after just two or three weeks of regular practice. Focus on accuracy first and let speed come naturally over time.",
  hard: "Proficiency in touch-typing requires consistent effort, muscle memory, and the ability to focus without looking at your keyboard. Experienced typists often reach speeds of over one hundred words per minute through years of dedicated practice. The most important factor is not raw speed, but accuracy — because fixing mistakes always costs more time than typing carefully from the start.",
};

let text = texts.default;
let typedText = "";
let time = 60;
let isGameStarted = false;
let timerInterval = null;
let animateInterval = null;

document.querySelectorAll(".diff-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".diff-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

function renderText() {
  let charIndex = 0;
  const words = text.split(" ");

  textDisplay.innerHTML = words
    .map((word, wordIndex) => {
      const letters = word
        .split("")
        .map((char) => {
          const index = charIndex;
          charIndex++;

          if (index < typedText.length) {
            return typedText[index] === char
              ? `<span class="char correct">${char}</span>`
              : `<span class="char wrong">${char}</span>`;
          }
          if (index === typedText.length) {
            return `<span class="char active">${char}</span>`;
          }
          return `<span class="char pending">${char}</span>`;
        })
        .join("");

      const isLastWord = wordIndex === words.length - 1;

      if (isLastWord) {
        return `<span style="white-space:nowrap">${letters}</span>`;
      }

      const spaceIndex = charIndex;
      charIndex++;

      let spaceClass = "pending";
      if (spaceIndex < typedText.length) {
        spaceClass = typedText[spaceIndex] === " " ? "correct" : "wrong";
      } else if (spaceIndex === typedText.length) {
        spaceClass = "active";
      }

      return `<span style="white-space:nowrap">${letters}</span><span class="char ${spaceClass}">&nbsp;</span>`;
    })
    .join("");
}

function animateDefaultText() {
  const chars = textDisplay.querySelectorAll(".char");
  let current = 0;

  clearInterval(animateInterval);

  animateInterval = setInterval(() => {
    if (current < chars.length) {
      for (let i = 0; i < current; i++) {
        chars[i].classList.remove("pending", "active");
        chars[i].classList.add("correct");
      }
      chars[current].classList.remove("pending", "correct");
      chars[current].classList.add("active");
      current++;
    } else {
      chars.forEach((char) => {
        char.classList.remove("pending", "active");
        char.classList.add("correct");
      });
      clearInterval(animateInterval);
    }
  }, 150);
}

function calculateCPM() {
  const timeSpent = 60 - time;
  const cpm =
    timeSpent > 0 ? Math.round((typedText.length / timeSpent) * 60) : 0;
  statValue.innerHTML = `${cpm}<span class="unit">cpm</span>`;
}

function calculateAccuracy() {
  let correctChars = 0;
  for (let i = 0; i < typedText.length; i++) {
    if (typedText[i] === text[i]) correctChars++;
  }
  const acc =
    typedText.length > 0
      ? Number((correctChars / typedText.length) * 100).toFixed(1)
      : 100;
  accuracyEl.innerHTML = `${acc}<span class="unit">%</span>`;
}

function updateStats() {
  calculateCPM();
  calculateAccuracy();
}

function updateProgress() {
  progressEl.style.width = `${(typedText.length / text.length) * 100}%`;
}

function tick() {
  time--;
  timerEl.textContent = time + "s";

  if (time <= 10) {
    timerEl.classList.add("warning");
  }

  if (time <= 0) {
    finishGame();
  }
}

function startGame() {
  const activeBtn = document.querySelector(".diff-btn.active");
  const level = activeBtn.dataset.level;

  text = texts[level];
  typedText = "";
  time = 60;
  isGameStarted = true;

  document
    .querySelectorAll(".diff-btn")
    .forEach((btn) => (btn.disabled = true));

  clearInterval(animateInterval);
  clearInterval(timerInterval);

  timerEl.textContent = "60s";
  timerEl.classList.remove("warning");

  input.value = "";
  input.disabled = false;
  input.focus();

  btnStart.textContent = "Restart";

  renderText();
  updateStats();
  updateProgress();

  timerInterval = setInterval(tick, 1000);
}

function finishGame() {
  isGameStarted = false;
  clearInterval(timerInterval);
  input.disabled = true;
  renderText();
  updateStats();
}

function resetGame() {
  isGameStarted = false;
  clearInterval(timerInterval);
  clearInterval(animateInterval);

  document
    .querySelectorAll(".diff-btn")
    .forEach((btn) => (btn.disabled = false));

  text = texts.default;
  typedText = "";
  time = 60;

  timerEl.textContent = "60s";
  timerEl.classList.remove("warning");

  input.value = "";
  input.disabled = true;

  btnStart.textContent = "Start";

  statValue.innerHTML = `0<span class="unit">cpm</span>`;
  accuracyEl.innerHTML = `100<span class="unit">%</span>`;
  progressEl.style.width = "0%";

  renderText();
  animateDefaultText();
}

btnStart.addEventListener("click", () => startGame());
btnReset.addEventListener("click", () => resetGame());

input.addEventListener("input", () => {
  if (!isGameStarted) return;

  typedText = input.value;

  renderText();
  updateStats();
  updateProgress();

  if (typedText.length >= text.length) {
    finishGame();
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Backspace" || e.key === "Delete") {
    e.preventDefault();
  }
});

renderText();
animateDefaultText();
