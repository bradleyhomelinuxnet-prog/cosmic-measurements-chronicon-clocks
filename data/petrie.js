/* The measurements.
   Figures are W. M. Flinders Petrie's, from The Pyramids and Temples of Gizeh (1883, public domain),
   as tabulated in Cosmic Measurements, Appendix A. "approx" marks figures the book gives as approximate.
   Add a figure here and it appears in the plates, the converter and the 19·138 index.
   © 2026 Bradley Rogue. All rights reserved. */
window.CC = window.CC || {};
CC.petrie = {
  source: 'W. M. Flinders Petrie, The Pyramids and Temples of Gizeh (London, 1883)',
  features: [
    { id: 'base-north', group: 'Base', name: 'North side', value: 9069.4, unit: 'in', ref: 'Petrie §39', section: 'appendix-a' },
    { id: 'base-south', group: 'Base', name: 'South side', value: 9069.5, unit: 'in', ref: 'Petrie §39', section: 'appendix-a' },
    { id: 'base-east', group: 'Base', name: 'East side', value: 9067.7, unit: 'in', ref: 'Petrie §39', section: 'appendix-a' },
    { id: 'base-west', group: 'Base', name: 'West side', value: 9068.6, unit: 'in', ref: 'Petrie §39', section: 'appendix-a' },
    { id: 'base-mean', group: 'Base', name: 'Mean base side', value: 9068.8, unit: 'in', ref: 'Petrie §39', section: 'si' },
    { id: 'height-original', group: 'Profile', name: 'Original height', value: 5776, unit: 'in', tolerance: 7, ref: 'Petrie §39', section: 'si' },
    { id: 'height-current', group: 'Profile', name: 'Present height', value: 5450, unit: 'in', approx: true, ref: 'Cosmic Measurements App. A', section: 'appendix-a' },
    { id: 'slope', group: 'Profile', name: 'Slope angle', value: 51.8667, unit: 'deg', display: '51° 52′', ref: 'Petrie §39', section: 'si' },
    { id: 'vertical-138', group: 'Profile', name: 'Foundation to Upper Chamber floor', value: 138, unit: 'ft', approx: true, ref: 'Cosmic Measurements §IX', section: 'six' },
    { id: 'descending-angle', group: 'Passages', name: 'Descending Passage angle', value: 26.5231, unit: 'deg', display: '26° 31′ 23″', ref: 'Petrie', section: 'sv' },
    { id: 'descending-length', group: 'Passages', name: 'Descending Passage length', value: 345, unit: 'ft', approx: true, ref: 'Cosmic Measurements §V', section: 'sv' },
    { id: 'upper-width', group: 'Upper Chamber', formerly: "King's Chamber", name: 'Upper Chamber width (N–S)', value: 206.13, unit: 'in', ref: 'Petrie §47', section: 'svii' },
    { id: 'upper-length', group: 'Upper Chamber', formerly: "King's Chamber", name: 'Upper Chamber length (E–W)', value: 412.26, unit: 'in', ref: 'Petrie §47', section: 'svii' },
    { id: 'upper-height', group: 'Upper Chamber', formerly: "King's Chamber", name: 'Upper Chamber height', value: 230.09, unit: 'in', ref: 'Petrie §47', section: 'svii' },
    { id: 'relieving-beams', group: 'Upper Chamber', name: 'Granite beams in the relieving chambers', value: 43, unit: 'count', approx: true, ref: 'Cosmic Measurements App. A', section: 'svii' },
    { id: 'gallery-length', group: 'Grand Gallery', name: 'Grand Gallery length', value: 1815.5, unit: 'in', ref: 'Petrie', section: 'sviii' },
    { id: 'gallery-height', group: 'Grand Gallery', name: 'Grand Gallery height', value: 28, unit: 'ft', approx: true, ref: 'Cosmic Measurements App. A', section: 'sviii' },
    { id: 'gallery-courses', group: 'Grand Gallery', name: 'Corbel courses', value: 7, unit: 'count', ref: 'Cosmic Measurements App. A', section: 'sviii' },
    { id: 'gallery-slots', group: 'Grand Gallery', name: 'Slot pairs', value: 27, unit: 'count', ref: 'Cosmic Measurements App. A', section: 'sviii' },
    { id: 'lower-ceiling', group: 'Lower Chamber', formerly: 'Subterranean Chamber', name: 'Lower Chamber ceiling height', value: 138, unit: 'in', approx: true, ref: 'Cosmic Measurements App. A', section: 'sviii' },
    { id: 'lower-width', group: 'Lower Chamber', formerly: 'Subterranean Chamber', name: 'Lower Chamber width', value: 553, unit: 'in', approx: true, ref: 'Cosmic Measurements App. A', section: 'sviii' },
    { id: 'cubit', group: 'Units', name: 'Royal cubit', value: 20.620, unit: 'in', ref: 'Petrie', section: 'the-precision-of-the-royal-cubit' }
  ],

  /* Relationships the book draws. Each is recomputed live from the figures above;
     "claim" is what the text states, so the plate can show both side by side.
     "places" judges a claim at the precision the text gives it: 3.14 holds if the result rounds to 3.14;
     with "truncate" the digits are cut, not rounded: 0.52375 and 0.52360 both read 0.523. */
  checks: [
    { id: 'pi-perimeter', name: 'Base perimeter ÷ twice the height', expr: function (f) { return 4 * f['base-mean'] / (2 * f['height-original']); }, target: Math.PI, targetLabel: 'π', claim: '3.14', places: 2, section: 'sxix' },
    { id: 'cubit-pi6', name: 'Royal cubit in metres vs π ÷ 6', expr: function (f) { return f.cubit * 0.0254; }, target: Math.PI / 6, targetLabel: 'π/6', claim: '0.523 m', places: 3, truncate: true, section: 'the-precision-of-the-royal-cubit' },
    { id: 'upper-ratio', name: 'Upper Chamber length ÷ width', expr: function (f) { return f['upper-length'] / f['upper-width']; }, target: 2, targetLabel: '2 : 1', claim: '2 : 1', section: 'svii' },
    { id: 'upper-width-cubits', name: 'Upper Chamber width in cubits', expr: function (f) { return f['upper-width'] / f.cubit; }, target: 10, targetLabel: '10', claim: '10 cubits', section: 'svii' },
    { id: 'upper-length-cubits', name: 'Upper Chamber length in cubits', expr: function (f) { return f['upper-length'] / f.cubit; }, target: 20, targetLabel: '20', claim: '20 cubits', section: 'svii' },
    { id: 'upper-pi', name: 'Upper Chamber floor perimeter ÷ twice the height', expr: function (f) { return 2 * (f['upper-length'] + f['upper-width']) / (2 * f['upper-height']); }, target: Math.PI, targetLabel: 'π', claim: '3.14159', section: 'svii' },
    { id: 'gallery-cubits', name: 'Grand Gallery length in cubits', expr: function (f) { return f['gallery-length'] / f.cubit; }, target: 88, targetLabel: '88', claim: '88 cubits', section: 'sviii' },
    { id: 'base-cubits', name: 'Mean base side in cubits', expr: function (f) { return f['base-mean'] / f.cubit; }, target: 440, targetLabel: '440', claim: '', section: 'si' },
    { id: 'height-cubits', name: 'Original height in cubits', expr: function (f) { return f['height-original'] / f.cubit; }, target: 280, targetLabel: '280', claim: '', section: 'si' },
    { id: 'lower-4x138', name: 'Lower Chamber width ÷ 138', expr: function (f) { return f['lower-width'] / 138; }, target: 4, targetLabel: '4', claim: '≈ 4', section: 'sviii' },
    { id: 'beams-2040', name: '138 × relieving beams (as AM year)', expr: function (f) { return 138 * f['relieving-beams']; }, target: 5934, targetLabel: 'AM 5934 = 2040 AD', claim: '5,934', section: 'sxiii' }
  ]
};
