const grid = document.getElementById("grid");
const statusText = document.getElementById("status");
const timerText = document.getElementById("timer");
const backBtn = document.getElementById("backBtn");
const retryBtn = document.getElementById("retryBtn");

const params = new URLSearchParams(window.location.search);
let level = parseInt(params.get("level") || "1");

const levelConfig = {
  1: { cards: 6,  time: 10 },
  2: { cards: 8,  time: 15 },
  3: { cards: 10, time: 21 },
  4: { cards: 12, time: 26 },
  5: { cards: 14, time: 31 }
};

// ชุดรูปตามด่าน (ใช้ id แทน emoji เพื่อกันบั๊ก Unicode)
const levelIcons = {
  1: [
    { id: 1, value: "🍎" },
    { id: 2, value: "🍌" },
    { id: 3, value: "🍇" }
  ],
  2: [
    { id: 4, value: "🐶" },
    { id: 5, value: "🐱" },
    { id: 6, value: "🐭" },
    { id: 7, value: "🐹" }
  ],
  3: [
    { id: 8, value: "⚽" },
    { id: 9, value: "🏀" },
    { id: 10, value: "🎾" },
    { id: 11, value: "🏐" },
    { id: 12, value: "🎱" }
  ],
  4: [
    { id: 13, value: "🚗" },
    { id: 14, value: "🚕" },
    { id: 15, value: "🚙" },
    { id: 16, value: "🚌" },
    { id: 17, value: "🚓" },
    { id: 18, value: "🚑" }
  ],
  5: [
    { id: 19, value: "😀" },
    { id: 20, value: "😅" },
    { id: 21, value: "😂" },
    { id: 22, value: "🙂" },
    { id: 23, value: "😐" },
    { id: 24, value: "😑" },
    { id: 25, value: "😶" }
  ]
};

let totalCards = levelConfig[level].cards;
let startTime = levelConfig[level].time;

statusText.textContent = `Level ${level}`;
let timeLeft = startTime;
timerText.textContent = `⏱ ${timeLeft}s`;

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCount = 0;
let gameActive = true;
let timerInterval = null;

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = `⏱ ${timeLeft}s`;

    if (timeLeft <= 5) {
      timerText.style.color = "#ff5252";
    } else {
      timerText.style.color = "#fff";
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameOver(false);
    }
  }, 1000);
}

function createBoard() {
  grid.innerHTML = "";

  const columns = Math.ceil(Math.sqrt(totalCards));
  grid.style.gridTemplateColumns = `repeat(${columns}, 80px)`;

  cards.forEach(icon => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = icon.id;
    card.dataset.icon = icon.value;
    card.textContent = "❓";

    card.addEventListener("click", () => flipCard(card));
    grid.appendChild(card);
  });

  startTimer();
}

function flipCard(card) {
  if (!gameActive || lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  card.textContent = card.dataset.icon;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;

  checkMatch();
}

function checkMatch() {
  if (firstCard.dataset.id === secondCard.dataset.id) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matchedCount += 2;
    resetTurn();

    if (matchedCount === totalCards) {
      clearInterval(timerInterval);
      gameOver(true);
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      firstCard.textContent = "❓";
      secondCard.textContent = "❓";
      resetTurn();
    }, 700);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function gameOver(win) {
  gameActive = false;

  if (win) {
    if (level < 5) {
      statusText.textContent = `🎉 Level ${level} Completed!`;
      retryBtn.textContent = "Next Level";
    } else {
      statusText.textContent = `🏆 All Levels Completed!`;
      retryBtn.textContent = "Play Again";
    }
  } else {
    statusText.textContent = `⏰ Time's up! Try again.`;
    retryBtn.textContent = "Retry";
  }
}

retryBtn.addEventListener("click", () => {
  clearInterval(timerInterval);

  // ชนะ และยังไม่ใช่ด่านสุดท้าย → ไปด่านถัดไป
  if (!gameActive && matchedCount === totalCards && level < 5) {
    level++;
    window.location.href = `memory-game.html?level=${level}`;
    return;
  }

  // เล่นใหม่ด่านเดิม หรือ Play Again
  resetGame();
});

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

function resetGame() {
  matchedCount = 0;
  totalCards = levelConfig[level].cards;
  startTime = levelConfig[level].time;
  timeLeft = startTime;

  timerText.textContent = `⏱ ${timeLeft}s`;
  timerText.style.color = "#fff";
  statusText.textContent = `Level ${level}`;
  retryBtn.textContent = "Retry";

  gameActive = true;
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  // สร้างชุดไอคอนใหม่ตามด่าน
  const iconPool = levelIcons[level];
  let selectedIcons = iconPool.slice(0, totalCards / 2);
  cards = [...selectedIcons, ...selectedIcons];

  // สุ่มตำแหน่ง
  cards.sort(() => 0.5 - Math.random());

  createBoard();
}

// เริ่มเกมครั้งแรก
(function initGame() {
  const iconPool = levelIcons[level];
  let selectedIcons = iconPool.slice(0, totalCards / 2);
  cards = [...selectedIcons, ...selectedIcons];

  cards.sort(() => 0.5 - Math.random());
  createBoard();
})();