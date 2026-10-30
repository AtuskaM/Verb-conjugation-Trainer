"""Build the verb data from compact source lines (tools/src/*.txt) and check every form against corpus data.

Usage:  python tools/build_verbs.py <folder with verb_forms_corpus.json, optional> build   -> tools/new_verbs.json + report
        python tools/build_verbs.py <folder> merge                                       -> updates verbs.json and index.html
The original 97 hand-checked verbs are marked "original": true in verbs.json and are never overwritten.

Source line format (tools/src/*.txt; '#A', '#B', '#C' set the level):
  lemma | aspect i/p/b | partner | english | 1sg / 2sg / 3pl | imperative | past | phrases
  - lemma: '!' prefix marks an irregular verb; reflexive verbs end in ' se' / ' si'
  - present: forms WITHOUT se/si; variants separated by ',' (e.g. 'mohu, můžu (coll.)')
  - imperative: 'dělej' (plural derived) or 'sg / pl' or '-' for none
  - past: masculine form ('dělal'), or 'šel/šla' when the feminine is not masc+'a'
  - phrases: 'pattern = example = english ; pattern = example = english'
"""
import json, re, sys, glob, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SCR = sys.argv[1] if len(sys.argv) > 1 else ''

def split_variants(s):
    return [x.strip() for x in s.split(',') if x.strip()]

def soft_formal(v1, v3, inf=''):
    """add written variants: piju→piji / pijou→pijí; píšu→píši / píšou→píší (soft stems)."""
    out1, out3 = split_variants(v1), split_variants(v3)
    if len(out1) == 1 and re.search(r'[jšžčřcť]u$', out1[0]) and not out1[0].endswith('(coll.)') and (out1[0].endswith('ju') or (re.search(r'[aá]t$', inf) and inf not in ('lhát', 'selhat'))):
        a = out1[0]
        if a.endswith('ju'):
            out1 = [a[:-1] + 'i', a + ' (coll.)']
        else:
            out1 = [a, a[:-1] + 'i']
        if len(out3) == 1 and out3[0].endswith('ou'):
            b = out3[0]
            out3 = [b[:-2] + 'í', b + ' (coll.)'] if a.endswith('ju') else [b, b[:-2] + 'í']
    return ', '.join(out1), ', '.join(out3)

def imp_plural(sg):
    out = []
    for f in split_variants(sg):
        if f.endswith('i'):
            stem = f[:-1]
            out.append(stem + ('ěte' if re.search(r'[dtnpbmvf]$', stem) else 'ete'))
        else:
            out.append(f + 'te')
    return ', '.join(out)

def with_particle(forms, p):
    if not p:
        return forms
    res = []
    for f in split_variants(forms) if isinstance(forms, str) else forms:
        m = re.match(r'^(.*?)( \(coll\.\))?$', f)
        res.append(m.group(1) + ' ' + p + (m.group(2) or ''))
    return ', '.join(res)

def build_entry(parts, level):
    lemma, asp, partner, english, pres, imp, past = [p.strip() for p in parts[:7]]
    phrases = parts[7].strip() if len(parts) > 7 else ''
    irregular = lemma.startswith('!')
    lemma = lemma.lstrip('!')
    p = 'se' if lemma.endswith(' se') else 'si' if lemma.endswith(' si') else ''
    inf = lemma[:-3] if p else lemma
    v1, v2, v3 = [x.strip() for x in pres.split('/')]
    f1, f3 = soft_formal(v1, v3, inf)
    s2 = split_variants(v2)[0]
    if inf == 'být':
        s3, p1, p2 = 'je', 'jsme', 'jste'
    else:
        s3 = s2[:-1] if s2.endswith('š') else s2
        p1, p2 = s3 + 'me', s3 + 'te'
    e = {'verb': lemma, 'level': level, 'source_level': level,
         'aspect': {'i': 'imperfective', 'p': 'perfective', 'b': 'both'}[asp],
         '1sg': with_particle(f1, p), '2sg': with_particle(v2, p), '3sg': with_particle(s3, p),
         '1pl': with_particle(p1, p), '2pl': with_particle(p2, p), '3pl': with_particle(f3, p)}
    if imp == '-':
        e['imp_sg'] = e['imp_pl'] = '—'
    else:
        if '/' in imp:
            isg, ipl = [x.strip() for x in imp.split('/')]
        else:
            isg, ipl = imp, imp_plural(imp)
        e['imp_sg'], e['imp_pl'] = with_particle(isg, p), with_particle(ipl, p)
    if '/' in past:
        pm, pf = [x.strip() for x in past.split('/')]
    else:
        pm = past
        pf = ', '.join(x + 'a' for x in split_variants(past))
    ppl = ', '.join(x[:-1] + 'i' for x in split_variants(pf))
    e['past_m'], e['past_f'], e['past_pl_m'] = with_particle(pm, p), with_particle(pf, p), with_particle(ppl, p)
    e['aspect_partner'] = partner if partner not in ('', '-') else ''
    e['teaching_note'] = ''
    e['english'] = english
    cols = []
    for ph in [x for x in phrases.split(';') if x.strip()]:
        bits = [b.strip() for b in ph.split('=')]
        if len(bits) == 3:
            cols.append({'pattern': bits[0], 'example': bits[1], 'english': bits[2]})
    e['collocations'] = cols
    first1 = split_variants(f1)[0]
    if inf.endswith('ovat') and re.search(r'uj[iu]$', first1):
        g = 'uji'
    elif first1.endswith('ám'):
        g = 'am'
    elif first1.endswith('ím'):
        g = 'im'
    else:
        g = 'u'
    e['conjugation_group'] = g
    e['irregular'] = irregular
    return e

def load_sources():
    entries, level = [], None
    for path in sorted(glob.glob(os.path.join(HERE, 'src', '*.txt'))):
        if os.path.basename(path).startswith(('patterns_', 'sentences_')):
            continue
        for n, line in enumerate(open(path, encoding='utf-8'), 1):
            line = line.strip()
            if not line:
                continue
            if line in ('#A', '#B', '#C'):
                level = line[1]
                continue
            if line.startswith('#'):
                continue
            parts = line.split('|')
            if len(parts) < 7:
                print('BAD LINE', path, n, line)
                continue
            try:
                entries.append(build_entry(parts, level))
            except Exception as ex:
                print('ERROR', path, n, line, ex)
    return entries

# ---------- checking against corpus forms ----------
def strip_p(f):
    return re.sub(r' (se|si)$', '', re.sub(r' \(coll\.\)', '', f)).strip()

def forms_of(e, key):
    return {strip_p(x) for x in split_variants(e.get(key, '')) if x != '—'}

SLOTS = {  # corpus feature keys -> our field
    'Fin|Ind|Pres|1|Sing|': '1sg', 'Fin|Ind|Pres|2|Sing|': '2sg', 'Fin|Ind|Pres|3|Sing|': '3sg',
    'Fin|Ind|Pres|1|Plur|': '1pl', 'Fin|Ind|Pres|2|Plur|': '2pl', 'Fin|Ind|Pres|3|Plur|': '3pl',
    'Fin|Ind|Fut|1|Sing|': '1sg', 'Fin|Ind|Fut|2|Sing|': '2sg', 'Fin|Ind|Fut|3|Sing|': '3sg',
    'Fin|Ind|Fut|1|Plur|': '1pl', 'Fin|Ind|Fut|2|Plur|': '2pl', 'Fin|Ind|Fut|3|Plur|': '3pl',
    'Fin|Imp||2|Sing|': 'imp_sg', 'Fin|Imp||2|Plur|': 'imp_pl',
    'Part||Past||Sing|Masc': 'past_m', 'Part||Past||Sing|Fem': 'past_f', 'Part||Past||Plur|Masc': 'past_pl_m',
}

def check(entries, corpus, unimorph):
    problems = []
    for e in entries:
        inf = strip_p(e['verb'])
        c = corpus.get(inf, {})
        for key, field in SLOTS.items():
            obs = c.get(key)
            if '|Fut|' in key and e['aspect'] == 'imperfective':
                continue
            if not obs or field not in e:
                continue
            ours = forms_of(e, field)
            top, n = max(obs.items(), key=lambda kv: kv[1])
            cand = top[2:] if top.startswith('ne') and top[2:] in ours else top
            if n >= 2 and cand not in ours and not any(o in obs for o in ours):
                if field.startswith('past') or field.startswith('imp') or (field in ('3pl',) and len(ours) > 1):
                    pass
                problems.append(f"{e['verb']}: {field} ours={sorted(ours)} corpus={dict(obs)}")
        u = unimorph.get(inf)
        if u:
            ours_pres = set().union(*[forms_of(e, k) for k in ('1sg', '2sg', '3sg', '1pl', '2pl', '3pl')])
            ref_pres = set().union(*[v for t, v in u.items() if t.startswith('V;IND;PRS;') and 'FORM' not in t]) if any(t.startswith('V;IND;PRS;') for t in u) else set()
            miss = {f for f in ref_pres if ' ' not in f} - ours_pres
            if miss and e['aspect'] != 'perfective':
                problems.append(f"{e['verb']}: present forms in Wiktionary not in ours: {sorted(miss)} (ours {sorted(ours_pres)})")
            ref_past = u.get('V.PTCP;ACT;PRF;MASC;SG', set()) | u.get('V.PTCP;ACT;PRF;FEM;SG', set())
            ours_past = forms_of(e, 'past_m') | forms_of(e, 'past_f')
            if ref_past and not ref_past <= ours_past:
                problems.append(f"{e['verb']}: past forms ours={sorted(ours_past)} wiktionary={sorted(ref_past)}")
            ref_imp = u.get('V;IMP;2;SG', set())
            if ref_imp and not (ref_imp & forms_of(e, 'imp_sg')):
                problems.append(f"{e['verb']}: imperative ours={sorted(forms_of(e, 'imp_sg'))} wiktionary={sorted(ref_imp)}")
    return problems

def load_unimorph(path):
    um = collections.defaultdict(lambda: collections.defaultdict(set))
    if not os.path.exists(path):
        return um
    for line in open(path, encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) >= 3 and p[2].startswith('V'):
            um[p[0]][p[2]].add(p[1])
    return um

def load_patterns():
    """tools/src/patterns_*.txt: verb || pattern = example = English || ...  (replaces the single phrase from the source lines)"""
    pats = {}
    for fn in sorted(glob.glob(os.path.join(HERE, 'src', 'patterns_*.txt'))):
        for n, line in enumerate(open(fn, encoding='utf-8'), 1):
            if line.startswith('#') or not line.strip():
                continue
            parts = [x.strip() for x in line.rstrip('\n').split('||')]
            cols = []
            for ph in parts[1:]:
                bits = [b.strip() for b in ph.split(' = ')]
                if len(bits) != 3 or not all(bits):
                    raise SystemExit(f'{os.path.basename(fn)}:{n}: bad pattern "{ph}"')
                cols.append({'pattern': bits[0], 'example': bits[1], 'english': bits[2]})
            if parts[0] in pats:
                print('duplicate patterns for', parts[0])
            pats[parts[0]] = cols
    return pats


def apply_patterns(entries):
    pats = load_patterns()
    known = {e['verb'] for e in entries}
    missing = [v for v in pats if v not in known]
    if missing:
        print('WARNING - these verbs in patterns_*.txt are not in the trainer (check the spelling of the first word):', missing)
    for e in entries:
        if e['verb'] in pats and not e.get('original'):
            e['collocations'] = pats[e['verb']]
    print('patterns applied for', len(pats) - len(missing), 'verbs')


def write_out(merged):
    json.dump(merged, open(os.path.join(ROOT, 'verbs.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    tag = '<script type="application/json" id="verb-data">'
    a = html.index(tag) + len(tag); b = html.index('</script>', a)
    html = html[:a] + json.dumps(merged, ensure_ascii=False, separators=(',', ':')) + html[b:]
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)


TENSES = ('Present', 'Past', 'Future', 'Conditional', 'Imperative')
FUT_AUX = {'1sg': 'budu', '2sg': 'budeš', '3sg': 'bude', '1pl': 'budeme', '2pl': 'budete', '3pl': 'budou'}
FUT_MOTION = {'jít': ['půjdu', 'půjdeš', 'půjde', 'půjdeme', 'půjdete', 'půjdou'], 'jet': ['pojedu', 'pojedeš', 'pojede', 'pojedeme', 'pojedete', 'pojedou']}
KEYS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl']


def cell(v, k):
    """variants in one cell of the table, without (coll.) notes and without se/si"""
    val = v.get(k) or ''
    if val in ('', '—'):
        return []
    out = []
    for x in val.split(','):
        x = re.sub(r'\s*\(.*?\)', '', x).strip()
        x = re.sub(r' (se|si)$', '', x)
        if x:
            out.append(x.lower())
    return out


def sentence_cells(v, tense, k):
    """all groups of variants that can fill the blank: list of lists"""
    base = re.sub(r' (se|si)$', '', v['verb'])
    if tense == 'Present':
        return [cell(v, k)]
    if tense == 'Future':
        if v['aspect'] == 'perfective':
            return [cell(v, k)]
        if base in FUT_MOTION:
            return [[FUT_MOTION[base][KEYS.index(k)]]]
        if base == 'být':
            return [[FUT_AUX[k]]]
        groups = [[FUT_AUX[k] + ' ' + base]]
        if v['aspect'] == 'both':
            groups.append(cell(v, k))
        return groups
    if tense in ('Past', 'Conditional'):
        m, f, pl = cell(v, 'past_m'), cell(v, 'past_f'), cell(v, 'past_pl_m')
        extra = [x[:-1] + 'o' for x in f] + [x[:-1] + 'y' for x in f]
        return [m, f, pl, extra]
    if tense == 'Imperative':
        sg, pl = cell(v, 'imp_sg'), cell(v, 'imp_pl')
        my = [x[:-2] + 'me' for x in pl if x.endswith('te')]
        return [sg, pl, my]
    return []


PAST_AUX = {'1sg': {'jsem'}, '2sg': {'jsi', 'ses', 'sis'}, '3sg': set(), '1pl': {'jsme'}, '2pl': {'jste'}, '3pl': set()}
COND_AUX = {'1sg': {'bych'}, '2sg': {'bys', 'by'}, '3sg': {'by'}, '1pl': {'bychom'}, '2pl': {'byste'}, '3pl': {'by'}}
FUNC = {'jsem', 'jsi', 'jsme', 'jste', 'bych', 'bys', 'by', 'bychom', 'byste',
        'kdybych', 'kdybys', 'kdyby', 'kdybychom', 'kdybyste', 'se', 'si', 'ses', 'sis'}


def check_compound(tense, person, words):
    """Past/Conditional answer = helper words + one -l form. Returns an error text or ''."""
    func = [w for w in words if w in FUNC]
    aux = [w[3:] if w.startswith('kdyb') else w for w in func if w not in ('se', 'si', 'ses', 'sis')]
    aux = ['by' + a[2:] if a.startswith('by') else a for a in aux]
    refl2 = any(w in ('ses', 'sis') for w in func)
    if tense == 'Past':
        need = PAST_AUX[person]
        if person in ('3sg', '3pl'):
            return 'the 3rd person has no helper verb in the past' if aux else ''
        if not aux and not (person == '2sg' and refl2):
            return 'the helper verb (jsem/jsi/jsme/jste) must be part of the answer'
        if aux and aux[0] not in need:
            return f'helper "{aux[0]}" does not match the person {person}'
        return ''
    if not aux:
        return 'the helper (bych/bys/by/bychom/byste or kdybych…) must be part of the answer'
    if aux[0] not in COND_AUX[person]:
        return f'helper "{aux[0]}" does not match the person {person}'
    if person == '2sg' and aux[0] == 'by' and not refl2:
        return 'for ty use bys (by ses / by sis only with se/si)'
    return ''


def load_sentences(entries):
    """tools/src/sentences_*.txt:  Tense | sentence with ___ | English | verb | person | answer | tip
    The answer may give one form; all written/spoken variants of the same form are added automatically."""
    byverb = {e['verb']: e for e in entries}
    out, problems = [], []
    for fn in sorted(glob.glob(os.path.join(HERE, 'src', 'sentences_*.txt'))):
        lvl = os.path.basename(fn)[10:11].upper()
        for n, line in enumerate(open(fn, encoding='utf-8'), 1):
            if line.startswith('#') or not line.strip():
                continue
            bits = [b.strip() for b in line.rstrip('\n').split(' | ')]
            where = f'{os.path.basename(fn)}:{n}'
            if len(bits) != 7:
                problems.append(f'{where}: needs 7 parts separated by " | " (found {len(bits)})')
                continue
            tense, sent, en, verb, person, ans, tip = bits
            v = byverb.get(verb)
            if tense not in TENSES:
                problems.append(f'{where}: unknown tense {tense}'); continue
            if not v:
                problems.append(f'{where}: verb "{verb}" is not in the trainer'); continue
            if '___' not in sent:
                problems.append(f'{where}: no ___ in the sentence'); continue
            if person not in KEYS:
                problems.append(f'{where}: person must be one of {KEYS}'); continue
            groups = sentence_cells(v, tense, person)
            given = [a.strip() for a in ans.split(' / ') if a.strip()]
            final = []
            for a in given:
                if tense in ('Past', 'Conditional'):
                    words = a.lower().split()
                    content = [w for w in words if w not in FUNC]
                    if len(content) != 1:
                        problems.append(f'{where}: "{a}" should be helper words + one -l form'); continue
                    err = check_compound(tense, person, words)
                    if err:
                        problems.append(f'{where}: "{a}": {err}'); continue
                    part = content[0]
                    grp = next((g for g in groups if part in g), None)
                    neg = ''
                    if grp is None and part.startswith('ne'):
                        grp = next((g for g in groups if part[2:] in g), None)
                        neg = 'ne' if grp else ''
                    if grp is None:
                        problems.append(f'{where}: "{part}" is not a past (-l) form of {verb}; table has {sorted({x for g in groups for x in g})}')
                        continue
                    for x in grp:
                        alts = [' '.join(neg + x if w == part else w for w in words)]
                        if 'bychom' in words or 'kdybychom' in words:
                            alts.append(alts[0].replace('kdybychom', 'kdybysme').replace('bychom', 'bysme'))
                        for x2 in alts:
                            x2 = x2[0].upper() + x2[1:] if a[0].isupper() else x2
                            if x2 not in final:
                                final.append(x2)
                    continue
                low = a.lower()
                neg = ''
                grp = next((g for g in groups if low in g), None)
                if grp is None and low.startswith('ne'):
                    grp = next((g for g in groups if low[2:] in g), None)
                    neg = 'ne' if grp else ''
                if grp is None:
                    problems.append(f'{where}: "{a}" is not a {tense} form of {verb} ({person}); table has {sorted({x for g in groups for x in g})}')
                    continue
                for x in grp:
                    x = neg + x
                    x2 = x[0].upper() + x[1:] if a[0].isupper() else x
                    if x2 not in final:
                        final.append(x2)
            if final:
                out.append([tense, sent, en, verb, person, ' / '.join(final), tip, lvl])
    return out, problems


def write_sentences(entries):
    sents, problems = load_sentences(entries)
    for p in problems:
        print('SENTENCE PROBLEM -', p)
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    tag = '<script type="application/json" id="sentence-data">'
    data = json.dumps(sents, ensure_ascii=False, separators=(',', ':'))
    if tag in html:
        a = html.index(tag) + len(tag); b = html.index('</script>', a)
        html = html[:a] + data + html[b:]
    else:
        vt = '<script type="application/json" id="verb-data">'
        i = html.index(vt)
        html = html[:i] + tag + data + '</script>\n' + html[i:]
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(html)
    print('sentences:', len(sents), 'added,', len(problems), 'problems')


if __name__ == '__main__':
    # No arguments (or "update") = do everything: check the verbs, apply the patterns, update verbs.json and index.html.
    # "build" only checks and writes tools/new_verbs.json; "patterns" only refreshes the common patterns.
    mode = sys.argv[2] if len(sys.argv) > 2 else 'update'
    if mode == 'update':
        mode = 'merge'
    if mode == 'patterns':
        # only refresh the common patterns in verbs.json / index.html
        ents = json.load(open(os.path.join(ROOT, 'verbs.json'), encoding='utf-8'))
        apply_patterns(ents)
        write_out(ents)
        write_sentences(ents)
        sys.exit()
    cpath = os.path.join(SCR, 'verb_forms_corpus.json')
    corpus = json.load(open(cpath, encoding='utf-8')) if os.path.exists(cpath) else {}
    unimorph = load_unimorph(os.path.join(SCR, 'src', 'ces', 'ces'))
    if mode == 'check-existing':
        ents = json.load(open(os.path.join(ROOT, 'verbs.json'), encoding='utf-8'))
    else:
        ents = load_sources()
    probs = check(ents, corpus, unimorph)
    print(len(ents), 'entries;', len(probs), 'possible problems')
    for p in probs:
        print(' -', p)
    if mode == 'build':
        json.dump(ents, open(os.path.join(HERE, 'new_verbs.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('Check only - the trainer was NOT changed. To update it, run:  python tools/build_verbs.py')
    if mode == 'merge':
        # keep the hand-checked original verbs, add/refresh the generated ones, write verbs.json and embed into index.html
        base = [e for e in json.load(open(os.path.join(ROOT, 'verbs.json'), encoding='utf-8')) if e.get('teaching_note') is not None]
        gen = {e['verb']: e for e in ents}
        merged = [e for e in base if e['verb'] not in gen or e.get('original')] + [e for v, e in gen.items() if v not in {b['verb'] for b in base if b.get('original')}]
        # Level A = verbs in the official A1/A2 list (tools/official_A.txt); A verbs not on it move to B
        offp = os.path.join(HERE, 'official_A.txt')
        if os.path.exists(offp):
            off = {}
            for line in open(offp, encoding='utf-8'):
                if line.startswith('#') or not line.strip():
                    continue
                w = line.split('\t')
                off[w[0].strip()] = w[1].strip()
            def base(x):
                return re.sub(r' (se|si)$', '', x)
            offbase = {}
            for k, lv in off.items():
                for cand in (k, k[2:] if k.startswith('ne') and k[2:] not in ('st', 'návidět') else None):
                    if cand:
                        offbase.setdefault(base(cand), lv)
            for e in merged:
                lv = off.get(e['verb']) or offbase.get(base(e['verb']))
                if lv:
                    e['level'], e['official'] = 'A', lv
                else:
                    e.pop('official', None)
                    if e.get('level') == 'A':
                        e['level'] = 'B'
                e['source_level'] = e['level']
        order = {'A': 0, 'B': 1, 'C': 2}
        merged.sort(key=lambda e: (order.get(e.get('level', 'A'), 0), e['verb']))
        apply_patterns(merged)
        write_out(merged)
        write_sentences(merged)
        print('Done: updated', len(merged), 'verbs in verbs.json and index.html. Reload the trainer (Ctrl+F5).')
