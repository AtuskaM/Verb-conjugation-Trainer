/* Practice additions:
   - past and conditional for all persons, imperative "my" (let's)
   - multiple-choice exercises: aspect pairs, verbs of motion, which group
   - "My mistakes" review and progress saved in this browser
   Loaded after reference.js. */

/* ---------- small helpers ---------- */
const store={get(k,d){try{const v=localStorage.getItem('verbTrainer.'+k);return v?JSON.parse(v):d;}catch{return d;}},set(k,v){try{localStorage.setItem('verbTrainer.'+k,JSON.stringify(v));}catch{}}};
const shuffled=a=>shuffle([...a]);
const STUB={verb:'',english:'',aspect:'imperfective',conjugation_group:'am',collocations:[],aspect_partner:''};
const CHOICE_MODES=['aspect','motion','groups'];
const levelOK=v=>$('cefr').value==='all'||(v.level||'A')===$('cefr').value;
const filterOK=c=>!c.v||(($('group').value==='all'||c.v.conjugation_group===$('group').value)&&($('aspect').value==='all'||c.v.aspect===$('aspect').value||c.v.aspect==='both')&&levelOK(c.v));

/* ---------- past & conditional for every person, imperative "my" ---------- */
const PAST_PERSONS=[
 {p:'já (muž)',en:'I (man)',g:'m',aux:['jsem','bych'],key:'1sg'},{p:'já (žena)',en:'I (woman)',g:'f',aux:['jsem','bych'],key:'1sg'},
 {p:'ty (muž)',en:'you (man)',g:'m',aux:['jsi','bys'],key:'2sg'},{p:'ty (žena)',en:'you (woman)',g:'f',aux:['jsi','bys'],key:'2sg'},
 {p:'on',en:'he',g:'m',aux:['','by'],key:'3sg'},{p:'ona',en:'she',g:'f',aux:['','by'],key:'3sg'},
 {p:'my',en:'we',g:'pl',aux:['jsme','bychom'],key:'1pl'},{p:'vy (více lidí)',en:'you (plural)',g:'pl',aux:['jste','byste'],key:'2pl'},{p:'oni',en:'they',g:'pl',aux:['','by'],key:'3pl'}
];
function pastAnswers(v,P,cond){const p=reflex(v);const src=P.g==='m'?v.past_m:P.g==='f'?v.past_f:v.past_pl_m;const aux=P.aux[cond?1:0];const out=[];
 for(const f of finite(v,P.g==='m'?'past_m':P.g==='f'?'past_f':'past_pl_m')){const stem=p&&f.endsWith(' '+p)?f.slice(0,-p.length-1):f;
  if(!aux){out.push(stem+(p?' '+p:''));if(p)out.push(p+' '+stem);}
  else if(p&&P.key==='2sg'){if(cond)out.push(stem+' by '+p+'s','by '+p+'s '+stem);else out.push(stem+' '+p+'s',stem+' jsi '+p,'jsi '+p+' '+stem);}
  else{out.push(stem+' '+aux+(p?' '+p:''),aux+' '+(p?p+' ':'')+stem);}}
 return [...new Set(out.map(clean))];}
function extraConjCards(){const level=$('level').value,cards=[];
 for(const v of verbs){
  for(const [lvl,cond] of [['Past',false],['Conditional',true]]){if(level!==lvl&&level!=='Mixed')continue;
   for(const P of PAST_PERSONS){const answers=pastAnswers(v,P,cond);if(answers.length)cards.push({kind:'conjugation',level:lvl,verb:v.verb,v,person:P.p,personEn:P.en,key:P.key,P,answers,extra:true});}}
  if((level==='Imperative'||level==='Mixed')&&v.imp_pl&&v.imp_pl!=='—'){const ind=finite(v,'1pl').map(clean);
   const my=finite(v,'imp_pl').map(x=>{const w=x.split(' ');if(w[0].endsWith('te'))w[0]=w[0].slice(0,-2)+'me';return clean(w.join(' '));});
   const keep=my.length>1?my.filter(x=>!ind.includes(x)):my;cards.push({kind:'conjugation',level:'Imperative',verb:v.verb,v,person:'my',personEn:'we (let’s)',key:'imp_my',answers:keep,extra:true});}}
 return cards;}
function extraExplanation(c){const v=c.v,ans=c.answers[0];const P=c.P;
 if(c.level==='Imperative')return B(`Pro my: vezměte tvar vy (${first(v.imp_pl)}) a místo -te dejte -me → ${ans}.`,`For my (let’s): take the vy form (${first(v.imp_pl)}) and change -te to -me → ${ans}.`);
 const forms=`${first(v.past_m)} / ${first(v.past_f)} / ${first(v.past_pl_m)}`;
 if(c.level==='Past'){const cz={'1sg':'Pro já přidejte jsem.','2sg':'Pro ty přidejte jsi (se + jsi = ses, si + jsi = sis).','3sg':'Ve 3. osobě se nic nepřidává.','1pl':'Pro my přidejte jsme.','2pl':'Pro vy přidejte jste.','3pl':'Ve 3. osobě se nic nepřidává.'}[P.key];
  const en={'1sg':'Add jsem for já.','2sg':'Add jsi for ty (se + jsi = ses, si + jsi = sis).','3sg':'The 3rd person adds nothing.','1pl':'Add jsme for my.','2pl':'Add jste for vy.','3pl':'The 3rd person adds nothing.'}[P.key];
  return B(`Minulý tvar ${v.verb}: ${forms} (muž / žena / množné). ${cz} Výsledek: ${ans}.`,`Past of ${v.verb} (${v.english}): ${forms} (man / woman / plural). ${en} Answer: ${ans}.`)+' '+aspectText(v);}
 const aux=P.aux[1];return B(`Podmiňovací: minulý tvar (${forms}) + ${aux}. Výsledek: ${ans}.`,`Conditional: past form (${forms}) + ${aux}. Answer: ${ans}.`);}

/* ---------- multiple-choice exercises ---------- */
const MOTION_Q=[
 ['Teď ___ do školy.','I’m going to school now.',['jdu','chodím'],0,['Teď = právě teď, jedním směrem → jít.','Teď (now) = one direction, right now → jít.']],
 ['Každý den ___ do školy pěšky.','I walk to school every day.',['jdu','chodím'],1,['Každý den = pravidelně → chodit.','Každý den (every day) = regularly → chodit.']],
 ['Zítra ___ do Brna vlakem.','Tomorrow I’ll go to Brno by train.',['pojedu','budu jezdit'],0,['Jedna cesta v budoucnosti: po- + jet → pojedu.','One trip in the future: po- + jet → pojedu.']],
 ['V létě ___ často k moři.','In summer we often go to the seaside.',['jedeme','jezdíme'],1,['Často = opakovaně → jezdit.','Často (often) = repeatedly → jezdit.']],
 ['Kam ___? – Do práce.','Where are you going? – To work.',['jdeš','chodíš'],0,['Ptáme se na cestu právě teď → jít.','We ask about the trip happening now → jít.']],
 ['Moje malá dcera už ___.','My little daughter can already walk.',['jde','chodí'],1,['Schopnost, pohyb bez jednoho směru → chodit.','An ability, movement with no single direction → chodit.']],
 ['Ptáci ___ nad řekou.','Birds are flying around over the river.',['letí','létají'],1,['Sem a tam, bez jednoho směru → létat.','Back and forth, no single direction → létat.']],
 ['Letadlo do Londýna ___ v osm.','The plane to London flies at eight.',['letí','létá'],0,['Jeden konkrétní let jedním směrem → letět.','One particular flight in one direction → letět.']],
 ['Zítra ti ___ ten dárek.','I’ll bring you that present tomorrow.',['přinesu','budu přinést'],0,['Přinést je dokonavé: budoucnost bez budu → přinesu.','Přinést is perfective: future without budu → přinesu.']],
 ['Každé ráno ___ děti do školky.','Every morning I take the children to kindergarten.',['vedu','vodím'],1,['Každé ráno = pravidelně → vodit.','Každé ráno (every morning) = regularly → vodit.']],
 ['Teď ___ psa na procházku.','I’m taking the dog for a walk now.',['vedu','vodím'],0,['Teď, jedním směrem → vést.','Now, one direction → vést.']],
 ['Včera jsem ___ do kina.','Yesterday I went to the cinema.',['šel','chodil'],0,['Jedna cesta včera → jít (šel).','One trip yesterday → jít (šel).']],
 ['Jako dítě jsem ___ do kina každou sobotu.','As a child I went to the cinema every Saturday.',['šel','chodil'],1,['Každou sobotu = opakovaně → chodit (chodil).','Každou sobotu (every Saturday) = repeatedly → chodit (chodil).']],
 ['Pozor, ___ autobus!','Watch out, a bus is coming!',['jede','jezdí'],0,['Právě teď, jedním směrem → jet.','Right now, one direction → jet.']],
 ['Tady ___ autobusy každých deset minut.','Buses run here every ten minutes.',['jedou','jezdí'],1,['Pravidelně → jezdit.','Regularly → jezdit.']],
 ['Proč ___ tak rychle? Máme čas.','Why are you running so fast? We have time.',['běžíš','běháš'],0,['Teď, jedním směrem → běžet.','Now, one direction → běžet.']],
 ['Ráno ___ v parku.','In the mornings I go running in the park.',['běžím','běhám'],1,['Pravidelný sport → běhat.','A regular activity → běhat.']],
 ['V zimě ___ teplý kabát.','In winter I wear a warm coat.',['nesu','nosím'],1,['Nosit = také „mít na sobě“ pravidelně.','Nosit also means to wear (regularly).']],
 ['Já ti ___ tu těžkou tašku.','I’ll carry that heavy bag for you.',['ponesu','budu nosit'],0,['Jedna cesta v budoucnosti: po- + nést → ponesu.','One trip in the future: po- + nést → ponesu.']],
 ['Babička k nám ___ každou neděli.','Grandma comes to us every Sunday.',['přijde','chodí'],1,['Každou neděli = opakovaně → chodit (přijde = jednou, v budoucnu).','Každou neděli (every Sunday) = repeatedly → chodit (přijde = once, in the future).']]
];
const GROUP_KEYS=['am','im','uji','u'];
function expectedGroup(inf){const w=inf.replace(/ (se|si)$/,'');if(w.endsWith('ovat'))return 'uji';if(w.endsWith('nout'))return 'u';if(/[aá]t$/.test(w))return 'am';if(/(et|ět|it)$/.test(w)&&!/ít$/.test(w))return 'im';return 'u';}
function choiceCards(mode){const cards=[];
 if(mode==='aspect')return aspectCards();
else if(mode==='motion'){MOTION_Q.forEach(([s,en,opts,ai,why],i)=>cards.push({kind:'choice',type:'motion',level:'Mixed',verb:'',person:'',personEn:'',v:STUB,uid:'motion|'+i,
   prompt:s,translation:en,options:shuffled(opts),answer:opts[ai],answers:[clean(opts[ai])],
   explain:()=>B(...why),hint:()=>B('Jeden směr, právě teď → jít, jet, letět, nést, vést, běžet. Pravidelně / opakovaně → chodit, jezdit, létat, nosit, vodit, běhat.','One direction, right now → jít, jet, letět, nést, vést, běžet. Regularly / repeatedly → chodit, jezdit, létat, nosit, vodit, běhat.'),
   say:a=>a?s.replace('___',opts[ai]):s.replace('___','…')}));}
 else if(mode==='groups'){for(const v of verbs){if(v.verb==='být'||!levelOK(v))continue;const g=v.conjugation_group,exp=expectedGroup(v.verb),ja=first(v['1sg']);
   cards.push({kind:'choice',type:'groups',level:'Mixed',verb:v.verb,person:'',personEn:'',v,uid:'groups|'+v.verb,
    prompt:B('Do které skupiny patří toto sloveso?','Which group is this verb in?'),translation:v.english,big:v.verb,
    options:GROUP_KEYS.map(k=>groupInfo[k].name),answer:groupInfo[g].name,answers:[clean(groupInfo[g].name)],
    explain:()=>g===exp?B(`${v.verb} → já ${ja}: ${groupInfo[g].name}.`,`${v.verb} → I form ${ja}: ${groupInfo[g].name}.`)+(g==='u'&&/nout( s[ei])?$/.test(v.verb)?' '+B('Slovesa na -nout: -nu, -neš…','-nout verbs: -nu, -neš…'):''):B(`Výjimka! Podle infinitivu by patřilo do skupiny ${groupInfo[exp].name}, ale časuje se: já ${ja} → ${groupInfo[g].name}.`,`Exception! By its infinitive it would be ${groupInfo[exp].name}, but it conjugates: I form ${ja} → ${groupInfo[g].name}.`),
    hint:()=>B('Podívejte se na konec infinitivu: -at → 1, -et/-ět/-it → 2, -ovat → 3, -ít/-íst/-nout… → 4. Pozor na výjimky!','Look at the end of the infinitive: -at → 1, -et/-ět/-it → 2, -ovat → 3, -ít/-íst/-nout… → 4. Watch out for exceptions!'),
    say:a=>a?v.verb+', '+ja:v.verb});}}
 return cards;}

/* ---------- aspect: every verb pair, with the same filters as the other exercises ---------- */
const ASPECT_PREFIXES=['vy','za','na','po','u','s','z','pro','pře','při','o','od','do','roz','v','ob','pod','vz','se','ze','ode','roze','vze'];
let aspectPairsCache=null;
function aspectPairs(){if(aspectPairsCache)return aspectPairsCache;const byVerb=new Map(verbs.map(v=>[v.verb,v]));const seen=new Map();
 const add=(i,p,en)=>{const k=i+'|'+p;if(!seen.has(k))seen.set(k,{i,p,en,I:byVerb.get(i)||null,P:byVerb.get(p)||null});};
 for(const v of verbs){if(!v.aspect_partner||v.aspect==='both')continue;for(const q of v.aspect_partner.split(',').map(x=>x.trim()).filter(Boolean)){const w=byVerb.get(q);
  if(w&&(w.aspect===v.aspect||w.aspect==='both'))continue;if(v.aspect==='imperfective')add(v.verb,q,v.english);else add(q,v.verb,w?w.english:v.english);}}
 for(const [,rows] of PAIRS_A)for(const r of rows)if(!/\(/.test(r[0]))add(r[0],r[1],r[2]);
 for(const [,rows] of PAIRS_B)for(const r of rows)if(!/\(/.test(r[0]))add(r[0],r[1],r[2]);
 return aspectPairsCache=[...seen.values()];}
function pairKind(pr){const b=x=>x.replace(/ (se|si)$/,'');const i=b(pr.i),p=b(pr.p);
 const pre=ASPECT_PREFIXES.find(x=>p===x+i);if(pre)return {k:'prefix',pre};if(i.length>p.length)return {k:'longer'};return {k:'irregular'};}
function pairWhy(pr){const r=pairKind(pr);
 if(r.k==='prefix')return B(`${pr.p} = ${r.pre}- + ${pr.i}: sloveso s předponou je dokonavé.`,`${pr.p} = ${r.pre}- + ${pr.i}: the verb with the prefix is perfective.`);
 if(r.k==='longer')return B(`${pr.i} – ${pr.p}: delší sloveso (přípona) je nedokonavé, kratší dokonavé.`,`${pr.i} – ${pr.p}: the longer verb (suffix) is imperfective, the shorter one perfective.`);
 return B(`${pr.i} – ${pr.p}: nepravidelná dvojice, naučte se ji nazpaměť (nedokonavé ${pr.i}, dokonavé ${pr.p}).`,`${pr.i} – ${pr.p}: an irregular pair, learn it by heart (imperfective ${pr.i}, perfective ${pr.p}).`);}
const aspFilter=v=>!!v&&($('group').value==='all'||v.conjugation_group===$('group').value)&&levelOK(v);
const aspWant=isPf=>$('aspect').value==='all'||$('aspect').value===(isPf?'perfective':'imperfective');
function aspCard(pr,type,isPf,o){const ans=isPf?o.pf:o.impf;
 return {kind:'choice',type:'aspect',sub:type,level:type,verb:isPf?pr.p:pr.i,person:'',personEn:'',v:(isPf?pr.P:pr.I)||STUB,uid:`aspect|${type}|${pr.i}|${pr.p}|${isPf}`,
  prompt:o.prompt,big:o.big,translation:o.tr||pr.en,options:shuffled(o.opts||[o.impf,o.pf]),answer:ans,answers:[clean(ans)],
  explain:()=>o.why(isPf)+' '+pairWhy(pr),hint:()=>o.hint(),say:a=>a?ans:(o.big||pr.i+', '+pr.p)};}
const ASP_TIME=/\b(každ\p{L}*|ráno|večer\p{L}*|v noci|brzy|brzo|často|denně|týdně|dnes|zítra|včera|pozdě|včas|hned|teď|v (pondělí|úterý|středu|čtvrtek|pátek|sobotu|neděli|létě|zimě|září)|v \d|o přestávce|v poledne|předem|dlouho|celý den|celou noc|týden|rok)\b/iu;
const ASP_CLITICS=new Set(['se','si','mi','ti','mu','ho','ji','je','jí','nám','vám','jim','tě','mě','to']);
function aspComplement(v){if(!v)return null;const base=v.verb.replace(/ (se|si)$/,''),r=reflex(v);
 for(const c of v.collocations||[]){let ex=c.example.trim().replace(/[.!?]$/,'');if(!ex.toLowerCase().startsWith(base+' '))continue;let rest=ex.slice(base.length+1);
  if(r&&rest.startsWith(r+' '))rest=rest.slice(r.length+1);if(!rest||ASP_CLITICS.has(rest.split(' ')[0].toLowerCase())||ASP_TIME.test(rest))continue;return {rest,en:c.english};}
 return null;}

function aspectCards(){const t=$('level').value,cards=[];const P1=PAST_PERSONS[0];
 for(const pr of aspectPairs()){
  // 1) which is perfective / imperfective (all pairs, also partners that have no table yet)
  if(t==='Mixed')for(const isPf of [true,false]){const v=isPf?(pr.P||pr.I):(pr.I||pr.P);if(!aspWant(isPf)||!aspFilter(v))continue;
   cards.push(aspCard(pr,'Mixed',isPf,{impf:pr.i,pf:pr.p,prompt:isPf?B('Které sloveso je dokonavé?','Which verb is perfective?'):B('Které sloveso je nedokonavé?','Which verb is imperfective?'),
    why:pf=>pf?B(`${pr.p} je dokonavé (jedna dokončená akce, výsledek).`,`${pr.p} is perfective (one completed action, a result).`):B(`${pr.i} je nedokonavé (průběh, opakování).`,`${pr.i} is imperfective (process, repetition).`),
    hint:()=>pairKind(pr).k==='prefix'?B('Hledejte předponu — sloveso s předponou je dokonavé.','Look for a prefix — the verb with the prefix is perfective.'):B('Bez předpony: delší sloveso je nedokonavé.','No prefix: the longer verb is imperfective.')}));}
  if(!pr.I||!pr.P)continue;
  const I=pr.I,Pv=pr.P;
  // 2) present: only the imperfective means "now"
  if((t==='Present'||t==='Mixed')&&aspWant(false)&&aspFilter(I)){const rI=reflex(I),rP=reflex(Pv);const strip=x=>x.replace(/ (se|si)$/,'');const a=strip(first(I['1sg'])),b=strip(first(Pv['1sg']));const cp=aspComplement(I)||aspComplement(Pv);if(a&&b&&a!==b&&cp&&rI===rP)
   cards.push(aspCard(pr,'Present',false,{impf:a,pf:b,big:`Teď ${rI?rI+' ':''}___ ${cp.rest}.`,tr:`Now ___ — ${cp.en}`,prompt:B('Který tvar znamená, že se to děje teď (přítomnost)?','Which form means it is happening now (present)?'),
    why:()=>B(`${a} = přítomnost (nedokonavé). ${b} = budoucnost: dokonavé sloveso nemá přítomný čas.`,`${a} = present (imperfective). ${b} = future: a perfective verb has no present tense.`),
    hint:()=>B('Dokonavé sloveso nemá přítomný čas — jeho „přítomný“ tvar znamená budoucnost.','A perfective verb has no present tense — its “present” form means future.')}));}
  // 3) past and conditional: a signal word decides (každý den → imperfective, konečně / hned → perfective)
  const auxFirst=(v,cond)=>{const xs=pastAnswers(v,P1,cond);return xs.find(x=>/^(jsem|bych)\b/.test(x))||xs[0];};
  const FR={impf:['Každý den ___.','Every day ___.'],Past:['Konečně ___.','Finally ___.'],Conditional:['Hned ___.','Right away ___.'],Future:['Hned ___.','Right away ___.']};
  for(const [tt,cond] of [['Past',false],['Conditional',true]]){if(t!==tt&&t!=='Mixed')continue;
   const a=auxFirst(I,cond),b=auxFirst(Pv,cond);if(!a||!b||a===b)continue;
   for(const isPf of [true,false]){if(!aspWant(isPf)||!aspFilter(isPf?Pv:I))continue;const cp=aspComplement(isPf?Pv:I)||aspComplement(isPf?I:Pv);if(!cp)continue;const fr0=isPf?FR[tt]:FR.impf;const fr=[fr0[0].replace('___.','___ '+cp.rest+'.'),fr0[1]];
    cards.push(aspCard(pr,tt,isPf,{impf:a,pf:b,big:fr[0],tr:`${fr[1]} — ${cp.en}`,
     prompt:cond?B('Podmiňovací způsob (já, muž): doplňte správný vid.','Conditional (I, man): choose the right aspect.'):B('Minulý čas (já, muž): doplňte správný vid.','Past (I, man): choose the right aspect.'),
     why:pf=>pf?B(`${fr[0].replace('___',b)} — ${fr[0].split(' ')[0]} → jednou, hotovo, výsledek → dokonavé.`,`${fr[0].replace('___',b)} — ${fr[1].split(' ___')[0]} → once, finished, a result → perfective.`):B(`${fr[0].replace('___',a)} — každý den → opakování → nedokonavé.`,`${fr[0].replace('___',a)} — every day → repetition → imperfective.`),
     hint:()=>B('Každý den, často, dlouho → nedokonavé. Konečně, hned, celý → dokonavé.','Každý den, často, dlouho (every day, often, long) → imperfective. Konečně, hned, celý (finally, right away, whole) → perfective.')}));}}
  // 4) future: budu + imperfective, or the perfective form; never budu + perfective
  if(t==='Future'||t==='Mixed'){const base=I.verb.replace(/ (se|si)$/,''),pt=reflex(I);const fi=futureMotion[I.verb]?futureMotion[I.verb][0]:'budu '+base;
   const fp=first(Pv['1sg']).replace(/ (se|si)$/,'');const pb=Pv.verb.replace(/ (se|si)$/,'');const wrong='budu '+pb;
   if(fp&&pt===reflex(Pv))for(const isPf of [true,false]){if(!aspWant(isPf)||!aspFilter(isPf?Pv:I))continue;const cp=aspComplement(isPf?Pv:I)||aspComplement(isPf?I:Pv);if(!cp)continue;const fr0=isPf?FR.Future:FR.impf;const fr=[fr0[0].replace('___.',(pt?pt+' ':'')+'___ '+cp.rest+'.'),fr0[1]];
    cards.push(aspCard(pr,'Future',isPf,{impf:fi,pf:fp,opts:[fi,fp,wrong],big:fr[0],tr:`${fr[1]} — ${cp.en}`,
     prompt:B('Budoucí čas (já): doplňte správný vid.','Future (I): choose the right aspect.'),
     why:pf=>(pf?B(`${fr[0].replace('___',fp)} — jednou a hotovo → dokonavé; tvar přítomného času znamená budoucnost.`,`Hned ${fp} — once and finished → perfective; the present-tense form means future.`):B(`${fr[0].replace('___',fi)} — opakování → nedokonavé: budu + infinitiv.`,`Každý den ${fi} — repetition → imperfective: budu + infinitive.`))+' '+B(`„${wrong}“ neexistuje: nikdy budu + dokonavé.`,`“${wrong}” is wrong: never budu + a perfective verb.`),
     hint:()=>B('Nedokonavé: budu + infinitiv. Dokonavé: tvar přítomného času = budoucnost. Nikdy budu + dokonavé!','Imperfective: budu + infinitive. Perfective: the present form = future. Never budu + perfective!')}));}}
  // 5) imperative: a negative command is (almost always) imperfective
  if((t==='Imperative'||t==='Mixed')&&aspWant(false)&&aspFilter(I)){const a=finite(I,'imp_sg')[0],b=finite(Pv,'imp_sg')[0];const cp=aspComplement(I)||aspComplement(Pv);if(a&&b&&a!==b&&cp){const na='Ne'+a,nb='Ne'+b;
   cards.push(aspCard(pr,'Imperative',false,{impf:na,pf:nb,big:`___ ${cp.rest}!`,tr:`Don’t… (ty) — ${cp.en}`,prompt:B('Záporný rozkaz: který tvar se používá?','Negative command: which form is used?'),
    why:()=>B(`Záporný rozkaz je nedokonavý: ${na} ${cp.rest}! (kladně často dokonavý: ${b[0].toUpperCase()+b.slice(1)}!).`,`A negative command is imperfective: ${na} (a positive one is often perfective: ${b[0].toUpperCase()+b.slice(1)}!).`),
    hint:()=>B('Kladný rozkaz bývá dokonavý, záporný nedokonavý.','Positive commands are often perfective, negative ones imperfective.')}));}}}
 return cards;}

function aspectHowto(c){const T2={Mixed:['Jak poznat vid','How to tell the aspect'],Present:['Vid v přítomném čase','Aspect in the present'],Past:['Vid v minulém čase','Aspect in the past'],Future:['Vid v budoucím čase','Aspect in the future'],Conditional:['Vid v podmiňovacím způsobu','Aspect in the conditional'],Imperative:['Vid v rozkazu','Aspect in commands']}[c.sub]||['Vid','Aspect'];
 $('howto-title').textContent=B(...T2);
 const core=`<div class="formula">${esc(B('nedokonavé = průběh, opakování, zvyk · dokonavé = jedna dokončená akce, výsledek','imperfective = process, repetition, habit · perfective = one completed action, a result'))}</div>
 <ol><li>${T('<strong>Předpona → dokonavé:</strong> dělat → <b>u</b>dělat, psát → <b>na</b>psat, vařit → <b>u</b>vařit.','<strong>Prefix → perfective:</strong> dělat → <b>u</b>dělat, psát → <b>na</b>psat, vařit → <b>u</b>vařit.')}</li>
 <li>${T('<strong>Bez předpony / obě s předponou: delší je nedokonavé:</strong> kupovat → koupit, dávat → dát, vystupovat → vystoupit.','<strong>No prefix / both with a prefix: the longer one is imperfective:</strong> kupovat → koupit, dávat → dát, vystupovat → vystoupit.')}</li>
 <li>${T('<strong>Nepravidelné dvojice</strong> se učte nazpaměť: brát → vzít, říkat → říct, hledat → najít.','<strong>Irregular pairs</strong> must be learned by heart: brát → vzít, říkat → říct, hledat → najít.')}</li></ol>`;
 const per={Present:T('<strong>Dokonavé sloveso nemá přítomný čas.</strong> Jeho „přítomný“ tvar znamená budoucnost: dělám (teď) × udělám (v budoucnu, a hotovo).','<strong>A perfective verb has no present tense.</strong> Its “present” form means future: dělám (now) × udělám (in the future, and finished).'),
  Past:T('Psala jsem dopis (průběh, výsledek neříkám) × Napsala jsem dopis (je hotový). Signály: každý den, často, dlouho → nedokonavé; konečně, celý, hned → dokonavé.','Psala jsem dopis (I was writing, no result stated) × Napsala jsem dopis (it is finished). Signals: každý den, často, dlouho → imperfective; konečně, celý, hned → perfective.'),
  Conditional:T('Dělal bych to každý den (opakování) × Udělal bych to hned (jednou, výsledek).','Dělal bych to každý den (repetition) × Udělal bych to hned (once, a result).'),
  Future:T('Nedokonavé: <strong>budu + infinitiv</strong> (budu dělat). Dokonavé: <strong>tvar přítomného času</strong> (udělám). <strong>Nikdy budu + dokonavé</strong> (ne „budu udělat“).','Imperfective: <strong>budu + infinitive</strong> (budu dělat). Perfective: <strong>the present-tense form</strong> (udělám). <strong>Never budu + perfective</strong> (not “budu udělat”).'),
  Imperative:T('Kladný rozkaz bývá dokonavý: Zavři okno! Záporný bývá nedokonavý: Nezavírej okno!','Positive commands are often perfective: Zavři okno! (Close the window!) Negative ones are usually imperfective: Nezavírej okno! (Don’t close the window!)')};
 $('howto-body').innerHTML=core+(per[c.sub]?`<p class="tip">💡 ${per[c.sub]}</p>`:Object.values(per).map(x=>`<p class="tip">💡 ${x}</p>`).join(''));}

/* ---------- card list: wrap makeCards ---------- */
const makeCardsBeforePlus=makeCards;
makeCards=function(){const mode=$('mode').value;if(CHOICE_MODES.includes(mode))return choiceCards(mode);
 const base=makeCardsBeforePlus().filter(c=>!(c.kind==='conjugation'&&(c.level==='Past'||c.level==='Conditional')));
 const cards=mode==='conjugation'?base.concat(extraConjCards().filter(filterOK)):base;
 for(const c of cards)if(!c.uid)c.uid=c.kind==='sentence'?`s|${c.level}|${c.sentence}|${c.person}`+(c.added?'|'+c.verb:''):`c|${c.level}|${c.verb}|${c.key}|${c.person}`;
 return cards;};
const explanationBeforePlus=explanation;
explanation=function(c){if(c.kind==='choice')return c.explain();if(c.extra)return extraExplanation(c);return explanationBeforePlus(c);};

/* ---------- mistakes and saved progress ---------- */
let missed=new Map(),reviewing=null,stats=store.get('stats',{tried:0,correct:0});
let allCards=null;
function buildIndex(){if(allCards)return allCards;allCards=new Map();const keep=['level','mode','group','aspect','cefr'].map(id=>$(id).value);$('group').value='all';$('aspect').value='all';$('cefr').value='all';
 for(const mode of ['conjugation','sentence',...CHOICE_MODES]){$('mode').value=mode;for(const level of (CHOICE_MODES.includes(mode)?['Mixed']:mode==='sentence'?['Present','Past','Future','Conditional','Imperative','Mixed']:['Present','Past','Future','Conditional','Imperative'])){$('level').value=level;for(const c of makeCards())allCards.set(c.uid,c);}}
 ['level','mode','group','aspect','cefr'].forEach((id,i)=>$(id).value=keep[i]);return allCards;}
function saveMissed(){store.set('missed',[...missed.keys()]);}
function loadMissed(){const ids=store.get('missed',[]);if(!ids.length)return;const idx=buildIndex();for(const id of ids){const c=idx.get(id);if(c)missed.set(id,c);}}
window.onAnswered=ok=>{if(!current)return;stats.tried++;if(ok)stats.correct++;store.set('stats',stats);
 if(ok)missed.delete(current.uid);else missed.set(current.uid,current);saveMissed();plusUI();};
function plusUI(){const b=$('mistakes');const n=missed.size;
 if(reviewing){b.hidden=false;b.textContent=B('✕ Ukončit opakování','✕ Stop review');b.classList.add('on');}
 else{b.hidden=!n;b.classList.remove('on');b.textContent=B('↻ Moje chyby','↻ My mistakes')+` (${n})`;b.title=B('Procvičit jen to, co jsem měl(a) špatně','Practise only what I got wrong');}
 const pct=stats.tried?Math.round(100*stats.correct/stats.tried):0;
 $('stats-line').innerHTML=stats.tried?`${esc(B('Na tomto počítači','On this computer'))}: ${stats.tried} ${esc(B('odpovědí','answers'))} · ${pct} % ${esc(B('správně','correct'))} · ${n} ${esc(B('k opakování','to review'))} · <button type="button" class="link" id="reset-stats">${esc(B('vynulovat','reset'))}</button>`:'';
 const r=$('reset-stats');if(r)r.onclick=()=>{stats={tried:0,correct:0};missed.clear();store.set('stats',stats);saveMissed();if(reviewing)stopReview();plusUI();};}
function startReview(){if(!missed.size)return;reviewing={pool,position,score,seen};pool=shuffled([...missed.values()]);position=0;score=0;seen=0;show();}
function stopReview(message){if(!reviewing)return;({pool,position,score,seen}=reviewing);reviewing=null;show();
 if(message){const f=$('feedback');f.className='feedback correct';f.innerHTML=`<span class="big">${esc(message)}</span>`;}}
$('mistakes').onclick=()=>reviewing?stopReview():startReview();
// leaving review when the pool ends
$('next').onclick=()=>{if(!pool.length)return;if(reviewing&&position+1>=pool.length){const left=missed.size;stopReview(left?B(`Opakování hotovo! Ještě ${left} k procvičení.`,`Review finished! ${left} still to practise.`):B('Opakování hotovo — všechny chyby opravené! 🎉','Review finished — all mistakes fixed! 🎉'));return;}position++;show();};
// changing a filter ends the review
for(const id of ['level','mode','group','aspect','cefr'])$(id).addEventListener('change',()=>{if(reviewing){reviewing=null;show();}});
$('cefr').addEventListener('change',()=>{try{localStorage.setItem('verbTrainer.cefr',$('cefr').value)}catch{}reset();});
try{const c=localStorage.getItem('verbTrainer.cefr');if(c)$('cefr').value=c;}catch{}

/* ---------- show(): choice exercises, labels ---------- */
function modeLabels(){$('label-cefr').textContent=B('Úroveň','Level');$('cefr').options[3].textContent=B('Všechny úrovně','All levels');$('ref-level').options[0].textContent=B('Všechny úrovně','All levels');const o=$('mode').options;const names={aspect:['Vid: které je dokonavé?','Aspect: which is perfective?'],motion:['Slovesa pohybu','Verbs of motion'],groups:['Která skupina?','Which group?']};
 for(const opt of o)if(names[opt.value])opt.textContent=B(...names[opt.value]);
 const m=$('mode').value,choice=CHOICE_MODES.includes(m)&&m!=='aspect';for(const id of ['level','group','aspect'])$(id).closest('label').hidden=choice;$('cefr').closest('label').hidden=m==='motion';
 names.aspect=['Vid: nedokonavé × dokonavé','Aspect: imperfective × perfective'];for(const opt of o)if(opt.value==='aspect')opt.textContent=B(...names.aspect);
 if(m==='aspect')$('level').options[[...$('level').options].findIndex(x=>x.value==='Mixed')].textContent=B('Které je dokonavé? + vše','Which is perfective? + all');else{const mo=[...$('level').options].find(x=>x.value==='Mixed');if(mo)mo.textContent=LV('Mixed');}}
const showBeforePlus=show;show=function(){showBeforePlus();modeLabels();
 const c=current,choice=c&&c.kind==='choice';
 $('answer-box').hidden=choice;$('letter-keys').hidden=choice;$('choices').hidden=!choice;$('check').hidden=choice;
 $('step2-label').innerHTML=choice?sl('Potřebujete pomoc?','Need help?'):sl('Zkontrolujte','Check');
 $('step1-label').innerHTML=choice?sl('Vyberte odpověď','Choose the answer'):sl('Napište nebo řekněte tvar','Write or say the form');
 if(reviewing&&c)$('tag').textContent=B('Opakování chyb','Reviewing mistakes');
 if(choice){const typeName={aspect:B('Vid','Aspect'),motion:B('Slovesa pohybu','Verbs of motion'),groups:B('Skupiny','Groups')}[c.type];if(!reviewing)$('tag').textContent=typeName;
  $('prompt').textContent=c.big||c.prompt;$('cue').innerHTML=c.big?esc(c.prompt):'';$('translation').textContent=isEasy()?c.translation:'';
  $('about').hidden=true;$('howto').hidden=c.type!=='aspect';if(c.type==='aspect')aspectHowto(c);$('availability').textContent=pool.length+' '+B('otázek','questions');
  const box=$('choices');box.innerHTML=c.options.map(o=>`<button type="button" class="choice">${esc(o)}</button>`).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>pickChoice(b));
  if(document.activeElement===$('answer'))$('answer').blur();setDictBtn();guide('choose');}
 plusUI();};
function pickChoice(btn){if(answered||!current)return;const c=current,ok=btn.textContent===c.answer;answered=true;seen++;if(ok)score++;progress();
 $('choices').querySelectorAll('button').forEach(b=>{b.disabled=true;if(b.textContent===c.answer)b.classList.add('right');else if(b===btn)b.classList.add('wrong-pick');});
 const f=$('feedback');f.className='feedback '+(ok?'correct':'wrong');
 f.innerHTML=`<span class="big">${ok?'✓ '+esc(B('Správně!','Correct!')):esc(B('Správná odpověď','Correct answer'))+': '+esc(c.answer)}</span><span class="why">${esc(c.explain())}</span>`;
 if(c.type==='motion')$('prompt').textContent=c.prompt.replace('___',c.answer);
 guide(ok?'correct':'wrong');onAnswered(ok);}

document.addEventListener('DOMContentLoaded',()=>{try{loadMissed();}catch(e){console.error(e);}plusUI();});

/* ---------- hints: a clue that never shows the answer ---------- */
const HINT_MODELS={
 am:[['dělat',['dělám','děláš','dělá','děláme','děláte','dělají']],['čekat',['čekám','čekáš','čeká','čekáme','čekáte','čekají']]],
 im:[['mluvit',['mluvím','mluvíš','mluví','mluvíme','mluvíte','mluví']],['vařit',['vařím','vaříš','vaří','vaříme','vaříte','vaří']]],
 uji:[['pracovat',['pracuju','pracuješ','pracuje','pracujeme','pracujete','pracujou']],['kupovat',['kupuju','kupuješ','kupuje','kupujeme','kupujete','kupujou']]],
 u:[['číst',['čtu','čteš','čte','čteme','čtete','čtou']],['nést',['nesu','neseš','nese','neseme','nesete','nesou']]]};
const HKEYS=['1sg','2sg','3sg','1pl','2pl','3pl'];
const HPERS={'1sg':['já','I'],'2sg':['ty','you'],'3sg':['on/ona','he/she'],'1pl':['my','we'],'2pl':['vy','you (pl.)'],'3pl':['oni','they']};
const GNAME={am:['1 · -á','1 · -á'],im:['2 · -í','2 · -í'],uji:['3 · -uj','3 · -uj'],u:['4 · -e','4 · -e']};
function otherKey(k){return k==='2sg'?'3sg':'2sg';}
function sameVerbClue(v,k){const o=otherKey(k);const f=v[o]&&v[o]!=='—'?first(v[o]):'';return f?[`${HPERS[o][0]} ${f}`,`${HPERS[o][0]} (${HPERS[o][1]}) → ${f}`]:null;}
function maskFor(c,text){let t=text;for(const a of c.answers||[]){if(!a)continue;t=t.replace(new RegExp('(^|[^\\p{L}])'+a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\p{L}])','giu'),'$1…');}return t;}
function hintText(c){
 if(c&&c.kind==='sentence'&&c.v)return sentenceHint(c);
 if(!c||c.kind!=='conjugation')return maskFor(c,explanation(c));
 const v=c.v,k=c.key,head=`${v.verb} (${v.english})`,pz=c.person,pe=c.personEn;
 const out=(cz,en)=>maskFor(c,B(cz,en));
 if(c.level==='Present'||(c.level==='Future'&&c.subtype==='perfective')){
  const g=v.conjugation_group,ms=HINT_MODELS[g]||[];const m=ms.find(x=>x[0]!==v.verb.replace(/ s[ei]$/,''));const i=HKEYS.indexOf(k);
  const pre=c.level==='Future'?['Dokonavé sloveso: žádné budu, použijte tvar jako v přítomném čase. ','Perfective verb: no budu – use the present-type form. ']:['',''];
  const model=m&&!v.irregular?[`Skupina ${GNAME[g][0]} jako ${m[0]}: ${HPERS[k][0]} ${m[1][i]}.`,`Group ${GNAME[g][1]}, like ${m[0]}: ${pe} → ${m[1][i]}.`]:['Nepravidelné sloveso – tvary se učí zpaměti.','Irregular verb – the forms are learned by heart.'];
  const s=sameVerbClue(v,k);
  return out(`${pre[0]}${v.verb}: ${model[0]}${s?' Stejné sloveso: '+s[0]+'.':''}`,`${pre[1]}${head}: ${model[1]}${s?' Same verb: '+s[1]+'.':''}`);}
 if(c.level==='Future'){
  const s=sameVerbClue(Object.fromEntries(HKEYS.map((x,i)=>[x,futureMotion[v.verb]?futureMotion[v.verb][i]:futureAux[x]])),k);
  if(futureMotion[v.verb])return out(`Sloveso pohybu ${v.verb}: žádné budu – přidejte ${v.verb==='jít'?'pů-':'po-'} k přítomnému tvaru. Například ${s[0]}.`,`Motion verb ${head}: no budu – add ${v.verb==='jít'?'pů-':'po-'} to the present form. Example: ${s[1]}.`);
  if(v.verb==='být')return out(`Budoucí čas být = samotné pomocné sloveso. Například ${s[0]}.`,`The future of být is the helper verb itself. Example: ${s[1]}.`);
  return out(`Nedokonavé sloveso: tvar budu pro ${pz} + infinitiv ${v.verb}${reflex(v)?' (se/si stojí za budu)':''}. Budu, budeš, bude, budeme, budete, budou.`,`Imperfective: the budu form for ${pe} + the infinitive${reflex(v)?' (se/si goes right after the budu form)':''}. ${head}. Forms: budu, budeš, bude, budeme, budete, budou.`);}
 if(c.level==='Past'||c.level==='Conditional'){
  const g=c.P?c.P.g:(c.gender==='woman'?'f':'m');const cond=c.level==='Conditional';
  const ref=g==='f'?['past_m','muže','a man']:['past_f','ženu','a woman'];const rf=first(v[ref[0]]);
  const end=g==='m'?['-l','-l']:g==='f'?['-la','-la']:['-li','-li (-ly/-la)'];
  const aux=c.P?c.P.aux[cond?1:0]:(cond?'bych':'jsem');
  const auxCz=aux?`přidejte ${aux}`:'nic nepřidávejte';const auxEn=aux?`add ${aux}`:'add nothing';
  return out(`${cond?'Podmiňovací':'Minulý'} čas: tvar pro ${ref[1]} je ${rf} → pro ${pz} má koncovku ${end[0]}; ${auxCz}.`,`${cond?'Conditional':'Past'}: for ${ref[2]} it is ${rf} → for ${pe} the form ends in ${end[1]}; ${auxEn}. ${head}.`);}
 if(c.level==='Imperative'){
  const o=first(v['3pl']||'');
  if(v.irregular||['být','mít','chtít'].includes(v.verb)){const a=c.answers[0]||'';return out(`${v.verb}: nepravidelný rozkaz – učí se zpaměti. Začíná na ${a.slice(0,2)}-.`,`${head}: irregular command – learn it by heart. It starts with ${a.slice(0,2)}-.`);}
  if(k==='imp_my')return out(`Pro my: vezměte rozkaz pro vy a -te změňte na -me. Výchozí tvar: oni ${o}.`,`For “let’s”: take the vy command and change -te to -me. Start from oni (they) → ${o}. ${head}.`);
  if(k==='imp_pl')return out(`Rozkaz pro vy = rozkaz pro ty + -te / -ete / -ěte. Výchozí tvar: oni ${o}.`,`vy command = the ty command + -te / -ete / -ěte. Start from oni (they) → ${o}. ${head}.`);
  return out(`Rozkaz pro ty: vezměte oni ${o}, odtrhněte koncovku (-ají → -ej, -í → -i/–, -ou → -i/–).`,`ty command: take oni (they) → ${o} and drop the ending (-ají → -ej, -í → -i or nothing, -ou → -i or nothing). ${head}.`);}
 return mask(explanation(c));}
const MIXED_LV={'vařím':'Present','uvařím':'Future','jela':'Past','čekáme':'Present','zavolejte':'Imperative','koupila bych':'Conditional'};
function sentenceHint(c){const v=c.v,k=c.person,lv=c.level==='Mixed'?(MIXED_LV[c.answers[0]]||'Mixed'):c.level,head=`${v.verb} (${v.english})`;
 const P=HPERS[k]||['',''];let cz='',en='';
 if(lv==='Present'){const ms=HINT_MODELS[v.conjugation_group]||[];const m=ms.find(x=>x[0]!==v.verb.replace(/ s[ei]$/,''));const i=HKEYS.indexOf(k);
  cz=`Přítomný čas, osoba ${P[0]}. `+(m&&!v.irregular&&i>=0?`Skupina ${GNAME[v.conjugation_group][0]} jako ${m[0]}: ${P[0]} ${m[1][i]}.`:'Nepravidelné sloveso.');
  en=`Present tense, person: ${P[0]} (${P[1]}). `+(m&&!v.irregular&&i>=0?`Group ${GNAME[v.conjugation_group][1]}, like ${m[0]}: ${P[0]} → ${m[1][i]}.`:'Irregular verb.');}
 else if(lv==='Past'){if(/^3/.test(k)){cz='Minulý čas, 3. osoba: bez pomocného slovesa, jen tvar na -l / -la / -li podle rodu.';en='Past, 3rd person: no helper verb – just the -l / -la / -li form (man / woman / plural).';}else{cz='Minulý čas: celé sloveso = pomocné sloveso (jsem, jsi, jsme, jste; ty + se = ses) + tvar na -l / -la / -li.';en='Past: write the whole verb = helper (jsem, jsi, jsme, jste; ty + se = ses) + the -l / -la / -li form.';}}
 else if(lv==='Future'&&futureMotion[v.verb]){cz=`Sloveso pohybu: žádné budu, přidejte ${v.verb==='jít'?'pů-':'po-'} k přítomnému tvaru.`;en=`Motion verb: no budu – add ${v.verb==='jít'?'pů-':'po-'} to the present form.`;}
 else if(lv==='Future'){cz=v.aspect==='perfective'?'Dokonavé sloveso: žádné budu, tvar jako v přítomném čase.':'Nedokonavé sloveso: budu / budeš / bude… + infinitiv.';en=v.aspect==='perfective'?'Perfective verb: no budu – use the present-type form.':'Imperfective verb: budu / budeš / bude… + infinitive.';}
 else if(lv==='Conditional'){cz='Podmiňovací způsob: celé sloveso = bych / bys / by / bychom / byste + tvar na -l / -la / -li. Po kdy- a a- se spojí do jednoho slova: kdybych, kdybys…, abych, abys…';en='Conditional: write the whole verb = bych / bys / by / bychom / byste + the -l / -la / -li form. After kdy- and a- they join into one word: kdybych, kdybys…, abych, abys…';}
 else if(lv==='Mixed'){cz='Podle časového výrazu a podmětu vyberte čas a osobu.';en='Use the time expression and the subject to pick the tense and person.';}
 else if(lv==='Imperative'){const o=first(v['3pl']||''),vy=k==='2pl';cz=`Rozkaz pro ${vy?'vy':'ty'}: začněte od oni ${o} a odtrhněte koncovku${vy?', pak přidejte -te / -ete / -ěte':''}.`;en=`Command for ${vy?'vy (polite/plural)':'ty (familiar)'}: start from oni (they) → ${o} and drop the ending${vy?', then add -te / -ete / -ěte':''}.`;}
 const aw=(c.answers[0]||'').split(' ').filter(w=>w.length>1);const tip=c.tip&&maskFor(c,c.tip)===c.tip&&!aw.some(w=>c.tip.toLowerCase().split(/[^\p{L}]+/u).includes(w))?' '+c.tip:'';return maskFor(c,B(`${v.verb}: ${cz}`,`${head}: ${en}${tip}`));}
window.hintText=hintText;
