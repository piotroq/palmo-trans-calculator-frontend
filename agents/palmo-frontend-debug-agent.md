# PALMO-TRANS Frontend Debug & Fix Agent
# Plik: palmo-frontend-debug-agent.md
# Wersja: 1.0
# Użycie: qwen run --agent-file palmo-frontend-debug-agent.md
# Model: Qwen3-Coder (extended thinking)

---

## AGENT IDENTITY

```yaml
name: palmo-frontend-debugger
version: "1.0"
description: |
  Autonomiczny agent do debugowania, testowania i naprawiania błędów
  w projekcie palmo-trans-calculator-frontend (React + TypeScript + Vite).
  Działa iteracyjnie aż wszystkie testy przejdą.
model: qwen3-coder
thinking: extended
max_iterations: 25
auto_approve: true
```

---

## CONTEXT

```yaml
project:
  name: palmo-trans-calculator-frontend
  repo: https://github.com/piotroq/palmo-trans-calculator-frontend
  stack:
    - React 18
    - TypeScript 5
    - Vite 5
    - Zustand (state management)
    - Tailwind CSS
    - Google Maps API
    - PayPal React SDK
  related_repos:
    backend: https://github.com/piotroq/palmo-trans-calculator-backend
  local_path: ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
  backend_path: ~/Documents/GitHub/strony/palmo-trans-calculator-backend
  brand:
    primary_color: "#FFD700"
    background: "#1A1A1A"
    fonts: ["Barlow Condensed", "Inter"]

environment:
  frontend_port: 5173
  backend_port: 5000
  wordpress_port: 8088
  node_required: ">=18"

state_file: /tmp/palmo-frontend-agent-state.env
log_file: /tmp/palmo-frontend-agent.log
results_file: /tmp/palmo-frontend-results.json
report_file: /tmp/palmo-frontend-report.md
```

---

## TOOLS

```yaml
allowed_tools:
  - bash          # Wykonywanie komend, npm, git
  - read_file     # Czytanie plików projektu
  - write_file    # Zapis nowych/zmodyfikowanych plików
  - edit_file     # Edycja istniejących plików (patch)
  - search_files  # Przeszukiwanie kodu (grep/find)
  - web_fetch     # Pobieranie dokumentacji online
  - web_search    # Wyszukiwanie rozwiązań błędów
```

---

## EXECUTION PHASES

Agent wykonuje fazy w kolejności. Każda faza musi być oznaczona PASS/FAIL.
Przy FAIL — agent iteruje aż do rozwiązania (max 5 prób per faza).

### PHASE_0: pre_flight
```yaml
description: Sprawdzenie środowiska, klonowanie, instalacja zależności
steps:
  - id: check_node
    command: node --version
    expect: "v1[89]|v2[0-9]"
    on_fail:
      message: "Node.js >= 18 wymagany"
      fix: "nvm install 18 && nvm use 18"

  - id: clone_or_pull
    commands:
      - |
        if [ -d ~/Documents/GitHub/strony/palmo-trans-calculator-frontend ]; then
          cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
          git pull origin main 2>/dev/null || git pull origin master
        else
          cd ~/Documents/GitHub/strony
          git clone https://github.com/piotroq/palmo-trans-calculator-frontend.git
        fi

  - id: npm_install
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      npm install 2>&1 | tee /tmp/palmo-npm-install.log
      tail -5 /tmp/palmo-npm-install.log
    expect_no: "npm ERR!"
    on_fail:
      fix: "npm install --legacy-peer-deps"

  - id: setup_env
    description: Utwórz .env.local jeśli nie istnieje
    command: |
      ENV_FILE=~/Documents/GitHub/strony/palmo-trans-calculator-frontend/.env.local
      if [ ! -f "$ENV_FILE" ]; then
        # Sprawdź .env.example
        if [ -f "${ENV_FILE%.local}.example" ]; then
          cp "${ENV_FILE%.local}.example" "$ENV_FILE"
          echo "✅ Skopiowano .env.example → .env.local"
        else
          cat > "$ENV_FILE" << 'ENVEOF'
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=REPLACE_WITH_YOUR_KEY
VITE_PAYPAL_CLIENT_ID=REPLACE_WITH_YOUR_CLIENT_ID
VITE_WP_API_URL=http://localhost:8088
VITE_APP_ENV=development
ENVEOF
          echo "✅ Utworzono .env.local z domyślnymi wartościami"
        fi
      else
        echo "✅ .env.local już istnieje"
      fi
      cat "$ENV_FILE"
```

### PHASE_1: static_analysis
```yaml
description: TypeScript + ESLint analiza statyczna
max_retry: 3
steps:
  - id: typescript_check
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      npx tsc --noEmit 2>&1 | tee /tmp/palmo-tsc-frontend.txt
      ERRORS=$(grep "error TS" /tmp/palmo-tsc-frontend.txt | wc -l)
      echo "TypeScript errors: $ERRORS"
      cat /tmp/palmo-tsc-frontend.txt
    success_condition: "TypeScript errors: 0"
    on_fail:
      action: auto_fix
      strategy: |
        1. Przeczytaj /tmp/palmo-tsc-frontend.txt
        2. Pogrupuj błędy według pliku
        3. Napraw każdy błąd TypeScript w kodzie
        4. Najczęstsze naprawy:
           - Brak ImportMetaEnv → dodaj src/vite-env.d.ts
           - Cannot find module → npm install brakujący pakiet
           - implicit any → dodaj explicit type annotation
           - null/undefined → dodaj null check lub optional chaining
        5. Po naprawie uruchom tsc --noEmit ponownie

  - id: eslint_check
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      # Sprawdź czy jest konfiguracja eslint
      if [ -f .eslintrc.js ] || [ -f .eslintrc.json ] || [ -f eslint.config.js ] || \
         [ -f eslint.config.ts ] || [ -f eslint.config.mjs ]; then
        npx eslint src/ --ext .ts,.tsx 2>&1 | tee /tmp/palmo-eslint.txt
        npx eslint src/ --ext .ts,.tsx --fix 2>/dev/null
        echo "ESLint auto-fix applied"
      else
        echo "⚠️  Brak konfiguracji ESLint — skip"
      fi

  - id: find_hardcoded_urls
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      echo "=== Hardcoded URLs (potential issues) ==="
      grep -rn "http://localhost\|http://127.0.0.1" src/ \
        --include="*.ts" --include="*.tsx" 2>/dev/null | \
        grep -v "//.*comment\|vite-env\|test\|spec" || echo "Brak hardcoded localhost URLs"
    action_on_found: |
      Zastąp hardcoded URLs zmiennymi env:
      - 'http://localhost:5000/api' → import.meta.env.VITE_API_URL
      - 'http://localhost:8088' → import.meta.env.VITE_WP_API_URL
```

### PHASE_2: dev_server
```yaml
description: Uruchomienie npm run dev i weryfikacja
max_retry: 5
steps:
  - id: kill_existing
    command: |
      # Zabij istniejące procesy na porcie 5173
      lsof -ti :5173 | xargs kill -9 2>/dev/null || true
      sleep 1
      echo "Port 5173 zwolniony"

  - id: start_dev_server
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      npm run dev > /tmp/palmo-frontend-dev.log 2>&1 &
      echo $! > /tmp/palmo-frontend-pid.txt
      echo "Dev server uruchomiony, PID: $(cat /tmp/palmo-frontend-pid.txt)"
      sleep 5
      cat /tmp/palmo-frontend-dev.log

  - id: verify_dev_server
    command: |
      HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null)
      echo "HTTP status: $HTTP_STATUS"
      if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Dev server działa na http://localhost:5173/"
      else
        echo "❌ Dev server nie odpowiada (HTTP $HTTP_STATUS)"
        cat /tmp/palmo-frontend-dev.log | tail -20
        exit 1
      fi
    on_fail:
      diagnostics:
        - "cat /tmp/palmo-frontend-dev.log"
        - "lsof -i :5173"
      possible_fixes:
        port_conflict: "Zmień port w vite.config.ts: server: { port: 5174 }"
        missing_dependency: "npm install brakujący_pakiet"
        env_error: "Sprawdź .env.local — uzupełnij brakujące zmienne"
        vite_not_installed: "npm install --save-dev vite @vitejs/plugin-react"

  - id: check_browser_errors
    command: |
      # Użyj playwright jeśli dostępny
      if command -v npx playwright &>/dev/null; then
        npx playwright install chromium --quiet 2>/dev/null || true
        cat > /tmp/palmo-check-errors.mjs << 'JSEOF'
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
const warnings = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push('[ERROR] ' + msg.text());
  if (msg.type() === 'warning') warnings.push('[WARN] ' + msg.text());
});
page.on('pageerror', err => errors.push('[PAGE_ERROR] ' + err.message));
page.on('requestfailed', req => errors.push('[NET_FAIL] ' + req.url() + ' - ' + req.failure()?.errorText));
try {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
} catch(e) {
  errors.push('[TIMEOUT] ' + e.message);
}
await page.screenshot({ path: '/tmp/palmo-screenshot-initial.png' });
console.log('=== BŁĘDY KONSOLI ===');
errors.forEach(e => console.log(e));
console.log('=== OSTRZEŻENIA ===');
warnings.slice(0,5).forEach(w => console.log(w));
console.log('TOTAL_ERRORS=' + errors.length);
await browser.close();
JSEOF
        node /tmp/palmo-check-errors.mjs 2>&1 | tee /tmp/palmo-browser-errors.txt
      else
        echo "⚠️  Playwright niedostępny — instaluję..."
        npm install -D playwright @playwright/test 2>/dev/null
        echo "Spróbuj ponownie po instalacji"
      fi
    on_errors_found:
      action: |
        Przeanalizuj każdy błąd z /tmp/palmo-browser-errors.txt i napraw:
        - CORS error → dodaj proxy w vite.config.ts lub napraw backend CORS
        - Module not found → npm install brakujący pakiet
        - undefined is not a function → sprawdź typy i null checks
        - Failed to fetch → sprawdź URL API w .env.local i czy backend działa
        - PayPal error → sprawdź VITE_PAYPAL_CLIENT_ID
        - Maps error → sprawdź VITE_GOOGLE_MAPS_API_KEY lub przenieś na backend
```

### PHASE_3: build_test
```yaml
description: Production build — weryfikacja że kod można zbudować
steps:
  - id: production_build
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      npm run build 2>&1 | tee /tmp/palmo-build.log
      echo "BUILD_EXIT=$?" >> /tmp/palmo-frontend-state.env
    success_condition: "dist directory exists"
    verify: "ls dist/index.html"
    on_fail:
      action: |
        Przeczytaj /tmp/palmo-build.log i napraw błędy build:
        - Najczęstsze przyczyny build failure:
          a) TypeScript strict mode errors (nie wykryte w dev)
          b) Dynamic import z błędnym path
          c) Tree-shaking usuwający potrzebny kod
          d) Missing type declarations dla zewnętrznych pakietów

  - id: bundle_analysis
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      if [ -d dist ]; then
        echo "=== Bundle sizes ==="
        ls -lh dist/assets/*.js 2>/dev/null | sort -k5 -h -r | head -10
        echo ""
        echo "Total dist size: $(du -sh dist/ 2>/dev/null | cut -f1)"
        
        # Ostrzeżenie przy dużym bundlu
        TOTAL=$(du -sk dist/ 2>/dev/null | cut -f1)
        if [ "$TOTAL" -gt 2000 ]; then
          echo "⚠️  Bundle > 2MB — rozważ code splitting"
        fi
      fi
```

### PHASE_4: unit_tests
```yaml
description: Uruchomienie testów jednostkowych
steps:
  - id: detect_test_framework
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      if grep -q '"vitest"' package.json 2>/dev/null; then
        echo "TEST_FRAMEWORK=vitest"
      elif grep -q '"jest"' package.json 2>/dev/null; then
        echo "TEST_FRAMEWORK=jest"
      else
        echo "TEST_FRAMEWORK=none"
      fi
    save_output: TEST_FRAMEWORK

  - id: run_tests
    condition: "TEST_FRAMEWORK != none"
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      npm test -- --run 2>&1 | tee /tmp/palmo-unit-tests.log
      PASSED=$(grep -c "✓\|PASS\|passed" /tmp/palmo-unit-tests.log || echo 0)
      FAILED=$(grep -c "✗\|FAIL\|failed" /tmp/palmo-unit-tests.log || echo 0)
      echo "Tests passed: $PASSED, failed: $FAILED"

  - id: create_basic_tests
    condition: "TEST_FRAMEWORK == none"
    action: |
      Jeśli nie ma testów — zainstaluj vitest i utwórz podstawowe testy:
      1. npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom
      2. Dodaj do vite.config.ts: test: { environment: 'jsdom' }
      3. Utwórz src/__tests__/smoke.test.tsx z podstawowym smoke testem
```

### PHASE_5: api_integration_check
```yaml
description: Weryfikacja komunikacji frontend ↔ backend ↔ WordPress
steps:
  - id: check_backend_running
    command: |
      HEALTH=$(curl -s http://localhost:5000/api/health 2>/dev/null)
      if echo "$HEALTH" | grep -q "{"; then
        echo "✅ Backend działa: $HEALTH"
      else
        echo "⚠️  Backend nie odpowiada — próba uruchomienia..."
        if [ -d ~/Documents/GitHub/strony/palmo-trans-calculator-backend ]; then
          cd ~/Documents/GitHub/strony/palmo-trans-calculator-backend
          npm run dev > /tmp/palmo-backend.log 2>&1 &
          sleep 4
          HEALTH=$(curl -s http://localhost:5000/api/health 2>/dev/null)
          echo "Backend po uruchomieniu: $HEALTH"
        fi
      fi

  - id: test_cors
    command: |
      CORS_RESULT=$(curl -sv \
        -H "Origin: http://localhost:5173" \
        http://localhost:5000/api/health 2>&1 | \
        grep -i "access-control")
      echo "CORS headers: $CORS_RESULT"
      if echo "$CORS_RESULT" | grep -q "localhost:5173\|*"; then
        echo "✅ CORS poprawnie skonfigurowany"
      else
        echo "❌ CORS nie zawiera Origin localhost:5173"
        echo "FIX: Dodaj localhost:5173 do whitelist CORS na backendzie"
      fi

  - id: test_api_endpoints
    command: |
      BASE="http://localhost:5000/api"
      
      echo "=== Test: GET /health ==="
      curl -s -w " [HTTP %{http_code}]" "$BASE/health" | head -c 200
      echo ""

      echo "=== Test: POST /submissions (walidacja) ==="
      curl -s -w " [HTTP %{http_code}]" -X POST "$BASE/submissions" \
        -H "Content-Type: application/json" \
        -d '{}' | head -c 300
      echo ""
      
      echo "=== Test: POST /geocode ==="
      curl -s -w " [HTTP %{http_code}]" -X POST "$BASE/geocode" \
        -H "Content-Type: application/json" \
        -d '{"address":"Berlin, Germany"}' | head -c 300
      echo ""
```

### PHASE_6: cross_repo_analysis
```yaml
description: Analiza spójności między repozytoriami
steps:
  - id: compare_api_contracts
    command: |
      echo "=== FRONTEND: wywołania API ==="
      grep -rn "fetch\|\.get\|\.post\|apiUrl" \
        ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/ \
        --include="*.ts" --include="*.tsx" 2>/dev/null | \
        grep -oP "'/[a-z/]+'|\"(/api/[^\"]+)\"" | sort -u | head -20

      echo ""
      echo "=== BACKEND: zdefiniowane routes ==="
      grep -rn "router\.\|app\.get\|app\.post" \
        ~/Documents/GitHub/strony/palmo-trans-calculator-backend/src/ \
        --include="*.ts" 2>/dev/null | \
        grep -oP "'[/a-z:]+'" | sort -u | head -20

  - id: compare_types
    command: |
      echo "=== FRONTEND typy/interfaces ==="
      grep -rn "^interface\|^type\|^export interface\|^export type" \
        ~/Documents/GitHub/strony/palmo-trans-calculator-frontend/src/ \
        --include="*.ts" --include="*.tsx" 2>/dev/null | head -20

      echo ""
      echo "=== BACKEND typy/interfaces ==="
      grep -rn "^interface\|^type\|^export interface\|^export type" \
        ~/Documents/GitHub/strony/palmo-trans-calculator-backend/src/ \
        --include="*.ts" 2>/dev/null | head -20

  - id: sync_recommendations
    action: |
      Na podstawie analizy, jeśli typy są niezgodne:
      1. Utwórz src/types/api.ts w frontendzie z dokładnymi typami odpowiadającymi backendowi
      2. Dodaj komentarz // TODO: sync with backend types
      3. Zaproponuj stworzenie shared-types package jeśli niezgodności są duże
```

### PHASE_7: auto_commit
```yaml
description: Atomowe commitowanie poprawek i push
steps:
  - id: stage_and_commit
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      
      # Sprawdź co się zmieniło
      echo "=== Changed files ==="
      git diff --name-only
      git diff --staged --name-only
      
      # Commit poprawek TypeScript
      TSC_FILES=$(git diff --name-only | grep -E "\.ts$|\.tsx$" | head -20)
      if [ -n "$TSC_FILES" ]; then
        git add $TSC_FILES
        git commit -m "fix(types): resolve TypeScript errors in frontend" 2>/dev/null || true
      fi
      
      # Commit konfiguracji
      CONFIG_FILES="vite.config.ts vite.config.js tailwind.config.ts tailwind.config.js tsconfig.json"
      for f in $CONFIG_FILES; do
        if git diff --name-only | grep -q "^$f$"; then
          git add "$f"
          git commit -m "fix(config): update $f configuration" 2>/dev/null || true
        fi
      done
      
      # Commit nowych plików
      git add src/vite-env.d.ts 2>/dev/null && \
        git commit -m "fix(env): add ImportMetaEnv type declarations" 2>/dev/null || true
      
      git add src/components/ErrorBoundary.tsx 2>/dev/null && \
        git commit -m "feat(ui): add ErrorBoundary with PALMO brand fallback" 2>/dev/null || true
      
      git add src/services/ 2>/dev/null && \
        git diff --staged --quiet || \
        git commit -m "feat(api): improve API client and service layer" 2>/dev/null || true
      
      # Commit .gitignore
      if git diff --name-only | grep -q "\.gitignore"; then
        git add .gitignore
        git commit -m "chore: update .gitignore (add .env.local)" 2>/dev/null || true
      fi

  - id: push_to_github
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      git push origin main 2>&1 || git push origin master 2>&1 || \
        echo "⚠️  Push nieudany — sprawdź uprawnienia do repo"
```

### PHASE_8: report
```yaml
description: Generowanie raportu końcowego
steps:
  - id: generate_json_results
    command: |
      python3 << 'PYEOF'
import json, subprocess, os
from datetime import datetime

def run(cmd):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
        return r.stdout.strip() + r.stderr.strip()
    except:
        return "N/A"

def http_check(url):
    try:
        r = subprocess.run(f'curl -s -o /dev/null -w "%{{http_code}}" {url}',
                          shell=True, capture_output=True, text=True, timeout=5)
        return r.stdout.strip()
    except:
        return "000"

tsc_errors = int(run("cat /tmp/palmo-tsc-frontend.txt 2>/dev/null | grep 'error TS' | wc -l") or 0)
dev_status = http_check("http://localhost:5173/")
build_ok = os.path.exists(os.path.expanduser("~/Documents/GitHub/strony/palmo-trans-calculator-frontend/dist"))
backend_status = http_check("http://localhost:5000/api/health")
browser_errors = int(run("grep -c 'ERROR\\|PAGE_ERROR' /tmp/palmo-browser-errors.txt 2>/dev/null") or 0)

results = {
    "project": "palmo-trans-calculator-frontend",
    "timestamp": datetime.now().isoformat(),
    "tests": {
        "typescript_compile": {"status": "PASS" if tsc_errors == 0 else "FAIL", "errors": tsc_errors},
        "dev_server": {"status": "PASS" if dev_status == "200" else "FAIL", "http_code": dev_status},
        "production_build": {"status": "PASS" if build_ok else "FAIL"},
        "backend_connection": {"status": "PASS" if backend_status == "200" else "WARN", "http_code": backend_status},
        "browser_console_errors": {"status": "PASS" if browser_errors == 0 else "FAIL", "count": browser_errors},
    },
    "summary": {
        "total_tests": 5,
        "passed": sum(1 for t in ["typescript_compile","dev_server","production_build","backend_connection","browser_console_errors"]
                      if results.get("tests",{}).get(t,{}).get("status") == "PASS") if False else 0,
    }
}

# Fix summary count
results["summary"]["passed"] = sum(1 for v in results["tests"].values() if v.get("status") == "PASS")
results["summary"]["failed"] = sum(1 for v in results["tests"].values() if v.get("status") == "FAIL")

with open("/tmp/palmo-frontend-results.json", "w") as f:
    json.dump(results, f, indent=2)

print(json.dumps(results, indent=2))
PYEOF

  - id: generate_markdown_report
    command: |
      cd ~/Documents/GitHub/strony/palmo-trans-calculator-frontend
      cat > /tmp/palmo-frontend-report.md << MDEOF
# PALMO-TRANS Frontend — Raport Debugowania
**Data:** $(date "+%Y-%m-%d %H:%M")
**Repozytorium:** https://github.com/piotroq/palmo-trans-calculator-frontend

## Wyniki Testów

| Test | Status | Szczegóły |
|------|--------|-----------|
| TypeScript (tsc --noEmit) | $([ $(grep "error TS" /tmp/palmo-tsc-frontend.txt 2>/dev/null | wc -l) -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL") | $(grep "error TS" /tmp/palmo-tsc-frontend.txt 2>/dev/null | wc -l) errors |
| Dev Server (:5173) | $([ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/ 2>/dev/null)" = "200" ] && echo "✅ PASS" || echo "❌ FAIL") | HTTP $(curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/ 2>/dev/null) |
| Production Build | $([ -d dist ] && echo "✅ PASS" || echo "❌ FAIL") | $([ -d dist ] && du -sh dist/ 2>/dev/null | cut -f1 || echo "N/A") |
| Backend API (:5000) | $([ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/health 2>/dev/null)" = "200" ] && echo "✅ PASS" || echo "⚠️  WARN") | $(curl -s http://localhost:5000/api/health 2>/dev/null | head -c 100) |
| Błędy konsoli (browser) | $([ "$(grep -c 'PAGE_ERROR\|ERROR' /tmp/palmo-browser-errors.txt 2>/dev/null || echo 0)" -eq 0 ] && echo "✅ PASS" || echo "❌ FAIL") | $(grep -c 'PAGE_ERROR\|ERROR' /tmp/palmo-browser-errors.txt 2>/dev/null || echo 0) errors |

## Zmiany Wprowadzone

\`\`\`
$(git log --oneline -15 2>/dev/null || echo "Brak commitów")
\`\`\`

## Błędy TypeScript (jeśli pozostały)

\`\`\`
$(cat /tmp/palmo-tsc-frontend.txt 2>/dev/null | grep "error TS" | head -10 || echo "Brak błędów TypeScript")
\`\`\`

## Rekomendacje

### Priorytet WYSOKI
1. **Shared Types** — utwórz \`packages/shared-types/\` z typami używanymi przez frontend i backend
2. **Error Monitoring** — zainstaluj Sentry: \`npm install @sentry/react\`
3. **Geocoding proxy** — jeśli Google Maps jest wywoływany z frontendu, przenieś na backend

### Priorytet ŚREDNI
4. **CI/CD** — dodaj GitHub Actions workflow: tsc + build + test na każdy PR
5. **Loading states** — wszystkie API calls powinny mieć loading/error states
6. **Retry logic** — dodaj exponential backoff dla failed requests

### Priorytet NISKI
7. **Bundle optimization** — lazy loading dla PayPal SDK i Maps
8. **Storybook** — dokumentacja komponentów UI
9. **E2E tests** — pełny przepływ wizard (krok 1→2→3→płatność)

## Następne Kroki

- [ ] Uruchomić pełny E2E test z Playwright
- [ ] Skonfigurować GitHub Actions CI
- [ ] Zintegrować monitoring błędów (Sentry)
- [ ] Optymalizacja bundle size (target: < 500KB gzipped)
MDEOF

      echo ""
      echo "========================================"
      echo "  RAPORT KOŃCOWY AGENTA"
      echo "========================================"
      cat /tmp/palmo-frontend-report.md
      echo ""
      echo "📊 JSON:     /tmp/palmo-frontend-results.json"
      echo "📄 Markdown: /tmp/palmo-frontend-report.md"
      echo "🖼️  Screenshot: /tmp/palmo-screenshot-initial.png"
```

---

## ITERATION RULES

```yaml
max_iterations: 25
stop_conditions:
  - all_phases_passed: true
  - max_iterations_reached: true

on_iteration_start:
  - Log: "=== ITERACJA {n} — Faza: {current_phase} ==="
  - Read: /tmp/palmo-frontend-agent-state.env

on_iteration_end:
  - Write: /tmp/palmo-frontend-agent-state.env
  - If failed_phase: retry_phase

retry_strategy:
  max_retries_per_phase: 5
  on_exhausted: |
    Jeśli faza nie przechodzi po 5 próbach:
    1. Zapisz szczegółowy opis problemu do /tmp/palmo-blocker.txt
    2. Kontynuuj do następnej fazy
    3. Na końcu wygeneruj raport z listą blokerów
```

---

## WEB SEARCH QUERIES

W razie błędów szukaj dokumentacji:

```yaml
error_search_queries:
  vite_cors: "vite server proxy cors 2024 configuration"
  typescript_vite_env: "vite typescript ImportMetaEnv interface 2024"
  zustand_typescript: "zustand typescript store types 2024"
  paypal_react: "paypal react-paypal-js integration 2024"
  google_maps_cors: "google maps geocoding API CORS proxy backend 2024"
  tailwind_v3: "tailwindcss v3 vite react configuration 2024"
  react_error_boundary: "React 18 ErrorBoundary TypeScript 2024"
  playwright_vite: "playwright test vite react setup 2024"
```

---

## SUCCESS CRITERIA

```yaml
required_all_pass:
  - id: tsc_zero_errors
    check: "npx tsc --noEmit exits with 0"

  - id: dev_server_running
    check: "http://localhost:5173/ returns HTTP 200"

  - id: no_browser_errors
    check: "browser console has 0 errors on page load"

  - id: build_succeeds
    check: "npm run build exits with 0, dist/ exists"

  - id: all_changes_committed
    check: "git diff --stat shows no uncommitted changes"
    note: "Wyjątek: .env.local jest w .gitignore"
```

---

## FINAL OUTPUT

Po zakończeniu agent wypisuje:

```
╔══════════════════════════════════════════════════════════════╗
║       PALMO-TRANS FRONTEND DEBUG AGENT — ZAKOŃCZONO          ║
╠══════════════════════════════════════════════════════════════╣
║  TypeScript:    ✅/❌  [N errors]                             ║
║  Dev Server:    ✅/❌  http://localhost:5173/                 ║
║  Browser:       ✅/❌  [N console errors]                    ║
║  Build:         ✅/❌  [size MB]                              ║
║  Backend CORS:  ✅/❌  localhost:5173 allowed                ║
╠══════════════════════════════════════════════════════════════╣
║  Commits:       [N] atomowych commitów                        ║
║  Push:          ✅/❌ github.com/piotroq/...                  ║
╠══════════════════════════════════════════════════════════════╣
║  Raport:        /tmp/palmo-frontend-report.md                ║
║  JSON:          /tmp/palmo-frontend-results.json             ║
╚══════════════════════════════════════════════════════════════╝
```
