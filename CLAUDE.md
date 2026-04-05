# AthletiXApp v2 — Sigma AthletiX

## Opis projektu
Aplikacja webowa (PWA) dla trenera personalnego / strength & conditioning coach. Służy do:
- Prowadzenia sesji treningowych z kontrolą tempa ruchu (tempo timer)
- Treningu reaktywnego (kolory/strzałki)
- Interwałów (EMOM, Custom, Stoper)
- Prowadzenia dziennika treningowego (wpisy siłowe + testy)
- Zarządzania zawodnikami (micro CRM)
- Generowania raportów PDF z dnia treningowego

**Autor:** Paweł Łydek  
**Język interfejsu:** Polski  
**Stack:** Pojedynczy plik HTML (~8300 linii) z inline CSS + JS, zero zależności backendowych. Dane w localStorage.  
**Czcionka:** Montserrat (Google Fonts) — wagi: 400, 500, 600, 700, 800, 900

---

## Plik projektu
**`athletixapp-v2 (15).html`** — cały projekt to JEDEN plik HTML:
- Linie 1–466: `<style>` — cały CSS (zmienne, oba motywy, wszystkie komponenty)
- Linie 468–1271: `<body>` — HTML structure (ekrany settings, workout, reactive, interval, overlays, modals)
- Linie 1273–8282: `<script>` — cały JavaScript
- Linie 8285–8306: Test picker overlay (HTML po script)

---

## Moduły i funkcje

### 1. TEMPO TIMER (zakładka "Tempo")
- **Cel:** Kontrola tempa ruchu w ćwiczeniach siłowych
- **Fazy:** Ekscentryka (w dół, czerwony), Pauza (amber), Koncentryka (w górę, zielony), Odpoczynek
- **Parametry:** sDn (1-15s), sUp (1-15s), Pauza (0-5s), Odpoczynek (0-10s), Przygotowanie (1-15s), Powtórzenia (1-50)
- **Dźwięk:** 4 tryby — Wyciszony, Metronom (Web Audio API beep), Głos (Speech Synthesis PL), Sygnały
- **Ekran aktywny:** `#workout` — fullscreen z kolorowym wypełnieniem (fill animation), odliczanie, kropki postępu
- **Pauza:** Tak (przycisk ⏸), wznawia od bieżącego powtórzenia
- **Zmienne globalne:** `snd`, `sDn`, `sUp`, `sRp`, `customVals`, `wSettings`, `wPaused`
- **Funkcje kluczowe:** `startW()`, `run()`, `runFromRep()`, `stopW()`, `togglePauseW()`

### 2. REACTIVE (zakładka "Reactive")
- **Cel:** Trening reaktywny — wyświetlanie losowych bodźców wizualnych
- **Tryby bodźców:** Kolory (8 kolorów) lub Strzałki (8 kierunków + kółko)
- **Opcje:** "Bez powtórzeń" (ten sam bodziec nie 2x z rzędu), "Ekran bazowy" (neutralny ekran między bodźcami)
- **Czas wyświetlania:** Stały lub Losowy przedział (min/max)
- **Tryb sesji:**
  - **Czas sesji:** Presety (10s-3min) + Custom + Unlimited
  - **Interwały:** Praca/Przerwa/Rundy z pierścieniem postępu (HUD na górze ekranu)
- **Ekran aktywny:** `#rc-active` — pełnoekranowy, tło zmienia kolor lub wyświetla strzałkę SVG
- **Timer reakcji:** Mierzy czas od pojawienia się bodźca (wyświetlany na bieżąco)
- **Countdown 3-2-1** przed startem
- **Zmienne:** `rcSubMode`, `rcTimeMode`, `rcT`, `rcOpts`, `selColors`, `selArrows`, `rcSessionMode`, `rcIntVals`
- **Funkcje:** `startRC()`, `showStim()`, `showBase()`, `stopRC()`, `startRcInterval()`, `_startRcIntPhase()`

### 3. INTERVAL TIMER (zakładka "Interwały")
- **Rodzaje:**
  - **EMOM:** Every Minute on the Minute (1-60 minut)
  - **Custom:** Praca/Przerwa/Rundy z presetami (Tabata, HIIT, Power) + 3 custom presety
  - **Stoper:** Odliczanie w dół (presety + custom min/sec) lub w górę (bez limitu)
- **Dźwięk interwałów:** Oddzielny toggle (🔔/🔕), beepy 3-2-1 przed końcem fazy
- **Ekran aktywny:** `#int-active` — pierścień SVG (ring animation), etykiety fazy/rundy
- **Pauza:** Tak — zamraża ring, zapamiętuje offset, wznawia z dokładnym ms
- **Pre-session modal:** Wybór zawodnika + ćwiczenia przed "Z zapisem"
- **Data entry:** Po każdej rundzie (Custom) — modal z polami: Moc, Prędkość, Dystans, HR
- **HR Drop:** Po zakończeniu sesji — opcjonalny pomiar tętna po 30s i 60s
- **Szybki Start:** `goFast()` — bez zapisu, bez pre-session
- **Z zapisem:** `goMain()` → `openPresession()` → `confirmPresession()` → `startInt()`
- **Zmienne:** `intSubMode`, `intVals`, `stoperSecs`, `_stoperMode`, `currentSession`
- **Funkcje:** `startInt()`, `runEMOM()`, `runCustomInt()`, `runStoper()`, `runStoperUp()`, `stopInt()`, `finishInt()`

### 4. DZIENNIK / SESJA (zakładka "Sesja")
- **Dwa tryby formularza:**
  - **TRENING (💪):** Wpis siłowy — zawodnik, kategoria ćwiczenia, ćwiczenie, serie (dynamiczne), zdjęcie
  - **TEST (🧪):** Wynik testu — zawodnik, test z biblioteki, wynik (single/bilateral/dual-metric/trials)
- **Serie dynamiczne:** Dodawanie wielu serii z kolumnami zależnymi od kategorii:
  - Siłowe: Powt, Ciężar(kg), RPE, Notatka
  - Wytrzymałość siłowa: Powt, Ciężar, Notatka
  - Eksplozywność: Powt, Ciężar, PV (m/s), MPV (m/s) — velocity tracking z wieloma próbami
  - Stabilizacja: Czas(s), Powt, Notatka
  - Mobilność: Czas(s), Powt, Notatka
  - Kondycja: Dystans(m), Czas(s), RPE, Notatka
- **Kalendarz:** Widok miesiąca z zaznaczonymi dniami treningowymi
- **Widok dnia:** Lista wpisów z drag & drop, super serie (łączenie wpisów), numeracja
- **Raport PDF:** Przycisk "RAPORT DNIA" — otwiera printable view z tabelami, zdjęciami
- **Planowanie:** Wpisy na przyszłe daty oznaczone jako 📅 PLAN
- **Zmienne:** `diary[]`, `selectedDay`, `calDate`
- **Funkcje:** `saveStrength()`, `saveTestEntry()`, `renderDayDetail()`, `printDayView()`

### 5. ZAWODNICY / CRM (zakładka "Zawodnicy")
- **CRUD:** Dodawanie (imię + notatki), edycja, usuwanie
- **Profil zawodnika:** Overlay z statystykami, historią testów, tagami
- **Athlete Bar:** Pasek szybkiego przełączania zawodników na górze (do 4+ osób w sesji)
- **MY ATHLETIX TEAM:** Przycisk otwierający selector zawodników do bieżącej sesji
- **Birth date:** Alerty urodzinowe (baner na górze ekranu)
- **Grupy:** System grup zawodników (`ax_groups`)
- **Zmienne:** `athletes[]`, `sessions[]`, `sessionAthletes[]`, `activeAthlete`
- **Funkcje:** `addAthlete()`, `loadCRM()`, `saveCRM()`, `renderAthleteBar()`

### 6. PLANY (zakładka "Plany")
- **Status:** Placeholder — wyświetla tylko informację "Wkrótce"
- Przycisk ma `opacity: 0.5`

### 7. HISTORIA SESJI
- Overlay `#history-overlay` z listą sesji interwałowych pogrupowanych per zawodnik
- Dostępna z zakładki Interwały (przycisk "📊 Historia")

### 8. SUPER SERIE (Superset System)
- Wpisy dziennika mogą być łączone w super serie (grupy A, B, C...)
- Numeracja: standalone = "1", "2"; superset = "1A", "1B", "2A", "2B"
- Drag & drop między wpisami i grupami
- Przycisk "⚡ Połącz w super serię" po zaznaczeniu checkboxów
- Przycisk "Rozłącz" na grupie
- Migracja etykiet (`runLabelMigration()`) naprawia niespójne labele

### 9. BIBLIOTEKA TESTÓW
- **5 kategorii:** Antropometria, Moc, Siła, Wytrzymałość, Szybkość/COD
- **Siła subcategories:** 1RM, 3RM, 5RM, Max Reps, ISO
- **Dual-metric testy:** CMJ z mRSI, Drop Jump z RSI — formularz z 3 próbami + avg/best
- **Testy bilateralne:** Lewa/Prawa (np. SL CMJ, Hand Grip)
- **Relative Strength:** Automatyczne obliczenie ×BW gdy znana masa ciała na dany dzień
- **Ulubione:** Per-zawodnik, wyświetlane na górze formularza
- **Custom testy:** Możliwość dodania własnych testów
- **Overlay picker:** Pełnoekranowy overlay z kategoriami, subcategoriami, listą testów

### 10. BIBLIOTEKA ĆWICZEŃ
- **6 kategorii:** Siłowe, Wytrzymałość siłowa, Eksplozywność/Moc, Stabilizacja/Core, Mobilność/Ruch, Kondycja/Cardio
- Każda kategoria ma predefiniowane ćwiczenia z opisami
- Możliwość dodawania własnych ćwiczeń
- Panel zarządzania "⚙ lista"

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
--muted: rgba(255,255,255,.35)
--dim: rgba(255,255,255,.18)
--accent: #3b82f6       (główny akcent — niebieski)
--red: #dc2626          --red-text: #f87171
--amber: #d97706        --amber-text: #fbbf24
--green: #16a34a        --green-text: #4ade80
--purple: #a855f7       --purple-text: #c084fc
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
--muted: rgba(0,0,0,.55)
--dim: rgba(0,0,0,.42)
--accent: #1d4ed8       (ciemniejszy niebieski)
--red-text: #b91c1c     --green-text: #15803d
--amber-text: #92400e   --purple-text: #6b21a8
```

### Ważne zasady wizualne
- **Ekrany aktywne (workout, rc-active, int-active) ZAWSZE ciemne** — nawet w light theme mają override na ciemne zmienne
- **Border radius:** `--r: 14px` (karty), `--r-sm: 9px` (przyciski), `--r-xs: 6px` (chipy)
- **Kolory faz:** Ekscentryka=czerwony, Pauza=amber, Koncentryka=zielony, Odpoczynek=neutralny
- **Kolory zakładek:** Tool tabs (Tempo/Reactive/Interval) = niebieski accent; Management tabs (Sesja/Zawodnicy/Plany) = fioletowy
- **Interval Custom Work=zielony, Rest=niebieski** (NIE czerwony — to celowy wybór)
- **EMOM ring = amber/yellow**
- **Stoper = fioletowy**
- **Reactive interval ring: praca=zielony, przerwa=pomarańczowy**
- **Confetti:** 160 cząsteczek, 10 kolorów, canvas overlay, 3.4s animacja

### Przełączanie motywu
- Przycisk ☀️/🌙 w nagłówku
- `toggleTheme()` → `data-theme` na `<html>`, zapis do `localStorage('ct_theme')`

---

## Struktura danych w localStorage

### `ct_v5` — Ustawienia aplikacji
```json
{
  "snd": "off|met|voice|int",
  "t": { "dn": 3, "up": 2, "rp": 8, "pa": 1, "rs": 2, "gr": 5 },
  "rc": {
    "sub": "colors|arrows",
    "tm": "fixed|random",
    "rcT": { "fixed": 10, "min": 5, "max": 20, "base": 5, "sess": -1 },
    "opts": { "norepeat": false, "base": false },
    "colors": ["#ef4444", "#15803d", ...],
    "arrows": ["↑", "↓", "←", "→"],
    "sess": -1,
    "sessCust": 240
  },
  "int": { "sub": "emom|custom|stoper", "emom": 10, "work": 30, "rest": 15, "rounds": 8 }
}
```

### `ct_theme` — "dark" | "light"

### `ax_athletes` — Lista zawodników
```json
[{ "id": 1234567890, "name": "Jan Kowalski", "notes": "...", "status": "active", "birthDate": "1995-05-15", "tags": ["piłka nożna"] }]
```

### `ax_sessions` — Sesje interwałowe (z zapisem)
```json
[{
  "id": 1234567890, "date": "2024-01-15T10:30:00.000Z",
  "athlete": "Jan", "exercise": "AirBike",
  "label": "Interwał 8×30s/15s — AirBike",
  "mode": "custom|emom|stoper",
  "params": { "work": 30, "rest": 15, "rounds": 8, "emom": 10, "duration": 60 },
  "intervals": [{ "round": 1, "power": "450", "speed": "32", "dist": "200", "hr": "165" }],
  "hrDrop": { "30s": "140", "60s": "120" },
  "endDate": "...", "order": 1, "label": "1"
}]
```

### `ax_diary` — Dziennik treningowy (wpisy siłowe + testy)
```json
[{
  "id": 1234567890, "date": "2024-01-15", "time": "09:30",
  "type": "strength|test",
  "athlete": "Jan", "exercise": "Back Squat",
  "exCat": "sila", "exDesc": "...",
  "sets": 4, "reps": "8", "load": "100",
  "setsList": [{ "reps": "8", "load": "100", "rpe": "8", "note": "", "pvValues": [], "mpvValues": [] }],
  "note": "...", "generalNote": "...",
  "label": "1A", "order": 1, "plan": false,
  "photoId": "ph_1234_5678",
  // Dla type=test:
  "testCat": "moc", "testName": "CMJ", "testSubcat": "1RM",
  "value": "42.5", "unit": "cm",
  "value2": "1.23", "unit2": "-", "label2": "mRSI",
  "trials": [{ "v1": "41.2", "v2": "1.15" }, ...],
  "avgV1": "41.5", "avgV2": "1.18",
  "side": "L|P|bilateral"
}]
```

### `ax_tests` — Wyniki testów
```json
[{ "id": 1234567890, "date": "2024-01-15", "athlete": "Jan", "category": "moc", "testName": "CMJ", "value": "42.5", "unit": "cm", "notes": "..." }]
```

### `ax_groups` — Grupy zawodników
```json
[{ "id": 1234567890, "name": "Piłkarze", "members": ["Jan", "Piotr"] }]
```

### `ax_custom_presets` — 3 sloty na custom interval presety
```json
[{ "name": "Mój HIIT", "work": 20, "rest": 10, "rounds": 8 }, null, null]
```

### `ax_custom_tests` — Własne testy użytkownika
```json
[{ "cat": "moc", "name": "Mój test", "unit": "s" }]
```

### `ax_exercise_library` — Własne ćwiczenia użytkownika
```json
[{ "cat": "sila", "name": "Moje ćwiczenie", "desc": "Opis..." }]
```

### `ax_label_mig` — Wersja migracji etykiet (aktualnie "v7")

### Zdjęcia
- **UWAGA:** Zdjęcia przechowywane w pamięci RAM (`_photoDataURLs = {}`) — NIE w localStorage!
- `photoId` w diary entry to klucz do `_photoDataURLs`
- Zdjęcia **giną po odświeżeniu strony** — to znany brak

---

## Ważne zasady logiczne

### Nawigacja
- `setMode(m)` — przełącza zakładki, ukrywa/pokazuje odpowiedni `#tab-*`
- Przycisk GO zmienia się w zależności od trybu: Tempo/Reactive = "Rozpocznij" (niebieski), Interval = dwa przyciski "📋 Z zapisem" + "⚡ Szybki Start"
- W trybie Diary i Athletes przycisk GO jest ukryty
- **Ekrany aktywne są fixed overlay na full screen** — settings jest ukrywany (`display:none`), overlay pokazywany

### Timery i pauzy
- **Tempo:** Pauza zapamiętuje numer powtórzenia, wznawia od niego (`runFromRep()`)
- **Interval:** Pauza zamraża ring offset SVG, oblicza exact ms remaining, wznawia precyzyjnie
- **Stoper Up:** Pauza zatrzymuje counter, wznawia z zapamiętaną wartością
- **`_currentTick`** — przechowuje referencję do następnej funkcji tick (używana przy resume)
- **`_nextTickAt`** — timestamp kiedy następny tick powinien się odpalić

### Zapis stanu
- **Auto-save:** `queueSave()` → debounce 400ms → `saveLS()` do `ct_v5`
- Wrapper pattern: oryginalne funkcje są nadpisywane wrapperami dodającymi `queueSave()`
- `saveLS()` wywoływane też na `pagehide` i `beforeunload`
- Diary i CRM mają osobne `saveDiary()` / `saveCRM()` / `saveSessions()`

### Wake Lock & Fullscreen
- Automatycznie aktywowane przy starcie treningu (`reqWL()`, `goFS()`)
- Zwalniane przy stop (`relWL()`, `exitFS()`)
- Re-request na `visibilitychange` gdy aktywna sesja

### Screen Lock
- Overlay `#lock-overlay` z przytrzymaniem 1.5s do odblokowania
- Dostępny we wszystkich aktywnych ekranach (przycisk 🔒)

### Swipe Down = Stop
- Touch gesture: swipe w dół >90px, <60px horizontal → zatrzymuje aktywny ekran

### Confetti
- `launchConfetti()` — canvas overlay, 160 cząsteczek, 3.4s, auto-cleanup
- Uruchamiany po zakończeniu każdej sesji

### Finish Messages
- 100 motywacyjnych wiadomości (polskie + angielskie + memy + GenZ)
- GenZ messages mają dodatkowy badge "jeśli nie rozumiesz — jesteś Bumarem 🧱"

### Super Serie
- Labeling system: "1", "2" = standalone; "1A", "1B" = superset
- `_autoNumberLabels()` — automatyczne numerowanie po każdym zapisie/edycji
- `mergeIntoSuperset()` — łączy zaznaczone wpisy
- `splitSuperset()` — rozdziela grupę
- `reorderDiary()` — drag & drop zmiana kolejności
- Migracja `runLabelMigration()` naprawia stare/niespójne etykiety

### Athlete Bar
- Max 4+ zawodników w sesji, aktywny podświetlony na niebiesko
- `setActiveAthlete()` → automatycznie wypełnia formularz dziennika
- `syncFormToActiveAthlete()` / `syncAthleteBarFromForm()` — dwukierunkowa synchronizacja

### Interval Pre-Session Flow
1. Klik "📋 Z zapisem" → `openPresession()` — modal z wyborem zawodnika + ćwiczenia
2. "Rozpocznij sesję" → `confirmPresession()` → tworzy `currentSession` → `startInt()`
3. Po każdej rundzie (Custom) → `showIntervalData()` — modal z danymi (Moc, Prędkość, Dystans, HR)
4. Po zakończeniu → `finishInt()` / `finishStoper()` → confetti + msg → data entry → HR Drop modal
5. HR Drop: opcjonalny pomiar tętna po 30s/60s z live timerem

### Raport dnia (Print)
- `printDayView()` — generuje printable HTML w nowym oknie
- Grupuje wpisy per zawodnik, zachowuje super serie
- Ładuje zdjęcia (lazy, `_embedPrintPhotos()`)
- Formatowanie: tabele, kolory kategorii, statystyki próbek

### Urodziny
- `checkBirthdays()` — sprawdza po załadowaniu
- Baner na górze ekranu z confetti gradient (fioletowo-pomarańczowy)

---

## Co działa poprawnie
- Wszystkie 3 timery (Tempo, Reactive, Interval) z pełną funkcjonalnością
- Pauza/Resume we wszystkich trybach
- Dziennik treningowy z dynamicznymi seriami i wszystkimi kategoriami
- System testów z dual-metric, bilateral, trials
- Super serie (łączenie, rozłączanie, drag & drop, numeracja)
- CRM zawodników z profilem
- Athlete bar z quick-switch
- Pre-session flow dla interwałów
- HR Drop pomiar
- Raport PDF / print
- Theme toggle (dark/light)
- Wake lock + fullscreen
- Screen lock
- Konfetti po zakończeniu sesji
- 100 motywacyjnych wiadomości
- Custom interval presety (3 sloty)
- Custom testy i ćwiczenia
- Kalendarz z nawigacją po miesiącach
- Birthday alerts
- Auto-save ustawień

## Znane braki / do naprawy
- **Zdjęcia giną po odświeżeniu** — `_photoDataURLs` jest in-memory, nie persystowane do localStorage/IndexedDB
- **Zakładka "Plany"** — tylko placeholder, brak implementacji
- **Brak PWA offline** — `manifest.json` i `icon.svg` referencowane ale nie istnieją w repo
- **Brak eksportu/importu danych** — wszystko w localStorage, ryzyko utraty
- **localStorage limits** — przy dużej ilości sesji/zdj��ć może się przepełnić
- **Brak walidacji formularzy** — minimalna walidacja, zależy od poprawnego inputu
