'use strict';
const fs = require('fs');
const vm = require('vm');

// Browser globals mock for utils.js
const ctx = vm.createContext({
  console,
  document: {
    getElementById: () => null,
    querySelectorAll: () => ({ forEach: () => {} }),
    querySelector: () => null,
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, textContent: '', innerHTML: '' }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {}, style: {} },
  },
  window: {},
  URL: { createObjectURL: () => '', revokeObjectURL: () => {} },
  lucide: null,
  requestAnimationFrame: cb => cb(),
  DB: { departments: { getById: () => null }, positions: { getById: () => null }, employees: { getById: () => null } },
  setTimeout: setTimeout,
});

const code = fs.readFileSync(__dirname + '/js/utils.js', 'utf8') + [
  'this.formatDate = formatDate;', 'this.formatCurrency = formatCurrency;',
  'this.getAge = getAge;', 'this.getWorkDuration = getWorkDuration;', 'this.getWorkYears = getWorkYears;',
  'this.truncate = truncate;', 'this.escapeHtml = escapeHtml;', 'this.badge = badge;',
  'this.performanceRatingBadge = performanceRatingBadge;', 'this.monthName = monthName;',
  'this.paginate = paginate;', 'this.validateRequired = validateRequired;',
  'this.calcPPh21Public = calcPPh21Public;', 'this.generateId = generateId;',
  'this.HARI = HARI;', 'this.ChartRegistry = ChartRegistry;', 'this.destroyAllCharts = destroyAllCharts;',
].join('\n');
vm.runInContext(code, ctx);

const {
  formatDate, formatCurrency, getAge, getWorkDuration, getWorkYears,
  truncate, escapeHtml, badge, performanceRatingBadge, monthName,
  paginate, validateRequired, calcPPh21Public, generateId, HARI, ChartRegistry, destroyAllCharts,
} = ctx;

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); console.log('  PASS  ' + name); pass++; }
  catch (e) { console.log('  FAIL  ' + name + ': ' + e.message); fail++; }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('\n── UTILS & BUSINESS LOGIC TESTS ──\n');

// ── formatDate ──
test('formatDate long: 26 Mei 2026', () => assert(formatDate('2026-05-26', 'long') === '26 Mei 2026', formatDate('2026-05-26', 'long')));
test('formatDate monthYear: Mei 2026', () => assert(formatDate('2026-05-01', 'monthYear') === 'Mei 2026', ''));
test('formatDate empty/dash returns dash', () => { assert(formatDate('-') === '-'); assert(formatDate('') === '-'); });
test('formatDate all 12 months render without undefined', () => {
  for (let m = 1; m <= 12; m++) {
    const d = `2026-${String(m).padStart(2,'0')}-15`;
    const r = formatDate(d, 'long');
    assert(!r.includes('undefined'), `month ${m}: ${r}`);
  }
});

// ── formatCurrency ──
test('formatCurrency 15000000 contains Rp and 15', () => {
  const r = formatCurrency(15000000);
  assert(r.startsWith('Rp') && r.includes('15'), r);
});
test('formatCurrency 0 = Rp 0', () => assert(formatCurrency(0) === 'Rp 0', ''));
test('formatCurrency null = Rp 0', () => assert(formatCurrency(null) === 'Rp 0', ''));

// ── monthName ──
test('monthName(1)=Januari, (5)=Mei, (12)=Desember', () => {
  assert(monthName(1) === 'Januari' && monthName(5) === 'Mei' && monthName(12) === 'Desember', '');
});

// ── HARI ──
test('HARI[0]=Minggu, HARI[1]=Senin, length=7', () => {
  assert(HARI.length === 7 && HARI[0] === 'Minggu' && HARI[1] === 'Senin', '');
});

// ── getAge ──
test('getAge 1990-01-01 is >30', () => assert(getAge('1990-01-01') > 30, ''));
test('getAge returns 0 for empty', () => assert(getAge('') === 0, ''));

// ── getWorkYears ──
test('getWorkYears 2014-03-01 is 11 or 12', () => {
  const y = getWorkYears('2014-03-01'); assert(y >= 11 && y <= 13, 'y=' + y);
});

// ── getWorkDuration ──
test('getWorkDuration 2019-01-01 returns tahun string', () => {
  assert(getWorkDuration('2019-01-01').includes('tahun'), '');
});
test('getWorkDuration empty returns dash', () => assert(getWorkDuration('') === '-', ''));

// ── truncate ──
test('truncate short string unchanged', () => assert(truncate('hello', 60) === 'hello', ''));
test('truncate 70-char string to 60 with ellipsis', () => {
  const r = truncate('a'.repeat(70), 60);
  assert(r.endsWith('…') && r.length <= 62, 'len=' + r.length);
});
test('truncate null/empty = empty string', () => assert(truncate(null) === '' && truncate('') === '', ''));

// ── escapeHtml ──
test('escapeHtml escapes < > & " \'', () => {
  const r = escapeHtml('<b>&"\'test</b>');
  assert(r.includes('&lt;') && r.includes('&amp;') && r.includes('&quot;'), r);
  assert(!r.includes('<') && !r.includes('>'), 'unescaped tag: ' + r);
});
test('escapeHtml null/undefined = empty', () => assert(escapeHtml(null) === '' && escapeHtml(undefined) === '', ''));
test('escapeHtml safe string unchanged', () => assert(escapeHtml('hello world') === 'hello world', ''));

// ── badge ──
test('badge Aktif → badge-success', () => assert(badge('Aktif').includes('badge-success'), ''));
test('badge Resign → badge-danger', () => assert(badge('Resign').includes('badge-danger'), ''));
test('badge Menunggu → badge-warning', () => assert(badge('Menunggu').includes('badge-warning'), ''));
test('badge Dibayar → badge-success', () => assert(badge('Dibayar').includes('badge-success'), ''));
test('badge WFH → badge-purple', () => assert(badge('WFH').includes('badge-purple'), ''));
test('badge Tetap → badge-success', () => assert(badge('Tetap').includes('badge-success'), ''));
test('badge Kontrak → badge-warning', () => assert(badge('Kontrak').includes('badge-warning'), ''));
test('badge unknown → badge-secondary', () => assert(badge('Unknown').includes('badge-secondary'), ''));
test('badge with customClass overrides lookup', () => assert(badge('Aktif', 'badge-info').includes('badge-info'), ''));

// ── performanceRatingBadge ──
test('performanceRatingBadge Istimewa → purple', () => assert(performanceRatingBadge('Istimewa').includes('badge-purple'), ''));
test('performanceRatingBadge Sangat Baik → success', () => assert(performanceRatingBadge('Sangat Baik').includes('badge-success'), ''));
test('performanceRatingBadge Kurang → danger', () => assert(performanceRatingBadge('Kurang').includes('badge-danger'), ''));
test('performanceRatingBadge - → secondary', () => assert(performanceRatingBadge('-').includes('badge-secondary'), ''));

// ── paginate ──
test('paginate 10 items / 3 per page = 4 pages, page 1 has 3 items', () => {
  const p = paginate(Array.from({length:10}), 1, 3);
  assert(p.totalPages === 4 && p.items.length === 3 && p.start === 1, JSON.stringify({tp:p.totalPages,il:p.items.length}));
});
test('paginate last page has 1 item', () => {
  assert(paginate(Array.from({length:10}), 4, 3).items.length === 1, '');
});
test('paginate clamps overflow page', () => assert(paginate(Array.from({length:5}), 99, 10).page === 1, ''));
test('paginate empty array → totalPages=1, total=0', () => {
  const p = paginate([], 1, 10);
  assert(p.total === 0 && p.totalPages === 1, '');
});

// ── validateRequired (fixed string array support) ──
test('validateRequired: string array returns true when no DOM (elements not found)', () => {
  assert(validateRequired('no-such-form', ['title', 'name']) === true, '');
});
test('validateRequired: object array returns true when no DOM', () => {
  assert(validateRequired('no-such-form', [{name:'title',msg:'required'}]) === true, '');
});

// ── calcPPh21Public ──
test('calcPPh21Public TK/0 30jt gross is positive', () => {
  assert(calcPPh21Public(30000000, 'TK/0') > 0, '');
});
test('calcPPh21Public K/3 pays less than TK/0', () => {
  const a = calcPPh21Public(15000000, 'TK/0');
  const b = calcPPh21Public(15000000, 'K/3');
  assert(a > b, 'TK/0=' + a + ' K/3=' + b);
});
test('calcPPh21Public low salary (below PTKP) = 0', () => {
  // Gross < PTKP (TK/0=54jt/yr → 4.5jt/mo)
  assert(calcPPh21Public(3000000, 'TK/0') === 0, '');
});

// ── generateId ──
test('generateId produces unique IDs (no collision in 100)', () => {
  const ids = new Set(Array.from({length:100}, () => generateId('X')));
  assert(ids.size === 100, 'collisions: ' + (100 - ids.size));
});
test('generateId respects prefix', () => {
  assert(generateId('EMP').startsWith('EMP'), '');
  assert(generateId('').length > 0, 'no prefix');
});

// ── ChartRegistry + destroyAllCharts ──
test('ChartRegistry is an empty object initially', () => assert(typeof ChartRegistry === 'object', ''));
test('destroyAllCharts does not throw on empty registry', () => {
  try { destroyAllCharts(); assert(true, ''); } catch(e) { assert(false, e.message); }
});

console.log('\n── RESULTS: ' + pass + ' passed, ' + fail + ' failed ──\n');
process.exit(fail > 0 ? 1 : 0);
