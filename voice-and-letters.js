/* Layout, step guide, Czech letters, voice recording and dictation.
   Recording stays on this page. Dictation uses the browser's speech service. */
let recorder=null,recordStream=null,recordURL=null,recognition=null,mineAudio=null,recordTimer=null,recordSeconds=0;
let voiceGeneration=0,voiceState=['',''],recordPending=false,stage='start',view='practice';
const CzechLetters='áčďéěíňóřšťúůýž'.split('');
// bt: button text (one language only, so the step row stays on one line); sl: step title (both languages stacked in Easy mode)
const bt=(cz,en)=>isEn()?en:cz;
const sl=(cz,en)=>esc(isEn()?en:cz)+(isEn()||!isEasy()?'':'<i>'+esc(en)+'</i>');
function setVoiceStatus(cz,en){voiceState=[cz,en];$('voice-status').textContent=cz||en?B(cz,en):'';}

/* ---------- step guide: which control to use next ---------- */
const GUIDE={
 start:['answer','Napište správný tvar — nebo stiskněte 🎙 a řekněte ho.','Type the correct form — or press 🎙 and say it.'],
 typed:['check','Stiskněte ✓ Zkontrolovat (nebo Enter).','Press ✓ Check (or Enter).'],
 listening:['dictate','Poslouchám… řekněte odpověď.','Listening… say your answer.'],
 correct:['next','Správně! Můžete si ho poslechnout a zopakovat, nebo stiskněte Další →.','Correct! You can listen and repeat it, or press Next →.'],
 wrong:['speak','Přečtěte si vysvětlení. Pak stiskněte 🔊 Poslech a zopakujte správný tvar.','Read the explanation. Then press 🔊 Listen and repeat the correct form.'],
 listened:['record','Teď stiskněte ● Nahrát a řekněte to sami.','Now press ● Record and say it yourself.'],
 recording:['record','Nahrávám… Až skončíte, stiskněte ■ Stop.','Recording… press ■ Stop when you finish.'],
 recorded:['play-mine','Stiskněte ▶ Můj hlas a porovnejte.','Press ▶ My voice and compare.'],
 choose:['choices','Vyberte správnou odpověď.','Choose the right answer.'],
 almost:['check','Skoro! Opravte označená písmena a stiskněte ✓ Zkontrolovat znovu.','Almost! Fix the marked letters and press ✓ Check again.'],
 finished:['next','Hotovo. Stiskněte Další → pro nové cvičení.','Done. Press Next → for a new one.']
};
function guide(s,transient=false){if(!transient)stage=s;const g=GUIDE[s];const h=$('guide-hint');if(h)h.innerHTML=isEn()?esc(g[2]):esc(g[1])+(isEasy()?'<span class="en">'+esc(g[2])+'</span>':'');
 document.querySelectorAll('.next-up').forEach(el=>el.classList.remove('next-up'));document.querySelectorAll('.step.current').forEach(el=>el.classList.remove('current'));
 const target=$(g[0]);if(target&&current){target.classList.add('next-up');target.closest('.step')?.classList.add('current');}}

/* ---------- labels ---------- */
function stepUI(){
 $('label-language').textContent=B('Režim','Mode');
 $('hero-line').textContent=B('Procvičujte česká slovesa. Pište, mluvte a poslouchejte.','Practise Czech verbs. Write, speak and listen.');
 const tabs=$('tabs').querySelectorAll('button');tabs[0].textContent=B('Procvičování','Practice');tabs[1].textContent=B('Pravidla','Rules');tabs[2].textContent=B('Slovníček sloves','Verb reference');
 tabs.forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 $('step1-label').innerHTML=sl('Napište nebo řekněte tvar','Write or say the form');
 $('step2-label').innerHTML=sl('Zkontrolujte','Check');
 $('step3-label').innerHTML=sl('Poslechněte a zopakujte','Listen & repeat');
 $('move-label').innerHTML=sl('Další','Move on');
 $('check').textContent=bt('✓ Zkontrolovat','✓ Check');$('hint').textContent=bt('💡 Nápověda','💡 Hint');
 $('speak').textContent=bt('🔊 Poslech','🔊 Listen');$('play-mine').textContent=bt('▶ Můj hlas','▶ My voice');
 $('skip').textContent=bt('Řešení','Show answer');$('next').textContent=bt('Další →','Next →');
 $('shuffle').setAttribute('aria-label',B('Zamíchat','Shuffle'));$('shuffle').title=B('Zamíchat','Shuffle');
 $('answer').placeholder=B('Napište český tvar','Type the Czech form');$('answer').setAttribute('aria-label',B('Vaše odpověď','Your answer'));
 $('about-title').textContent=B('O tomto slovesu','About this verb');
 $('voice-note').textContent=B('Nahrávka zůstává v této stránce. Kontrola řečí (🎙) může používat online službu prohlížeče. Doporučený prohlížeč: Chrome nebo Edge.','Your recording stays on this page. The 🎙 speech input may use your browser’s online service. Chrome or Edge is recommended.');
 setRecBtn();setDictBtn();renderLetterKeys();
 $('voice-status').textContent=voiceState.some(Boolean)?B(...voiceState):'';
}
function setRecBtn(){const b=$('record');if(!b)return;const on=!!(recordPending||recorder?.state==='recording');b.classList.toggle('on',on);b.textContent=on?bt('■ Stop','■ Stop')+' · '+recordSeconds+' s':bt('● Nahrát','● Record');b.disabled=!current||!!recognition;$('play-mine').disabled=!recordURL||on;}
function setDictBtn(){const b=$('dictate');if(!b)return;b.classList.toggle('on',!!recognition);b.textContent=recognition?'■':'🎙';b.title=recognition?B('Zastavit','Stop'):B('Říct odpověď','Say your answer');b.setAttribute('aria-label',b.title);b.disabled=!current||answered||current.kind==='choice'||!!(recorder?.state==='recording');}
function renderLetterKeys(){const holder=$('letter-keys');holder.replaceChildren();const shift=document.createElement('button');shift.type='button';shift.textContent='⇧';shift.title=B('Velká písmena','Uppercase');shift.setAttribute('aria-pressed',String(uppercaseLetters));if(uppercaseLetters)shift.classList.add('active');shift.onclick=()=>{uppercaseLetters=!uppercaseLetters;renderLetterKeys()};
 for(const letter of CzechLetters){const button=document.createElement('button');button.type='button';button.textContent=uppercaseLetters?letter.toLocaleUpperCase('cs'):letter;button.setAttribute('aria-label',B('Vložit ','Insert ')+button.textContent);button.onmousedown=e=>e.preventDefault();button.onclick=()=>{const input=$('answer'),start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.setRangeText(button.textContent,start,end,'end');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();};holder.append(button);}
 holder.append(shift);}
let uppercaseLetters=false;

/* ---------- tabs ---------- */
function setView(v){view=v;for(const id of ['practice','rules','reference'])$('view-'+id).hidden=id!==v;$('tabs').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));if(v!=='practice')clearVoice();}
$('tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>setView(b.dataset.view));

/* ---------- answer, hint, show answer ---------- */
function mask(text){let t=text;for(const a of current.answers){if(!a)continue;const re=new RegExp('(^|[^\\p{L}])'+a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\p{L}])','giu');t=t.replace(re,'$1…');}return t;}
function showFeedback(kind){const f=$('feedback');const ans=current.answers.join(' / ');
 if(kind==='correct'){f.className='feedback correct';f.innerHTML=`<span class="big">✓ ${esc(B('Správně!','Correct!'))} ${esc(ans)}</span>`;}
 else{f.className='feedback wrong';f.innerHTML=`<span class="big">${esc(B('Správná odpověď','Correct answer'))}: ${esc(ans)}</span><span class="why">${esc(explanation(current))}</span>`;}}
const noAccents=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').normalize('NFC');
function accentDiff(typed){const t=clean(typed);if(current.answers.includes(t))return null;const match=current.answers.find(a=>a.length===t.length&&noAccents(a)===noAccents(t));if(!match)return null;
 return [...t].map((ch,i)=>ch===match[i]?esc(ch):'<mark>'+esc(ch)+'</mark>').join('');}
window.onAnswered=window.onAnswered||(()=>{});
$('check').onclick=()=>{if(!current||answered||current.kind==='choice')return;if(!$('answer').value.trim()){guide('start');$('answer').focus();return;}
 const almost=accentDiff($('answer').value);if(almost){const f=$('feedback');f.className='feedback almost';f.innerHTML=`<span class="big">${esc(B('Skoro! Jen háčky a čárky nesedí:','Almost! Only the accents are different:'))} ${almost}</span><span class="why">${esc(B('Označená písmena potřebují háček nebo čárku (nebo je mají navíc). Opravte je a zkuste to znovu.','The marked letters need a háček or čárka (or have one too many). Fix them and try again.'))}</span>`;guide('almost');$('answer').focus();return;}
 check();if(!answered)return;const ok=$('feedback').classList.contains('correct');showFeedback(ok?'correct':'wrong');setDictBtn();guide(ok?'correct':'wrong');onAnswered(ok);};
$('skip').onclick=()=>{if(!current||answered)return;answered=true;seen++;progress();$('answer').value='';showFeedback('wrong');setDictBtn();guide('wrong');onAnswered(false);};
$('hint').onclick=()=>{if(!current)return;if(current.kind==='choice'&&!answered){const f=$('feedback');f.className='feedback';f.innerHTML=`<span class="why">💡 ${esc(current.hint())}</span>`;return;}if(answered){showFeedback($('feedback').classList.contains('correct')?'correct':'wrong');return;}const f=$('feedback');f.className='feedback';f.innerHTML=`<span class="why">💡 ${esc(window.hintText?hintText(current):mask(explanation(current)))}</span>`;};
$('answer').addEventListener('input',()=>{if(!answered&&current)guide($('answer').value.trim()?'typed':'start');});
/* Czech voice: use the best Czech voice on the device (Edge's natural voices first). Never read with a non-Czech voice. */
let czVoice=null;
function pickCzechVoice(){if(!('speechSynthesis'in window))return null;const score=v=>(/natural/i.test(v.name)?4:0)+(/online/i.test(v.name)?2:0)+(/google/i.test(v.name)?1:0);
 czVoice=speechSynthesis.getVoices().filter(v=>/^cs([-_]|$)/i.test(v.lang)).sort((a,b)=>score(b)-score(a))[0]||null;return czVoice;}
if('speechSynthesis'in window){pickCzechVoice();speechSynthesis.addEventListener('voiceschanged',pickCzechVoice);}
function voicesReady(){return new Promise(res=>{if(speechSynthesis.getVoices().length)return res();const t=setTimeout(res,1500);speechSynthesis.addEventListener('voiceschanged',()=>{clearTimeout(t);res();},{once:true});});}
async function speakCz(text){
 if(!('speechSynthesis'in window)){setVoiceStatus('Tento prohlížeč neumí číst nahlas.','This browser cannot read aloud.');return false;}
 if(!czVoice){await voicesReady();pickCzechVoice();}
 if(!czVoice){setVoiceStatus('V tomto zařízení není český hlas (anglický by četl špatně, proto mlčím). Řešení: otevřete trenažér v prohlížeči Microsoft Edge — má kvalitní české hlasy. Nebo ve Windows: Nastavení → Čas a jazyk → Řeč → Přidat hlasy → Čeština, pak restartujte prohlížeč. Na telefonu přidejte češtinu v nastavení převodu textu na řeč.','There is no Czech voice on this device (an English voice would read it badly, so the trainer stays silent). Fix: open the trainer in Microsoft Edge — it has good Czech voices built in. Or on Windows: Settings → Time & language → Speech → Add voices → Czech, then restart the browser. On a phone, add Czech in the text-to-speech settings.');return false;}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.voice=czVoice;u.lang=czVoice.lang;u.rate=.85;speechSynthesis.speak(u);return true;}
$('speak').onclick=async()=>{if(!current)return;if(recorder?.state==='recording'||recognition)return;stopMine();
 const text=current.say?current.say(answered):current.kind==='sentence'?(answered?current.sentence.replace('___',current.answers[0]):current.verb):(answered?current.answers[0]:current.verb);
 const ok=await speakCz(text);
 if(ok&&answered&&(stage==='wrong'||stage==='correct'))guide('listened');};

/* ---------- recording ---------- */
function stopMine(){if(mineAudio){mineAudio.pause();mineAudio=null;}}
function releaseRecording(){clearInterval(recordTimer);if(recordStream){recordStream.getTracks().forEach(t=>t.stop());recordStream=null;}}
function clearVoice(){voiceGeneration++;recordPending=false;stopMine();if(recognition){recognition.abort();recognition=null;}if(recorder&&recorder.state!=='inactive')recorder.stop();recorder=null;releaseRecording();if(recordURL){URL.revokeObjectURL(recordURL);recordURL=null;}voiceState=['',''];if('speechSynthesis'in window)speechSynthesis.cancel();}
$('record').onclick=async()=>{
 if(recordPending)return;if(recorder?.state==='recording'){recorder.stop();return;}if(recognition)return;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){setVoiceStatus('Nahrávání není v tomto prohlížeči dostupné. Otevřete stránku přes HTTPS a povolte mikrofon.','Recording is unavailable in this browser. Open the page over HTTPS and allow the microphone.');return;}
 const generation=voiceGeneration;recordPending=true;stopMine();speechSynthesis.cancel();setVoiceStatus('','');recordSeconds=0;setRecBtn();let stream;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(generation!==voiceGeneration||!recordPending){stream.getTracks().forEach(t=>t.stop());return;}
  recordPending=false;recordStream=stream;const localRecorder=new MediaRecorder(stream);recorder=localRecorder;const chunks=[];
  localRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  localRecorder.onstop=()=>{clearInterval(recordTimer);stream.getTracks().forEach(t=>t.stop());if(generation!==voiceGeneration)return;recorder=null;recordStream=null;if(chunks.length){if(recordURL)URL.revokeObjectURL(recordURL);recordURL=URL.createObjectURL(new Blob(chunks,{type:localRecorder.mimeType||chunks[0].type}));guide('recorded');}else{setVoiceStatus('Nahrávka je prázdná. Zkuste to znovu.','The recording is empty. Try again.');guide(stage);}setRecBtn();setDictBtn();};
  localRecorder.onerror=()=>{if(generation!==voiceGeneration)return;clearVoice();setVoiceStatus('Nahrávání se nezdařilo. Zkuste to znovu.','Recording failed. Try again.');setRecBtn();guide(stage);};
  localRecorder.start();setRecBtn();setDictBtn();guide('recording',true);
  recordTimer=setInterval(()=>{recordSeconds++;setRecBtn();if(recordSeconds>=60&&recorder?.state==='recording')recorder.stop();},1000);
 }catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());if(generation!==voiceGeneration)return;recordPending=false;recorder=null;recordStream=null;setRecBtn();setVoiceStatus(e.name==='NotAllowedError'?'Mikrofon nebyl povolen. Povolte ho v nastavení prohlížeče.':'Mikrofon se nepodařilo otevřít. Zkontrolujte připojení a oprávnění.',e.name==='NotAllowedError'?'Microphone permission was denied. Allow it in your browser settings.':'Could not open the microphone. Check its connection and permissions.');}
};
$('play-mine').onclick=()=>{if(!recordURL||recorder?.state==='recording')return;speechSynthesis.cancel();stopMine();mineAudio=new Audio(recordURL);mineAudio.play().catch(()=>setVoiceStatus('Nahrávku se nepodařilo přehrát.','Your recording could not be played.'));if(stage==='recorded')guide('finished');};

/* ---------- dictation: puts what you say into the answer box ---------- */
$('dictate').onclick=()=>{
 if(recognition){recognition.stop();return;}if(recordPending||recorder?.state==='recording'||answered)return;
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){setVoiceStatus('Mluvení není v tomto prohlížeči dostupné. Použijte Chrome nebo Edge, nebo odpověď napište.','Speaking is unavailable in this browser. Use Chrome or Edge, or type your answer.');return;}
 const generation=voiceGeneration;const engine=new Speech();recognition=engine;engine.lang='cs-CZ';engine.continuous=false;engine.interimResults=false;let got=false;
 stopMine();speechSynthesis.cancel();
 engine.onresult=e=>{if(generation!==voiceGeneration||recognition!==engine)return;let text='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)text+=e.results[i][0].transcript+' ';if(text.trim()){got=true;$('answer').value=text.trim().replace(/[.!?]+$/,'');setVoiceStatus('','');}};
 engine.onerror=e=>{if(generation!==voiceGeneration||e.error==='aborted')return;setVoiceStatus(e.error==='not-allowed'?'Povolte mikrofon v prohlížeči.':e.error==='no-speech'?'Nic jsem neslyšel. Stiskněte 🎙 a mluvte hned.':'Odpověď se nepodařilo rozpoznat. Zkuste znovu nebo ji napište.',e.error==='not-allowed'?'Allow microphone access in your browser.':e.error==='no-speech'?'I didn’t hear anything. Press 🎙 and speak right away.':'Your answer was not recognised. Try again or type it.');};
 engine.onend=()=>{if(generation!==voiceGeneration)return;if(recognition===engine)recognition=null;setDictBtn();setRecBtn();guide(got||$('answer').value.trim()?'typed':'start');$('answer').focus({preventScroll:true});};
 try{setVoiceStatus('','');engine.start();setDictBtn();setRecBtn();guide('listening',true);}catch{recognition=null;setDictBtn();setVoiceStatus('Mluvení se nepodařilo spustit.','Could not start speech input.');}
};

/* ---------- wire into the trainer ---------- */
const showBeforeVoice=show;show=function(){clearVoice();showBeforeVoice();stepUI();$('about').hidden=!isEasy()||!current;$('about').open=false;guide('start');if(current&&view==='practice'&&matchMedia('(pointer:fine)').matches)$('answer').focus({preventScroll:true});};
window.addEventListener('pagehide',clearVoice);
