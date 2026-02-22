const levelButtons = document.querySelectorAll(".level-buttons button");

levelButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const level = btn.getAttribute("data-level");
    window.location.href = `memory-game.html?level=${level}`;
  });
});