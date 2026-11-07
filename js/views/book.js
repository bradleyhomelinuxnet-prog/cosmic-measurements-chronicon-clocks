/* View: The Book — Cosmic Measurements, section by section.
   Dates in the text turn the clock; measurements open the plates; each section names its mirror. */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app, core = CC.core;
  var ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX'];
  var ARCS = [['overture', 'Overture'], ['front', 'Front matter'], ['prologue', 'Prologue'], ['ascending', 'The Ascending Arc · I → IX'], ['axis', 'The Axis · X'], ['descending', 'The Descending Arc · XI → XIX'], ['back', 'Back matter'], ['appendix', 'Appendices']];
  var YEAR_RE = /\b(\d{1,2},\d{3}|\d{1,4})\s?(BC|BCE|AD|CE)\b|\bAM\s?(\d{1,2},?\d{3})\b/g;
  var MEAS_RE = /\b(\d{1,2},\d{3}(?:\.\d+)?|\d+(?:\.\d+)?)\s?(inches|inch|feet|foot|cubits)\b/g;

  function featureFor(value, unit) {
    var u = /inch/.test(unit) ? 'in' : /fe|foot/.test(unit) ? 'ft' : 'cubit';
    return CC.petrie.features.find(function (f) {
      if (f.unit === u) return Math.abs(f.value - value) < 0.051;
      if (u === 'cubit' && f.unit === 'in') return Math.abs(f.value / CC.petrie.features.find(function (x) { return x.id === 'cubit'; }).value - value) < 0.15;
      return false;
    });
  }

  function linkify(root, hl) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var hlRe = hl ? new RegExp('(^|[^\\d.,])(' + hl.replace(/[^\d]/g, '') + ')(?![\\d]|,\\d)', 'g') : null;
    nodes.forEach(function (tn) {
      var t = tn.nodeValue; if (!/\d/.test(t)) return;
      var html = A.esc(t);
      html = html.replace(MEAS_RE, function (m, num, unit) {
        var v = parseFloat(num.replace(/,/g, '')), f = featureFor(v, unit);
        var u = /inch/.test(unit) ? 'in' : /fe|foot/.test(unit) ? 'ft' : 'cubit';
        return '<a class="ms" href="' + (f ? '#plates/' + f.id : '#convert?v=' + v + '&u=' + u) + '" title="' + (f ? A.esc(f.name) : 'Convert') + '">' + m + '</a>';
      });
      html = html.replace(YEAR_RE, function (m, y, era, amy) {
        if (/class="ms"/.test(m)) return m;
        var astro = amy ? core.astroFromAM(+amy.replace(/,/g, '')) : core.astroFromHuman(+y.replace(/,/g, ''), era);
        return '<a class="yr" data-y="' + astro + '" title="' + A.esc(A.yearLabel(astro)) + ' — turn the clock">' + m + '</a>';
      });
      if (hlRe) html = html.replace(/(<a[^>]*>)|([^<]+)/g, function (m, tag, txt) { return tag ? m : txt.replace(hlRe, '$1<mark>$2</mark>'); });
      if (html === A.esc(t)) return;
      var span = document.createElement('span'); span.innerHTML = html; tn.parentNode.replaceChild(span, tn);
    });
  }

  function tocHTML(cur) {
    return ARCS.map(function (a) {
      var items = CC.book.filter(function (c) { return c.arc === a[0]; });
      if (!items.length) return '';
      return '<h4>' + a[1] + '</h4>' + items.map(function (c) {
        return '<a href="#book/' + c.id + '"' + (c.id === cur ? ' class="on" aria-current="page"' : '') + '><span class="n">' + (c.label || '·') + '</span><span>' + A.esc(c.title) + '</span></a>';
      }).join('');
    }).join('');
  }

  CC.views.book = {
    title: 'The Book',
    render: function (el, r) {
      if (!CC.book || !CC.book.length) { el.innerHTML = '<p class="empty">The book file (data/book.js) is missing.</p>'; return; }
      var i = Math.max(0, CC.book.findIndex(function (c) { return c.id === r.arg; }));
      if (!r.arg) i = Math.max(0, CC.book.findIndex(function (c) { return c.id === 'si'; }));
      var c = CC.book[i], prev = CC.book[i - 1], next = CC.book[i + 1];
      var mirror = '';
      if (c.label) {
        var k = ROM.indexOf(c.label) + 1, mk = 20 - k;
        mirror = k === 10 ? '<div class="mirror-note">∞ The axis. Sections I–IX ascend to here; XI–XIX descend from it.</div>'
          : '<div class="mirror-note">Section ' + c.label + ' mirrors <a href="#book/s' + ROM[mk - 1].toLowerCase() + '">Section ' + ROM[mk - 1] + ' · ' + A.esc((A.sectionById('s' + ROM[mk - 1].toLowerCase()) || {}).title || '') + '</a> across the axis — ' + k + ' + ' + mk + ' = 20.</div>';
      }
      var ds = CC.discoveries().filter(function (d) { return d.section === c.id; });
      var arcName = (ARCS.find(function (a) { return a[0] === c.arc; }) || ['', ''])[1];
      var wide = !window.matchMedia || window.matchMedia('(min-width: 901px)').matches;
      el.appendChild(A.h('<div class="book"><details class="tocbox"' + (wide ? ' open' : '') + '><summary>Contents · ' + A.esc(c.label ? '§' + c.label + ' ' : '') + A.esc(c.title) + '</summary><nav class="toc" aria-label="Contents">' + tocHTML(c.id) + '</nav></details>' +
        '<article class="reader"><div class="arc">' + A.esc(arcName) + '</div><h2>' + (c.label ? c.label + ' · ' : '') + A.esc(c.title) + '</h2>' + mirror +
        '<div id="btext">' + c.html + '</div>' +
        (ds.length ? '<div class="panel" style="margin-top:26px"><div class="kicker">Discoveries tied to this section</div>' + ds.map(function (d) { return '<div style="margin-top:6px"><a href="#discoveries/' + A.esc(d.id) + '">' + A.esc(d.title) + '</a>' + (d.astro != null ? ' <span class="muted mono" style="font-size:12px">' + A.yearLabel(d.astro) + '</span>' : '') + '</div>'; }).join('') + '</div>' : '') +
        '<div class="row" style="margin-top:14px"><a class="btn gold" href="#discoveries/new?section=' + c.id + '">Add a discovery from this section</a></div>' +
        '<div class="pager">' + (prev ? '<a class="btn" href="#book/' + prev.id + '">← ' + A.esc(prev.label || prev.title.slice(0, 30)) + '</a>' : '<span></span>') + (next ? '<a class="btn" href="#book/' + next.id + '">' + A.esc(next.label || next.title.slice(0, 30)) + ' →</a>' : '') + '</div></article></div>'));
      linkify(el.querySelector('#btext'), r.q.hl);
      el.querySelectorAll('a.yr').forEach(function (a) { a.href = '#clock?y=' + a.dataset.y; });
      var on = el.querySelector('.toc a.on'); if (on && wide) { var tc = el.querySelector('.toc'); tc.scrollTop = on.offsetTop - tc.clientHeight / 3; }
      if (r.q.hl) setTimeout(function () { var m = el.querySelector('mark'); if (m) m.scrollIntoView({ block: 'center' }); }, 60);
    }
  };
})();
