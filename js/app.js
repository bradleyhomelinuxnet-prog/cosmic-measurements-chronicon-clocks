/* Cosmic Chronicon — the shell: routing, shared helpers, cross-links between views.
   Routes are hashes: #clock?y=-2238  #plates/upper-length  #book/sxiii  #discoveries/new
   © 2026 Bradley Rogue. All rights reserved. */
(function () {
  'use strict';
  var CC = window.CC;
  var core = CC.core;
  CC.views = CC.views || {};

  /* ---------- tiny DOM helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function h(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
  }
  function download(name, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(function () { toast('Copied'); });
    var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copied'); } catch (_) { toast('Select the text and copy it'); }
    ta.remove();
  }
  function fmtNum(n, dp) {
    if (n == null || isNaN(n)) return '—';
    return Number(core.round(n, dp == null ? 3 : dp)).toLocaleString('en-US', { maximumFractionDigits: dp == null ? 3 : dp });
  }
  function kindChip(k) { return '<span class="chip k-' + esc(k) + '">' + esc(CC.KINDS[k] || k) + '</span>'; }
  function tagChip(t) {
    var cls = /138/.test(t) ? 't138' : /19/.test(t) ? 't19' : /palindrome/.test(t) ? 'tpal' : '';
    return '<span class="chip ' + cls + '">' + esc(t) + '</span>';
  }
  function yearLabel(astro) { return core.fmtYear(astro) + ' · AM ' + core.am(astro); }
  function sectionById(id) { return (CC.book || []).find(function (c) { return c.id === id; }); }
  function sectionName(id) {
    var c = sectionById(id); if (!c) return '';
    return (c.label ? '§' + c.label + ' · ' : '') + c.title;
  }

  /* ---------- routing ---------- */
  var current = null;
  function parse() {
    var raw = location.hash.replace(/^#/, '') || 'clock';
    var q = {}, i = raw.indexOf('?');
    if (i >= 0) { raw.slice(i + 1).split('&').forEach(function (p) { var kv = p.split('='); q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); }); raw = raw.slice(0, i); }
    var parts = raw.split('/');
    return { view: parts[0], arg: parts.slice(1).join('/'), q: q };
  }
  function route() {
    var r = parse();
    var v = CC.views[r.view] ? r.view : 'clock';
    document.querySelectorAll('#tabs a').forEach(function (a) { a.classList.toggle('on', a.dataset.v === v); });
    var el = document.getElementById('view');
    if (current !== v || !CC.views[v].keep) {
      el.innerHTML = '';
      el.dataset.view = v;
      CC.views[v].render(el, r);
      if (current !== v) window.scrollTo(0, 0);
    } else if (CC.views[v].update) CC.views[v].update(el, r);
    current = v;
    document.title = (CC.views[v].title ? CC.views[v].title + ' · ' : '') + 'Cosmic Chronicon';
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

  /* Turn the clock to a year from anywhere in the app. */
  function gotoYear(astro, m, d) {
    CC.app.pendingYear = { astro: astro, m: m || 5, d: d || 1 };
    go('#clock?y=' + astro);
  }

  function nowLine() {
    var y = new Date().getFullYear();
    var p = core.cyclePosition(y, 'phoenix');
    document.getElementById('nowLine').innerHTML = 'Today <b>' + y + ' AD</b> · AM <b>' + core.am(y) + '</b> · next Phoenix node <b>' + core.fmtYear(p.next) + '</b>';
  }

  CC.app = {
    esc: esc, h: h, toast: toast, download: download, copy: copy, fmtNum: fmtNum,
    kindChip: kindChip, tagChip: tagChip, yearLabel: yearLabel, sectionById: sectionById, sectionName: sectionName,
    go: go, gotoYear: gotoYear, pendingYear: null,
    start: function () { nowLine(); window.addEventListener('hashchange', route); route(); }
  };
})();
