/* ============================================================
   Donaciones (página donar.html): progreso y objetivos.
   El total recaudado se actualiza a mano en RAISED (Ko-fi no
   expone el total en una web estática sin backend).
   ============================================================ */
(function initDonate() {
  const raisedEl = document.getElementById("donate-raised");
  if (!raisedEl) return;

  // ← EDITA AQUÍ el total donado (en €) cuando quieras actualizarlo.
  const RAISED = 928;

  // Umbrales de cada objetivo (€) y su clave de traducción.
  const MILESTONES = [
    { amount: 250,  key: "m1" },
    { amount: 600,  key: "m2" },
    { amount: 1200, key: "m3" },
    { amount: 2500, key: "m4" },
    { amount: 4000, key: "m5" },
    { amount: 6000, key: "m6" },
  ];

  const LOCALES = { es: "es-ES", en: "en-GB", de: "de-DE", fr: "fr-FR", it: "it-IT" };
  const nf = new Intl.NumberFormat(LOCALES[I18N.LANG] || "es-ES",
    { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const fmt = n => nf.format(n);

  raisedEl.textContent = fmt(RAISED);

  const goal = MILESTONES.find(m => RAISED < m.amount) || MILESTONES[MILESTONES.length - 1];
  const pct = Math.min(100, Math.round((RAISED / goal.amount) * 100));
  document.getElementById("donate-fill").style.width = pct + "%";
  document.getElementById("donate-goalinfo").innerHTML = t("donate.goalInfo", { pct, goal: fmt(goal.amount) });

  document.getElementById("donate-milestones").innerHTML = MILESTONES.map(m => {
    const on = RAISED >= m.amount;
    return `<div class="dmile${on ? " on" : ""}">` +
      `<span class="dmile__ico"><svg class="ico"><use href="#i-${on ? "check" : "lock"}"/></svg></span>` +
      `<div class="dmile__body"><div class="dmile__top">` +
      `<b>${t("donate." + m.key + ".t")}</b><span class="dmile__amt">${fmt(m.amount)}</span></div>` +
      `<p>${t("donate." + m.key + ".d")}</p></div></div>`;
  }).join("");
})();
