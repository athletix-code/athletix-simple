// ═══════════════════════════════════════
//  QUIZ - Czy jesteś Reaktywnym Nerdem?
// ═══════════════════════════════════════

var NERD_QUIZ=[
  {q:"Jaki jest średni prosty czas reakcji człowieka na bodziec wzrokowy?",a:["50-100 ms","190-250 ms","500-700 ms","1000-1500 ms"],correct:1,explain:"Przyjmowane wartości to około 190-250 ms u młodych dorosłych. Na bodziec słuchowy reagujemy szybciej - około 140-160 ms.",source:"Welford AT (1980). Reaction Times. Academic Press, New York; Jain A, Bansal R, Kumar A, Singh KD (2015). A comparative study of visual and auditory reaction times. Int J Appl Basic Med Res, 5(2), 124-127.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/"},
  {q:"Który rodzaj bodźca wywołuje najszybszą reakcję?",a:["Wzrokowy","Dotykowy","Słuchowy","Węchowy"],correct:2,explain:"Sygnał słuchowy dociera do kory mózgowej w ~8-10 ms, wzrokowy potrzebuje 20-40 ms. Dlatego starterzy w sprincie używają strzału, nie światła.",source:"Pain MTG, Hibbs A (2007). Sprint starts and the minimum auditory reaction time. Journal of Sports Sciences, 25(1), 79-86.",link:"https://www.tandfonline.com/doi/abs/10.1080/02640410600718004"},
  {q:"Ile wynosi próg falstartu w sprincie wg World Athletics?",a:["50 ms","100 ms","200 ms","300 ms"],correct:1,explain:"Reguła obowiązuje od 1991 roku. Zakłada, że mózg nie jest w stanie przetworzyć bodźca i zainicjować ruchu w <100 ms.",source:"Komi PV, Ishikawa M, Salmi J (2009). IAAF Sprint Start Research Project: Is the 100 ms limit still valid? New Studies in Athletics, 24(1), 37-47.",link:"https://worldathletics.org/news/news/iaaf-sprint-start-research-project-is-the-100"},
  {q:"Co to jest mielinizacja?",a:["Rodzaj treningu siłowego","Proces otaczania włókien nerwowych osłonką tłuszczową","Metoda rozciągania mięśni","Typ suplementacji sportowej"],correct:1,explain:"Mielina to substancja tłuszczowa owijająca aksony neuronów. Działa jak izolacja na kablu - im grubsza, tym szybsza transmisja sygnału nerwowego.",source:"McKenzie IA et al. (2014). Motor skill learning requires active central myelination. Science, 346(6207), 318-322.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC6140121/"},
  {q:"Z jaką maksymalną prędkością sygnał nerwowy podróżuje po zmielinizowanych aksonach?",a:["1-5 m/s","20-50 m/s","80-120 m/s","Prędkość światła"],correct:2,explain:"Prędkość w zmielinizowanych aksonach wynosi do ~120 m/s (~430 km/h). Aksony niezmielinizowane przewodzą zaledwie 0.5-2 m/s.",source:"Purves D et al. (2018). Neuroscience, 6th edition. Sinauer Associates.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC3849146/"},
  {q:"Badanie Komi, Ishikawa i Salmi (2009) zlecone przez IAAF wykazało, że:",a:["Nikt nie reaguje szybciej niż 100 ms","Niektórzy sprinterzy reagują poniżej 80 ms","Kobiety reagują szybciej niż mężczyźni","Czas reakcji nie ma znaczenia w sprincie"],correct:1,explain:"Autorzy potwierdzili reakcje poniżej 80 ms i rekomendowali obniżenie progu falstartu do 80-85 ms.",source:"Komi PV, Ishikawa M, Salmi J (2009). IAAF Sprint Start Research Project: Is the 100 ms limit still valid? New Studies in Athletics, 24(1), 37-47.",link:"https://worldathletics.org/news/news/iaaf-sprint-start-research-project-is-the-100"},
  {q:"Co NIE wpływa na czas reakcji wg badań naukowych?",a:["Zmęczenie","Kofeina","Kolor oczu","Wiek"],correct:2,explain:"Jain et al. (2015) wymieniają wiele czynników: wiek, płeć, zmęczenie, aktywność fizyczną, nawodnienie. Kolor oczu nie został powiązany z czasem reakcji.",source:"Jain A, Bansal R, Kumar A, Singh KD (2015). A comparative study of visual and auditory reaction times. Int J Appl Basic Med Res, 5(2), 124-127.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/"},
  {q:"Badanie MindCrowd wykazało, że czas reakcji pogarsza się z wiekiem o około:",a:["1 ms na rok","3-7 ms na rok","20 ms na rok","Nie zmienia się z wiekiem"],correct:1,explain:"Na dużej próbie populacyjnej wykazano degradację o ~3-7 ms na rok życia. Mężczyźni reagowali średnio o 34 ms szybciej niż kobiety.",source:"MindCrowd Study, Arizona Alzheimer's Consortium. Modifiers of Age-Associated Variation in Reaction Time.",link:"https://mindcrowd.org/reaction-time-as-a-measure-of-brain-health-mindcrowd-study-findings/"},
  {q:"Ile procent energii ciała zużywa mózg?",a:["2%","10%","20%","50%"],correct:2,explain:"Mózg waży tylko ~2% masy ciała (~1.4 kg), ale zużywa aż ~20% całkowitej energii.",source:"Raichle ME, Gusnard DA (2002). Appraising the brain's energy budget. Proceedings of the National Academy of Sciences, 99(16), 10237-10239.",link:"https://pubmed.ncbi.nlm.nih.gov/12149485/"},
  {q:"Czym jest przewodzenie skokowe (saltatory conduction)?",a:["Skok sygnału między węzłami Ranviera","Technika skoku w dal","Rodzaj treningu plyometrycznego","Metoda pomiaru siły"],correct:0,explain:"Sygnał 'skacze' między przerwami w osłonce mielinowej (węzłami Ranviera) zamiast płynąć ciągle. To przyspiesza transmisję do 100x szybciej.",source:"Purves D et al. (2018). Neuroscience, 6th edition. Sinauer Associates.",link:"https://med.libretexts.org/Courses/Las_Positas_College/BIO_50:_Anatomy_and_Physiology_(Zingg)/06:_Nervous_System/6.05:_Signal_Speed__How_Myelin_Turns_Nerves_into_Racetracks"},
  {q:"Pain & Hibbs (2007) zmierzyli u sprinterów latencje EMG poniżej:",a:["200 ms","100 ms","60 ms","10 ms"],correct:2,explain:"Wykazali, że latencje EMG mogą wynosić poniżej 60 ms - znacznie mniej niż oficjalny próg falstartu 100 ms.",source:"Pain MTG, Hibbs A (2007). Sprint starts and the minimum auditory reaction time. Journal of Sports Sciences, 25(1), 79-86.",link:"https://www.tandfonline.com/doi/abs/10.1080/02640410600718004"},
  {q:"Co to jest zadanie go/no-go?",a:["Gra planszowa","Zadanie wymagające reagowania na jedne bodźce i hamowania na inne","Test wytrzymałości","Metoda interwałowa"],correct:1,explain:"Go/no-go to standardowe zadanie neuropsychologiczne badające kontrolę hamowania - reaguj na 'go', hamuj na 'no-go'.",source:"Verbruggen F, Logan GD (2008). Response inhibition in the stop-signal paradigm. Trends in Cognitive Sciences, 12(11), 418-424.",link:"https://pubmed.ncbi.nlm.nih.gov/18799345/"},
  {q:"Który czynnik POPRAWIA czas reakcji?",a:["Alkohol","Deprywacja snu","Regularna aktywność fizyczna","Obfity posiłek"],correct:2,explain:"Regularnie ćwiczący badani mieli istotnie krótsze czasy reakcji niż osoby prowadzące siedzący tryb życia (Jain et al., 2015).",source:"Jain A, Bansal R, Kumar A, Singh KD (2015). A comparative study of visual and auditory reaction times. Int J Appl Basic Med Res, 5(2), 124-127.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/"},
  {q:"Mózg dorosłego człowieka waży około:",a:["0.5 kg","1.4 kg","3.0 kg","5.0 kg"],correct:1,explain:"Przeciętny dorosły mózg waży ~1.3-1.5 kg. Zawiera ~86 miliardów neuronów i ~100 bilionów synaps.",source:"Azevedo FA et al. (2009). Equal numbers of neuronal and nonneuronal cells make the human brain an isometrically scaled-up primate brain. Journal of Comparative Neurology, 513(5), 532-541.",link:"https://pubmed.ncbi.nlm.nih.gov/19226510/"},
  {q:"Ile sakkad (szybkich ruchów oczu) wykonujemy średnio na sekundę?",a:["1","3-4","20","100"],correct:1,explain:"Oczy wykonują 3-4 sakkady na sekundę. Między nimi fiksacje trwające 200-300 ms, podczas których mózg przetwarza informację.",source:"Rayner K (1998). Eye movements in reading and information processing: 20 years of research. Psychological Bulletin, 124(3), 372-422.",link:"https://pubmed.ncbi.nlm.nih.gov/9811504/"},
  {q:"Analiza Brosnan et al. (2017) wykazała, że 95% czasów reakcji sprinterów mieściło się powyżej:",a:["80 ms","100 ms","122 ms","200 ms"],correct:2,explain:"Na >8500 startach z lat 1999-2014, dolna granica 95% przedziału ufności wynosiła 122 ms.",source:"Brosnan KC, Hayes K, Harrison AJ (2017). Effects of false-start disqualification rules on response-times of elite-standard sprinters. Journal of Sports Sciences, 35(10), 929-935.",link:"https://www.academia.edu/26592344/"},
  {q:"Ile bitów informacji sensorycznej ciało produkuje na sekundę?",a:["1 000","100 000","11 milionów","1 miliard"],correct:2,explain:"Ciało generuje ~11 milionów bitów/s. Świadomie przetwarzamy zaledwie ~50 bitów. Reszta filtrowana podświadomie.",source:"Zimmermann M (1989). The nervous system in the context of information theory. In: Schmidt RF, Thews G (eds). Human Physiology. Springer, Berlin.",link:"https://backyardbrains.com/pages/the-science-of-your-reaction-time"},
  {q:"'Deep Practice' w kontekście mielinizacji oznacza:",a:["Trening pod wodą","Powtarzanie ruchu z naciskiem na precyzję, wzmacniające osłonkę mielinową","Medytację przed treningiem","Trening w ciemności"],correct:1,explain:"Powtarzanie z uwagą na precyzję stymuluje oligodendrocyty do produkcji mieliny wokół aktywowanych aksonów.",source:"Coyle D (2009). The Talent Code. Bantam Books; McKenzie IA et al. (2014). Motor skill learning requires active central myelination. Science, 346(6207), 318-322.",link:"https://uphillathlete.com/rock-climbing/myelination-make-you-better-athlete/"},
  {q:"Trail Making Test (TMT) Reitana z 1958 służy do oceny:",a:["Wydolności tlenowej","Siły chwytu","Uwagi, szybkości przetwarzania i funkcji wykonawczych","Elastyczności mięśni"],correct:2,explain:"TMT to jeden z najczęściej stosowanych testów neuropsychologicznych. Wersja B (1-A-2-B-3-C) jest czuła na zaburzenia płata czołowego.",source:"Reitan RM (1958). Validity of the Trail Making Test as an indicator of organic brain damage. Perceptual and Motor Skills, 8(3), 271-276.",link:"https://pubmed.ncbi.nlm.nih.gov/13601598/"},
  {q:"Czy trening czasu reakcji przenosi się na codzienne funkcjonowanie?",a:["Nie, to tylko gra","Badania sugerują że tak - lepsze skanowanie, szybsze decyzje","Tylko u profesjonalnych sportowców","Tylko u osób poniżej 25 lat"],correct:1,explain:"Meta-analiza (Frontiers in Human Neuroscience, 2022) wykazała istotny efekt treningu na czas reakcji i podejmowanie decyzji.",source:"Frontiers in Human Neuroscience (2022). The Effect of Neurofeedback on the Reaction Time and Cognitive Performance of Athletes: A Systematic Review and Meta-Analysis.",link:"https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2022.868450/full"}
];

var _quizIdx=0, _quizScore=0, _quizOrder=[], _quizAnswerMap=[];

function _shuffleArr(arr){
  var a=arr.slice();
  for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; }
  return a;
}

function openNerdQuiz(){
  // Close module info modal if open
  var mi=document.getElementById('motion-info-modal'); if(mi) mi.remove();
  _quizIdx=0; _quizScore=0;
  _quizOrder=_shuffleArr(Array.from({length:NERD_QUIZ.length},function(_,i){return i;}));
  var old=document.getElementById('nerd-quiz-modal'); if(old) old.remove();
  var m=document.createElement('div'); m.id='nerd-quiz-modal';
  m.style.cssText='position:fixed;inset:0;z-index:99998;background:#0a0a0f;overflow-y:auto;color:#f2f2f2;font-family:Montserrat,sans-serif;';
  m.innerHTML='<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">'
    +'<div style="text-align:center;max-width:360px;width:100%;">'
    +'<div style="font-size:48px;margin-bottom:8px;">🧠</div>'
    +'<div style="font-size:20px;font-weight:900;margin-bottom:8px;">Czy jesteś Reaktywnym Nerdem?</div>'
    +'<div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:4px;">20 pytań o czasie reakcji, neurofizjologii i nauce sportu.</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:20px;">Zdobądź odznakę i pochwal się znajomym!</div>'
    +'<button onclick="_showQuizQ()" style="width:100%;max-width:300px;padding:14px;background:#a855f7;color:#fff;border:none;border-radius:12px;font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;cursor:pointer;">Zaczynamy! 🚀</button>'
    +'</div></div>';
  // Close btn
  var cb=document.createElement('div'); cb.style.cssText='position:fixed;top:14px;right:14px;z-index:99999;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:rgba(255,255,255,.5);';
  cb.textContent='✕'; cb.onclick=function(){ m.remove(); cb.remove(); };
  m.appendChild(cb);
  document.body.appendChild(m);
}

function _showQuizQ(){
  if(_quizIdx>=NERD_QUIZ.length){ _showQuizResult(); return; }
  var qi=_quizOrder[_quizIdx];
  var q=NERD_QUIZ[qi];
  // Shuffle answers
  var idxs=[0,1,2,3]; idxs=_shuffleArr(idxs);
  _quizAnswerMap=idxs; // map display position -> original index
  var letters=['A','B','C','D'];
  var m=document.getElementById('nerd-quiz-modal'); if(!m) return;
  var pct=Math.round((_quizIdx/NERD_QUIZ.length)*100);
  var html='<div style="padding:16px 16px 40px;max-width:500px;margin:0 auto;">'
    +'<div style="font-size:12px;color:rgba(255,255,255,.4);text-align:center;margin-bottom:6px;">Pytanie '+(_quizIdx+1)+'/'+NERD_QUIZ.length+'</div>'
    +'<div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px;margin-bottom:20px;"><div style="width:'+pct+'%;height:4px;background:#a855f7;border-radius:2px;transition:width .3s;"></div></div>'
    +'<div style="font-size:16px;font-weight:700;line-height:1.5;text-align:center;margin-bottom:20px;color:#f2f2f2;">'+q.q+'</div>'
    +'<div id="quiz-answers" style="display:flex;flex-direction:column;gap:8px;">';
  for(var i=0;i<4;i++){
    var origIdx=idxs[i];
    html+='<div class="quiz-ans" data-oidx="'+origIdx+'" onclick="_answerQuiz(this,'+origIdx+','+q.correct+')" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;font-size:13px;font-weight:500;color:rgba(255,255,255,.8);cursor:pointer;text-align:left;transition:all .15s;"><span style="font-weight:800;color:#a855f7;margin-right:10px;">'+letters[i]+'</span>'+q.a[origIdx]+'</div>';
  }
  html+='</div><div id="quiz-explain" style="display:none;"></div></div>';
  // Keep close btn
  var firstChild=m.querySelector('div[style*="position:fixed"]');
  m.innerHTML=html;
  if(firstChild) m.appendChild(firstChild);
  else{
    var cb2=document.createElement('div'); cb2.style.cssText='position:fixed;top:14px;right:14px;z-index:99999;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:rgba(255,255,255,.5);';
    cb2.textContent='✕'; cb2.onclick=function(){ m.remove(); cb2.remove(); }; m.appendChild(cb2);
  }
}

function _answerQuiz(el2,picked,correct){
  // Prevent double click
  var answers=document.querySelectorAll('.quiz-ans');
  answers.forEach(function(a){ a.onclick=null; a.style.cursor='default'; });
  var isCorrect=picked===correct;
  if(isCorrect) _quizScore++;
  // Highlight
  answers.forEach(function(a){
    var oidx=parseInt(a.dataset.oidx);
    if(oidx===correct){ a.style.background='rgba(74,222,128,.15)'; a.style.borderColor='rgba(74,222,128,.4)'; a.querySelector('span').style.color='#4ade80'; }
    else if(oidx===picked&&!isCorrect){ a.style.background='rgba(248,113,113,.15)'; a.style.borderColor='rgba(248,113,113,.4)'; a.querySelector('span').style.color='#f87171'; }
  });
  // Show explanation
  var qi=_quizOrder[_quizIdx];
  var q=NERD_QUIZ[qi];
  var exp=document.getElementById('quiz-explain');
  if(exp){
    exp.style.display='block';
    exp.innerHTML='<div style="font-size:12px;color:rgba(255,255,255,.5);line-height:1.6;margin:12px 0;padding:10px;background:rgba(255,255,255,.03);border-radius:8px;">'
      +(isCorrect?'<span style="color:#4ade80;font-weight:700;">✓ Poprawnie!</span> ':'<span style="color:#f87171;font-weight:700;">✕ Źle!</span> ')
      +q.explain
      +'<br><span style="font-size:10px;color:rgba(255,255,255,.35);">'+q.source+' <a href="'+q.link+'" target="_blank" style="color:#3b82f6;text-decoration:underline;">→ Źródło</a></span></div>'
      +'<div onclick="_quizIdx++;_showQuizQ();" style="color:#a855f7;font-size:13px;font-weight:700;cursor:pointer;text-align:center;padding:8px;">'+(_quizIdx<NERD_QUIZ.length-1?'Następne pytanie >':'Pokaż wynik >')+' </div>';
  }
}

function _showQuizResult(){
  var score=_quizScore, pct=Math.round(score/20*100);
  var badge,badgeColor,badgeDesc,badgeEmoji;
  if(score>=18){ badge='Reaktywny Nerd - Elite'; badgeColor='#a855f7'; badgeEmoji='🧠'; badgeDesc=pct+'% wiedzy o neurofizjologii. Gratulacje - jesteś w elicie.'; }
  else if(score>=14){ badge='Reaktywny Nerd'; badgeColor='#3b82f6'; badgeEmoji='🔬'; badgeDesc='Solidna baza wiedzy. Jeszcze trochę i będziesz pisać publikacje.'; }
  else if(score>=10){ badge='Aspirujący Nerd'; badgeColor='#22c55e'; badgeEmoji='📚'; badgeDesc='Jest potencjał. Przeczytaj sekcję nerdową i wróć po więcej.'; }
  else if(score>=6){ badge='Świeżak'; badgeColor='#d97706'; badgeEmoji='🌱'; badgeDesc='Każdy kiedyś zaczynał. Czas się dokształcić!'; }
  else { badge='Antynerd'; badgeColor='#6b7280'; badgeEmoji='😴'; badgeDesc='Ale przynajmniej spróbowałeś. To więcej niż większość.'; }
  // Save
  try{
    var qr=JSON.parse(localStorage.getItem('axs_quiz_results')||'{}');
    var prev=qr.nerd_reaction||{attempts:0};
    qr.nerd_reaction={score:score,total:20,pct:pct,badge:badge,date:new Date().toISOString(),attempts:(prev.attempts||0)+1};
    localStorage.setItem('axs_quiz_results',JSON.stringify(qr));
  }catch(e){}
  // ATP
  var athlete=(el('motion-athlete')||{}).value||'';
  if(athlete&&typeof addPoints==='function'){
    try{
      var qr2=JSON.parse(localStorage.getItem('axs_quiz_results')||'{}');
      addPoints(athlete,'quiz',(qr2.nerd_reaction.attempts<=1?10:5),'Quiz Nerd: '+score+'/20');
    }catch(e2){}
  }
  var m=document.getElementById('nerd-quiz-modal'); if(!m) return;
  m.innerHTML='<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">'
    +'<div style="text-align:center;max-width:360px;width:100%;">'
    +'<div style="font-size:48px;margin-bottom:4px;">'+badgeEmoji+'</div>'
    +'<div style="font-size:18px;font-weight:900;color:'+badgeColor+';margin-bottom:4px;">'+badge+'</div>'
    +'<div style="font-size:24px;font-weight:800;margin-bottom:4px;">'+score+'/20 ('+pct+'%)</div>'
    +'<div style="font-size:13px;color:rgba(255,255,255,.5);font-style:italic;margin-bottom:16px;">'+badgeDesc+'</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;max-width:280px;margin:0 auto;">'
    +'<button onclick="document.getElementById(\'nerd-quiz-modal\').remove();openMotionInfo();setTimeout(function(){var nd=document.getElementById(\'motion-nerd-section\');if(nd)nd.style.display=\'block\';var ar=document.getElementById(\'nerd-arrow\');if(ar)ar.style.transform=\'rotate(180deg)\';},100);" style="width:100%;padding:12px;background:#a855f7;color:#fff;border:none;border-radius:10px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">📖 Przeczytaj sekcję nerdową</button>'
    +'<button onclick="_quizIdx=0;_quizScore=0;_quizOrder=_shuffleArr(Array.from({length:NERD_QUIZ.length},function(_,i){return i;}));_showQuizQ();" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">🔄 Spróbuj ponownie</button>'
    +'<button onclick="document.getElementById(\'nerd-quiz-modal\').remove();" style="background:transparent;border:none;color:rgba(255,255,255,.4);font-family:Montserrat,sans-serif;font-size:12px;cursor:pointer;padding:8px;">✕ Zamknij</button>'
    +'</div>'
    +_nerdChallengeNote()
    +'</div></div>';
}
