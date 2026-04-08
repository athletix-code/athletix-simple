# AthletiXApp Simple — Sigma AthletiX

## 1. Opis projektu
Aplikacja webowa (PWA) dla trenera personalnego / S&C coacha. Wersja modularna z oddzielnymi plikami JS/CSS. Służy do:
- Prowadzenia sesji treningowych z kontrolą tempa ruchu (tempo timer)
- Treningu reaktywnego (kolory, strzałki, balance)
- Interwałów (EMOM, Custom, Stoper) z pre-session flow i HR Drop
- Strukturyzowanego dziennika treningowego z biblioteką ćwiczeń i dynamicznymi seriami
- Tworzenia i wykonywania planów treningowych
- Zarządzania zawodnikami (micro CRM ze skarbcem, statusami, kontuzjami)
- Systemu gamifikacji (ATP, rangi, streak, awatar, osiągnięcia)
- Generowania raportów PDF z dnia treningowego

**Autor:** Paweł Łydek
**Język interfejsu:** Polski
**Stack:** Wersja modularna — index.html (~806 linii) + 16 plików JS + 2 pliki CSS. Dane w localStorage + opcjonalnie Supabase.
**Czcionka:** Montserrat (Google Fonts) — wagi: 400, 500, 600, 700, 800, 900
**Prefix localStorage:** `axs_` (ustawienia w `cts_v5`, motyw w `ct_theme`)
**Deploy:** GitHub Pages via GitHub Actions (folder `athletix/`)
**URL:** https://athletix-code.github.io/athletix-simple/

---

## 2. Struktura plików

### HTML
- `athletix/index.html` — ~806 linii, cała struktura UI

### CSS
- `athletix/css/app.css` — ~390 linii, zmienne CSS, wszystkie komponenty
- `athletix/css/desktop.css` — media query dla >=768px

### JavaScript (16 plików, ~400+ funkcji)
Kolejność ładowania (ważna — zależności):
1. `storage.js` — abstrakcja localStorage
2. `core.js` — nawigacja, audio, theme, wake lock, confetti, finish messages
3. `timers.js` — tempo timer, reactive (kolory/strzałki/balance), interval (EMOM/custom/stoper), pre-session, HR drop, historia sesji
4. `athletes.js` — CRM, athlete bar, profil, grupy, tagi, testy z wykresami, undo/redo, statystyki
5. `wallet.js` — skarbiec (depozyt/zarobek), doładowania, wejścia, odwołania, stawka
6. `status.js` — statusy (aktywny/przerwa/zakończony), kontuzje, overlay system, lista zawodników
7. `gamification.js` — ATP, rangi, awatar, streak, level-up, widget profilu
8. `exercises.js` — EXERCISE_LIBRARY, formularz strength, batch serie, ulubione, tonaż, buildEntryText
9. `diary.js` — notatnik, testy, kalendarz, widok dnia
10. `reports.js` — raport PDF (per zawodnik i zbiorczy)
11. `plans.js` — plany treningowe, edytor, wykonanie, stan per zawodnik, progress bar
12. `data.js` — eksport/import JSON, auto-backup, statystyki danych
13. `settings.js` — zapis/odczyt ustawień timerów, hook queueSave
14. `supabase-config.js` — auth (login/rejestracja), Supabase client
15. `sync.js` — synchronizacja danych z Supabase
16. `autogrow.js` — pełnoekranowy modal textarea na mobile

### PWA
- `manifest.json`, `sw.js`, `icons/` (icon-192.png, icon-512.png, icon.svg)

---

## 3. Moduły i funkcje

### TEMPO TIMER
- **Cel:** Kontrola tempa ruchu w ćwiczeniach siłowych
- **Fazy:** Ekscentryka (czerwony), Pauza (amber), Koncentryka (zielony), Odpoczynek
- **Dźwięk:** 4 tryby — Wyciszony, Metronom, Głos (Speech Synthesis PL), Sygnały
- **Pauza:** Zapamiętuje numer powtórzenia, wznawia od niego
- **Kluczowe:** `startW()`, `run()`, `runFromRep()`, `stopW()`, `togglePauseW()`
- **DOM:** `#workout`, `#fill`, `#wo-badge`, `#wo-countdown`, `#wo-dots`

### REACTIVE
- **3 tryby:** Kolory (8), Strzałki (8+kółko), Balance (ruchoma kulka)
- **Balance:** 5 kierunków (lr/ud/2d/zoom/3d) × 4 wzorce × 5 prędkości × 4 rozmiary
- **Tryb sesji:** Czas sesji (presety + custom + unlimited) lub Interwały (praca/przerwa/rundy)
- **Countdown 3-2-1** przed startem, timer reakcji na bieżąco
- **Kluczowe:** `startRC()`, `showStim()`, `showBase()`, `stopRC()`, `startBalance()`
- **DOM:** `#rc-active`, `#rc-bg`, `#rc-arrow-wrap`, `#rc-int-hud`

### INTERVAL TIMER
- **EMOM:** 1-60 minut, ring amber
- **Custom:** Praca/Przerwa/Rundy + presety (Tabata/HIIT/Power) + 3 custom sloty
- **Stoper:** Odliczanie w dół lub w górę, ring fioletowy
- **Przygotowanie:** 0-15s countdown
- **Pre-session:** Modal wyboru zawodnika + ćwiczenia → zapis sesji
- **Data entry:** Po każdej rundzie — Moc, Prędkość, Dystans, HR
- **HR Drop:** Pomiar tętna po 30s/60s z wibracją
- **Kluczowe:** `startInt()`, `runEMOM()`, `runCustomInt()`, `runStoper()`, `finishInt()`
- **DOM:** `#int-active`, `#int-ring`, `#presession-modal`, `#hrdrop-modal`

### SESJA / DZIENNIK
- **3 tryby sesji:** ✍️ Ręcznie | 📋 Z planu | 📝 Notatnik
- **Tryb Ręcznie:** Toggle 💪 TRENING / 📈 TEST
  - TRENING: Szybki select ćwiczeń (zone + ćwiczenie) lub wpisz ręcznie lub wybierz z kategorii. Serie z placeholderami, pole "S" do mnożenia, notatki per seria (modal), notatka ogólna
  - TEST: Kategoria → ćwiczenie z TEST_LIBRARY → wynik + jednostka + notatka. Wykresy progresji (canvas)
- **Tryb Z planu:** Select planu → karty ćwiczeń z checkboxami, indicator "⚠ W planie było:", progress bar, podgląd sesji, dodawanie ćwiczeń poza planem
- **Tryb Notatnik:** Textarea podgląd → modal centered z blur → zapis
- **Stan per zawodnik:** `_athleteSessionState` — tryb, plan, checkboxy, wartości persist przy przełączaniu
- **Kalendarz:** Widok miesiąca, zielone kropki na dniach z danymi
- **Widok dnia:** Wpisy grupowane per zawodnik, karty strukturyzowane (badge kategorii, serie, tonaż), edycja (overlay), usuwanie (potwierdzenie)
- **Kluczowe:** `saveStrengthEntry()`, `saveTestResult()`, `saveNote()`, `renderDayDetail()`
- **DOM:** `#tab-diary`, `#note-athlete`, `#ex-select`, `#plan-select`, `#notepad-preview`

### PLANY TRENINGOWE
- **Struktura:** name, athletes[], exercises[{type, label, exCat, exZone, exercise, targetSets[], note}]
- **Lista planów:** Karty z preview ćwiczeń, chipami zawodników. Przyciski: ▶ Uruchom, ✏️ Edytuj, 📋 Kopiuj, 🗑 Usuń
- **Edytor (overlay full-screen):**
  - Nazwa planu, multi-select zawodników (chipy max 6 + dropdown z grupami)
  - Ulubione ćwiczenia jako chipy (rozwijanie/zwijanie) + panel inline z wyszukiwaniem + gwiazdka ⭐ na kartach
  - Dodawanie: szybki select (zone + ćwiczenie) lub wpisz ręcznie lub pełny flow kategorii lub ➕ notatka
  - Karta ćwiczenia: label (edytowalny), badge kategorii, serie z placeholderami i polem S, notatki per seria (modal), strzałki ↑↓ (okrągłe), 🗑
  - Super serie wizualne: ta sama cyfra w labelu = mniejszy margines + lewa belka accent
  - Zapis: rozdzielanie serii (pole S>1), walidacja
- **Wykonanie (tryb Z planu w Sesji):**
  - Select planu (plany zawodnika na górze + wszystkie plany)
  - Karty z checkboxami, pre-filled values, indicator "⚠ W planie było:" (real-time na input event)
  - `_execPlan` z `_origSets` — odporny na reorder
  - Progress bar: "Postęp: 7/15 serii" + bar
  - Dodawanie ćwiczeń poza planem (badge "DODANE")
  - Podgląd sesji (modal 👁)
  - Potwierdzenie zapisu jeśli nie wszystko odhaczone
  - Notatki zmian zapisywane w serii: "⚠ W planie było: 8 × 100kg. notatka ręczna"
  - Tonaż w flash po zapisie
- **Kluczowe:** `openPlanEditor()`, `renderPlanExecution()`, `saveExecutedPlan()`, `launchPlan()`

### ZAWODNICY / CRM
- **CRUD:** Dodawanie, edycja profilu, usuwanie z potwierdzeniem
- **Profil:** Awatar gamifikacji, widget ATP, kafelki statystyk (tydzień/miesiąc/rok/ostatnia), skarbiec, dane osobowe (imię, data urodzenia, kategoria, dyscyplina, klub), tagi, grupy, wyniki testów z wykresami, plany, sesje
- **Athlete Bar:** Pasek szybkiego przełączania (max 3 widocznych, rozwijanie, double-click = profil), badge Lv. z kolorem rangi
- **MY ATHLETIX TEAM:** Modal z checkboxami, grupami, dodawaniem nowego
- **Status:** Aktywny/Przerwa/Zakończony + niezależna warstwa Kontuzji
- **Grupy:** CRUD, przypisywanie członków, zaznaczanie całej grupy
- **Pełne statystyki (modal):** Dni treningowe, ATP breakdown, osiągnięcia, tonaż, testy, frekwencja (mini kalendarz 12 tygodni)
- **Kluczowe:** `renderAthleteBar()`, `openAthleteProfile()`, `renderAthleteProfile()`, `openFullStatsModal()`

---

## 4. System gamifikacji (ATP)

### Struktura danych (`axs_gamification`)
Per zawodnik: `{totalPoints, level, avatar, avatarName, avatarMotto, weeklyStreak, bestStreak, lastTrainingWeek, badges[], history[]}`

### Tabela rang (RANK_TABLE) — 13 rang:
| Lv | Nazwa | ATP | Emoji | ~Czas |
|----|-------|-----|-------|-------|
| 1 | Nowicjusz | 0 | 🌱 | start |
| 2 | Debiutant | 200 | 🌿 | ~2 tyg. |
| 3 | Początkujący | 500 | 🍀 | ~6 tyg. |
| 5 | Regularny | 1000 | 💧 | ~3 mies. |
| 7 | Adept | 2000 | 💪 | ~6 mies. |
| 10 | Wojownik | 4000 | ⚔️ | ~1 rok |
| 13 | Weteran | 7000 | 🛡️ | ~1.5 roku |
| 16 | Gladiator | 12000 | 🏛️ | ~2.5 roku |
| 20 | Spartanin | 20000 | 🔥 | ~4 lata |
| 25 | Mistrz | 35000 | 👑 | ~7 lat |
| 30 | Legenda | 55000 | ⭐ | ~12 lat |
| 40 | Titan | 85000 | 🏔️ | ~19 lat |
| 50 | Bóg Olimpu | 130000 | 🏆 | ~30 lat |

### Źródła ATP:
- `saveStrengthEntry()` → +10 ATP + streak
- `saveExecutedPlan()` → +10 per ćwiczenie + 25 bonus za 100% + streak
- `saveTestResult()` → +15 ATP
- `saveNote()` → +5 ATP (jeśli zawodnik wybrany)
- `deductEntry()` → +15 ATP + streak
- `deleteTransaction()` (debit) → -15 ATP
- Streak tygodniowy → +5 × numer tygodnia

### Awatar:
- 45 emoji, 45 nazw, 15 motywacyjnych cytatów
- Losowanie (🎲) lub ręczna edycja (modal z gridem emoji)
- Ramka awatara: border-color = kolor aktualnej rangi

### Animacja awansu:
- Fullscreen modal (z-index 9999) z emoji rangi, "⚡ AWANS!", opis motywacyjny, "Elevate Your Game ⚡", confetti, auto-zamknięcie 3s

### Modal "⚡ Jak to działa?":
- Opis ATP, lista źródeł, tabela rang z opisami, badge "← Tu jesteś"

### Osiągnięcia (w modalu statystyk):
- ~30 osiągnięć dynamicznych: regularność (1-365 dni), tonaż (1t-1000t), streak (2-52 tyg.), testy (1-25), ATP (100-5000)
- "🎯 Następny cel" — najbliższe nieosiągnięte

---

## 5. Skarbiec

### Layout: DEPOZYT ➤ SKARBIEC
- **Depozyt:** Saldo klienta (border green)
- **Skarbiec:** Suma zarobków trenera (suma transakcji debit, border accent)
- **Kafelki info:** Wejść | Stawka | ATP ⚡
- **Przyciski:** + Doładuj, − Wejście, 🚫 Odwołanie, 💰 Stawka

### Logika finansowa:
- Doładowanie (credit): saldo + kwota, pakiety edytowalne
- Wejście (debit): saldo − stawka
- Odwołanie: 3 opcje (pełne/częściowe/bez naliczenia) + losowe wiadomości
- Usuwanie transakcji: soft-delete + reversal + powód

### Animacja wejścia:
- Depozyt: border → red (0.5s)
- Skarbiec: border → green + scale 1.03 (0.5s)

---

## 6. Biblioteka ćwiczeń (EXERCISE_LIBRARY)

### 6 kategorii:
| Klucz | Label | Kolor | Fields |
|-------|-------|-------|--------|
| sila | Siłowe | #3b82f6 | reps, load, rir |
| wyt_sil | Wytrzymałość siłowa | #d97706 | reps, load |
| eksplozywnosc | Eksplozywność / Moc | #ea580c | reps, load |
| stabilizacja | Stabilizacja / Core | #16a34a | time, reps |
| mobilnosc | Mobilność / Ruch | #a855f7 | time, reps |
| kondycja | Kondycja / Cardio | #dc2626 | dist, time, rir |

### Każda kategoria: podział upper/lower/full
### Zone labels: 💪 Góra, 🦵 Dół, 🫁 Centrum

### Ulubione ćwiczenia (`axs_favorite_exercises`):
- Max 40, FIFO
- Auto-dodawane przy zapisie wpisu
- Chipy w formularzu + edytorze planu (rozwijanie/zwijanie)
- Panel inline z wyszukiwaniem i gwiazdkami
- Long press na chipie → opcja usunięcia

### Custom ćwiczenia (`axs_custom_exercises`):
- Format: `[{cat, zone, name}]`

---

## 7. Zasady wizualne

### Motyw ciemny (domyślny)
```
--bg:#0b0b0b  --s1:#141414  --s2:#1c1c1c  --s3:#2a2a2a
--accent:#3b82f6  --red:#dc2626  --amber:#d97706  --green:#16a34a  --purple:#a855f7
--r:14px  --r-sm:9px  --r-xs:6px
```

### Motyw jasny
```
--bg:#efefef  --s1:#ffffff  --s2:#e6e6e6  --accent:#1d4ed8
```

### Ekrany aktywne (workout, rc-active, int-active) ZAWSZE ciemne
### Kolory faz: Ekscentryka=czerwony, Pauza=amber, Koncentryka=zielony
### Interval Custom: Work=zielony, Rest=niebieski. EMOM=amber. Stoper=fioletowy
### Reactive interval: praca=zielony, przerwa=pomarańczowy

---

## 8. Struktury danych w localStorage

### `cts_v5` — Ustawienia timerów
```json
{"snd":"off","t":{"dn":3,"up":2,"rp":8,"pa":1,"rs":2,"gr":5},"rc":{"sub":"colors","tm":"fixed","rcT":{},"opts":{},"colors":[],"arrows":[],"bal":{}},"int":{"sub":"emom","emom":10,"work":30,"rest":15,"rounds":8}}
```

### `axs_athletes` — Zawodnicy
```json
[{"id":123,"name":"Jan","notes":"","status":"active","birthDate":"","tags":[],"category":"","discipline":"","club":"","wallet":{"balance":800,"entryRate":80,"transactions":[],"eventLog":[]}}]
```

### `axs_notes` — Wpisy dziennika
```json
[{"id":123,"date":"2025-04-08","time":"09:30","athlete":"Jan","type":"strength","exCat":"sila","exZone":"lower","exercise":"Back Squat","sets":[{"reps":"8","load":"100","rir":"2","note":""}],"generalNote":"","text":"Back Squat — 3 serie | 8×100kg RIR2","label":"1","fromPlan":123}]
```

### `axs_plans` — Plany treningowe
```json
[{"id":123,"name":"Plan A","athletes":["Jan"],"exercises":[{"type":"exercise","label":"1","exCat":"sila","exZone":"lower","exercise":"Back Squat","targetSets":[{"reps":"8","load":"100","rir":"2","note":""}],"note":""}],"status":"active","created":"2025-04-08","updated":"2025-04-08"}]
```

### `axs_gamification` — Gamifikacja
```json
{"Jan":{"totalPoints":1065,"level":5,"avatar":"🦁","avatarName":"Wilk","avatarMotto":"Silniejszy niż wczoraj.","weeklyStreak":3,"bestStreak":5,"lastTrainingWeek":"2025-W15","badges":[],"history":[{"date":"...","source":"session","points":10,"desc":"Wpis: Back Squat"}]}}
```

### Inne klucze:
- `axs_sessions` — Sesje interwałowe z danymi (moc, prędkość, dystans, HR, hrDrop)
- `axs_groups` — Grupy zawodników `[{name, athletes[]}]`
- `axs_tests` — Wyniki testów (do wykresów)
- `axs_custom_tests`, `axs_custom_exercises`, `axs_favorite_exercises`
- `axs_packages` — Pakiety kredytowe (edytowalne)
- `axs_int_presets` — 3 sloty na custom interval presety
- `axs_backup_cfg` — Auto-backup `{intervalHours, lastBackup}`
- `ct_theme` — "dark" | "light"

---

## 9. Zasady logiczne

### Nawigacja: `setMode(m)` — 7 zakładek
### Overlay system: `_ensureOverlay()` → `#confirm-overlay`. Modale notatek/awatara/statystyk = osobne DOM elementy (z-index 9998) żeby nie niszczyć edytora planu
### Undo/Redo: Stack snapshots wszystkich kluczy `_ALL_DATA_KEYS` (16 kluczy), max 30
### Wake Lock + Fullscreen: Auto przy starcie treningu, zwalniane przy stop
### Screen Lock: Overlay z przytrzymaniem 1.5s do odblokowania
### Swipe Down = Stop: Touch gesture >90px w dół
### Confetti: 160 cząsteczek, 10 kolorów, 3.4s, canvas overlay
### Finish Messages: 42 wiadomości motywacyjne (PL + EN + GenZ)
### Auto-save: `queueSave()` → debounce 400ms → `saveLS()`. Wrapper pattern na funkcjach ustawień.
### Tonaż: `calcTonnage(sets)` = suma(reps × load). Per ćwiczenie + per dzień + w raporcie.

---

## 10. Co działa
- Tempo Timer, Reactive (kolory/strzałki/balance), Interval (EMOM/Custom/Stoper)
- Pauza/Resume we wszystkich trybach
- Pre-session flow, Data entry, HR Drop
- Strukturyzowany dziennik z biblioteką ćwiczeń (6 kategorii, batch serie, notatki)
- System planów (kreator, wykonanie z checkboxami, indicator zmian, progress bar)
- Stan sesji per zawodnik (persist przy przełączaniu na belce)
- CRM zawodników (profil, statusy, kontuzje, grupy, tagi)
- Skarbiec (Depozyt → Skarbiec, doładowania, wejścia, odwołania, animacja)
- Gamifikacja ATP (13 rang, awatar, streak, osiągnięcia, level-up z confetti)
- Pełne statystyki (dni treningowe, tonaż, ATP breakdown, osiągnięcia, frekwencja)
- Testy z wykresami progresji (canvas), porównanie testów
- Ulubione ćwiczenia (chipy, panel, gwiazdki, long press)
- Custom ćwiczenia i testy
- Raport PDF (per zawodnik, zbiorczy, z tabelkami serii i tonażem)
- Eksport/Import JSON, auto-backup z przypomnieniem
- Theme toggle (dark/light), birthday alerts
- Wake lock, fullscreen, screen lock, swipe down = stop
- Auth (Supabase login/rejestracja), sync, offline mode
- Autogrow textarea na mobile
- GitHub Pages auto-deploy

## 11. Znane braki / TODO
- Brak PWA offline (sw.js referencowany ale może nie działać w pełni)
- Brak zdjęć (system zdjęć nie istnieje)
- Desktop layout (desktop.css) — bazowy, nie w pełni responsywny
- localStorage limits — przy dużej ilości danych może się przepełnić
- Undo stack w pamięci RAM — ginie po odświeżeniu
- Sync z Supabase — bazowy, może wymagać dopracowania
