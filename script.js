'use strict';

/* ============================================================
   RULE OF 16 — Calculation Logic
   Formula: Target Volatility (%) = IV / 16
   Upper Price = Price × (1 + targetVol/100)
   Lower Price = Price × (1 - targetVol/100)
   ============================================================ */

// ---------- DOM ----------
const ivSlider     = document.getElementById('iv-slider');
const ivInput      = document.getElementById('iv-input');
const priceSlider  = document.getElementById('price-slider');
const priceInput   = document.getElementById('price-input');

// Summary bar
const summaryIv     = document.getElementById('summary-iv');
const summaryTarget = document.getElementById('summary-target');
const summaryUpper  = document.getElementById('summary-upper');
const summaryLower  = document.getElementById('summary-lower');

// Chart
const chartPlaceholder = document.getElementById('chart-placeholder');
const chartBody        = document.getElementById('chart-body');
const chartUpperLabel  = document.getElementById('chart-upper-label');
const chartLowerLabel  = document.getElementById('chart-lower-label');
const chartCurrentText = document.getElementById('chart-current-text');
const upperBadge       = document.getElementById('upper-badge');
const lowerBadge       = document.getElementById('lower-badge');

// Detail results
const detailUpper    = document.getElementById('detail-upper');
const detailTarget   = document.getElementById('detail-target');
const detailLower    = document.getElementById('detail-lower');
const detailUpperPct = document.getElementById('detail-upper-pct');
const detailLowerPct = document.getElementById('detail-lower-pct');

// Explanation
const expIv     = document.getElementById('exp-iv');
const expTarget = document.getElementById('exp-target');

// ---------- Core calculation ----------
function calculate() {
  const iv    = parseFloat(ivInput.value);
  const price = parseFloat(priceInput.value);

  if (!iv || !price || iv <= 0 || price <= 0) {
    resetUI();
    return;
  }

  // Rule of 16
  const targetVol = iv / 16; // % daily expected move

  // Price targets
  const upperPrice = price * (1 + targetVol / 100);
  const lowerPrice = price * (1 - targetVol / 100);

  // Format numbers
  const fmtPrice = (n) => n.toLocaleString('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtPct   = (n) => n.toFixed(2) + '%';

  // --- Update Summary Bar ---
  animateValue(summaryIv,     `${iv.toFixed(1)}%`);
  animateValue(summaryTarget, `±${fmtPct(targetVol)}`);
  animateValue(summaryUpper,  fmtPrice(upperPrice));
  animateValue(summaryLower,  fmtPrice(lowerPrice));

  // --- Update Chart ---
  chartPlaceholder.style.display = 'none';
  chartBody.style.display = 'flex';
  chartUpperLabel.textContent  = fmtPrice(upperPrice);
  chartLowerLabel.textContent  = fmtPrice(lowerPrice);
  chartCurrentText.textContent = `ราคาปัจจุบัน: ${fmtPrice(price)}`;
  upperBadge.textContent = `+${fmtPct(targetVol)}`;
  lowerBadge.textContent = `-${fmtPct(targetVol)}`;

  // --- Update Detail Cards ---
  animateValue(detailUpper,    fmtPrice(upperPrice));
  animateValue(detailTarget,   fmtPct(targetVol));
  animateValue(detailLower,    fmtPrice(lowerPrice));
  detailUpperPct.textContent = `+${fmtPct(targetVol)}`;
  detailLowerPct.textContent = `-${fmtPct(targetVol)}`;

  // --- Update Explanation ---
  expIv.textContent     = `${iv.toFixed(1)}%`;
  expTarget.textContent = `±${fmtPct(targetVol)}`;
}

function animateValue(el, val) {
  if (el.textContent === val) return;
  el.classList.remove('popped');
  void el.offsetWidth;
  el.textContent = val;
  el.classList.add('popped');
}

function resetUI() {
  [summaryIv, summaryTarget, summaryUpper, summaryLower].forEach(el => el.textContent = '—');
  [detailUpper, detailTarget, detailLower].forEach(el => el.textContent = '—');
  detailUpperPct.textContent = '+0.00%';
  detailLowerPct.textContent = '-0.00%';
  expIv.textContent     = '—';
  expTarget.textContent = '—';
  chartPlaceholder.style.display = 'flex';
  chartBody.style.display = 'none';
}

// ---------- Slider <-> Input Sync ----------
function syncSliderTrack(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.setProperty('--pct', pct + '%');
}

function setupSync(slider, inputEl, min, max) {
  // Slider → Input
  slider.addEventListener('input', () => {
    inputEl.value = slider.value;
    syncSliderTrack(slider);
    calculate();
  });

  // Input → Slider (clamp to slider range for visual)
  inputEl.addEventListener('input', () => {
    const v = parseFloat(inputEl.value);
    if (!isNaN(v)) {
      // Clamp slider value (slider has own min/max, but input can exceed)
      slider.value = Math.min(Math.max(v, min), max);
      syncSliderTrack(slider);
    }
    calculate();
  });

  // Init track
  syncSliderTrack(slider);
}

// Setup syncing
setupSync(ivSlider,    ivInput,    1,    200);
setupSync(priceSlider, priceInput, 1, 10000);

// ---------- Init ----------
calculate();
