# GitHub Actions Workflows

## 🚀 Auto-Deployment na Home.pl

Automatyczny deployment frontendu Angular na hosting home.pl po każdym pushu do `main`.

### ⚙️ Setup (Quick Start)

1. **Dodaj GitHub Secrets** (wymagane przed pierwszym deployem):

   Przejdź do: https://github.com/devNiemczyk/astrolog/settings/secrets/actions

   Dodaj 4 secrets:
   - `HOMEPL_FTP_HOST` - np. `ftp.twojadomena.pl`
   - `HOMEPL_FTP_USERNAME` - Twój login FTP
   - `HOMEPL_FTP_PASSWORD` - Hasło FTP
   - `HOMEPL_FTP_PATH` - np. `/domains/twojadomena.pl/public_html/`

2. **Push workflow do repo**:
   ```bash
   git add .github/workflows/deploy-homepl.yml
   git commit -m "feat: Add auto-deployment to home.pl"
   git push origin main
   ```

3. **Monitor deployment**:
   - Otwórz: https://github.com/devNiemczyk/astrolog/actions
   - Sprawdź status workflow "Deploy to Home.pl"

### 🔍 Jak to działa?

**Trigger**: Push do `main` branch zmian w:
- `src/**` - kod źródłowy
- `public/**` - assets
- `angular.json` - konfiguracja
- `package.json` - dependencies

**Proces**:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Build production (`npm run build:prod`)
5. Upload via FTP do home.pl

**Czas**: ~2-5 minut (pierwsze wdrożenie), ~30s-1min (kolejne)

### 📝 Manual Trigger

Możesz też uruchomić deployment ręcznie:
1. Otwórz: https://github.com/devNiemczyk/astrolog/actions
2. Kliknij "Deploy to Home.pl"
3. Kliknij "Run workflow" → wybierz `main` branch → "Run workflow"

### ⚠️ Troubleshooting

**Problem**: FTP Connection Failed
- Sprawdź czy secrets są poprawnie dodane
- Sprawdź czy FTP jest włączone na home.pl

**Problem**: Build Failed
- Przetestuj lokalnie: `npm run build:prod`
- Sprawdź logi w GitHub Actions

**Problem**: 404 na podstronach
- Upewnij się że `.htaccess` jest wdrożony
- Sprawdź routing w `public/.htaccess`

### 📚 Dokumentacja

Pełna dokumentacja: `/DEPLOYMENT-HOMEPL.md`
