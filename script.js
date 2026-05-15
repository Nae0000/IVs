'use strict';

/* ============================================================
   RULE OF 16 — 1SD / 2SD / 3SD Calculator
   
   Formula:
     1SD (%) = IV / 16
     2SD (%) = (IV / 16) × 2
     3SD (%) = (IV / 16) × 3

   Price Targets:
     Upper nSD = Price × (1 + nSD/100)
     Lower nSD = Price × (1 - nSD/100)

   Probability:
     1SD → 68.27%
     2SD → 95.45%
     3SD → 99.73%
   ============================================================ */

// ---------- DOM ----------
const ivSlider    = document.getElementById('iv-slider');
const ivInput     = document.getElementById('iv-input');
const priceSlider = document.getElementById('price-slider');
const priceInput  = document.getElementById('price-input');
const cfdSlider   = document.getElementById('cfd-slider');
const cfdInput    = document.getElementById('cfd-input');
const cfdDiffBadge = document.getElementById('cfd-diff-badge');

// SD Table
const move1sd  = document.getElementById('move-1sd');
const move2sd  = document.getElementById('move-2sd');
const move3sd  = document.getElementById('move-3sd');
const upper1sd = document.getElementById('upper-1sd');
const upper2sd = document.getElementById('upper-2sd');
const upper3sd = document.getElementById('upper-3sd');
const lower1sd = document.getElementById('lower-1sd');
const lower2sd = document.getElementById('lower-2sd');
const lower3sd = document.getElementById('lower-3sd');

// CFD sub-labels in SD Table
const cfdUpper1sd = document.getElementById('cfd-upper-1sd');
const cfdUpper2sd = document.getElementById('cfd-upper-2sd');
const cfdUpper3sd = document.getElementById('cfd-upper-3sd');
const cfdLower1sd = document.getElementById('cfd-lower-1sd');
const cfdLower2sd = document.getElementById('cfd-lower-2sd');
const cfdLower3sd = document.getElementById('cfd-lower-3sd');

// CFD sub-labels in Chart
const chartCfd1sdUpper = document.getElementById('chart-cfd-1sd-upper');
const chartCfd2sdUpper = document.getElementById('chart-cfd-2sd-upper');
const chartCfd3sdUpper = document.getElementById('chart-cfd-3sd-upper');
const chartCfd1sdLower = document.getElementById('chart-cfd-1sd-lower');
const chartCfd2sdLower = document.getElementById('chart-cfd-2sd-lower');
const chartCfd3sdLower = document.getElementById('chart-cfd-3sd-lower');

// Chart
const chartPlaceholder  = document.getElementById('chart-placeholder');
const chartBody         = document.getElementById('chart-body');
const chartPriceLabel   = document.getElementById('chart-price-label');
const chart1sdUpper     = document.getElementById('chart-1sd-upper');
const chart2sdUpper     = document.getElementById('chart-2sd-upper');
const chart3sdUpper     = document.getElementById('chart-3sd-upper');
const chart1sdLower     = document.getElementById('chart-1sd-lower');
const chart2sdLower     = document.getElementById('chart-2sd-lower');
const chart3sdLower     = document.getElementById('chart-3sd-lower');

// Explanation
const expIv  = document.getElementById('exp-iv');
const exp1sd = document.getElementById('exp-1sd');
const exp2sd = document.getElementById('exp-2sd');
const exp3sd = document.getElementById('exp-3sd');

// ---------- Helpers ----------
function fmtPrice(n) {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n) {
  return '±' + n.toFixed(2) + '%';
}

function animVal(el, val) {
  if (el.textContent === val) return;
  el.classList.remove('popped');
  void el.offsetWidth;
  el.textContent = val;
  el.classList.add('popped');
}

// ---------- Calculate ----------
function calculate() {
  const iv    = parseFloat(ivInput.value);
  const price = parseFloat(priceInput.value);
  const cfd   = parseFloat(cfdInput.value);

  if (!iv || !price || iv <= 0 || price <= 0) {
    resetUI();
    return;
  }

  // SD percentages
  const sd1 = iv / 16;
  const sd2 = sd1 * 2;
  const sd3 = sd1 * 3;

  // Price targets (Futures)
  const u1 = price * (1 + sd1 / 100);
  const l1 = price * (1 - sd1 / 100);
  const u2 = price * (1 + sd2 / 100);
  const l2 = price * (1 - sd2 / 100);
  const u3 = price * (1 + sd3 / 100);
  const l3 = price * (1 - sd3 / 100);

  // CFD diff & CFD price targets
  const hasCfd = !isNaN(cfd) && cfd > 0;
  const diff   = hasCfd ? price - cfd : 0;

  // Update diff badge
  if (hasCfd && diff !== 0) {
    const sign = diff > 0 ? '+' : '';
    cfdDiffBadge.textContent = `ส่วนต่าง ${sign}${diff.toFixed(2)}`;
    cfdDiffBadge.className = 'cfd-diff-badge ' + (diff > 0 ? 'diff-pos' : 'diff-neg');
  } else {
    cfdDiffBadge.textContent = '';
    cfdDiffBadge.className = 'cfd-diff-badge';
  }

  // Helper: CFD adjusted target
  function cfdTarget(futuresTarget) {
    return hasCfd ? futuresTarget - diff : null;
  }

  function setCfdSub(el, futuresTarget) {
    const v = cfdTarget(futuresTarget);
    if (v !== null && hasCfd) {
      el.textContent = `(CFD ${fmtPrice(v)})`;
    } else {
      el.textContent = '';
    }
  }

  // --- SD Table ---
  animVal(move1sd, fmtPct(sd1));
  animVal(move2sd, fmtPct(sd2));
  animVal(move3sd, fmtPct(sd3));

  animVal(upper1sd, fmtPrice(u1));
  animVal(upper2sd, fmtPrice(u2));
  animVal(upper3sd, fmtPrice(u3));

  animVal(lower1sd, fmtPrice(l1));
  animVal(lower2sd, fmtPrice(l2));
  animVal(lower3sd, fmtPrice(l3));

  // CFD sub-labels in SD Table
  setCfdSub(cfdUpper1sd, u1);
  setCfdSub(cfdUpper2sd, u2);
  setCfdSub(cfdUpper3sd, u3);
  setCfdSub(cfdLower1sd, l1);
  setCfdSub(cfdLower2sd, l2);
  setCfdSub(cfdLower3sd, l3);

  // --- Chart ---
  chartPlaceholder.style.display = 'none';
  chartBody.style.display = 'flex';

  chartPriceLabel.textContent = `ราคาอ้างอิง: ${fmtPrice(price)}`;

  animVal(chart3sdUpper, fmtPrice(u3));
  animVal(chart2sdUpper, fmtPrice(u2));
  animVal(chart1sdUpper, fmtPrice(u1));
  animVal(chart1sdLower, fmtPrice(l1));
  animVal(chart2sdLower, fmtPrice(l2));
  animVal(chart3sdLower, fmtPrice(l3));

  // CFD sub-labels in Chart
  setCfdSub(chartCfd3sdUpper, u3);
  setCfdSub(chartCfd2sdUpper, u2);
  setCfdSub(chartCfd1sdUpper, u1);
  setCfdSub(chartCfd1sdLower, l1);
  setCfdSub(chartCfd2sdLower, l2);
  setCfdSub(chartCfd3sdLower, l3);

  // --- Explanation ---
  expIv.textContent  = `${iv.toFixed(1)}%`;
  exp1sd.textContent = `${sd1.toFixed(2)}%`;
  exp2sd.textContent = `${sd2.toFixed(2)}%`;
  exp3sd.textContent = `${sd3.toFixed(2)}%`;
}

function resetUI() {
  const dash = '—';
  [move1sd, move2sd, move3sd,
   upper1sd, upper2sd, upper3sd,
   lower1sd, lower2sd, lower3sd,
   chart1sdUpper, chart2sdUpper, chart3sdUpper,
   chart1sdLower, chart2sdLower, chart3sdLower].forEach(el => { if(el) el.textContent = dash; });

  // Clear CFD sub-labels
  [cfdUpper1sd, cfdUpper2sd, cfdUpper3sd,
   cfdLower1sd, cfdLower2sd, cfdLower3sd,
   chartCfd1sdUpper, chartCfd2sdUpper, chartCfd3sdUpper,
   chartCfd1sdLower, chartCfd2sdLower, chartCfd3sdLower
  ].forEach(el => { if(el) el.textContent = ''; });

  cfdDiffBadge.textContent = '';
  cfdDiffBadge.className = 'cfd-diff-badge';

  expIv.textContent  = dash;
  exp1sd.textContent = dash;
  exp2sd.textContent = dash;
  exp3sd.textContent = dash;

  chartPlaceholder.style.display = 'flex';
  chartBody.style.display = 'none';
}

// ---------- Slider ↔ Input sync ----------
function syncTrack(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.setProperty('--pct', pct + '%');
}

function setupSync(slider, inputEl, sliderMin, sliderMax) {
  slider.addEventListener('input', () => {
    inputEl.value = slider.value;
    syncTrack(slider);
    calculate();
  });
  inputEl.addEventListener('input', () => {
    const v = parseFloat(inputEl.value);
    if (!isNaN(v)) {
      slider.value = Math.min(Math.max(v, sliderMin), sliderMax);
      syncTrack(slider);
    }
    calculate();
  });
  syncTrack(slider);
}

setupSync(ivSlider,    ivInput,    1,    200);
setupSync(priceSlider, priceInput, 1, 10000);
setupSync(cfdSlider,   cfdInput,   1, 10000);

// ---------- Init ----------
calculate();
