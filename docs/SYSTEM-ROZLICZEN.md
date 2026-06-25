# System rozliczeń (Skarbiec / Wallet) — AthletiX

> Dokumentacja logiki modułu rozliczeń finansowych. Zakres: **tylko finanse**
> (depozyt, saldo, dług, wejścia, odwołania, transakcje, pakiety, stawka).
> Warstwa motywacyjna (punkty mocy `powerPoints`, transakcje `type:'power'`,
> ATP / rangi / streak z `gamification.js`) jest **poza zakresem** tego dokumentu —
> mimo że pole `powerPoints` fizycznie istnieje w tym samym obiekcie `wallet`.

**Źródło kanoniczne:** `athletix/js/wallet.js` (524 linie).
Bajtowo identyczna kopia jest wklejona w `athletix-simple.html` (od ~linii 2655).
Monolit `athletixapp-v2 (15).html` **nie zawiera** systemu rozliczeń.

---

## Spis treści
1. [Przegląd i model „dwóch kafelków"](#1-przegląd)
2. [Model danych](#2-model-danych)
3. [Powstawanie długu](#3-powstawanie-długu)
4. [Niwelowanie długu](#4-niwelowanie-długu)
5. [Stawka za wejście](#5-stawka-za-wejście)
6. [Pakiety](#6-pakiety)
7. [Jakie dane gromadzimy](#7-jakie-dane-gromadzimy)
8. [Integracja i UI](#8-integracja-i-ui)
9. [Storage i synchronizacja z chmurą](#9-storage-i-synchronizacja)
10. [Pełny kod modułu `wallet.js`](#10-pełny-kod-modułu)
11. [Ograniczenia i uwagi](#11-ograniczenia-i-uwagi)

---

## 1. Przegląd

„Skarbiec" to micro-system rozliczeń wbudowany w profil każdego zawodnika.
Działa na **punktach (`pkt`)** — to wewnętrzna jednostka rozliczeniowa, nie realna waluta.
Trener z góry ustala **stawkę za wejście** (`entryRate`, domyślnie 80 pkt) i **doładowuje**
zawodnikowi **depozyt** (saldo). Każde wejście na trening **odbija** stawkę z salda.

Interfejs opiera się na modelu **dwóch kafelków**:

```
┌─────────────┐        ┌─────────────┐
│   DEPOZYT   │   ➤    │   SKARBIEC  │
│   balance   │        │   earned    │
│ środki      │        │ Twój zarobek│
│ klienta     │        │ (Σ debetów) │
└─────────────┘        └─────────────┘
```

- **Depozyt** (`wallet.balance`) — środki, które klient wpłacił i które jeszcze ma do wykorzystania.
- **Skarbiec** (`earned`) — suma wszystkich odbitych wejść = realny zarobek trenera
  (liczona „w locie" funkcją `calcEarned`, **nie** przechowywana jako pole).

Skarbiec renderuje się w profilu zawodnika (zakładka **Zawodnicy** → kliknięcie w zawodnika),
a skrócony „badge" salda pokazuje się na liście zawodników.

---

## 2. Model danych

Każdy zawodnik (`a`) ma zagnieżdżony obiekt `a.wallet`:

```js
a.wallet = {
  balance: 0,        // DEPOZYT — saldo punktów klienta. UJEMNE = DŁUG.
  entryRate: 80,     // stawka odbijana za 1 wejście
  powerPoints: 0,    // [poza zakresem — warstwa motywacyjna]
  transactions: [],  // rejestr wszystkich operacji (księga)
  eventLog: []        // czytelny dziennik zdarzeń (audyt)
}
```

Inicjalizacja i „samonaprawa" struktury (gdy starszy zawodnik nie ma jeszcze portfela):

```js
function _getWallet(a){
  if(!a.wallet) a.wallet={balance:0, entryRate:80, powerPoints:0, transactions:[], eventLog:[]};
  if(a.wallet.powerPoints==null) a.wallet.powerPoints=0;
  if(!a.wallet.eventLog) a.wallet.eventLog=[];
  return a.wallet;
}
```

### Kształt pojedynczej transakcji

Transakcje to „księga główna" — **nigdy nie są twardo usuwane**, tylko oznaczane
flagą `deleted:true` (soft-delete). Pełny kształt rekordu (na przykładzie wejścia):

```js
w.transactions.push({
  id: Date.now(),               // unikalny identyfikator (timestamp)
  date: today,                  // klucz dnia, np. "2026-06-25"
  type: 'debit',                // 'credit' | 'debit' | 'cancel'  (+ 'power' poza zakresem)
  amount: rate,                 // wartość bezwzględna w pkt
  note: 'Wejście 09:30 - ...',  // opis
  time: timeStr,                // godzina "HH:MM"
  status: 'confirmed',          // status potwierdzenia
  confirmedBy: 'trainer',       // kto potwierdził
  confirmedAt: now.toISOString(),
  clientNotified: false,        // (pod przyszłą aplikację klienta)
  clientConfirmed: null
  // deleted: true              // dopisywane przy soft-delete
  // pairId: 'pN_...'           // łączy debet z powiązanym wpisem mocy
});
```

| Typ (`type`) | Znak | Wpływ na saldo | Powstaje w |
|---|---|---|---|
| `credit` | `+` | `balance += amount` | doładowanie (`openAddCredits`) |
| `debit`  | `−` | `balance -= amount` | wejście / odwołanie z opłatą |
| `cancel` | `−` | brak (kwota = 0)    | odwołanie bez opłaty |
| `power`  | `+` | (poza zakresem)     | punkty mocy |

### Dziennik zdarzeń (`eventLog`)

Równolegle do księgi transakcji prowadzony jest czytelny, „ludzki" log audytowy.
Każda operacja dopisuje jeden wiersz:

```js
function _logEvent(w, text){
  w.eventLog.push({
    date: getDayKey(new Date()),
    time: String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0'),
    text: text
  });
}
```

---

## 3. Powstawanie długu

> **Kluczowa zasada: nie istnieje osobne pole „dług".**
> **Dług = ujemne `wallet.balance`.** Każda operacja obciążająca po prostu obniża saldo;
> gdy saldo spadnie poniżej zera, zawodnik jest „na minusie" (zalega).
> Aplikacja **nie blokuje** zejścia poniżej zera — jedynie ostrzega i koloruje na czerwono.

Dług może powstać na **dwa sposoby**:

### 3.1. Odbicie wejścia (`deductEntry` → `_doDeductEntry`)

Wejście odejmuje **całą stawkę** (`entryRate`) od salda. Najpierw modal potwierdzenia
liczy saldo „po odbiciu" i — jeśli wyjdzie ujemne — pokazuje ostrzeżenie:

```js
function deductEntry(athleteName){
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var rate=w.entryRate||80;
  var newBal=w.balance-rate;                 // ← podgląd salda po odbiciu
  // ... budowa modala ...
  //  '<div>Saldo po odbiciu: '+newBal+' pkt</div>'
  +(newBal<0?'<div style="...color:var(--red-text)...">⚠️ Saldo spadnie poniżej zera!</div>':'')
  // ...
}
```

Po potwierdzeniu wykonywane jest właściwe odbicie (mutacja salda + zapis transakcji + log):

```js
function _doDeductEntry(athleteName,note){
  _pushUndo('Wejście: '+athleteName);        // snapshot pod UNDO
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var rate=w.entryRate||80;
  w.balance-=rate;                            // ← TU POWSTAJE DŁUG (gdy balance<0)
  var today=getDayKey(new Date());
  var now=new Date(); var timeStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  w.transactions.push({
    id:Date.now(),date:today,type:'debit',amount:rate,
    note:note?'Wejście '+timeStr+' - '+note:'Wejście '+timeStr,
    time:timeStr,
    status:'confirmed',confirmedBy:'trainer',confirmedAt:now.toISOString(),
    clientNotified:false,clientConfirmed:null
  });
  _logEvent(w,'🚪 Wejście: -'+rate+' pkt ('+timeStr+')'+(note?' ['+note+']':''));
  saveCRM();
  // ... odświeżenie UI + animacje + toast ...
}
```

### 3.2. Odwołanie treningu (`openCancellation` → `_saveCancellation`)

Odwołanie daje trzy opcje naliczenia (wzorowane na regulaminie „no-show"):

| Opcja | Kwota | Typ transakcji |
|---|---|---|
| **Pełne naliczenie** | `rate` (cała stawka) | `debit` → obniża saldo |
| **Częściowe** | własna kwota (domyślnie `½ rate`) | `debit` → obniża saldo |
| **Bez naliczenia** | `0` | `cancel` → saldo bez zmian |

Wybór opcji ustala kwotę i pulę „złośliwych" wiadomości dla zawodnika:

```js
function _selectCancelOption(type, amount){
  window._cancelType=type;
  // ... podświetlenie wybranej opcji ...
  el('cancel-custom-wrap').style.display=type==='partial'?'block':'none';
  if(type==='partial'){ el('cancel-custom-amt').value=amount; el('cancel-custom-amt').focus(); }
  window._cancelMsgPool=type==='full'?CANCEL_MSGS_FULL:type==='partial'?CANCEL_MSGS_PARTIAL:CANCEL_MSGS_FREE;
  el('cancel-msg').value=_pickMsg(window._cancelMsgPool);
  // ...
}
```

Zapis odwołania — tu również może powstać dług (gdy `amount` > aktualne saldo):

```js
function _saveCancellation(){
  var type=window._cancelType;
  var athleteName=window._cancelAthlete;
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var rate=w.entryRate||80;
  var amount=type==='full'?rate:type==='partial'?(parseFloat(el('cancel-custom-amt').value)||0):0;
  var msg=(el('cancel-msg').value||'').trim();
  _pushUndo('Odwołanie: '+athleteName);
  if(amount>0) w.balance-=amount;             // ← obniżenie salda (może → dług)
  var today=getDayKey(new Date());
  var now=new Date(); var timeStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var label=type==='full'?'Odwołanie — pełne naliczenie':type==='partial'?'Odwołanie — częściowe':'Odwołanie — bez naliczenia';
  w.transactions.push({id:Date.now(),date:today,type:amount>0?'debit':'cancel',amount:amount,note:'📵 '+label+(msg?' · '+msg:'')});
  _logEvent(w,'📵 '+label+': '+(amount>0?'-'+amount+' pkt':'0 pkt')+' · '+msg);
  saveCRM();
  // ... odświeżenie UI ...
}
```

### 3.3. Wizualne sygnalizowanie długu

Saldo nie ma osobnego „statusu długu" — kolor liczony jest progowo na podstawie wartości.
Te same progi w dwóch miejscach:

```js
// badge na liście zawodników (_walletBadge):
var color = w.balance > w.entryRate*2 ? 'var(--green-text)'   // > 2× stawki = zielony
          : w.balance > 0            ? '#d97706'             // dodatnie, ale niskie = bursztyn
          :                            'var(--red-text)';     // <= 0 = CZERWONY (dług)

// kafelek Depozyt w profilu (_buildWalletSection):
var balColor = w.balance > w.entryRate*2 ? '#16a34a'
             : w.balance > 0            ? '#d97706'
             :                            '#E24B4A';           // <= 0 = CZERWONY (dług)
```

---

## 4. Niwelowanie długu

Dług (ujemne saldo) znika, gdy saldo wróci do wartości ≥ 0. Są **trzy mechanizmy**:

### 4.1. Doładowanie depozytu (`openAddCredits`) — sposób podstawowy

Doładowanie dopisuje transakcję `credit` i **podnosi saldo** o `amount`.
Jeśli saldo było ujemne (dług), doładowanie najpierw je „zasypuje", a nadwyżka zostaje jako depozyt.
Przy okazji ustawiana jest nowa `entryRate` (z wybranego pakietu lub ręcznie):

```js
document.getElementById('credit-save').onclick=function(){
  var amount=parseFloat(el('credit-amount').value)||0;
  var rate=parseFloat(el('credit-rate').value)||80;
  if(amount<=0) return;
  var note=(el('credit-note').value||'').trim()||'Doładowanie +'+amount+' pkt';
  _pushUndo('Doładowanie: '+athleteName+' +'+amount);
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  w.balance+=amount;                          // ← TU ZNIKA DŁUG (saldo rośnie)
  w.entryRate=rate;                           // aktualizacja stawki z pakietu
  w.transactions.push({id:Date.now(),date:getDayKey(new Date()),type:'credit',amount:amount,note:note});
  _logEvent(w,'💰 Doładowanie: +'+amount+' pkt'+(note?' — '+note:''));
  saveCRM(); ov.style.display='none';
  // ... odświeżenie UI ...
};
```

### 4.2. Usunięcie błędnej transakcji (`deleteTransaction`) — korekta

Jeśli dług powstał przez pomyłkę (np. podwójne odbicie), trener może usunąć transakcję.
To **odwraca jej wpływ na saldo** i wymaga podania **powodu** (do audytu).
Usunięcie jest „miękkie" (`deleted:true`) — wpis zostaje w księdze, ale przestaje liczyć się do salda:

```js
// Powody usunięcia (lista wyboru w modalu):
//   Błędne odbicie | Podwójny wpis | Korekta salda | Zmiana pakietu | Zwrot | Inne (wpisz)

document.getElementById('del-tx-confirm').onclick=function(){
  var selVal=el('del-tx-reason-sel').value;
  var reason=selVal==='inne'?(el('del-tx-other').value||'').trim():selVal;
  _pushUndo('Usunięto transakcję: '+athleteName);
  loadCRM();
  var a2=athletes.find(function(x){ return x.name===athleteName; }); if(!a2) return;
  var w2=_getWallet(a2);
  // Zbierz ID do usunięcia (transakcja + ewentualna powiązana przez pairId)
  var idsToDelete=[txId];
  if(tx.pairId){ w2.transactions.forEach(function(t){ if(t.pairId===tx.pairId&&!t.deleted) idsToDelete.push(t.id); }); }
  // ODWRÓĆ efekt na saldzie i oznacz jako usunięte
  idsToDelete.forEach(function(did){
    var t=w2.transactions.find(function(x){ return x.id===did&&!x.deleted; });
    if(!t) return;
    if(t.type==='credit') w2.balance-=t.amount;     // cofnij doładowanie
    else if(t.type==='debit') w2.balance+=t.amount;  // cofnij obciążenie → ZMNIEJSZA DŁUG
    else if(t.type==='power') w2.powerPoints-=t.amount;
    t.deleted=true;
  });
  _logEvent(w2,'⊘ Usunięto: '+(tx.note||tx.type)+' ('+tx.amount+' pkt) — '+reason);
  saveCRM(); ov.style.display='none';
  // ...
};
```

> **Uwaga:** usunięcie wpisu typu `debit` (`balance += amount`) cofa obciążenie — to właśnie
> droga „korekty długu" powstałego przez pomyłkę. Odwrotnie: usunięcie `credit` obniża saldo.

### 4.3. Cofnij (`_pushUndo` / `undoLast`) — globalne UNDO

Każda operacja Skarbca (doładowanie, wejście, odwołanie, usunięcie, zmiana stawki)
najpierw woła `_pushUndo(label)`, który robi snapshot **wszystkich** kluczy danych do localStorage.
Dzięki temu dowolną operację można cofnąć paskiem UNDO (i ponowić — REDO):

```js
function _pushUndo(label){
  var snapshot=_ALL_DATA_KEYS.map(function(k){ return {key:k, val:localStorage.getItem(k)}; });
  _undoStack.push({label:label, data:snapshot, time:Date.now()});
  if(_undoStack.length>_UNDO_MAX) _undoStack.shift();
  _redoStack=[];
  _renderUndoBar();
}

function undoLast(){
  if(!_undoStack.length) return;
  var action=_undoStack.pop();
  var redoPairs=_snapshotKeys(action.data.map(function(p){ return p.key; }));
  _redoStack.push({label:action.label, data:redoPairs, time:Date.now()});
  _restoreSnapshot(action.data);
  loadCRM(); loadTests(); loadNotes(); loadGroups(); loadCustomExercises();
}
```

> `_pushUndo` / `undoLast` są zdefiniowane w `athletix/js/athletes.js` (od linii ~542),
> nie w `wallet.js` — ale to one zabezpieczają każdą operację rozliczeń.

---

## 5. Stawka za wejście

`entryRate` (domyślnie 80 pkt) to kwota odbijana za jedno wejście oraz baza dla odwołań
(pełne = `rate`, częściowe = `½ rate`). Można ją zmienić na dwa sposoby:

- **automatycznie** — przy doładowaniu pakietu (`w.entryRate=rate`, patrz §4.1),
- **ręcznie** — modalem „💰 Stawka" (`openRateModal`):

```js
function updateEntryRate(athleteName, val){
  _pushUndo('Stawka: '+athleteName);
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  w.entryRate=Math.max(0,parseFloat(val)||80);   // nigdy ujemna
  saveCRM();
}
```

Zmiana stawki **nie przelicza** wstecz istniejących transakcji ani salda — działa tylko na przyszłe wejścia.

---

## 6. Pakiety

Pakiety to gotowe presety doładowań (kwota + stawka), przyspieszające pracę trenera.
Przechowywane pod kluczem `axs_packages`; gdy brak — używane są domyślne:

```js
var PACKAGES_KEY='axs_packages';
var DEFAULT_PACKAGES=[
  {name:'Starter',  amount:100,  rate:100, desc:'1 wejście'},
  {name:'Pakiet 10',amount:800,  rate:80,  desc:'10 wejść'},
  {name:'Pakiet 20',amount:1400, rate:70,  desc:'20 wejść'},
  {name:'Premium',  amount:2000, rate:65,  desc:'~30 wejść'}
];
function loadPackages(){ try{ var p=JSON.parse(localStorage.getItem(PACKAGES_KEY)); return (p&&p.length)?p:DEFAULT_PACKAGES; }catch(e){ return DEFAULT_PACKAGES; } }
function savePackages(p){ try{ localStorage.setItem(PACKAGES_KEY,JSON.stringify(p)); }catch(e){} }
```

Im większy pakiet, tym niższa stawka za wejście (mechanizm rabatu ilościowego).
Pakiety są edytowalne (`openEditPackages`) — opis „X wejść" liczony jest automatycznie z `Math.round(amount/rate)`:

```js
document.getElementById('pkg-save').onclick=function(){
  var newPkgs=[];
  for(var i=0;i<pkgs.length;i++){
    var n=(el('pkg-name-'+i).value||'').trim(); var am=parseFloat(el('pkg-amt-'+i).value)||0; var rt=parseFloat(el('pkg-rate-'+i).value)||0;
    if(n&&am>0) newPkgs.push({name:n,amount:am,rate:rt,desc:Math.round(am/rt)+' wejść'});
  }
  if(newPkgs.length) savePackages(newPkgs);
  ov.style.display='none';
};
```

---

## 7. Jakie dane gromadzimy

### Dane przechowywane (per zawodnik, w `a.wallet`)

| Pole | Typ | Opis |
|---|---|---|
| `balance` | number | Depozyt klienta w pkt. **Ujemny = dług.** |
| `entryRate` | number | Stawka za 1 wejście (domyślnie 80). |
| `powerPoints` | number | *(poza zakresem — warstwa motywacyjna)* |
| `transactions[]` | array | Księga operacji (nigdy twardo nie kasowana). |
| `eventLog[]` | array | Czytelny dziennik audytowy zdarzeń. |

### Dane per transakcja (`transactions[]`)

`id`, `date`, `type` (`credit`/`debit`/`cancel`), `amount`, `note`, `time`,
`status` (`confirmed`), `confirmedBy`, `confirmedAt`, `clientNotified`, `clientConfirmed`,
`deleted` (flaga soft-delete), `pairId` (powiązanie z wpisem mocy).

### Dane per zdarzenie (`eventLog[]`)

`date`, `time`, `text` — np. `"💰 Doładowanie: +800 pkt — BLIK"`, `"🚪 Wejście: -80 pkt (09:30)"`,
`"📵 Odwołanie — częściowe: -40 pkt · ..."`, `"⊘ Usunięto: ... — Podwójny wpis"`.

### Dane pakietów (`axs_packages`)

`name`, `amount`, `rate`, `desc`.

### Wartości pochodne (liczone „w locie", NIE przechowywane)

```js
// Liczba pozostałych wejść z depozytu:
var entries = w.entryRate>0 ? Math.floor(w.balance/w.entryRate) : 0;

// SKARBIEC = łączny zarobek trenera = suma wszystkich (nieusuniętych) debetów:
function calcEarned(w){
  if(!w||!w.transactions) return 0; var t=0;
  w.transactions.forEach(function(tx){ if(tx.type==='debit'&&!tx.deleted) t+=Math.abs(tx.amount)||0; });
  return t;
}
```

---

## 8. Integracja i UI

| Element | Funkcja | Wywoływane z |
|---|---|---|
| Sekcja Skarbca w profilu zawodnika | `_buildWalletSection(a)` | `athletix/js/athletes.js:336` (`renderAthleteProfile`) |
| Skrócony badge salda na liście | `_walletBadge(a)` | `athletix/js/status.js:231` |
| Modal doładowania | `openAddCredits(name)` | przycisk **+ Doładuj** |
| Modal/akcja wejścia | `deductEntry(name)` | przycisk **− Wejście** |
| Modal odwołania | `openCancellation(name)` | przycisk **🚫 Odwołanie** |
| Modal stawki | `openRateModal(name)` | przycisk **💰 Stawka** |
| Usuwanie transakcji | `deleteTransaction(id,name)` | przycisk **✕** przy wpisie |

Sekcja Skarbca ma **dwie zakładki historii**:
- **Historia wejść** — aktywne (nieusunięte) transakcje, ostatnie 15.
- **Historia zdarzeń** — pełny `eventLog`, ostatnie 20 (audyt).

Po każdym odbiciu wejścia uruchamiana jest też animacja kafelków
(Depozyt mignie na czerwono, Skarbiec „pulsuje" na zielono) i toast „✅ Wejście odebrane".

---

## 9. Storage i synchronizacja

### localStorage
- `axs_athletes` — lista zawodników; obiekt `wallet` jest **zagnieżdżony** w każdym zawodniku.
- `axs_packages` — presety pakietów.

Zapis przez `saveCRM()` (zawodnicy + portfele) oraz `savePackages()`.

### Chmura (Supabase) — `athletix/js/sync.js`

Portfel jedzie do chmury jako **kolumna JSONB** wewnątrz rekordu zawodnika
(push co 30 s + przy kluczowych akcjach):

```js
// sync.js — mapowanie zawodnika do tabeli `athletes`:
return {
  trainer_id:uid, name:a.name, /* ... */,
  wallet: a.wallet||null,         // ← cały portfel jako JSONB
  /* ... */
};
```

Schemat tabeli (`athletix/supabase-schema.sql`) — domyślny pusty portfel i osobna tabela pakietów:

```sql
CREATE TABLE athletes (
  -- ...
  wallet JSONB DEFAULT '{"balance":0,"entryRate":80,"powerPoints":0,"transactions":[],"eventLog":[]}',
  -- ...
);

CREATE TABLE packages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  rate NUMERIC NOT NULL,
  description TEXT
);
```

Bezpieczeństwo: **Row Level Security** — każdy trener widzi tylko swoje dane
(`trainer_id = auth.uid()`), więc portfele zawodników są izolowane per konto trenera.

---

## 10. Pełny kod modułu

Poniżej **kompletny, dosłowny listing** `athletix/js/wallet.js` (kanoniczne źródło modułu rozliczeń).

```js
// ═══════════════════════════════════════
// ═══════════════════════════════════════
//  SKARBIEC (WALLET / CREDITS) + PUNKTY MOCY
//  a.wallet = {balance, entryRate, powerPoints, transactions[]}
//  Transaction: {id, date, type:'credit'|'debit'|'power', amount, note}
// ═══════════════════════════════════════
var PACKAGES_KEY='axs_packages';
var DEFAULT_PACKAGES=[
  {name:'Starter',amount:100,rate:100,desc:'1 wejście'},
  {name:'Pakiet 10',amount:800,rate:80,desc:'10 wejść'},
  {name:'Pakiet 20',amount:1400,rate:70,desc:'20 wejść'},
  {name:'Premium',amount:2000,rate:65,desc:'~30 wejść'}
];
function loadPackages(){ try{ var p=JSON.parse(localStorage.getItem(PACKAGES_KEY)); return (p&&p.length)?p:DEFAULT_PACKAGES; }catch(e){ return DEFAULT_PACKAGES; } }
function savePackages(p){ try{ localStorage.setItem(PACKAGES_KEY,JSON.stringify(p)); }catch(e){} }

function _getWallet(a){
  if(!a.wallet) a.wallet={balance:0, entryRate:80, powerPoints:0, transactions:[], eventLog:[]};
  if(a.wallet.powerPoints==null) a.wallet.powerPoints=0;
  if(!a.wallet.eventLog) a.wallet.eventLog=[];
  return a.wallet;
}
function _logEvent(w, text){
  w.eventLog.push({date:getDayKey(new Date()), time:String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0'), text:text});
}
// Link debit+power by pairId so they delete together
function _nextPairId(w){ return 'p'+(w.transactions.length+1)+'_'+Date.now(); }

function calcEarned(w){
  if(!w||!w.transactions) return 0; var t=0;
  w.transactions.forEach(function(tx){ if(tx.type==='debit'&&!tx.deleted) t+=Math.abs(tx.amount)||0; });
  return t;
}
function _walletBadge(a){
  var w=_getWallet(a);
  var activeTx=w.transactions.filter(function(t){ return !t.deleted; });
  if(!activeTx.length&&w.balance===0) return '';
  var color=w.balance>w.entryRate*2?'var(--green-text)':w.balance>0?'#d97706':'var(--red-text)';
  var entries=w.entryRate>0?Math.floor(w.balance/w.entryRate):0;
  return '<div style="display:flex;align-items:center;gap:8px;margin-top:4px;">'
    +'<span style="font-size:11px;font-weight:800;color:'+color+';">💰 '+w.balance+' pkt</span>'
    +'<span style="font-size:10px;color:var(--dim);">('+entries+' wejść)</span>'
    +'</div>';
}

function _buildWalletSection(a){
  var w=_getWallet(a);
  var entries=w.entryRate>0?Math.floor(w.balance/w.entryRate):0;
  var balColor=w.balance>w.entryRate*2?'#16a34a':w.balance>0?'#d97706':'#E24B4A';
  var earned=calcEarned(w);
  var safeName=a.name.replace(/'/g,"\\'");
  // ATP z gamifikacji
  var atpVal=0; if(typeof getGamProfile==='function'){ var gp=getGamProfile(a.name); atpVal=gp.totalPoints; }

  var html='<div style="background:var(--s1);border:1px solid var(--border);border-radius:var(--r);padding:14px;margin-bottom:14px;">'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin-bottom:10px;">💰 Skarbiec</div>'
    // DEPOZYT ➤ SKARBIEC
    +'<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">'
    +'<div id="wallet-deposit-tile" style="flex:1;text-align:center;background:var(--s1);border:2px solid var(--green);border-radius:var(--r);padding:14px;transition:border-color .5s;">'
    +'<div style="font-size:28px;font-weight:900;color:'+balColor+';">'+w.balance+'</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);">Depozyt</div>'
    +'<div style="font-size:9px;color:var(--muted);">Środki klienta</div></div>'
    +'<div style="font-size:20px;color:var(--muted);flex-shrink:0;width:30px;text-align:center;">➤</div>'
    +'<div id="wallet-earned-tile" style="flex:1;text-align:center;background:var(--s1);border:2px solid var(--accent);border-radius:var(--r);padding:14px;transition:border-color .5s,transform .3s;">'
    +'<div style="font-size:28px;font-weight:900;color:var(--accent);">'+earned+'</div>'
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);">Skarbiec</div>'
    +'<div style="font-size:9px;color:var(--muted);">Twój zarobek</div></div>'
    +'</div>'
    // Info kafelki
    +'<div style="display:flex;gap:6px;margin-bottom:10px;">'
    +'<div style="flex:1;text-align:center;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-sm);padding:8px 6px;"><div style="font-size:16px;font-weight:800;color:var(--text);">'+entries+'</div><div style="font-size:8px;font-weight:700;text-transform:uppercase;color:var(--dim);">Wejść</div></div>'
    +'<div style="flex:1;text-align:center;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-sm);padding:8px 6px;"><div style="font-size:16px;font-weight:800;color:var(--text);">'+w.entryRate+'</div><div style="font-size:8px;font-weight:700;text-transform:uppercase;color:var(--dim);">Stawka</div></div>'
    +'<div style="flex:1;text-align:center;background:var(--s1);border:1px solid var(--border);border-radius:var(--r-sm);padding:8px 6px;"><div style="font-size:16px;font-weight:800;color:var(--accent);">'+atpVal+' ⚡</div><div style="font-size:8px;font-weight:700;text-transform:uppercase;color:var(--dim);">ATP</div></div>'
    +'</div>'
    // Przyciski
    +'<div style="display:flex;gap:6px;margin-bottom:6px;">'
    +'<button onclick="openAddCredits(\''+safeName+'\')" style="flex:1;padding:10px 6px;background:rgba(82,201,123,.08);color:#52C97B;border:1px solid rgba(82,201,123,.2);border-radius:var(--r-xs);font-family:Montserrat,sans-serif;font-size:11px;font-weight:800;cursor:pointer;">+ Doładuj</button>'
    +'<button onclick="deductEntry(\''+safeName+'\')" style="flex:1;padding:10px 6px;background:rgba(212,168,67,.08);color:#D4A843;border:1px solid rgba(212,168,67,.2);border-radius:var(--r-xs);font-family:Montserrat,sans-serif;font-size:11px;font-weight:800;cursor:pointer;">− Wejście</button>'
    +'</div>'
    +'<div style="display:flex;gap:6px;margin-bottom:10px;">'
    +'<button onclick="openCancellation(\''+safeName+'\')" style="flex:1;padding:10px 6px;background:rgba(226,75,74,.08);color:#E24B4A;border:1px solid rgba(226,75,74,.2);border-radius:var(--r-xs);font-family:Montserrat,sans-serif;font-size:11px;font-weight:800;cursor:pointer;">🚫 Odwołanie</button>'
    +'<button onclick="openRateModal(\''+safeName+'\')" style="flex:1;padding:10px 6px;background:transparent;border:1.5px dashed var(--border2);border-radius:var(--r-xs);font-family:Montserrat,sans-serif;font-size:11px;font-weight:800;color:var(--muted);cursor:pointer;">💰 Stawka</button>'
    +'</div>';

  // History tabs: Wejścia (active only) | Zdarzenia (full event log)
  var activeTx=w.transactions.filter(function(t){ return !t.deleted; }).reverse().slice(0,15);
  var events=w.eventLog.slice().reverse().slice(0,20);
  var tabId='wh-'+a.id;

  html+='<div style="display:flex;gap:4px;margin-bottom:8px;">'
    +'<button id="'+tabId+'-tab-tx" onclick="document.getElementById(\''+tabId+'-tx\').style.display=\'block\';document.getElementById(\''+tabId+'-ev\').style.display=\'none\';this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\';document.getElementById(\''+tabId+'-tab-ev\').style.borderColor=\'var(--border2)\';document.getElementById(\''+tabId+'-tab-ev\').style.color=\'var(--muted)\';" style="flex:1;padding:6px;border-radius:var(--r-xs);border:1px solid var(--accent);background:transparent;cursor:pointer;font-family:Montserrat,sans-serif;font-size:9px;font-weight:700;color:var(--accent);letter-spacing:.06em;">Historia wejść</button>'
    +'<button id="'+tabId+'-tab-ev" onclick="document.getElementById(\''+tabId+'-ev\').style.display=\'block\';document.getElementById(\''+tabId+'-tx\').style.display=\'none\';this.style.borderColor=\'var(--accent)\';this.style.color=\'var(--accent)\';document.getElementById(\''+tabId+'-tab-tx\').style.borderColor=\'var(--border2)\';document.getElementById(\''+tabId+'-tab-tx\').style.color=\'var(--muted)\';" style="flex:1;padding:6px;border-radius:var(--r-xs);border:1px solid var(--border2);background:transparent;cursor:pointer;font-family:Montserrat,sans-serif;font-size:9px;font-weight:700;color:var(--muted);letter-spacing:.06em;">Historia zdarzeń</button>'
    +'</div>';

  // Active transactions tab
  html+='<div id="'+tabId+'-tx" style="max-height:160px;overflow-y:auto;">';
  if(!activeTx.length) html+='<div style="color:var(--dim);font-size:11px;text-align:center;padding:10px;">Brak wpisów</div>';
  activeTx.forEach(function(tx){
    var c=tx.type==='credit'?'var(--green-text)':tx.type==='power'?'#a855f7':tx.type==='cancel'?'#71717a':'#c2410c';
    var icon=tx.type==='credit'?'💰':tx.type==='power'?'⚡':tx.type==='cancel'?'📵':'🚪';
    var sign=(tx.type==='debit'||tx.type==='cancel')?'-':'+';
    html+='<div style="display:flex;align-items:center;padding:4px 0;border-top:1px solid var(--border);font-size:11px;gap:5px;">'
      +'<span style="flex-shrink:0;">'+icon+'</span>'
      +'<span style="font-weight:800;color:'+c+';min-width:40px;">'+sign+tx.amount+'</span>'
      +'<span style="flex:1;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+(tx.note||'')+'</span>'
      +'<span style="color:var(--dim);flex-shrink:0;font-size:10px;">'+tx.date+'</span>'
      +'<button onclick="deleteTransaction('+tx.id+',\''+safeName+'\')" style="background:transparent;border:none;cursor:pointer;color:var(--dim);font-size:10px;padding:4px 8px 4px 4px;flex-shrink:0;margin-right:-4px;" title="Usuń">✕</button>'
      +'</div>';
  });
  html+='</div>';

  // Event log tab (hidden by default)
  html+='<div id="'+tabId+'-ev" style="display:none;max-height:160px;overflow-y:auto;">';
  if(!events.length) html+='<div style="color:var(--dim);font-size:11px;text-align:center;padding:10px;">Brak zdarzeń</div>';
  events.forEach(function(ev){
    html+='<div style="display:flex;align-items:center;padding:3px 0;border-top:1px solid var(--border);font-size:10px;gap:6px;">'
      +'<span style="color:var(--dim);flex-shrink:0;">'+ev.date+' '+ev.time+'</span>'
      +'<span style="flex:1;color:var(--muted);">'+ev.text+'</span>'
      +'</div>';
  });
  html+='</div>';

  html+='</div>';
  return html;
}

function _selectPackage(pkg){
  el('credit-amount').value=pkg.amount;
  el('credit-rate').value=pkg.rate;
  el('credit-note').value=pkg.name+' ('+pkg.desc+')';
  document.querySelectorAll('.pkg-btn').forEach(function(b){ b.style.borderColor='var(--border2)'; b.style.background='var(--s2)'; });
  event.currentTarget.style.borderColor='var(--green)'; event.currentTarget.style.background='rgba(22,163,74,.1)';
}

function openAddCredits(athleteName){
  var pkgs=loadPackages();
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:400px;width:100%;padding:22px 18px 24px;max-height:90vh;overflow-y:auto;">'
    +'<div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:4px;">💰 Doładuj pakiet</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:14px;">'+athleteName+'</div>'
    // Packages
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">Pakiety</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px;">'
    +pkgs.map(function(p){ return '<button class="pkg-btn" onclick="_selectPackage('+JSON.stringify(p).replace(/"/g,'&quot;')+')" style="padding:10px 8px;background:var(--s2);border:2px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;text-align:left;">'
      +'<div style="font-size:13px;font-weight:800;color:var(--text);">'+p.name+'</div>'
      +'<div style="font-size:16px;font-weight:900;color:var(--green-text);margin:2px 0;">'+p.amount+' pkt</div>'
      +'<div style="font-size:10px;color:var(--muted);">Stawka: '+p.rate+' pkt/wej. · '+p.desc+'</div>'
      +'</button>'; }).join('')
    +'</div>'
    // Custom amount
    +'<div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">Lub wpisz ręcznie</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'
    +'<div><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Punkty</div>'
    +'<input id="credit-amount" type="number" min="1" value="800" style="width:100%;padding:9px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;text-align:center;box-sizing:border-box;"/></div>'
    +'<div><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Stawka za wejście</div>'
    +'<input id="credit-rate" type="number" min="1" step="5" value="80" style="width:100%;padding:9px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:16px;font-weight:800;text-align:center;box-sizing:border-box;"/></div>'
    +'</div>'
    +'<div style="margin-bottom:12px;"><div style="font-size:10px;color:var(--dim);margin-bottom:3px;">Notatka</div>'
    +'<input id="credit-note" type="text" placeholder="np. Wpłata gotówka, BLIK, przelew..." style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;box-sizing:border-box;"/></div>'
    // Edit packages link
    +'<div style="text-align:center;margin-bottom:12px;"><button onclick="openEditPackages()" style="background:transparent;border:none;cursor:pointer;font-family:Montserrat,sans-serif;font-size:10px;font-weight:700;color:var(--muted);text-decoration:underline;">✏️ Edytuj pakiety</button></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="credit-save" style="flex:1;padding:12px;background:rgba(82,201,123,.08);color:#52C97B;border:1px solid rgba(82,201,123,.2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">💰 Doładuj</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  document.getElementById('credit-save').onclick=function(){
    var amount=parseFloat(el('credit-amount').value)||0;
    var rate=parseFloat(el('credit-rate').value)||80;
    if(amount<=0) return;
    var note=(el('credit-note').value||'').trim()||'Doładowanie +'+amount+' pkt';
    _pushUndo('Doładowanie: '+athleteName+' +'+amount);
    loadCRM();
    var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
    var w=_getWallet(a);
    w.balance+=amount;
    w.entryRate=rate;
    w.transactions.push({id:Date.now(),date:getDayKey(new Date()),type:'credit',amount:amount,note:note});
    _logEvent(w,'💰 Doładowanie: +'+amount+' pkt'+(note?' — '+note:''));
    saveCRM(); ov.style.display='none';
    if(_currentProfileId){ var allSess=[]; try{ allSess=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){} renderAthleteProfile(a,allSess); }
    renderAthleteList();
  };
}

function openEditPackages(){
  var pkgs=loadPackages();
  var ov=_ensureOverlay();
  var rows=pkgs.map(function(p,i){ return '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px;margin-bottom:6px;align-items:center;">'
    +'<input id="pkg-name-'+i+'" value="'+p.name+'" style="padding:6px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;box-sizing:border-box;"/>'
    +'<input id="pkg-amt-'+i+'" type="number" value="'+p.amount+'" style="padding:6px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;text-align:center;box-sizing:border-box;"/>'
    +'<input id="pkg-rate-'+i+'" type="number" value="'+p.rate+'" style="padding:6px 8px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;text-align:center;box-sizing:border-box;"/>'
    +'</div>'; }).join('');
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:400px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:15px;font-weight:900;color:var(--text);margin-bottom:12px;">✏️ Edytuj pakiety</div>'
    +'<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:6px;margin-bottom:6px;"><span style="font-size:9px;font-weight:700;color:var(--dim);">NAZWA</span><span style="font-size:9px;font-weight:700;color:var(--dim);text-align:center;">KWOTA</span><span style="font-size:9px;font-weight:700;color:var(--dim);text-align:center;">STAWKA</span></div>'
    +rows
    +'<div style="display:flex;gap:8px;margin-top:12px;">'
    +'<button id="pkg-save" style="flex:1;padding:11px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zapisz</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:11px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  document.getElementById('pkg-save').onclick=function(){
    var newPkgs=[];
    for(var i=0;i<pkgs.length;i++){
      var n=(el('pkg-name-'+i).value||'').trim(); var am=parseFloat(el('pkg-amt-'+i).value)||0; var rt=parseFloat(el('pkg-rate-'+i).value)||0;
      if(n&&am>0) newPkgs.push({name:n,amount:am,rate:rt,desc:Math.round(am/rt)+' wejść'});
    }
    if(newPkgs.length) savePackages(newPkgs);
    ov.style.display='none';
  };
}

function deductEntry(athleteName){
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var rate=w.entryRate||80;
  var newBal=w.balance-rate;
  var now=new Date();
  var dateStr=String(now.getDate()).padStart(2,'0')+'.'+String(now.getMonth()+1).padStart(2,'0')+'.'+now.getFullYear();
  var timeStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var old=document.getElementById('deduct-confirm-modal'); if(old) old.remove();
  var ov=document.createElement('div'); ov.id='deduct-confirm-modal';
  ov.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;';
  ov.innerHTML='<div style="max-width:360px;width:100%;background:var(--s1);border-radius:16px;padding:20px;">'
    +'<div style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:12px;">Odbić wejście?</div>'
    +'<div style="font-size:13px;color:var(--muted);line-height:1.8;">'
    +'<div><span style="font-weight:700;color:var(--text);">Zawodnik:</span> '+athleteName+'</div>'
    +'<div><span style="font-weight:700;color:var(--text);">Stawka:</span> '+rate+' pkt</div>'
    +'<div><span style="font-weight:700;color:var(--text);">Saldo po odbiciu:</span> '+newBal+' pkt</div>'
    +(newBal<0?'<div style="font-size:12px;font-weight:600;color:var(--red-text);margin-top:4px;">⚠️ Saldo spadnie poniżej zera!</div>':'')
    +'</div>'
    +'<div style="font-size:11px;color:var(--muted);margin:8px 0;">📅 '+dateStr+' ⏰ '+timeStr+'</div>'
    +'<input id="deduct-note" type="text" placeholder="Notatka (opcjonalnie)" style="width:100%;padding:9px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:var(--r-xs);color:var(--text);font-family:Montserrat,sans-serif;font-size:13px;box-sizing:border-box;margin:8px 0;">'
    +'<button id="deduct-yes" style="width:100%;padding:14px;background:rgba(82,201,123,.08);color:#52C97B;border:1px solid rgba(82,201,123,.2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:14px;font-weight:800;cursor:pointer;margin-top:12px;">Tak, odbij wejście</button>'
    +'<button id="deduct-no" style="width:100%;padding:12px;background:transparent;border:1px solid var(--border2);color:var(--muted);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:600;cursor:pointer;margin-top:6px;">Anuluj</button>'
    +'</div>';
  document.body.appendChild(ov);
  document.getElementById('deduct-no').onclick=function(){ ov.remove(); };
  document.getElementById('deduct-yes').onclick=function(){
    var note=(document.getElementById('deduct-note')||{}).value||'';
    ov.remove();
    _doDeductEntry(athleteName,note);
  };
}
function _doDeductEntry(athleteName,note){
  _pushUndo('Wejście: '+athleteName);
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var rate=w.entryRate||80;
  w.balance-=rate;
  var today=getDayKey(new Date());
  var now=new Date(); var timeStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  w.transactions.push({
    id:Date.now(),date:today,type:'debit',amount:rate,
    note:note?'Wejście '+timeStr+' - '+note:'Wejście '+timeStr,
    time:timeStr,
    status:'confirmed',confirmedBy:'trainer',confirmedAt:now.toISOString(),
    clientNotified:false,clientConfirmed:null
  });
  _logEvent(w,'🚪 Wejście: -'+rate+' pkt ('+timeStr+')'+(note?' ['+note+']':''));
  saveCRM();
  if(_currentProfileId){ var allSess=[]; try{ allSess=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){} renderAthleteProfile(a,allSess); }
  renderAthleteList();
  // Animacja kafelkow
  var dep=document.getElementById('wallet-deposit-tile');
  var ear=document.getElementById('wallet-earned-tile');
  if(dep){ dep.style.borderColor='var(--red)'; setTimeout(function(){ dep.style.borderColor='var(--green)'; },500); }
  if(ear){ ear.style.borderColor='var(--green)'; ear.style.transform='scale(1.03)'; setTimeout(function(){ ear.style.borderColor='var(--accent)'; ear.style.transform='scale(1)'; },500); }
  // ATP
  if(typeof addPoints==='function') addPoints(athleteName,'entry',15,'Wejście na trening');
  if(typeof updateWeeklyStreak==='function') updateWeeklyStreak(athleteName);
  // Toast
  var toast=document.createElement('div');
  toast.style.cssText='position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:rgba(22,163,74,.15);color:var(--green-text);font-family:Montserrat,sans-serif;font-size:12px;font-weight:600;padding:8px 16px;border-radius:20px;z-index:30;transition:opacity .3s;';
  toast.textContent='✅ Wejście odebrane - '+athleteName;
  document.body.appendChild(toast);
  setTimeout(function(){ toast.style.opacity='0'; setTimeout(function(){ toast.remove(); },300); },2000);
}

// ⚡ openAddPower() — dodawanie PUNKTÓW MOCY (poza zakresem rozliczeń finansowych) — pominięte

// ── CANCELLATION MESSAGES ──
var CANCEL_MSGS_FULL=[
  'Odwołanie to też trening... dla portfela 💸',
  'Kanapka na siłowni byłaby tańsza 🥪',
  'Twoje mięśnie płaczą. Skarbiec też.',
  'Plan treningowy nie odwołuje się sam 📋',
  'Następnym razem lepiej przyjdź — nawet po to, żeby się rozciągnąć 🧘',
  'Regulamin jest surowy, ale sprawiedliwy ⚖️',
  'Odwołanie kosztuje tyle co trening. Wniosek? Lepiej trenować 💪',
  'Twój trener jest smutny. Twój portfel też 😢'
];
var CANCEL_MSGS_PARTIAL=[
  'Połowa stawki — bo odwołałeś z wyprzedzeniem. Szanuję ✊',
  'Częściowe naliczenie — fair deal. Następnym razem daj znać wcześniej 📱',
  'Tym razem pół ceny. Następnym razem przychodź! 🏃',
  'OK, obniżona stawka — ale trener pamięta 🧠',
  'Doceniam, że dałeś znać. Następnym razem dawaj na matę! 💪'
];
var CANCEL_MSGS_FREE=[
  'Tym razem Ci się upiekło! Ale prawo dżungli obowiązuje 🦁',
  'Pierwszy raz? OK. Drugi raz? Portfel zapłacze 💸',
  'Darowane — ale trener MA PAMIĘĆ 🧠',
  'Gratis! Ale nie przyzwyczajaj się 😉',
  'Tym razem free. Następnym razem — lepiej przyjdź niż płacić za powietrze 🌬️',
  'Zero naliczone. Niech Twoje mięśnie wiedzą, że mają szczęście 🍀',
  'OK, bez opłat — ale trenuj w domu chociaż 10 pompek. Teraz. Serio. 💪',
  'Daruję — bo wierzę, że następnym razem będziesz 🫡'
];

function _pickMsg(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function openCancellation(athleteName){
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var rate=w.entryRate||80;
  var half=Math.round(rate/2);
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:400px;width:100%;padding:22px 18px 24px;max-height:90vh;overflow-y:auto;">'
    +'<div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:4px;">📵 Odwołanie treningu</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:16px;">'+athleteName+' · stawka: '+rate+' pkt</div>'
    // Three options
    +'<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">'
    // Full charge
    +'<button onclick="_selectCancelOption(\'full\','+rate+')" id="co-full" style="text-align:left;padding:12px 14px;background:var(--s2);border:2px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:13px;font-weight:800;color:var(--text);">Pełne naliczenie</span><span style="font-size:14px;font-weight:900;color:#E24B4A;">-'+rate+' pkt</span></div>'
    +'<div style="font-size:10px;color:var(--muted);margin-top:2px;">Odwołanie = pełna stawka za trening</div></button>'
    // Partial
    +'<button onclick="_selectCancelOption(\'partial\','+half+')" id="co-partial" style="text-align:left;padding:12px 14px;background:var(--s2);border:2px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:13px;font-weight:800;color:var(--text);">Częściowe naliczenie</span><span style="font-size:14px;font-weight:900;color:#d97706;">-'+half+' pkt</span></div>'
    +'<div style="font-size:10px;color:var(--muted);margin-top:2px;">Obniżona stawka — np. odwołanie z wyprzedzeniem</div></button>'
    // Free
    +'<button onclick="_selectCancelOption(\'free\',0)" id="co-free" style="text-align:left;padding:12px 14px;background:var(--s2);border:2px solid var(--border2);border-radius:var(--r-xs);cursor:pointer;font-family:Montserrat,sans-serif;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:13px;font-weight:800;color:var(--text);">Bez naliczenia</span><span style="font-size:14px;font-weight:900;color:var(--green-text);">0 pkt</span></div>'
    +'<div style="font-size:10px;color:var(--muted);margin-top:2px;">Darowane — tym razem bez opłat</div></button>'
    +'</div>'
    // Custom amount (shown after selecting partial)
    +'<div id="cancel-custom-wrap" style="display:none;margin-bottom:10px;">'
    +'<div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Własna kwota naliczenia</div>'
    +'<input id="cancel-custom-amt" type="number" min="0" max="'+rate+'" value="'+half+'" style="width:100px;padding:7px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:15px;font-weight:800;text-align:center;box-sizing:border-box;"/>'
    +'<span style="font-size:11px;color:var(--dim);margin-left:6px;">pkt</span></div>'
    // Message preview
    +'<div id="cancel-msg-wrap" style="display:none;">'
    +'<div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Wiadomość dla zawodnika</div>'
    +'<textarea id="cancel-msg" rows="2" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;resize:vertical;box-sizing:border-box;"></textarea>'
    +'<button onclick="el(\'cancel-msg\').value=_pickMsg(_cancelMsgPool)" style="background:transparent;border:none;cursor:pointer;font-size:10px;color:var(--accent);font-weight:700;margin-top:4px;">🎲 Losuj inny tekst</button></div>'
    // Save
    +'<div id="cancel-save-wrap" style="display:none;margin-top:12px;display:none;">'
    +'<button id="cancel-save" style="width:100%;padding:12px;background:rgba(226,75,74,.08);color:#E24B4A;border:1px solid rgba(226,75,74,.2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">📵 Zapisz odwołanie</button></div>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="width:100%;padding:10px;background:transparent;color:var(--muted);border:none;font-family:Montserrat,sans-serif;font-size:12px;font-weight:700;cursor:pointer;margin-top:6px;">Anuluj</button>'
    +'</div>';
  ov.style.display='flex';
  window._cancelMsgPool=CANCEL_MSGS_FREE;
  window._cancelType='free';
  window._cancelAthlete=athleteName;
}

function _selectCancelOption(type, amount){
  window._cancelType=type;
  ['co-full','co-partial','co-free'].forEach(function(id){ var b=el(id); if(b){ b.style.borderColor='var(--border2)'; b.style.background='var(--s2)'; } });
  var sel=el('co-'+type); if(sel){ sel.style.borderColor=type==='full'?'#E24B4A':type==='partial'?'#d97706':'var(--green)'; sel.style.background=type==='full'?'rgba(226,75,74,.06)':type==='partial'?'rgba(217,119,6,.06)':'rgba(22,163,74,.06)'; }
  el('cancel-custom-wrap').style.display=type==='partial'?'block':'none';
  if(type==='partial'){ el('cancel-custom-amt').value=amount; el('cancel-custom-amt').focus(); }
  window._cancelMsgPool=type==='full'?CANCEL_MSGS_FULL:type==='partial'?CANCEL_MSGS_PARTIAL:CANCEL_MSGS_FREE;
  el('cancel-msg').value=_pickMsg(window._cancelMsgPool);
  el('cancel-msg-wrap').style.display='block';
  el('cancel-save-wrap').style.display='block';
  // Wire save button
  document.getElementById('cancel-save').onclick=function(){ _saveCancellation(); };
}

function _saveCancellation(){
  var type=window._cancelType;
  var athleteName=window._cancelAthlete;
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var rate=w.entryRate||80;
  var amount=type==='full'?rate:type==='partial'?(parseFloat(el('cancel-custom-amt').value)||0):0;
  var msg=(el('cancel-msg').value||'').trim();
  _pushUndo('Odwołanie: '+athleteName);
  if(amount>0) w.balance-=amount;
  var today=getDayKey(new Date());
  var now=new Date(); var timeStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var label=type==='full'?'Odwołanie — pełne naliczenie':type==='partial'?'Odwołanie — częściowe':'Odwołanie — bez naliczenia';
  w.transactions.push({id:Date.now(),date:today,type:amount>0?'debit':'cancel',amount:amount,note:'📵 '+label+(msg?' · '+msg:'')});
  _logEvent(w,'📵 '+label+': '+(amount>0?'-'+amount+' pkt':'0 pkt')+' · '+msg);
  saveCRM();
  el('confirm-overlay').style.display='none';
  if(_currentProfileId){ var allSess=[]; try{ allSess=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){} renderAthleteProfile(a,allSess); }
  renderAthleteList();
}

function updateEntryRate(athleteName, val){
  _pushUndo('Stawka: '+athleteName);
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  w.entryRate=Math.max(0,parseFloat(val)||80);
  saveCRM();
}

function deleteTransaction(txId, athleteName){
  loadCRM();
  var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var tx=w.transactions.find(function(t){ return t.id===txId&&!t.deleted; }); if(!tx) return;
  // Find paired transaction (debit+power share pairId)
  var paired=tx.pairId?w.transactions.filter(function(t){ return t.pairId===tx.pairId&&!t.deleted; }):null;
  var hasPair=paired&&paired.length>1;
  var icon=tx.type==='credit'?'💰':tx.type==='power'?'⚡':'🚪';
  var sign=tx.type==='debit'?'-':'+';
  var ov=_ensureOverlay();
  ov.innerHTML='<div style="background:var(--s1);border-radius:var(--r);max-width:380px;width:100%;padding:22px 18px 24px;">'
    +'<div style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:10px;">Usunąć wpis?</div>'
    +'<div style="background:var(--s2);border-radius:var(--r-xs);padding:10px 12px;margin-bottom:'+(hasPair?'6':'12')+'px;">'
    +'<div style="font-size:13px;font-weight:800;color:var(--text);">'+icon+' '+sign+tx.amount+' pkt</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-top:2px;">'+(tx.note||'')+'</div>'
    +'<div style="font-size:10px;color:var(--dim);margin-top:2px;">'+tx.date+'</div></div>'
    +(hasPair?'<div style="font-size:10px;color:#a855f7;margin-bottom:12px;font-weight:700;">⚡ Powiązane +10 punktów mocy zostanie też usunięte</div>':'')
    +'<div style="margin-bottom:14px;"><div style="font-size:10px;color:var(--dim);margin-bottom:4px;">Dlaczego usuwasz?</div>'
    +'<select id="del-tx-reason-sel" onchange="var o=el(\'del-tx-other\');o.style.display=this.value===\'inne\'?\'block\':\'none\';if(this.value===\'inne\')o.focus();" style="width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;box-sizing:border-box;margin-bottom:6px;">'
    +'<option value="Błędne odbicie">Błędne odbicie</option>'
    +'<option value="Podwójny wpis">Podwójny wpis</option>'
    +'<option value="Korekta salda">Korekta salda</option>'
    +'<option value="Zmiana pakietu">Zmiana pakietu</option>'
    +'<option value="Zwrot">Zwrot</option>'
    +'<option value="inne">Inne (wpisz powód)...</option></select>'
    +'<input id="del-tx-other" type="text" placeholder="Wpisz powód..." style="display:none;width:100%;padding:8px 10px;background:var(--s2);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:Montserrat,sans-serif;font-size:12px;box-sizing:border-box;"/></div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="del-tx-confirm" style="flex:1;padding:12px;background:rgba(226,75,74,.1);color:#E24B4A;border:1px solid rgba(226,75,74,.25);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Usuń</button>'
    +'<button onclick="el(\'confirm-overlay\').style.display=\'none\'" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div></div>';
  ov.style.display='flex';
  document.getElementById('del-tx-confirm').onclick=function(){
    var selVal=el('del-tx-reason-sel').value;
    var reason=selVal==='inne'?(el('del-tx-other').value||'').trim():selVal;
    _pushUndo('Usunięto transakcję: '+athleteName);
    loadCRM();
    var a2=athletes.find(function(x){ return x.name===athleteName; }); if(!a2) return;
    var w2=_getWallet(a2);
    // Collect all IDs to delete (tx + paired)
    var idsToDelete=[txId];
    if(tx.pairId){ w2.transactions.forEach(function(t){ if(t.pairId===tx.pairId&&!t.deleted) idsToDelete.push(t.id); }); }
    // Reverse effects and soft-delete
    idsToDelete.forEach(function(did){
      var t=w2.transactions.find(function(x){ return x.id===did&&!x.deleted; });
      if(!t) return;
      if(t.type==='credit') w2.balance-=t.amount;
      else if(t.type==='debit') w2.balance+=t.amount;
      else if(t.type==='power') w2.powerPoints-=t.amount;
      t.deleted=true;
    });
    // Log event
    _logEvent(w2,'⊘ Usunięto: '+(tx.note||tx.type)+' ('+tx.amount+' pkt) — '+reason);
    saveCRM(); ov.style.display='none';
    // Cofnij ATP jeśli to było wejście
    if(tx.type==='debit'&&typeof addPoints==='function') addPoints(athleteName,'entry_removed',-15,'Cofnięcie wejścia');
    if(_currentProfileId){ var allSess=[]; try{ allSess=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){} renderAthleteProfile(a2,allSess); }
    renderAthleteList();
  };
}

// ── Modal stawki ──
function openRateModal(athleteName){
  var existing=document.getElementById('rate-modal'); if(existing) existing.remove();
  loadCRM(); var a=athletes.find(function(x){ return x.name===athleteName; }); if(!a) return;
  var w=_getWallet(a);
  var modal=document.createElement('div'); modal.id='rate-modal';
  modal.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.onclick=function(e){ if(e.target===modal) modal.remove(); };
  var box=document.createElement('div');
  box.style.cssText='max-width:320px;width:calc(100% - 40px);background:var(--s1);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.25);padding:20px;text-align:center;';
  box.innerHTML='<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:14px;">💰 Stawka za wejście</div>'
    +'<input id="rate-inp" type="number" min="0" step="5" value="'+w.entryRate+'" style="width:120px;padding:10px;background:var(--s2);border:1px solid var(--border2);border-radius:10px;color:var(--text);font-family:Montserrat,sans-serif;font-size:20px;font-weight:800;text-align:center;outline:none;margin-bottom:4px;"/>'
    +'<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">pkt za wejście</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<button id="rate-save" style="flex:1;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:800;cursor:pointer;">Zapisz</button>'
    +'<button onclick="document.getElementById(\'rate-modal\').remove()" style="flex:1;padding:12px;background:var(--s2);color:var(--text);border:1px solid var(--border2);border-radius:var(--r);font-family:Montserrat,sans-serif;font-size:13px;font-weight:700;cursor:pointer;">Anuluj</button></div>';
  modal.appendChild(box); document.body.appendChild(modal);
  document.getElementById('rate-save').onclick=function(){
    var val=parseFloat(document.getElementById('rate-inp').value)||0;
    _pushUndo('Stawka: '+athleteName);
    loadCRM(); var a2=athletes.find(function(x){ return x.name===athleteName; }); if(!a2) return;
    var w2=_getWallet(a2); w2.entryRate=Math.max(0,val); saveCRM();
    modal.remove();
    if(_currentProfileId){ var as=[]; try{ as=JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); }catch(e){} renderAthleteProfile(a2,as); }
  };
}
```

> W oryginalnym `wallet.js` między `_doDeductEntry` a sekcją odwołań znajduje się jeszcze
> funkcja `openAddPower()` (dodawanie punktów mocy). Została pominięta w listingu, bo dotyczy
> warstwy motywacyjnej, nie rozliczeń finansowych.

---

## 11. Ograniczenia i uwagi

- **Brak osobnej encji „dług"** — dług to po prostu `balance < 0`. Nie ma pól typu
  `debt`, `dueDate` ani historii samego długu; saldo jest jedynym źródłem prawdy.
- **Brak twardej blokady** — aplikacja pozwala zejść saldem dowolnie nisko (tylko ostrzega).
  To świadomy wybór: trener może „kredytować" wejścia i rozliczyć je później doładowaniem.
- **Punkty (`pkt`) to nie waluta** — to wewnętrzna jednostka rozliczeniowa. Mapowanie
  pkt → PLN ustala trener przez stawkę/pakiety; aplikacja nie przechowuje kwot w złotówkach.
- **`calcEarned` (Skarbiec) liczy wszystkie debety** — także te z odwołań z opłatą,
  nie tylko „czyste" wejścia. Usunięte transakcje (`deleted:true`) są pomijane.
- **Zmiana stawki nie działa wstecz** — wpływa tylko na przyszłe wejścia/odwołania.
- **Synchronizacja całościowa** — `sync.js` wysyła cały portfel jako jeden JSONB przy
  każdym pushu (delete+insert per tabela), z zabezpieczeniem „nie nadpisuj chmury pustymi danymi".
- **Warstwa motywacyjna poza zakresem** — `powerPoints`, transakcje `type:'power'` oraz
  ATP/rangi/streak (`gamification.js`) celowo pominięte w tym dokumencie.
