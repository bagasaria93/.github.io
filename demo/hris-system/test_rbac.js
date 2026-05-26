'use strict';
const fs = require('fs');
const vm = require('vm');

// auth.js needs STORAGE_PREFIX from data.js — provide a mock
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
  ownKeys()                      { return Object.keys(store); },
  getOwnPropertyDescriptor(_, p) {
    if (p in store) return { value: store[p], writable: true, enumerable: true, configurable: true };
  },
});

const ctx = vm.createContext({ localStorage: mockLocalStorage, console, window: { location: { href: '' } } });

// Load data.js first (needed for STORAGE_PREFIX and DB)
const dataCode = fs.readFileSync(__dirname + '/js/data.js', 'utf8') +
  '\nthis.DB = DB; this.STORAGE_PREFIX = STORAGE_PREFIX;';
vm.runInContext(dataCode, ctx);

// Load auth.js (depends on DB and STORAGE_PREFIX)
const authCode = fs.readFileSync(__dirname + '/js/auth.js', 'utf8') +
  '\nthis.Auth = Auth; this.PERMISSIONS = PERMISSIONS; this.MENUS = MENUS; this.getRoleLabel = getRoleLabel;';
vm.runInContext(authCode, ctx);

const { Auth, PERMISSIONS, MENUS, getRoleLabel, DB } = ctx;

// Seed the database
DB.init();

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); console.log('  PASS  ' + name); pass++; }
  catch (e) { console.log('  FAIL  ' + name + ': ' + e.message); fail++; }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

console.log('\n── RBAC & AUTH TESTS ──\n');

// ── PERMISSIONS structure ──
test('PERMISSIONS has all 4 roles', () => {
  ['superadmin','hrmanager','hrstaff','employee'].forEach(r => {
    assert(Array.isArray(PERMISSIONS[r]), r + ' missing');
  });
});

test('superadmin has more permissions than hrmanager', () =>
  assert(PERMISSIONS.superadmin.length > PERMISSIONS.hrmanager.length, ''));

test('hrmanager has more permissions than hrstaff', () =>
  assert(PERMISSIONS.hrmanager.length > PERMISSIONS.hrstaff.length, ''));

test('hrstaff has more permissions than employee', () =>
  assert(PERMISSIONS.hrstaff.length > PERMISSIONS.employee.length, ''));

// ── Critical permission assertions ──
test('superadmin can edit_settings', () =>
  assert(PERMISSIONS.superadmin.includes('edit_settings'), ''));

test('hrmanager cannot edit_settings', () =>
  assert(!PERMISSIONS.hrmanager.includes('edit_settings'), ''));

test('superadmin can reset_data', () =>
  assert(PERMISSIONS.superadmin.includes('reset_data'), ''));

test('employee cannot reset_data', () =>
  assert(!PERMISSIONS.employee.includes('reset_data'), ''));

test('superadmin and hrmanager can mark_paid_payroll', () => {
  assert(PERMISSIONS.superadmin.includes('mark_paid_payroll'), 'superadmin');
  assert(PERMISSIONS.hrmanager.includes('mark_paid_payroll'), 'hrmanager');
  assert(!PERMISSIONS.hrstaff.includes('mark_paid_payroll'), 'hrstaff should not');
  assert(!PERMISSIONS.employee.includes('mark_paid_payroll'), 'employee should not');
});

test('superadmin and hrmanager can create_performance', () => {
  assert(PERMISSIONS.superadmin.includes('create_performance'), '');
  assert(PERMISSIONS.hrmanager.includes('create_performance'), '');
  assert(!PERMISSIONS.hrstaff.includes('create_performance'), 'hrstaff should not');
});

test('superadmin, hrmanager, hrstaff can create_announcement', () => {
  assert(PERMISSIONS.superadmin.includes('create_announcement'), '');
  assert(PERMISSIONS.hrmanager.includes('create_announcement'), '');
  assert(PERMISSIONS.hrstaff.includes('create_announcement'), '');
  assert(!PERMISSIONS.employee.includes('create_announcement'), 'employee should not');
});

test('edit_organization only for superadmin', () => {
  assert(PERMISSIONS.superadmin.includes('edit_organization'), '');
  assert(!PERMISSIONS.hrmanager.includes('edit_organization'), 'hrmanager should not');
  assert(!PERMISSIONS.hrstaff.includes('edit_organization'), 'hrstaff should not');
});

test('all roles can view_announcements', () => {
  ['superadmin','hrmanager','hrstaff','employee'].forEach(r => {
    assert(PERMISSIONS[r].includes('view_announcements'), r + ' missing view_announcements');
  });
});

test('create_training allowed for superadmin, hrmanager, hrstaff', () => {
  assert(PERMISSIONS.superadmin.includes('create_training'), '');
  assert(PERMISSIONS.hrmanager.includes('create_training'), '');
  assert(PERMISSIONS.hrstaff.includes('create_training') || PERMISSIONS.hrstaff.includes('edit_training'), 'hrstaff should have at least edit_training');
  assert(!PERMISSIONS.employee.includes('create_training'), 'employee should not');
});

// ── MENUS structure ──
test('MENUS has all 4 roles', () => {
  ['superadmin','hrmanager','hrstaff','employee'].forEach(r => {
    assert(Array.isArray(MENUS[r]) && MENUS[r].length > 0, r + ' missing menus');
  });
});

test('superadmin has all 12 menu items', () => assert(MENUS.superadmin.length === 12, MENUS.superadmin.length));
test('employee menu includes dashboard, attendance, leave, payroll, performance, training, announcements, organization', () => {
  const ids = MENUS.employee.map(m => m.id);
  ['dashboard','attendance','leave','payroll','performance','training','announcements','organization'].forEach(id => {
    assert(ids.includes(id), 'missing: ' + id);
  });
});
test('employee menu does NOT include employees, reports, settings', () => {
  const ids = MENUS.employee.map(m => m.id);
  ['employees','reports','settings'].forEach(id => {
    assert(!ids.includes(id), 'should not have: ' + id);
  });
});
test('all menu items have id, label, icon', () => {
  Object.values(MENUS).forEach(menus => {
    menus.forEach(m => assert(m.id && m.label && m.icon, 'incomplete menu item: ' + JSON.stringify(m)));
  });
});

// ── getRoleLabel ──
test('getRoleLabel returns correct labels', () => {
  assert(getRoleLabel('superadmin') === 'Super Admin', '');
  assert(getRoleLabel('hrmanager') === 'HR Manager', '');
  assert(getRoleLabel('hrstaff') === 'HR Staff', '');
  assert(getRoleLabel('employee') === 'Karyawan', '');
  assert(getRoleLabel('unknown') === 'unknown', 'fallback');
});

// ── Auth.login ──
test('Auth.login with valid superadmin credentials succeeds', () => {
  const r = Auth.login('admin@cakrawalagemilang.co.id', 'Admin@123');
  assert(r.success === true, 'success: ' + JSON.stringify(r));
  assert(r.session.role === 'superadmin', 'role: ' + r.session.role);
  assert(r.session.id === 'EMP001', 'id: ' + r.session.id);
});

test('Auth.login with valid hrmanager credentials succeeds', () => {
  const r = Auth.login('hrmanager@cakrawalagemilang.co.id', 'Hrmgr@123');
  assert(r.success === true && r.session.role === 'hrmanager', '');
});

test('Auth.login with valid hrstaff credentials succeeds', () => {
  const r = Auth.login('hrstaff@cakrawalagemilang.co.id', 'Hrstaff@123');
  assert(r.success === true && r.session.role === 'hrstaff', '');
});

test('Auth.login with valid employee credentials succeeds', () => {
  const r = Auth.login('karyawan@cakrawalagemilang.co.id', 'Kary@123');
  assert(r.success === true && r.session.role === 'employee', '');
});

test('Auth.login with wrong password fails', () => {
  const r = Auth.login('admin@cakrawalagemilang.co.id', 'wrongpassword');
  assert(r.success === false, '');
  assert(r.message, 'should have message');
});

test('Auth.login with unknown email fails', () => {
  const r = Auth.login('hacker@evil.com', 'Admin@123');
  assert(r.success === false, '');
});

test('Auth.login is case-insensitive for email', () => {
  const r = Auth.login('ADMIN@CAKRAWALAGEMILANG.CO.ID', 'Admin@123');
  assert(r.success === true, 'case-insensitive login should work');
});

// ── Auth.getSession / can / getUser after login ──
test('Auth.can works after login', () => {
  Auth.login('admin@cakrawalagemilang.co.id', 'Admin@123');
  assert(Auth.can('edit_settings') === true, 'superadmin can edit_settings');
  assert(Auth.can('nonexistent_permission') === false, 'nonexistent should be false');
});

test('Auth.getSession returns session after login', () => {
  const s = Auth.getSession();
  assert(s && s.role === 'superadmin' && s.id === 'EMP001', JSON.stringify(s));
});

test('Auth.getUser returns employee object matching session', () => {
  const u = Auth.getUser();
  assert(u && u.name === 'Rendra Kusuma', u ? u.name : 'null');
});

test('Auth.isLoggedIn returns true when session exists', () => assert(Auth.isLoggedIn() === true, ''));

console.log('\n── RESULTS: ' + pass + ' passed, ' + fail + ' failed ──\n');
process.exit(fail > 0 ? 1 : 0);
