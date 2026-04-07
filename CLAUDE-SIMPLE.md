# AthletiXApp Simple — Sigma AthletiX

## Opis projektu
Uproszczona wersja aplikacji webowej (PWA) dla trenera personalnego / S&C coach. Służy do:
- Prowadzenia sesji treningowych z kontrolą tempa ruchu (tempo timer)
- Treningu reaktywnego (kolory, strzałki, balance)
- Interwałów (EMOM, Custom, Stoper)
- Prostego notatnika treningowego (wpisy tekstowe + testy)
- Zarządzania zawodnikami (micro CRM z portfelem/kredytami)
- Generowania raportów PDF z dnia treningowego

**Autor:** Paweł Łydek  
**Język interfejsu:** Polski  
**Stack:** Pojedynczy plik HTML (~3830 linii) z inline CSS + JS, zero zależności backendowych. Dane w localStorage.  
**Czcionka:** Montserrat (Google Fonts) — wagi: 400, 500, 600, 700, 800, 900  
**Prefix localStorage:** `axs_` (zamiast `ax_`), ustawienia w `cts_v5` (zamiast `ct_v5`)

---

## Struktura pliku
**`athletix-simple.html`** — cały projekt to JEDEN plik HTML:
- Linie 1–14: `<head>` — meta, manifest, fonty
- Linie 15–365: `<style>` — cały CSS
- Linie 367–1010: `<body>` — HTML structure (ekrany settings, workout, reactive, interval, overlays, modals)
- Linie 1012–3829: `<script>` — cały JavaScript

---

## Moduły i funkcje

### 1. TEMPO TIMER (zakładka "Tempo")
- **Cel:** Kontrola tempa ruchu w ćwiczeniach siłowych
- **Fazy:** Ekscentryka (w dół, czerwony), Pauza (amber), Koncentryka (w górę, zielony), Odpoczynek
- **Parametry:** sDn (1-15s), sUp (1-15s), Pauza (0-5s), Odpoczynek (0-10s), Przygotowanie (1-15s), Powtórzenia (1-50)
- **Dźwięk:** 4 tryby — Wyciszony, Metronom (Web Audio API beep), Głos (Speech Synthesis PL), Sygnały
- **Ekran aktywny:** `#workout` — fullscreen z kolorowym wypełnieniem (fill animation), odliczanie, kropki postępu
- **Pauza:** Tak (przycisk ⏸), zapamiętuje numer powtórzenia, wznawia od niego
- **Zmienne globalne:** `snd`, `sDn`, `sUp`, `sRp`, `customVals`, `wSettings`, `wPaused`, `wPauseRep`
- **Funkcje kluczowe:** `startW()`, `run()`, `runFromRep()`, `stopW()`, `togglePauseW()`, `setSnd()`, `gs()`, `mkChips()`, `applyCustom()`, `doAdj()`, `startAdj()`, `stopAdj()`
- **Elementy DOM:** `#tab-tempo`, `#workout`, `#fill`, `#wo-badge`, `#wo-phase-name`, `#wo-countdown`, `#wo-dots`, `#rep-number`, `#rep-total`, `#pause-btn-w`
- **Fill animation:** `fReset()`, `fDown(dur)`, `fPause()`, `fUp(dur)`, `fFade()`

### 2. REACTIVE (zakładka "Reactive")
- **Cel:** Trening reaktywny — wyświetlanie losowych bodźców wizualnych
- **3 tryby bodźców:** Kolory (8 kolorów), Strzałki (8 kierunków + kółko), Balance (ruchoma kulka)
- **Opcje (Colors/Arrows):** "Bez powtórzeń" (ten sam bodziec nie 2x z rzędu), "Ekran bazowy" (neutralny ekran między bodźcami)
- **Czas wyświetlania:** Stały lub Losowy przedział (min/max), wartości w dziesiątych sekundy
- **Tryb sesji:**
  - **Czas sesji:** Presety (10s-3min) + Custom + Unlimited (odliczanie w górę)
  - **Interwały:** Praca/Przerwa/Rundy z pierścieniem postępu (HUD na górze ekranu)
- **Balance mode:**
  - Kierunki: Prawo-Lewo, Góra-Dół, 2D, Zoom, 3D
  - Prędkość: 5 poziomów (B. wolno → B. szybko), mapy `BAL_SPEED_MAP`
  - Wzorce: Jednostajny, Losowe tempo, Losowy kierunek, Pełny losowy
  - Rozmiary kulki: Mała(40px), Średnia(64px), Duża(100px), B. duża(160px)
- **Ekran aktywny:** `#rc-active` — pełnoekranowy, tło zmienia kolor lub wyświetla strzałkę SVG
- **Timer reakcji:** Mierzy czas od pojawienia się bodźca (wyświetlany na bieżąco)
- **Countdown 3-2-1** przed startem — `rcCountdown321(cb)`
- **Zmienne:** `rcSubMode`, `rcTimeMode`, `rcT`, `rcOpts`, `selColors`, `selArrows`, `rcSessionMode`, `rcIntVals`, `balCfg`, `_balRAF`, `_balState`
- **Funkcje:** `startRC()`, `showStim()`, `showBase()`, `stopRC()`, `startRcInterval()`, `_startRcIntPhase()`, `_stopRcInterval()`, `startBalance()`, `stopBalance()`, `pickItem()`, `setRcSub()`, `setTimeMode()`, `toggleOpt()`, `setRcSessionMode()`
- **Elementy DOM:** `#tab-reactive`, `#rc-active`, `#rc-bg`, `#rc-arrow-wrap`, `#rc-bar`, `#rc-counter`, `#rc-session-time`, `#rc-int-hud`, `#rc-int-ring`, `#rc-int-cnt`, `#rcp-balance`

### 3. INTERVAL TIMER (zakładka "Interwały")
- **Rodzaje:**
  - **EMOM:** Every Minute on the Minute (1-60 minut)
  - **Custom:** Praca/Przerwa/Rundy z presetami (Tabata, HIIT, Power) + 3 custom presety
  - **Stoper:** Odliczanie w dół (presety + custom min/sec) lub w górę (bez limitu)
- **Dźwięk interwałów:** Oddzielny toggle (🔔/🔕), beepy 3-2-1 przed końcem fazy — `schedIntBeeps(durMs)`
- **Przygotowanie:** Konfigurowalne (0-15s), `runIntPrep(prepSecs, cb)`
- **Ekran aktywny:** `#int-active` — pierścień SVG (ring animation), etykiety fazy/rundy
- **Pauza:** Tak — zamraża ring offset SVG, oblicza exact ms remaining, wznawia precyzyjnie
- **Pre-session modal:** Wybór zawodnika + ćwiczenia przed "Z zapisem"
- **Data entry:** Po każdej rundzie (Custom) — modal z polami: Moc, Prędkość, Dystans, HR
- **HR Drop:** Po zakończeniu sesji — opcjonalny pomiar tętna po 30s i 60s z live timerem + wibracja
- **Szybki Start:** `goFast()` — bez zapisu, bez pre-session
- **Z zapisem:** `goMain()` → `openPresession()` → `confirmPresession()` → `startInt()`
- **Custom presety:** 3 sloty zapisywane w `axs_int_presets`, edycja/usuwanie/tworzenie via overlay
- **Zmienne:** `intSubMode`, `intVals` (z `prep`), `stoperSecs`, `_stoperMode`, `_stoperUpSecs`, `currentSession`, `_intSndOn`, `intPaused`, `_currentTick`, `_nextTickAt`, `_resumeDelay`, `_pausedCntVal`, `_pausedRingOffset`, `_customRound`, `_customPhase`, `_customRemaining`
- **Funkcje:** `startInt()`, `runEMOM()`, `runCustomInt()`, `runStoper()`, `runStoperUp()`, `stopStoperUp()`, `finishStoper()`, `finishInt()`, `stopInt()`, `togglePauseInt()`, `animRing()`, `setIntDots()`, `setIntSub()`, `applyPreset()`, `handleCustomPresetClick()`, `openCustomPreset()`, `setStoperMode()`
- **Elementy DOM:** `#tab-interval`, `#int-active`, `#int-bg`, `#int-ring`, `#int-main`, `#int-prog`, `#pause-btn-i`, `#pause-overlay`, `#int-snd-btn`, `#presession-modal`, `#interval-data-modal`, `#hrdrop-modal`

### 4. PROSTY DZIENNIK / NOTATNIK (zakładka "Sesja")
- **Dwa tryby formularza:**
  - **TRENING (💪):** Wolny wpis tekstowy — zawodnik + textarea
  - **TEST (🧪):** Wynik testu — zawodnik, kategoria, ćwiczenie z biblioteki, wynik liczbowy + jednostka + notatka
- **Wpisy przechowywane jako `notes[]`** — proste obiekty z `{id, date, athlete, text, type, time}`
- **Kalendarz:** Widok miesiąca z zaznaczonymi dniami (zielona kropka = dane), nawigacja po miesiącach
- **Widok dnia:** Lista wpisów grupowana per zawodnik, zwijanie/rozwijanie kart, przycisk RAPORT per zawodnik
- **Raport PDF:** Przycisk "RAPORT DNIA (wszyscy)" — otwiera printable view w nowym oknie. Raport per zawodnik też dostępny.
- **Edycja wpisów:** Overlay z textarea, pełna edycja tekstu
- **Usuwanie wpisów:** Overlay z potwierdzeniem
- **Zmienne:** `notes[]`, `selectedDay`, `calDate`, `_diaryMode`, `_selTestCat`, `_selTestName`, `_selTestUnit`, `_dayCollapsed`
- **Funkcje:** `saveNote()`, `deleteNote()`, `editNote()`, `saveTestResult()`, `renderCal()`, `renderDayDetail()`, `printAthleteDay()`, `printSimpleReport()`, `setSimpleDiaryMode()`, `initTestCatButtons()`, `populateTestExercises()`, `onTestExSelect()`, `openAddCustomTest()`
- **Elementy DOM:** `#tab-diary`, `#note-athlete`, `#note-text`, `#cal-grid`, `#cal-month-label`, `#day-detail`, `#day-entries`, `#diary-note-form`, `#diary-test-form`

### 5. BIBLIOTEKA TESTÓW
- **6 kategorii:** `sila_max` (Siła maksymalna), `wyt_sil` (Wytrzymałość siłowa), `moc` (Moc/Eksplozywność), `wytrzymalosc` (Wytrzymałość), `szybkosc` (Szybkość/COD), `antropo` (Antropometria)
- **Custom testy:** Możliwość dodania własnych, zapisywane w `axs_custom_tests`
- **Zapis:** Wyniki trafiają do `axs_tests` (do wykresów/statystyk) ORAZ do `axs_notes` (do widoku dnia/raportów) — podwójny zapis
- **Wykresy:** Canvas-based liniowe wykresy z progresem, etykietami wartości, siatką, osią dat — `_renderChart()`
- **Porównanie testów:** Overlay z nakładaniem wykresów dwóch różnych testów na siebie — `openCompareChart()`
- **Historia testów:** Per-zawodnik, z wykresami, diff vs pierwszy/poprzedni wynik (% i wartość bezwzględna)
- **Usuwanie wyników:** Z overlay potwierdzenia + automatyczne usunięcie powiązanego wpisu notatnika
- **Zmienne:** `TEST_LIBRARY` (obiekt), `testResults[]`
- **Funkcje:** `loadTests()`, `saveTests()`, `buildLatestTestResults()`, `openTestHistory()`, `deleteTestResult()`, `_renderChart()`, `openCompareChart()`

### 6. ZAWODNICY / CRM (zakładka "Zawodnicy")
- **CRUD:** Dodawanie (imię + notatki), edycja profilu, usuwanie z potwierdzeniem
- **Profil zawodnika:** Overlay z: statystykami (sesje, wpisy, ostatnia data), dane osobowe (imię, data urodzenia, kategoria, dyscyplina, klub, notatki), tagi, grupy, skarbiec, wyniki testów, ostatnie sesje
- **Athlete Bar:** Pasek szybkiego przełączania zawodników na górze (do 12 osób w sesji), inicjały + imię, podświetlenie aktywnego na niebiesko, double-click = profil
- **MY ATHLETIX TEAM:** Przycisk otwierający selector zawodników z grupami, checkboxami, dodawaniem nowego
- **Status system:** 3 statusy dostępności (Aktywny/Przerwa/Zakończony) + niezależna warstwa Kontuzji
  - **Przerwa:** Daty od-do, powód, opcja "Brak informacji — do kontaktu"
  - **Zakończony:** Data zakończenia, powód
  - **Kontuzja:** Data, opis, zalecenia, kontakt lekarza; niezależna od statusu dostępności
- **Birth date:** Alerty urodzinowe (baner na górze ekranu z gradientem fioletowo-pomarańczowym)
- **Grupy:** System grup zawodników (`axs_groups`), CRUD grup, przypisywanie zawodników
- **Kategorie:** `U13, U15, U17, U19, U21, Senior, Masters`
- **Dyscypliny:** `Bieg, Wioślarstwo, Pływanie, Triathlon, Piłka nożna, Koszykówka, Siłownia, Cross-fit, Inne`
- **Zmienne:** `athletes[]`, `sessions[]`, `teamGroups[]`, `testResults[]`, `sessionAthletes[]`, `activeAthlete`, `_expandedAthlete`, `_currentProfileId`
- **Funkcje:** `addAthlete()`, `deleteAthlete()`, `loadCRM()`, `saveCRM()`, `renderAthleteBar()`, `renderAthleteList()`, `openAthleteProfile()`, `saveAthleteProfile()`, `openAthleteBarSelector()`, `setActiveAthlete()`, `syncFormToActiveAthlete()`, `statusBadge()`, `statusButtons()`, `openStatusChange()`, `openInjuryModal()`, `checkBirthdays()`
- **Elementy DOM:** `#tab-athletes`, `#athlete-list`, `#athlete-bar`, `#athlete-bar-buttons`, `#athlete-bar-overlay`, `#athlete-profile-overlay`, `#ap-content`, `#ap-name-header`

### 7. SKARBIEC / WALLET (w profilu zawodnika)
- **Cel:** System kredytowy — zawodnik kupuje pakiet punktów, trener odlicza za wejścia
- **Komponenty:**
  - **Balance:** Punkty (saldo), Wejścia (ile zostało), Stawka za wejście, Punkty Mocy
  - **Doładowanie:** Pakiety (Starter/10/20/Premium) z kwotą i stawką, edycja pakietów, lub ręczna kwota
  - **Odliczenie wejścia:** Automatycznie odejmuje stawkę + dodaje +10 Punktów Mocy
  - **Odwołanie treningu:** 3 opcje (pełne naliczenie / częściowe / bez naliczenia), losowe wiadomości motywacyjne per opcja
  - **Punkty Mocy:** Dodawanie ręczne z notatką (za co), presety +5/+10/+25
  - **Historia wejść:** Lista transakcji z usuwaniem (soft-delete), linked pairId (wejście + moc usuwane razem)
  - **Historia zdarzeń:** Event log z timestampami
  - **Usuwanie transakcji:** Overlay z powodem (Błędne odbicie, Podwójny wpis, Korekta salda, Zmiana pakietu, Zwrot, Inne)
- **Wiadomości odwołania:** 3 zestawy — `CANCEL_MSGS_FULL`, `CANCEL_MSGS_PARTIAL`, `CANCEL_MSGS_FREE` — losowane per opcja
- **Dane zawodnika:** `a.wallet = {balance, entryRate, powerPoints, transactions[], eventLog[]}`
- **Zmienne:** `PACKAGES_KEY='axs_packages'`, `DEFAULT_PACKAGES`
- **Funkcje:** `_getWallet()`, `_buildWalletSection()`, `openAddCredits()`, `deductEntry()`, `openAddPower()`, `openCancellation()`, `_saveCancellation()`, `deleteTransaction()`, `updateEntryRate()`, `openEditPackages()`, `loadPackages()`, `savePackages()`

### 8. UNDO/REDO
- **Stack-based:** `_undoStack[]`, `_redoStack[]`, max 30 snapshots
- **Snapshot:** Zapisuje WSZYSTKIE klucze localStorage (`_ALL_DATA_KEYS`) przed zmianą
- **Pasek:** Fixed na dole ekranu, przyciski ↩ Cofnij / Ponów ↪, label ostatniej akcji
- **Auto-refresh:** Po undo/redo odświeża profil, listę zawodników, kalendarz, dane
- **Funkcje:** `_pushUndo(label)`, `undoLast()`, `redoLast()`, `_renderUndoBar()`, `_undoBarAction()`

### 9. PLANY (zakładka "Plany")
- **Status:** Placeholder — wyświetla tylko informację "Wkrótce"
- Przycisk ma `opacity: 0.5`

### 10. DANE (zakładka "Dane")
- **Eksport:** Pobiera plik JSON ze wszystkimi danymi (z metadanymi app/version/date)
- **Import:** Wczytuje plik JSON, waliduje sygnaturę `AthletiXApp Simple`, overlay z potwierdzeniem i statystykami
- **Auto-backup:** Przypomnienie o backupie (Wył/1h/3h/8h/12h/24h/3 dni/7 dni), baner na dole ekranu
- **Statystyki danych:** Liczba zawodników, wpisów, sesji, testów, grup, rozmiar KB, data ostatniego backupu
- **Strefa zagrożenia:** Przycisk usuwania WSZYSTKICH danych z potwierdzeniem
- **Wersja:** `AthletiXApp Simple v1.0`
- **Funkcje:** `exportAllData()`, `importDataFile()`, `refreshDataStats()`, `setAutoBackup()`, `checkAutoBackupDue()`, `showBackupReminder()`, `confirmClearAllData()`
- **Klucze eksportu:** `AXS_KEYS = ['axs_athletes','axs_sessions','axs_groups','axs_tests','axs_notes','axs_custom_tests','axs_packages','axs_int_presets','cts_v5','ct_theme']`

### 11. HISTORIA SESJI
- Overlay `#history-overlay` z listą sesji interwałowych (max 30, najnowsze pierwsze)
- Dostępna z zakładki Interwały (przycisk "📊 Historia")
- **Funkcje:** `openHistory()`, `closeHistory()`, `renderHistory()`

### 12. CONFETTI
- `launchConfetti()` — canvas overlay, 160 cząsteczek, 10 kolorów, 3.4s, auto-cleanup
- Uruchamiany po zakończeniu każdej sesji (tempo, reactive, interval)

### 13. FINISH MESSAGES
- ~48 motywacyjnych wiadomości (polskie + angielskie + GenZ)
- GenZ messages mają dodatkowy badge "jeśli nie rozumiesz — jesteś Bumarem 🧱"
- `getFinishMsg()` — losowy wybór

---

## Zasady wizualne

### Motyw ciemny (domyślny, `data-theme="dark"`)
```
--bg: #0b0b0b          (tło główne)
--s1: #141414           (karty, panele)
--s2: #1c1c1c           (inputy, podtła)
--s3: #2a2a2a           (hover, slidery)
--border: rgba(255,255,255,.07)
--border2: rgba(255,255,255,.13)
--text: #f2f2f2
--muted: rgba(255,255,255,.55)
--dim: rgba(255,255,255,.35)
--accent: #3b82f6       (główny akcent — niebieski)
--red: #dc2626          --red-text: #f87171
--amber: #d97706        --amber-text: #fbbf24
--green: #16a34a        --green-text: #4ade80
--purple: #a855f7       --purple-text: #c084fc
--r: 14px               --r-sm: 9px             --r-xs: 6px
```

### Motyw jasny (`data-theme="light"`)
```
--bg: #efefef
--s1: #ffffff
--s2: #e6e6e6
--s3: #d8d8d8
--border: rgba(0,0,0,.09)
--border2: rgba(0,0,0,.18)
--text: #0f0f0f
--muted: rgba(0,0,0,.6)
--dim: rgba(0,0,0,.45)
--accent: #1d4ed8       (ciemniejszy niebieski)
--red-text: #b91c1c     --green-text: #15803d
--amber-text: #92400e   --purple-text: #6b21a8
```

### Ważne zasady wizualne
- **Ekrany aktywne (workout, rc-active, int-active) ZAWSZE ciemne** — nawet w light theme mają override na ciemne zmienne
- **Kolory faz tempo:** Ekscentryka=czerwony (`--red-fill: #7f1d1d`), Pauza=amber (`--amber-fill: #78350f`), Koncentryka=zielony (`--green-fill: #14532d`)
- **Kolory zakładek:** Tool tabs (Tempo/Reactive/Interval) = niebieski accent; Management tabs (Sesja/Zawodnicy/Plany/Dane) = fioletowy
- **Interval sub-tabs** = pomarańczowy (`#c2410c`)
- **Reactive sub-tabs** = fioletowy (`--purple`)
- **Custom Work=zielony, Rest=niebieski** (w Custom interval)
- **EMOM ring = amber/yellow** (`rgba(251,191,36,.85)`)
- **Stoper = fioletowy** (`rgba(168,85,247,.85)`)
- **Reactive interval ring: praca=zielony (`#4ade80`), przerwa=pomarańczowy (`#fb923c`)**
- **Confetti:** 160 cząsteczek, 10 kolorów, 3.4s animacja

---

## Struktury danych w localStorage

### `cts_v5` — Ustawienia aplikacji
```json
{
  "snd": "off|met|voice|int",
  "t": { "dn": 3, "up": 2, "rp": 8, "pa": 1, "rs": 2, "gr": 5 },
  "rc": {
    "sub": "colors|arrows|balance",
    "tm": "fixed|random",
    "rcT": { "fixed": 10, "min": 5, "max": 20, "base": 5, "sess": -1 },
    "opts": { "norepeat": false, "base": false },
    "colors": ["#ef4444", "#15803d", "#3b82f6", "#eab308"],
    "arrows": ["↑", "↓", "←", "→"],
    "sess": -1,
    "sessCust": 240,
    "bal": { "dir": "lr", "speed": 3, "pattern": "constant", "size": "m" }
  },
  "int": { "sub": "emom", "emom": 10, "work": 30, "rest": 15, "rounds": 8 }
}
```

### `ct_theme` — `"dark"` | `"light"`

### `axs_athletes` — Lista zawodników
```json
[{
  "id": 1234567890, "name": "Jan Kowalski", "notes": "...",
  "status": "active|break|ended",
  "birthDate": "1995-05-15", "tags": ["piłka nożna"],
  "category": "Senior", "discipline": "Siłownia", "club": "Sigma",
  "breakFrom": "2024-01-15", "breakTo": "2024-02-15", "breakNote": "...", "breakUnknown": false,
  "endedDate": "2024-03-01", "endedReason": "...",
  "injury": { "active": true, "date": "2024-01-10", "description": "...", "recommendations": "...", "contact": "..." },
  "wallet": {
    "balance": 800, "entryRate": 80, "powerPoints": 30,
    "transactions": [
      { "id": 123, "date": "2024-01-15", "type": "credit|debit|power|cancel", "amount": 800, "note": "...", "pairId": "p1_123", "deleted": false }
    ],
    "eventLog": [
      { "date": "2024-01-15", "time": "14:30", "text": "💰 Doładowanie: +800 pkt" }
    ]
  }
}]
```

### `axs_sessions` — Sesje interwałowe (z zapisem)
```json
[{
  "id": 1234567890, "date": "2024-01-15T10:30:00.000Z",
  "athlete": "Jan", "exercise": "AirBike",
  "label": "Interwał 8×30s/15s — AirBike",
  "mode": "custom|emom|stoper",
  "params": { "work": 30, "rest": 15, "rounds": 8, "emom": 10, "duration": 60 },
  "intervals": [{ "round": 1, "power": "450", "speed": "32", "dist": "200", "hr": "165", "hrDrop": { "30s": "140", "60s": "120" } }],
  "hrDrop": { "30s": "140", "60s": "120" },
  "endDate": "..."
}]
```

### `axs_notes` — Wpisy notatnika (prosty dziennik)
```json
[{
  "id": 1234567890, "date": "2024-01-15", "time": "09:30",
  "athlete": "Jan Kowalski",
  "text": "Back Squat 4×8 @100kg RPE 8",
  "type": "strength|test"
}]
```

### `axs_tests` — Wyniki testów (do wykresów)
```json
[{
  "id": 1234567890, "date": "2024-01-15",
  "athlete": "Jan", "category": "moc",
  "testName": "CMJ", "value": "42.5", "unit": "cm",
  "note": "po rozgrzewce"
}]
```

### `axs_groups` — Grupy zawodników
```json
[{ "name": "Piłkarze", "athletes": ["Jan", "Piotr"] }]
```

### `axs_int_presets` — 3 sloty na custom interval presety
```json
[{ "name": "Mój HIIT", "work": 20, "rest": 10, "rounds": 8 }, null, null]
```

### `axs_custom_tests` — Własne testy użytkownika
```json
[{ "cat": "moc", "name": "Mój test", "unit": "s" }]
```

### `axs_packages` — Pakiety kredytowe (edytowalne)
```json
[
  { "name": "Starter", "amount": 100, "rate": 100, "desc": "1 wejście" },
  { "name": "Pakiet 10", "amount": 800, "rate": 80, "desc": "10 wejść" },
  { "name": "Pakiet 20", "amount": 1400, "rate": 70, "desc": "20 wejść" },
  { "name": "Premium", "amount": 2000, "rate": 65, "desc": "~30 wejść" }
]
```

### `axs_backup_cfg` — Konfiguracja auto-backupu
```json
{ "intervalHours": 8, "lastBackup": 1705312800000 }
```

---

## Zasady logiczne

### Nawigacja
- `setMode(m)` — przełącza zakładki: `tempo`, `reactive`, `interval`, `diary`, `athletes`, `plans`, `data`
- `_currentMode` trzyma aktualny tryb
- Przycisk GO zmienia się w zależności od trybu: Tempo/Reactive = "Rozpocznij" (niebieski), Interval = dwa przyciski "📋 Z zapisem" + "⚡ Szybki Start"
- W trybie Diary, Athletes, Plans, Data przycisk GO jest ukryty
- `goMain()` — dla interval otwiera presession, dla reszty bezpośredni start
- `goFast()` — szybki start interwału bez zapisu

### Timery i pauzy
- **Tempo:** Pauza zapamiętuje numer powtórzenia (`wPauseRep`), wznawia od niego (`runFromRep()`)
- **Interval:** Pauza zamraża ring offset SVG (`_pausedRingOffset`), oblicza exact ms remaining (`_resumeDelay`), wznawia precyzyjnie
- **Stoper Up:** Pauza zatrzymuje counter, wznawia z zapamiętaną wartością (`_pausedCntVal`)
- **`_currentTick`** — przechowuje referencję do następnej funkcji tick (używana przy resume)
- **`_nextTickAt`** — timestamp kiedy następny tick powinien się odpalić
- **`_scheduleTick(fn, ms)`** — ustawia timeout i referencje do resume

### Zapis stanu
- **Auto-save:** `queueSave()` → debounce 400ms → `saveLS()` do `cts_v5`
- Wrapper pattern: oryginalne funkcje są nadpisywane wrapperami dodającymi `queueSave()` (setSnd, syncV, applyCustom, rcDisp, toggleOpt, setRcSub, setTimeMode, setIntSub, applyPreset, doIntAdj)
- `saveLS()` wywoływane też na `pagehide` i `beforeunload`
- Oddzielne save/load: `saveCRM()`, `saveSessions()`, `saveNotes()`, `saveTests()`, `saveGroups()`, `savePackages()`

### Wake Lock & Fullscreen
- Automatycznie aktywowane przy starcie treningu (`reqWL()`, `goFS()`)
- Zwalniane przy stop (`relWL()`, `exitFS()`)
- Re-request na `visibilitychange` gdy aktywna sesja

### Screen Lock
- Overlay `#lock-overlay` z przytrzymaniem 1.5s do odblokowania
- Dostępny we wszystkich aktywnych ekranach (przycisk 🔒)
- `lockScreen()`, `unlockScreen()`, `_startFill()`, `_cancelFill()`

### Swipe Down = Stop
- Touch gesture: swipe w dół >90px, <60px horizontal → zatrzymuje aktywny ekran

### Konfetti + Finish Messages
- `launchConfetti()` — canvas, 160 cząsteczek, 3.4s
- `getFinishMsg()` — losowa wiadomość z `FINISH_MSGS[]`
- Uruchamiany po zakończeniu każdej sesji

### Undo/Redo
- `_pushUndo(label)` wywoływany przed KAŻDĄ modyfikacją danych (dodawanie/usuwanie/edycja zawodników, testów, notatek, transakcji, grup, statusów)
- Snapshot wszystkich kluczy `_ALL_DATA_KEYS`
- Pasek undo zawsze widoczny na dole ekranu po pierwszej akcji

### Pre-Session Flow (Interwały)
1. Klik "📋 Z zapisem" → `openPresession()` — modal z wyborem zawodnika + ćwiczenia
2. "Rozpocznij sesję" → `confirmPresession()` → tworzy `currentSession` → `startInt()`
3. "Pomiń" → `skipPresession()` → `startInt()` bez sesji
4. Po każdej rundzie (Custom) → `showIntervalData()` — modal z danymi (Moc, Prędkość, Dystans, HR)
5. Po zakończeniu → `finishInt()` / `finishStoper()` → confetti + msg → HR Drop modal
6. HR Drop: pomiar tętna po 30s/60s z live timerem, wibracja (`navigator.vibrate`)
7. `closeHRDrop()` → zapisuje sesję do `sessions[]` → `saveSessions()`

### Raport (Print)
- `_buildReportHtml(athleteName, day, entries)` — generuje pełny HTML z headerem, logiem, wpisami
- `printAthleteDay(athleteName, day)` — raport per zawodnik
- `printSimpleReport()` — raport dla wszystkich zawodników z wybranego dnia (combined lub single)
- Header z klubem z profilu zawodnika
- CSS `@media print` ukrywa przyciski nawigacji

### Overlay system
- `_ensureOverlay()` — tworzy/reużywa `#confirm-overlay` (fixed, z-index 9990)
- Blokuje scroll na body, przywraca po zamknięciu (MutationObserver)
- Używany przez: custom presety, grupy, usuwanie, statusy, kontuzje, skarbiec, testy custom, porównanie wykresów

### Ćwiczenia pre-session
- Stała lista: `EXERCISES = ['Bieg','RowErg Concept2','AirBike Assault','AirBike Rogue','SkiErg Concept2']`
- Plus ręczne wpisanie

### PWA
- Rejestracja Service Workera: `sw-simple.js`
- Manifest: `manifest-simple.json`
- Ikona: `icon-simple.svg`

---

## Co działa
- Wszystkie 3 timery (Tempo, Reactive z Balance, Interval) z pełną funkcjonalnością
- Pauza/Resume we wszystkich trybach (z precyzyjnym ring resume)
- Balance mode (5 kierunków × 4 wzorce × 5 prędkości × 4 rozmiary)
- Reactive interval mode (praca/przerwa/rundy z HUD)
- Przygotowanie (countdown) dla Interval
- Prosty dziennik (notatnik) z kalendarzem
- System testów z biblioteką (6 kategorii), custom testy
- Wykresy progresji testów (canvas), porównanie testów
- Usuwanie wyników testów
- CRM zawodników z profilem (dane, tagi, grupy, wyniki)
- Status system (Aktywny/Przerwa/Zakończony + Kontuzja)
- Skarbiec / Wallet (pakiety, doładowania, odliczanie wejść, punkty mocy, odwołania)
- Athlete bar z quick-switch (do 12 osób)
- Grupy zawodników (CRUD)
- Pre-session flow dla interwałów
- HR Drop pomiar (z wibracją)
- Custom interval presety (3 sloty, edycja/usuwanie)
- Raport PDF / print (per zawodnik i zbiorczy)
- Theme toggle (dark/light)
- Wake lock + fullscreen
- Screen lock
- Konfetti + motywacyjne wiadomości
- Swipe down = stop
- Birthday alerts
- Undo/Redo (stack z paskiem)
- Eksport/Import danych (JSON z walidacją)
- Auto-backup reminder (konfigurowalny interwał)
- Statystyki danych
- Usuwanie wszystkich danych
- Auto-save ustawień (debounced)

## Znane braki / TODO
- **Zakładka "Plany"** — tylko placeholder "Wkrótce"
- **Brak PWA offline** — `manifest-simple.json`, `icon-simple.svg`, `sw-simple.js` referencowane ale mogą nie istnieć w repo
- **Brak zdjęć** — system zdjęć nie istnieje w wersji Simple
- **Brak super serii** — system super serii nie istnieje w wersji Simple
- **Brak strukturyzowanego dziennika** — wpisy to wolny tekst, nie ustrukturyzowane serie/powtórzenia
- **Brak kategorii ćwiczeń siłowych** — notatnik nie ma systemu kategorii ćwiczeń (jest tylko w testach)
- **Brak drag & drop** — wpisy nie mają reorderowania
- **Brak walidacji formularzy** — minimalna walidacja
- **localStorage limits** — przy dużej ilości danych może się przepełnić
- **Undo stack w pamięci** — `_undoStack` i `_redoStack` giną po odświeżeniu strony
