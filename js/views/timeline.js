/* View: the Timeline — every dated discovery on one line, the 138-year grid behind it,
   and the palindrome mirror folded around an axis (default AM 2760, the Axis Conjunct of 1135 BC). */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app, core = CC.core;
  var state = { grid: true, mirror: false, axisAM: 2760, tol: 25 };

  function draw(el) {
    var ds = CC.discoveries().filter(function (d) { return d.astro != null; });
    var min = Math.min.apply(null, ds.map(function (d) { return d.astro; }).concat([-4000])) - 150;
    var max = Math.max.apply(null, ds.map(function (d) { return d.astro; }).concat([2200])) + 100;
    var W = 1800, L = 40, R = W - 40, mid = 260, H = 520;
    function X(a) { return L + (a - min) / (max - min) * (R - L); }
    var p = [];
    if (state.grid) {
      for (var g = core.cyclePosition(min, 'phoenix').next; g <= max; g += 138) p.push('<line class="tl-grid" x1="' + X(g) + '" y1="40" x2="' + X(g) + '" y2="' + (H - 40) + '"/>');
    }
    p.push('<line class="tl-axis" x1="' + L + '" y1="' + mid + '" x2="' + R + '" y2="' + mid + '" stroke-width="1.5"/>');
    var step = (max - min) > 4000 ? 500 : 250;
    for (var t = Math.ceil(min / step) * step; t <= max; t += step) {
      p.push('<g class="tl-tick"><line class="tl-axis" x1="' + X(t) + '" y1="' + (mid - 5) + '" x2="' + X(t) + '" y2="' + (mid + 5) + '"/><text x="' + X(t) + '" y="' + (mid + 22) + '" text-anchor="middle">' + core.fmtYear(t) + '</text><text x="' + X(t) + '" y="' + (mid + 36) + '" text-anchor="middle" opacity=".6">AM ' + core.am(t) + '</text></g>');
    }
    var now = new Date().getFullYear();
    p.push('<line x1="' + X(now) + '" y1="60" x2="' + X(now) + '" y2="' + (H - 60) + '" stroke="#e8c770" stroke-width="1"/><text x="' + (X(now) + 4) + '" y="70" fill="#e8c770" style="font:11px IBM Plex Mono,monospace">TODAY</text>');
    var color = { key: '#e8c770', phoenix: '#d0573f', nemesis: '#9a7fd1', measurement: '#5fb8c2', cycle: '#8fb36a', ner: '#c9a54a', maya: '#5fb8c2', note: '#938c77' };
    var lanes = [[], [], [], [], []];
    ds.forEach(function (d, i) {
      var x = X(d.astro), above = i % 2 === 0, lane = 0;
      var row = lanes.map(function (l, k) { return k; }).find(function (k) { return lanes[k].every(function (o) { return Math.abs(o.x - x) > 120 || o.above !== above; }); });
      lane = row == null ? i % 5 : row; lanes[lane].push({ x: x, above: above });
      var ly = above ? mid - 30 - lane * 34 : mid + 56 + lane * 34;
      p.push('<g class="tl-dot" data-id="' + A.esc(d.id) + '" tabindex="0" role="button"><line x1="' + x + '" y1="' + mid + '" x2="' + x + '" y2="' + (above ? ly + 4 : ly - 14) + '" stroke="' + color[d.kind] + '" stroke-opacity=".5"/>' +
        '<circle cx="' + x + '" cy="' + mid + '" r="' + (d.kind === 'phoenix' ? 6 : 5) + '" fill="' + color[d.kind] + '"' + (d.origin === 'draft' ? ' stroke="#fff" stroke-dasharray="2 2"' : '') + '/>' +
        '<text x="' + x + '" y="' + ly + '" text-anchor="middle">' + A.esc(d.title.length > 28 ? d.title.slice(0, 27) + '…' : d.title) + '</text></g>');
    });
    if (state.mirror) {
      var axis = core.astroFromAM(state.axisAM);
      p.push('<line class="tl-axisline" x1="' + X(axis) + '" y1="40" x2="' + X(axis) + '" y2="' + (H - 40) + '"/><text x="' + (X(axis) + 5) + '" y="52" fill="#c9a54a" style="font:11px IBM Plex Mono,monospace">AXIS · AM ' + state.axisAM + '</text>');
      ds.forEach(function (d) {
        var m = core.mirror(d.astro, axis);
        if (m < min || m > max) return;
        p.push('<circle class="tl-mirror" cx="' + X(m) + '" cy="' + mid + '" r="9" stroke="' + color[d.kind] + '"/>');
      });
    }
    el.querySelector('#tlsvg').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Timeline of dated discoveries">' + p.join('') + '</svg>';
    el.querySelectorAll('.tl-dot').forEach(function (g) {
      function open() { showCard(el, g.dataset.id); }
      g.addEventListener('click', open);
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); });
    });
    el.querySelector('#pairs').innerHTML = state.mirror ? pairsTable(ds) : '';
  }

  function pairsTable(ds) {
    var axis = core.astroFromAM(state.axisAM);
    var rows = ds.filter(function (d) { return d.astro < axis; }).map(function (d) {
      var m = core.mirror(d.astro, axis), best = null;
      ds.forEach(function (o) { if (o.id !== d.id && (best == null || Math.abs(o.astro - m) < Math.abs(best.astro - m))) best = o; });
      var gap = best ? best.astro - m : null, hit = gap != null && Math.abs(gap) <= state.tol;
      return '<tr><td>' + A.esc(d.title) + '<div class="muted mono" style="font-size:12px">' + A.yearLabel(d.astro) + '</div></td>' +
        '<td class="mono">' + A.yearLabel(m) + '</td><td>' + (best ? A.esc(best.title) + '<div class="muted mono" style="font-size:12px">' + A.yearLabel(best.astro) + '</div>' : '—') + '</td>' +
        '<td class="mono">' + (gap == null ? '—' : (gap > 0 ? '+' : '') + gap + ' yr') + '</td><td><span class="verdict ' + (hit ? 'hold' : 'miss') + '">' + (hit ? 'within ' + state.tol : 'no match') + '</span></td></tr>';
    }).join('');
    return '<div class="panel" style="margin-top:18px"><div class="kicker">The fold · each event before the axis, reflected</div><div class="table-scroll"><table class="pairs"><thead><tr><th>Before the axis</th><th>Its mirror year</th><th>Nearest recorded event</th><th>Gap</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="empty">Nothing dated before the axis yet.</td></tr>') + '</tbody></table></div>' +
      '<p class="muted" style="font-size:14px;margin:10px 0 0">A pair counts when the nearest recorded event falls within ' + state.tol + ' years of the reflection. Add discoveries and the fold re-tests itself.</p></div>';
  }

  function showCard(el, id) {
    var d = CC.discoveries().find(function (x) { return x.id === id; }); if (!d) return;
    var sec = A.sectionById(d.section);
    el.querySelector('#tlcard').innerHTML = '<div class="disc k-' + d.kind + '"><div class="when">' + A.yearLabel(d.astro) + '</div><h3>' + A.esc(d.title) + '</h3>' +
      (d.summary ? '<p>' + A.esc(d.summary) + '</p>' : '') + '<div class="meta">' + A.kindChip(d.kind) + d.tags.map(A.tagChip).join('') + '</div>' +
      '<div class="acts"><button class="btn gold" data-y="' + d.astro + '">Turn the clock to ' + A.esc(core.fmtYear(d.astro)) + '</button>' +
      (sec ? '<a class="btn" href="#book/' + sec.id + '">' + A.esc(sec.label ? '§' + sec.label : sec.title) + '</a>' : '') +
      '<a class="btn" href="#discoveries/' + A.esc(d.id) + '">Open</a></div></div>';
    el.querySelector('#tlcard [data-y]').addEventListener('click', function () { A.gotoYear(d.astro, d.month, d.day); });
  }

  CC.views.timeline = {
    title: 'Timeline',
    render: function (el) {
      el.appendChild(A.h('<div class="view-head"><h1>The Timeline</h1><p>Every dated discovery on one line. Faint red rules mark the 138-year Phoenix grid; the fold tests the palindrome.</p></div>' +
        '<div class="filters"><button class="btn' + (state.grid ? ' on' : '') + '" id="tgGrid">138-yr grid</button><button class="btn' + (state.mirror ? ' on' : '') + '" id="tgMirror">Fold at the axis</button>' +
        '<div class="field" style="width:130px"><label for="axisAM">Axis (AM)</label><input id="axisAM" type="number" value="' + state.axisAM + '"></div>' +
        '<div class="field" style="width:130px"><label for="tol">Match within (yr)</label><input id="tol" type="number" min="0" value="' + state.tol + '"></div>' +
        '<a class="btn gold" href="#discoveries/new">Add a discovery</a></div>' +
        '<div class="tl-wrap" id="tlsvg"></div><div id="tlcard" style="margin-top:14px"></div><div id="pairs"></div>'));
      el.querySelector('#tgGrid').addEventListener('click', function (e) { state.grid = !state.grid; e.target.classList.toggle('on', state.grid); draw(el); });
      el.querySelector('#tgMirror').addEventListener('click', function (e) { state.mirror = !state.mirror; e.target.classList.toggle('on', state.mirror); draw(el); });
      el.querySelector('#axisAM').addEventListener('input', function (e) { var v = parseInt(e.target.value, 10); if (!isNaN(v)) { state.axisAM = v; draw(el); } });
      el.querySelector('#tol').addEventListener('input', function (e) { var v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= 0) { state.tol = v; draw(el); } });
      draw(el);
    }
  };
})();
