/* View: Films — the channels and the films tied to the book. Nothing loads from YouTube until a film is played. */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app, core = CC.core;
  CC.views.films = {
    title: 'Films',
    render: function (el) {
      var F = CC.films || { channels: [], list: [] };
      el.appendChild(A.h('<div class="view-head"><h1>The Films</h1><p>Full-length films that match the novels, and the research films behind this book. Add a film in <code>data/films.js</code>.</p></div>' +
        '<div class="row" style="margin-bottom:18px">' + F.channels.map(function (c) { return '<a class="btn gold" href="' + A.esc(c.url) + '" target="_blank" rel="noopener">' + A.esc(c.name) + ' ↗</a>'; }).join('') + '</div>' +
        '<div class="films">' + F.list.map(function (f) {
          var sec = A.sectionById(f.section), yr = f.when != null ? core.parseYear(f.when) : null;
          return '<div class="film"><button class="thumb" data-id="' + A.esc(f.id) + '" aria-label="Play ' + A.esc(f.title) + '" style="background-image:url(https://i.ytimg.com/vi/' + encodeURIComponent(f.id) + '/hqdefault.jpg)"></button>' +
            '<div class="body"><div class="kicker">' + A.esc(f.channel || '') + (f.published ? ' · ' + A.esc(f.published) : '') + '</div><h3>' + A.esc(f.title) + '</h3>' +
            (f.summary ? '<p class="muted" style="margin:4px 0 0;font-size:15px">' + A.esc(f.summary) + '</p>' : '') +
            '<div class="row" style="margin-top:10px">' + (sec ? '<a class="btn" href="#book/' + sec.id + '">' + A.esc(sec.label ? '§' + sec.label : sec.title) + '</a>' : '') +
            (yr != null && !isNaN(yr) ? '<a class="btn" href="#clock?y=' + yr + '">' + A.esc(core.fmtYear(yr)) + '</a>' : '') +
            '<a class="btn" href="https://www.youtube.com/watch?v=' + encodeURIComponent(f.id) + '" target="_blank" rel="noopener">YouTube ↗</a></div></div></div>';
        }).join('') + '</div>'));
      el.querySelectorAll('.thumb').forEach(function (b) {
        b.addEventListener('click', function () {
          var fr = document.createElement('iframe');
          fr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(b.dataset.id) + '?autoplay=1';
          fr.title = 'Film'; fr.allow = 'autoplay; encrypted-media; picture-in-picture'; fr.allowFullscreen = true;
          b.replaceWith(fr);
        });
      });
    }
  };
})();
