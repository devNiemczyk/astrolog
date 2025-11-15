# Angular Environment Setup 🎯

**Problem**: Musieliśmy ręcznie zmieniać API URL przed każdym deploymentem
**Rozwiązanie**: Automatyczne environment configuration dla dev i prod

---

## 📁 Struktura Plików

```
astrolog/
├── src/
│   └── environments/
│       ├── environment.development.ts  ← Development (npm start)
│       └── environment.ts              ← Production (npm run build:prod)
└── angular.json                        ← Konfiguracja build
```

---

## 🔧 Konfiguracja Environment

### Development Environment (`environment.development.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/facebook',
  facebookPixelId: '736027565563747',
};
```

**Używany gdy**: `npm start` / `ng serve`

### Production Environment (`environment.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://astrolog-api-astrologmajazielinskapl.up.railway.app/api/facebook',
  facebookPixelId: '736027565563747',
};
```

**Używany gdy**: `npm run build:prod` / `ng build --configuration production`

---

## ⚙️ Angular Configuration (`angular.json`)

Dodano `fileReplacements` w konfiguracji production:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.development.ts",
        "with": "src/environments/environment.ts"
      }
    ],
    ...
  }
}
```

**Jak to działa**:
- Development build: Używa `environment.development.ts` (localhost)
- Production build: Podmienia na `environment.ts` (Railway URL)

---

## 📝 Użycie w Service

### FacebookPixelService
```typescript
import { environment } from '../../environments/environment.development';

export class FacebookPixelService {
  private apiUrl = environment.apiUrl;          // Automatycznie localhost lub Railway
  private pixelId = environment.facebookPixelId;
  ...
}
```

**Rezultat**:
- ✅ `npm start` → używa `http://localhost:3000/api/facebook`
- ✅ `npm run build:prod` → używa `https://astrolog-api-astrologmajazielinskapl.up.railway.app/api/facebook`

---

## 🧪 Weryfikacja

### Test 1: Production Build
```bash
npm run build:prod
grep -r "railway.app" dist/
```

**Wynik**: ✅ Railway URL znaleziony w bundle
```javascript
{production:!0,apiUrl:"https://astrolog-api-astrologmajazielinskapl.up.railway.app/api/facebook"...}
```

### Test 2: No Localhost in Prod
```bash
grep -r "localhost:3000" dist/
```

**Wynik**: ✅ Brak wyników (localhost NIE jest w production build)

---

## 🚀 Workflow Deployment

### Development (Local Testing)
```bash
# Terminal 1 - Backend
cd astrolog-api
npm start                    # Uruchamia na localhost:3000

# Terminal 2 - Frontend
cd astrolog
npm start                    # Używa environment.development.ts (localhost:3000)
```

### Production Deployment
```bash
cd astrolog
npm run build:prod           # Używa environment.ts (Railway URL)

# Deploy dist/astrolog/browser/ do hostingu
```

**Nie musisz zmieniać ŻADNEGO kodu!** 🎉

---

## 📊 Porównanie: Przed vs Po

### ❌ Przed (Manual)
```typescript
// FacebookPixelService
private apiUrl = 'http://localhost:3000/api/facebook'; // TODO: Change before deploy

// Przed każdym deploymentem:
1. Ręcznie zmień na Railway URL
2. Zbuduj: npm run build:prod
3. Deploy
4. Pamiętaj żeby zmienić z powrotem na localhost (albo zapomnij i płacz)
```

### ✅ Po (Automatic)
```typescript
// FacebookPixelService
private apiUrl = environment.apiUrl;  // Automatycznie dev lub prod

// Przed deploymentem:
1. npm run build:prod  (używa prod URL automatycznie)
2. Deploy
3. Profit! 💰
```

---

## 🔄 Dodawanie Nowych Environment Variables

### Krok 1: Dodaj do obu plików environment
```typescript
// environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/facebook',
  facebookPixelId: '736027565563747',
  newVariable: 'dev-value',  // ← Nowa zmienna
};

// environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://...',
  facebookPixelId: '736027565563747',
  newVariable: 'prod-value',  // ← Nowa zmienna
};
```

### Krok 2: Użyj w service/component
```typescript
import { environment } from '../../environments/environment.development';

someMethod() {
  console.log(environment.newVariable);  // 'dev-value' lub 'prod-value'
}
```

---

## 🎯 Best Practices

1. **Nigdy nie commituj secrets**
   - Obecnie facebookPixelId jest public (OK dla Pixel ID)
   - Gdybyś miał API keys, użyj environment variables na serwerze

2. **Zawsze testuj oba buildy**
   ```bash
   npm start              # Test dev environment
   npm run build:prod     # Test prod environment
   ```

3. **Git ignore environment.local.ts** (gdybyś miał lokalne overrides)
   ```
   # .gitignore
   /src/environments/*.local.ts
   ```

4. **Dokumentuj nowe variables**
   - Dodaj komentarze w plikach environment
   - Aktualizuj ten dokument

---

## 🛠️ Troubleshooting

### Problem: Build używa złego environment
**Fix**: Sprawdź `angular.json` → `fileReplacements` są poprawne

### Problem: Import error `environment.development`
**Fix**: TypeScript może narzekać, ale to normalne - Angular podmienia pliki podczas buildu

### Problem: Nowa zmienna undefined
**Fix**: Dodaj ją do OBU plików environment (development i production)

---

## ✅ Checklist Pre-Deployment

- [x] Environment files created
- [x] angular.json configured
- [x] Service updated to use environment
- [x] Production build tested
- [x] No localhost in prod bundle
- [x] Railway URL in prod bundle
- [ ] Deploy to production
- [ ] Test live site

---

**Status**: ✅ Environment setup complete
**Benefit**: Zero manual URL changes needed! 🎉
