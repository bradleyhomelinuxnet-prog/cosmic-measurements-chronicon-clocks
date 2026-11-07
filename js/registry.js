/* Cosmic Chronicon — the discovery registry.
   Every discovery is one small file in discoveries/ that calls CC.discover({...}).
   discoveries/manifest.js lists the files; this script loads them in order, synchronously,
   so the pages work straight from disk (file://) as well as from a server.
   Drafts made with the in-app form live in this browser until you export and commit them.
   © 2026 Bradley Rogue. All rights reserved. */
(function () {
  'use strict';
  var CC = window.CC = window.CC || {};
  var core = CC.core;
  var list = [];
  var DRAFT_KEY = 'cc.discoveryDrafts.v1';

  var KINDS = {
    key: 'Key date', phoenix: 'Phoenix node', nemesis: 'Nemesis', ner: 'NER epoch',
    maya: 'Long Count', measurement: 'Measurement', cycle: 'Cycle', note: 'Note'
  };
  CC.KINDS = KINDS;

  function normalise(d, origin) {
    var e = Object.assign({}, d);
    if (!e.id) throw new Error('A discovery needs an id');
    e.kind = KINDS[e.kind] ? e.kind : 'note';
    e.origin = origin;
    if (e.when != null && e.when !== '') {
      e.astro = core.parseYear(e.when);
      if (isNaN(e.astro)) { console.warn('Discovery ' + e.id + ': cannot read year "' + e.when + '"'); e.astro = null; }
    } else e.astro = null;
    e.month = e.month || null; e.day = e.day || null;
    e.tags = (e.tags || []).slice();
    if (e.astro != null) core.tagsForYear(e.astro).forEach(function (t) { if (e.tags.indexOf(t) < 0) e.tags.push(t); });
    if (e.measurement && e.measurement.value != null) {
      core.relations(Math.round(e.measurement.value)).forEach(function (t) { if (e.tags.indexOf(t) < 0) e.tags.push(t); });
    }
    return e;
  }

  CC.discover = function (d) {
    var e = normalise(d, 'file');
    var i = list.findIndex(function (x) { return x.id === e.id; });
    if (i >= 0) list[i] = e; else list.push(e);
  };

  CC.drafts = {
    all: function () { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]'); } catch (_) { return []; } },
    save: function (d) {
      var a = CC.drafts.all().filter(function (x) { return x.id !== d.id; }); a.push(d);
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(a)); return true; } catch (_) { return false; }
    },
    remove: function (id) {
      var a = CC.drafts.all().filter(function (x) { return x.id !== id; });
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(a)); } catch (_) { }
    }
  };

  CC.discoveries = function (opts) {
    opts = opts || {};
    var out = list.slice();
    if (opts.drafts !== false) {
      CC.drafts.all().forEach(function (d) {
        try {
          var e = normalise(d, 'draft');
          var i = out.findIndex(function (x) { return x.id === e.id; });
          if (i >= 0) out[i] = e; else out.push(e);
        } catch (_) { }
      });
    }
    return out.sort(function (a, b) {
      if (a.astro == null) return b.astro == null ? a.id.localeCompare(b.id) : 1;
      if (b.astro == null) return -1;
      return a.astro - b.astro;
    });
  };

  /* The clock's ledger rows: [astro year, clock kind, text]. */
  CC.ledger = function () {
    var map = { key: 'key', phoenix: 'phx', nemesis: 'nem', ner: 'ner', maya: 'may' };
    return CC.discoveries().filter(function (d) { return d.astro != null; }).map(function (d) {
      return [d.astro, map[d.kind] || 'note', d.title + (d.summary ? ' — ' + d.summary : '')];
    });
  };

  /* Write the file a discovery would live in, so it can be committed as-is. */
  CC.discoveryFileText = function (d) {
    var keep = {};
    ['id', 'title', 'when', 'month', 'day', 'kind', 'summary', 'notes', 'measurement', 'section', 'tags', 'source', 'added']
      .forEach(function (k) {
        var v = d[k];
        if (v == null || v === '' || (Array.isArray(v) && !v.length)) return;
        keep[k] = v;
      });
    return '/* Discovery: ' + (d.title || d.id).replace(/\*\//g, '') + ' */\nCC.discover(' + JSON.stringify(keep, null, 2) + ');\n';
  };
  CC.manifestText = function (files) {
    return '/* Every discovery file, in load order. Add the new file name to the end. */\nCC.discoveryFiles = ' +
      JSON.stringify(files, null, 2) + ';\n';
  };

  /* Load the manifest's files right now, in order (works on file:// and http://). */
  CC.loadDiscoveries = function (base) {
    base = base || 'discoveries/';
    (CC.discoveryFiles || []).forEach(function (f) {
      document.write('<script src="' + base + encodeURI(f) + '"><\/script>');
    });
  };
})();
