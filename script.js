// =======================
// DOM ELEMENTS
// =======================
const holes = document.querySelectorAll(".hole");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const accuracyEl = document.getElementById("accuracy");
const aiMessage = document.getElementById("ai-message");

const startBtn = document.querySelector(".start");
const resetBtn = document.querySelector(".reset");
const muteBtn = document.getElementById("muteBtn");

// Optional UI
const endScreen = document.getElementById("endScreen");
const finalScoreEl = document.getElementById("finalScore");
const finalAccuracyEl = document.getElementById("finalAccuracy");
const endAIEl = document.getElementById("endAI");
const playAgainBtn = document.getElementById("playAgain");
const themeBtn = document.getElementById("themeToggle");

// =======================
// AUDIO
// =======================
const bgSound = document.getElementById("bgSound");
const buttonSound = document.getElementById("buttonSound");
const continueSound = document.getElementById("continueSound");
const hitSound = document.getElementById("hitSound");
const missSound = document.getElementById("missSound");
const winSound = document.getElementById("winSound");

[bgSound, buttonSound, continueSound, hitSound, missSound, winSound]
  .forEach(a => a && (a.volume = 0.6));
if (bgSound) bgSound.volume = 0.25;

// =======================
// GAME CONSTANTS
// =======================
const MIN_MOLE_SPEED = 700;
const MAX_MOLE_SPEED = 1300;
const MIN_VISIBLE_TIME = 550;

// =======================
// GAME STATE
// =======================
let score = 0;
let hits = 0;
let misses = 0;
let timeLeft = 30;
let moleSpeed = 1100;
let moleToken = 0;

let activeHole = null;
let gameRunning = false;

let gameTimer = null;
let moleTimer = null;
let aiTimer = null;
let bestScore = localStorage.getItem("bestScore")
  ? parseInt(localStorage.getItem("bestScore"))
  : 0;

// =======================
// INIT MOLES
// =======================
holes.forEach(hole => {
  hole.innerHTML = `<span class="mole">🐹</span>`;
});

// =======================
// HELPERS
// =======================
function randomHole() {
  return holes[Math.floor(Math.random() * holes.length)];
}

function updateAccuracy() {
  const total = hits + misses;
  const acc = total === 0 ? 0 : Math.round((hits / total) * 100);
  accuracyEl.innerText = acc + "%";
}

function updateUI() {
  scoreEl.innerText = score;
  updateAccuracy();
}

// =======================
// MOLE LOGIC
// =======================
function showMole() {
  if (!gameRunning) return;

  holes.forEach(h => h.classList.remove("active"));

  const hole = randomHole();
  hole.classList.add("active");
  activeHole = hole;

  moleToken++;
  const currentToken = moleToken;

  const visibleTime = Math.max(
    moleSpeed - (hits > 10 ? 350 : 300),
    MIN_VISIBLE_TIME
  );

  setTimeout(() => {
    // ❗ only hide if this is still the latest mole
    if (!gameRunning) return;
    if (currentToken !== moleToken) return;

    if (activeHole === hole) {
      hole.classList.remove("active");
      activeHole = null;
      misses++;
      updateAccuracy();
    }
  }, visibleTime);
}


// =======================
// CLICK HANDLING
// =======================
holes.forEach(hole => {
  hole.addEventListener("click", () => {
    if (!gameRunning) return;

   if (hole === activeHole) {
  score++;
  hits++;
  moleToken++; // 🔑 VERY IMPORTANT

  hole.classList.add("hit");
  hitSound?.play();

  hole.classList.remove("active");
  activeHole = null;

  setTimeout(() => hole.classList.remove("hit"), 150);
}
 else {
      misses++;
      missSound?.play();

      document.querySelector(".game-container")
        ?.classList.add("shake");
      setTimeout(() => {
        document.querySelector(".game-container")
          ?.classList.remove("shake");
      }, 150);
    }

    updateUI();
  });
});

// =======================
// AI INTERACTION
// =======================
async function askAI() {
  if (!gameRunning || typeof getAIFeedback !== "function") return;

  continueSound?.play();

  const stats = {
    score,
    hits,
    misses,
    accuracy: accuracyEl.innerText
  };

  const aiResponse = await getAIFeedback(stats);
  if (!aiResponse) return;

  aiMessage.innerText = aiResponse.message;

  if (aiResponse.difficulty === "easy") {
    moleSpeed = Math.min(moleSpeed + 100, MAX_MOLE_SPEED);
  }
  if (aiResponse.difficulty === "hard") {
    moleSpeed = Math.max(moleSpeed - 100, MIN_MOLE_SPEED);
  }

  clearInterval(moleTimer);
  moleTimer = setInterval(showMole, moleSpeed);
}

// =======================
// GAME CONTROL
// =======================
function startGame() {
  clearInterval(gameTimer);
  clearInterval(moleTimer);
  clearInterval(aiTimer);

  resetGame();
  gameRunning = true;

  buttonSound?.play();
  bgSound?.play();

  gameTimer = setInterval(() => {
    timeLeft--;
    timeEl.innerText = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);

  moleTimer = setInterval(showMole, moleSpeed);
  aiTimer = setInterval(askAI, 5000);
}

function endGame() {
  gameRunning = false;

  clearInterval(gameTimer);
  clearInterval(moleTimer);
  clearInterval(aiTimer);

  bgSound?.pause();
  winSound?.play();

  if (endScreen) {
    finalScoreEl.innerText = score;
    finalAccuracyEl.innerText = accuracyEl.innerText;
    endAIEl.innerText = "The night watched closely. You’re improving 🌙";
    endScreen.classList.add("show");
  }
  if (score > bestScore) {
  bestScore = score;
  localStorage.setItem("bestScore", bestScore);
}

document.getElementById("bestScore").innerText = bestScore;

}

function resetGame() {
  score = 0;
  hits = 0;
  misses = 0;
  timeLeft = 30;
  moleSpeed = 1100;
  activeHole = null;

  scoreEl.innerText = "0";
  timeEl.innerText = "30";
  accuracyEl.innerText = "0%";
  aiMessage.innerText = "Ready when you are…";

  holes.forEach(h => h.classList.remove("active"));
}

// =======================
// BUTTON EVENTS
// =======================
startBtn?.addEventListener("click", startGame);

resetBtn?.addEventListener("click", () => {
  buttonSound?.play();
  clearInterval(gameTimer);
  clearInterval(moleTimer);
  clearInterval(aiTimer);
  bgSound?.pause();
  gameRunning = false;
  resetGame();
  endScreen?.classList.remove("show");
});

playAgainBtn?.addEventListener("click", () => {
  endScreen?.classList.remove("show");
  startGame();
});

// =======================
// MUTE
// =======================
let muted = false;
muteBtn?.addEventListener("click", () => {
  muted = !muted;
  document.querySelectorAll("audio").forEach(a => a.muted = muted);
  muteBtn.innerText = muted ? "🔇 Sound Off" : "🔊 Sound On";
});

// =======================
// THEME TOGGLE
// =======================
let lightMode = false;
themeBtn?.addEventListener("click", () => {
  lightMode = !lightMode;
  document.body.classList.toggle("light", lightMode);
  themeBtn.innerText = lightMode ? "🌫️ Moonlight" : "🌙 Night";
});

// =======================
// FIREFLIES
// =======================
const fireflies = document.querySelector(".fireflies");
if (fireflies) {
  for (let i = 0; i < 18; i++) {
    const fly = document.createElement("span");
    fly.style.left = Math.random() * 100 + "%";
    fly.style.top = Math.random() * 100 + "%";
    fly.style.animationDuration = 2 + Math.random() * 4 + "s";
    fireflies.appendChild(fly);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const bestScoreEl = document.getElementById("bestScore");
  if (bestScoreEl) {
    bestScoreEl.innerText = bestScore;
  }
});
