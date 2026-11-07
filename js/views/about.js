/* View: About — sources, ownership, and how to add to the instrument. */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app;
  CC.views.about = {
    title: 'About',
    render: function (el) {
      var n = CC.discoveries({ drafts: false }).length, d = CC.drafts.all().length;
      el.appendChild(A.h('<div class="prose"><div class="view-head"><h1>About the instrument</h1></div>' +
        '<p><b>Cosmic Chronicon</b> joins three things: the measurements of the Great Pyramid, the Chronicon clock of six chronologies, and the book <i>Cosmic Measurements of the Great Pyramid of Giza</i>. A date in the book turns the clock; a measurement opens its plate; every discovery shows up in all of them.</p>' +
        '<h2>Sources</h2><p>Measurements: W. M. Flinders Petrie, <i>The Pyramids and Temples of Gizeh</i> (1883), public domain, as tabulated in the book\'s Appendix A. The cycle framework — the 138-year Phoenix, Nemesis X, the NER and the Annus Mundi count — is the Archaix thesis of Jason Breshears (Archaix.com, <i>Chronicon</i>, 2017), credited wherever it appears and presented as a thesis, not as established archaeology. Calendar conversions use the browser\'s own calendars and standard day-count arithmetic.</p>' +
        '<h2>Ownership</h2><p>Code, text, plates and design © 2026 Bradley Rogue. All rights reserved. No charts, plates or book passages of other authors are reproduced; quotations are short and cited.</p>' +
        '<h2>Adding a discovery</h2><p>Open <a href="#discoveries/new">Discoveries → New</a>, fill in what you found and save it as a draft — it appears at once on the clock, the timeline, the plates and the index, in this browser. To make it permanent, export the file and the manifest, put both in the <code>discoveries</code> folder and commit. Right now there are <b>' + n + '</b> committed discoveries' + (d ? ' and <b>' + d + '</b> draft' + (d > 1 ? 's' : '') + ' in this browser' : '') + '.</p>' +
        '<h2>Adding a measurement</h2><p>Add a line to <code>data/petrie.js</code>. It appears in the converter and the 19·138 index straight away; to draw it, give it a place on a plate in <code>js/views/plates.js</code>.</p>' +
        '<h2>Running it</h2><p>Open <code>index.html</code> in a browser — no install and no server needed. Everything runs on your machine; the only things fetched from the internet are the fonts (it falls back to system fonts offline) and a film, when you press play.</p></div>'));
    }
  };
})();
