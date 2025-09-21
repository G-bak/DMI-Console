// /assets/js/equipment-navigator.js

document.addEventListener('DOMContentLoaded', () => {
  const svg = document.querySelector('svg[aria-label="DMI 작업표준서 호기 분류 도면"]');
  if (!svg) return;

  svg.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t && t.tagName === 'rect' && t.classList.contains('boxStroke') && t.classList.contains('cursor-pointer'))) {
      return;
    }

    const unit = findUnitText(t);
    if (!unit) {
      alert('호기 번호를 찾지 못했습니다.');
      return;
    }

    const url = new URL(`/work-standards/${encodeURIComponent(unit)}`, location.origin);
    location.href = url.toString();
  });
});

/**
 * 형제 중 가장 가까운 <text>에서 호기번호 추출
 * 1) 우선 형제 중 text.chip만 대상으로 거리 최솟값 선택
 * 2) 없으면 형제 중 모든 <text>에서 선택
 * 3) 최종 텍스트에서 /R-\d+/ 패턴 추출 (없으면 전체 텍스트 반환)
 */
function findUnitText(rectEl) {
  const parent = rectEl.parentElement;
  if (!parent) return null;

  const rectBox = getBBoxSafe(rectEl);
  const rcx = rectBox.x + rectBox.width / 2;
  const rcy = rectBox.y + rectBox.height / 2;

  // :scope > text (직계 자식만) 지원 & 폴백
  let texts = parent.querySelectorAll(':scope > text');
  if (!texts || texts.length === 0) {
    texts = Array.from(parent.children).filter((n) => n.tagName === 'text');
  } else {
    texts = Array.from(texts);
  }

  if (texts.length === 0) return null;

  // chip 우선 필터
  const chipTexts = texts.filter((t) => t.classList.contains('chip'));
  const candidates = chipTexts.length ? chipTexts : texts;

  // 거리 계산해서 최단 거리 <text> 선택
  const scored = candidates.map((tx) => {
    const box = getBBoxSafe(tx);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const raw = getFullText(tx).trim();
    const dist = Math.hypot(rcx - cx, rcy - cy);
  
    return { raw, dist };
  });

  scored.sort((a, b) => a.dist - b.dist);
  const best = scored[0]?.raw || '';

  // R-숫자 패턴만 깔끔 추출
  const unit = (best.match(/R-\d+/i)?.[0] || best).toUpperCase().replace(/\s+/g, '');
  return unit || null;
}

// --- helpers ---
function getBBoxSafe(el) {
  try {
    const b = el.getBBox();
    return { x: +b.x || 0, y: +b.y || 0, width: +b.width || 0, height: +b.height || 0 };
  } catch {
    const x = parseFloat(el.getAttribute('x') || '0');
    const y = parseFloat(el.getAttribute('y') || '0');
    const w = parseFloat(el.getAttribute('width') || '0');
    const h = parseFloat(el.getAttribute('height') || '0');
    return { x, y, width: w, height: h };
  }
}

function getFullText(textEl) {
  // tspan 등을 포함한 전체 텍스트를 안전하게 합침
  try {
    return Array.from(textEl.childNodes).map((n) => n.textContent || '').join('');
  } catch {
    return textEl.textContent || '';
  }
}

function safeOuterHTML(el) {
  try {
    const s = el.outerHTML || '';
    return s.length > 200 ? s.slice(0, 200) + '…' : s;
  } catch {
    return '';
  }
}
