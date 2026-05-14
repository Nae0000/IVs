/* ============================================================
   IV DRIP CALCULATOR — JavaScript Logic
   ============================================================ */

'use strict';

// ---------- DOM References ----------
const volumeInput    = document.getElementById('volume');
const hoursInput     = document.getElementById('time-hours');
const minutesInput   = document.getElementById('time-minutes');
const dropFactorInput = document.getElementById('drop-factor');

const dripDisplay    = document.getElementById('drip-rate-display');
const flowDisplay    = document.getElementById('flow-rate-display');
const formulaDisplay = document.getElementById('formula-display');
const breakdownPanel = document.getElementById('breakdown-panel');
const dripCard       = document.getElementById('drip-rate-card');
const flowCard       = document.getElementById('flow-rate-card');
const clearBtn       = document.getElementById('clear-btn');

// ---------- Calculation ----------
function calculate() {
  const volume     = parseFloat(volumeInput.value);
  const hours      = parseFloat(hoursInput.value) || 0;
  const minutes    = parseFloat(minutesInput.value) || 0;
  const dropFactor = parseFloat(dropFactorInput.value);

  const totalMinutes = hours * 60 + minutes;

  const allFilled = volume > 0 && totalMinutes > 0 && dropFactor > 0;

  if (!allFilled) {
    resetResults();
    return;
  }

  // Formulas
  // Flow Rate (mL/hr) = Volume / (Total time in hours)
  const totalHours = totalMinutes / 60;
  const flowRate = volume / totalHours;

  // Drip Rate (drops/min) = (Volume × Drop Factor) / Total time in minutes
  const dripRate = (volume * dropFactor) / totalMinutes;

  // Update UI
  setResult(dripDisplay, dripCard, Math.round(dripRate));
  setResult(flowDisplay, flowCard, flowRate.toFixed(1));

  // Formula breakdown
  const timeStr = formatTimeString(hours, minutes);
  breakdownPanel.classList.add('active');
  formulaDisplay.innerHTML =
    `Drip Rate = (${volume} × ${dropFactor}) ÷ ${totalMinutes} min<br>` +
    `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <strong>${Math.round(dripRate)} gtt/min</strong><br><br>` +
    `Flow Rate = ${volume} mL ÷ ${totalHours.toFixed(2)} hr<br>` +
    `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <strong>${flowRate.toFixed(1)} mL/hr</strong>`;
}

function setResult(displayEl, cardEl, value) {
  // Animate
  displayEl.classList.remove('updated');
  void displayEl.offsetWidth; // force reflow
  displayEl.classList.add('updated');

  displayEl.textContent = value;
  cardEl.classList.add('has-value');
}

function resetResults() {
  dripDisplay.textContent = '—';
  flowDisplay.textContent = '—';
  dripCard.classList.remove('has-value');
  flowCard.classList.remove('has-value');
  breakdownPanel.classList.remove('active');
  formulaDisplay.textContent = 'กรุณากรอกข้อมูลเพื่อดูสูตรการคำนวณ';
}

function formatTimeString(hours, minutes) {
  const parts = [];
  if (hours > 0) parts.push(`${hours} ชม.`);
  if (minutes > 0) parts.push(`${minutes} นาที`);
  return parts.join(' ') || '0';
}

// ---------- Input validation ----------
function validateMinutes(e) {
  let val = parseInt(e.target.value, 10);
  if (val > 59) {
    e.target.value = 59;
  } else if (val < 0) {
    e.target.value = 0;
  }
}

// ---------- Preset Buttons ----------
function handlePreset(e) {
  const btn = e.currentTarget;
  const target = btn.dataset.target;

  if (target === 'volume') {
    volumeInput.value = btn.dataset.value;
    updateActivePreset(btn, '[data-target="volume"]');
  } else if (target === 'time') {
    hoursInput.value   = btn.dataset.hours;
    minutesInput.value = btn.dataset.minutes;
    updateActivePreset(btn, '[data-target="time"]');
  } else if (target === 'df') {
    dropFactorInput.value = btn.dataset.value;
    updateActivePreset(btn, '[data-target="df"]');
  }

  calculate();
}

function updateActivePreset(activeBtn, selector) {
  document.querySelectorAll(`.preset-btn${selector}`).forEach(btn => {
    btn.classList.remove('active');
  });
  activeBtn.classList.add('active');
}

// ---------- Clear ----------
function clearAll() {
  volumeInput.value     = '';
  hoursInput.value      = '';
  minutesInput.value    = '';
  dropFactorInput.value = '';

  // Remove all active preset states
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));

  resetResults();

  // Animate card
  volumeInput.focus();
}

// ---------- Event Listeners ----------
[volumeInput, hoursInput, minutesInput, dropFactorInput].forEach(input => {
  input.addEventListener('input', calculate);
  input.addEventListener('change', calculate);
});

minutesInput.addEventListener('input', validateMinutes);

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', handlePreset);
});

clearBtn.addEventListener('click', clearAll);

// ---------- Init ----------
calculate();
