// /assets/js/web-socket.js

const host = location.hostname || "127.0.0.1";
const unit = readUnit();

let ws = null;
let suppressSend = false;        // 되돌이 방지
let shouldReconnect = true;      // 실패 응답 받으면 false로 바꿔 재연결 중단
let reconnectAttempt = 0;        // 재연결 시도 횟수

function backoff(msBase = 1000, maxMs = 15000) {
  // 1s, 2s, 4s, 8s... 최대 15s
  const ms = Math.min(maxMs, msBase * Math.pow(2, Math.max(0, reconnectAttempt - 1)));
  return ms;
}

function scheduleReconnect() {
  if (!shouldReconnect) return;
  reconnectAttempt += 1;
  const delay = backoff();
  console.warn(`[WS] reconnect in ${delay}ms (attempt ${reconnectAttempt})`);
  setTimeout(connectWebSocket, delay);
}

function connectWebSocket() {
  // 이미 열려 있으면 무시
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  ws = new WebSocket(`ws://${host}:8000/ws?unit=${encodeURIComponent(unit)}`);

  ws.onopen = () => {
    console.log("[WS] opened:", unit);
    reconnectAttempt = 0; // 성공하면 시도 횟수 리셋
  };

  ws.onclose = () => {
    console.warn("[WS] closed");
    scheduleReconnect();   // ⬅️ 새로고침 대신 재귀적 재연결
  };

  ws.onerror = () => {
    console.error("[WS] error");
    // 일부 브라우저에선 onerror 뒤에 onclose가 안 올 수도 있으니 여기서도 예약
    scheduleReconnect();
  };

  ws.onmessage = (ev) => {
    let data;
    try { data = JSON.parse(ev.data); }
    catch { console.log("WS Text:", ev.data); return; }

    // 1) init: 캐러셀 구성
    if (data.event === "init" && data.status === "success" && Array.isArray(data.items)) {
      const items = data.items;
      const last = data.last_display || {};
      const index = Number.isInteger(last.slide_index) ? last.slide_index : 0;
      buildCarouselByItems(items, index);
      return;
    }

    // 2) 다른 클라이언트의 슬라이드 변경 반영
    if (data.event === "display_changed" && typeof data.index === "number") {
      if (data.unit && data.unit !== unit) return;
      suppressSend = true;
      $('#carouselExampleIndicators').carousel(data.index);
      setTimeout(() => { suppressSend = false; }, 500);
      return;
    }

    // 3) 하트비트: 즉시 ACK
    if (data.event === "heartbeat") {
      try {
        ws.send(JSON.stringify({ event: "heartbeat_ack", unit, ts: new Date().toISOString() }));
      } catch {}
      return;
    }

    // 4) 실패/오류: 실패면 재연결 중단(정책/데이터 문제)
    if (data.status === "failed") {
      shouldReconnect = false;                 // ⬅️ 재연결 멈춤
      const el = document.getElementById("errorDetailMessage");
      if (el) el.textContent = `ERROR: ${data.message || "unknown error"}`;
      console.warn("[WS] failed:", data);
      try { ws.close(); } catch {}
      return;
    }
    if (data.status === "error") {
      console.warn("[WS] error status:", data);
      // 에러(status:error)는 네트워크가 끊긴 건 아님 → 재연결 정책은 유지
      return;
    }

    if (data.event === "system") {
      console.log("[WS][system]:", data.message);
      return;
    }
  };
}
connectWebSocket();


// ---------- 아래는 기존 보조 함수들 그대로 사용 ----------
async function buildCarouselByItems(items, initialIndex = 0) {
  const carousel = document.getElementById("carouselExampleIndicators");
  if (!carousel) return;

  const indicators = carousel.querySelector(".carousel-indicators");
  const inner = carousel.querySelector(".carousel-inner");
  indicators.innerHTML = "";
  inner.innerHTML = "";

  if (!items.length) {
    inner.innerHTML = `
      <div class="carousel-item active">
        <div class="d-flex h-100 align-items-center justify-content-center text-white">
          <div class="text-center">
            <div class="mb-2">표시할 작업표준서가 없습니다.</div>
            <div class="small text-muted">(${unit})</div>
          </div>
        </div>
      </div>`;
    return;
  }

  const resolved = await Promise.all(
    items.map(async (it) => {
      const code = String(it.item_code || "").trim();
      const imgSrc = toWorkStandardPath(code);
      const exists = await checkImage(encodeURI(imgSrc));
      return { code, imgSrc, exists };
    })
  );

  resolved.forEach((r, idx) => {
    const li = document.createElement("li");
    li.setAttribute("data-target", "#carouselExampleIndicators");
    li.setAttribute("data-slide-to", String(idx));
    if (idx === 0) li.classList.add("active");
    indicators.appendChild(li);

    const div = document.createElement("div");
    div.className = "carousel-item" + (idx === 0 ? " active" : "");
    div.dataset.itemCode = r.code;

    if (r.exists) {
      div.innerHTML = `
        <center>
          <img class="d-block" alt="${escapeHtml(r.code)}" style="height: 90%; object-fit: contain;" src="${encodeURI(r.imgSrc)}" />
        </center>`;
    } else {
      div.innerHTML = `
        <div class="d-flex h-100 align-items-center justify-content-center">
          <div class="position-relative" style="height:90%; width:100%; max-width:1100px;">
            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#fff; text-align:center;">
              <div>
                <div style="font-size:1.25rem; font-weight:500;">작업표준서 미등록</div>
                <div style="opacity:.8; margin-top:.25rem;">${escapeHtml(r.code)}</div>
              </div>
            </div>
          </div>
        </div>`;
    }

    inner.appendChild(div);
  });

  if (initialIndex > 0) {
    setTimeout(() => { $('#carouselExampleIndicators').carousel(initialIndex); }, 100);
  }
}

function checkImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
function toWorkStandardPath(itemCode) {
  return `/assets/images/work_standards/${itemCode}_WS.jpg`;
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// 캐러셀 ‘슬라이드 완료’ → 상태 전송 (되돌이 방지)
$(function () {
  const $carousel = $("#carouselExampleIndicators");

  function sendDisplayState() {
    if (suppressSend || !ws || ws.readyState !== WebSocket.OPEN) return;

    const active = $carousel.find(".carousel-item.active")[0];
    if (!active) return;

    const itemCode = active.dataset.itemCode || null;
    const index = $(active).index();
    if (!itemCode) return;

    ws.send(JSON.stringify({
      event: "display_changed",
      unit,
      item_code: itemCode,
      index,
      ts: new Date().toISOString(),
    }));
  }

  $carousel.on("slid.bs.carousel", sendDisplayState);
  window.__notifyInitialDisplay = function () { setTimeout(sendDisplayState, 0); };
});
