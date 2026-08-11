'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const BASE = path.join(__dirname, 'js');

// Mock localStorage in test context.
// Must use Proxy so Object.keys(localStorage) returns stored key names,
// matching browser behavior (DB.reset uses Object.keys(localStorage)).
const store = {};
const mockLocalStorage = new Proxy({}, {
  get(_, prop) {
    if (prop === 'getItem')    return k => store[k] ?? null;
    if (prop === 'setItem')    return (k, v) => { store[k] = v; };
    if (prop === 'removeItem') return k => { delete store[k]; };
    if (prop === 'length')     return Object.keys(store).length;
    if (prop === 'key')        return i => Object.keys(store)[i];
    return store[prop] ?? null;
  },
  ownKeys()                       { return Object.keys(store); },
  getOwnPropertyDescriptor(_, p)  {
    if (p in store) return { value: store[p], writable: true, enumerable: true, configurable: true };
  },
});

// Run data.js in a shared vm context so all its const/let/var are accessible
const ctx = vm.createContext({ localStorage: mockLocalStorage, console });
// vm context: const/let are block-scoped and not added to the context object.
// Append an explicit export to expose them via `this` (the context global).
const dataCode = fs.readFileSync(path.join(BASE, 'data.js'), 'utf8') +
  '\nthis.DB = DB; this.calcPPh21 = calcPPh21;' +
  '\nthis.INITIAL_EMPLOYEES = INITIAL_EMPLOYEES;' +
  '\nthis.INITIAL_POSITIONS = INITIAL_POSITIONS;' +
  '\nthis.INITIAL_DEPARTMENTS = INITIAL_DEPARTMENTS;';
vm.runInContext(dataCode, ctx);

const { DB, calcPPh21, INITIAL_EMPLOYEES, INITIAL_POSITIONS, INITIAL_DEPARTMENTS } = ctx;

let pass = 0;
let fail = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    pass++;
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    fail++;
  }
}

function assert(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\n── DATA LAYER TESTS ──\n');

// Seed
DB.init();

test('DB.init seeds 15 employees', () => assert(DB.employees.getAll().length === 15, 'count'));
test('DB.init seeds 7 departments', () => assert(DB.departments.getAll().length === 7, 'count'));
test('DB.init seeds 15 positions', () => assert(DB.positions.getAll().length === 15, 'count'));
test('DB.init seeds 30 payrolls (15 emp × 2 months)', () => assert(DB.payroll.getAll().length === 30, 'count'));
test('DB.init seeds 5 trainings', () => assert(DB.training.getAll().length === 5, 'count'));
test('DB.init seeds 6 announcements', () => assert(DB.announcements.getAll().length === 6, 'count'));
test('DB.init seeds attendance records', () => assert(DB.attendance.getAll().length > 200, 'count'));

const emps = DB.employees.getAll();

test('employeeType field present (not employmentType)', () =>
  assert(emps.every(e => 'employeeType' in e && !('employmentType' in e)), 'field name'));

test('gender values are L or P only', () =>
  assert(emps.every(e => e.gender === 'L' || e.gender === 'P'), 'gender'));

test('leave balance has nested { total, used, remaining } objects', () => {
  const bal = DB.leave.getBalance('EMP001', 2026);
  assert(bal, 'balance exists');
  assert(typeof bal.annual === 'object' && 'remaining' in bal.annual, 'annual');
  assert(typeof bal.sick === 'object' && 'remaining' in bal.sick, 'sick');
  assert(typeof bal.important === 'object' && 'remaining' in bal.important, 'important');
});

test('leave requests use .type and .days (not .leaveType / .totalDays)', () => {
  const leaves = DB.leave.getAll();
  assert(leaves.every(l => 'type' in l && !('leaveType' in l)), '.type');
  assert(leaves.every(l => 'days' in l && !('totalDays' in l)), '.days');
});

test('leave balance remaining = total - used', () => {
  DB.leave.getAll().forEach(l => {});
  const bal = DB.leave.getBalance('EMP002', 2026);
  assert(bal.annual.remaining === bal.annual.total - bal.annual.used, 'annual math');
  assert(bal.sick.remaining === bal.sick.total - bal.sick.used, 'sick math');
});

test('position levels are numeric 1–5', () => {
  const pos = DB.positions.getAll();
  assert(pos.every(p => typeof p.level === 'number' && p.level >= 1 && p.level <= 5), 'level');
});

test('PPh21 for Rp30jt gross K/2 is positive and reasonable', () => {
  const pph = calcPPh21(30000000, 'K/2');
  assert(pph > 0, 'positive');
  assert(pph < 5000000, 'less than 5jt/month');
  assert(typeof pph === 'number', 'number');
});

test('PPh21 TK/0 > K/3 (less PTKP = more tax)', () => {
  const a = calcPPh21(15000000, 'TK/0');
  const b = calcPPh21(15000000, 'K/3');
  assert(a > b, 'TK/0 must pay more tax than K/3');
});

test('payroll: all netSalary = grossSalary - totalDeductions', () => {
  DB.payroll.getAll().forEach(p => {
    const diff = Math.abs(p.netSalary - (p.grossSalary - p.totalDeductions));
    assert(diff <= 1, `netSalary mismatch for ${p.employeeId}: net=${p.netSalary} gross=${p.grossSalary} ded=${p.totalDeductions}`);
  });
});

test('payroll: grossSalary = basicSalary + sum(allowances)', () => {
  DB.payroll.getAll().forEach(p => {
    const sumAllow = Object.values(p.allowances).reduce((a, b) => a + b, 0);
    const expected = p.basicSalary + sumAllow + (p.overtimePay || 0);
    assert(p.grossSalary === expected, `gross mismatch for ${p.employeeId}`);
  });
});

test('payroll April 2026 all Dibayar, May 2026 all Proses', () => {
  const apr = DB.payroll.getByMonth(4, 2026);
  const may = DB.payroll.getByMonth(5, 2026);
  assert(apr.every(p => p.status === 'Dibayar'), 'April status');
  assert(may.every(p => p.status === 'Proses'), 'May status');
});

test('DB.payroll.markPaid changes May status', () => {
  DB.payroll.markPaid(5, 2026, '2026-05-30');
  const may = DB.payroll.getByMonth(5, 2026);
  assert(may.every(p => p.status === 'Dibayar' && p.paidDate === '2026-05-30'), 'markPaid');
});

test('employee CRUD: create → getById → update → delete', () => {
  DB.employees.create({ id: 'EMPX', name: 'Test', status: 'Aktif', loginEmail: 'x@x.com', password: 'X', employeeType: 'Tetap', gender: 'L' });
  assert(DB.employees.getById('EMPX')?.name === 'Test', 'create');
  DB.employees.update('EMPX', { name: 'Updated' });
  assert(DB.employees.getById('EMPX')?.name === 'Updated', 'update');
  DB.employees.delete('EMPX');
  assert(!DB.employees.getById('EMPX'), 'delete');
});

test('department CRUD: create → update → delete', () => {
  const id = DB.departments.nextId();
  DB.departments.create({ id, name: 'Test Dept', code: 'TST', headId: null });
  assert(DB.departments.getById(id)?.name === 'Test Dept', 'create');
  DB.departments.update(id, { name: 'Updated Dept' });
  assert(DB.departments.getById(id)?.name === 'Updated Dept', 'update');
  DB.departments.delete(id);
  assert(!DB.departments.getById(id), 'delete');
});

test('positions.getByDept returns only matching department', () => {
  const pos = DB.positions.getByDept('DEP002');
  assert(pos.length > 0, 'has positions');
  assert(pos.every(p => p.departmentId === 'DEP002'), 'all same dept');
});

test('leave create → getPending → approve → no longer pending', () => {
  const id = DB.leave.nextId();
  DB.leave.create({ id, employeeId: 'EMP010', type: 'Cuti Tahunan', startDate: '2026-06-01', endDate: '2026-06-02', days: 2, reason: 'Test', status: 'Menunggu', approvedBy: null, approvedDate: null, rejectNote: '', createdAt: '2026-05-26' });
  const pending = DB.leave.getPending();
  assert(pending.some(l => l.id === id), 'is pending');
  DB.leave.update(id, { status: 'Disetujui', approvedBy: 'EMP002', approvedDate: '2026-05-26' });
  const pendingAfter = DB.leave.getPending();
  assert(!pendingAfter.some(l => l.id === id), 'no longer pending');
  DB.leave.delete(id);
});

test('recruitment candidates have required fields', () => {
  DB.recruitment.getAll().forEach(r => {
    r.candidates.forEach(c => {
      assert(c.id && c.name && c.stage, `candidate missing fields in ${r.id}`);
    });
  });
});

test('recruitment.getOpen returns only Buka status', () => {
  const open = DB.recruitment.getOpen();
  assert(open.every(r => r.status === 'Buka'), 'status');
});

test('training participants all reference valid employee IDs', () => {
  const empIds = new Set(DB.employees.getAll().map(e => e.id));
  DB.training.getAll().forEach(t => {
    t.participants.forEach(p => assert(empIds.has(p), `invalid participant ${p} in ${t.id}`));
    t.completions.forEach(c => assert(empIds.has(c), `invalid completion ${c} in ${t.id}`));
  });
});

test('announcements: 5 published + 1 draft', () => {
  const all = DB.announcements.getAll();
  const pub = DB.announcements.getPublished();
  assert(all.length === 6, 'total 6');
  assert(pub.length === 5, 'published 5');
  assert(pub.every(a => a.status === 'Publish'), 'all published have correct status');
});

test('department headIds reference valid employees', () => {
  const empIds = new Set(DB.employees.getAll().map(e => e.id));
  DB.departments.getAll().forEach(d => {
    if (d.headId) assert(empIds.has(d.headId), `invalid headId ${d.headId} in ${d.id}`);
  });
});

test('settings.get() returns all required fields', () => {
  const s = DB.settings.get();
  ['name', 'address', 'email', 'workDays', 'workHourStart', 'workHourEnd', 'bpjsKesehatan', 'bpjsJHT'].forEach(k => {
    assert(k in s, `missing field: ${k}`);
  });
});

test('DB.reset() restores exact seed state', () => {
  DB.employees.delete('EMP001');
  assert(!DB.employees.getById('EMP001'), 'deleted before reset');
  DB.reset();
  assert(DB.employees.getById('EMP001')?.name === 'Rendra Kusuma', 'restored after reset');
  assert(DB.employees.getAll().length === 15, '15 employees after reset');
});

test('demo login accounts exist with correct credentials', () => {
  const accounts = [
    ['admin@cakrawalagemilang.co.id', 'Admin@123', 'superadmin'],
    ['hrmanager@cakrawalagemilang.co.id', 'Hrmgr@123', 'hrmanager'],
    ['hrstaff@cakrawalagemilang.co.id', 'Hrstaff@123', 'hrstaff'],
    ['karyawan@cakrawalagemilang.co.id', 'Kary@123', 'employee'],
  ];
  const allEmps = DB.employees.getAll();
  accounts.forEach(([email, pwd, role]) => {
    const u = allEmps.find(e => e.loginEmail === email && e.password === pwd && e.role === role);
    assert(u, `missing account: ${email}`);
  });
});

console.log(`\n── RESULTS: ${pass} passed, ${fail} failed ──\n`);
process.exit(fail > 0 ? 1 : 0);
