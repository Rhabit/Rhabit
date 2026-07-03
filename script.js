/* ============================================================
   Rhabit — landing / captación de correos
   ------------------------------------------------------------
   El sistema de envío masivo se conectará MÁS ADELANTE con una
   herramienta open source (p. ej. Listmonk). Aquí solo captamos.

   Funcionamiento:
   - Se valida el correo en el navegador.
   - Se calcula su hash SHA-256 (para el .txt público de la repo,
     que así no expone correos en claro).
   - Se envía al "collector" (backend que guardará el correo real
     en privado para poder enviar el aviso). Mientras no exista,
     la web funciona igual y muestra el mensaje de éxito.
   ============================================================ */

// URL del backend que recogerá los correos. Déjalo vacío hasta
// que despliegues el collector (ver carpeta /collector). Cuando
// esté listo, pon aquí su URL, p. ej. "https://api.tudominio.com/subscribe".
const COLLECTOR_URL = "";

const form     = document.getElementById("waitlist-form");
const input    = document.getElementById("email");
const hint     = document.getElementById("form-hint");
const success  = document.getElementById("waitlist-success");
const wrapForm = form;

/* --- Hash SHA-256 en hex (para el registro público) --- */
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf  = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

const altch = document.getElementById("altch");

function showSuccess() {
  wrapForm.hidden = true;
  if (altch) altch.hidden = true;
  success.hidden  = false;
  success.scrollIntoView({ behavior: "smooth", block: "center" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = input.value.trim().toLowerCase();

  if (!isValidEmail(email)) {
    input.classList.add("invalid");
    hint.textContent = "Hmm, ese correo no parece válido. Revísalo.";
    input.focus();
    return;
  }
  input.classList.remove("invalid");

  // Evita duplicados desde el mismo navegador
  const already = JSON.parse(localStorage.getItem("rhabit_waitlist") || "[]");
  const hash = await sha256(email);
  if (already.includes(hash)) {
    showSuccess();
    return;
  }

  const payload = { email, hash, ts: new Date().toISOString(), src: "landing" };

  // Envía al collector si está configurado; si no, guarda en local.
  try {
    if (COLLECTOR_URL) {
      await fetch(COLLECTOR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {
    // Aunque falle el envío, no bloqueamos al usuario; queda en local.
    console.warn("Collector no disponible aún:", err);
  }

  already.push(hash);
  localStorage.setItem("rhabit_waitlist", JSON.stringify(already));
  showSuccess();
});

/* ============================================================
   Vías alternativas al correo (WhatsApp, Instagram, etc.)
   El usuario elige un medio y deja su usuario/número; se avisará
   por ahí. Mismo collector: payload con { channel, handle }.
   ============================================================ */
(function initAltChannels() {
  const chips  = document.getElementById("altch-chips");
  const altForm = document.getElementById("altch-form");
  const altInput = document.getElementById("altch-input");
  const altBadge = document.getElementById("altch-badge");
  const altName  = document.getElementById("altch-name");
  const altUse   = altBadge && altBadge.querySelector("use");
  if (!chips || !altForm) return;

  const CHANNELS = {
    whatsapp:  { name: "WhatsApp",  icon: "b-whatsapp",  color: "#25d366", ph: "Tu número, ej. +34 600 00 00 00" },
    instagram: { name: "Instagram", icon: "b-instagram", color: "#e1306c", ph: "Tu usuario, ej. @tu_usuario" },
    facebook:  { name: "Facebook",  icon: "b-facebook",  color: "#1877f2", ph: "Tu perfil o usuario" },
    telegram:  { name: "Telegram",  icon: "b-telegram",  color: "#2aabee", ph: "Tu usuario, ej. @tu_usuario" },
    x:         { name: "X",         icon: "b-x",         color: "#e7e7e7", ph: "Tu usuario, ej. @tu_usuario" },
    tiktok:    { name: "TikTok",    icon: "b-tiktok",    color: "#ff0050", ph: "Tu usuario, ej. @tu_usuario" },
  };

  let current = null;

  chips.querySelectorAll(".altch__chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.ch;
      const cfg = CHANNELS[key];
      if (!cfg) return;
      // Clic en la red ya activa → cierra el campo.
      if (current === key) {
        current = null;
        chip.classList.remove("sel");
        altForm.hidden = true;
        return;
      }
      current = key;
      chips.querySelectorAll(".altch__chip").forEach(c => c.classList.toggle("sel", c === chip));
      altInput.placeholder = cfg.ph;
      altName.textContent = cfg.name;
      altBadge.style.setProperty("--ch", cfg.color);
      if (altUse) altUse.setAttribute("href", "#" + cfg.icon);
      altForm.hidden = false;
      altInput.classList.remove("invalid");
      altInput.focus();
    });
  });

  altForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const handle = altInput.value.trim();
    if (!current || handle.length < 3) {
      altInput.classList.add("invalid");
      altInput.focus();
      return;
    }
    altInput.classList.remove("invalid");

    const raw = current + ":" + handle.toLowerCase();
    const already = JSON.parse(localStorage.getItem("rhabit_waitlist") || "[]");
    const hash = await sha256(raw);
    if (already.includes(hash)) { showSuccess(); return; }

    const payload = { channel: current, handle, hash, ts: new Date().toISOString(), src: "landing" };
    try {
      if (COLLECTOR_URL) {
        await fetch(COLLECTOR_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch (err) {
      console.warn("Collector no disponible aún:", err);
    }

    already.push(hash);
    localStorage.setItem("rhabit_waitlist", JSON.stringify(already));
    showSuccess();
  });
})();

/* ============================================================
   Mockup interactivo: CALENDARIO (recreación de la app)
   Sin funcionalidad real; solo navegación de mes y selección.
   ============================================================ */
(function initCalendar() {
  const grid  = document.getElementById("cal-grid");
  const title = document.getElementById("cal-title");
  if (!grid || !title) return;

  const schTitle = document.getElementById("sch-title");
  const schBody  = document.getElementById("sch-body");
  const schScroll = document.getElementById("sch-scroll");

  const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const WDAYS  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  // "Hoy" ficticio fijo para el mockup
  const TODAY = { y: 2026, m: 6, d: 3 }; // m: 0-indexed (Julio)

  // Patrón de hábitos completados del mes base (día -> % de progreso; 100 = completo)
  const DONE = { 1:100, 2:100, 3:80, 5:100, 6:60, 7:100, 8:100, 9:40, 12:100, 13:100, 15:100, 16:70, 19:100, 22:100, 23:50, 26:100 };

  const HOUR_H = 34; // px por hora

  // Rutinas por día de la semana (getDay: 0=Dom … 6=Sáb). La franja cambia con el día.
  const PLANS = [
    /* Dom */ [ {h:10,dur:60,t:"Correr",s:"Parque · 5 km",c:"#ff7a1a",i:"flame"}, {h:12,m:30,dur:20,t:"Meditar",s:"10 min",c:"#9b8cff",i:"wind"}, {h:18,dur:45,t:"Leer",s:"Novela",c:"#f5b14a",i:"book"} ],
    /* Lun */ [ {h:8,m:15,dur:60,t:"Gimnasio",s:"Pecho y tríceps",c:"#ff7a1a",i:"dumbbell"}, {h:13,dur:30,t:"Comer sano",s:"Verduras",c:"#4fd6a8",i:"leaf"}, {h:16,dur:15,t:"Beber agua",s:"1,5 L",c:"#3fb6ff",i:"droplet"}, {h:20,dur:40,t:"Estudiar",s:"Inglés",c:"#f5b14a",i:"book"} ],
    /* Mar */ [ {h:7,m:30,dur:30,t:"Meditar",s:"Mañana",c:"#9b8cff",i:"wind"}, {h:11,dur:20,t:"Beber agua",s:"Recordatorio",c:"#3fb6ff",i:"droplet"}, {h:19,dur:50,t:"Gimnasio",s:"Pierna",c:"#ff7a1a",i:"dumbbell"} ],
    /* Mié */ [ {h:8,m:15,dur:45,t:"Gimnasio",s:"Pecho y tríceps",c:"#ff7a1a",i:"dumbbell"}, {h:11,dur:20,t:"Meditar",s:"10 min",c:"#9b8cff",i:"wind"}, {h:14,dur:30,t:"Comer sano",s:"Ensalada",c:"#4fd6a8",i:"leaf"}, {h:21,dur:30,t:"Leer",s:"20 páginas",c:"#f5b14a",i:"book"} ],
    /* Jue */ [ {h:9,dur:40,t:"Correr",s:"3 km",c:"#ff7a1a",i:"flame"}, {h:13,m:30,dur:20,t:"Beber agua",s:"2 L",c:"#3fb6ff",i:"droplet"}, {h:18,m:30,dur:45,t:"Estudiar",s:"Curso online",c:"#f5b14a",i:"book"} ],
    /* Vie */ [ {h:8,m:15,dur:60,t:"Gimnasio",s:"Espalda y bíceps",c:"#ff7a1a",i:"dumbbell"}, {h:12,dur:20,t:"Meditar",s:"Respiración",c:"#9b8cff",i:"wind"}, {h:20,dur:30,t:"Comer sano",s:"Cena ligera",c:"#4fd6a8",i:"leaf"} ],
    /* Sáb */ [ {h:10,m:30,dur:75,t:"Senderismo",s:"Montaña",c:"#ff7a1a",i:"flame"}, {h:17,dur:20,t:"Beber agua",s:"Hidratación",c:"#3fb6ff",i:"droplet"}, {h:19,m:30,dur:40,t:"Leer",s:"Ensayo",c:"#f5b14a",i:"book"} ],
  ];

  // Metas/eventos puntuales (clave y-m-d, m 0-indexado). Los meses que
  // visita la demo (agosto=7, septiembre=8) tienen su propia meta.
  const evKey = (y, m, d) => `${y}-${m}-${d}`;
  const EVENTS = {
    "2026-7-14": { h: 9,  dur: 60, t: "Meta: 12 entrenos", s: "Objetivo de agosto", c: "#f5b14a", i: "target", goal: true },
    "2026-8-6":  { h: 10, dur: 90, t: "Reto 10 km",        s: "Carrera popular",     c: "#ff7a1a", i: "flame",  goal: true },
  };

  let view = { y: TODAY.y, m: TODAY.m };
  let selected = new Date(TODAY.y, TODAY.m, TODAY.d);

  // Semana ISO (aprox) para la columna "S##"
  function isoWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day + 3);
    const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    return 1 + Math.round(((d - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  }

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isTodayDate = (d) => d.getFullYear() === TODAY.y && d.getMonth() === TODAY.m && d.getDate() === TODAY.d;

  // ---- Franja horaria (scrollable, cambia según el día) ----
  function renderSchedule(date) {
    const label = `${WDAYS[date.getDay()]} ${date.getDate()}`;
    schTitle.innerHTML = isTodayDate(date) ? `Hoy · <b>${label}</b>` : `<b>${label}</b>`;

    // Un día tiene franja si tuvo actividad (mes base) y/o una meta puntual.
    const isBaseMonth = date.getFullYear() === TODAY.y && date.getMonth() === TODAY.m;
    const hasPlan = isBaseMonth && (date.getDate() in DONE);
    const plan = hasPlan ? (PLANS[date.getDay()] || []) : [];
    const ev = EVENTS[evKey(date.getFullYear(), date.getMonth(), date.getDate())];
    const blocks = ev ? [...plan, ev] : [...plan];
    blocks.sort((a, b) => (a.h + (a.m || 0) / 60) - (b.h + (b.m || 0) / 60));

    let html = "";
    for (let h = 0; h < 24; h++) {
      html += `<div class="sch-hour" style="height:${HOUR_H}px"><span>${String(h).padStart(2,"0")}:00</span></div>`;
    }
    if (blocks.length === 0) {
      html += `<div class="sch-empty" style="top:${7 * HOUR_H + 4}px">Sin actividades este día</div>`;
    }
    for (const b of blocks) {
      const top = (b.h + (b.m || 0) / 60) * HOUR_H;
      const height = Math.max(22, (b.dur / 60) * HOUR_H - 2);
      const startStr = `${String(b.h).padStart(2,"0")}:${String(b.m||0).padStart(2,"0")}`;
      html += `<div class="sch-block${b.goal ? " sch-block--goal" : ""}" style="--c:${b.c};top:${top}px;height:${height}px">` +
        `<svg class="ico"><use href="#i-${b.i}"/></svg>` +
        `<span><b>${b.t}</b><small>${startStr} · ${b.s}</small></span></div>`;
    }
    schBody.style.height = `${24 * HOUR_H}px`;
    schBody.innerHTML = html;
    // Coloca el scroll en la primera actividad del día (o a las 7:00).
    const firstH = blocks.length ? blocks[0].h : 7;
    schScroll.scrollTop = Math.max(0, firstH * HOUR_H - HOUR_H);
  }

  function selectDay(date, cell) {
    selected = date;
    grid.querySelectorAll(".cal-day.sel").forEach(el => el.classList.remove("sel"));
    if (cell && !isTodayDate(date)) cell.classList.add("sel");
    renderSchedule(date);
  }

  function render(dir) {
    const { y, m } = view;
    title.innerHTML = `${MONTHS[m]} <b>${y}</b>`;
    const isBase = y === TODAY.y && m === TODAY.m;

    // Animación de transición al cambiar de mes (slide + fade direccional).
    if (dir) {
      const cls = dir === "next" ? "anim-next" : "anim-prev";
      grid.classList.remove("anim-next", "anim-prev");
      title.classList.remove("anim-next", "anim-prev");
      void grid.offsetWidth; // fuerza reflow para reiniciar la animación
      grid.classList.add(cls);
      title.classList.add(cls);
    }

    const first = new Date(y, m, 1);
    const startOffset = (first.getDay() + 6) % 7; // lunes = 0
    const gridStart = new Date(y, m, 1 - startOffset);
    const weeks = 6;
    grid.innerHTML = "";

    for (let w = 0; w < weeks; w++) {
      const row = document.createElement("div");
      row.className = "cal-week";
      const weekDate = new Date(gridStart);
      weekDate.setDate(gridStart.getDate() + w * 7);
      row.innerHTML = `<span class="cal-weeknum">S${isoWeek(weekDate)}</span>`;

      for (let i = 0; i < 7; i++) {
        const cur = new Date(gridStart);
        cur.setDate(gridStart.getDate() + w * 7 + i);
        const inMonth = cur.getMonth() === m;
        const dNum = cur.getDate();
        const isToday = isBase && inMonth && dNum === TODAY.d;
        const prog = isBase && inMonth ? DONE[dNum] : undefined;
        const isSel = inMonth && sameDay(cur, selected) && !isToday;
        const ev = inMonth ? EVENTS[evKey(y, m, dNum)] : undefined;

        const cell = document.createElement("div");
        cell.className = "cal-day" + (inMonth ? "" : " dim") + (isToday ? " today" : "") +
          (isSel ? " sel" : "") + (ev ? " has-event" : "");
        if (ev) cell.style.setProperty("--ec", ev.c);
        // Anillo de progreso vectorial (SVG) — nítido a cualquier zoom.
        const ring = prog
          ? `<svg class="cal-ring" viewBox="0 0 36 36" aria-hidden="true">` +
              `<circle class="cal-ring__bg" cx="18" cy="18" r="16" pathLength="100"/>` +
              `<circle class="cal-ring__fg" cx="18" cy="18" r="16" pathLength="100" style="stroke-dasharray:${prog} 100"/>` +
            `</svg>`
          : "";
        cell.innerHTML =
          `<div class="cal-day__inner">` +
          ring +
          `<span class="cal-day__num">${dNum}</span>` +
          (ev ? `<span class="cal-day__evbadge"><svg class="ico"><use href="#i-${ev.i}"/></svg></span>` : "") +
          `</div>`;

        if (inMonth) {
          const cellDate = new Date(cur);
          cell.addEventListener("click", () => selectDay(cellDate, cell));
        }
        row.appendChild(cell);
      }
      grid.appendChild(row);
    }
  }

  document.querySelector("[data-cal-prev]")?.addEventListener("click", () => {
    view.m--; if (view.m < 0) { view.m = 11; view.y--; } render("prev");
  });
  document.querySelector("[data-cal-next]")?.addEventListener("click", () => {
    view.m++; if (view.m > 11) { view.m = 0; view.y++; } render("next");
  });

  render();
  renderSchedule(selected);

  // --- Intro automática (demo tipo anuncio) al entrar en viewport ---
  function tapDay(day) {
    const cells = [...grid.querySelectorAll(".cal-day")];
    for (const cell of cells) {
      if (cell.classList.contains("dim")) continue;
      const num = cell.querySelector(".cal-day__num");
      if (num && +num.textContent === day) {
        selectDay(new Date(view.y, view.m, day), cell);
        return;
      }
    }
  }
  const calScreen = document.getElementById("cal-screen");
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const calNext = document.querySelector("[data-cal-next]");
  const calPrev = document.querySelector("[data-cal-prev]");
  // Scroll suave de la agenda hasta una hora concreta (busca el evento).
  function seekToHour(h) {
    schScroll.scrollTo({ top: Math.max(0, h * HOUR_H - HOUR_H), behavior: "smooth" });
  }
  let calIntroDone = false;
  function runCalIntro() {
    if (calIntroDone || reduce) return;
    calIntroDone = true;
    // Agosto: selecciona los días previos (12, 13) y llega a la meta (14).
    setTimeout(() => calNext?.click(), 700);
    setTimeout(() => tapDay(12), 1500);
    setTimeout(() => tapDay(13), 2100);
    setTimeout(() => { tapDay(14); schScroll.scrollTop = 0; }, 2800);
    setTimeout(() => seekToHour(EVENTS[evKey(2026, 7, 14)].h), 3400);
    // Septiembre: días previos (4, 5) y meta (6).
    setTimeout(() => calNext?.click(), 4700);
    setTimeout(() => tapDay(4), 5500);
    setTimeout(() => tapDay(5), 6100);
    setTimeout(() => { tapDay(6); schScroll.scrollTop = 0; }, 6800);
    setTimeout(() => seekToHour(EVENTS[evKey(2026, 8, 6)].h), 7400);
    // Vuelve a julio (hoy).
    setTimeout(() => calPrev?.click(), 8700);
    setTimeout(() => calPrev?.click(), 9400);
    setTimeout(() => tapDay(3), 10100);
  }
  if (calScreen && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { runCalIntro(); cio.disconnect(); } });
    }, { threshold: 0.5 });
    cio.observe(calScreen);
  }
})();

/* ============================================================
   Mockup interactivo: SWIPE DE HÁBITOS
   Tarjetas tipo review: derecha = Hecho, izquierda = No hecho,
   arriba = Más tarde. Arrastrable con ratón/dedo o con botones.
   ============================================================ */
(function initSwipe() {
  const deck   = document.getElementById("sw-deck");
  const progEl = document.getElementById("sw-prog");
  const screen = document.getElementById("swipe-screen");
  if (!deck) return;

  const HABITS = [
    { name: "Beber agua",     prompt: "¿Lo hiciste hoy?",     c: "#3fb6ff", i: "droplet" },
    { name: "Gimnasio",       prompt: "¿Ya lo completaste?",  c: "#ff7a1a", i: "dumbbell" },
    { name: "Leer 20 min",    prompt: "¿Lo has cumplido hoy?",c: "#f5b14a", i: "book" },
    { name: "Meditar",        prompt: "¿Lo sacaste adelante?",c: "#9b8cff", i: "wind" },
    { name: "Comer verduras", prompt: "¿Cómo fue hoy?",       c: "#4fd6a8", i: "leaf" },
  ];
  const TOTAL = HABITS.length;
  const STACK = 3;         // tarjetas visibles a la vez
  const THRESHOLD = 70;    // px para confirmar el gesto
  const COL = { done: "#f5b14a", fail: "#ef5b3c", later: "#ff7a1a" };

  let queue = [];
  let reviewed = 0;
  let busy = false;
  let introDone = false;
  let introTimers = [];

  const cardHTML = (h) => `
    <div class="sw-card" style="--c:${h.c}">
      <div class="sw-wash"></div>
      <div class="sw-stamp sw-stamp--done"><svg class="ico"><use href="#i-check"/></svg>Hecho</div>
      <div class="sw-stamp sw-stamp--fail"><svg class="ico"><use href="#i-x"/></svg>No hecho</div>
      <div class="sw-stamp sw-stamp--later"><svg class="ico"><use href="#i-clock"/></svg>Más tarde</div>
      <div class="sw-chip"><i></i> HOY</div>
      <div class="sw-hero"><svg class="ico"><use href="#i-${h.i}"/></svg></div>
      <div class="sw-name">${h.name}</div>
      <div class="sw-prompt">${h.prompt}</div>
      <div class="sw-swipehint"><svg class="ico"><use href="#i-swipe"/></svg> Desliza o usa los botones</div>
    </div>`;

  // Progreso segmentado (un segmento por hábito).
  function buildProgress() {
    progEl.innerHTML = HABITS.map(() => `<div class="sw-seg"><span></span></div>`).join("");
  }
  function setProgress() {
    [...progEl.children].forEach((seg, i) => seg.classList.toggle("on", i < reviewed));
  }

  function render() {
    deck.innerHTML = "";
    if (queue.length === 0) {
      deck.innerHTML = `
        <div class="sw-done">
          <div class="sw-done__ring"><svg class="ico"><use href="#i-check"/></svg></div>
          <h4>¡Día revisado!</h4>
          <p>${reviewed} hábito${reviewed === 1 ? "" : "s"} al día · racha a salvo</p>
          <button class="sw-restart" id="sw-restart">Repetir</button>
        </div>`;
      deck.querySelector("#sw-restart").addEventListener("click", start);
      return;
    }
    // Pinta hasta STACK tarjetas; la primera del array queda arriba (al final del DOM).
    const visible = queue.slice(0, STACK).reverse();
    visible.forEach((h, idxFromBack) => {
      const depth = visible.length - 1 - idxFromBack; // 0 = arriba
      const el = document.createElement("div");
      el.innerHTML = cardHTML(h);
      const card = el.firstElementChild;
      card.style.transform = `translateY(${depth * 8}px) scale(${1 - depth * 0.05})`;
      card.style.zIndex = String(STACK - depth);
      card.style.opacity = depth >= STACK - 1 ? "0.6" : "1";
      if (depth === 0) attachDrag(card);
      deck.appendChild(card);
    });
  }

  function topCard() {
    const cards = deck.querySelectorAll(".sw-card");
    return cards[cards.length - 1] || null;
  }

  // ---- Animación de intro: la tarjeta se balancea encendiendo los sellos ----
  function cancelIntro() {
    introTimers.forEach(clearTimeout);
    introTimers = [];
    const card = topCard();
    if (card && card.classList.contains("intro")) {
      card.classList.remove("intro");
      card.style.transition = "";
      card.style.transform = "translateY(0) scale(1)";
      card.querySelectorAll(".sw-stamp").forEach(s => (s.style.opacity = "0"));
      const w = card.querySelector(".sw-wash"); if (w) w.style.opacity = "0";
    }
  }
  function runIntro() {
    if (introDone) return;
    const card = topCard();
    if (!card) return;
    introDone = true;
    const done = card.querySelector(".sw-stamp--done");
    const fail = card.querySelector(".sw-stamp--fail");
    const wash = card.querySelector(".sw-wash");
    card.classList.add("intro");
    card.style.transition = "transform .5s cubic-bezier(.3,0,.2,1)";
    // Secuencia: derecha (Hecho) → izquierda (No hecho) → centro, dos veces.
    const steps = [
      { t: 420, x: 46, rot: 6,  d: 0.95, f: 0,    col: COL.done, wo: 0.12 },
      { t: 560, x: -46, rot: -6, d: 0,    f: 0.95, col: COL.fail, wo: 0.12 },
      { t: 460, x: 0,  rot: 0,  d: 0,    f: 0,    col: COL.done, wo: 0 },
    ];
    let delay = 500;
    for (let c = 0; c < 2; c++) {
      for (const s of steps) {
        introTimers.push(setTimeout(() => {
          card.style.transform = `translate(${s.x}px,0) rotate(${s.rot}deg)`;
          done.style.opacity = String(s.d);
          fail.style.opacity = String(s.f);
          if (wash) { wash.style.background = s.col; wash.style.opacity = String(s.wo); }
        }, delay));
        delay += s.t;
      }
    }
    introTimers.push(setTimeout(cancelIntro, delay));
  }

  function fling(card, dir) {
    // dir: 'done' (der), 'fail' (izq), 'later' (arriba)
    busy = true;
    cancelIntro();
    const x = dir === "done" ? 460 : dir === "fail" ? -460 : 0;
    const y = dir === "later" ? -560 : 40;
    const rot = dir === "done" ? 20 : dir === "fail" ? -20 : 0;
    card.classList.add("leaving");
    card.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg)`;
    card.style.opacity = "0";
    setTimeout(() => {
      const h = queue.shift();
      if (dir === "later") queue.push(h);   // aplazado → al final
      else reviewed++;
      setProgress();
      busy = false;
      render();
    }, 320);
  }

  const DIR_LOCK = 8;   // px para fijar el eje del gesto

  function attachDrag(card) {
    let sx = 0, sy = 0, dx = 0, dy = 0, dragging = false, lockDir = 0; // 0=libre 1=horiz 2=vert
    const done  = card.querySelector(".sw-stamp--done");
    const fail  = card.querySelector(".sw-stamp--fail");
    const later = card.querySelector(".sw-stamp--later");
    const wash  = card.querySelector(".sw-wash");

    const down = (e) => {
      if (busy) return;
      cancelIntro();
      dragging = true;
      lockDir = 0;
      sx = e.clientX; sy = e.clientY;
      card.setPointerCapture(e.pointerId);
      card.style.transition = "none";
    };
    const move = (e) => {
      if (!dragging) return;
      const rx = e.clientX - sx, ry = e.clientY - sy;
      const ax = Math.abs(rx), ay = Math.abs(ry);
      // Bloqueo de eje: al superar el umbral se fija la dirección y se anula el
      // otro eje; si se vuelve cerca del centro, se libera para elegir otra.
      if (lockDir === 0) {
        if (ax > DIR_LOCK || ay > DIR_LOCK) lockDir = ax >= ay ? 1 : 2;
      } else if (ax < DIR_LOCK && ay < DIR_LOCK) {
        lockDir = 0;
      }
      if (lockDir === 1)      { dx = rx; dy = 0; }               // solo izquierda/derecha
      else if (lockDir === 2) { dy = Math.min(0, ry); dx = 0; }  // solo arriba (abajo no)
      else                    { dx = 0; dy = 0; }

      card.style.transform = `translate(${dx}px,${dy}px) rotate(${dx * 0.05}deg)`;
      const dOp = Math.max(0, Math.min(1, dx / THRESHOLD));
      const fOp = Math.max(0, Math.min(1, -dx / THRESHOLD));
      const lOp = Math.max(0, Math.min(1, -dy / THRESHOLD));
      done.style.opacity  = String(dOp);
      fail.style.opacity  = String(fOp);
      later.style.opacity = String(lOp);
      // Lavado de color según la dirección bloqueada.
      const m = Math.max(dOp, fOp, lOp);
      wash.style.background = lockDir === 2 ? COL.later : dx >= 0 ? COL.done : COL.fail;
      wash.style.opacity = String(m * 0.16);
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      card.style.transition = "";
      if (lockDir === 2 && dy < -THRESHOLD)       fling(card, "later");
      else if (lockDir === 1 && dx >  THRESHOLD)  fling(card, "done");
      else if (lockDir === 1 && dx < -THRESHOLD)  fling(card, "fail");
      else {
        // No supera el umbral → vuelve al centro para poder deslizar a otra dirección.
        card.style.transform = "translateY(0) scale(1)";
        done.style.opacity = fail.style.opacity = later.style.opacity = "0";
        wash.style.opacity = "0";
      }
    };
    card.addEventListener("pointerdown", down);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", up);
    card.addEventListener("pointercancel", up);
  }

  function start() {
    queue = [...HABITS];
    reviewed = 0;
    setProgress();
    render();
  }

  // Botones de acción
  document.querySelectorAll(".sw-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (busy) return;
      cancelIntro();
      const card = topCard();
      if (card) fling(card, btn.dataset.act);
    });
  });

  buildProgress();
  start();

  // Lanza la intro la primera vez que la pantalla entra en viewport.
  if (screen && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !introDone) { runIntro(); io.disconnect(); }
      });
    }, { threshold: 0.55 });
    io.observe(screen);
  } else {
    setTimeout(runIntro, 900);
  }
})();

/* ============================================================
   Mockup interactivo: REGISTRO DE ENTRENO (recreación de la app)
   Edita peso/reps, marca series completadas y añade series.
   El volumen y las series se recalculan al vuelo.
   ============================================================ */
(function initGym() {
  const scroll = document.getElementById("gym-scroll");
  const volEl  = document.getElementById("gym-vol");
  const setsEl = document.getElementById("gym-sets");
  if (!scroll) return;

  // --- Ventana emergente (dentro del móvil) con detalle del ejercicio ---
  const modal     = document.getElementById("exmodal");
  const modalVid  = document.getElementById("exmodal-video");
  const modalName = document.getElementById("exmodal-name");
  const modalPrs  = document.getElementById("exmodal-prs");
  const modalSets = document.getElementById("exmodal-sets");
  function openExModal(ex) {
    modalVid.src = ex.video;
    modalName.textContent = ex.name;
    modalPrs.innerHTML =
      `<div class="expr"><b>${ex.pr.peso}</b><span>Mejor peso</span></div>` +
      `<div class="expr"><b>${ex.pr.rm}</b><span>1RM est.</span></div>` +
      `<div class="expr"><b>${ex.pr.vol}</b><span>Volumen</span></div>`;
    modalSets.innerHTML = ex.sets.map((s, i) => {
      const vol = (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0);
      return `<div class="exset${s.done ? " done" : ""}">` +
        `<span class="exmark">${s.done ? `<svg class="ico"><use href="#i-check"/></svg>` : ""}</span>` +
        `<b>Serie ${i + 1}</b>` +
        `<span class="exset__data">${s.kg || "—"} kg × ${s.reps || "—"}</span>` +
        `<span class="exset__vol">${vol ? vol + " kg" : "—"}</span></div>`;
    }).join("");
    modal.hidden = false;
    modalVid.currentTime = 0;
    modalVid.play().catch(() => {});
  }
  function closeExModal() {
    modal.hidden = true;
    modalVid.pause();
  }
  modal.querySelectorAll("[data-exclose]").forEach(el => el.addEventListener("click", closeExModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeExModal(); });

  // Miniatura del ejercicio: fotograma estático que abre el detalle al pulsar.
  function makeThumb(ex) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gym-thumbbtn";
    btn.setAttribute("aria-label", "Ver " + ex.name);
    const v = document.createElement("video");
    v.className = "gym-thumb";
    v.src = ex.video; v.muted = true; v.playsInline = true; v.preload = "metadata";
    // Congela el primer fotograma para que la miniatura no se reproduzca sola.
    v.addEventListener("loadeddata", () => { try { v.currentTime = 0.05; } catch (e) {} });
    const play = document.createElement("span");
    play.className = "gym-thumb-play";
    play.innerHTML = `<svg class="ico"><use href="#i-play"/></svg>`;
    btn.append(v, play);
    btn.addEventListener("click", () => openExModal(ex));
    return btn;
  }

  // Estado inicial (imita "Anterior" con la sesión previa).
  const EXERCISES = [
    {
      name: "Curl de bíceps", video: "assets/ex-curl.mp4",
      pr: { peso: "16 kg", rm: "22 kg", vol: "1.9k" },
      sets: [
        { kg: "12", reps: "12", prev: "10×12", done: true },
        { kg: "12", reps: "10", prev: "12×10", done: true },
        { kg: "14", reps: "8",  prev: "12×9",  done: false },
      ],
    },
    {
      name: "Press de banca", video: "assets/ex-bench.mp4",
      pr: { peso: "70 kg", rm: "88 kg", vol: "4.2k" },
      sets: [
        { kg: "50", reps: "10", prev: "47×10", done: false },
        { kg: "50", reps: "10", prev: "47×9",  done: false },
        { kg: "55", reps: "8",  prev: "52×8",  done: false },
      ],
    },
    {
      name: "Remo con polea", video: "assets/ex-row.mp4",
      pr: { peso: "60 kg", rm: "75 kg", vol: "3.5k" },
      sets: [
        { kg: "45", reps: "12", prev: "42×12", done: false },
        { kg: "45", reps: "10", prev: "45×10", done: false },
      ],
    },
    {
      name: "Elevaciones laterales", video: "assets/ex-lateral.mp4",
      pr: { peso: "14 kg", rm: "18 kg", vol: "1.2k" },
      sets: [
        { kg: "10", reps: "15", prev: "9×15",  done: false },
        { kg: "10", reps: "12", prev: "10×12", done: false },
        { kg: "12", reps: "10", prev: "10×12", done: false },
      ],
    },
  ];

  function recalc() {
    let vol = 0, sets = 0;
    EXERCISES.forEach(ex => ex.sets.forEach(s => {
      if (s.done) { vol += (parseFloat(s.kg) || 0) * (parseInt(s.reps) || 0); sets++; }
    }));
    volEl.textContent = Math.round(vol);
    setsEl.textContent = String(sets);
  }

  function setRow(ex, s, i) {
    const row = document.createElement("div");
    row.className = "gym-setrow" + (s.done ? " done" : "");
    row.innerHTML =
      `<span class="gym-snum">${i + 1}</span>` +
      `<span class="gym-prev">${s.prev || "—"}</span>` +
      `<input class="gym-inp" inputmode="numeric" value="${s.kg}" aria-label="Peso" />` +
      `<input class="gym-inp" inputmode="numeric" value="${s.reps}" aria-label="Reps" />` +
      `<span class="gym-tick"><button type="button" class="gym-tickbtn" aria-label="Marcar serie">` +
      `<svg class="ico"><use href="#i-check"/></svg></button></span>`;

    const [kgIn, repsIn] = row.querySelectorAll(".gym-inp");
    kgIn.addEventListener("input",   () => { s.kg = kgIn.value; recalc(); });
    repsIn.addEventListener("input", () => { s.reps = repsIn.value; recalc(); });
    row.querySelector(".gym-tickbtn").addEventListener("click", () => {
      s.done = !s.done;
      row.classList.toggle("done", s.done);
      recalc();
    });
    return row;
  }

  function render() {
    scroll.innerHTML = "";
    EXERCISES.forEach(ex => {
      const block = document.createElement("div");
      block.className = "gym-ex";

      const head = document.createElement("div");
      head.className = "gym-exhead";
      head.appendChild(makeThumb(ex));
      head.insertAdjacentHTML("beforeend",
        `<span class="gym-exname">${ex.name}</span><span class="gym-more">⋯</span>`);
      block.appendChild(head);

      const colhead = document.createElement("div");
      colhead.className = "gym-colhead";
      colhead.innerHTML =
        `<span class="gym-c-num">Serie</span><span class="gym-c-prev">Anterior</span>` +
        `<span class="gym-c-kg">KG</span><span class="gym-c-reps">Reps</span><span class="gym-c-tick"></span>`;
      block.appendChild(colhead);

      ex.sets.forEach((s, i) => block.appendChild(setRow(ex, s, i)));

      const add = document.createElement("button");
      add.type = "button";
      add.className = "gym-addset";
      add.innerHTML = `<svg class="ico"><use href="#i-plus"/></svg> Añadir serie`;
      add.addEventListener("click", () => {
        const last = ex.sets[ex.sets.length - 1];
        const ns = { kg: last ? last.kg : "", reps: last ? last.reps : "", prev: "—", done: false };
        ex.sets.push(ns);
        block.insertBefore(setRow(ex, ns, ex.sets.length - 1), add);
      });
      block.appendChild(add);

      scroll.appendChild(block);
    });
    recalc();
  }

  render();

  // --- Intro automática (demo tipo anuncio) al entrar en viewport ---
  const gymScreen = document.getElementById("gym-screen");
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gymIntroDone = false;
  function tapNextSet() {
    const btn = scroll.querySelector(".gym-setrow:not(.done) .gym-tickbtn");
    if (btn) btn.click();
  }
  function runGymIntro() {
    if (gymIntroDone || reduce) return;
    gymIntroDone = true;
    setTimeout(() => tapNextSet(), 800);
    setTimeout(() => scroll.scrollTo({ top: 110, behavior: "smooth" }), 1700);
    setTimeout(() => tapNextSet(), 2500);
    setTimeout(() => scroll.scrollTo({ top: 0, behavior: "smooth" }), 3300);
  }
  if (gymScreen && "IntersectionObserver" in window) {
    const gio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { runGymIntro(); gio.disconnect(); } });
    }, { threshold: 0.5 });
    gio.observe(gymScreen);
  }
})();

/* --- Año del footer --- */
document.getElementById("year").textContent = new Date().getFullYear();

/* --- Reveal on scroll --- */
const revealEls = document.querySelectorAll(
  ".section__head, .step, .feature-row, .card, .finalcta__box, .strip__item"
);
revealEls.forEach(el => el.classList.add("reveal"));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));

/* --- Aparición progresiva de las tarjetas de tienda al hacer scroll --- */
const storeCards = document.querySelectorAll(".storecard");
if (storeCards.length) {
  if ("IntersectionObserver" in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("shown"); sio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    storeCards.forEach(c => sio.observe(c));
  } else {
    storeCards.forEach(c => c.classList.add("shown"));
  }
}
