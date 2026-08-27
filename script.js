const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const STORAGE_KEY = 'glorbEmpathyStateV3';

const defaultProgress = () => ({
  name: '', story: 0, teach: 0,
  completed: [false, false, false],
  case: 0, sort: 0, response: 0,
  caseData: [0,1,2].map(() => ({opened: [], wrong: [], correct: false})),
  sortData: [0,1,2,3].map(() => ({wrong: [], correct: false})),
  responseData: [0,1,2,3].map(() => ({wrong: [], correct: false})),
  history: [], speech: false
});

const state = defaultProgress();
const app = $('#app');

const story = [
  {title:'YOU TAUGHT ME TO LISTEN.', img:'assets/glorb.png', text:'Last mission, I learned to listen and wait for a pause.\n\nBut I found a new Earth problem. I can hear the words and still get the feeling wrong.'},
  {title:'I KEEP GUESSING TOO FAST.', img:'assets/desk-tired.png', text:'I saw a student with their head on the desk. I thought something terrible had happened.\n\nThey were tired.\n\nOne clue was not enough.'},
  {title:'I ALSO TRY TO FIX EVERYTHING.', img:'assets/listen-friend.png', text:'A friend said their dog had died. I offered to find a new dog.\n\nThat did not help.\n\nSometimes people need us to listen, not fix the problem.'},
  {title:'I NEED AN EARTH HELPER.', img:'assets/glorb.png', text:'{{name}}, can you help me understand empathy?\n\nTeach me how to notice clues, make a careful guess, ask what someone needs and respond kindly.'}
];

const teach = [
  {title:'NOTICE', img:'assets/feelings-overview.png', meaning:'Look for more than one clue.', remember:'Look at their face, body, words and what is happening.', note:'One clue can mean different things.'},
  {title:'GUESS', img:'assets/student-desk.png', meaning:'Think about what the feeling might be.', remember:'Say “might” because your guess could be wrong.', note:'Clues help me think. They do not tell me for sure.'},
  {title:'CHECK', img:'assets/listen-friend.png', meaning:'Ask what would help.', remember:'They might want help, someone to listen, company or space. Ask them what they want.', note:'I do not have to fix every feeling. I can ask first.'},
  {title:'RESPOND', img:'assets/two-students.png', meaning:'Choose kind words or help.', remember:'Offer support. If they say no, stop and respect their choice.', note:'If someone says “no thanks”, I can accept that.'}
];

const cases = [
  {
    title:'THE DESK', img:'assets/desk-tired.png',
    situation:'After lunch, a classmate has their head on the desk.',
    clues:{FACE:'Eyes closed. Face relaxed.', BODY:'Very still.', WORDS:'Not speaking.', SITUATION:'Just after lunch.'},
    options:['Furious','Tired','Proud','Excited'], correct:'Tired',
    success:'Yes. Closed eyes, a relaxed face and a still body suggest they might be tired.',
    feedback:{
      Furious:'Not quite. Furious usually has stronger signs like tension, loud words or fast movement.',
      Proud:'Not quite. There are no clues that they feel pleased about something they did.',
      Excited:'Not quite. Excited usually looks more energetic. This person is very still.'
    }
  },
  {
    title:'THE CLASS QUESTION', img:'assets/student-desk.png',
    situation:'A student answers incorrectly in front of the class and looks down.',
    clues:{FACE:'Face is red.', BODY:'Shoulders pulled in.', WORDS:'“Can we move on?”', SITUATION:'The mistake was public.'},
    options:['Happy','Content','Embarrassed','Tired'], correct:'Embarrassed',
    success:'Yes. A red face, looking down and asking to move on suggest they might feel embarrassed.',
    feedback:{
      Happy:'Not quite. The clues do not show smiling, excitement or enjoyment.',
      Content:'Not quite. They look uncomfortable and want the attention to move away.',
      Tired:'Not quite. The clues are more about the mistake and being watched than low energy.'
    }
  },
  {
    title:'THE PRESENTATION', img:'assets/nervous-door.png',
    situation:'A student is waiting to give a presentation in five minutes.',
    clues:{FACE:'Eyes down.', BODY:'Fidgeting. Fast breaths.', WORDS:'“I’m worried I’ll mess it up.”', SITUATION:'A presentation is next.'},
    options:['Bored','Proud','Calm','Nervous'], correct:'Nervous',
    success:'Yes. Fidgeting, fast breathing and saying they are worried suggest they might be nervous.',
    feedback:{
      Bored:'Not quite. They are worried about what is about to happen, not uninterested.',
      Proud:'Not quite. They are talking about worry, not feeling pleased or confident.',
      Calm:'Not quite. Fast breathing and fidgeting do not fit calm very well here.'
    }
  }
];

const sorts = [
  {id:'books', img:'assets/dropped-books.png', text:'A classmate drops their books and papers everywhere.', answer:'help', why:'Yes. This is a clear problem you can help with.', feedback:{listen:'Not this one. They need practical help first.', check:'Not this one. You can simply offer to help.'}},
  {id:'dog', img:'assets/listen-friend.png', text:'A friend tells you their dog died last night.', answer:'listen', why:'Yes. You cannot fix the loss. Listening may help.', feedback:{help:'Not this one. This is not a problem you can fix.', check:'Not this one. Start by listening and being kind.'}},
  {id:'lunch', img:'assets/alone-lunch.png', text:'A classmate is sitting alone at lunch. You do not know if they want company.', answer:'check', why:'Yes. You do not know what they want, so ask first.', feedback:{help:'Not this one. You do not know what kind of help they want.', listen:'Not this one. They have not asked to talk yet. Check first.'}},
  {id:'mistake', img:'assets/student-desk.png', text:'Someone looks upset after a mistake. You are not sure if they want to talk.', answer:'check', why:'Yes. You are not sure what they want, so ask first.', feedback:{help:'Not this one. You do not know what would help yet.', listen:'Not this one. They may want to talk, but check first.'}}
];

const responses = [
  {title:'DROPPED BOOKS', img:'assets/dropped-books.png', text:'Papers are all over the floor and the student is in a hurry.', need:'THEY MAY NEED HELP.', choices:[
    ['“This is what happens when you carry too much.”',false,'Not quite. That points out the mistake instead of helping.'],
    ['“Do you want a hand picking those up?”',true,'Yes. It offers help without taking over.'],
    ['Stand and watch.',false,'Not quite. You can offer help first.']
  ]},
  {title:'A FRIEND’S DOG DIED', img:'assets/listen-friend.png', text:'Your friend is speaking quietly and looks sad.', need:'THEY MAY NEED YOU TO LISTEN.', choices:[
    ['“I can find you another dog.”',false,'Not quite. A new dog does not fix the loss.'],
    ['“At least you had a dog.”',false,'Not quite. That can make the person feel dismissed.'],
    ['“I’m sorry. Do you want me to stay with you?”',true,'Yes. It is kind and gives them a choice.']
  ]},
  {title:'BEFORE A PRESENTATION', img:'assets/nervous-door.png', text:'A student is fidgeting and says they are worried about presenting.', need:'THEY MAY WANT SUPPORT.', choices:[
    ['“Stop worrying.”',false,'Not quite. People cannot always switch a feeling off.'],
    ['“That sounds stressful. Want me to stay for a minute?”',true,'Yes. It notices the feeling and offers support.'],
    ['“Most presentations are fine, so your worry makes no sense.”',false,'Not quite. That does not really respond to how they feel.']
  ]},
  {title:'ALONE AT LUNCH', img:'assets/alone-lunch.png', text:'A classmate is sitting alone and looking down.', need:'ASK WHAT THEY WANT.', choices:[
    ['Sit down and start asking lots of questions.',false,'Not quite. Ask before taking over.'],
    ['Walk past because they did not ask.',false,'Not quite. You can check gently.'],
    ['“Do you want some company?”',true,'Yes. It checks what they want.']
  ]}
];

function esc(s){return String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c));}
function person(s){return String(s).replaceAll('{{name}}', state.name || 'Earth Helper');}
function setStage(t){$('#stageLabel').textContent=t;}
function saveState(){
  try{
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      name:state.name, story:state.story, teach:state.teach, completed:state.completed,
      case:state.case, sort:state.sort, response:state.response,
      caseData:state.caseData, sortData:state.sortData, responseData:state.responseData
    }));
  }catch{}
}
function loadState(){
  try{
    const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'null');
    if(saved && typeof saved==='object'){
      Object.assign(state, saved);
      state.history=[]; state.speech=false;
      state.caseData=Array.isArray(saved.caseData)?saved.caseData:defaultProgress().caseData;
      state.sortData=Array.isArray(saved.sortData)?saved.sortData:defaultProgress().sortData;
      state.responseData=Array.isArray(saved.responseData)?saved.responseData:defaultProgress().responseData;
    }
  }catch{}
}
function stopSpeech(){
  if('speechSynthesis' in window) speechSynthesis.cancel();
  state.speech=false;
  $('#readBtn').classList.remove('speaking');
  $('#readBtn').setAttribute('aria-pressed','false');
  $('#readLabel').textContent='Read aloud';
}
function updateNavControls(){
  $('#backBtn').disabled=state.history.length<2;
  $('#forwardBtn').disabled=true;
}
function pushHistory(view){if(state.history.at(-1)!==view) state.history.push(view); updateNavControls();}
function render(view,{push=true}={}){
  stopSpeech();
  if(push) pushHistory(view); else updateNavControls();
  saveState();
  window.scrollTo(0,0);
  views[view]();
  requestAnimationFrame(()=>{const h=$('h1,h2',app);if(h){h.tabIndex=-1;h.focus({preventScroll:true});}});
}

const views = {
  boot(){
    setStage('START');
    app.innerHTML=`<section class="screen"><div class="shell split"><div class="visual-panel"><img src="assets/glorb.png" alt="Glorb"></div><article class="paper-panel"><div class="boot-copy"><p class="eyebrow">MEET GLORB</p><p class="orientation">Glorb is an alien learning how people on Earth understand each other.</p><p class="eyebrow">INCOMING TRANSMISSION</p><h1>GLORB & THE<br>EMPATHY MISSION</h1><p class="lead"><b>Glorb needs your help.</b> He can listen, but he still guesses feelings too quickly and tries to fix everything.</p><div class="boot-rule" aria-label="Empathy mission steps"><div><b>NOTICE</b></div><div><b>GUESS</b></div><div><b>CHECK</b></div><div><b>RESPOND</b></div></div><label class="eyebrow" for="playerName">EARTH HELPER // YOUR NAME</label><div class="name-row"><input id="playerName" maxlength="24" autocomplete="name" placeholder="Your name" value="${esc(state.name)}"><button id="start" class="button primary" ${state.name?'':'disabled'}>BEGIN</button></div><p class="fine">Your name is only used during this browser session and on your mission certificate.</p></div></article></div></section>`;
    const input=$('#playerName'), btn=$('#start');
    input.addEventListener('input',()=>{state.name=input.value.replace(/[^\p{L}\p{M}'’ .-]/gu,'').replace(/\s+/g,' ').trim().slice(0,24);btn.disabled=!state.name;saveState();});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!btn.disabled)btn.click();});
    btn.addEventListener('click',()=>{state.story=0;saveState();render('story');});
  },
  story(){
    setStage('STORY'); const s=story[state.story];
    app.innerHTML=`<section class="screen"><div class="shell split"><div class="visual-panel"><img src="${s.img}" alt="Story illustration"></div><article class="paper-panel"><p class="eyebrow">GLORB // FIELD MESSAGE</p><h2>${s.title}</h2><div class="story-copy">${person(s.text)}</div><div class="story-nav"><span class="count">${state.story+1} / ${story.length}</span><button id="next" class="button ink">${state.story===story.length-1?'MISSION BRIEFING':'CONTINUE'}</button></div></article></div></section>`;
    $('#next').onclick=()=>{if(state.story<story.length-1){state.story++;saveState();render('story');}else render('briefing');};
  },
  briefing(){
    setStage('BRIEFING');
    app.innerHTML=`<section class="screen"><div class="shell split"><div class="visual-panel"><img src="assets/two-students.png" alt="Two students talking"></div><article class="paper-panel compact"><p class="eyebrow">YOUR JOB</p><h2>HELP GLORB UNDERSTAND EMPATHY.</h2><p class="lead">Empathy means trying to understand another person and responding with care. You do not have to know exactly how they feel.</p><div class="briefing-list"><div><span>1</span><p><b>NOTICE</b><small>Look for more than one clue.</small></p></div><div><span>2</span><p><b>GUESS</b><small>Think about what they might feel.</small></p></div><div><span>3</span><p><b>CHECK</b><small>Ask what would help.</small></p></div><div><span>4</span><p><b>RESPOND</b><small>Choose kind words or help.</small></p></div></div><div class="intention"><b>WE ARE LEARNING TO:</b> notice clues, make a careful guess, check what someone needs and respond kindly.</div><button id="learn" class="button ink">LEARN THE RULE</button></article></div></section>`;
    $('#learn').onclick=()=>{state.teach=0;saveState();render('learn');};
  },
  learn(){
    setStage('LEARN'); const c=teach[state.teach];
    app.innerHTML=`<section class="screen"><div class="shell learn-shell"><header class="mini-head"><div><p class="eyebrow light">EMPATHY RULE</p><h2>LEARN ONE STEP AT A TIME</h2></div><span class="step-count">STEP ${state.teach+1} / 4</span></header><div class="learn-card"><div class="learn-visual"><img src="${c.img}" alt="Illustration for ${c.title.toLowerCase()}"></div><article class="learn-copy"><span class="learn-number">STEP ${state.teach+1}</span><h2>${c.title}</h2><p class="lead"><b>${c.meaning}</b></p><div class="remember">${c.remember}</div><p class="glorb-note">GLORB // ${c.note}</p></article></div><footer class="learn-footer"><div class="tracker">${teach.map((_,i)=>`<span class="${i<=state.teach?'on':''}"></span>`).join('')}</div><div><button id="prev" class="button ghost" ${state.teach===0?'disabled':''}>BACK</button> <button id="next" class="button primary">${state.teach===3?'START MISSIONS':'NEXT'}</button></div></footer></div></section>`;
    $('#prev').onclick=()=>{if(state.teach>0){state.teach--;saveState();render('learn');}};
    $('#next').onclick=()=>{if(state.teach<3){state.teach++;saveState();render('learn');}else render('hub');};
  },
  hub(){
    setStage('MISSIONS');
    const cards=[['01','NOTICE + GUESS','READ THE CLUES','Use more than one clue before making a feeling guess.','detective'],['02','CHECK','HELP, LISTEN OR CHECK?','Choose what Glorb should do first.','sort'],['03','RESPOND','WHAT SHOULD GLORB SAY?','Choose kind words that fit the situation.','respond']];
    app.innerHTML=`<section class="screen"><div class="shell hub-shell"><header class="mini-head"><div><p class="eyebrow light">EARTH HELPER CONSOLE</p><h2>TEACH GLORB 3 EMPATHY TOOLS</h2></div><span class="step-count">${state.completed.filter(Boolean).length} / 3 DONE</span></header><div class="helper-strip"><img src="assets/glorb.png" alt="Glorb"><p><b>${esc(state.name||'Earth Helper')}, you are Glorb’s helper.</b> Complete the missions in order.</p></div><div class="mission-grid">${cards.map((c,i)=>{const locked=i>0&&!state.completed[i-1],done=state.completed[i];return `<button class="mission-card ${done?'complete':''}" data-view="${c[4]}" ${locked?'disabled':''}><span class="num">${c[0]} // ${c[1]}</span><div><strong>${c[2]}</strong><p>${c[3]}</p></div><em>${done?'COMPLETE':locked?'LOCKED':'OPEN'}</em></button>`;}).join('')}</div></div></section>`;
    $$('.mission-card:not(:disabled)').forEach(b=>b.onclick=()=>{
      const v=b.dataset.view;
      if(v==='detective' && state.completed[0]) state.case=cases.length-1;
      if(v==='sort' && state.completed[1]) state.sort=sorts.length-1;
      if(v==='respond' && state.completed[2]) state.response=responses.length-1;
      saveState(); render(v);
    });
  },
  detective(){
    setStage('MISSION 1'); const c=cases[state.case], d=state.caseData[state.case]; const opened=new Set(d.opened);
    const feedbackText=d.correct?c.success:(d.wrong.length?c.feedback[d.wrong.at(-1)]+' Try another answer.':(opened.size<2?`Open ${2-opened.size} more clue${2-opened.size===1?'':'s'} first.`:'Choose the feeling that fits the clues best.'));
    const feedbackClass=d.correct?'feedback good':d.wrong.length?'feedback bad':'feedback';
    app.innerHTML=`<section class="screen"><div class="shell activity-shell"><header class="activity-head"><div><p class="eyebrow light">MISSION 01 // NOTICE + GUESS</p><h2>READ THE CLUES</h2><p class="activity-sub">Open at least 2 clues. Then choose the feeling that fits best. It is still a guess.</p></div><span class="step-count">CASE ${state.case+1} / ${cases.length}</span></header><div class="case-board"><article class="case-card"><div class="case-image"><img src="${c.img}" alt="Case illustration"></div><div><h3>${c.title}</h3><p class="case-text">${c.situation}</p><div class="clue-grid">${Object.entries(c.clues).map(([k,v])=>`<button class="clue ${opened.has(k)?'':'closed'}" data-k="${k}"><b>${k}</b><small>${opened.has(k)?v:'TAP TO OPEN'}</small></button>`).join('')}</div></div></article><aside class="answer-card"><p class="eyebrow">YOUR CAREFUL GUESS</p><h3>What might this person be feeling?</h3><div class="choices">${c.options.map(o=>`<button class="choice ${d.correct&&o===c.correct?'correct':d.wrong.includes(o)?'wrong':''}" data-answer="${o}" ${(opened.size<2||d.correct||d.wrong.includes(o))?'disabled':''}>${o}</button>`).join('')}</div><div id="feedback" class="${feedbackClass}">${feedbackText}</div><button id="caseNext" class="button primary ${d.correct?'':'hidden'}">${state.case===cases.length-1?(state.completed[0]?'MISSION COMPLETE':'FINISH MISSION'):'NEXT CASE'}</button></aside></div><footer class="activity-foot"><span class="small-status">${opened.size} / 4 CLUES OPEN</span><button id="toHub" class="button ghost">BACK TO MISSIONS</button></footer></div></section>`;
    $$('.clue').forEach(b=>b.onclick=()=>{if(!d.opened.includes(b.dataset.k))d.opened.push(b.dataset.k);saveState();render('detective');});
    $$('.choice').forEach(b=>b.onclick=()=>{
      const a=b.dataset.answer;
      if(a===c.correct){d.correct=true;d.opened=Object.keys(c.clues);} else if(!d.wrong.includes(a)){d.wrong.push(a);}
      saveState();render('detective');
    });
    $('#caseNext').onclick=()=>{
      if(state.case<cases.length-1){state.case++;saveState();render('detective');}
      else{state.completed[0]=true;saveState();render('hub');}
    };
    $('#toHub').onclick=()=>render('hub');
  },
  sort(){
    setStage('MISSION 2'); const c=sorts[state.sort], d=state.sortData[state.sort];
    const msg=d.correct?c.why:(d.wrong.length?(c.feedback?.[d.wrong.at(-1)] || 'Try another choice.'):'Choose what Glorb should do first.');
    app.innerHTML=`<section class="screen"><div class="shell activity-shell"><header class="activity-head"><div><p class="eyebrow light">MISSION 02 // CHECK</p><h2>HELP, LISTEN OR CHECK?</h2><p class="activity-sub">One situation at a time. What should Glorb do first?</p></div><span class="step-count">${state.sort+1} / ${sorts.length}</span></header><div class="sort-layout"><div class="sort-visual"><img src="${c.img}" alt="Situation illustration"></div><article class="sort-card-main"><span class="sort-counter">SITUATION ${state.sort+1}</span><p class="sort-situation"><b>${c.text}</b></p><div class="sort-options"><button class="sort-option ${d.correct&&c.answer==='help'?'correct':d.wrong.includes('help')?'wrong':''}" data-a="help" ${d.correct||d.wrong.includes('help')?'disabled':''}><b>HELP</b><small>Do something useful</small></button><button class="sort-option ${d.correct&&c.answer==='listen'?'correct':d.wrong.includes('listen')?'wrong':''}" data-a="listen" ${d.correct||d.wrong.includes('listen')?'disabled':''}><b>LISTEN</b><small>Be there and listen</small></button><button class="sort-option ${d.correct&&c.answer==='check'?'correct':d.wrong.includes('check')?'wrong':''}" data-a="check" ${d.correct||d.wrong.includes('check')?'disabled':''}><b>CHECK</b><small>Ask what they want</small></button></div><div id="feedback" class="feedback ${d.correct?'good':d.wrong.length?'bad':''}">${msg}</div><button id="sortNext" class="button primary ${d.correct?'':'hidden'}">${state.sort===sorts.length-1?(state.completed[1]?'MISSION COMPLETE':'FINISH MISSION'):'NEXT SITUATION'}</button><div class="sort-progress">${sorts.map((_,i)=>{const done=state.sortData[i].correct;return `<div class="${done?'done':i===state.sort?'active':''}">${done?'✓':i+1}</div>`;}).join('')}</div></article></div><footer class="activity-foot"><span class="small-status">HELP = useful action · LISTEN = be there · CHECK = ask first</span><button id="toHub" class="button ghost">BACK TO MISSIONS</button></footer></div></section>`;
    $$('.sort-option').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a===c.answer)d.correct=true;else if(!d.wrong.includes(a))d.wrong.push(a);saveState();render('sort');});
    $('#sortNext').onclick=()=>{if(state.sort<sorts.length-1){state.sort++;saveState();render('sort');}else{state.completed[1]=true;saveState();render('hub');}};
    $('#toHub').onclick=()=>render('hub');
  },
  respond(){
    setStage('MISSION 3'); const c=responses[state.response], d=state.responseData[state.response]; const correctIndex=c.choices.findIndex(x=>x[1]);
    let msg='Choose what Glorb should say.';
    if(d.correct) msg=c.choices[correctIndex][2]; else if(d.wrong.length) msg=c.choices[d.wrong.at(-1)][2]+' Try another answer.';
    app.innerHTML=`<section class="screen"><div class="shell activity-shell"><header class="activity-head"><div><p class="eyebrow light">MISSION 03 // RESPOND</p><h2>WHAT SHOULD GLORB SAY?</h2><p class="activity-sub">Choose kind words that fit the situation. Wrong answers turn grey.</p></div><span class="step-count">${state.response+1} / ${responses.length}</span></header><div class="response-layout"><div class="response-visual"><img src="${c.img}" alt="Scenario illustration"></div><article class="response-card"><p class="eyebrow">${c.title}</p><p class="case-text">${c.text}</p><div class="need-box"><span>WHAT MIGHT HELP?</span><strong>${c.need}</strong></div><h3>Choose Glorb’s response.</h3><div class="choices">${c.choices.map((x,i)=>`<button class="choice ${d.correct&&i===correctIndex?'correct':d.wrong.includes(i)?'wrong':''}" data-i="${i}" ${d.correct||d.wrong.includes(i)?'disabled':''}>${x[0]}</button>`).join('')}</div><div id="feedback" class="feedback ${d.correct?'good':d.wrong.length?'bad':''}">${msg}</div><button id="responseNext" class="button primary ${d.correct?'':'hidden'}">${state.response===responses.length-1?(state.completed[2]?'MISSION COMPLETE':'COMPLETE MISSION'):'NEXT'}</button></article></div><footer class="activity-foot"><span class="small-status">BE KIND · OFFER HELP · LISTEN · ASK FIRST</span><button id="toHub" class="button ghost">BACK TO MISSIONS</button></footer></div></section>`;
    $$('.choice').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(c.choices[i][1])d.correct=true;else if(!d.wrong.includes(i))d.wrong.push(i);saveState();render('respond');});
    $('#responseNext').onclick=()=>{if(state.response<responses.length-1){state.response++;saveState();render('respond');}else{state.completed[2]=true;saveState();render('complete');}};
    $('#toHub').onclick=()=>render('hub');
  },
  complete(){
    setStage('COMPLETE');
    app.innerHTML=`<section class="screen"><div class="shell split complete-shell"><div class="visual-panel"><img src="assets/glorb.png" alt="Glorb"></div><article class="paper-panel complete-panel"><p class="eyebrow">FINAL FIELD REPORT</p><h2>${esc(state.name||'Earth Helper')}, YOU HELPED GLORB.</h2><p class="lead">You helped Glorb slow down, use more than one clue, ask what a person wants and choose a kind response.</p><div class="final-rule"><div><b>NOTICE</b><small>more than one clue</small></div><div><b>GUESS</b><small>use “might”</small></div><div><b>CHECK</b><small>ask what would help</small></div><div><b>RESPOND</b><small>choose kind words or help</small></div></div><p class="glorb-quote">“Earth is still confusing, but I am getting better at asking before I guess. Thank you, ${esc(state.name||'Earth Helper')}.” // GLORB</p><div class="certificate-cta"><div><b>EARTH HELPER CERTIFICATE</b><p>A record of the tools you helped Glorb practise.</p></div><button id="cert" class="button primary">VIEW CERTIFICATE</button></div><button id="replay" class="button ghost" style="margin-top:8px">START OVER</button></article></div></section>`;
    $('#cert').onclick=()=>render('certificate');
    $('#replay').onclick=()=>{try{sessionStorage.removeItem(STORAGE_KEY);}catch{} location.reload();};
  },
  certificate(){
    setStage('CERTIFICATE'); const d=new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'});
    app.innerHTML=`<section class="screen certificate-screen"><div class="certificate-wrap"><div id="certificate" class="certificate" role="document" aria-label="Earth Helper certificate"><div class="certificate-art"><img src="assets/glorb.png" alt="Glorb"></div><div class="certificate-copy"><p class="certificate-kicker">CERTIFICATE OF EARTH ASSISTANCE</p><h1>GLORB EMPATHY MISSION</h1><p style="margin:0;font-size:.75rem">Awarded to</p><div class="certificate-name">${esc(state.name||'Earth Helper')}</div><p class="certificate-summary">for helping Glorb practise four empathy tools and make careful, kind choices with people on Earth.</p><div class="certificate-tools"><div><b>NOTICE</b><small>more than one clue</small></div><div><b>GUESS</b><small>use “might”</small></div><div><b>CHECK</b><small>ask what would help</small></div><div><b>RESPOND</b><small>offer kind words or help</small></div></div><div class="certificate-footer"><span>${d}</span><span>GLORB SOCIAL SKILLS FRAMEWORK</span></div></div><div class="certificate-actions"><button id="certBack" class="button ink">BACK</button><button id="print" class="button primary">PRINT / SAVE PDF</button></div></div></div></section>`;
    $('#certBack').onclick=()=>render('complete'); $('#print').onclick=()=>window.print();
  }
};

$('#backBtn').addEventListener('click',()=>{stopSpeech();if(state.history.length>1){state.history.pop();const prev=state.history.at(-1);render(prev,{push:false});}});
$('#forwardBtn').addEventListener('click',()=>{});
$('#teacherBtn').onclick=()=>{stopSpeech();$('#teacherModal').classList.remove('hidden');setTeacherTab('about');$('#closeTeacherBtn').focus();};
function setTeacherTab(name){
  $$('.teacher-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
  $$('.teacher-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===name));
}
$$('.teacher-tab').forEach(b=>b.onclick=()=>setTeacherTab(b.dataset.tab));
function closeTeacher(){$('#teacherModal').classList.add('hidden');$('#teacherBtn').focus();}
$('#closeTeacherBtn').onclick=closeTeacher; $('#teacherModal').addEventListener('click',e=>{if(e.target===$('#teacherModal'))closeTeacher();});
$('#helpBtn').onclick=()=>{stopSpeech();$('#helpModal').classList.remove('hidden');$('#closeHelpBtn').focus();};
function closeHelp(){$('#helpModal').classList.add('hidden');$('#helpBtn').focus();}
$('#closeHelpBtn').onclick=closeHelp; $('#helpModal').addEventListener('click',e=>{if(e.target===$('#helpModal'))closeHelp();});
$('#readBtn').onclick=()=>{
  if(!('speechSynthesis' in window)){alert('Read aloud is not supported in this browser.');return;}
  if(state.speech||speechSynthesis.speaking){stopSpeech();return;}
  const active=$('.screen',app); if(!active)return;
  const clone=active.cloneNode(true); $$('button,.hidden,img',clone).forEach(n=>n.remove());
  const text=clone.textContent.replace(/\s+/g,' ').replace(/→/g,' then ').trim();
  const u=new SpeechSynthesisUtterance(text); u.rate=.92; u.lang='en-AU'; u.onend=stopSpeech; u.onerror=stopSpeech;
  state.speech=true; $('#readBtn').classList.add('speaking'); $('#readBtn').setAttribute('aria-pressed','true'); $('#readLabel').textContent='Stop'; speechSynthesis.speak(u);
};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#teacherModal').classList.contains('hidden'))closeTeacher();else if(!$('#helpModal').classList.contains('hidden'))closeHelp();else stopSpeech();}});

loadState();
render('boot');
