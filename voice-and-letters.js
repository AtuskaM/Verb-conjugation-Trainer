/* Microphone recording is local. Browser dictation is an optional separate service. */
let uppercaseLetters=false,recorder=null,recordStream=null,recordURL=null,recognition=null;
let voiceGeneration=0,voiceState=['',''],recordPending=false;
const CzechLetters='áčďéěíňóřšťúůýž'.split('');
function setVoiceStatus(cz,en){voiceState=[cz,en];$('voice-status').textContent=B(cz,en);}
function renderLetterKeys(){const holder=$('letter-keys');holder.replaceChildren();for(const letter of CzechLetters){const button=document.createElement('button');button.type='button';button.textContent=uppercaseLetters?letter.toLocaleUpperCase('cs'):letter;button.setAttribute('aria-label',B('Vložit ','Insert ')+button.textContent);button.onmousedown=e=>e.preventDefault();button.onclick=()=>{const input=$('answer'),start=input.selectionStart??input.value.length,end=input.selectionEnd??start;input.setRangeText(button.textContent,start,end,'end');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();};holder.append(button);}}
function voiceUI(){
 $('language').options[0].textContent=B('Lehký · CZ + EN','Easy · CZ + EN');$('language').options[1].textContent=B('Normální · CZ','Normal · CZ');$('hero-line').textContent=B('Procvičujte česká slovesa. Pište, mluvte a poslouchejte.','Practise Czech verbs. Write, speak and listen.');
 $('letter-label').textContent=B('Česká písmena','Czech letters');$('letter-case').setAttribute('aria-label',B('Přepnout velká a malá písmena','Toggle uppercase and lowercase'));$('letter-case').setAttribute('aria-pressed',String(uppercaseLetters));renderLetterKeys();
 $('record').textContent=B('● Nahrát hlas','● Record voice');$('stop-record').textContent=B('■ Zastavit nahrávání','■ Stop recording');$('dictate').textContent=B('🎤 Nadiktovat odpověď','🎤 Dictate answer');$('stop-dictate').textContent=B('■ Zastavit diktování','■ Stop dictation');
 $('voice-status').textContent=voiceState.some(Boolean)?B(...voiceState):'';
 $('voice-note').textContent=B('Nahrávku si můžete přehrát. Diktování vloží rozpoznaný text do odpovědi; před kontrolou ho můžete opravit. Nahrávka zůstává v této stránce. Diktování může používat online službu prohlížeče.','Play back your recording. Dictation puts recognised text into the answer; you can edit it before checking. Your recording stays on this page. Dictation may use your browser’s online service.');
 const active=recordPending||(recorder&&recorder.state!=='inactive');$('record').disabled=!!active||!!recognition||!current;$('stop-record').disabled=!active;$('dictate').disabled=!!active||!!recognition||!current;$('stop-dictate').disabled=!recognition;$('record').classList.toggle('recording-active',!!active);
}
function releaseRecording(){if(recordStream){recordStream.getTracks().forEach(t=>t.stop());recordStream=null;}}
function clearVoice(){voiceGeneration++;recordPending=false;if(recognition){recognition.abort();recognition=null;}if(recorder&&recorder.state!=='inactive')recorder.stop();recorder=null;releaseRecording();if(recordURL){URL.revokeObjectURL(recordURL);recordURL=null;}const audio=$('recording-playback');audio.removeAttribute('src');audio.hidden=true;voiceState=['',''];}
$('letter-case').onclick=()=>{uppercaseLetters=!uppercaseLetters;voiceUI();};
$('record').onclick=async()=>{
 if(recordPending||recognition||recorder?.state==='recording')return;
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){setVoiceStatus('Nahrávání není v tomto prohlížeči dostupné. Otevřete stránku přes HTTPS v aktuálním prohlížeči a povolte mikrofon.','Recording is unavailable in this browser. Open the page over HTTPS in an up-to-date browser and allow the microphone.');return;}
 const generation=voiceGeneration;recordPending=true;setVoiceStatus('Povolte mikrofon v prohlížeči.','Allow the microphone in your browser.');voiceUI();let stream;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(generation!==voiceGeneration||!recordPending){stream.getTracks().forEach(t=>t.stop());return;}
  recordPending=false;recordStream=stream;const localRecorder=new MediaRecorder(stream);recorder=localRecorder;const chunks=[];
  localRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  localRecorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(generation!==voiceGeneration)return;recorder=null;recordStream=null;if(chunks.length){if(recordURL)URL.revokeObjectURL(recordURL);recordURL=URL.createObjectURL(new Blob(chunks,{type:localRecorder.mimeType||chunks[0].type}));$('recording-playback').src=recordURL;$('recording-playback').hidden=false;setVoiceStatus('Nahrávka je připravena k poslechu.','Your recording is ready to play.');}else setVoiceStatus('Nahrávka je prázdná. Zkuste to znovu.','The recording is empty. Try again.');voiceUI();};
  localRecorder.onerror=()=>{if(generation!==voiceGeneration)return;clearVoice();setVoiceStatus('Nahrávání se nezdařilo. Zkuste to znovu.','Recording failed. Try again.');voiceUI();};
  localRecorder.start();setVoiceStatus('Nahrávám… Po odpovědi stiskněte Zastavit nahrávání.','Recording… Press Stop recording after your answer.');voiceUI();
 }catch(e){if(stream)stream.getTracks().forEach(t=>t.stop());if(generation!==voiceGeneration)return;recordPending=false;recorder=null;recordStream=null;setVoiceStatus(e.name==='NotAllowedError'?'Mikrofon nebyl povolen. Povolte ho v nastavení prohlížeče.':'Mikrofon se nepodařilo otevřít. Zkontrolujte jeho připojení a oprávnění.',e.name==='NotAllowedError'?'Microphone permission was denied. Allow it in your browser settings.':'Could not open the microphone. Check its connection and permissions.');voiceUI();}
};
$('stop-record').onclick=()=>{if(recordPending){clearVoice();setVoiceStatus('Nahrávání bylo zrušeno.','Recording was cancelled.');voiceUI();}else if(recorder?.state==='recording'){recorder.stop();setVoiceStatus('Dokončuji nahrávku…','Finishing recording…');}};
$('dictate').onclick=()=>{
 if(recognition||recordPending||recorder?.state==='recording')return;
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){setVoiceStatus('Diktování není v tomto prohlížeči dostupné. Použijte nahrávání nebo napište odpověď.','Dictation is unavailable in this browser. Use recording or type your answer.');return;}
 const generation=voiceGeneration;const engine=new Speech();recognition=engine;engine.lang='cs-CZ';engine.continuous=false;engine.interimResults=false;
 engine.onresult=e=>{if(generation!==voiceGeneration||recognition!==engine)return;let text='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)text+=e.results[i][0].transcript+' ';if(text.trim()){$('answer').value=text.trim().replace(/[.!?]+$/,'');$('answer').dispatchEvent(new Event('input',{bubbles:true}));setVoiceStatus('Text je v odpovědi. Před kontrolou ho můžete upravit.','The text is in the answer box. You can edit it before checking.');}};
 engine.onerror=e=>{if(generation!==voiceGeneration)return;setVoiceStatus(e.error==='not-allowed'?'Diktování nemá přístup k mikrofonu.':'Diktování nerozpoznalo odpověď. Zkuste znovu nebo napište text.',e.error==='not-allowed'?'Dictation has no microphone permission.':'Dictation did not recognise the answer. Try again or type the text.');};
 engine.onend=()=>{if(generation!==voiceGeneration)return;if(recognition===engine)recognition=null;if(voiceState[0]==='Poslouchám…')setVoiceStatus('Diktování skončilo. Pokud se text neobjevil, zkuste znovu.','Dictation ended. If no text appeared, try again.');voiceUI();};
 try{engine.start();setVoiceStatus('Poslouchám…','Listening…');voiceUI();}catch{recognition=null;setVoiceStatus('Diktování se nepodařilo spustit.','Could not start dictation.');voiceUI();}
};
$('stop-dictate').onclick=()=>{if(recognition)recognition.stop();};
const showBeforeVoice=show;show=function(){clearVoice();showBeforeVoice();voiceUI();};
window.addEventListener('pagehide',clearVoice);
