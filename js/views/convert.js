/* View: the Converter — inches, feet, metres, centimetres and royal cubits, with the working shown. */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app, core = CC.core;
  var CUBIT = (CC.petrie.features.find(function (f) { return f.id === 'cubit'; }) || { value: 20.62 }).value;

  function working(v, from, to) {
    var inches = core.convert(v, from, 'in'), out = core.convert(v, from, to), steps = [];
    if (from !== 'in') steps.push(A.fmtNum(v, 4) + ' ' + from + ' = ' + A.fmtNum(inches, 4) + ' in');
    if (to === 'cubit') steps.push(A.fmtNum(inches, 4) + ' in ÷ ' + CUBIT + ' in per cubit');
    else if (to === 'm') steps.push(A.fmtNum(inches, 4) + ' in × 0.0254 m per inch');
    else if (to === 'cm') steps.push(A.fmtNum(inches, 4) + ' in × 2.54 cm per inch');
    else if (to === 'ft') steps.push(A.fmtNum(inches, 4) + ' in ÷ 12 in per foot');
    return { out: out, steps: steps.join(' → ') };
  }

  function table(v, u) {
    return '<table class="conv-table">' + Object.keys(core.UNITS).map(function (k) {
      if (k === u) return '';
      var w = working(v, u, k);
      return '<tr><td>' + core.UNITS[k].name + '<div class="muted" style="font-size:12px">' + A.esc(w.steps) + '</div></td><td>' + A.fmtNum(w.out, 4) + '</td></tr>';
    }).join('') + '</table><div style="margin-top:10px">' + core.relations(Math.round(v)).map(A.tagChip).join(' ') + '</div>';
  }

  CC.views.convert = {
    title: 'Converter',
    render: function (el, r) {
      var v = r.q.v != null && !isNaN(+r.q.v) ? +r.q.v : 20.62, u = core.UNITS[r.q.u] ? r.q.u : 'in';
      var presets = CC.petrie.features.filter(function (f) { return core.UNITS[f.unit]; });
      el.appendChild(A.h('<div class="view-head"><h1>The Converter</h1><p>One royal cubit is ' + CUBIT + ' inches (Petrie). Every result shows how it was reached.</p></div>' +
        '<div class="plates"><div class="panel"><div class="row"><div class="field" style="flex:2 1 160px"><label for="cv">Value</label><input id="cv" type="number" step="any" value="' + v + '"></div>' +
        '<div class="field" style="flex:1 1 120px"><label for="cu">Unit</label><select id="cu">' + Object.keys(core.UNITS).map(function (k) { return '<option value="' + k + '"' + (k === u ? ' selected' : '') + '>' + core.UNITS[k].name + '</option>'; }).join('') + '</select></div></div>' +
        '<div id="cout" style="margin-top:14px"></div></div>' +
        '<div class="panel"><div class="kicker">From the plates</div>' + presets.map(function (f) { return '<button class="btn" style="margin:6px 6px 0 0" data-v="' + f.value + '" data-u="' + f.unit + '">' + A.esc(f.name) + '</button>'; }).join('') + '</div></div>'));
      var iv = el.querySelector('#cv'), iu = el.querySelector('#cu');
      function upd() { var x = parseFloat(iv.value); el.querySelector('#cout').innerHTML = isNaN(x) ? '<div class="empty">Enter a number.</div>' : table(x, iu.value); }
      iv.addEventListener('input', upd); iu.addEventListener('change', upd);
      el.querySelectorAll('[data-v]').forEach(function (b) { b.addEventListener('click', function () { iv.value = b.dataset.v; iu.value = b.dataset.u; upd(); }); });
      upd();
    }
  };
})();
