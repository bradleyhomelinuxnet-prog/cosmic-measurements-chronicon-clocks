/* View: 19 · 138 — every appearance of the two numbers across the book, the measurements and the discoveries,
   plus every multiple of 138 the text names. Rebuilt from the data each time it opens. */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app, core = CC.core;
  var cache = null;
  var NUM = /(^|[^\d.,])(\d{1,3}(?:,\d{3})+|\d+)(?![\d]|[.,]\d)/g;

  function plain(html) { var d = document.createElement('div'); d.innerHTML = html; return (d.textContent || '').replace(/\s+/g, ' '); }

  function build() {
    var hits = { '138': [], '19': [] }, multiples = {}, perChapter = [];
    CC.book.forEach(function (c) {
      var t = plain(c.html), m, counts = { '138': 0, '19': 0 }, snippets = [];
      NUM.lastIndex = 0;
      while ((m = NUM.exec(t))) {
        var s = m[2], v = parseInt(s.replace(/,/g, ''), 10), at = m.index + m[1].length;
        if (v === 138 || v === 19) {
          counts[v]++;
          if (snippets.length < 3) snippets.push({ n: v, text: t.slice(Math.max(0, at - 90), at) + '\u0000' + s + '\u0001' + t.slice(at + s.length, at + s.length + 90) });
        } else if (v >= 276 && v % 138 === 0) {
          (multiples[v] = multiples[v] || { v: v, k: v / 138, where: [] }).where.indexOf(c.id) < 0 && multiples[v].where.push(c.id);
        }
      }
      hits['138'].push(counts['138']); hits['19'].push(counts['19']);
      if (counts['138'] || counts['19']) perChapter.push({ c: c, counts: counts, snippets: snippets });
    });
    return {
      total138: hits['138'].reduce(function (a, b) { return a + b; }, 0),
      total19: hits['19'].reduce(function (a, b) { return a + b; }, 0),
      perChapter: perChapter,
      multiples: Object.keys(multiples).map(function (k) { return multiples[k]; }).sort(function (a, b) { return a.v - b.v; })
    };
  }

  function snip(s) {
    return '…' + A.esc(s.text).replace('\u0000', '<b class="' + (s.n === 19 ? 'n19' : '') + '">').replace('\u0001', '</b>') + '…';
  }

  CC.views.index = {
    title: '19 · 138',
    render: function (el) {
      cache = cache || build();
      var I = cache;
      var meas = CC.petrie.features.filter(function (f) { return core.relations(Math.round(f.value)).some(function (t) { return /138|19/.test(t); }); });
      var disc = CC.discoveries().filter(function (d) { return d.tags.some(function (t) { return /138|19/.test(t); }); });
      el.appendChild(A.h('<div class="view-head"><h1>19 · 138</h1><p>Where the two numbers turn up — counted from the text itself, the measurement table and the discovery files.</p></div>' +
        '<div class="idx-grid">' +
        '<div class="stat"><div class="kicker">138 in the book</div><div class="big red">' + I.total138 + '</div><div class="muted">times, across ' + I.perChapter.filter(function (p) { return p.counts['138']; }).length + ' sections</div></div>' +
        '<div class="stat"><div class="kicker">19 in the book</div><div class="big cyan">' + I.total19 + '</div><div class="muted">times, across ' + I.perChapter.filter(function (p) { return p.counts['19']; }).length + ' sections</div></div>' +
        '<div class="stat"><div class="kicker">Multiples of 138 named</div><div class="big">' + I.multiples.length + '</div><div class="muted">distinct numbers, from 276 up</div></div>' +
        '<div class="stat"><div class="kicker">Discoveries on a 19 or 138</div><div class="big">' + disc.length + '</div><div class="muted">of ' + CC.discoveries().length + '</div></div></div>' +
        '<div class="panel" style="margin-top:18px"><div class="kicker">Multiples of 138 in the text</div><div class="table-scroll"><table class="pairs"><thead><tr><th>Number</th><th>138 ×</th><th>As a year (AM)</th><th>Sections</th></tr></thead><tbody>' +
        I.multiples.map(function (m) {
          var astro = core.astroFromAM(m.v), asYear = m.v <= 7000 ? A.esc(core.fmtYear(astro)) : '—';
          return '<tr><td class="mono">' + m.v.toLocaleString('en-US') + '</td><td class="mono">' + m.k + '</td><td class="mono">' + (m.v <= 7000 ? '<a href="#clock?y=' + astro + '">' + asYear + '</a>' : '—') + '</td><td>' +
            m.where.map(function (id) { var c = A.sectionById(id); return '<a href="#book/' + id + '">' + A.esc(c.label ? '§' + c.label : c.title) + '</a>'; }).join(', ') + '</td></tr>';
        }).join('') + '</tbody></table></div></div>' +
        '<div class="panel" style="margin-top:18px"><div class="kicker">In the measurements</div>' +
        (meas.length ? meas.map(function (f) { return '<div style="margin-top:6px"><a href="#plates/' + f.id + '">' + A.esc(f.name) + '</a> <span class="mono muted">' + A.fmtNum(f.value) + ' ' + f.unit + '</span> ' + core.relations(Math.round(f.value)).map(A.tagChip).join(' ') + '</div>'; }).join('') : '<div class="empty">None yet.</div>') + '</div>' +
        '<h2 class="kicker" style="margin:26px 0 0">Section by section</h2><div class="hits">' +
        I.perChapter.map(function (p) {
          return '<div class="hit"><div class="where"><a href="#book/' + p.c.id + '?hl=' + (p.counts['138'] ? 138 : 19) + '">' + A.esc((p.c.label ? '§' + p.c.label + ' · ' : '') + p.c.title) + '</a> · 138 × ' + p.counts['138'] + ' · 19 × ' + p.counts['19'] + '</div>' +
            p.snippets.map(function (s) { return '<div style="margin-top:4px">' + snip(s) + '</div>'; }).join('') + '</div>';
        }).join('') + '</div>'));
    }
  };
})();
