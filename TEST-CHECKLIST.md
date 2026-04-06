# AthletiX Simple — Lista funkcji do przetestowania

**Ostatnia aktualizacja:** 2026-04-06

## ❌ Nieprzetestowane (wymagają testów)

### Konto / Auth
- [ ] Zmiana emaila — czy link potwierdzający przychodzi i działa
- [ ] Zmiana nazwy — czy zapisuje się w Supabase i wyświetla po relogu
- [ ] Zmiana hasła — czy nowe hasło działa po wylogowaniu
- [ ] Sesja logowania — czy po zamknięciu i otwarciu apki użytkownik jest nadal zalogowany
- [ ] Rejestracja nowego konta — pełny flow od zera

### Sync / Dane
- [ ] Logowanie na nowym urządzeniu — czy dane ściągają się z chmury
- [ ] Sync po dodaniu zawodnika — czy pojawia się w Supabase
- [ ] Sync planów — czy plany syncują się do chmury
- [ ] Eksport danych — czy plik JSON zawiera wszystkie dane
- [ ] Import danych — czy przywraca wszystko poprawnie
- [ ] Bezpieczeństwo: logowanie z pustym localStorage — czy NIE nadpisuje chmury

### Timery
- [ ] EMOM pauza/resume — czy ring kontynuuje poprawnie (naprawione, wymaga testu)
- [ ] Custom interval pauza/resume
- [ ] Stoper countdown pauza/resume
- [ ] Stoper count-up pauza/resume
- [ ] Tempo pauza/resume
- [ ] Reactive z interwałami — praca/przerwa
- [ ] Balance — wszystkie tryby (lr, ud, 2d, zoom, 3d)
- [ ] Dźwięki: metronom, głos, sygnały — czy działają na telefonie

### Sesja / Notatnik
- [ ] Zapis notatki treningowej pod wybraną datą (wstecz)
- [ ] Zapis testu — czy trafia do wykresów i do notatki dnia
- [ ] Realizacja planu — otwarcie, edycja, "zapisz na dziś i zamknij"
- [ ] Wielokrotne zapisanie planu w tym samym dniu — czy nadpisuje a nie duplikuje
- [ ] Raport dnia — wydruk per zawodnik
- [ ] Kalendarz — kropki przy dniach z wpisami

### Zawodnicy / CRM
- [ ] Skarbiec — doładowanie pakietem, odbicie wejścia, punkty mocy
- [ ] Odwołanie — pełne, częściowe, bez naliczenia
- [ ] Usunięcie transakcji z historii — czy cofa saldo
- [ ] Kontuzja — zgłoszenie, rozwiązanie
- [ ] Status — przerwa z datami, zakończenie współpracy, powrót do aktywny
- [ ] Profil — edycja danych, tagi, grupy
- [ ] Wykresy testów — czy rysują się poprawnie, porównanie dwóch testów

### Plany
- [ ] Tworzenie planu z zakładki Plany
- [ ] Realizacja planu z profilu zawodnika
- [ ] Realizacja planu z zakładki Sesja (przycisk "Wybierz plan")
- [ ] Archiwizacja planu
- [ ] Przywrócenie planu z archiwum
- [ ] Plan w rozwiniętym widoku zawodnika na liście

### UI / Mobile
- [ ] iPhone PWA — czy header jest widoczny pod notchem
- [ ] iPhone PWA — dolna przestrzeń (znany problem, do rozwiązania później)
- [ ] Motyw jasny — kontrast wszystkich elementów
- [ ] Motyw ciemny — czytelność
- [ ] Przesuwanie na boki — nie powinno się da

## ✅ Przetestowane i działające
- [x] Logowanie email + hasło
- [x] Wylogowanie z potwierdzeniem i opcją backupu
- [x] EMOM pauza/resume — ring naprawiony
- [x] Emoji testów 📈 zamiast 🧪
- [x] Podgląd hasła na ekranie logowania (👁)
- [x] Undo/redo z dropdown w headerze

---
**Przypomnienie:** Przed każdym pokazem partnerom/klientom — przejdź przez tę listę!
