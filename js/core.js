/* Cosmic Chronicon — core arithmetic.
   Pure functions only: no DOM, no clock reads. Loads in the browser as window.CC.core
   and in Node as require('./js/core.js') so the test suite can pin every number.
   © 2026 Bradley Rogue. All rights reserved. */
(function (root, factory) {
  var core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  else { root.CC = root.CC || {}; root.CC.core = core; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------- years ----------
     Astronomical numbering: 1 BC = 0, 2 BC = -1, so BC year B -> 1 - B.
     Annus Mundi (this work's count): AM = astro + 3894.
       2026 CE -> AM 5920 · 2040 CE -> AM 5934 · 2239 BC -> AM 1656 · 2106 CE -> AM 6000 */
  var AM_OFFSET = 3894;

  function mod(n, m) { return ((n % m) + m) % m; }

  function astroFromHuman(year, era) {
    era = String(era || 'AD').toUpperCase();
    return (era === 'BC' || era === 'BCE') ? 1 - year : year;
  }
  function humanFromAstro(astro) {
    return astro <= 0 ? { year: 1 - astro, era: 'BC' } : { year: astro, era: 'AD' };
  }
  function fmtYear(astro) {
    var h = humanFromAstro(astro);
    return h.year + ' ' + h.era;
  }
  /* Accepts "2040", "2040 AD", "2040 CE", "2239 BC", "3,895 BCE", "AM 5934", "-2238" (astro). */
  function parseYear(s) {
    if (typeof s === 'number') return s;
    var t = String(s).trim().replace(/,/g, '');
    var m = /^AM\s*(-?\d+)$/i.exec(t);
    if (m) return +m[1] - AM_OFFSET;
    m = /^(-?\d+)\s*(AD|CE|BC|BCE)?$/i.exec(t);
    if (!m) return NaN;
    if (!m[2]) return +m[1];
    return astroFromHuman(+m[1], m[2]);
  }
  function am(astro) { return astro + AM_OFFSET; }
  function astroFromAM(a) { return a - AM_OFFSET; }

  /* ---------- palindromes ---------- */
  function isPalindrome(n) {
    var s = String(Math.abs(Math.round(n)));
    return s.length > 1 && s === s.split('').reverse().join('');
  }
  function nextPalindrome(n) {
    for (var x = Math.round(n), i = 0; i < 200000; i++, x++) if (isPalindrome(x)) return x;
    return null;
  }
  function prevPalindrome(n) {
    for (var x = Math.round(n), i = 0; i < 200000; i++, x--) if (isPalindrome(x)) return x;
    return null;
  }
  /* Mirror a year around an axis: axis 2760 AM maps AM 1656 -> AM 3864. */
  function mirror(value, axis) { return 2 * axis - value; }

  /* ---------- cycles (astronomical years) ----------
     Each cycle is a grid: a year sits ON the grid when mod(year - base, step) === 0. */
  var CYCLES = {
    phoenix: { name: 'Phoenix', step: 138, base: -4308, color: 'red' },
    metonic: { name: 'Metonic', step: 19, base: 2026, color: 'cyan' },
    nemesis: { name: 'Nemesis X', step: 792, base: 462, window: 60, color: 'violet' },
    ner: { name: 'NER', step: 600, base: -5238, color: 'gold' }
  };
  function cyclePosition(astro, key) {
    var c = CYCLES[key];
    var into = mod(astro - c.base, c.step);
    var prev = astro - into;
    return {
      key: key, step: c.step, into: into, toNext: into === 0 ? 0 : c.step - into,
      prev: prev, next: into === 0 ? astro : prev + c.step,
      onNode: into === 0, inWindow: c.window ? into <= c.window : into === 0,
      index: Math.floor((astro - c.base) / c.step)
    };
  }
  /* Which cycles a year touches, plus palindrome flags — used to tag every discovery. */
  function tagsForYear(astro) {
    var t = [];
    if (cyclePosition(astro, 'phoenix').onNode) t.push('138');
    if (mod(am(astro), 138) === 0) t.push('AM×138');
    if (cyclePosition(astro, 'metonic').onNode) t.push('19');
    if (mod(am(astro), 19) === 0) t.push('AM×19');
    if (cyclePosition(astro, 'nemesis').inWindow) t.push('Nemesis');
    if (cyclePosition(astro, 'ner').onNode) t.push('NER');
    var h = humanFromAstro(astro);
    if (isPalindrome(h.year)) t.push('palindrome-year');
    if (isPalindrome(am(astro))) t.push('palindrome-AM');
    return t;
  }

  /* ---------- Julian Day Number (proleptic Gregorian) ---------- */
  function jdn(astro, m, d) {
    var a = Math.floor((14 - m) / 12);
    var y = astro + 4800 - a;
    var mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * y + Math.floor(y / 4) -
      Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }
  var SYNODIC = 29.530588853, NEWMOON_J2000 = 2451550.1;
  function moonAge(jd) { return mod(jd - NEWMOON_J2000, SYNODIC); }

  /* ---------- units ----------
     Royal cubit per Petrie (1883): 20.620 inches. Inch = 0.0254 m exactly. */
  var UNITS = {
    in: { name: 'inches', perInch: 1 },
    ft: { name: 'feet', perInch: 1 / 12 },
    m: { name: 'metres', perInch: 0.0254 },
    cm: { name: 'centimetres', perInch: 2.54 },
    cubit: { name: 'royal cubits', perInch: 1 / 20.620 }
  };
  function convert(value, from, to) {
    if (!UNITS[from] || !UNITS[to]) throw new Error('unknown unit ' + from + ' or ' + to);
    return value / UNITS[from].perInch * UNITS[to].perInch;
  }
  function round(n, dp) { var f = Math.pow(10, dp == null ? 3 : dp); return Math.round(n * f) / f; }

  /* ---------- number scans for the 19 / 138 index ---------- */
  function relations(n) {
    var out = [];
    [19, 138].forEach(function (k) {
      if (n === k) out.push(String(k));
      else if (n % k === 0 && n !== 0) out.push(k + ' × ' + (n / k));
    });
    if (isPalindrome(n)) out.push('palindrome');
    return out;
  }

  return {
    AM_OFFSET: AM_OFFSET, CYCLES: CYCLES, UNITS: UNITS, SYNODIC: SYNODIC,
    mod: mod, astroFromHuman: astroFromHuman, humanFromAstro: humanFromAstro,
    fmtYear: fmtYear, parseYear: parseYear, am: am, astroFromAM: astroFromAM,
    isPalindrome: isPalindrome, nextPalindrome: nextPalindrome, prevPalindrome: prevPalindrome,
    mirror: mirror, cyclePosition: cyclePosition, tagsForYear: tagsForYear,
    jdn: jdn, moonAge: moonAge, convert: convert, round: round, relations: relations
  };
});
