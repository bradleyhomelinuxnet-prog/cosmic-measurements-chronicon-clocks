#!/usr/bin/env node
/* The test suite. No dependencies: node tests/run.js
   Pins the year arithmetic, the cycles, the units, the measurement checks and every discovery file. */
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const core = require('../js/core.js');
let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('  ok  ' + name); }
  catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, (msg || '') + ` expected ${b} ± ${eps}, got ${a}`);

console.log('years');
test('BC/AD to astronomical', () => {
  assert.strictEqual(core.astroFromHuman(1, 'BC'), 0);
  assert.strictEqual(core.astroFromHuman(2239, 'BC'), -2238);
  assert.strictEqual(core.astroFromHuman(2040, 'AD'), 2040);
});
test('parseYear reads every written form', () => {
  assert.strictEqual(core.parseYear('2239 BC'), -2238);
  assert.strictEqual(core.parseYear('3,895 BCE'), -3894);
  assert.strictEqual(core.parseYear('2040 AD'), 2040);
  assert.strictEqual(core.parseYear('2040 CE'), 2040);
  assert.strictEqual(core.parseYear('2040'), 2040);
  assert.strictEqual(core.parseYear('AM 5934'), 2040);
  assert.strictEqual(core.parseYear('-2238'), -2238);
  assert.ok(isNaN(core.parseYear('next spring')));
});
test('Annus Mundi anchors from the book', () => {
  assert.strictEqual(core.am(2026), 5920);
  assert.strictEqual(core.am(2040), 5934);
  assert.strictEqual(core.am(2106), 6000);
  assert.strictEqual(core.am(core.parseYear('2239 BC')), 1656);
  assert.strictEqual(core.am(core.parseYear('1135 BC')), 2760);
  assert.strictEqual(core.am(core.parseYear('1902 AD')), 5796);
  assert.strictEqual(core.am(core.parseYear('2815 BC')), 1080);
});
test('fmtYear round-trips', () => {
  [-5238, -2238, -1, 0, 1, 2040].forEach(a => assert.strictEqual(core.parseYear(core.fmtYear(a)), a));
});

console.log('cycles');
test('Phoenix nodes fall every 138 years on the book\'s dates', () => {
  ['2239 BC', '1963 BC', '1687 BC', '583 BC', '522 AD', '1902 AD', '2040 AD'].forEach(y =>
    assert.ok(core.cyclePosition(core.parseYear(y), 'phoenix').onNode, y + ' should be a node'));
  assert.ok(!core.cyclePosition(2026, 'phoenix').onNode);
  assert.strictEqual(core.cyclePosition(2026, 'phoenix').next, 2040);
});
test('the book\'s timeline years are multiples of 138 in AM', () => {
  [[1656, 12], [2760, 20], [4416, 32], [5796, 42], [5934, 43]].forEach(([am, k]) => assert.strictEqual(am / 138, k));
});
test('Nemesis window matches the clock engine', () => {
  assert.ok(core.cyclePosition(2046, 'nemesis').inWindow);
  assert.ok(!core.cyclePosition(2026, 'nemesis').inWindow);
});
test('7,344-year span: 5239 BC to 2106 AD', () => {
  assert.strictEqual(2106 - core.parseYear('5239 BC'), 7344);
  near(7344 / 138, 53.2, 0.05);
});

console.log('palindromes');
test('palindrome tests', () => {
  assert.ok(core.isPalindrome(1661)); assert.ok(core.isPalindrome(5885)); assert.ok(!core.isPalindrome(5920)); assert.ok(!core.isPalindrome(7));
  assert.strictEqual(core.nextPalindrome(5920), 5995);
  assert.strictEqual(core.prevPalindrome(5920), 5885);
});
test('mirror folds around the axis', () => {
  assert.strictEqual(core.mirror(1656, 2760), 3864);
  assert.strictEqual(core.mirror(core.mirror(1234, 2760), 2760), 1234);
});

console.log('calendar');
test('Julian Day Numbers', () => {
  assert.strictEqual(core.jdn(2000, 1, 1), 2451545);
  assert.strictEqual(core.jdn(-4713, 11, 24), 0);
});
test('moon age is a fraction of a synodic month', () => {
  const a = core.moonAge(core.jdn(2026, 11, 7)); assert.ok(a >= 0 && a < core.SYNODIC);
});

console.log('units');
test('royal cubit and inch', () => {
  near(core.convert(20.62, 'in', 'cubit'), 1, 1e-12);
  near(core.convert(1, 'in', 'm'), 0.0254, 1e-12);
  near(core.convert(12, 'in', 'ft'), 1, 1e-12);
  near(core.convert(5776, 'in', 'm'), 146.7104, 1e-4);
  near(core.convert(core.convert(9068.8, 'in', 'cubit'), 'cubit', 'in'), 9068.8, 1e-9);
});
test('relations name 19 and 138', () => {
  assert.deepStrictEqual(core.relations(138), ['138']);
  assert.deepStrictEqual(core.relations(5934), ['138 × 43']);
  assert.ok(core.relations(1991).indexOf('palindrome') >= 0);
});

console.log('measurements');
const sandbox = { window: {}, console };
sandbox.window.CC = {}; sandbox.CC = sandbox.window.CC;
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/petrie.js'), 'utf8'), sandbox);
const P = sandbox.CC.petrie, F = {};
P.features.forEach(f => { F[f.id] = f.value; });
test('feature ids are unique and every feature has a source', () => {
  const ids = P.features.map(f => f.id); assert.strictEqual(new Set(ids).size, ids.length);
  P.features.forEach(f => assert.ok(f.ref, f.id + ' has no ref'));
});
test('the four sides average to the mean side', () => near((F['base-north'] + F['base-south'] + F['base-east'] + F['base-west']) / 4, F['base-mean'], 0.05));
test('the checks compute the true values', () => {
  const C = {}; P.checks.forEach(c => { C[c.id] = c.expr(F); });
  near(C['pi-perimeter'], 3.14016, 1e-5, 'perimeter ÷ 2h');           /* the text states 3.14 */
  assert.strictEqual(core.round(C['pi-perimeter'], 2), 3.14);
  near(C['cubit-pi6'], 0.523748, 1e-6, 'cubit in metres');             /* π/6 = 0.523599; both read 0.523 to three places */
  assert.strictEqual(Math.trunc(C['cubit-pi6'] * 1000), 523); assert.strictEqual(Math.trunc(Math.PI / 6 * 1000), 523);
  near(C['upper-ratio'], 2.0000, 1e-4, 'Upper Chamber 2:1');
  near(C['upper-pi'], 2.68756, 1e-4, 'Upper Chamber perimeter ÷ 2h');  /* the text states 3.14159 */
  near(C['gallery-cubits'], 88.045, 1e-3, 'Gallery in cubits');
  assert.strictEqual(C['beams-2040'], 5934);
});

console.log('discoveries');
const dsb = { window: {}, console, document: { write() { } }, localStorage: { getItem() { return '[]'; }, setItem() { } } };
dsb.self = dsb.window; dsb.window.CC = { core }; dsb.CC = dsb.window.CC;
vm.createContext(dsb);
vm.runInContext(fs.readFileSync(path.join(root, 'js/registry.js'), 'utf8'), dsb);
vm.runInContext(fs.readFileSync(path.join(root, 'discoveries/manifest.js'), 'utf8'), dsb);
const files = dsb.CC.discoveryFiles;
test('every file in the manifest exists', () => files.forEach(f => assert.ok(fs.existsSync(path.join(root, 'discoveries', f)), f + ' missing')));
test('every discovery file is in the manifest', () => {
  fs.readdirSync(path.join(root, 'discoveries')).filter(f => f.endsWith('.js') && f !== 'manifest.js')
    .forEach(f => assert.ok(files.indexOf(f) >= 0, f + ' is not listed in manifest.js'));
});
files.forEach(f => vm.runInContext(fs.readFileSync(path.join(root, 'discoveries', f), 'utf8'), dsb));
const all = dsb.CC.discoveries({ drafts: false });
test('every discovery loads, has a unique id matching its file, and a readable year', () => {
  assert.strictEqual(all.length, files.length);
  all.forEach(d => {
    assert.ok(files.indexOf(d.id + '.js') >= 0, d.id + ' does not match a file name');
    if (d.when) assert.ok(d.astro != null && !isNaN(d.astro), d.id + ' year "' + d.when + '" is unreadable');
    assert.ok(d.title, d.id + ' has no title');
  });
});
test('measurement discoveries point at real features', () => {
  all.filter(d => d.measurement && d.measurement.feature).forEach(d => assert.ok(F[d.measurement.feature] != null, d.id + ' → ' + d.measurement.feature));
});
test('a discovery file round-trips through the exporter', () => {
  const d = all.find(x => x.id === 'next-phoenix-2040ad');
  const sb2 = { CC: { got: null } }; sb2.CC.discover = x => { sb2.CC.got = x; };
  vm.runInNewContext(dsb.CC.discoveryFileText(d), sb2);
  assert.strictEqual(sb2.CC.got.id, d.id); assert.strictEqual(sb2.CC.got.when, '2040 AD');
});
test('the clock ledger is built from the discoveries', () => {
  const L = dsb.CC.ledger(); assert.ok(L.length >= 13);
  assert.ok(L.some(r => r[0] === 2040 && r[1] === 'phx'));
});

console.log('book');
const bsb = { window: {} }; bsb.window.CC = {}; bsb.CC = bsb.window.CC;
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/book.js'), 'utf8'), bsb);
test('all nineteen sections are present', () => {
  const labels = bsb.CC.book.filter(c => c.label).map(c => c.label);
  assert.strictEqual(new Set(labels).size, 19);
});
test('every discovery section exists in the book', () => {
  const ids = new Set(bsb.CC.book.map(c => c.id));
  all.filter(d => d.section).forEach(d => assert.ok(ids.has(d.section), d.id + ' → ' + d.section));
  P.features.filter(f => f.section).forEach(f => assert.ok(ids.has(f.section), f.id + ' → ' + f.section));
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
