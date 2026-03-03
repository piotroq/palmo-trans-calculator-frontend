# PALMO-TRANS Calculator — Phase 3: Integracja Step 2 (Sendung) + Sidebar

## Nowe pliki (4 pliki)

Z archiwum `palmo-phase3-step2-sendung.tar.gz` skopiuj do repo frontend:

| Plik | Lokalizacja | Status |
|------|------------|--------|
| `WizardLayout.tsx` | `src/components/wizard/` | **NADPISZ** istniejący |
| `WizardSidebar.tsx` | `src/components/wizard/` | **NOWY** |
| `StepSendung.tsx` | `src/components/wizard/steps/` | **NOWY** |
| `PackageForm.tsx` | `src/components/shipment/` | **NOWY** |

## Co się zmieniło

### WizardLayout.tsx (NADPISANY)
- **Dodany sidebar**: od kroku 2 layout zmienia się na `grid-cols-[1fr,340px]`
- **Step 1** = pełna szerokość (jak było)
- **Steps 2-6** = content + sidebar Übersicht
- **Dodany import** `StepSendung` i `WizardSidebar`
- `max-w-3xl` → `max-w-5xl` gdy sidebar aktywny

### WizardSidebar.tsx (NOWY)
- Panel Übersicht po prawej stronie (sticky)
- Sekcje: Abholung, Zustellung, Sendung, Zusatzservices, Fahrzeugtyp, Gesamtsumme
- Każda sekcja z "Bearbeiten" linkiem wracającym do kroku
- CTA button na górze sidebara ("Weiter zur Abholung" itp.)
- Gesamtsumme z ceną na żywo

### StepSendung.tsx (NOWY)
- Multi-package form z "+ Weitere Sendung"
- Walidacja: weight > 0, wymiary > 0, quantity >= 1
- Gesamtgewicht display
- "Weitere Infos" textarea
- Auto-dodaje pierwszy pakiet jeśli lista pusta

### PackageForm.tsx (NOWY)
- Kategorie dropdown (Palette/Dokument/Paket/Fahrzeug/Gitterbox/Sonstige)
- Zmiana kategorii → auto-wypełnia domyślne wymiary/wagę
- Anzahl z −/+ buttonami
- Stapelbar toggle switch
- Gewicht, Länge, Breite, Höhe z ikonami i ✓ po walidacji
- Tabs: Sendung | Verbotene Güter
- Trash icon do usuwania (min. 1 pakiet)

## Komendy

```bash
# 1. Rozpakuj
tar xzf palmo-phase3-step2-sendung.tar.gz

# 2. Skopiuj (nadpisz WizardLayout!)
cp frontend/src/components/wizard/WizardLayout.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/wizard/

cp frontend/src/components/wizard/WizardSidebar.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/wizard/

cp frontend/src/components/wizard/steps/StepSendung.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/wizard/steps/

mkdir -p ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/shipment
cp frontend/src/components/shipment/PackageForm.tsx \
   ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/components/shipment/

# 3. Uruchom
cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
npm run dev
```

## Weryfikacja

Po uruchomieniu sprawdź:

1. ✅ Step 1 działa jak wcześniej (pełna szerokość, bez sidebara)
2. ✅ Klik "Weiter zur Sendung" → przejście do Step 2
3. ✅ Layout zmienia się na 2-kolumnowy (form + sidebar)
4. ✅ Packstück 1 z domyślnymi wartościami Palette (120x80x100, 100kg)
5. ✅ Zmiana kategorii → auto-zmiana wymiarów
6. ✅ −/+ przyciski Anzahl działają
7. ✅ Stapelbar toggle animacja
8. ✅ "+ Weitere Sendung" dodaje Packstück 2
9. ✅ Trash icon na Packstück 2 (nie na jedynym)
10. ✅ Sidebar Übersicht pokazuje dane z kroku 1 + bieżącą przesyłkę
11. ✅ "Bearbeiten" wraca do odpowiedniego kroku
12. ✅ Gesamtsumme w sidebarze

## Znane potencjalne problemy

1. **Import path StepSendung** — plik jest w `steps/`, więc importy wewnątrz używają `../../../store/` (3 poziomy). Sprawdź!
2. **vehicleData import w WizardSidebar** — import z `../vehicles/vehicleData` musi istnieć
3. **crypto.randomUUID()** — wymaga HTTPS lub localhost (działa na Vite dev server)
