// ═══════════════════════════════════════
//  QUIZ - Czy jesteś Reaktywnym Nerdem?
//  4 levele po 5 pytań
// ═══════════════════════════════════════

var NERD_QUIZ=[
  // L1 - Dendryty się budzą (podstawy)
  {q:"Jaki jest średni prosty czas reakcji człowieka na bodziec wzrokowy?",a:["50-100 ms","190-250 ms","500-700 ms","1000-1500 ms"],correct:1,explain:"Przyjmowane wartości to około 190-250 ms u młodych dorosłych.",source:"Welford AT (1980); Jain A et al. (2015). Int J Appl Basic Med Res, 5(2), 124-127.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/"},
  {q:"Który rodzaj bodźca wywołuje najszybszą reakcję?",a:["Wzrokowy","Dotykowy","Słuchowy","Węchowy"],correct:2,explain:"Sygnał słuchowy dociera do kory mózgowej w ~8-10 ms, wzrokowy potrzebuje 20-40 ms.",source:"Pain MTG, Hibbs A (2007). J Sports Sciences, 25(1), 79-86.",link:"https://www.tandfonline.com/doi/abs/10.1080/02640410600718004"},
  {q:"Ile procent energii ciała zużywa mózg?",a:["2%","10%","20%","50%"],correct:2,explain:"Mózg waży ~2% masy ciała, ale zużywa aż ~20% całkowitej energii.",source:"Raichle ME, Gusnard DA (2002). PNAS, 99(16), 10237-10239.",link:"https://pubmed.ncbi.nlm.nih.gov/12149485/"},
  {q:"Mózg dorosłego człowieka waży około:",a:["0.5 kg","1.4 kg","3.0 kg","5.0 kg"],correct:1,explain:"Przeciętny dorosły mózg waży ~1.3-1.5 kg. Zawiera ~86 miliardów neuronów.",source:"Azevedo FA et al. (2009). J Comp Neurol, 513(5), 532-541.",link:"https://pubmed.ncbi.nlm.nih.gov/19226510/"},
  {q:"Który czynnik POPRAWIA czas reakcji?",a:["Alkohol","Deprywacja snu","Regularna aktywność fizyczna","Obfity posiłek"],correct:2,explain:"Regularnie ćwiczący mieli istotnie krótsze czasy reakcji (Jain et al., 2015).",source:"Jain A et al. (2015). Int J Appl Basic Med Res, 5(2), 124-127.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/"},
  // L2 - Aksonowy uczeń (mielina i transmisja)
  {q:"Co to jest mielinizacja?",a:["Rodzaj treningu siłowego","Proces otaczania włókien nerwowych osłonką tłuszczową","Metoda rozciągania mięśni","Typ suplementacji sportowej"],correct:1,explain:"Mielina owijająca aksony działa jak izolacja na kablu - im grubsza, tym szybsza transmisja.",source:"McKenzie IA et al. (2014). Science, 346(6207), 318-322.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC6140121/"},
  {q:"Z jaką maksymalną prędkością sygnał nerwowy podróżuje po zmielinizowanych aksonach?",a:["1-5 m/s","20-50 m/s","80-120 m/s","Prędkość światła"],correct:2,explain:"Do ~120 m/s (~430 km/h). Bez mieliny zaledwie 0.5-2 m/s.",source:"Purves D et al. (2018). Neuroscience, 6th edition.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC3849146/"},
  {q:"Czym jest przewodzenie skokowe (saltatory conduction)?",a:["Skok sygnału między węzłami Ranviera","Technika skoku w dal","Rodzaj treningu plyometrycznego","Metoda pomiaru siły"],correct:0,explain:"Sygnał 'skacze' między przerwami w osłonce mielinowej, przyspieszając transmisję do 100x.",source:"Purves D et al. (2018). Neuroscience, 6th edition.",link:"https://med.libretexts.org/Courses/Las_Positas_College/BIO_50:_Anatomy_and_Physiology_(Zingg)/06:_Nervous_System/6.05:_Signal_Speed__How_Myelin_Turns_Nerves_into_Racetracks"},
  {q:"'Deep Practice' w kontekście mielinizacji oznacza:",a:["Trening pod wodą","Powtarzanie ruchu z naciskiem na precyzję, wzmacniające osłonkę mielinową","Medytację przed treningiem","Trening w ciemności"],correct:1,explain:"Powtarzanie z uwagą na precyzję stymuluje produkcję mieliny wokół aktywowanych aksonów.",source:"Coyle D (2009). The Talent Code. Bantam Books; McKenzie IA et al. (2014). Science, 346(6207), 318-322.",link:"https://uphillathlete.com/rock-climbing/myelination-make-you-better-athlete/"},
  {q:"Co NIE wpływa na czas reakcji wg badań naukowych?",a:["Zmęczenie","Kofeina","Kolor oczu","Wiek"],correct:2,explain:"Kolor oczu nie został powiązany z czasem reakcji w żadnym badaniu naukowym.",source:"Jain A et al. (2015). Int J Appl Basic Med Res, 5(2), 124-127.",link:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4456887/"},
  // L3 - Synaptyczny nerd (badania i sprinterzy)
  {q:"Ile wynosi próg falstartu w sprincie wg World Athletics?",a:["50 ms","100 ms","200 ms","300 ms"],correct:1,explain:"Reguła zakłada, że mózg nie przetworzy bodźca i nie zainicjuje ruchu w <100 ms.",source:"Komi PV et al. (2009). New Studies in Athletics, 24(1), 37-47.",link:"https://worldathletics.org/news/news/iaaf-sprint-start-research-project-is-the-100"},
  {q:"Badanie Komi et al. (2009) zlecone przez IAAF wykazało, że:",a:["Nikt nie reaguje szybciej niż 100 ms","Niektórzy sprinterzy reagują poniżej 80 ms","Kobiety reagują szybciej niż mężczyźni","Czas reakcji nie ma znaczenia w sprincie"],correct:1,explain:"Potwierdzili reakcje poniżej 80 ms i rekomendowali obniżenie progu do 80-85 ms.",source:"Komi PV et al. (2009). New Studies in Athletics, 24(1), 37-47.",link:"https://worldathletics.org/news/news/iaaf-sprint-start-research-project-is-the-100"},
  {q:"Pain & Hibbs (2007) zmierzyli u sprinterów latencje EMG poniżej:",a:["200 ms","100 ms","60 ms","10 ms"],correct:2,explain:"Latencje EMG mogą wynosić poniżej 60 ms - znacznie mniej niż próg 100 ms.",source:"Pain MTG, Hibbs A (2007). J Sports Sciences, 25(1), 79-86.",link:"https://www.tandfonline.com/doi/abs/10.1080/02640410600718004"},
  {q:"Co to jest zadanie go/no-go?",a:["Gra planszowa","Zadanie wymagające reagowania na jedne bodźce i hamowania na inne","Test wytrzymałości","Metoda interwałowa"],correct:1,explain:"Go/no-go bada kontrolę hamowania - reaguj na 'go', hamuj na 'no-go'.",source:"Verbruggen F, Logan GD (2008). Trends Cogn Sci, 12(11), 418-424.",link:"https://pubmed.ncbi.nlm.nih.gov/18799345/"},
  {q:"Badanie MindCrowd wykazało degradację czasu reakcji z wiekiem o około:",a:["1 ms na rok","3-7 ms na rok","20 ms na rok","Nie zmienia się z wiekiem"],correct:1,explain:"Degradacja ~3-7 ms/rok. Mężczyźni reagowali średnio o 34 ms szybciej niż kobiety.",source:"MindCrowd Study, Arizona Alzheimer's Consortium.",link:"https://mindcrowd.org/reaction-time-as-a-measure-of-brain-health-mindcrowd-study-findings/"},
  // L4 - Mielinowa elita (specjalistyczne)
  {q:"Analiza Brosnan et al. (2017) wykazała, że 95% czasów reakcji sprinterów mieściło się powyżej:",a:["80 ms","100 ms","122 ms","200 ms"],correct:2,explain:"Na >8500 startach z MŚ i ME (1999-2014). Zaproponowali progi: 115 ms (M), 119 ms (K).",source:"Brosnan KC et al. (2017). J Sports Sciences, 35(10), 929-935.",link:"https://www.academia.edu/26592344/"},
  {q:"Ile sakkad (szybkich ruchów oczu) wykonujemy średnio na sekundę?",a:["1","3-4","20","100"],correct:1,explain:"3-4 sakkady/s. Między nimi fiksacje 200-300 ms na przetwarzanie informacji.",source:"Rayner K (1998). Psychological Bulletin, 124(3), 372-422.",link:"https://pubmed.ncbi.nlm.nih.gov/9811504/"},
  {q:"Ile bitów informacji sensorycznej ciało produkuje na sekundę?",a:["1 000","100 000","11 milionów","1 miliard"],correct:2,explain:"~11 mln bitów/s. Świadomie przetwarzamy zaledwie ~50. Reszta filtrowana podświadomie.",source:"Zimmermann M (1989). Human Physiology. Springer, Berlin.",link:"https://backyardbrains.com/pages/the-science-of-your-reaction-time"},
  {q:"Trail Making Test (TMT) Reitana z 1958 służy do oceny:",a:["Wydolności tlenowej","Siły chwytu","Uwagi, szybkości przetwarzania i funkcji wykonawczych","Elastyczności mięśni"],correct:2,explain:"TMT wersja B (1-A-2-B-3-C) jest szczególnie czuła na zaburzenia płata czołowego.",source:"Reitan RM (1958). Perceptual and Motor Skills, 8(3), 271-276.",link:"https://pubmed.ncbi.nlm.nih.gov/13601598/"},
  {q:"Czy trening czasu reakcji przenosi się na codzienne funkcjonowanie?",a:["Nie, to tylko gra","Badania sugerują że tak - lepsze skanowanie, szybsze decyzje","Tylko u profesjonalnych sportowców","Tylko u osób poniżej 25 lat"],correct:1,explain:"Meta-analiza (2022) wykazała istotny efekt treningu na czas reakcji i decyzje.",source:"Frontiers in Human Neuroscience (2022). Neurofeedback Meta-Analysis.",link:"https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2022.868450/full"}
];

var QUIZ_LEVELS=[
  {name:'Dendryty się budzą',emoji:'🔬',range:[0,5]},
  {name:'Aksonowy uczeń',emoji:'🧬',range:[5,10]},
  {name:'Synaptyczny nerd',emoji:'🧠',range:[10,15]},
  {name:'Mielinowa elita',emoji:'⚡',range:[15,20]}
];

var QUIZ_FEEDBACK={
  perfect:['Pełna piątka. No i co ja Ci teraz powiem? Że jesteś świetny? Nie doczekasz się. Idź dalej.','5/5. Prawdziwy nerd nie czeka na pochwałę.','Wszystko dobrze. Podejrzanie dobrze. Sprawdzę czy nie googlowałeś.','OK, 5/5. Z taką wiedzą pewnie nie masz o czym gadać na imprezach.','Perfekcyjnie. Czujesz się lepiej? Bo ja czuję się zagrożony.'],
  great:['4/5. Jeden błąd. JEDEN. Będziesz o nim myśleć w nocy.','Prawie idealnie. "Prawie" robi różnicę - zapytaj sprintera, który przegrał o setną.','Jedno źle. Ale nie powiem które. Niech Cię to gryzie.','4/5. Pochwalę Cię. W myślach. Raz. Gotowe.','Solidnie. Za solidnie jak na kogoś, kto twierdzi, że "po prostu kliknął".'],
  pass:['3/5. Dostateczny. Trójka. Nie wstyd Ci? Przyłóż się.','Przeszedłeś. Ledwo. Jakby Twoja mielina miała dziury.','3/5 - w szkole to by było "zalicza, ale bez entuzjazmu".','Trzech z pięciu. Twoje neurony pracują na pół gwizdka.','Minimalnie. Jak falstart na granicy 100 ms - niby przeszło, ale bliziutko.'],
  fail_2:['2/5. Twoje aksony wysłały sygnał, ale chyba po drodze zabłądził.','Dwa dobrze. Przynajmniej wiesz, czego nie wiesz.','Odpadasz. Przeczytaj sekcję nerdową i wróć silniejszy.','2/5. Sekcja nerdowa na Ciebie czeka. Serio.'],
  fail_low:['1/5. Twoje dendryty oficjalnie protestują.','Zero lub jeden. Statystycznie trudno odpowiedzieć źle na wszystko. To też talent.','OK, to był raczej quiz diagnostyczny. Diagnoza: sekcja nerdowa. Natychmiast.','Twoja wiedza jest jak akson bez mieliny - sygnał się gubi.']
};

var NERD_BADGES={
  pre_synaptic:{emoji:'😴',name:'Pre-synaptyczny',desc:'Twoje dendryty jeszcze śpią. Obudź je lekturą.',color:'#6b7280'},
  synaptyczny:{emoji:'🔬',name:'Synaptyczny Świeżak',desc:'Iskra jest. Czas ją wzmocnić.',color:'#d97706'},
  aksonowy:{emoji:'🧬',name:'Aksonowy Adept',desc:'Sygnał płynie, ale jeszcze wolno.',color:'#22c55e'},
  mielinowy:{emoji:'🧠',name:'Mielinowy Nerd',desc:'Izolacja gruba. Prawie elita.',color:'#3b82f6'},
  reaktywny:{emoji:'⚡',name:'Reaktywny Nerd',desc:'Szybki mózg, solidna wiedza. Respekt.',color:'#a855f7'},
  elitarny:{emoji:'🏆',name:'Neuroprzekaźnik Elitarny',desc:'Twoje synapsy strzelają jak u noblisty.',color:'#eab308'},
  bog:{emoji:'👑',name:'Bóg Mieliny',desc:'Każdy akson Ci zazdrości. 100% izolacji.',color:'#dc2626'}
};

var _qLevel=0, _qLevelScore=0, _qIdx=0, _qTotal=0, _qLevelScores=[], _qOrder=[], _qLastFeedback='';

function _shuffleArr(arr){ var a=arr.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function _pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function openNerdQuiz(){
  var mi=document.getElementById('motion-info-modal'); if(mi) mi.remove();
  _qLevel=0; _qLevelScore=0; _qIdx=0; _qTotal=0; _qLevelScores=[];
  var old=document.getElementById('nerd-quiz-modal'); if(old) old.remove();
  var m=document.createElement('div'); m.id='nerd-quiz-modal';
  m.style.cssText='position:fixed;inset:0;z-index:99998;background:#0a0a0f;overflow-y:auto;color:#f2f2f2;font-family:Montserrat,sans-serif;';
  m.innerHTML='<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">'
    +'<div style="text-align:center;max-width:360px;width:100%;">'
    +'<div style="font-size:48px;margin-bottom:8px;">🧠</div>'
    +'<div style="font-size:20px;font-weight:900;margin-bottom:8px;">Czy jesteś Reaktywnym Nerdem?</div>'
    +'<div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:4px;">4 levele po 5 pytań. Minimum 3/5 żeby przejść dalej.</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:20px;">Zdobądź odznakę i pochwal się!</div>'
    +'<button onclick="_startQuizLevel(0)" style="width:100%;max-width:300px;padding:14px;background:#a855f7;color:#fff;border:none;border-radius:12px;font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;cursor:pointer;">Zaczynamy! 🚀</button>'
    +'</div></div>';
  _addQuizClose(m);
  document.body.appendChild(m);
}

function _addQuizClose(m){
  var cb=document.createElement('div'); cb.className='quiz-close-btn';
  cb.style.cssText='position:fixed;top:14px;right:14px;z-index:99999;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;color:rgba(255,255,255,.5);';
  cb.textContent='✕'; cb.onclick=function(){ document.getElementById('nerd-quiz-modal').remove(); };
  m.appendChild(cb);
}

function _startQuizLevel(lv){
  _qLevel=lv; _qLevelScore=0; _qIdx=0;
  var lvCfg=QUIZ_LEVELS[lv];
  _qOrder=_shuffleArr(Array.from({length:5},function(_,i){return lvCfg.range[0]+i;}));
  _showQuizQ();
}

function _showQuizQ(){
  if(_qIdx>=5){ _showLevelResult(); return; }
  var qi=_qOrder[_qIdx]; var q=NERD_QUIZ[qi];
  var idxs=_shuffleArr([0,1,2,3]);
  var letters=['A','B','C','D'];
  var m=document.getElementById('nerd-quiz-modal'); if(!m) return;
  var globalIdx=_qLevel*5+_qIdx;
  var pct=Math.round(globalIdx/20*100);
  var lvCfg=QUIZ_LEVELS[_qLevel];
  var html='<div style="padding:16px 16px 40px;max-width:500px;margin:0 auto;">'
    +'<div style="font-size:10px;color:rgba(255,255,255,.3);text-align:center;margin-bottom:2px;">'+lvCfg.emoji+' Level '+(_qLevel+1)+': '+lvCfg.name+'</div>'
    +'<div style="font-size:12px;color:rgba(255,255,255,.4);text-align:center;margin-bottom:6px;">Pytanie '+(_qIdx+1)+'/5</div>'
    +'<div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px;margin-bottom:20px;"><div style="width:'+pct+'%;height:4px;background:#a855f7;border-radius:2px;transition:width .3s;"></div></div>'
    +'<div style="font-size:16px;font-weight:700;line-height:1.5;text-align:center;margin-bottom:20px;color:#f2f2f2;">'+q.q+'</div>'
    +'<div id="quiz-answers" style="display:flex;flex-direction:column;gap:8px;">';
  for(var i=0;i<4;i++){
    var oi=idxs[i];
    html+='<div class="quiz-ans" data-oidx="'+oi+'" onclick="_answerQuiz(this,'+oi+','+q.correct+')" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px 16px;font-size:13px;font-weight:500;color:rgba(255,255,255,.8);cursor:pointer;text-align:left;transition:all .15s;"><span style="font-weight:800;color:#a855f7;margin-right:10px;">'+letters[i]+'</span>'+q.a[oi]+'</div>';
  }
  html+='</div><div id="quiz-explain" style="display:none;"></div></div>';
  m.innerHTML=html;
  _addQuizClose(m);
}

function _answerQuiz(el2,picked,correct){
  var answers=document.querySelectorAll('.quiz-ans');
  answers.forEach(function(a){ a.onclick=null; a.style.cursor='default'; });
  var isCorrect=picked===correct;
  if(isCorrect){ _qLevelScore++; _qTotal++; }
  answers.forEach(function(a){
    var oidx=parseInt(a.dataset.oidx);
    if(oidx===correct){ a.style.background='rgba(74,222,128,.15)'; a.style.borderColor='rgba(74,222,128,.4)'; a.querySelector('span').style.color='#4ade80'; }
    else if(oidx===picked&&!isCorrect){ a.style.background='rgba(248,113,113,.15)'; a.style.borderColor='rgba(248,113,113,.4)'; a.querySelector('span').style.color='#f87171'; }
  });
  var qi=_qOrder[_qIdx]; var q=NERD_QUIZ[qi];
  var exp=document.getElementById('quiz-explain');
  if(exp){
    exp.style.display='block';
    exp.innerHTML='<div style="font-size:12px;color:rgba(255,255,255,.5);line-height:1.6;margin:12px 0;padding:10px;background:rgba(255,255,255,.03);border-radius:8px;">'
      +(isCorrect?'<span style="color:#4ade80;font-weight:700;">✓ Poprawnie!</span> ':'<span style="color:#f87171;font-weight:700;">✕ Źle!</span> ')
      +q.explain+'<br><span style="font-size:10px;color:rgba(255,255,255,.35);">'+q.source+' <a href="'+q.link+'" target="_blank" style="color:#3b82f6;text-decoration:underline;">→ Źródło</a></span></div>'
      +'<div onclick="_qIdx++;_showQuizQ();" style="color:#a855f7;font-size:13px;font-weight:700;cursor:pointer;text-align:center;padding:8px;">'+(_qIdx<4?'Następne pytanie >':'Pokaż wynik levelu >')+'</div>';
  }
}

function _showLevelResult(){
  _qLevelScores.push(_qLevelScore);
  var passed=_qLevelScore>=3;
  var lvCfg=QUIZ_LEVELS[_qLevel];
  var fb; if(_qLevelScore>=5) fb=_pick(QUIZ_FEEDBACK.perfect); else if(_qLevelScore>=4) fb=_pick(QUIZ_FEEDBACK.great); else if(_qLevelScore>=3) fb=_pick(QUIZ_FEEDBACK.pass); else if(_qLevelScore>=2) fb=_pick(QUIZ_FEEDBACK.fail_2); else fb=_pick(QUIZ_FEEDBACK.fail_low);
  _qLastFeedback=fb;
  var scCol=_qLevelScore>=5?'#4ade80':_qLevelScore>=4?'#3b82f6':_qLevelScore>=3?'#d97706':'#f87171';
  var m=document.getElementById('nerd-quiz-modal'); if(!m) return;
  var nextLv=_qLevel+1;
  var hasNext=passed&&nextLv<4;
  m.innerHTML='<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">'
    +'<div style="text-align:center;max-width:340px;width:100%;">'
    +'<div style="font-size:40px;margin-bottom:4px;">'+lvCfg.emoji+'</div>'
    +'<div style="font-size:16px;font-weight:800;color:rgba(255,255,255,.6);">Level '+(_qLevel+1)+': '+lvCfg.name+'</div>'
    +'<div style="font-size:36px;font-weight:900;color:'+scCol+';margin:8px 0;">'+_qLevelScore+'/5</div>'
    +'<div style="font-size:14px;font-style:italic;color:rgba(255,255,255,.6);line-height:1.6;margin-bottom:16px;max-width:300px;margin-left:auto;margin-right:auto;">'+fb+'</div>'
    +(hasNext?'<div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:12px;">Następny: '+QUIZ_LEVELS[nextLv].emoji+' '+QUIZ_LEVELS[nextLv].name+'</div>':'')
    +'<div style="display:flex;flex-direction:column;gap:6px;max-width:280px;margin:0 auto;">'
    +'<button onclick="_openQuizShareModal()" style="width:100%;padding:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">📸 Udostępnij wynik</button>'
    +(hasNext?'<button onclick="_startQuizLevel('+nextLv+')" style="width:100%;padding:14px;background:#a855f7;color:#fff;border:none;border-radius:12px;font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;cursor:pointer;">Dalej! 🚀</button>':'')
    +'<button onclick="_showQuizFinal()" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">'+(passed&&!hasNext?'Pokaż wynik końcowy':'Zakończ quiz')+'</button>'
    +(!passed?'<button onclick="document.getElementById(\'nerd-quiz-modal\').remove();openMotionInfo();setTimeout(function(){var nd=document.getElementById(\'motion-nerd-section\');if(nd)nd.style.display=\'block\';},100);" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(168,85,247,.3);color:#a855f7;border-radius:10px;font-family:Montserrat,sans-serif;font-size:11px;font-weight:700;cursor:pointer;">📖 Przeczytaj sekcję nerdową</button>':'')
    +'</div></div></div>';
  _addQuizClose(m);
}

function _getBadge(maxLv,total){
  if(maxLv>=4&&total>=20) return NERD_BADGES.bog;
  if(maxLv>=4&&total>=18) return NERD_BADGES.elitarny;
  if(maxLv>=4&&total>=15) return NERD_BADGES.reaktywny;
  if(maxLv>=3) return NERD_BADGES.mielinowy;
  if(maxLv>=2) return NERD_BADGES.aksonowy;
  if(maxLv>=1) return NERD_BADGES.synaptyczny;
  return NERD_BADGES.pre_synaptic;
}

function _showQuizFinal(){
  var maxLv=_qLevelScores.length;
  var badge=_getBadge(maxLv,_qTotal);
  var pct=Math.round(_qTotal/20*100);
  // Save
  try{
    var qr=JSON.parse(localStorage.getItem('axs_quiz_results')||'{}');
    var prev=qr.nerd_reaction||{attempts:0,bestScore:0,bestBadge:''};
    var isImproved=_qTotal>prev.bestScore;
    qr.nerd_reaction={score:_qTotal,total:20,levelScores:_qLevelScores,maxLevelReached:maxLv,badge:badge.name,date:new Date().toISOString(),attempts:(prev.attempts||0)+1,bestScore:Math.max(_qTotal,prev.bestScore||0),bestBadge:isImproved?badge.name:(prev.bestBadge||badge.name)};
    localStorage.setItem('axs_quiz_results',JSON.stringify(qr));
    // ATP
    var athlete=(el('motion-athlete')||{}).value||'';
    if(athlete&&typeof addPoints==='function'){
      if(prev.attempts===0) addPoints(athlete,'quiz',10,'Quiz Nerd: '+_qTotal+'/20');
      else if(isImproved) addPoints(athlete,'quiz',5,'Quiz Nerd PR: '+_qTotal+'/20');
    }
  }catch(e){}
  var m=document.getElementById('nerd-quiz-modal'); if(!m) return;
  var breakdown='';
  for(var i=0;i<_qLevelScores.length;i++){
    var ok=_qLevelScores[i]>=3;
    breakdown+='Level '+(i+1)+': '+_qLevelScores[i]+'/5 '+(ok?'✅':'❌')+(_qLevelScores.length>i+1?' | ':'');
  }
  m.innerHTML='<div style="min-height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">'
    +'<div style="text-align:center;max-width:360px;width:100%;">'
    +'<div style="font-size:56px;margin-bottom:4px;">'+badge.emoji+'</div>'
    +'<div style="font-size:20px;font-weight:900;color:'+badge.color+';margin-bottom:4px;">'+badge.name+'</div>'
    +'<div style="font-size:13px;font-style:italic;color:rgba(255,255,255,.5);margin-bottom:8px;">'+badge.desc+'</div>'
    +'<div style="font-size:18px;font-weight:700;margin-bottom:4px;">Łącznie: '+_qTotal+'/20 ('+pct+'%)</div>'
    +'<div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:16px;">'+breakdown+'</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;max-width:280px;margin:0 auto;">'
    +'<button onclick="_openQuizShareModal()" style="width:100%;padding:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">📸 Udostępnij wynik</button>'
    +'<button onclick="document.getElementById(\'nerd-quiz-modal\').remove();openMotionInfo();setTimeout(function(){var nd=document.getElementById(\'motion-nerd-section\');if(nd)nd.style.display=\'block\';},100);" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">📖 Przeczytaj sekcję nerdową</button>'
    +'<button onclick="openNerdQuiz();" style="width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">🔄 Spróbuj ponownie</button>'
    +'<div onclick="document.getElementById(\'nerd-quiz-modal\').remove();" style="color:rgba(255,255,255,.4);font-size:12px;cursor:pointer;padding:8px;">✕ Zamknij</div>'
    +'</div>'
    +_nerdChallengeNote()
    +'</div></div>';
  _addQuizClose(m);
}

function _openQuizShareModal(){
  var maxLv=_qLevelScores.length;
  var badge=_getBadge(maxLv,_qTotal);
  _sharePhoto=null; _shareFormat='story'; _shareColor='purple';
  var old=document.getElementById('quiz-share-modal'); if(old) old.remove();
  var ov=document.createElement('div'); ov.id='quiz-share-modal';
  ov.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:16px;';
  ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
  ov.innerHTML='<div style="max-width:400px;width:calc(100% - 32px);background:#1a1a1a;border-radius:16px;padding:20px;max-height:85vh;overflow-y:auto;color:#f2f2f2;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-size:16px;font-weight:800;">📸 Udostępnij wynik</div><div onclick="document.getElementById(\'quiz-share-modal\').remove()" style="cursor:pointer;font-size:14px;color:rgba(255,255,255,.5);width:32px;height:32px;display:flex;align-items:center;justify-content:center;">✕</div></div>'
    // Format
    +'<div style="display:flex;gap:8px;margin:8px 0;">'
    +'<div class="qsfmt" data-f="story" onclick="_shareFormat=\'story\';document.querySelectorAll(\'.qsfmt\').forEach(function(b){b.style.background=b.dataset.f===_shareFormat?\'#a855f7\':\'rgba(255,255,255,.06)\';b.style.color=b.dataset.f===_shareFormat?\'#fff\':\'rgba(255,255,255,.6)\';})" style="flex:1;padding:8px;border-radius:8px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;background:#a855f7;color:#fff;">Story 9:16</div>'
    +'<div class="qsfmt" data-f="post" onclick="_shareFormat=\'post\';document.querySelectorAll(\'.qsfmt\').forEach(function(b){b.style.background=b.dataset.f===_shareFormat?\'#a855f7\':\'rgba(255,255,255,.06)\';b.style.color=b.dataset.f===_shareFormat?\'#fff\':\'rgba(255,255,255,.6)\';})" style="flex:1;padding:8px;border-radius:8px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;background:rgba(255,255,255,.06);color:rgba(255,255,255,.6);">Post 1:1</div></div>'
    // Kolor
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin:8px 0 4px;">KOLOR</div>'
    +'<div id="qs-colors" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;"></div>'
    // Zdjęcie
    +'<div onclick="document.getElementById(\'qs-file\').click()" style="width:100%;padding:10px;border:1px dashed rgba(255,255,255,.15);border-radius:8px;background:transparent;color:rgba(255,255,255,.5);font-size:11px;font-weight:600;cursor:pointer;text-align:center;margin:8px 0;">📷 Dodaj zdjęcie</div>'
    +'<input type="file" id="qs-file" accept="image/*" style="display:none;" onchange="_onQsPhoto(this)">'
    +'<div id="qs-photo-prev" style="display:none;margin:6px 0;align-items:center;gap:8px;"></div>'
    // Tekst
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:4px;">TEKST NA GRAFICE</div>'
    +'<textarea id="qs-text" style="width:100%;height:60px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#f2f2f2;font-family:Montserrat,sans-serif;font-size:12px;padding:8px;resize:none;box-sizing:border-box;" placeholder="Wpisz swój tekst lub zostaw pusty">'+('AX do Ciebie: '+(_qLastFeedback||'')).replace(/'/g,'&#39;')+'</textarea>'
    // Generuj
    +'<div onclick="_genQuizShare()" style="width:100%;padding:12px;background:#a855f7;color:#fff;border-radius:10px;text-align:center;font-size:13px;font-weight:800;cursor:pointer;margin-top:8px;">Generuj podgląd</div>'
    +'<div id="qs-preview" style="display:none;margin-top:12px;text-align:center;"></div>'
    +'</div>';
  document.body.appendChild(ov);
  // Render color picker
  var cols=[{k:'purple',bg:'#140a1e'},{k:'blue',bg:'#0a1428'},{k:'gold',bg:'#1a1808'},{k:'green',bg:'#0a1a0e'},{k:'fire',bg:'#1a0808'},{k:'light',bg:'#f5f5f5'}];
  var cc=document.getElementById('qs-colors');
  if(cc) cc.innerHTML=cols.map(function(cl){ return '<div onclick="_shareColor=\''+cl.k+'\';document.querySelectorAll(\'#qs-colors>div\').forEach(function(d){d.style.borderColor=\'rgba(255,255,255,.1)\';});this.style.borderColor=\'#a855f7\';" style="width:32px;height:32px;border-radius:50%;background:'+cl.bg+';cursor:pointer;border:2px solid '+(cl.k==='purple'?'#a855f7':'rgba(255,255,255,.1)')+';"></div>'; }).join('');
}

var _qsPhoto=null;
function _onQsPhoto(input){
  if(!input.files||!input.files[0]) return;
  var reader=new FileReader();
  reader.onload=function(e){
    var img=new Image(); img.onload=function(){
      _qsPhoto=img;
      var p=document.getElementById('qs-photo-prev');
      if(p){ p.style.display='flex'; p.innerHTML='<img src="'+e.target.result+'" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"><div onclick="_qsPhoto=null;this.parentElement.style.display=\'none\'" style="font-size:11px;color:#f87171;cursor:pointer;margin-left:8px;">✕ Usuń</div>'; }
    }; img.src=e.target.result;
  }; reader.readAsDataURL(input.files[0]);
}
function _genQuizShare(){
  var maxLv=_qLevelScores.length;
  var badge=_getBadge(maxLv,_qTotal);
  var customText=(document.getElementById('qs-text')||{}).value||'';
  var w=1080, h=_shareFormat==='story'?1920:1080;
  var cv=document.createElement('canvas'); cv.width=w; cv.height=h;
  var ctx=cv.getContext('2d');
  var t=_THEMES[_shareColor]||_THEMES.purple;
  // Background
  if(_qsPhoto){
    var r=Math.max(w/_qsPhoto.width,h/_qsPhoto.height);
    ctx.drawImage(_qsPhoto,(w-_qsPhoto.width*r)/2,(h-_qsPhoto.height*r)/2,_qsPhoto.width*r,_qsPhoto.height*r);
    var tg=ctx.createLinearGradient(0,0,0,h*0.12); tg.addColorStop(0,'rgba(0,0,0,0.6)'); tg.addColorStop(1,'transparent');
    ctx.fillStyle=tg; ctx.fillRect(0,0,w,h*0.12);
    var bg=ctx.createLinearGradient(0,h*0.5,0,h); bg.addColorStop(0,'transparent'); bg.addColorStop(0.25,'rgba(0,0,0,0.4)'); bg.addColorStop(0.5,'rgba(0,0,0,0.7)'); bg.addColorStop(1,'rgba(0,0,0,0.92)');
    ctx.fillStyle=bg; ctx.fillRect(0,h*0.5,w,h*0.5);
  } else {
    var g=ctx.createLinearGradient(0,0,w*0.4,h); g.addColorStop(0,t.bg1); g.addColorStop(0.5,t.bg2); g.addColorStop(1,t.bg1);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  }
  // Lines
  var lG=ctx.createLinearGradient(w*0.1,0,w*0.9,0);
  lG.addColorStop(0,'transparent'); lG.addColorStop(0.5,'rgba('+t.ar+',0.5)'); lG.addColorStop(1,'transparent');
  ctx.fillStyle=lG; ctx.fillRect(w*0.08,h*0.06,w*0.84,2); ctx.fillRect(w*0.08,h-h*0.06,w*0.84,2);
  // Branding top
  ctx.font='700 36px Montserrat,sans-serif'; ctx.fillStyle=_qsPhoto?'rgba(255,255,255,0.7)':t.sub; ctx.textAlign='left';
  ctx.fillText('Athleti',w*0.06,h*0.04); var aw=ctx.measureText('Athleti').width;
  ctx.fillStyle='#dc2626'; ctx.fillText('X',w*0.06+aw,h*0.04);
  var xw2=ctx.measureText('X').width;
  ctx.font='500 28px Montserrat,sans-serif'; ctx.fillStyle=_qsPhoto?'rgba(255,255,255,0.5)':t.muted;
  ctx.fillText(' App',w*0.06+aw+xw2,h*0.04);
  ctx.font='900 28px Montserrat,sans-serif'; ctx.fillStyle='rgba('+t.ar+',0.2)'; ctx.textAlign='right'; ctx.fillText('AX',w*0.94,h*0.04);
  // Badge emoji + name
  var cy=_qsPhoto?h*0.55:h*0.25;
  ctx.font='120px serif'; ctx.textAlign='center'; ctx.fillStyle=_qsPhoto?'#fff':t.text; ctx.fillText(badge.emoji,w/2,cy);
  ctx.font='800 36px Montserrat,sans-serif'; ctx.fillStyle=badge.color; ctx.fillText(badge.name,w/2,cy+50);
  // Score
  ctx.font='900 140px Montserrat,sans-serif'; ctx.fillStyle=_qsPhoto?'#fff':t.text; ctx.fillText(_qTotal+'/20',w/2,cy+190);
  ctx.font='700 28px Montserrat,sans-serif'; ctx.fillStyle=t.muted; ctx.fillText('Quiz: Reaktywny Nerd',w/2,cy+230);
  // Custom text with "AX do Ciebie:" prefix
  if(customText){
    var ty2=cy+260;
    var prefix='AX do Ciebie:';
    var bodyText=customText;
    if(customText.indexOf(prefix)===0){
      // Draw prefix in accent
      ctx.font='italic 700 18px Montserrat,sans-serif'; ctx.fillStyle=t.accent;
      ctx.fillText(prefix,w/2,ty2); ty2+=28;
      bodyText=customText.substring(prefix.length).trim();
    }
    if(bodyText){
      ctx.font='italic 18px Montserrat,sans-serif'; ctx.fillStyle='rgba(255,255,255,0.5)';
      var words=bodyText.split(' '), lines=[], line='';
      for(var i=0;i<words.length;i++){
        var test=line+(line?' ':'')+words[i];
        if(ctx.measureText(test).width>w*0.8&&line){ lines.push(line); line=words[i]; } else line=test;
      }
      if(line) lines.push(line);
      lines=lines.slice(0,3);
      lines.forEach(function(l,li){ ctx.fillText(l,w/2,ty2+li*26); });
    }
  }
  // Tiles 2x2
  var tW=(w-w*0.16-16)/2, tH=100, tY=cy+(customText?260+90:280);
  var lastLvScore=_qLevelScores.length>0?_qLevelScores[_qLevelScores.length-1]:0;
  var tiles=[{v:badge.emoji+' '+badge.name.split(' ')[0],l:'ODZNAKA',c:badge.color},{v:'Level '+maxLv,l:'OSIĄGNIĘTY',c:t.accent},{v:lastLvScore+'/5',l:'WYNIK LEVELU',c:lastLvScore>=4?'#4ade80':lastLvScore>=3?'#d97706':'#f87171'},{v:_qTotal+'/20',l:'ŁĄCZNIE',c:_qsPhoto?'#fff':t.text}];
  for(var j=0;j<4;j++){
    var tx=w*0.08+(j%2)*(tW+16), ty=tY+Math.floor(j/2)*(tH+10);
    _rrect(ctx,tx,ty,tW,tH,16); ctx.fillStyle='rgba('+t.ar+',0.04)'; ctx.fill();
    ctx.font='800 36px Montserrat,sans-serif'; ctx.fillStyle=tiles[j].c; ctx.textAlign='center'; ctx.fillText(tiles[j].v,tx+tW/2,ty+50);
    ctx.font='700 14px Montserrat,sans-serif'; ctx.fillStyle=t.muted; ctx.fillText(tiles[j].l,tx+tW/2,ty+78);
  }
  // Branding bottom
  ctx.font='600 20px Montserrat,sans-serif'; ctx.fillStyle=_qsPhoto?'rgba(255,255,255,0.2)':t.muted; ctx.textAlign='center';
  ctx.fillText('Elevate Your Game ⚡',w/2,h-h*0.03-14);
  ctx.font='400 14px Montserrat,sans-serif'; ctx.fillStyle='rgba('+t.ar+',0.15)';
  ctx.fillText('athletix-code.github.io',w/2,h-h*0.03+6);
  // Show preview
  var p=document.getElementById('qs-preview'); if(!p) return;
  p.style.display='block';
  var img=document.createElement('img'); img.src=cv.toDataURL('image/png');
  img.style.cssText='max-width:280px;width:100%;border-radius:8px;margin:0 auto 12px;display:block;';
  p.innerHTML=''; p.appendChild(img);
  // Share/download buttons
  var canSh=false; try{ canSh=navigator.canShare&&navigator.canShare({files:[new File([''],'t.png',{type:'image/png'})]}); }catch(e){}
  if(canSh){
    var sb=document.createElement('div');
    sb.style.cssText='width:100%;padding:12px;background:#a855f7;color:#fff;border-radius:10px;text-align:center;font-size:13px;font-weight:800;cursor:pointer;margin-bottom:6px;';
    sb.textContent='Udostępnij';
    sb.onclick=function(){ cv.toBlob(function(blob){ var f=new File([blob],'athletix-quiz.png',{type:'image/png'}); navigator.share({files:[f],title:'Mój wynik - AthletiX Quiz',text:'Elevate Your Game!'}).catch(function(){}); },'image/png'); };
    p.appendChild(sb);
  }
  var db=document.createElement('div');
  db.style.cssText='width:100%;padding:10px;background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.6);border-radius:10px;text-align:center;font-size:12px;font-weight:700;cursor:pointer;';
  db.textContent='Pobierz PNG';
  db.onclick=function(){ cv.toBlob(function(blob){ var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download='athletix-quiz.png'; a.click(); URL.revokeObjectURL(url); },'image/png'); };
  p.appendChild(db);
}
