#!/usr/bin/env node
/* Bundle the whole instrument into one offline HTML file: dist/cosmic-chronicon.html
   Inlines the stylesheet, every script and every discovery file; the clock goes in as an iframe srcdoc. */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const safe = js => js.replace(/<\/script/gi, '<\\/script');

global.CC = {}; eval(read('discoveries/manifest.js'));
const files = global.CC.discoveryFiles || [];
const discoveries = files.map(f => safe(read('discoveries/' + f))).join('\n');

function inline(html) {
  html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) => '<style>\n' + read(href) + '\n</style>');
  html = html.replace('<script src="discoveries/manifest.js"></script>\n<script>CC.loadDiscoveries();</script>',
    '<script>\nCC.discoveryFiles = ' + JSON.stringify(files) + ';\n' + discoveries + '\n</script>');
  html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => '<script>\n' + safe(read(src)) + '\n</script>');
  return html;
}
const clock = inline(read('clock.html'));
let index = inline(read('index.html'));
const favicon = 'data:image/svg+xml,' + encodeURIComponent(read('favicon.svg'));
index = index.replace('href="favicon.svg"', 'href="' + favicon + '"');
/* the clock view loads clock.html; in the bundle it gets the inlined copy */
index = index.replace('<script>CC.app.start();</script>',
  '<script>CC.CLOCK_SRCDOC = ' + JSON.stringify(clock).replace(/<\/script/gi, '<\\/script') + ';</script>\n<script>CC.app.start();</script>');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/cosmic-chronicon.html'), index);
console.log('dist/cosmic-chronicon.html', (index.length / 1024).toFixed(0) + ' KB,', files.length, 'discoveries');
