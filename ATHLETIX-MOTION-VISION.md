# 🎮 AthletiX Motion — Performance & Rehab Movement System
## Dokument wizji produktu v1.0

---

## FILOZOFIA

AthletiX Motion to **system oceny i treningu jakości ruchu** — narzędzie które mogłoby stać w gabinecie fizjoterapeuty, centrum przygotowania motorycznego, klinice sportowej. Ale jest na telefonie i każdy może z niego skorzystać.

To NIE jest fitness arcade. To profesjonalne narzędzie z elementami gamifikacji, które sprawia że:
- Trener ma obiektywne metryki ruchu zawodnika
- Zawodnik widzi swój postęp i chce trenować więcej
- Rehabilitant monitoruje proces powrotu do zdrowia
- Osoba początkująca angażuje się w ruch przez zabawę

### Styl: "Medical Premium"
- Czysta typografia, duże numery, minimalne ikony
- Kolorystyka sygnałowa: zielony=optimum, żółty=uwaga, czerwony=problem
- Subtelne, kliniczne dźwięki — nie gameowe beepy
- Płynne animacje — nie błyski i eksplozje
- Terminologia profesjonalna: "Wskaźnik stabilności", "Czas reakcji", "Profil dynamiczny"
- Ciemny ekran aktywny (jak inne moduły AthletiX)

---

## ZASADA PROJEKTOWA: MEASURE → TRAIN → TRACK

Każdy moduł ma trzy warstwy:

| Warstwa | Cel | Przykład |
|---------|-----|---------|
| **MEASURE** | Obiektywny pomiar (test baseline) | Test czasu reakcji: 10 prób → średnia 380ms |
| **TRAIN** | Trening z biofeedbackiem real-time | Sesja reaktywna: 60s reagowania na bodźce |
| **TRACK** | Historia wyników, wykresy, porównania | Wykres: reakcja spadła z 420ms do 340ms w 3 miesiące |

---

## ŹRÓDŁO INPUTU — TRZY TRYBY

### 📱 Akcelerometr (Tier 1 — implementujemy najpierw)
- Telefon w ręce, kieszeni lub przy klatce piersiowej
- DeviceMotionEvent API + opcjonalnie DeviceOrientationEvent
- **Zalety:** Zero opóźnień, działa offline, każdy telefon, zero setupu
- **Ograniczenia:** Nie widzi pozycji ciała, tylko przyspieszenia i obroty
- **iOS:** Wymaga `DeviceMotionEvent.requestPermission()`

### 📷 Kamera Motion Detection (Tier 2 — przyszłość)
- Porównanie klatek, wykrywanie GDZIE jest ruch
- **Zalety:** Lekkie, bez ML, widzi pozycję na ekranie
- **Ograniczenia:** Mniej precyzyjne, wymaga statywu

### 🤖 AI Pose (Tier 3 — przyszłość)
- MediaPipe Pose / TensorFlow.js PoseNet
- **Zalety:** Pełne śledzenie szkieletu, ocena techniki
- **Ograniczenia:** Ciężkie na słabszych telefonach (~5MB model)

---

## MODUŁY

---

### 1. ⚡ REAKCJA (Reaction Time & Decision Making)

#### MEASURE — Test bazowy
- 10 prób: ekran zmienia kolor → zawodnik reaguje przechyłem telefonu
- Wynik: średni czas (ms), najlepszy, najgorszy, odchylenie standardowe
- Normy: <250ms = doskonały, 250-350ms = dobry, 350-500ms = przeciętny, >500ms = do poprawy

#### TRAIN — Tryby treningowe

**Tryb 1: Prosty czas reakcji**
- Bodziec wizualny (zmiana koloru/pojawienie się ikony) → reaguj jak najszybciej
- Progresja: losowe opóźnienie między bodźcami (1-5s), krótsze okno reakcji

**Tryb 2: Wybór kierunku**
- Strzałka pojawia się (← → ↑ ↓) → przechyl telefon w odpowiednim kierunku
- Progresja: 2 kierunki → 4 kierunki → 8 kierunków, krótsze okno

**Tryb 3: Go / No-Go**
- Zielony bodziec = reaguj, Czerwony = NIE reaguj (hamowanie reakcji)
- Kluczowe w sporcie (nie rzucaj się na fałszywy sygnał) i rehabilitacji neurologicznej
- Metryka: czas reakcji GO + ilość błędów NO-GO (fałszywe alarmy)

**Tryb 4: Sekwencja bodźców**
- 2-3 bodźce pojawiają się po kolei → odtwórz sekwencję kierunków
- Pamięć ruchowa + szybkość

#### TRACK — Metryki
- Średni czas reakcji (ms) z trendem
- Procent poprawnych odpowiedzi
- Czas decyzji Go/No-Go
- Krzywa postępu (wykres liniowy per tydzień)

#### Zastosowanie kliniczne
- Ocena czasu reakcji po wstrząsie mózgu (concussion protocol)
- Monitoring funkcji poznawczych
- Trening uwagi selektywnej
- Return-to-play screening

---

### 2. 🎯 STABILNOŚĆ (Postural Control & Balance)

#### MEASURE — Test bazowy
- Stójka na jednej nodze / tandem / oczy zamknięte
- Telefon przy klatce piersiowej lub w wyprostowanej ręce
- 30s pomiar → wskaźnik stabilności (0-100)
- Protokoły: BESS (Balance Error Scoring System) adaptacja, mBESS

#### TRAIN — Tryby treningowe

**Tryb 1: Tarcza stabilności**
- Na ekranie: punkt reprezentujący wychylenie ciała
- Cel: utrzymaj punkt w centrum tarczy
- Strefy: zielona (stabilny) → żółta (odchylenie) → czerwona (utrata kontroli)
- Progresja: mniejsza strefa zielona, dłuższy czas, trudniejsza pozycja

**Tryb 2: Ścieżka stabilności**
- Punkt musi podążać za powoli poruszającym się celem
- Trening kontrolowanego przenoszenia ciężaru ciała
- Progresja: szybszy cel, bardziej złożona ścieżka (ósemki, zygzaki)

**Tryb 3: Perturbacje**
- Stoisz stabilnie → nagle "impuls" (wibracja + zmiana celu na ekranie) → wróć do centrum
- Trening reaktywnej stabilności (kluczowe w prewencji upadków i sportach kontaktowych)

#### TRACK — Metryki
- Stability Index (0-100): ważona kombinacja amplitudy i częstotliwości wychyleń
- Czas w zielonej strefie (%)
- Średnie odchylenie (°)
- Porównanie L vs P noga (wskaźnik symetrii)
- COP path length estimation (przybliżenie na bazie akcelerometru)

#### Zastosowanie
- Rehabilitacja po skręceniu stawu skokowego
- Monitoring rehabilitacji ACL (return-to-sport criteria)
- Trening równowagi u seniorów
- Screening ryzyka upadków
- Ocena propriocepcji

---

### 3. 🔄 KOORDYNACJA (Movement Sequencing & Rhythm)

#### MEASURE — Test bazowy
- Sekwencja kierunków do odtworzenia (jak Simon Says)
- Rosnąca długość: 2 → 3 → 4 → ... → ile zdołasz
- Wynik: najdłuższa poprawna sekwencja + czas odtworzenia

#### TRAIN — Tryby treningowe

**Tryb 1: Simon Says ruchowy**
- Telefon pokazuje sekwencję przechyłów → odtwórz w tej samej kolejności
- Progresja: dłuższe sekwencje, krótszy czas na odtworzenie

**Tryb 2: Rytmiczny**
- Metronom dyktuje tempo → wykonuj przechyły w rytm
- Progresja: szybsze tempo, bardziej złożone wzorce (synkopa, triole)
- Metryka: odchylenie od idealnego rytmu (ms)

**Tryb 3: Lustrzany**
- Odtwórz sekwencję WSPAK (trening pamięci ruchowej)
- Duży challenge poznawczy

**Tryb 4: Dual-task**
- Odtwarzaj sekwencje + jednocześnie licz w dół od 100 co 7
- Degradacja koordynacji pod obciążeniem poznawczym = kluczowy wskaźnik

#### TRACK — Metryki
- Sekwencja max (długość)
- Średni czas na ruch (ms)
- Precyzja rytmu (CV% odchylenia od metronomu)
- Krzywa uczenia się (poprawa w jednej sesji)

#### Zastosowanie
- Ocena koordynacji ruchowej po urazie
- Trening pamięci motorycznej
- Rehabilitacja neurologiczna (udar, TBI)
- Sporty wymagające szybkich decyzji (walki, gry zespołowe)

---

### 4. 📊 SYMETRIA (Bilateral Assessment)

#### MEASURE — Test bazowy
- Ten sam ruch na obie strony: przysiad jednonóż, hop, przechył lateralny
- Akcelerometr mierzy: siłę ruchu (peak g), czas trwania, stabilność lądowania
- Wynik: Limb Symmetry Index (LSI) — stosunek słabszej do silniejszej strony (%)

#### TRAIN — Tryby treningowe

**Tryb 1: Real-time feedback symetrii**
- Ekran: dwa słupki (L i P) — cel: wyrównać je
- Każdy ruch pokazuje natychmiast jak się ma L vs P
- Podświetlenie słabszej strony

**Tryb 2: Progresywne wyrównywanie**
- Automatycznie więcej powtórzeń na słabszą stronę
- Cel: doprowadź LSI do >90%

**Tryb 3: Hop test battery**
- Single hop, Triple hop, Crossover hop, Timed hop
- Adaptacja klasycznych testów return-to-sport na akcelerometr

#### TRACK — Metryki
- Limb Symmetry Index (%)
- Różnica L-P w: peak acceleration (g), czasie ruchu (ms), stabilności lądowania
- Asymmetry Index per ruch
- Trend LSI w czasie (wykres)
- Czerwona flaga: LSI < 85% → alert w profilu

#### Zastosowanie
- Return-to-sport criteria po ACL reconstruction (LSI >90%)
- Screening ryzyka kontuzji (asymetria >15%)
- Monitoring rehabilitacji
- Porównanie pre-injury vs current

---

### 5. 🦵 DYNAMIKA RUCHU (Movement Quality & Velocity)

#### MEASURE — Test bazowy
- Przysiad / Skok / Lunge z telefonem przy klatce piersiowej
- Profil ruchu: faza ekscentryczna, faza koncentryczna, amortyzacja
- Wynik: ecc:con ratio, peak acceleration, powtarzalność

#### TRAIN — Tryby treningowe

**Tryb 1: Tempo narzucone**
- Metronom dyktuje tempo ekscentryki i koncentryki (np. 3-1-2-0)
- Biofeedback: czy trafiasz w tempo?
- Idealne do treningu siłowego z kontrolą tempa

**Tryb 2: Velocity tracking (VBT-lite)**
- Mierz szybkość fazy koncentrycznej (przybliżenie z akcelerometru)
- Autoregulacja: gdy prędkość spada >20% vs najlepszy set → sygnał do zakończenia serii
- Próg prędkości ustawialny per ćwiczenie

**Tryb 3: Reactive Strength**
- Drop jump / CMJ → mierz: contact time, flight time, RSI (Reactive Strength Index)
- RSI = flight time / contact time
- Gold standard w ocenie plyometrycznej

**Tryb 4: Powtarzalność**
- Wykonaj 5 identycznych ruchów → jak bardzo się różnią?
- Coefficient of Variation (CV%) — im niższy, tym lepsza kontrola motoryczna
- CV% > 10% = potrzeba więcej treningu techniki

#### TRACK — Metryki
- Czas ekscentryczny / koncentryczny (ms)
- Stosunek ecc:con
- Peak acceleration (g)
- Mean velocity estimation (m/s)
- Velocity loss (%) między seriami
- Flight time, Contact time, RSI (dla skoków)
- CV% powtarzalności
- Trend w czasie

#### Zastosowanie
- Velocity-Based Training (szybkość jako wskaźnik zmęczenia i gotowości)
- Ocena Rate of Force Development (RFD)
- Monitoring obciążenia treningowego
- Trening plyometryczny z obiektywnym feedbackiem
- Readiness testing (poranny skok CMJ vs baseline)

#### Rozwiązania techniczne — filtrowanie sygnału
- **Problem:** Przy dużych prędkościach akcelerometr generuje szum i artefakty
- **Rozwiązanie:** Moving average filter (okno 5-10 próbek), low-pass Butterworth filter
- **Próbkowanie:** DeviceMotionEvent daje ~60Hz, wystarczające do analizy ruchu
- **Kalibracja:** 3s stania w miejscu przed każdym testem — baseline grawitacji
- **Bramki czasowe:** Minimum 200ms między detekcjami ruchu (debounce) — eliminuje podwójne zliczenia
- **Adaptacyjne progi:** Czułość automatycznie dostosowana do amplitudy ruchu (normalizacja per zawodnik)

---

### 6. 🏃 AGILITY & COD (Change of Direction)

**Ten moduł jest KLUCZOWY — łączy wszystkie umiejętności: reakcję, stabilność, koordynację, dynamikę.**

#### MEASURE — Test bazowy

**Pro-Agility (5-10-5) adaptacja:**
- Telefon w ręce → start → sprint w lewo → zmiana kierunku → sprint w prawo → zmiana → powrót
- Akcelerometr mierzy: czas łączny, czas reakcji na start, przyspieszenie, decelerację przed zmianą, re-accelerację
- Porównanie z normami per sport/wiek/poziom

**T-Test adaptacja:**
- Przód → lewo → prawo → cofanie
- 4 zmiany kierunku, czas łączny + profil każdej zmiany

**Illinois Agility adaptacja:**
- Złożona ścieżka z wieloma zmianami → telefon rejestruje cały profil ruchu
- Automatyczna detekcja zmian kierunku (nagłe zmiany wektora przyspieszenia)

#### TRAIN — Tryby treningowe

**Tryb 1: 🎮 DIRECTION DASH (gra zręcznościowa)**
Ekran: Tor widziany z góry. Postać biegnie do przodu automatycznie.
- Przeszkody nadchodzą z przodu → przechyl telefon LEWO lub PRAWO żeby ominąć
- Punkty za każdą ominięta przeszkodę
- Progresja prędkości:
  - Poziom 1 "Marsz": przeszkody co 3s, wolne — nauka mechaniki
  - Poziom 2 "Jogging": co 2s, umiarkowane
  - Poziom 3 "Bieg": co 1.5s, szybkie
  - Poziom 4 "Sprint": co 1s, bardzo szybkie — wymaga prawdziwego ruchu ciałem
  - Poziom 5 "Elite": co 0.7s + fałszywe bodźce (no-go) — musisz NIE reagować na czerwone
- Typy przeszkód:
  - 🟦 Ściana (lewo/prawo) — omijanie lateralne
  - 🟥 Bramka niska — przysiad/kucnięcie (akcelerometr: ruch w dół)
  - 🟨 Bramka wysoka — podskok (akcelerometr: ruch w górę)
  - 🟩 Moneta — zbierz (przechyl w stronę monety) — bonus punkty
  - ⬛ Fałszywa przeszkoda (mignie i zniknie) — NIE reaguj (go/no-go)

**Tryb 2: 🗺️ TRAIL RUNNER (ścieżka COD)**
Ekran: Widok z góry na ścieżkę z zakrętami.
- Telefon w ręce → fizycznie poruszaj się w przestrzeni
- Akcelerometr śledzi zmiany kierunku i tempo
- Ścieżka wymusza: sprint → hamowanie → zmiana kierunku → re-start
- Każdy zakręt oceniany: czas deceleracji, kąt zmiany, czas re-acceleracji
- Score: suma ocen zakrętów + czas łączny
- Progresja: więcej zakrętów, ostrzejsze kąty, krótsze odcinki proste

**Tryb 3: 🎯 REACTIVE AGILITY**
- Ekran pokazuje kierunek w OSTATNIEJ CHWILI → musisz natychmiast zmienić kierunek ruchu
- Symulacja: piłka lecąca w jedną stronę → zawodnik reaguje
- Kluczowa różnica vs zwykła agility: element NIEPRZEWIDYWALNOŚCI
- Czas reakcji + czas zmiany kierunku = łączny czas decyzyjny
- Badania pokazują że reactive agility lepiej przewiduje performance sportowy niż planned agility

**Tryb 4: 🏆 SURVIVAL MODE**
- Przeszkody przyspieszają z czasem → jak długo przetrwasz?
- Bez końca — gra trwa aż popełnisz 3 błędy
- Leaderboard: najdłuższy czas przetrwania / najwięcej punktów
- Idealne do rywalizacji między zawodnikami

#### TRACK — Metryki COD
- Czas łączny testu (s)
- Czas reakcji na bodziec kierunkowy (ms)
- Deceleration time (ms) — jak szybko hamujesz przed zmianą
- Re-acceleration time (ms) — jak szybko ruszasz po zmianie
- COD deficit = (COD time) - (sprint time na tę samą odległość) — czysta "strata" na zmianie
- Direction preference: L vs P (czy lepiej zmieniasz w jedną stronę?)
- Trend w czasie

#### Rozwiązania techniczne — COD Detection
- **Detekcja zmiany kierunku:** Nagła zmiana znaku przyspieszenia w osi X (lateralnej)
  - Wzorzec: duże ujemne przyspieszenie (hamowanie) → pauza → duże dodatnie (re-start w nowym kierunku)
- **Filtrowanie:** Butterworth low-pass 10Hz — eliminuje trzęsienie dłoni
- **Bramki:** Minimum 300ms między detekcjami COD (ludzkie ciało nie zmieni kierunku szybciej)
- **Kalibracja orientacji:** Przed testem zawodnik trzyma telefon w neutralnej pozycji → ustalenie osi
- **Problem wibracji przy sprincie:** Median filter (okno 3-5 próbek) zamiast mean — odporny na outliers
- **Adaptacyjne progi per level:** Na niskim poziomie (marsz) wystarczy mały przechył, na wysokim (sprint) wymaga prawdziwego ruchu ciałem

---

### 7. 🧠 NEURO-MOTOR (przyszłość — Tier 2/3)

#### Dual-Task Assessment
- Wykonuj ruch (np. stabilność jednonóż) + zadanie poznawcze (licz wstecz co 7)
- Degradacja ruchu pod obciążeniem = wskaźnik rezerwy neuromotorycznej
- Fundamentalne w:
  - Return-to-play po wstrząsie mózgu
  - Sport z decyzjami pod presją (piłka nożna, koszykówka)
  - Prewencja upadków u seniorów

#### Wymaga: kamery (Tier 2) lub AI Pose (Tier 3)
- Śledzenie jakości ruchu PODCZAS zadania poznawczego
- Automatyczna detekcja degradacji wzorca ruchowego

---

## SYSTEM WYNIKÓW I PROGRESJI

### Struktura danych
```json
{
  "axs_motion_results": {
    "Jan Kowalski": {
      "reaction": [
        {"date":"2026-04-08", "mode":"simple", "avgTime":380, "bestTime":290, "worstTime":520, "accuracy":95, "trials":10}
      ],
      "stability": [
        {"date":"2026-04-08", "protocol":"single_leg_L", "stabilityIndex":72, "timeInGreen":65, "avgDeviation":3.2, "duration":30}
      ],
      "coordination": [
        {"date":"2026-04-08", "mode":"simon", "maxSequence":7, "avgMoveTime":450, "rhythmAccuracy":null}
      ],
      "symmetry": [
        {"date":"2026-04-08", "movement":"single_leg_squat", "LSI":87, "leftPeak":1.8, "rightPeak":2.1}
      ],
      "dynamics": [
        {"date":"2026-04-08", "movement":"CMJ", "eccTime":380, "conTime":220, "peakAccel":3.2, "flightTime":480, "RSI":1.12}
      ],
      "agility": [
        {"date":"2026-04-08", "mode":"direction_dash", "level":3, "score":1250, "survivalTime":94, "avgReactionCOD":420}
      ]
    }
  }
}
```

### MOTION SCORE (0-100) — Wskaźnik ogólny

Ważona średnia z modułów (tylko tych które mają wyniki):

| Moduł | Waga | Uzasadnienie |
|-------|------|-------------|
| Reakcja | 15% | Fundament performance |
| Stabilność | 25% | Kluczowe w rehab i prewencji |
| Koordynacja | 10% | Złożoność ruchowa |
| Symetria | 25% | Najważniejsze w return-to-sport |
| Dynamika | 15% | Siła i moc |
| Agility | 10% | Aplikacja sportowa |

Wyświetlany w profilu zawodnika jako:
- Duży numer (0-100) z kolorowym pierścieniem
- Trend: ↑ poprawa / → stagnacja / ↓ regres
- Breakdown per moduł (radar chart)
- Porównywalny między zawodnikami (leaderboard)

### Normy i benchmarki
Dla każdego modułu — 5 stref:
- 🔴 < 20 percentyl: "Do poprawy"
- 🟠 20-40: "Poniżej średniej"
- 🟡 40-60: "Przeciętny"
- 🟢 60-80: "Dobry"
- 🔵 80-100: "Doskonały"

Normy zależne od: płeć, wiek, poziom aktywności, sport.
Na start: uniwersalne normy, docelowo konfigurowalne.

---

## INTEGRACJA Z ATP (Gamifikacja)

### Punkty za Motion
| Akcja | ATP | Warunek |
|-------|-----|---------|
| Wykonanie testu (MEASURE) | +10 | Minimum 5 prób |
| Sesja treningowa (TRAIN) | +15 | Minimum 30s aktywności |
| Poprawa wyniku vs poprzedni (PR) | +20 | Nowy personal best w dowolnym module |
| Nowy rekord w module | +30 | Najlepszy wynik ever |
| Motion Score wzrósł | +25 | Ogólny wskaźnik poszedł w górę |
| Agility Survival >60s | +10 | Przetrwanie w Direction Dash |
| Agility Survival >120s | +20 | Zaawansowane przetrwanie |
| Idealny Go/No-Go (0 błędów) | +15 | 100% accuracy w sesji |
| LSI > 90% | +20 | Symetria w normie |

### Odznaki Motion (w systemie osiągnięć)
- "Pierwszy test Motion" — wykonaj dowolny test
- "Błyskawica" — czas reakcji < 250ms
- "Skała" — Stability Index > 85
- "Symetria" — LSI > 95% na obu nogach
- "Sprinter" — Direction Dash level 4+
- "Survivor" — Survival mode > 120s
- "Maszyna" — CV% powtarzalności < 5%
- "Kompletny sportowiec" — Motion Score > 70

---

## PROGRESJA TRUDNOŚCI

### Poziomy uniwersalne (per moduł)

| Poziom | Nazwa | Opis | Prędkość/Trudność |
|--------|-------|------|-------------------|
| 1 | Discovery | Nauka mechaniki, wolne tempo | Spokojne, dużo czasu |
| 2 | Foundation | Budowanie bazy, umiarkowane | Komfortowe |
| 3 | Development | Progresja, wyzwanie | Wymagające |
| 4 | Performance | Zaawansowane, szybkie | Intensywne |
| 5 | Elite | Maksymalne, z dual-task | Ekstremalne |

### Auto-progresja
- System automatycznie sugeruje kolejny poziom gdy:
  - 3 sesje z rzędu na danym poziomie z wynikiem >80%
  - Lub ręcznie: trener ustawia poziom w profilu zawodnika

### Regresja (rehab)
- Jeśli wynik spada >20% vs baseline → alert dla trenera
- Sugestia: cofnij o poziom, zbadaj przyczynę
- Kluczowe w monitoringu po kontuzji

---

## INTERFEJS — Ekran aktywny

### Layout (portrait, fullscreen, zawsze ciemny)

```
┌──────────────────────────┐
│  ⏸  [Moduł / Tryb]  🔒  │  ← top bar
│                          │
│        380 ms            │  ← główna metryka (duża, centralna)
│     czas reakcji         │
│                          │
│  ┌──────────────────┐    │
│  │                  │    │  ← wizualizacja gry
│  │   ← → ↑ ↓       │    │     (tarcza/tor/sekwencja)
│  │                  │    │
│  └──────────────────┘    │
│                          │
│  Próba: 4/10    85%      │  ← progress
│  ████████░░              │
│                          │
│  PR: 340ms  Avg: 380ms   │  ← stats na żywo
└──────────────────────────┘
```

### Kolorystyka sygnałowa
- Tło: #060606 (prawie czarny)
- Metryka główna: #f2f2f2 (biały)
- Dobry wynik: #4ade80 (zielony)
- Uwaga: #fbbf24 (żółty)
- Problem: #f87171 (czerwony)
- Akcenty: #3b82f6 (niebieski — accent aplikacji)

### Ekran wyników (po zakończeniu)
- Motion Score: duży numer z pierścieniem koloru
- Podsumowanie metryki (tabela)
- Porównanie z poprzednim testem: "↑ 12% lepiej"
- Trend: mini sparkline (ostatnie 10 wyników)
- Przyciski: "🔄 Powtórz" | "📊 Historia" | "🏠 Zamknij"

---

## ETAPY BUDOWANIA

### Etap 1 — Fundament + Reakcja (PIERWSZY)
- Zakładka Motion w nawigacji
- Ekran ustawień (wybór modułu, poziomu, zawodnika)
- Moduł Reakcja: prosty czas reakcji + Go/No-Go
- Zapis wyników do axs_motion_results
- ATP za motion

### Etap 2 — Stabilność
- Tarcza stabilności z real-time feedback
- Porównanie L vs P
- Stability Index

### Etap 3 — Agility / COD
- Direction Dash (gra z przeszkodami)
- Survival Mode
- COD metrics

### Etap 4 — Dynamika
- Profil ruchu (ecc/con)
- VBT-lite
- RSI (skoki)

### Etap 5 — Koordynacja + Symetria
- Simon Says ruchowy
- Bilateral assessment
- LSI

### Etap 6 — Motion Score + Dashboard
- Wskaźnik ogólny
- Radar chart
- Porównania / leaderboard
- Eksport raportów

### Etap 7 — Kamera + AI Pose (przyszłość)
- Motion detection (Tier 2)
- MediaPipe Pose (Tier 3)
- Neuro-Motor dual-task

---

## NOTATKI TECHNICZNE

### Akcelerometr — API
```javascript
// Inicjalizacja z obsługą iOS permission
function initMotion(callback) {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(function(response) {
      if (response === 'granted') {
        window.addEventListener('devicemotion', callback);
      }
    });
  } else {
    window.addEventListener('devicemotion', callback);
  }
}

// Dane z akcelerometru (~60Hz)
function onMotion(e) {
  var acc = e.accelerationIncludingGravity;
  var rot = e.rotationRate;
  // acc.x, acc.y, acc.z — przyspieszenie w m/s²
  // rot.alpha, rot.beta, rot.gamma — prędkość obrotowa °/s
}
```

### Filtrowanie sygnału
```javascript
// Low-pass filter (eliminuje szum)
function lowPass(current, previous, alpha) {
  return previous + alpha * (current - previous);
  // alpha = 0.1 (agresywny) do 0.8 (delikatny)
}

// Moving average (wygładza)
function movingAvg(buffer, newVal, windowSize) {
  buffer.push(newVal);
  if (buffer.length > windowSize) buffer.shift();
  return buffer.reduce((a,b) => a+b, 0) / buffer.length;
}

// Median filter (odporny na outliers — idealny przy sprincie)
function medianFilter(buffer, newVal, windowSize) {
  buffer.push(newVal);
  if (buffer.length > windowSize) buffer.shift();
  var sorted = buffer.slice().sort((a,b) => a-b);
  return sorted[Math.floor(sorted.length/2)];
}
```

### Detekcja zdarzeń
```javascript
// Skok: nagłe przyspieszenie w osi Y > próg
// Przysiad: Y spada poniżej progu (w dół) → wraca (w górę)
// COD: zmiana znaku przyspieszenia w osi X + amplituda > próg
// Stabilność: odchylenie standardowe acc w oknie 1s < próg = stabilny
```

### Performance
- requestAnimationFrame dla wizualizacji (60fps)
- Osobny interval (100ms) dla logiki detekcji
- Nie renderuj DOM przy każdym odczycie — batch updates
- Canvas dla wizualizacji gier (nie DOM elements)
- Audio: Web Audio API (pre-loaded buffers, zero latency)

---

*Dokument wizji v1.0 — AthletiX Motion*
*Sigma AthletiX — Elevate Your Game ⚡*
