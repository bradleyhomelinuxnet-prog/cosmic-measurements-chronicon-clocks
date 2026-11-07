/* View: the Plates — the monument drawn in the manner of Petrie's 1883 survey plates,
   every figure taken live from data/petrie.js, every labelled part clickable.
   Outer profile, base and Upper Chamber are drawn to scale; interior positions on Plate I are schematic. */
(function () {
  'use strict';
  var CC = window.CC, A = CC.app, core = CC.core;
  var F = {}, FEAT = {};
  (CC.petrie.features || []).forEach(function (f) { F[f.id] = f.value; FEAT[f.id] = f; });

  var DEFS = '<defs>' +
    '<pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#8a7352" stroke-width=".7"/></pattern>' +
    '<pattern id="rockHatch" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 10 L10 0 M-2 2 L2 -2 M8 12 L12 8" stroke="#8a7352" stroke-width=".6"/><circle cx="3" cy="3" r=".7" fill="#8a7352"/></pattern>' +
    '<marker id="arr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9" fill="none" stroke="#8f2a1c" stroke-width="1.2"/></marker>' +
    '</defs>';

  function n(v, dp) { return A.fmtNum(v, dp == null ? 2 : dp); }
  function feat(id, inner) { return '<g class="feat" data-f="' + id + '" tabindex="0" role="button" aria-label="' + A.esc(FEAT[id] ? FEAT[id].name : id) + '">' + inner + '</g>'; }
  function dimH(x1, x2, y, label, cls) {
    return '<line class="dim" x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" marker-start="url(#arr)" marker-end="url(#arr)"/>' +
      '<text class="dimtxt' + (cls || '') + '" x="' + ((x1 + x2) / 2) + '" y="' + (y - 6) + '" text-anchor="middle">' + label + '</text>';
  }
  function dimV(x, y1, y2, label, side) {
    var tx = side === 'l' ? x - 8 : x + 8;
    return '<line class="dim" x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2 + '" marker-start="url(#arr)" marker-end="url(#arr)"/>' +
      '<text class="dimtxt" x="' + tx + '" y="' + ((y1 + y2) / 2 + 4) + '" text-anchor="' + (side === 'l' ? 'end' : 'start') + '">' + label + '</text>';
  }
  function scaleBar(x, y, pxPerInch, inches) {
    var w = inches * pxPerInch, s = '<g class="scalebar">';
    s += '<line class="ink" x1="' + x + '" y1="' + y + '" x2="' + (x + w) + '" y2="' + y + '"/>';
    for (var i = 0; i <= 4; i++) {
      var xx = x + w * i / 4;
      s += '<line class="ink" x1="' + xx + '" y1="' + (y - 4) + '" x2="' + xx + '" y2="' + (y + 4) + '"/>';
      s += '<text class="lbl" x="' + xx + '" y="' + (y + 18) + '" text-anchor="middle" style="font-size:11px">' + n(inches * i / 4, 0) + '</text>';
    }
    var c = F.cubit * pxPerInch, k = Math.floor(inches / F.cubit);
    for (var j = 0; j <= k; j++) s += '<line class="ink-fine" x1="' + (x + j * c) + '" y1="' + (y - 10) + '" x2="' + (x + j * c) + '" y2="' + (y - 4) + '"/>';
    s += '<text class="lblsc" x="' + x + '" y="' + (y - 16) + '">SCALE OF BRITISH INCHES · ROYAL CUBITS ABOVE</text></g>';
    return s;
  }
  function cartouche(x, y, roman, title) {
    return '<text class="lblsc" x="' + x + '" y="' + y + '" text-anchor="middle" style="font-size:14px;letter-spacing:.28em">PLATE ' + roman + '.</text>' +
      '<text class="lbl" x="' + x + '" y="' + (y + 20) + '" text-anchor="middle" style="font-size:15px;font-style:italic">' + title + '</text>';
  }

  /* ---------- Plate I · the profile, north to south ---------- */
  function plateProfile() {
    var W = 1000, base = F['base-mean'], hgt = F['height-original'];
    var s = 880 / base, gx = 60, gy = 600, ax = gx + base * s / 2, ay = gy - hgt * s;
    var p = [];
    p.push(DEFS);
    p.push('<rect class="rock" x="0" y="' + gy + '" width="' + W + '" height="230"/>');
    p.push('<line class="ink" x1="0" y1="' + gy + '" x2="' + W + '" y2="' + gy + '"/>');
    p.push('<text class="lblsc" x="14" y="' + (gy + 16) + '">ROCK</text>');
    /* the body, with courses hinted */
    var body = '<path class="stone" d="M' + gx + ' ' + gy + ' L' + ax + ' ' + ay + ' L' + (gx + base * s) + ' ' + gy + ' Z"/>';
    for (var c = 1; c < 24; c++) {
      var yy = gy - c * (hgt * s) / 24, half = (gy - yy) / (hgt * s) * (base * s / 2);
      body += '<line class="ink-fine" x1="' + (gx + half) + '" y1="' + yy + '" x2="' + (gx + base * s - half) + '" y2="' + yy + '" opacity=".35"/>';
    }
    p.push(feat('slope', body + '<path class="ink" d="M' + (gx + 70) + ' ' + gy + ' A70 70 0 0 0 ' + (gx + 70 * Math.cos(F.slope * Math.PI / 180)) + ' ' + (gy - 70 * Math.sin(F.slope * Math.PI / 180)) + '"/>' +
      '<text class="dimtxt" x="' + (gx + 80) + '" y="' + (gy - 14) + '">' + FEAT.slope.display + '</text>'));
    /* lower chamber, 100 ft below the foundation (book §VIII), schematic position */
    var lw = F['lower-width'] * s, lh = F['lower-ceiling'] * s, ly = gy + 1200 * s, lx = ax - 12 - lw / 2;
    p.push(feat('lower-width', '<rect class="stone" x="' + lx + '" y="' + (ly - lh) + '" width="' + lw + '" height="' + lh + '"/><rect class="hit" x="' + (lx - 6) + '" y="' + (ly - lh - 6) + '" width="' + (lw + 12) + '" height="' + (lh + 12) + '"/>' +
      '<text class="lbl" x="' + (lx + lw / 2) + '" y="' + (ly + 18) + '" text-anchor="middle">Lower Chamber</text>'));
    /* descending passage */
    var ex = gx + 66.8 * (base * s / 2) / (hgt * s), ey = gy - 66.8, dA = F['descending-angle'] * Math.PI / 180;
    var dLen = (ly - lh / 2 - ey) / Math.sin(dA), dx2 = ex + dLen * Math.cos(dA), dy2 = ey + dLen * Math.sin(dA);
    p.push(feat('descending-angle', '<line class="ink" x1="' + ex + '" y1="' + ey + '" x2="' + dx2 + '" y2="' + dy2 + '" stroke-width="2.2"/><line class="ink" x1="' + dx2 + '" y1="' + dy2 + '" x2="' + lx + '" y2="' + dy2 + '"/>' +
      '<line class="hit" x1="' + ex + '" y1="' + ey + '" x2="' + dx2 + '" y2="' + dy2 + '"/><text class="lbl" x="' + (ex + 120) + '" y="' + (ey + 88) + '" transform="rotate(' + (F['descending-angle']) + ' ' + (ex + 120) + ' ' + (ey + 88) + ')">Descending Passage · ' + FEAT['descending-angle'].display + '</text>'));
    /* ascending passage and Grand Gallery */
    var jx = ex + 110 * Math.cos(dA), jy = ey + 110 * Math.sin(dA), up = 26.0 * Math.PI / 180;
    var a2x = jx + 153 * Math.cos(up), a2y = jy - 153 * Math.sin(up);
    var uy = gy - F['vertical-138'] * 12 * s; /* Upper Chamber floor */
    var gLen = F['gallery-length'] * s, gA = Math.asin(Math.min(1, (a2y - uy) / gLen));
    var g2x = a2x + gLen * Math.cos(gA), g2y = uy;
    p.push('<line class="ink" x1="' + jx + '" y1="' + jy + '" x2="' + a2x + '" y2="' + a2y + '" stroke-width="1.6"/>');
    var gh = F['gallery-height'] * 12 * s;
    p.push(feat('gallery-length', '<path class="stone" d="M' + a2x + ' ' + a2y + ' L' + g2x + ' ' + g2y + ' L' + g2x + ' ' + (g2y - gh) + ' L' + a2x + ' ' + (a2y - gh) + ' Z"/>' +
      '<text class="lbl" x="' + (a2x + 20) + '" y="' + (a2y - gh - 8) + '" transform="rotate(' + (-gA * 180 / Math.PI) + ' ' + (a2x + 20) + ' ' + (a2y - gh - 8) + ')">Grand Gallery</text>'));
    /* middle chamber on the axis */
    p.push('<line class="ink" x1="' + a2x + '" y1="' + a2y + '" x2="' + (ax - 11) + '" y2="' + a2y + '"/>');
    p.push('<rect class="stone" x="' + (ax - 11) + '" y="' + (a2y - 21) + '" width="22" height="21"/><text class="lbl" x="' + (ax + 16) + '" y="' + (a2y + 16) + '" style="font-size:12px">Middle Chamber</text>');
    /* Upper Chamber (N–S width seen in section) and the relieving chambers above it */
    var ux = g2x + 11, uw = F['upper-width'] * s, uh = F['upper-height'] * s;
    p.push('<line class="ink" x1="' + g2x + '" y1="' + g2y + '" x2="' + ux + '" y2="' + g2y + '"/>');
    p.push(feat('upper-height', '<rect class="stone" x="' + ux + '" y="' + (uy - uh) + '" width="' + uw + '" height="' + uh + '"/><rect class="hit" x="' + (ux - 5) + '" y="' + (uy - uh - 5) + '" width="' + (uw + 10) + '" height="' + (uh + 10) + '"/>'));
    var rel = '';
    for (var r = 0; r < 5; r++) { var ry = uy - uh - 6 - r * 15; rel += '<rect class="stone" x="' + ux + '" y="' + (ry - 9) + '" width="' + uw + '" height="9"/>'; }
    rel += '<path class="ink" d="M' + (ux - 4) + ' ' + (uy - uh - 81) + ' L' + (ux + uw / 2) + ' ' + (uy - uh - 98) + ' L' + (ux + uw + 4) + ' ' + (uy - uh - 81) + '"/>';
    p.push(feat('relieving-beams', rel + '<rect class="hit" x="' + (ux - 6) + '" y="' + (uy - uh - 100) + '" width="' + (uw + 12) + '" height="96"/>'));
    p.push('<text class="lbl" x="' + (ux + uw + 10) + '" y="' + (uy - uh / 2 + 4) + '">Upper Chamber</text>');
    p.push('<text class="lbl" x="' + (ux + uw + 10) + '" y="' + (uy - uh - 50) + '" style="font-size:12px">relieving chambers</text>');
    /* air channels, faint */
    p.push('<line class="ink-fine" x1="' + ux + '" y1="' + (uy - uh * .4) + '" x2="' + (ux - (uy - 120) / Math.tan(32.5 * Math.PI / 180) * .5) + '" y2="' + (uy - (uy - 120) * .5) + '" stroke-dasharray="3 3"/>');
    p.push('<line class="ink-fine" x1="' + (ux + uw) + '" y1="' + (uy - uh * .4) + '" x2="' + (ux + uw + 150) + '" y2="' + (uy - uh * .4 - 150) + '" stroke-dasharray="3 3"/>');
    /* dimensions */
    p.push(feat('base-mean', dimH(gx, gx + base * s, gy + 178, 'Base ' + n(base, 1) + ' inches · ' + n(base / F.cubit, 1) + ' cubits') + '<rect class="hit" x="' + gx + '" y="' + (gy + 158) + '" width="' + (base * s) + '" height="30"/>'));
    p.push(feat('height-original', '<line class="ink-fine" x1="' + ax + '" y1="' + ay + '" x2="' + ax + '" y2="' + gy + '" stroke-dasharray="5 4"/>' + dimV(gx + base * s - 40, ay, gy, 'Height ' + n(hgt, 0) + ' ± ' + FEAT['height-original'].tolerance + ' in', 'r') +
      '<line class="ink-fine" x1="' + ax + '" y1="' + ay + '" x2="' + (gx + base * s - 30) + '" y2="' + ay + '"/>' + '<rect class="hit" x="' + (gx + base * s - 50) + '" y="' + ay + '" width="20" height="' + (gy - ay) + '"/>'));
    p.push(feat('vertical-138', dimV(ux + uw + 120, uy, gy, '138 ft · 1,656 in', 'r') + '<rect class="hit" x="' + (ux + uw + 110) + '" y="' + uy + '" width="20" height="' + (gy - uy) + '"/>'));
    p.push(cartouche(190, 70, 'I', 'The Great Pyramid · section from north to south'));
    p.push('<text class="lbl" x="22" y="' + (gy - 8) + '" style="font-size:12px">N</text><text class="lbl" x="' + (W - 30) + '" y="' + (gy - 8) + '" style="font-size:12px">S</text>');
    p.push(scaleBar(W - 470, 868, s, 2000));
    return { svg: '<svg viewBox="0 0 ' + W + ' 900" role="img" aria-label="Plate I, section of the Great Pyramid from north to south">' + p.join('') + '</svg>',
      note: 'Outer profile, base, height and the 138-foot vertical drawn to scale; interior passages placed schematically.' };
  }

  /* ---------- Plate II · the Upper Chamber, plan and elevation ---------- */
  function plateUpper() {
    var L = F['upper-length'], Wd = F['upper-width'], H = F['upper-height'], s = 1.45, x0 = 200, y0 = 150;
    var w = L * s, d = Wd * s, hh = H * s, ey = y0 + d + 120, p = [DEFS];
    function cubitGrid(x, y, cw, ch) {
      var g = '', cs = F.cubit * s;
      for (var i = 1; i * cs < cw - .5; i++) g += '<line class="grid-cubit" x1="' + (x + i * cs) + '" y1="' + y + '" x2="' + (x + i * cs) + '" y2="' + (y + ch) + '"/>';
      for (var j = 1; j * cs < ch - .5; j++) g += '<line class="grid-cubit" x1="' + x + '" y1="' + (y + j * cs) + '" x2="' + (x + cw) + '" y2="' + (y + j * cs) + '"/>';
      return g;
    }
    p.push(cartouche(500, 40, 'II', 'The Upper Chamber · plan and elevation, with the royal-cubit grid'));
    p.push('<text class="lblsc" x="' + x0 + '" y="' + (y0 - 14) + '">PLAN</text>');
    p.push('<rect class="hatch" x="' + (x0 - 14) + '" y="' + (y0 - 14) + '" width="' + (w + 28) + '" height="' + (d + 28) + '"/>');
    p.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + d + '" fill="#efe6cf" stroke="none"/>' + cubitGrid(x0, y0, w, d));
    p.push(feat('upper-length', '<rect class="ink" x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + d + '"/>' + dimH(x0, x0 + w, y0 - 28, n(L) + ' in · ' + n(L / F.cubit) + ' cubits') + '<rect class="hit" x="' + x0 + '" y="' + (y0 - 46) + '" width="' + w + '" height="30"/>'));
    p.push(feat('upper-width', dimV(x0 + w + 34, y0, y0 + d, n(Wd) + ' in · ' + n(Wd / F.cubit) + ' cubits', 'r') + '<rect class="hit" x="' + (x0 + w + 24) + '" y="' + y0 + '" width="20" height="' + d + '"/>'));
    p.push('<text class="lbl" x="' + (x0 - 24) + '" y="' + (y0 + d / 2 + 4) + '" text-anchor="end">W</text><text class="lbl" x="' + (x0 + w + 16) + '" y="' + (y0 + d / 2 + 4) + '" style="font-size:11px">E</text>');
    p.push('<text class="lblsc" x="' + x0 + '" y="' + (ey - 14) + '">ELEVATION · SOUTH WALL</text>');
    p.push('<rect x="' + x0 + '" y="' + ey + '" width="' + w + '" height="' + hh + '" fill="#efe6cf"/>' + cubitGrid(x0, ey, w, hh));
    for (var c = 1; c < 5; c++) p.push('<line class="ink-fine" x1="' + x0 + '" y1="' + (ey + hh * c / 5) + '" x2="' + (x0 + w) + '" y2="' + (ey + hh * c / 5) + '" opacity=".5"/>');
    p.push(feat('upper-height', '<rect class="ink" x="' + x0 + '" y="' + ey + '" width="' + w + '" height="' + hh + '"/>' + dimV(x0 - 30, ey, ey + hh, n(H) + ' in · ' + n(H / F.cubit) + ' cubits', 'l') + '<rect class="hit" x="' + (x0 - 40) + '" y="' + ey + '" width="20" height="' + hh + '"/>'));
    p.push('<rect class="rock" x="' + (x0 - 14) + '" y="' + (ey + hh) + '" width="' + (w + 28) + '" height="16"/>');
    var ratio = L / Wd;
    p.push('<text class="lbl" x="' + (x0 + w / 2) + '" y="' + (ey + hh + 48) + '" text-anchor="middle">length ÷ width = ' + n(ratio, 4) + '</text>');
    p.push(scaleBar(x0, ey + hh + 96, s, 200));
    return { svg: '<svg viewBox="0 0 1000 ' + (ey + hh + 130) + '" role="img" aria-label="Plate II, the Upper Chamber in plan and elevation">' + p.join('') + '</svg>',
      note: 'Drawn to scale from Petrie §47. Dashed squares are royal cubits of 20.620 inches.' };
  }

  /* ---------- Plate III · the base ---------- */
  function plateBase() {
    var sides = [['base-north', 'NORTH'], ['base-east', 'EAST'], ['base-south', 'SOUTH'], ['base-west', 'WEST']];
    var mean = F['base-mean'], S = 520, x0 = 240, y0 = 130, p = [DEFS];
    p.push(cartouche(500, 40, 'III', 'The base · the four sides of the casing'));
    p.push('<rect class="rock" x="' + (x0 - 40) + '" y="' + (y0 - 40) + '" width="' + (S + 80) + '" height="' + (S + 80) + '" opacity=".55"/>');
    p.push('<rect class="stone" x="' + x0 + '" y="' + y0 + '" width="' + S + '" height="' + S + '"/>');
    p.push('<line class="ink-fine" x1="' + x0 + '" y1="' + y0 + '" x2="' + (x0 + S) + '" y2="' + (y0 + S) + '"/><line class="ink-fine" x1="' + (x0 + S) + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + (y0 + S) + '"/>');
    for (var k = 1; k < 6; k++) { var q = S * k / 12; p.push('<rect class="ink-fine" x="' + (x0 + q) + '" y="' + (y0 + q) + '" width="' + (S - 2 * q) + '" height="' + (S - 2 * q) + '" opacity=".4"/>'); }
    var pos = {
      'base-north': [x0, y0 - 20, x0 + S, y0 - 20, 'h'], 'base-south': [x0, y0 + S + 20, x0 + S, y0 + S + 20, 'h'],
      'base-west': [x0 - 20, y0, x0 - 20, y0 + S, 'v'], 'base-east': [x0 + S + 20, y0, x0 + S + 20, y0 + S, 'v']
    };
    sides.forEach(function (sd) {
      var id = sd[0], v = F[id], dev = v - mean, ps = pos[id];
      var label = sd[1] + ' ' + n(v, 1) + ' in (' + (dev >= 0 ? '+' : '') + n(dev, 1) + ')';
      var g = ps[4] === 'h' ? dimH(ps[0], ps[2], ps[1] + (id === 'base-south' ? 26 : 0), label) + '<rect class="hit" x="' + ps[0] + '" y="' + (ps[1] - 22) + '" width="' + S + '" height="40"/>'
        : '<g transform="rotate(-90 ' + ps[0] + ' ' + (y0 + S / 2) + ')">' + dimH(ps[0] - S / 2, ps[0] + S / 2, y0 + S / 2 + (id === 'base-east' ? 26 : 0), label) + '</g><rect class="hit" x="' + (ps[0] - 20) + '" y="' + y0 + '" width="40" height="' + S + '"/>';
      p.push(feat(id, g));
    });
    p.push(feat('base-mean', '<text class="lbl" x="' + (x0 + S / 2) + '" y="' + (y0 + S / 2 - 12) + '" text-anchor="middle" style="font-size:16px">mean side ' + n(mean, 1) + ' in</text>' +
      '<text class="lbl" x="' + (x0 + S / 2) + '" y="' + (y0 + S / 2 + 12) + '" text-anchor="middle">perimeter ' + n(4 * mean, 1) + ' in · ' + n(4 * mean / F.cubit, 1) + ' cubits</text>' +
      '<rect class="hit" x="' + (x0 + S / 2 - 140) + '" y="' + (y0 + S / 2 - 34) + '" width="280" height="56"/>'));
    p.push('<g transform="translate(' + (x0 + S + 120) + ' ' + (y0 + 20) + ')"><line class="ink" x1="0" y1="60" x2="0" y2="0"/><path class="ink" d="M-8 14 L0 0 L8 14"/><text class="lblsc" x="0" y="-8" text-anchor="middle">N</text><text class="lbl" x="0" y="82" text-anchor="middle" style="font-size:11px">true north</text></g>');
    p.push(scaleBar(x0, y0 + S + 120, S / mean, 3000));
    return { svg: '<svg viewBox="0 0 1000 ' + (y0 + S + 150) + '" role="img" aria-label="Plate III, the base of the Great Pyramid">' + p.join('') + '</svg>',
      note: 'Square drawn to the mean side; each label gives the side and its difference from the mean, after Petrie §39.' };
  }

  /* ---------- Plate IV · the Grand Gallery ---------- */
  function plateGallery() {
    var Lg = F['gallery-length'], Hg = F['gallery-height'] * 12, s = .42, ang = 26.3 * Math.PI / 180, p = [DEFS];
    var x0 = 70, y0 = 560, x1 = x0 + Lg * s * Math.cos(ang), y1 = y0 - Lg * s * Math.sin(ang), hh = Hg * s;
    p.push(cartouche(500, 40, 'IV', 'The Grand Gallery · longitudinal section and cross-section'));
    p.push('<path class="hatch" d="M' + (x0 - 20) + ' ' + (y0 + 30) + ' L' + (x1 + 20) + ' ' + (y1 + 30) + ' L' + (x1 + 20) + ' ' + (y1 - hh - 30) + ' L' + (x0 - 20) + ' ' + (y0 - hh - 30) + ' Z"/>');
    var g = '<path class="stone" d="M' + x0 + ' ' + y0 + ' L' + x1 + ' ' + y1 + ' L' + x1 + ' ' + (y1 - hh) + ' L' + x0 + ' ' + (y0 - hh) + ' Z"/>';
    for (var c = 1; c <= F['gallery-courses']; c++) {
      var f = c / (F['gallery-courses'] + 1);
      g += '<line class="ink-fine" x1="' + x0 + '" y1="' + (y0 - hh * f) + '" x2="' + x1 + '" y2="' + (y1 - hh * f) + '"/>';
    }
    p.push(feat('gallery-length', g +
      '<line class="dim" x1="' + x0 + '" y1="' + (y0 + 22) + '" x2="' + x1 + '" y2="' + (y1 + 22) + '" marker-start="url(#arr)" marker-end="url(#arr)"/>' +
      '<text class="dimtxt" x="' + ((x0 + x1) / 2 + 14) + '" y="' + ((y0 + y1) / 2 + 44) + '" transform="rotate(' + (-26.3) + ' ' + ((x0 + x1) / 2 + 14) + ' ' + ((y0 + y1) / 2 + 44) + ')" text-anchor="middle">' + n(Lg, 1) + ' in · ' + n(Lg / F.cubit, 2) + ' cubits</text>'));
    var slots = '';
    for (var k = 0; k < F['gallery-slots']; k++) {
      var t = (k + .5) / F['gallery-slots'], sx = x0 + (x1 - x0) * t, sy = y0 + (y1 - y0) * t;
      slots += '<rect class="ink-fine" x="' + (sx - 2) + '" y="' + (sy - 5) + '" width="4" height="5"/>';
    }
    p.push(feat('gallery-slots', slots + '<text class="lbl" x="' + (x0 + 40) + '" y="' + (y0 - 14) + '" style="font-size:12px" transform="rotate(-26.3 ' + (x0 + 40) + ' ' + (y0 - 14) + ')">' + F['gallery-slots'] + ' slot pairs along the ramps</text>'));
    /* cross-section with the corbel steps */
    var cx = 820, cy = 560, fw = 82 * s * 1.6, ch = hh * 1.6, steps = F['gallery-courses'], st = (fw - 41 * s * 1.6) / 2 / steps;
    var d = 'M' + (cx - fw / 2) + ' ' + cy, yy = cy, xl = cx - fw / 2, xr = cx + fw / 2, rise = ch / (steps + 1);
    var left = [], right = [];
    for (var i = 0; i <= steps; i++) {
      yy = cy - rise * (i + 1); left.push([xl + st * i, cy - rise * i], [xl + st * i, yy]); right.push([xr - st * i, cy - rise * i], [xr - st * i, yy]);
    }
    var path = 'M' + left.map(function (pt) { return pt[0] + ' ' + pt[1]; }).join(' L') + ' L' + right.reverse().map(function (pt) { return pt[0] + ' ' + pt[1]; }).join(' L') + ' Z';
    p.push('<rect class="hatch" x="' + (cx - fw / 2 - 30) + '" y="' + (cy - ch - 30) + '" width="' + (fw + 60) + '" height="' + (ch + 60) + '"/>');
    p.push(feat('gallery-courses', '<path class="stone" d="' + path + '"/>' + '<text class="lbl" x="' + cx + '" y="' + (cy + 50) + '" text-anchor="middle">cross-section · ' + steps + ' corbel courses</text>'));
    p.push(feat('gallery-height', dimV(cx + fw / 2 + 50, cy - ch, cy, n(F['gallery-height'], 0) + ' ft', 'r') + '<rect class="hit" x="' + (cx + fw / 2 + 40) + '" y="' + (cy - ch) + '" width="20" height="' + ch + '"/>'));
    p.push(scaleBar(x0, 640, s, 1000));
    return { svg: '<svg viewBox="0 0 1000 680" role="img" aria-label="Plate IV, the Grand Gallery">' + p.join('') + '</svg>',
      note: 'Length to scale; corbel steps, slot spacing and the cross-section are schematic. Slope drawn at about 26°.' };
  }

  var PLATES = [
    { id: 'profile', roman: 'I', name: 'Section N–S', make: plateProfile },
    { id: 'upper', roman: 'II', name: 'Upper Chamber', make: plateUpper },
    { id: 'base', roman: 'III', name: 'The Base', make: plateBase },
    { id: 'gallery', roman: 'IV', name: 'Grand Gallery', make: plateGallery }
  ];
  var PLATE_OF = {
    'base-north': 'base', 'base-south': 'base', 'base-east': 'base', 'base-west': 'base',
    'upper-width': 'upper', 'upper-length': 'upper', 'gallery-courses': 'gallery', 'gallery-slots': 'gallery', 'gallery-height': 'gallery'
  };

  function card(id) {
    var f = FEAT[id];
    if (!f) return '<div class="panel feature-card"><h3>Choose a part of the plate</h3><p class="muted">Click any labelled part — a side, a chamber, a passage, a dimension — to read its figure in every unit, its source, and the discoveries tied to it.</p></div>';
    var rows = '';
    if (['in', 'ft'].indexOf(f.unit) >= 0) {
      ['in', 'ft', 'm', 'cubit'].forEach(function (u) { rows += '<tr><td>' + core.UNITS[u].name + '</td><td>' + n(core.convert(f.value, f.unit, u), u === 'm' ? 4 : 3) + '</td></tr>'; });
    } else rows = '<tr><td>' + (f.unit === 'deg' ? 'angle' : 'count') + '</td><td>' + (f.display || n(f.value, 4)) + '</td></tr>';
    var rel = core.relations(Math.round(f.value)).map(A.tagChip).join(' ');
    var ds = CC.discoveries().filter(function (d) { return d.measurement && d.measurement.feature === id; });
    var sec = A.sectionById(f.section);
    return '<div class="panel feature-card"><div class="kicker">' + A.esc(f.group) + '</div><h3>' + A.esc(f.name) + '</h3>' +
      (f.formerly ? '<div class="formerly">formerly the ' + A.esc(f.formerly) + '</div>' : '') +
      '<table class="conv-table">' + rows + '</table>' +
      '<p class="muted" style="font-size:14px;margin:10px 0 6px">' + (f.approx ? 'Approximate. ' : '') + (f.tolerance ? '± ' + f.tolerance + ' in. ' : '') + 'Source: ' + A.esc(f.ref) + '</p>' +
      (rel ? '<div style="margin:6px 0">' + rel + '</div>' : '') +
      (ds.length ? '<div class="kicker" style="margin-top:12px">Discoveries</div>' + ds.map(function (d) { return '<div style="margin-top:4px"><a href="#discoveries/' + A.esc(d.id) + '">' + A.esc(d.title) + '</a></div>'; }).join('') : '') +
      '<div class="row" style="margin-top:14px">' + (sec ? '<a class="btn" href="#book/' + sec.id + '">Read ' + A.esc(sec.label ? '§' + sec.label : sec.title) + '</a>' : '') +
      '<a class="btn" href="#convert?v=' + f.value + '&u=' + f.unit + '">Convert</a>' +
      '<a class="btn gold" href="#discoveries/new?feature=' + id + '">Add a discovery</a></div></div>';
  }

  /* The measurement table: every figure, sortable by any column, each row opening its plate. */
  var sortBy = { key: 'group', dir: 1 };
  var COLS = [
    ['name', 'Part'], ['group', 'Group'], ['figure', 'Figure'], ['in', 'Inches'], ['cubit', 'Cubits'], ['m', 'Metres'], ['ref', 'Source']
  ];
  function rowVals(f) {
    var len = f.unit === 'in' || f.unit === 'ft';
    return {
      name: f.name, group: f.group, ref: f.ref,
      figure: len ? core.convert(f.value, f.unit, 'in') : f.value,
      in: len ? core.convert(f.value, f.unit, 'in') : null,
      cubit: len ? core.convert(f.value, f.unit, 'cubit') : null,
      m: len ? core.convert(f.value, f.unit, 'm') : null
    };
  }
  function measuresTable() {
    var rows = CC.petrie.features.slice().sort(function (a, b) {
      var x = rowVals(a)[sortBy.key], y = rowVals(b)[sortBy.key];
      if (x == null && y == null) return a.name.localeCompare(b.name);
      if (x == null) return 1; if (y == null) return -1;
      var c = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
      return (c || a.name.localeCompare(b.name)) * sortBy.dir;
    });
    return '<div class="panel" style="margin-top:22px" id="mtable"><div class="kicker">Every measurement · click a heading to sort, a row to open its plate</div>' +
      '<div class="table-scroll"><table class="checks sortable"><thead><tr>' + COLS.map(function (c) {
        return '<th scope="col" data-k="' + c[0] + '"' + (sortBy.key === c[0] ? ' aria-sort="' + (sortBy.dir > 0 ? 'ascending' : 'descending') + '"' : '') + ' tabindex="0">' + c[1] + '</th>';
      }).join('') + '</tr></thead><tbody>' + rows.map(function (f) {
        var v = rowVals(f), unitLabel = { in: 'in', ft: 'ft', deg: '', count: '' }[f.unit];
        return '<tr data-f="' + f.id + '" style="cursor:pointer"><td>' + A.esc(f.name) + (f.formerly ? '<div class="muted" style="font-size:13px;font-style:italic">formerly the ' + A.esc(f.formerly) + '</div>' : '') + '</td>' +
          '<td>' + A.esc(f.group) + '</td><td class="num">' + (f.display || (n(f.value, 2) + (unitLabel ? ' ' + unitLabel : ''))) + (f.approx ? ' ≈' : '') + '</td>' +
          '<td class="num">' + (v.in == null ? '—' : n(v.in, 2)) + '</td><td class="num">' + (v.cubit == null ? '—' : n(v.cubit, 2)) + '</td><td class="num">' + (v.m == null ? '—' : n(v.m, 3)) + '</td>' +
          '<td class="muted" style="font-size:14px">' + A.esc(f.ref) + '</td></tr>';
      }).join('') + '</tbody></table></div><p class="muted" style="font-size:14px;margin:10px 0 0">≈ marks figures the book gives as approximate. Add a row in <code>data/petrie.js</code>.</p></div>';
  }
  function wireMeasures(el) {
    var box = el.querySelector('#mtable');
    box.querySelectorAll('th[data-k]').forEach(function (th) {
      function sort() { sortBy = { key: th.dataset.k, dir: sortBy.key === th.dataset.k ? -sortBy.dir : 1 }; box.outerHTML = measuresTable(); wireMeasures(el); }
      th.addEventListener('click', sort);
      th.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); } });
    });
    box.querySelectorAll('tr[data-f]').forEach(function (tr) {
      tr.addEventListener('click', function () { A.go('#plates/' + tr.dataset.f + (PLATE_OF[tr.dataset.f] ? '?p=' + PLATE_OF[tr.dataset.f] : '')); });
    });
  }

  function checksTable() {
    var rows = CC.petrie.checks.map(function (c) {
      var v = c.expr(F), dev = (v - c.target) / c.target * 100, ad = Math.abs(dev);
      var cut = function (x) { var f = Math.pow(10, c.places); return c.truncate ? Math.trunc(x * f) / f : core.round(x, c.places); };
      var atPlaces = c.places != null && cut(v) === cut(c.target);
      var verdict = atPlaces ? ['hold', 'holds to ' + c.places + ' places'] : ad < 0.01 ? ['hold', 'holds'] : ad < 0.5 ? ['near', 'close'] : ['miss', 'does not hold'];
      var sec = A.sectionById(c.section);
      return '<tr><td>' + A.esc(c.name) + (sec ? '<div class="muted" style="font-size:13px"><a href="#book/' + sec.id + '">' + A.esc(A.sectionName(sec.id)) + '</a></div>' : '') + '</td>' +
        '<td class="num">' + (c.places != null ? cut(v).toFixed(c.places) + (c.truncate ? '…' : '') : n(v, 5)) + '</td><td class="num">' + A.esc(c.targetLabel) + (c.target !== Math.round(c.target) ? ' = ' + n(c.target, 5) : '') + '</td>' +
        '<td class="num">' + A.esc(c.claim || '—') + '</td><td class="num">' + (dev >= 0 ? '+' : '') + n(dev, 3) + '%</td>' +
        '<td><span class="verdict ' + verdict[0] + '">' + verdict[1] + '</span></td></tr>';
    }).join('');
    return '<div class="panel" style="margin-top:22px"><div class="kicker">The book\'s relationships, recomputed from the figures</div>' +
      '<div class="table-scroll"><table class="checks"><thead><tr><th>Relationship</th><th>Computed</th><th>Target</th><th>Text states</th><th>Off by</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="muted" style="font-size:14px;margin:10px 0 0">Within 0.01% <span class="verdict hold">holds</span> · within 0.5% <span class="verdict near">close</span> · beyond that <span class="verdict miss">does not hold</span>. Change a figure in <code>data/petrie.js</code> and this table updates.</p></div>';
  }

  CC.views.plates = {
    title: 'Plates',
    render: function (el, r) {
      var sel = r.arg && FEAT[r.arg] ? r.arg : null;
      var pid = PLATES.some(function (p) { return p.id === r.q.p; }) ? r.q.p : (sel && PLATE_OF[sel]) || 'profile';
      var plate = PLATES.find(function (p) { return p.id === pid; }), made = plate.make();
      el.appendChild(A.h('<div class="view-head"><h1>The Plates</h1><p>The monument in the manner of Petrie\'s 1883 survey plates. Every figure is drawn live from the measurement table.</p></div>' +
        '<div class="plate-tabs">' + PLATES.map(function (p) { return '<a class="btn' + (p.id === pid ? ' on' : '') + '" href="#plates' + (sel ? '/' + sel : '') + '?p=' + p.id + '">Plate ' + p.roman + ' · ' + p.name + '</a>'; }).join('') + '</div>' +
        '<div class="plates"><div><div class="plate">' + made.svg + '<div class="cap"><span>PLATE ' + plate.roman + '</span><i>' + made.note + '</i></div></div></div><div id="fcard">' + card(sel) + '</div></div>' + measuresTable() + checksTable()));
      wireMeasures(el);
      function pick(id) {
        el.querySelectorAll('.feat').forEach(function (g) { g.classList.toggle('sel', g.dataset.f === id); });
        el.querySelector('#fcard').innerHTML = card(id);
        history.replaceState(null, '', '#plates/' + id + '?p=' + pid);
      }
      el.querySelectorAll('.feat').forEach(function (g) {
        g.addEventListener('click', function () { pick(g.dataset.f); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(g.dataset.f); } });
      });
      if (sel) el.querySelectorAll('.feat[data-f="' + sel + '"]').forEach(function (g) { g.classList.add('sel'); });
    }
  };
})();
