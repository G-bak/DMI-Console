// /assets/js/work-standards.js

document.addEventListener("DOMContentLoaded", () => {
  const unitParam = readUnit();

  // 헤더 표시(그대로)
  const initialLabel = toHogiLabel(unitParam);
  setHeaderTexts(initialLabel);

  // 홈 버튼
  const homeBtn = document.querySelector(".home");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "/console";
    });
  }

  // 키보드(← → ESC)
  document.addEventListener("keydown", (e) => {
    const carousel = document.getElementById("carouselExampleIndicators");
    if (!carousel) return;

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
    if (e.key === "ArrowLeft") {
      const prev = carousel.querySelector(".carousel-control-prev");
      if (prev) prev.click();
    } else if (e.key === "ArrowRight") {
      const next = carousel.querySelector(".carousel-control-next");
      if (next) next.click();
    } else if (e.key === "Escape") {
      window.location.href = "/console";
    }
  });
});

// --- helpers ---
function toHogiLabel(src) {
  if (!src) return "Null";
  const s = String(src).trim();
  const mR = s.toUpperCase().match(/R-(\d+)/);
  if (mR) return `R-${mR[1]}`;
  const mNum = s.match(/(\d+)/);
  if (mNum) return `R-${mNum[1]}`;
  return s;
}

function setHeaderTexts(hogiLabel) {
  document.title = `ROBOT ${hogiLabel}`;
  const bcActive = document.querySelector(".equipment-number, .equipment-number");
  if (bcActive) bcActive.textContent = hogiLabel;
}