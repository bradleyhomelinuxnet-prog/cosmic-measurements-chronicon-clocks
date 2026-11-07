#!/usr/bin/env node
/* Rebuild data/book.js from the manuscript.
     pandoc Manuscript.docx -t html --wrap=none -o book.html
     node tools/generators/book-from-manuscript.js book.html data/book.js
   Splits the manuscript at its top-level headings, files each part under its arc
   (overture, front matter, prologue, sections I–XIX, back matter, appendices),
   drops images, and applies the corrections listed below. */
'use strict';
const fs = require('fs');
const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('usage: node book-from-manuscript.js book.html data/book.js'); process.exit(1); }

/* Corrections made in the app's copy of the text. Keep in step with the manuscript. */
const CORRECTIONS = [
  ['equals 3.14159—π to five decimal places', 'equals 3.14—π to two decimal places'],
  ['equals 3.14159—pi to five decimal places', 'equals 3.14—pi to two decimal places'],
  ['yields pi (3.14159…)', 'yields pi (3.14)'],
  ['(11,552 inches) = 3.14159.', '(11,552 inches) = 3.14.'],
  ['measured 0.5236 meters—exactly π/6', 'measured 0.523 meters—π/6 to three decimal places'],
  ['measures exactly π/6 meters (0.5236 meters)', 'measures π/6 meters to three decimal places (0.523 meters)'],
  ['a cubit of precisely 0.5235 meters', 'a cubit of 0.523 meters'],
  ['The value 0.5235 meters approximates', 'The value 0.523 meters approximates'],
  ['Divided by six: 0.5236—remarkably', 'Divided by six: 0.523…—remarkably'],
  ['20.620 inches = 0.5236m = pi/6', '20.620 inches = 0.523m ≈ pi/6'],
  ['20.620 inches = 0.5236m approximately equals pi/6', '20.620 inches = 0.523m approximately equals pi/6'],
  [' The height of 230.09 inches creates proportions that encode pi: floor perimeter divided by twice the height yields 3.14159…', ''],
  ['approximately 11.18 cubits—dimensions that encode pi when ratios are calculated.', 'approximately 11.16 cubits.'],
  [' The height of 230.09 inches creates a room whose proportions encode π when combined with the perimeter.', ''],
  ['Upper Chamber proportions encode pi;', 'Upper Chamber proportions hold a 2:1 ratio;'],
  ['Height: 230.09 inches — encodes pi', 'Height: 230.09 inches — 11.16 cubits'],
  ['© 2026 Bradley Rogue / Hollywood Rogue Ventures LLC', '© 2026 Bradley Rogue']
];

const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX'];
const MINOR = new Set(['a', 'an', 'and', 'of', 'the', 'in', 'to', 'on', 'for', 'at', 'by', 'or', '&']);
const FRONT = new Set(['copyright', 'dedication', 'epigraphs', 'acknowledgments', 'author’s note on methodology']);
const PROLOGUE = new Set(['prologue', 'the ancient sites', 'the uncertain timeline of ancient egypt', 'the missing construction records', 'consulting modern construction experts']);

function unescape(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1));
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[e.toLowerCase()];
  });
}
const text = x => unescape(x.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
function titleCase(t) {
  if (t !== t.toUpperCase()) return t;
  const out = [];
  t.split(' ').forEach((w, i) => {
    if (/^([IVXLC]+[:.,]?|\d[\d,.]*[A-Z]*:?|(AD|BC|GP)[:.,]?)$/.test(w)) { out.push(w); return; }
    const lw = w.toLowerCase();
    out.push(i > 0 && MINOR.has(lw) && !out[out.length - 1].endsWith(':') ? lw : lw.charAt(0).toUpperCase() + lw.slice(1));
  });
  return out.join(' ');
}

let s = fs.readFileSync(src, 'utf8');
for (const [a, b] of CORRECTIONS) s = s.split(a).join(b);
s = s.replace(/<figure[\s\S]*?<\/figure>/g, '').replace(/<img[^>]*>/g, '')
  .replace(/<p>\s*\[\]\s*<\/p>/g, '').replace(/<p>\s*<\/p>/g, '');

const chapters = [];
let cur = null;
for (const part of s.split(/(<h1[^>]*>[\s\S]*?<\/h1>)/)) {
  const m = /^<h1[^>]*>([\s\S]*?)<\/h1>$/.exec(part);
  if (m) { cur = { h1: text(m[1]), body: '' }; chapters.push(cur); }
  else if (cur) cur.body += part;
}

const res = [];
let arc = 'front';
for (const c of chapters) {
  const t = c.h1;
  let b = c.body.trim();
  const tl = t.toLowerCase().replace(/^[∞ ]+|[∞ ]+$/g, '');
  if (['contents', '', 'section'].includes(tl)) continue;
  let label = '', title = titleCase(t);
  const sec = /^∞?\s*SECTION\s+([IVX]+)\s*∞?$/.exec(t);
  if (sec) {
    label = sec[1];
    const h2 = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(b);
    if (h2) { title = titleCase(text(h2[1])); b = b.replace(h2[0], ''); }
    const n = ROM.indexOf(label) + 1;
    arc = n < 10 ? 'ascending' : n === 10 ? 'axis' : 'descending';
  } else {
    if (tl === 'overture') arc = 'overture';
    else if (FRONT.has(tl)) arc = 'front';
    else if (PROLOGUE.has(tl)) arc = 'prologue';
    else if (tl.startsWith('appendix') || tl === 'appendices') arc = 'appendix';
    else if (arc === 'descending' || arc === 'back') arc = 'back';
    const h2 = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(b);
    if (h2 && ['overture', 'prologue', 'appendices'].includes(tl)) { title = title + ' — ' + titleCase(text(h2[1])); b = b.replace(h2[0], ''); }
  }
  b = b.replace(/<h2/g, '<h3').replace(/<\/h2>/g, '</h3>').replace(/ id="[^"]*"/g, '');
  if (text(b).length < 20) continue;
  let id = label ? 's' + label.toLowerCase() : tl.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const baseId = id; let k = 2;
  while (res.some(r => r.id === id)) id = baseId + '-' + (k++);
  res.push({ id, label, title: title.replace(/^[∞ ]+|[∞ ]+$/g, ''), arc, html: b });
}

fs.writeFileSync(out, '/* Generated from the Cosmic Measurements manuscript by tools/generators/book-from-manuscript.js. © 2026 Bradley Rogue. All rights reserved. */\n' +
  'window.CC = window.CC || {};\nCC.book = ' + JSON.stringify(res, null, 0).replace(/\},\{/g, '},\n{') + ';\n');
console.log(res.length + ' parts, ' + res.filter(r => r.label).length + ' numbered sections → ' + out);
