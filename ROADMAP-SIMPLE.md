# AthletiX App Simple — Roadmap do sprzedaży i dalszego rozwoju

**Autor:** Paweł Łydek  
**Data:** 2026-04-05  
**Cel:** Szybkie wejście na rynek z wersją Simple, równoległy rozwój wersji pełnej

---

## FAZA 1 — Gotowość do sprzedaży (MUST-HAVE)

### 1.1 PWA — instalacja jak aplikacja
- [ ] `manifest.json` — nazwa, ikony (192px, 512px), kolory, display: standalone
- [ ] `icon.svg` / `icon-192.png` / `icon-512.png` — ikona aplikacji
- [ ] Service Worker — cache offline (app shell + Google Fonts)
- [ ] Splash screen przy instalacji (iOS + Android)
- [ ] Testowanie: instalacja z Safari (iOS) i Chrome (Android)

### 1.2 Eksport / Import danych
- [ ] Przycisk "Eksportuj dane" → pobiera plik JSON ze WSZYSTKIMI kluczami `axs_*` i `cts_v5`
- [ ] Przycisk "Importuj dane" → wczytuje plik JSON i przywraca dane
- [ ] Potwierdzenie przed importem ("Czy na pewno? Obecne dane zostaną nadpisane")
- [ ] Umieścić w ustawieniach / stopce aplikacji

### 1.3 Branding i informacje
- [x] Header: "AthletiXApp Simple by Sigma AthletiX" — widoczny w obu motywach
- [ ] Ekran "O aplikacji" — wersja, autor, kontakt, link do regulaminu
- [ ] Stopka z wersją (np. "v1.0") w go-row
- [ ] Splash / welcome screen przy pierwszym uruchomieniu (opcjonalnie)

### 1.4 Testowanie UX na urządzeniach mobilnych
- [ ] iOS Safari — wszystkie timery, fullscreen, wake lock, instalacja PWA
- [ ] Android Chrome — j.w.
- [ ] Motyw jasny — przejrzeć WSZYSTKIE ekrany, poprawić kontrast
- [ ] Edge case'y: brak zawodników, pusta sesja, bardzo długie nazwy, 20+ wpisów w dniu
- [ ] Testowanie offline po zainstalowaniu PWA

### 1.5 System licencji (opcjonalnie przed sprzedażą)
- [ ] Prosty klucz aktywacyjny w localStorage
- [ ] Ekran aktywacji przy pierwszym uruchomieniu
- [ ] Blokada po wygaśnięciu (np. trial 14 dni → wymaga klucza)

---

## FAZA 2 — Backend i bezpieczeństwo danych

### 2.1 Model backendu
- [ ] Wybór technologii: Firebase / Supabase / własny serwer
- [ ] Konto trenera (rejestracja, logowanie)
- [ ] Automatyczna synchronizacja danych trener → chmura
- [ ] Backup / restore z chmury
- [ ] Możliwość pracy offline z sync przy połączeniu

### 2.2 Bezpieczeństwo danych
- [ ] Szyfrowanie danych wrażliwych (dane zawodników)
- [ ] RODO — informacja o przetwarzaniu, zgoda, prawo do usunięcia
- [ ] Regulamin i polityka prywatności

---

## FAZA 3 — Mikro CRM dla trenera

### 3.1 Rozszerzenie zarządzania zawodnikami
- [ ] Historia współpracy (timeline)
- [ ] Przypomnienia: follow-up po przerwie, urodziny, rocznica współpracy
- [ ] Notatki per sesja (powiązane z datą i ćwiczeniem)
- [ ] Statystyki: frekwencja, regularność, najczęstsze ćwiczenia
- [ ] Tagowanie i filtrowanie (grupy, dyscypliny, statusy)

### 3.2 Rozliczenia / skarbiec
- [ ] System punktów/kredytów per zawodnik
- [ ] Trener dodaje punkty (= wpłata klienta, np. 1 punkt = 1 zł)
- [ ] Wejście na sesję = odjęcie punktów ze skarbca
- [ ] Widok salda: ile pozostało, historia transakcji
- [ ] Alerty: niski stan punktów, brak środków

---

## FAZA 4 — Wersja dla klienta (zawodnika)

### 4.1 Aplikacja klienta — zakres funkcji
- [ ] Dostęp do: Tempo, Reactive (Kolory/Strzałki/Balance), Interwały
- [ ] Widok odbytych sesji z trenerem (historia, daty, co było robione)
- [ ] Skarbiec: aktualny stan punktów, historia wpłat i wejść
- [ ] System motywacyjny:
  - Trener oznacza wejście → klient widzi: -X punktów ze skarbca
  - Klient zyskuje: +10 punktów mocy za każde wejście
  - Punkty mocy = osobna waluta motywacyjna (rankingi, odznaki, streak)

### 4.2 Logowanie klienta
- [ ] Link / kod QR od trenera → otwiera profil klienta
- [ ] Prosty PIN lub logowanie przez link
- [ ] Klient NIE widzi danych innych klientów

### 4.3 Elementy motywacyjne
- [ ] Streak: ile sesji z rzędu (tygodniowo)
- [ ] Odznaki: za 10/25/50/100 sesji, za regularność, za PR-y
- [ ] Ranking punktów mocy (opcjonalnie — między klientami jednego trenera)
- [ ] Powiadomienia push: "Nie było Cię 5 dni — wracaj!"

---

## FAZA 5 — Rozwój wersji pełnej (athletixapp-v2)

### 5.1 Przeniesienie nowych ficzerów
- [ ] Balance mode → wersja pełna
- [ ] Nowy system statusów (kontuzja niezależna) → wersja pełna
- [ ] Raport per zawodnik per dzień → wersja pełna

### 5.2 Ficzery tylko w wersji pełnej
- [ ] Pełny dziennik treningowy (serie, ciężary, RPE, velocity tracking)
- [ ] Biblioteka testów z dual-metric, bilateral, trials
- [ ] Super serie (drag & drop)
- [ ] Planowanie treningów (zakładka Plany)
- [ ] Eksport PDF z zaawansowanymi statystykami

---

## Priorytety

| # | Co | Wysiłek | Wpływ na sprzedaż |
|---|----|---------|--------------------|
| 1 | PWA (manifest + SW) | Średni | KRYTYCZNY — bez tego to "strona", nie "apka" |
| 2 | Eksport/Import danych | Mały | KRYTYCZNY — utrata danych = utrata klienta |
| 3 | Testy mobilne + poprawki UX | Średni | Wysoki — pierwsze wrażenie decyduje |
| 4 | Backend + sync | Duży | Wysoki — ale może być w v1.1 |
| 5 | System licencji | Mały | Średni — zabezpieczenie przychodów |
| 6 | Mikro CRM | Duży | Średni — buduje wartość długoterminową |
| 7 | Wersja klienta | Duży | Średni — otwiera nowy kanał |
