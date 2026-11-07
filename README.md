# Cosmic Chronicon

[![tests](https://github.com/bradleyhomelinuxnet-prog/cosmic-measurements-chronicon-clocks/actions/workflows/test.yml/badge.svg)](https://github.com/bradleyhomelinuxnet-prog/cosmic-measurements-chronicon-clocks/actions/workflows/test.yml)

**Live site:** https://bradleyhomelinuxnet-prog.github.io/cosmic-measurements-chronicon-clocks/

**The Great Pyramid, measured and timed.** This is one offline browser instrument that joins three things:

- the measurements of the Great Pyramid
- the Chronicon clock of six chronologies
- the book *Cosmic Measurements of the Great Pyramid of Giza*

The pieces are linked. A date in the book turns the clock, and a measurement opens its plate. Every discovery you add shows up in all of them.

Open `index.html` in a browser. You need no install and no server. It is plain HTML, CSS and JavaScript, with no `.exe`.

---

## What's inside

| Tab | What it does |
|---|---|
| **Clock** | The Chronicon engine shows six wheels at once: Annus Mundi, Phoenix 138, Nemesis X 792, NER 600, the Long Count and the Metonic moon. Below them sit the living clocks and the calendar wall. Annus Mundi leads, and the Hebrew count is minimised. |
| **Plates** | The monument is drawn in the manner of Petrie's 1883 survey plates: the section from north to south, the Upper Chamber with its royal-cubit grid, the base, and the Grand Gallery. Click any part to read its figure in every unit. A table under the plates recomputes each relationship the book draws and says whether it holds. |
| **Timeline** | Every dated discovery sits on one line over the 138-year grid. **Fold at the axis** reflects the timeline around AM 2760 (or any axis you choose) and tests which events have a partner. |
| **Discoveries** | You can browse, filter and add findings. Each finding is one small file. |
| **The Book** | All of *Cosmic Measurements*, section by section. Dates and measurements in the text are live links, and each section names its mirror across the axis. |
| **19 · 138** | Every appearance of 19 and 138, counted from the text, the measurements and the discoveries, along with every multiple of 138 the book names. |
| **Converter** | Converts between inches, feet, metres, centimetres and royal cubits, with the working shown. |
| **Films** | The Phoenix Chronicles Universe and Super Cool Stuff channels, plus films tied to the book. |

## Adding a discovery

1. Open **Discoveries**, fill in the form and press **Save draft**. The discovery appears at once on the clock, the timeline, the plates and the index, but only in your browser.
2. To make it permanent, press **Export file** and **Export manifest**.
3. Put both files in `discoveries/`. The new manifest replaces the old one.
4. Commit and push.

A discovery file looks like this:

```js
CC.discover({
  "id": "next-phoenix-2040ad",
  "title": "Next Phoenix",
  "when": "2040 AD",          // also "2239 BC", "AM 5934"
  "kind": "phoenix",          // key · phoenix · nemesis · ner · maya · measurement · cycle · note
  "summary": "Year 5,934 = 138 × 43.",
  "section": "sxiii",         // the book section it belongs to
  "source": "Cosmic Measurements, Appendix B"
});
```

The app works out the year's tags for you: Annus Mundi, Phoenix node, Metonic, Nemesis window, palindromes, and 19 or 138 relations.

## Adding a measurement

To add a measurement, add a line to `data/petrie.js`. It appears in the converter and the 19·138 index straight away. If you want it drawn, give it a place on a plate in `js/views/plates.js`. Add a relationship to `checks` in the same file and the plate table will test it.

## Layout

```
index.html            the app shell
clock.html            the Chronicon clock engine (reads its ledger from the discoveries)
css/cc.css            the palette: the clock's gold-on-black, and Petrie's sepia plates
js/core.js            year, cycle, palindrome and unit arithmetic (no DOM; runs under Node)
js/registry.js        loads discoveries, keeps drafts, writes discovery files
js/app.js             routing and shared helpers
js/views/*.js         one file per tab
data/petrie.js        the measurements and the relationships tested against them
data/book.js          the text of Cosmic Measurements
data/films.js         the films
discoveries/          one file per discovery, plus manifest.js
tests/run.js          the test suite
tools/serve.js        a local server (optional)
tools/build-single.js bundles everything into dist/cosmic-chronicon.html
```

## Running, testing, bundling

```
npm test              # 25 tests, no dependencies
npm run serve         # http://127.0.0.1:8138/  (optional — index.html also opens straight from disk)
npm run build         # dist/cosmic-chronicon.html — the whole instrument in one file
```

## Roadmap

- **More plates:** the Middle Chamber, the Descending Passage profile, the coffer, and the relieving chambers in detail.
- **Plate export:** download a plate as SVG or print-ready PDF.
- **Source pass:** check every figure in `data/petrie.js` against Petrie's own section and add the page number.
- **Phone layout for the clock.**
- **Import discoveries in bulk** from a spreadsheet (CSV).
- **Search across the book.**
- **Install as an app** (works offline as a PWA).
- **Accessibility audit:** keyboard paths through the plates and the timeline.

## Sources and ownership

- **Code, text, plates and design:** all © 2026 Bradley Rogue. All rights reserved (see [LICENSE](LICENSE)). The code was written by Bradley Rogue with an AI coding assistant.
- **Measurements:** W. M. Flinders Petrie, *The Pyramids and Temples of Gizeh* (1883), public domain, as tabulated in *Cosmic Measurements*, Appendix A.
- **Cycle framework:** the 138-year Phoenix, Nemesis X, the NER and the Annus Mundi count come from the Archaix thesis of Jason Breshears (Archaix.com; *Chronicon*, 2017). The framework is credited wherever it appears and is presented as a thesis, not as established archaeology. No charts, plates or passages of his are reproduced.
- **Network use:** the app makes no network calls of its own. Fonts come from Google Fonts and fall back to system fonts offline. A film loads from YouTube only when you press play.
