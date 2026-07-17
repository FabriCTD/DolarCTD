/**
 * DólarCTD Divisas Globales Script
 * Adaptado de divisas.fabrictd.com para encajar en el ecosistema DolarCTD
 */

const API_V2 = 'https://api.frankfurter.dev/v2';

const flagExceptions = { 'EUR': 'eu', 'ZAR': 'za', 'ANG': 'cw', 'BTC': 'btc', 'XAG': 'xx', 'XAU': 'xx', 'XDR': 'xx' };
function getFlagUrl(code) {
  const c = flagExceptions[code] || code.substring(0, 2).toLowerCase();
  return `https://flagcdn.com/w40/${c}.png`;
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

let chartInstance = null;
let currentRange = 'max';
let currenciesData = [];
let state = { mode: 'simple', base: 'USD', targetSimple: 'ARS', targetsMultiple: ['EUR', 'GBP', 'BRL', 'ARS', 'CLP'] };

async function initDivisas() {
  try {
    // Configuración Global de Chart.js con colores de DolarCTD
    Chart.defaults.color = '#8b9dc3'; // var(--text-muted)
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)'; // var(--border-card)

    const res = await fetch(`${API_V2}/currencies`);
    currenciesData = await res.json();

    if (!currenciesData.find(c => c.iso_code === 'ARS')) {
      currenciesData.push({ iso_code: 'ARS', name: 'Peso Argentino' });
      currenciesData.sort((a, b) => a.iso_code.localeCompare(b.iso_code));
    }

    setupTabs();
    setupCustomSelects();
    setupMultipleGrid();
    setupEvents();
    updateAll();
  } catch (err) {
    console.error("Error inicializando Divisas:", err);
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      document.getElementById(`tab-${target}`).classList.add('active');
      state.mode = target;
      updateAll();
    });
  });
}

function createOptionHTML(c) {
  return `<div class="currency-info"><img src="${getFlagUrl(c.iso_code)}" onerror="this.style.display='none'"> <span><strong>${c.iso_code}</strong> - ${c.name}</span></div>`;
}

function setupCustomSelects() {
  const render = (id, key) => {
    const cont = document.getElementById(id);
    if (!cont) return;
    const sel = cont.querySelector('.select-selected');
    const items = cont.querySelector('.select-items');

    items.innerHTML = currenciesData.map(c => `<div data-value="${c.iso_code}">${createOptionHTML(c)}</div>`).join('');
    const initCurr = currenciesData.find(c => c.iso_code === state[key]) || currenciesData[0];
    sel.innerHTML = `${createOptionHTML(initCurr)} <i class="fas fa-chevron-down"></i>`;

    sel.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-select').forEach(s => {
        if (s !== cont) { s.querySelector('.select-items').classList.remove('show'); s.querySelector('.select-selected').classList.remove('open'); }
      });
      items.classList.toggle('show');
      sel.classList.toggle('open');
    });

    items.querySelectorAll('div[data-value]').forEach(item => {
      item.addEventListener('click', () => {
        const val = item.getAttribute('data-value');
        state[key] = val;
        const curr = currenciesData.find(c => c.iso_code === val);
        sel.innerHTML = `${createOptionHTML(curr)} <i class="fas fa-chevron-down"></i>`;
        items.classList.remove('show');
        sel.classList.remove('open');
        updateAll();
      });
    });
  };
  render('baseSelect', 'base');
  render('targetSimpleSelect', 'targetSimple');
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select').forEach(s => { s.querySelector('.select-items').classList.remove('show'); s.querySelector('.select-selected').classList.remove('open'); });
  });
}

function setupMultipleGrid() {
  const grid = document.getElementById('multipleGrid');
  if (!grid) return;
  grid.innerHTML = currenciesData.map(c => {
    const sel = state.targetsMultiple.includes(c.iso_code) ? 'selected' : '';
    return `<div class="currency-card-btn ${sel}" data-code="${c.iso_code}"><img src="${getFlagUrl(c.iso_code)}" onerror="this.style.display='none'"><span class="code">${c.iso_code}</span></div>`;
  }).join('');

  grid.querySelectorAll('.currency-card-btn').forEach(card => {
    card.addEventListener('click', () => {
      const code = card.getAttribute('data-code');
      if (code === state.base) return;
      if (state.targetsMultiple.includes(code)) {
        state.targetsMultiple = state.targetsMultiple.filter(c => c !== code);
        card.classList.remove('selected');
      } else {
        state.targetsMultiple.push(code);
        card.classList.add('selected');
      }
      updateAll();
    });
  });
}

function setupEvents() {
  const amt = document.getElementById('amount');
  if (amt) amt.addEventListener('input', debounce(updateConversions, 400));

  const btns = document.getElementById('rangeButtons');
  if (btns) {
    btns.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        document.querySelectorAll('#rangeButtons button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentRange = e.target.getAttribute('data-range');
        updateChart();
      }
    });
  }
}

function updateAll() {
  const grid = document.getElementById('multipleGrid');
  if (grid) {
    grid.querySelectorAll('.currency-card-btn').forEach(card => {
      const code = card.getAttribute('data-code');
      if (code === state.base) { card.style.opacity = '0.5'; card.style.pointerEvents = 'none'; card.classList.remove('selected'); }
      else { card.style.opacity = '1'; card.style.pointerEvents = 'auto'; if (state.targetsMultiple.includes(code)) card.classList.add('selected'); }
    });
  }
  updateConversions();
  updateChart();
}

async function updateConversions() {
  const amtInput = document.getElementById('amount');
  if (!amtInput) return;
  const amount = parseFloat(amtInput.value) || 0;
  if (amount <= 0) return;

  let targets = state.mode === 'simple' ? [state.targetSimple] : state.targetsMultiple;
  targets = targets.filter(t => t !== state.base);

  const cSimple = document.getElementById('resultSimpleContainer');
  const cMult = document.getElementById('multipleListResults');

  if (targets.length === 0) {
    if (state.mode === 'simple') cSimple.innerHTML = `<p>Base y destino iguales.</p>`;
    else cMult.innerHTML = `<p>Seleccione moneda distinta a base.</p>`;
    return;
  }

  if (state.mode === 'simple') cSimple.innerHTML = `<div class="loader"></div>`;
  else cMult.innerHTML = `<div class="loader"></div>`;

  try {
    const res = await fetch(`${API_V2}/rates?base=${state.base}&quotes=${targets.join(',')}`);
    const data = await res.json();

    const fmt = (val) => val.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

    if (state.mode === 'simple') {
      const row = data.find(d => d.quote === state.targetSimple);
      if (!row) throw new Error("No data");
      cSimple.innerHTML = `
                <div class="currency-info" style="justify-content: center; margin-bottom: 10px; color: var(--text-muted)">
                    <img src="${getFlagUrl(state.targetSimple)}" onerror="this.style.display='none'"> ${state.targetSimple}
                </div>
                <div class="amount">${fmt(amount * row.rate)}</div>
                <div class="rate">1 ${state.base} = ${row.rate} ${state.targetSimple}</div>`;
    } else {
      cMult.innerHTML = data.map(row => `
                <div class="result-item">
                    <div class="header"><img src="${getFlagUrl(row.quote)}" onerror="this.style.display='none'"> <span>${row.quote}</span></div>
                    <div class="value">${fmt(amount * row.rate)}</div>
                    <div class="rate" style="font-size:0.8rem; margin-top:4px; color: var(--text-dim)">Tasa: ${row.rate}</div>
                </div>`).join('');
    }
  } catch (e) {
    if (state.mode === 'simple') cSimple.innerHTML = `<p style="color:var(--negative)">Error al obtener tasas.</p>`;
    else cMult.innerHTML = `<p style="color:var(--negative)">Error al obtener tasas.</p>`;
  }
}

function isoDate(d) { return d.toISOString().slice(0, 10); }
function getRange() {
  const to = new Date();
  if (currentRange === 'max') return { from: '1999-01-04', to: isoDate(to) };
  const from = new Date(to);
  from.setDate(from.getDate() - Number(currentRange));
  return { from: isoDate(from), to: isoDate(to) };
}
function groupParam(value) {
  const days = value === 'max' ? Infinity : Number(value);
  if (days > 1825) return '&group=month';
  if (days > 365) return '&group=week';
  return '';
}

async function updateChart() {
  let targets = state.mode === 'simple' ? [state.targetSimple] : state.targetsMultiple;
  targets = targets.filter(t => t !== state.base);
  if (targets.length === 0) { if (chartInstance) chartInstance.destroy(); return; }

  const r = getRange();
  const path = `/rates?base=${state.base}&quotes=${targets.join(',')}&from=${r.from}&to=${r.to}${groupParam(currentRange)}`;

  try {
    const res = await fetch(API_V2 + path);
    const data = await res.json();

    if (!Array.isArray(data)) { throw new Error("Invalid API response format"); }

    const series = {};
    data.forEach(row => {
      if (!series[row.quote]) series[row.quote] = [];
      series[row.quote].push(row);
    });

    const dates = Array.from(new Set(data.map(r => r.date))).sort((a, b) => new Date(a) - new Date(b));
    // Colores basados en DolarCTD palette (primary, accent, positive, negative, steam, discord)
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#f43f5e', '#66c0f4', '#5865f2', '#8b5cf6'];

    const datasets = targets.filter(q => series[q] && series[q].length > 0).map((q, index) => {
      series[q].sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstRate = series[q][0].rate;
      const rateMap = Object.fromEntries(series[q].map(p => [p.date, p.rate]));

      let lastValidValue = null;
      const chartData = dates.map(d => {
        if (rateMap[d] !== undefined) {
          lastValidValue = ((rateMap[d] - firstRate) / firstRate) * 100;
          return lastValidValue;
        }
        return lastValidValue;
      });

      return {
        label: q,
        data: chartData,
        borderColor: colors[index % colors.length],
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#fff',
        tension: 0.1,
        spanGaps: true
      };
    });

    const ctx = document.getElementById('ratesChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels: dates, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(22, 32, 64, 0.95)', // var(--bg-elevated)
            titleColor: '#f0f6ff', // var(--text)
            bodyColor: '#f0f6ff',
            borderColor: 'rgba(59,130,246,0.3)', // var(--border-strong)
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (ctx) {
                let l = ctx.dataset.label || '';
                if (l) l += ': ';
                if (ctx.parsed.y !== null) {
                  l += (ctx.parsed.y > 0 ? '+' : '') + ctx.parsed.y.toFixed(2) + '%';
                }
                return l;
              }
            }
          },
          legend: { labels: { color: '#8b9dc3', usePointStyle: true, boxWidth: 8 } } // var(--text-muted)
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: window.innerWidth < 600 ? 5 : 10,
              color: '#8b9dc3',
              maxRotation: 0
            }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' }, // var(--border-card)
            ticks: { color: '#8b9dc3', callback: v => v + '%' }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error gráfico:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => initDivisas());
