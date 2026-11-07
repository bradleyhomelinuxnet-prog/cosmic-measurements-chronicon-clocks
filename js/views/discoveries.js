/* View: Discoveries — browse every finding, and add new ones.
   A new discovery is saved as a draft in this browser at once (it shows on the clock, timeline,
   plates and index straight away). Export writes the file to commit into discoveries/. */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app, core = CC.core;
  var filt = { q: '', kind: '', tag: '' };

  function slug(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 60); }

  function listHTML(sel) {
    var ds = CC.discoveries().filter(function (d) {
      if (filt.kind && d.kind !== filt.kind) return false;
      if (filt.tag && d.tags.indexOf(filt.tag) < 0) return false;
      if (filt.q) { var hay = (d.title + ' ' + (d.summary || '') + ' ' + (d.notes || '') + ' ' + (d.when || '')).toLowerCase(); if (hay.indexOf(filt.q.toLowerCase()) < 0) return false; }
      return true;
    });
    if (!ds.length) return '<div class="empty">No discoveries match.</div>';
    return ds.map(function (d) {
      var sec = A.sectionById(d.section), m = d.measurement;
      return '<article class="disc k-' + d.kind + '" id="d-' + A.esc(d.id) + '"' + (d.id === sel ? ' style="outline:1px solid var(--gold)"' : '') + '>' +
        (d.astro != null ? '<div class="when">' + A.yearLabel(d.astro) + (d.month ? ' · ' + d.month + '/' + (d.day || 1) : '') + '</div>' : '') +
        '<h3>' + A.esc(d.title) + '</h3>' + (d.summary ? '<p>' + A.esc(d.summary) + '</p>' : '') + (d.notes ? '<p class="muted">' + A.esc(d.notes) + '</p>' : '') +
        (m ? '<p class="mono" style="font-size:13px;color:var(--cyan)">' + A.esc(m.value) + ' ' + A.esc(m.unit) + (m.feature && CC.petrie.features.some(function (f) { return f.id === m.feature; }) ? ' · ' + A.esc(CC.petrie.features.find(function (f) { return f.id === m.feature; }).name) : '') + '</p>' : '') +
        '<div class="meta">' + (d.origin === 'draft' ? '<span class="chip draft">draft · not committed</span>' : '') + A.kindChip(d.kind) + d.tags.map(A.tagChip).join('') + '</div>' +
        (d.source ? '<div class="src">' + A.esc(d.source) + '</div>' : '') +
        '<div class="acts">' + (d.astro != null ? '<button class="btn gold" data-go="' + d.astro + '" data-m="' + (d.month || '') + '" data-d="' + (d.day || '') + '">Clock</button>' : '') +
        (m && m.feature ? '<a class="btn" href="#plates/' + A.esc(m.feature) + '">Plate</a>' : '') +
        (sec ? '<a class="btn" href="#book/' + sec.id + '">' + A.esc(sec.label ? '§' + sec.label : 'Book') + '</a>' : '') +
        '<button class="btn" data-edit="' + A.esc(d.id) + '">' + (d.origin === 'draft' ? 'Edit draft' : 'Edit') + '</button></div></article>';
    }).join('');
  }

  function formHTML() {
    var feats = CC.petrie.features.map(function (f) { return '<option value="' + f.id + '">' + A.esc(f.group + ' · ' + f.name) + '</option>'; }).join('');
    var secs = (CC.book || []).map(function (c) { return '<option value="' + c.id + '">' + A.esc((c.label ? '§' + c.label + ' · ' : '') + c.title) + '</option>'; }).join('');
    var kinds = Object.keys(CC.KINDS).map(function (k) { return '<option value="' + k + '">' + CC.KINDS[k] + '</option>'; }).join('');
    return '<form class="panel form" id="dform" autocomplete="off"><h2 id="fTitle">New discovery</h2>' +
      '<div class="field"><label for="f-title">Title</label><input id="f-title" required placeholder="What you found"></div>' +
      '<div class="row"><div class="field" style="flex:2 1 130px"><label for="f-when">Year</label><input id="f-when" placeholder="2040 AD · 2239 BC · AM 5934"></div>' +
      '<div class="field" style="flex:1 1 60px"><label for="f-month">Month</label><input id="f-month" type="number" min="1" max="12"></div>' +
      '<div class="field" style="flex:1 1 60px"><label for="f-day">Day</label><input id="f-day" type="number" min="1" max="31"></div></div>' +
      '<div class="field"><label for="f-kind">Kind</label><select id="f-kind">' + kinds + '</select></div>' +
      '<div class="field"><label for="f-summary">In one line</label><input id="f-summary" placeholder="The finding, in your words"></div>' +
      '<div class="field"><label for="f-notes">Notes</label><textarea id="f-notes" placeholder="Working, reasoning, what to check next"></textarea></div>' +
      '<div class="row"><div class="field" style="flex:2 1 160px"><label for="f-feature">Measurement of</label><select id="f-feature"><option value="">— none —</option>' + feats + '</select></div>' +
      '<div class="field" style="flex:1 1 70px"><label for="f-mval">Value</label><input id="f-mval" type="number" step="any"></div>' +
      '<div class="field" style="flex:1 1 70px"><label for="f-munit">Unit</label><select id="f-munit"><option>in</option><option>ft</option><option>m</option><option>cm</option><option>cubit</option><option>deg</option><option>count</option></select></div></div>' +
      '<div class="field"><label for="f-section">Book section</label><select id="f-section"><option value="">— none —</option>' + secs + '</select></div>' +
      '<div class="field"><label for="f-tags">Your own tags</label><input id="f-tags" placeholder="comma, separated"></div>' +
      '<div class="field"><label for="f-source">Source</label><input id="f-source" placeholder="Where this comes from"></div>' +
      '<div class="field"><label for="f-id">File name</label><input id="f-id" placeholder="made from the title"></div>' +
      '<div><div class="kicker" style="margin-bottom:6px">Found automatically</div><div class="preview-tags" id="fTags"></div></div>' +
      '<div class="row"><button class="btn gold" type="submit">Save draft</button><button class="btn" type="button" id="fExport">Export file</button><button class="btn" type="button" id="fManifest">Export manifest</button><button class="btn" type="button" id="fCopy">Copy</button><button class="btn" type="button" id="fClear">Clear</button><button class="btn" type="button" id="fDel" hidden>Delete draft</button></div>' +
      '<pre class="code" id="fCode"></pre>' +
      '<p class="muted" style="font-size:14px;margin:0">To make it permanent: export the file and the manifest, put both in the <code>discoveries</code> folder (the manifest replaces the old one), and commit. Drafts stay in this browser only.</p></form>';
  }

  function readForm(el) {
    function v(id) { return el.querySelector('#f-' + id).value.trim(); }
    var d = { title: v('title'), when: v('when'), kind: v('kind'), summary: v('summary'), notes: v('notes'), section: v('section'), source: v('source') };
    if (v('month')) d.month = +v('month'); if (v('day')) d.day = +v('day');
    var tags = v('tags'); d.tags = tags ? tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean) : [];
    if (v('feature') || v('mval')) d.measurement = { feature: v('feature') || undefined, value: v('mval') === '' ? undefined : +v('mval'), unit: v('munit') };
    d.id = v('id') || slug(d.title + (d.when ? '-' + d.when : ''));
    d.added = new Date().toISOString().slice(0, 10);
    return d;
  }
  function fillForm(el, d) {
    function s(id, val) { el.querySelector('#f-' + id).value = val == null ? '' : val; }
    s('title', d.title); s('when', d.when); s('month', d.month); s('day', d.day); s('kind', d.kind || 'note'); s('summary', d.summary); s('notes', d.notes);
    s('feature', d.measurement && d.measurement.feature); s('mval', d.measurement && d.measurement.value); s('munit', (d.measurement && d.measurement.unit) || 'in');
    s('section', d.section); s('tags', (d.tags || []).filter(function (t) { return core.tagsForYear(0).indexOf(t) < 0 && !/^(138|19|AM×138|AM×19|Nemesis|NER|palindrome.*|\d+ × \d+.*)$/.test(t); }).join(', '));
    s('source', d.source); s('id', d.id);
  }
  function preview(el) {
    var d = readForm(el), tags = [], warn = '';
    if (d.when) {
      var a = core.parseYear(d.when);
      if (isNaN(a)) warn = '<span class="chip" style="color:var(--red)">year not understood — try 2040 AD, 2239 BC or AM 5934</span>';
      else { tags.push(A.yearLabel(a)); tags = tags.concat(core.tagsForYear(a)); }
    }
    if (d.measurement && d.measurement.value != null) tags = tags.concat(core.relations(Math.round(d.measurement.value)));
    el.querySelector('#fTags').innerHTML = warn + tags.map(A.tagChip).join('') || '<span class="muted" style="font-size:14px">Year and measurement tags appear here.</span>';
    el.querySelector('#fCode').textContent = d.title ? CC.discoveryFileText(d) : '';
    el.querySelector('#fDel').hidden = !CC.drafts.all().some(function (x) { return x.id === d.id; });
    return d;
  }
  function manifestWith(id) {
    var files = (CC.discoveryFiles || []).slice(), fn = id + '.js';
    CC.drafts.all().forEach(function (x) { var f = x.id + '.js'; if (files.indexOf(f) < 0) files.push(f); });
    if (files.indexOf(fn) < 0) files.push(fn);
    return CC.manifestText(files);
  }

  function refresh(el, sel) {
    el.querySelector('#dlist').innerHTML = listHTML(sel);
    el.querySelectorAll('[data-go]').forEach(function (b) { b.addEventListener('click', function () { A.gotoYear(+b.dataset.go, +b.dataset.m || 5, +b.dataset.d || 1); }); });
    el.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = CC.discoveries().find(function (x) { return x.id === b.dataset.edit; });
        fillForm(el, d); el.querySelector('#fTitle').textContent = d.origin === 'draft' ? 'Edit draft' : 'Edit · saves as a draft until committed';
        preview(el); el.querySelector('#dform').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  CC.views.discoveries = {
    title: 'Discoveries',
    render: function (el, r) {
      var tags = {}; CC.discoveries().forEach(function (d) { d.tags.forEach(function (t) { tags[t] = 1; }); });
      el.appendChild(A.h('<div class="view-head"><h1>Discoveries</h1><p>Every finding is one small file. Add yours here — it joins the clock, the timeline, the plates and the 19·138 index at once.</p></div>' +
        '<div class="disc-layout"><div><div class="filters">' +
        '<div class="field" style="flex:1 1 200px"><label for="q">Search</label><input id="q" value="' + A.esc(filt.q) + '" placeholder="Flood, 2040, cubit…"></div>' +
        '<div class="field"><label for="fk">Kind</label><select id="fk"><option value="">All</option>' + Object.keys(CC.KINDS).map(function (k) { return '<option value="' + k + '"' + (filt.kind === k ? ' selected' : '') + '>' + CC.KINDS[k] + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label for="ft">Tag</label><select id="ft"><option value="">All</option>' + Object.keys(tags).sort().map(function (t) { return '<option' + (filt.tag === t ? ' selected' : '') + '>' + A.esc(t) + '</option>'; }).join('') + '</select></div>' +
        '</div><div class="disc-list" id="dlist"></div></div><div>' + formHTML() + '</div></div>'));
      el.querySelector('#q').addEventListener('input', function (e) { filt.q = e.target.value; refresh(el); });
      el.querySelector('#fk').addEventListener('change', function (e) { filt.kind = e.target.value; refresh(el); });
      el.querySelector('#ft').addEventListener('change', function (e) { filt.tag = e.target.value; refresh(el); });
      var form = el.querySelector('#dform');
      form.addEventListener('input', function () { preview(el); });
      form.addEventListener('submit', function (e) {
        e.preventDefault(); var d = preview(el);
        if (!d.title) { A.toast('Give it a title first'); return; }
        if (d.when && isNaN(core.parseYear(d.when))) { A.toast('The year is not readable yet'); return; }
        A.toast(CC.drafts.save(d) ? 'Draft saved — it now shows everywhere in this browser' : 'This browser would not save drafts; export the file instead');
        refresh(el, d.id); preview(el);
      });
      el.querySelector('#fExport').addEventListener('click', function () { var d = preview(el); if (!d.title) return A.toast('Give it a title first'); A.download(d.id + '.js', CC.discoveryFileText(d)); });
      el.querySelector('#fManifest').addEventListener('click', function () { var d = preview(el); A.download('manifest.js', manifestWith(d.title ? d.id : '')); });
      el.querySelector('#fCopy').addEventListener('click', function () { var d = preview(el); if (d.title) A.copy(CC.discoveryFileText(d)); });
      el.querySelector('#fClear').addEventListener('click', function () { form.reset(); el.querySelector('#fTitle').textContent = 'New discovery'; preview(el); });
      el.querySelector('#fDel').addEventListener('click', function () { var d = readForm(el); CC.drafts.remove(d.id); A.toast('Draft deleted'); form.reset(); refresh(el); preview(el); });

      var sel = r.arg && r.arg !== 'new' ? r.arg : null;
      refresh(el, sel);
      if (r.arg === 'new') {
        if (r.q.feature) { el.querySelector('#f-feature').value = r.q.feature; el.querySelector('#f-kind').value = 'measurement'; var f = CC.petrie.features.find(function (x) { return x.id === r.q.feature; }); if (f) { el.querySelector('#f-mval').value = f.value; el.querySelector('#f-munit').value = f.unit; if (f.section) el.querySelector('#f-section').value = f.section; } }
        if (r.q.when) el.querySelector('#f-when').value = r.q.when;
        if (r.q.section) el.querySelector('#f-section').value = r.q.section;
        setTimeout(function () { el.querySelector('#f-title').focus(); }, 50);
      }
      preview(el);
      if (sel) setTimeout(function () { var n = document.getElementById('d-' + sel); if (n) n.scrollIntoView({ block: 'center' }); }, 50);
    }
  };
})();
