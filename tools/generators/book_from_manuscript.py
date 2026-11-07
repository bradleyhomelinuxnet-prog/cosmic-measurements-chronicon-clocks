# Rebuilds data/book.js from the manuscript: pandoc Manuscript.docx -t html --wrap=none -o book.html; python3 book_from_manuscript.py book.html ../../data/book.js
import re, json, sys, html as H
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf8').read()
s = re.sub(r'<figure.*?</figure>', '', s, flags=re.S)
s = re.sub(r'<img[^>]*>', '', s)
s = re.sub(r'<p>\s*\[\]\s*</p>', '', s)
s = re.sub(r'<p>\s*</p>', '', s)
# Corrections made in the app's copy of the text (the manuscript keeps its own wording until revised).
CORRECTIONS = [
    ('equals 3.14159—π to five decimal places', 'equals 3.14—π to two decimal places'),
    ('equals 3.14159—pi to five decimal places', 'equals 3.14—pi to two decimal places'),
    ('yields pi (3.14159…)', 'yields pi (3.14)'),
    ('(11,552 inches) = 3.14159.', '(11,552 inches) = 3.14.'),
    ('measured 0.5236 meters—exactly π/6', 'measured 0.523 meters—π/6 to three decimal places'),
    ('measures exactly π/6 meters (0.5236 meters)', 'measures π/6 meters to three decimal places (0.523 meters)'),
    ('a cubit of precisely 0.5235 meters', 'a cubit of 0.523 meters'),
    ('The value 0.5235 meters approximates', 'The value 0.523 meters approximates'),
    ('Divided by six: 0.5236—remarkably', 'Divided by six: 0.523…—remarkably'),
    ('20.620 inches = 0.5236m = pi/6', '20.620 inches = 0.523m ≈ pi/6'),
    ('20.620 inches = 0.5236m approximately equals pi/6', '20.620 inches = 0.523m approximately equals pi/6'),
]
for a, b in CORRECTIONS:
    s = s.replace(a, b)
parts = re.split(r'(<h1[^>]*>.*?</h1>)', s, flags=re.S)
chap = []
cur = None
def text(x): return re.sub(r'\s+', ' ', H.unescape(re.sub('<[^>]+>', '', x))).strip()
for p in parts:
    m = re.match(r'<h1[^>]*>(.*?)</h1>', p, re.S)
    if m:
        cur = {'h1': text(m.group(1)), 'body': ''}
        chap.append(cur)
    elif cur is not None:
        cur['body'] += p
MINOR={'a','an','and','of','the','in','to','on','for','at','by','or','&'}
def tc(t):
    if not t.isupper(): return t
    out=[]
    for i,w in enumerate(t.split(' ')):
        if re.fullmatch(r'[IVXLC]+[:.,]?|\d[\d,.]*[A-Z]*:?|(AD|BC|GP)[:.,]?', w): out.append(w); continue
        lw=w.lower()
        out.append(lw if (i>0 and lw in MINOR and not out[-1].endswith(':')) else lw[:1].upper()+lw[1:])
    return ' '.join(out)
ROM = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX']
res = []
arc = 'front'
for c in chap:
    t, b = c['h1'], c['body'].strip()
    tl = t.lower().strip('∞ ').strip()
    if tl in ('contents', '', 'section'): continue
    label = ''
    title = tc(t)
    m = re.match(r'^∞?\s*SECTION\s+([IVX]+)\s*∞?$', t)
    if m:
        label = m.group(1)
        h2 = re.search(r'<h2[^>]*>(.*?)</h2>', b, re.S)
        if h2:
            title = tc(text(h2.group(1))); b = b.replace(h2.group(0), '', 1)
        n = ROM.index(label) + 1
        arc = 'ascending' if n < 10 else ('axis' if n == 10 else 'descending')
    else:
        if tl == 'overture': arc = 'overture'
        elif tl in ('copyright','dedication','epigraphs','acknowledgments',"author’s note on methodology"): arc = 'front'
        elif tl in ('prologue','the ancient sites','the uncertain timeline of ancient egypt','the missing construction records','consulting modern construction experts'): arc = 'prologue'
        elif tl.startswith('appendix') or tl == 'appendices': arc = 'appendix'
        elif arc in ('descending','back'): arc = 'back'
        h2 = re.search(r'<h2[^>]*>(.*?)</h2>', b, re.S)
        if h2 and tl in ('overture','prologue','appendices') :
            title = title + ' — ' + tc(text(h2.group(1))); b = b.replace(h2.group(0), '', 1)
    # demote headings
    b = re.sub(r'<h2', '<h3', b); b = re.sub(r'</h2>', '</h3>', b)
    b = re.sub(r' id="[^"]*"', '', b)
    if len(text(b)) < 20: continue
    cid = ('s' + label.lower()) if label else re.sub(r'[^a-z0-9]+', '-', tl).strip('-')
    # dedupe ids
    base = cid; k = 2
    while any(r['id'] == cid for r in res): cid = f'{base}-{k}'; k += 1
    res.append({'id': cid, 'label': label, 'title': title.strip('∞ ').strip(), 'arc': arc, 'html': b})
js = '/* Generated from the Cosmic Measurements manuscript. © 2026 Bradley Rogue. All rights reserved. */\n'
js += 'window.CC = window.CC || {};\nCC.book = ' + json.dumps(res, ensure_ascii=False, indent=0) + ';\n'
open(out, 'w', encoding='utf8').write(js)
for r in res: print(r['arc'][:4], r['label'] or '-', r['id'], '|', r['title'][:60], len(r['html']))
