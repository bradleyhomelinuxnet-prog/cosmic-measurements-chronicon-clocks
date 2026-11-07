/* View: the Chronicon clock. The engine lives in clock.html and is driven by postMessage. */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app;
  var frame = null;

  function send(y) {
    if (!frame || y == null || isNaN(y)) return;
    var p = A.pendingYear && A.pendingYear.astro === y ? A.pendingYear : { astro: y };
    frame.contentWindow.postMessage({ cc: 'setYear', astro: p.astro, m: p.m, d: p.d }, '*');
    A.pendingYear = null;
  }

  window.addEventListener('message', function (ev) {
    if (!frame || !ev.data || ev.data.cc !== 'height' || ev.source !== frame.contentWindow) return;
    frame.style.height = Math.max(1200, ev.data.h + 20) + 'px';
  });

  CC.views.clock = {
    title: 'Clock', keep: true,
    render: function (el, r) {
      var y = r.q.y != null ? parseInt(r.q.y, 10) : null;
      var ok = y != null && !isNaN(y);
      el.appendChild(A.h('<div class="clock-wrap"><iframe class="clock-frame" title="The Chronicon clock engine"></iframe></div>'));
      frame = el.querySelector('iframe');
      var pend = A.pendingYear;
      if (CC.CLOCK_SRCDOC) {            /* single-file build: the clock travels inside the page */
        frame.addEventListener('load', function () { if (ok) { A.pendingYear = pend; send(y); } }, { once: true });
        frame.srcdoc = CC.CLOCK_SRCDOC;
      } else {
        if (ok && pend && pend.astro === y) frame.addEventListener('load', function () { A.pendingYear = pend; send(y); }, { once: true });
        frame.src = 'clock.html' + (ok ? '?y=' + y : '');
      }
      A.pendingYear = null;
    },
    update: function (el, r) { if (r.q.y != null) send(parseInt(r.q.y, 10)); }
  };
})();
