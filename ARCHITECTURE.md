# AthletiX — Architektura i plan implementacji

## Stan obecny
- Jeden plik HTML (3800+ linii) — CSS + HTML + JS inline
- Dane w localStorage — ryzyko utraty
- Brak backendu — brak sync, brak konta, brak apki klienta
- Brak systemu licencji

## Cel
- Apka trenera + apka klienta
- Backend z logowaniem i synchronizacją
- Gotowość do sprzedaży
- Jak najmniej błędów przy migracji

---

## KROK 1 — Podział na moduły (1 dzień)

Rozbijamy monolityczny plik na logiczne części:

```
athletix/
├── index.html              ← Trener (shell HTML)
├── client.html             ← Klient (shell HTML)
├── css/
│   └── app.css             ← Cały CSS (jeden plik, oba motywy)
├── js/
│   ├── core.js             ← el(), audio, confetti, undo, theme, wake lock, fullscreen, lock screen
│   ├── timers.js           ← Tempo + Reactive (z Balance) + Interwały (z presetami)
│   ├── athletes.js         ← CRM, profil, statusy, kontuzje, grupy, athlete bar
│   ├── wallet.js           ← Skarbiec, pakiety, punkty mocy, odwołania, transakcje
│   ├── diary.js            ← Notatnik, kalendarz, widok dnia, raporty
│   ├── tests.js            ← Testy, wykresy, porównania, custom testy
│   ├── data.js             ← Eksport/import, backup, undo/redo system
│   ├── storage.js          ← Warstwa abstrakcji: localStorage teraz → Supabase potem
│   └── client-app.js       ← Logika apki klienta (readonly widok)
├── manifest.json
├── sw.js
└── icons/
```

**Kluczowe:** `storage.js` to warstwa pośrednia. Teraz zapisuje do localStorage, ale jeden zamień i działa z Supabase. Reszta kodu nie musi wiedzieć skąd dane przychodzą.

```javascript
// storage.js — interfejs
const Storage = {
  async getAthletes() { ... },
  async saveAthletes(data) { ... },
  async getSessions() { ... },
  // etc.
};
```

---

## KROK 2 — Backend z Supabase (1-2 dni)

**Dlaczego Supabase a nie Firebase:**
- Open source (nie lock-in)
- PostgreSQL (prawdziwa baza danych)
- Darmowy tier: 500MB DB, 1GB storage, 50K MAU
- Auth wbudowany (email, magic link, Google)
- Real-time subscriptions (sync między urządzeniami)
- Hosting na Vercel/Netlify za darmo

**Co robimy:**
1. Konto na supabase.com (5 min)
2. Tabele: `trainers`, `athletes`, `sessions`, `test_results`, `transactions`, `notes`
3. Row Level Security — trener widzi tylko swoich zawodników
4. Auth — rejestracja/login trenera
5. Podmieniamy `storage.js` z localStorage na Supabase client

**Schemat bazy:**
```
trainers
  id, email, name, settings_json, created_at

athletes (trainer_id → trainers.id)
  id, trainer_id, name, notes, status, injury_json, wallet_json, tags, ...

notes (athlete_id → athletes.id)
  id, athlete_id, date, text, type, time

test_results (athlete_id → athletes.id)  
  id, athlete_id, date, category, test_name, value, unit, note

sessions (athlete_id → athletes.id)
  id, athlete_id, date, mode, params_json, intervals_json, label

transactions (athlete_id → athletes.id)
  id, athlete_id, date, type, amount, note, pair_id

event_log (athlete_id → athletes.id)
  id, athlete_id, date, time, text
```

**Tryb offline:**
- Apka zapisuje do localStorage jak teraz (cache)
- Przy połączeniu z internetem → sync do Supabase
- Konflikt → wygrywa nowsza wersja (last-write-wins)

---

## KROK 3 — Apka klienta (1 dzień)

`client.html` — osobna apka, współdzieli `css/app.css` i wybrane moduły JS.

**Co klient widzi:**
- Tempo / Reactive / Interwały (pełna funkcjonalność)
- Swój profil (readonly)
- Skarbiec: saldo, historia wejść, punkty mocy
- Wyniki testów z wykresami postępu
- Komunikaty od trenera (odwołania, punkty mocy, notatki)

**Czego klient NIE widzi:**
- Innych klientów
- Panelu CRM trenera
- Opcji edycji danych (readonly)

**Logowanie klienta:**
- Trener generuje PIN / link zaproszeniowy
- Klient otwiera link → wpisuje PIN → widzi swoje dane
- Supabase Auth z ograniczonymi uprawnieniami (read-only na swoich danych)

---

## KROK 4 — System licencji (0.5 dnia)

**Model:**
- Trener kupuje licencję (miesięczna/roczna)
- Klient nie płaci — dostęp przez trenera
- Trial 14 dni bez karty

**Implementacja:**
- Tabela `licenses` w Supabase: `trainer_id, plan, valid_until, trial_start`
- Middleware sprawdza licencję przy każdym zalogowaniu
- Wygasła → ekran "Odnów licencję" (blokuje CRM, nie blokuje timerów — żeby klient mógł trenować)

---

## Harmonogram

| Dzień | Co robimy | Efekt |
|-------|-----------|-------|
| 1 | Podział na moduły + storage.js | Czysty kod, łatwy rozwój |
| 2 | Supabase setup + auth + tabele | Backend działa |
| 3 | Podmiana storage.js na Supabase | Dane w chmurze |
| 4 | Apka klienta (client.html) | Klient widzi swoje dane |
| 5 | System licencji + deploy | Gotowe do sprzedaży |

**Total: 5 dni roboczych**

---

## Co NIE zmieniamy
- Wygląd i UX — zostaje identyczny
- Timery — kod bez zmian
- Flow trener → zawodnik → skarbiec — bez zmian
- localStorage jako cache offline — zostaje równolegle z Supabase

## Ryzyka
- **Migracja z monolitu** — główne ryzyko. Minimalizujemy: testujemy każdy moduł osobno
- **Offline sync** — conflict resolution. Minimalizujemy: last-write-wins + event log
- **Supabase downtime** — apka działa offline z localStorage, sync gdy wróci

## Kolejność priorytetów
1. Podział na moduły (fundamenty)
2. Backend (bezpieczeństwo danych)  
3. Auth + licencje (monetyzacja)
4. Apka klienta (wartość dodana)
