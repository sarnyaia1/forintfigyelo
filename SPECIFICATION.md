# Havi Költségkövető Webalkalmazás - Teljes Specifikáció (v2.0)

## 1. PROJEKT ÁTTEKINTÉS

Készíts egy **teljes stack webalkalmazást** havi bevételek és kiadások nyomon követésére, amely:
- Regisztrációhoz és bejelentkezéshez kötött (email verification)
- Többhavi nézetet támogat
- AI-alapú pénzügyi tanácsokat ad (Claude API)
- Grafikonokkal vizualizál
- PDF/Excel exportálást támogat (részletes tartalom specifikálva)
- Ismétlődő tranzakciók támogatása
- **Netlify**-ra deployolható
- Teljesen mobilbarát (reszponzív)
- Dark mode támogatás
- PWA képességek (offline működés)

---

## 2. TECHNOLÓGIAI STACK

### Frontend:
- **Next.js 15** (App Router - KÖTELEZŐ!)
  - Server Components alapértelmezetten
  - Server Actions form submit-ekhez
  - Route handlers API végpontokhoz
- **Tailwind CSS** (gyors, reszponzív UI)
- **Recharts** vagy **Chart.js** (grafikonok)
- **React Hook Form** + **Zod** (form kezelés + validáció)
- **date-fns** (dátum kezelés)
- **React Query (TanStack Query)** (API cache + state management)
- **Radix UI** vagy **shadcn/ui** (accessible komponensek)

### Backend:
- **Supabase** (ajánlott: Auth + Database + Storage + Realtime)
  - PostgreSQL adatbázis
  - Row Level Security (RLS)
  - Built-in auth (email verification)

### Auth:
- Email/Password authentication
- **Email verification kötelező**
- JWT token-based

### API Integráció:
- **Anthropic Claude API** (PRO TIPP generáláshoz)
- Model: **claude-sonnet-4-5-20250929** (legfrissebb)

### Testing:
- **Vitest** + **React Testing Library** (unit tests)
- **Playwright** (E2E tests)
- **MSW** (API mocking)

### Deployment:
- **Netlify** (frontend + serverless functions)
- **GitHub Actions** (CI/CD)

---

## 3. ADATBÁZIS SÉMA (PostgreSQL + Supabase)

### **Users tábla** (Supabase Auth kezeli)
```sql
-- Supabase auth.users táblát használjuk
-- Egyedi mezők a public.profiles táblában:
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Months tábla** (havi költségvetés)
```sql
CREATE TABLE months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  starting_balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  UNIQUE(user_id, year, month, deleted_at)
);

-- Indexek (PERFORMANCE!)
CREATE INDEX idx_months_user_year_month ON months(user_id, year, month) WHERE deleted_at IS NULL;
CREATE INDEX idx_months_user_id ON months(user_id) WHERE deleted_at IS NULL;
```

### **Income tábla** (bevételek)
```sql
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  source_type TEXT NOT NULL CHECK (source_type IN ('Fizetés', 'Utalás', 'Vállalkozás', 'Egyéb')),
  custom_source TEXT, -- ha source_type = 'Egyéb'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexek
CREATE INDEX idx_income_user_month ON income(user_id, month_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_income_date ON income(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_income_user_id ON income(user_id) WHERE deleted_at IS NULL;
```

### **Expenses tábla** (kiadások)
```sql
CREATE TYPE expense_category AS ENUM (
  'Bevásárlás',
  'Szórakozás',
  'Vendéglátás',
  'Extra',
  'Utazás',
  'Kötelező kiadás',
  'Ruha',
  'Sport'
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  item_name TEXT NOT NULL,
  category expense_category NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexek
CREATE INDEX idx_expenses_user_month ON expenses(user_id, month_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_date ON expenses(date) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_category ON expenses(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_user_id ON expenses(user_id) WHERE deleted_at IS NULL;
```

### **Budget tábla** (kategóriánkénti költségvetés)
```sql
CREATE TABLE budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  planned_amount DECIMAL(12, 2) NOT NULL CHECK (planned_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(month_id, category, deleted_at)
);

-- Indexek
CREATE INDEX idx_budget_month ON budget(month_id) WHERE deleted_at IS NULL;
```

### **Savings tábla** (megtakarítások)
```sql
CREATE TABLE savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  date DATE NOT NULL, -- ÚJ: Konkrét dátum
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexek
CREATE INDEX idx_savings_month ON savings(month_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_savings_user ON savings(user_id) WHERE deleted_at IS NULL;
```

### **ProTips tábla** (AI-generált tanácsok) - FRISSÍTVE!
```sql
CREATE TABLE pro_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  tip_text TEXT NOT NULL,
  version INTEGER DEFAULT 1, -- Verzionálás (újragenerálás esetén)
  is_active BOOLEAN DEFAULT true, -- Csak az aktív jelenik meg
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexek
CREATE INDEX idx_pro_tips_month_active ON pro_tips(month_id, is_active) WHERE deleted_at IS NULL;

-- Policy: Havonta csak 1 AKTÍV tipp
CREATE UNIQUE INDEX idx_pro_tips_month_unique ON pro_tips(month_id)
WHERE is_active = true AND deleted_at IS NULL;
```

### **RecurringTransactions tábla** (ÚJ! - Ismétlődő tranzakciók)
```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE recurrence_frequency AS ENUM ('weekly', 'monthly', 'yearly');

CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),

  -- Expense mezők (nullable, csak ha type = 'expense')
  category expense_category,
  item_name TEXT,

  -- Income mezők (nullable, csak ha type = 'income')
  source_type TEXT CHECK (source_type IN ('Fizetés', 'Utalás', 'Vállalkozás', 'Egyéb')),
  custom_source TEXT,

  -- Közös mezők
  notes TEXT,
  frequency recurrence_frequency NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = nincs vége
  last_generated_date DATE,
  next_generation_date DATE NOT NULL, -- Következő generálás dátuma
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Validáció
  CONSTRAINT check_expense_fields CHECK (
    (type = 'expense' AND category IS NOT NULL AND item_name IS NOT NULL) OR
    (type = 'income' AND source_type IS NOT NULL)
  )
);

-- Indexek
CREATE INDEX idx_recurring_user_active ON recurring_transactions(user_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_recurring_next_date ON recurring_transactions(next_generation_date, is_active) WHERE deleted_at IS NULL;
```

---

## 4. ROW-LEVEL SECURITY (RLS) POLICIES

**KRITIKUS: Minden táblán kötelező!**

```sql
-- Minden táblára (példa az expenses-re):
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own expenses"
ON expenses
FOR ALL
USING (user_id = auth.uid());

-- Ugyanez: months, income, budget, savings, pro_tips, recurring_transactions
-- profiles: saját profil csak
```

---

## 5. FUNKCIONALITÁS RÉSZLETEZÉSE

### 5.1 AUTENTIKÁCIÓ
- **Regisztráció**: Email + jelszó (min 8 karakter, 1 szám, 1 nagybetű)
- **Email verification**: Regisztráció után megerősítő email (Supabase)
- **Bejelentkezés**: Email + jelszó
- **Jelszó reset**: "Elfelejtett jelszó" funkció (email link)
- **Biztonság**:
  - Row-level security (RLS)
  - Rate limiting: max 5 bejelentkezési kísérlet / 15 perc
  - CSRF védelem (Next.js built-in)

### 5.2 DASHBOARD (Fő oldal)

#### **Fejléc**
- Felhasználó neve (vagy avatar)
- Hónap választó (lenyíló menü): "2026 Január", "2025 December", stb.
  - Gyorsgombok: ⬅️ Előző hónap | ➡️ Következő hónap
- Dark mode toggle (🌙/☀️)
- Kijelentkezés gomb

#### **1. Kezdő egyenleg szekció**
```
┌─────────────────────────────┐
│  Kezdő egyenleg (Ft)        │
│  [_______] (inline edit)    │
│  Mentés automatikus blur-nál│
└─────────────────────────────┘
```

#### **2. Bevételi szekció (INCOME)**
```
┌─────────────────────────────────────────────┐
│  💰 Bevételek                                │
│  ─────────────────────────────────────────  │
│  [+ Új bevétel] [🔁 Ismétlődő bevétel]      │
│                                              │
│  Táblázat (Pagination: 20 tétel/oldal):     │
│  | Dátum | Összeg | Forrás | Jegyzetek | ⚙️  │
│  | 2026-01-15 | 250,000 Ft | Fizetés | - | 🗑️✏️ │
│                                              │
│  Összesen: 800,000 Ft                        │
│  [1] 2 3 ... 5 → (pagination)               │
└─────────────────────────────────────────────┘

[Új bevétel modal:]
- Dátum (date picker, default: ma)
- Összeg (number input, Ft formázás)
- Forrás típus (dropdown):
  * Fizetés
  * Utalás
  * Vállalkozás
  * Egyéb (+ custom text input)
- Jegyzetek (textarea, opcionális)
- [Mentés] [Mégse]

[🔁 Ismétlődő bevétel modal:]
- Minden mező ugyanaz +
- Gyakoriság: [x] Heti [ ] Havi [ ] Éves
- Kezdő dátum: [___]
- Végdátum: [___] (opcionális, checkbox: "Nincs vége")
- [Mentés] [Mégse]
```

#### **3. Kiadási szekció (EXPENSES)**
```
┌─────────────────────────────────────────────────────┐
│  💸 Kiadások                                         │
│  ──────────────────────────────────────────────────│
│  [+ Új kiadás] [🔁 Ismétlődő kiadás]                │
│                                                      │
│  Táblázat (Pagination: 20 tétel/oldal):             │
│  | Dátum | Tétel | Összeg | Kategória | Jegyzetek | ⚙️ │
│  | 2026-01-10 | Lakbér | 130,000 Ft | Kötelező | - | 🗑️✏️ │
│  | 2026-01-15 | Lidl | 18,217 Ft | Bevásárlás | - | 🗑️✏️ │
│                                                      │
│  Összesen: 302,183 Ft                                │
│  [1] 2 3 ... 8 → (pagination)                       │
└─────────────────────────────────────────────────────┘

[Új kiadás modal:]
- Dátum (date picker, default: ma)
- Tétel neve (Autocomplete combobox - USER-SPECIFIKUS!):
  * Betöltés: legutóbbi 20 egyedi tétel a user-től
  * Gépeléskor: dynamic filter
  * Példa javaslatok:
    - Lakbér
    - Rezsi (Áram/Víz/Fűtés)
    - Telekom mobil számla
    - Telekom Home
    - Netflix, Spotify
    - Diákhitel
    - Közös költség
    - Gyógyszer
    - Apple Cloud
    - ... stb.
  * Egyéb: free text input
- Összeg (number input, Ft formázás)
- Kategória (dropdown):
  * Bevásárlás
  * Szórakozás
  * Vendéglátás
  * Extra
  * Utazás
  * Kötelező kiadás
  * Ruha
  * Sport
- Jegyzetek (textarea, opcionális)
- [Mentés] [Mégse]

[🔁 Ismétlődő kiadás modal:]
- Minden mező ugyanaz +
- Gyakoriság: [ ] Heti [x] Havi [ ] Éves
- Kezdő dátum: [___]
- Végdátum: [___] (opcionális)
- [Mentés] [Mégse]
```

#### **4. Költségvetési tervező szekció**
```
┌────────────────────────────────────────────────────┐
│  📊 Költségvetési terv                              │
│  ─────────────────────────────────────────────────│
│                                                     │
│  Kategória          | Tervezett | Aktuális | Maradt│
│  ─────────────────────────────────────────────────│
│  Bevásárlás ℹ️      | 70,000 Ft | 80,387 Ft | -10,387 Ft ❌│
│  Szórakozás ℹ️      | 30,000 Ft | 7,820 Ft  | +22,180 Ft ✅│
│  Vendéglátás ℹ️     | 40,000 Ft | 29,139 Ft | +10,861 Ft ✅│
│  Extra ℹ️           | 40,000 Ft | 77,845 Ft | -37,845 Ft ❌│
│  Utazás ℹ️          | 55,000 Ft | 68,500 Ft | -13,500 Ft ❌│
│  Kötelező kiadás ℹ️ | 30,000 Ft | 20,492 Ft | +9,508 Ft ✅│
│  Ruha ℹ️            | 20,000 Ft | 18,000 Ft | +2,000 Ft ✅│
│  Sport ℹ️           | 20,000 Ft | 0 Ft      | +20,000 Ft ✅│
│                                                     │
│  [Tervezett összegek szerkesztése] gomb            │
└────────────────────────────────────────────────────┘

[ℹ️ Információs gomb (Radix Tooltip):]
Kategóriánként egyedi javaslat, pl:
"Bevásárlás: Ajánlott 20-25% a havi bevételed alapján (jelenleg: 800,000 Ft → 160,000-200,000 Ft)"

Ajánlott arányok:
- Bevásárlás: 20-25%
- Vendéglátás: 10-15%
- Kötelező kiadás: 30-35%
- Utazás: 5-10%
- Szórakozás: 5-10%
- Ruha: 5-8%
- Sport: 3-5%
- Extra: 5-10%

[Szerkesztés modal:]
- Minden kategóriához input mező
- Real-time számítás: "Ez a bevételed X%-a"
- [Mentés] [Mégse]
```

#### **5. Megtakarítás szekció**
```
┌─────────────────────────────┐
│  💰 Megtakarítás             │
│  ───────────────────────────│
│  Tervezett: 100,000 Ft      │
│  Aktuális: 100,000 Ft       │
│  [+ Hozzáadás] [Szerkeszt.] │
└─────────────────────────────┘

[Hozzáadás modal:]
- Dátum
- Összeg
- Jegyzetek
```

#### **6. Havi összegző tábla**
```
┌─────────────────────────────────────┐
│  📈 Havi összegző                    │
│  ──────────────────────────────────│
│  Összes bevétel:      800,000 Ft   │
│  Összes kiadás:      -302,183 Ft   │
│  Megtakarítás:       -100,000 Ft   │
│  ──────────────────────────────────│
│  Maradt:              397,817 Ft   │
│  (Bevétel 49.7%-a)                  │
└─────────────────────────────────────┘
```

#### **7. Grafikonok szekció**
```
┌─────────────────────────────────────────┐
│  📊 Költési megoszlás (Kördiagram)      │
│  [Recharts Pie Chart]                   │
│  - Kategóriánkénti % megoszlás          │
│  - Hover: tooltip (kategória, összeg, %)│
│  - Klikk: szűrés a táblázatban          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  📈 Havi trend (Vonaldiagram)           │
│  [Recharts Line Chart]                  │
│  - Elmúlt 6 hónap (ha van adat)        │
│  - 2 vonal: bevétel (zöld), kiadás (piros)│
│  - Hover: pontos értékek               │
└─────────────────────────────────────────┘
```

#### **8. PRO TIPP szekció**
```
┌────────────────────────────────────────────────────┐
│  💡 PRO TIPP - 2026 Január                          │
│  ─────────────────────────────────────────────────│
│  [AI-generált 1-2 bekezdéses szöveg]              │
│                                                     │
│  Betöltés állapot:                                  │
│  - Ha még nincs generálva: [🎯 Tipp generálása]   │
│  - Generálás közben: [Loading spinner + "AI dolgozik..."]│
│  - Ha kész: Megjelenít + [🔄 Újragenerálás]       │
│                                                     │
│  Verzió history: (dropdown)                        │
│  - v3 (2026.01.31 18:45) ← Aktív                   │
│  - v2 (2026.01.31 14:22)                           │
│  - v1 (2026.01.31 12:00)                           │
└────────────────────────────────────────────────────┘

[Automatikus generálás logika:]
- Manuális: User kattint "Tipp generálása" gombra
- VAGY: Scheduled function (Netlify) hónap utolsó napján
- Rate limit: max 5 generálás/nap/user
- Új generálásnál:
  * Korábbi verzió is_active = false
  * Új verzió version++, is_active = true
```

#### **9. Export szekció**
```
┌─────────────────────────────┐
│  📥 Exportálás               │
│  [📄 PDF letöltés]           │
│  [📊 Excel letöltés]         │
└─────────────────────────────┘
```

### **9.1 Export Részletek (ÚJ!)**

#### **PDF Export tartalom:**
```
Fejléc:
- User neve
- Hónap (pl. "2026 Január")
- Generálás dátuma

Tartalom (oldalak):
1. Kezdő egyenleg
2. Bevételek táblázat (összes tétel, oldalanként max 30)
3. Kiadások táblázat (kategória szerint csoportosítva)
4. Költségvetési terv táblázat (Tervezett vs. Aktuális)
5. Havi összegző
6. Költési megoszlás grafikon (beágyazott PNG kép)
7. Pro Tipp (ha elérhető)

Lábléc:
- Oldal számlálás (pl. "1 / 5")
- "Generálva: HaviKiadas.app"

Library: react-pdf (@react-pdf/renderer)
```

#### **Excel Export tartalom:**
```
Sheets:
1. "Bevételek"
   - Fejléc: Dátum | Összeg | Forrás | Jegyzetek
   - Összegző sor alul

2. "Kiadások"
   - Fejléc: Dátum | Tétel | Összeg | Kategória | Jegyzetek
   - Összegző sor alul
   - Kategóriánkénti részösszegek

3. "Költségvetés"
   - Fejléc: Kategória | Tervezett | Aktuális | Eltérés | Maradt %

4. "Összegző"
   - Havi összegző táblázat
   - Megtakarítás
   - Pro Tipp (ha van)

Formázás:
- Pénznemek: "#,##0 Ft" formátum
- Fejléc: bold, háttérszín
- Negatív értékek: piros szín

Library: exceljs
```

---

## 6. UI/UX KÖVETELMÉNYEK

### **Design stílus:**
- **Fiatalos, de professzionális**
- **Színvilág**:
  - Elsődleges: Modern kék/zöld árnyalatok (#3B82F6, #10B981)
  - Másodlagos: Élénk akcentusok (#F59E0B, #EF4444)
  - Háttér (Light): Tiszta fehér (#FFFFFF) / világos szürke (#F9FAFB)
  - Háttér (Dark): #0F172A / #1E293B
- **Tipográfia**: Inter font (Google Fonts)
- **Ikonok**: Lucide React (solid, könnyen felismerhető)
- **Animációk**: Framer Motion (finom, gyors átmenetek, 150-300ms)

### **Reszponzív design:**
- **Desktop (1280px+)**: 3 oszlopos grid layout
- **Tablet (768-1279px)**: 2 oszlopos layout
- **Mobil (< 768px)**: 1 oszlopos, stacked layout
  - Hamburger menü (Radix Navigation Menu)
  - Touch-friendly gombok (min 44x44px)
  - Táblázatok: virtuális scroll vagy horizontális scroll
  - Bottom sheet modals (Vaul library)

### **Dark Mode:**
- System preference alapértelmezett
- Manuális toggle (localStorage mentés)
- Tailwind dark: osztályok
- Smooth transition (transition-colors)

### **Accessibility (WCAG 2.1 AA):**

#### **Keyboard Navigation:**
- Tab order logikus: Header → Month selector → Add buttons → Tables → Modals → Footer
- Escape key: Modal/drawer bezárása
- Enter/Space: Form submit, gomb aktiválás
- Arrow keys: Dropdown navigáció

#### **Screen Reader (ARIA):**
- ARIA labels minden input mezőn
  ```jsx
  <input aria-label="Bevétel összege forintban" />
  ```
- ARIA live regions az összegző táblánál
  ```jsx
  <div aria-live="polite" aria-atomic="true">
    Maradt: 397,817 Ft
  </div>
  ```
- Alt text minden ikonhoz
- Landmark roles (header, nav, main, footer)

#### **Visual:**
- Minimum 4.5:1 kontraszt arány (text/background)
  - Light mode: #1F2937 on #FFFFFF (11:1)
  - Dark mode: #F9FAFB on #1E293B (10:1)
- Focus indicators (2px outline, #3B82F6)
- Szín mellett más jelzés is:
  - ❌/✅ emoji + piros/zöld szín a költségvetésnél
  - Negatív összegek: "-" prefix + piros

#### **Responsive Text:**
- Alapméret: 16px (desktop), 14px (mobil)
- Heading scale: text-xl → text-3xl (Tailwind)
- Line height: 1.5 (törzsszöveg), 1.2 (heading)

---

## 7. BIZTONSÁGI KÖVETELMÉNYEK (KRITIKUS!)

### **Row-Level Security (RLS):**
```sql
-- Minden táblán KÖTELEZŐ policy (lásd 4. szekció)
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data"
ON [table_name]
FOR ALL
USING (user_id = auth.uid());
```

### **Backend validációk:**
- Minden API végponton:
  ```typescript
  const session = await getServerSession();
  if (!session || req.body.user_id !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  ```
- Jelszó: minimum 8 karakter, 1 szám, 1 nagybetű (Zod schema)
- Input sanitization: Zod + DOMPurify (rich text)

### **Rate Limiting (ÚJ!):**
```typescript
// Upstash Redis + @upstash/ratelimit
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/perc
});

// API végpontokon:
const { success } = await ratelimit.limit(userId);
if (!success) return new Response('Too Many Requests', { status: 429 });

// Pro Tipp generálás:
const tipRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 d'), // 5 generálás/nap
});
```

### **CSRF védelem:**
- Next.js built-in CSRF token (Server Actions)
- API route-oknál: `next-csrf` package

### **Frontend védelem:**
- Protected routes (middleware):
  ```typescript
  // middleware.ts
  export async function middleware(req: NextRequest) {
    const session = await getToken({ req });
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  ```

### **API Key kezelés:**
- `ANTHROPIC_API_KEY` környezeti változóban
- **NE** commit-old a kódba (.env.local gitignore-ban)
- Netlify Environment Variables-ben állítsd be
- **Rotation**: Quarterly (3 havonta) új API key

### **Input Sanitization:**
```typescript
// Zod schema minden formhoz
const expenseSchema = z.object({
  date: z.date(),
  amount: z.number().positive().max(100_000_000),
  item_name: z.string().min(1).max(100).trim(),
  category: z.enum(EXPENSE_CATEGORIES),
  notes: z.string().max(500).optional(),
});

// DOMPurify rich text-hez (ha szükséges)
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userInput);
```

---

## 8. AI INTEGRÁCIÓ (CLAUDE API)

### **PRO TIPP generálás:**
```typescript
// app/api/pro-tip/route.ts
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  // Rate limiting check
  const { success } = await tipRatelimit.limit(session.user.id);
  if (!success) return new Response('Rate limit exceeded', { status: 429 });

  const { monthId } = await req.json();

  // Fetch month data
  const monthData = await getMonthFinancialData(monthId, session.user.id);

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const prompt = `
Elemezd az alábbi pénzügyi adatokat egy magyar felhasználó számára:

Hónap: ${monthData.year}. ${monthData.monthName}
Összes bevétel: ${monthData.totalIncome.toLocaleString('hu-HU')} Ft
Összes kiadás: ${monthData.totalExpenses.toLocaleString('hu-HU')} Ft
Megtakarítás: ${monthData.savings.toLocaleString('hu-HU')} Ft

Költési kategóriák (Tervezett vs. Aktuális):
${monthData.categories.map(c =>
  `- ${c.name}: ${c.planned.toLocaleString('hu-HU')} Ft tervezett, ${c.actual.toLocaleString('hu-HU')} Ft aktuális (${c.difference > 0 ? '+' : ''}${c.difference.toLocaleString('hu-HU')} Ft)`
).join('\n')}

Legnagyobb kiadások (top 5):
${monthData.topExpenses.map((e, i) =>
  `${i+1}. ${e.item_name}: ${e.amount.toLocaleString('hu-HU')} Ft (${e.category})`
).join('\n')}

Feladat:
1. Adj egy 1-2 bekezdéses, személyre szabott pénzügyi tanácsot magyarul.
2. Légy konstruktív, bátorító és konkrét.
3. Emelj ki pozitív dolgokat is (ne csak a problémákat).
4. Add meg a következő hónapra vonatkozó 2-3 konkrét, akcionális ajánlást.
5. Használj baráti, de professzionális hangnemet (tegező).
6. Ha túlköltés van, javasolj konkrét stratégiákat (pl. bevásárlólista, előre tervezés).
7. Ha jól teljesített, gratuálj neki!
8. Kerüld az általános tanácsokat - legyél specifikus az adatok alapján.

Formátum:
- Első bekezdés: összegzés + dicséret/gratuláció
- Második bekezdés: fejlesztési területek + konkrét javaslatok
- Max 300 szó
`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929', // ✅ FRISSÍTETT MODEL ID
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const tipText = message.content[0].text;

  // Mentés adatbázisba (új verzió)
  const savedTip = await saveProTip({
    userId: session.user.id,
    monthId,
    tipText,
  });

  return Response.json(savedTip);
}

async function saveProTip({ userId, monthId, tipText }) {
  // 1. Korábbi aktív tippeket deaktiválás
  await supabase
    .from('pro_tips')
    .update({ is_active: false })
    .eq('month_id', monthId)
    .eq('is_active', true);

  // 2. Új verzió számának meghatározása
  const { data: existingTips } = await supabase
    .from('pro_tips')
    .select('version')
    .eq('month_id', monthId)
    .order('version', { ascending: false })
    .limit(1);

  const newVersion = existingTips?.[0]?.version + 1 || 1;

  // 3. Új tipp mentése
  const { data } = await supabase
    .from('pro_tips')
    .insert({
      user_id: userId,
      month_id: monthId,
      tip_text: tipText,
      version: newVersion,
      is_active: true,
    })
    .select()
    .single();

  return data;
}
```

### **Scheduled Pro Tip Generation (Netlify Function):**
```typescript
// netlify/functions/scheduled-pro-tips.ts
import { schedule } from '@netlify/functions';

export const handler = schedule('0 0 * * *', async (event) => {
  // Minden nap éjfélkor fut
  const today = new Date();
  const isLastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() === today.getDate();

  if (!isLastDayOfMonth) return { statusCode: 200 };

  // Lekérjük az összes aktív hónapot (current month)
  const { data: months } = await supabase
    .from('months')
    .select('id, user_id, year, month')
    .eq('year', today.getFullYear())
    .eq('month', today.getMonth() + 1)
    .is('deleted_at', null);

  // Minden hónaphoz generálunk tippet (parallel)
  await Promise.allSettled(
    months.map(async (month) => {
      // Ellenőrizzük, hogy már generálva van-e ma
      const { data: existing } = await supabase
        .from('pro_tips')
        .select('id')
        .eq('month_id', month.id)
        .gte('generated_at', new Date().toISOString().split('T')[0])
        .single();

      if (existing) return; // Már van ma generált tipp

      // Generálás (ugyanaz a logika mint a POST endpoint)
      // ...
    })
  );

  return { statusCode: 200 };
});
```

---

## 9. RECURRING TRANSACTIONS LOGIKA (ÚJ!)

### **Frontend - Hozzáadás UI:**
```tsx
// components/AddRecurringTransactionModal.tsx
<Dialog>
  <DialogContent>
    <h2>Ismétlődő {type === 'income' ? 'bevétel' : 'kiadás'} beállítása</h2>

    <Form>
      {/* Alapmezők (amount, category, stb.) */}

      <div>
        <Label>Gyakoriság</Label>
        <RadioGroup value={frequency}>
          <Radio value="weekly">Heti</Radio>
          <Radio value="monthly">Havi (minden hónap ugyanazon a napon)</Radio>
          <Radio value="yearly">Éves</Radio>
        </RadioGroup>
      </div>

      <div>
        <Label>Kezdő dátum</Label>
        <DatePicker value={startDate} />
      </div>

      <div>
        <Checkbox checked={hasEndDate}>
          Van végdátum
        </Checkbox>
        {hasEndDate && <DatePicker value={endDate} />}
      </div>

      <Button type="submit">Mentés</Button>
    </Form>
  </DialogContent>
</Dialog>
```

### **Backend - Automatikus generálás:**
```typescript
// netlify/functions/generate-recurring.ts
import { schedule } from '@netlify/functions';

export const handler = schedule('0 1 * * *', async (event) => {
  // Minden nap hajnali 1-kor fut
  const today = new Date().toISOString().split('T')[0];

  // Lekérjük azokat a recurring transaction-öket, ahol next_generation_date = today
  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('is_active', true)
    .lte('next_generation_date', today)
    .is('deleted_at', null);

  for (const rec of recurring) {
    // 1. Hónap ID megkeresése/létrehozása
    const date = new Date(rec.next_generation_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    let { data: monthRecord } = await supabase
      .from('months')
      .select('id')
      .eq('user_id', rec.user_id)
      .eq('year', year)
      .eq('month', month)
      .is('deleted_at', null)
      .single();

    if (!monthRecord) {
      const { data: newMonth } = await supabase
        .from('months')
        .insert({ user_id: rec.user_id, year, month })
        .select('id')
        .single();
      monthRecord = newMonth;
    }

    // 2. Tranzakció létrehozása
    if (rec.type === 'expense') {
      await supabase.from('expenses').insert({
        user_id: rec.user_id,
        month_id: monthRecord.id,
        date: rec.next_generation_date,
        amount: rec.amount,
        item_name: rec.item_name,
        category: rec.category,
        notes: `Automatikus (ismétlődő) - ${rec.notes || ''}`.trim(),
      });
    } else {
      await supabase.from('income').insert({
        user_id: rec.user_id,
        month_id: monthRecord.id,
        date: rec.next_generation_date,
        amount: rec.amount,
        source_type: rec.source_type,
        custom_source: rec.custom_source,
        notes: `Automatikus (ismétlődő) - ${rec.notes || ''}`.trim(),
      });
    }

    // 3. Következő generálási dátum kiszámítása
    let nextDate = new Date(rec.next_generation_date);
    if (rec.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (rec.frequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (rec.frequency === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    // 4. Ha end_date van és túlléptük, deaktiválás
    const shouldDeactivate = rec.end_date && nextDate > new Date(rec.end_date);

    await supabase
      .from('recurring_transactions')
      .update({
        last_generated_date: rec.next_generation_date,
        next_generation_date: nextDate.toISOString().split('T')[0],
        is_active: !shouldDeactivate,
      })
      .eq('id', rec.id);
  }

  return { statusCode: 200 };
});
```

### **UI - Recurring Transactions Management:**
```tsx
// Külön oldal: /dashboard/recurring
<div>
  <h1>Ismétlődő tranzakciók</h1>

  <Tabs defaultValue="active">
    <TabsList>
      <TabsTrigger value="active">Aktív ({activeCount})</TabsTrigger>
      <TabsTrigger value="inactive">Inaktív ({inactiveCount})</TabsTrigger>
    </TabsList>

    <TabsContent value="active">
      <Table>
        <thead>
          <tr>
            <th>Típus</th>
            <th>Tétel/Forrás</th>
            <th>Összeg</th>
            <th>Gyakoriság</th>
            <th>Következő</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {activeRecurring.map(rec => (
            <tr key={rec.id}>
              <td>{rec.type === 'income' ? '💰 Bevétel' : '💸 Kiadás'}</td>
              <td>{rec.item_name || rec.source_type}</td>
              <td>{rec.amount.toLocaleString('hu-HU')} Ft</td>
              <td>
                {rec.frequency === 'weekly' && 'Heti'}
                {rec.frequency === 'monthly' && 'Havi'}
                {rec.frequency === 'yearly' && 'Éves'}
              </td>
              <td>{formatDate(rec.next_generation_date)}</td>
              <td>
                <Button onClick={() => editRecurring(rec)}>✏️</Button>
                <Button onClick={() => deleteRecurring(rec.id)}>🗑️</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TabsContent>
  </Tabs>
</div>
```

---

## 10. PERFORMANCE OPTIMALIZÁCIÓ

### **Caching stratégia:**
```typescript
// TanStack Query setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 perc
      cacheTime: 1000 * 60 * 30, // 30 perc
      refetchOnWindowFocus: false,
    },
  },
});

// Példa query
const { data: expenses } = useQuery({
  queryKey: ['expenses', monthId],
  queryFn: () => fetchExpenses(monthId),
  staleTime: 1000 * 60 * 5,
});

// Optimistic update
const mutation = useMutation({
  mutationFn: createExpense,
  onMutate: async (newExpense) => {
    await queryClient.cancelQueries(['expenses', monthId]);
    const previous = queryClient.getQueryData(['expenses', monthId]);

    queryClient.setQueryData(['expenses', monthId], (old) =>
      [...old, { ...newExpense, id: 'temp-' + Date.now() }]
    );

    return { previous };
  },
  onError: (err, newExpense, context) => {
    queryClient.setQueryData(['expenses', monthId], context.previous);
    toast.error('Nem sikerült menteni a kiadást');
  },
  onSettled: () => {
    queryClient.invalidateQueries(['expenses', monthId]);
  },
});
```

### **Code Splitting:**
```typescript
// Lazy load grafikonok
const ExpenseChart = lazy(() => import('@/components/ExpenseChart'));
const TrendChart = lazy(() => import('@/components/TrendChart'));

// Lazy load export funkciók
const PDFExport = lazy(() => import('@/components/PDFExport'));
const ExcelExport = lazy(() => import('@/components/ExcelExport'));

// Használat
<Suspense fallback={<ChartSkeleton />}>
  <ExpenseChart data={expenses} />
</Suspense>
```

### **Database Indexek:**
```sql
-- Már hozzáadva a 3. szekcióban!
-- Példa:
CREATE INDEX idx_expenses_user_month ON expenses(user_id, month_id) WHERE deleted_at IS NULL;
```

### **PWA (Progressive Web App):**
```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... többi config
});
```

```json
// public/manifest.json
{
  "name": "HaviKiadas - Költségkövető",
  "short_name": "HaviKiadas",
  "description": "AI-alapú havi költségkövető alkalmazás",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **Image Optimization:**
```tsx
// Next.js Image component használata
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={40}
  height={40}
  priority // Above the fold képekhez
/>
```

---

## 11. DEPLOYMENT (NETLIFY)

### **Projekt struktúra:**
```
havikiadas/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-email/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── recurring/
│   │   └── settings/
│   ├── api/
│   │   ├── expenses/
│   │   ├── income/
│   │   ├── pro-tip/
│   │   └── export/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # shadcn/ui komponensek
│   ├── dashboard/
│   ├── forms/
│   └── charts/
├── lib/
│   ├── supabase/
│   ├── validations/
│   └── utils/
├── netlify/
│   └── functions/
│       ├── scheduled-pro-tips.ts
│       └── generate-recurring.ts
├── public/
│   ├── icons/
│   └── manifest.json
├── .env.local              # Lokális environment változók
├── .env.example            # Példa env fájl
├── netlify.toml
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

### **Build parancsok:**
```json
// package.json
{
  "name": "havikiadas",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "@tanstack/react-query": "^5.28.0",
    "recharts": "^2.12.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^3.3.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tooltip": "^1.0.7",
    "lucide-react": "^0.356.0",
    "framer-motion": "^11.0.0",
    "@react-pdf/renderer": "^3.4.0",
    "exceljs": "^4.4.0",
    "next-themes": "^0.2.1",
    "vaul": "^0.9.0",
    "sonner": "^1.4.0",
    "@upstash/ratelimit": "^1.0.0",
    "@upstash/redis": "^1.28.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "vitest": "^1.3.0",
    "@testing-library/react": "^14.2.0",
    "@playwright/test": "^1.42.0",
    "prettier": "^3.2.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

### **netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Environment variables (példa - valójában Netlify UI-ban állítsd be!)
[context.production.environment]
  NODE_ENV = "production"

[context.deploy-preview.environment]
  NODE_ENV = "development"
```

### **Environment változók (Netlify Dashboard):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Backend-only (SECRET!)

# Anthropic
ANTHROPIC_API_KEY=sk-ant-... # SECRET!

# Upstash Redis (Rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=... # SECRET!

# Next.js
NEXTAUTH_URL=https://havikiadas.netlify.app
NEXTAUTH_SECRET=... # openssl rand -base64 32

# Optional: Email (ha custom email service)
RESEND_API_KEY=re_... # vagy SendGrid
```

### **.env.example:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_api_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

---

## 12. FEJLESZTÉSI LÉPÉSEK (Sorrendben)

### **1. Fázis: Projekt setup** (1-2 nap)
- [x] Next.js 15 projekt inicializálás (`npx create-next-app@latest`)
- [ ] Tailwind CSS + shadcn/ui beállítás
- [ ] Supabase projekt létrehozás
- [ ] Adatbázis táblák létrehozása (SQL migration-ök)
- [ ] RLS policies beállítása
- [ ] Auth rendszer setup (email verification)
- [ ] Environment változók konfigurálás
- [ ] Git repo + GitHub kapcsolat

### **2. Fázis: Alapvető CRUD** (2-3 nap)
- [ ] Auth oldalak (login, register, verify-email, forgot-password)
- [ ] Protected routes middleware
- [ ] Dashboard layout komponens
- [ ] Hónapok kezelése (create, select, delete)
- [ ] Bevételek CRUD (form + table komponensek)
- [ ] Kiadások CRUD (form + table komponensek)
- [ ] Soft delete implementáció
- [ ] User-specifikus autocomplete (tétel nevek)
- [ ] Pagination komponens

### **3. Fázis: Költségvetés & összegzők** (2 nap)
- [ ] Költségvetési terv szerkesztő
- [ ] Kategóriánkénti számítások
- [ ] Információs tooltipek (Radix Tooltip)
- [ ] Ajánlott arányok kalkuláció
- [ ] Megtakarítás kezelés (CRUD)
- [ ] Havi összegző számítások
- [ ] Real-time frissítés (React Query invalidation)

### **4. Fázis: Vizualizáció** (2 nap)
- [ ] Recharts integráció
- [ ] Kördiagram komponens (költési megoszlás)
- [ ] Vonaldiagram komponens (havi trend)
- [ ] Reszponzív design finomítás
- [ ] Dark mode implementáció (next-themes)
- [ ] Skeleton loading states
- [ ] Chart interaktivitás (click, hover)

### **5. Fázis: AI integráció** (2 nap)
- [ ] Claude API setup (Anthropic SDK)
- [ ] PRO TIPP API endpoint (`/api/pro-tip`)
- [ ] Manuális generálás UI
- [ ] Verzionálás (ProTips táblában)
- [ ] Scheduled function (Netlify, hónap végén)
- [ ] Rate limiting (Upstash Redis)
- [ ] Újragenerálás funkció
- [ ] Tipp history UI (dropdown)

### **6. Fázis: Recurring Transactions** (2-3 nap)
- [ ] RecurringTransactions tábla + RLS
- [ ] Recurring form komponensek (income + expense)
- [ ] Recurring transactions management oldal
- [ ] Scheduled function (napi generálás)
- [ ] Next generation date kalkuláció
- [ ] Auto-deactivation (end_date elérése)
- [ ] UI: aktív/inaktív listák

### **7. Fázis: Export & extra funkciók** (2 nap)
- [ ] PDF export (`@react-pdf/renderer`)
  - Layout template
  - Tartalom generálás (táblázatok, grafikonok)
  - Letöltés funkció
- [ ] Excel export (`exceljs`)
  - Multi-sheet generálás
  - Formázás (pénznem, színek)
  - Letöltés funkció
- [ ] Email notifikációk (opcionális, Resend API)
  - Heti összefoglaló
  - Költségvetés túllépés alert

### **8. Fázis: Testing** (2-3 nap)
- [ ] Vitest + React Testing Library setup
- [ ] Unit tesztek (utils, validations)
- [ ] Component tesztek (forms, tables)
- [ ] API route tesztek (MSW mocking)
- [ ] Playwright setup
- [ ] E2E tesztek (kritikus flow-k):
  - [ ] Regisztráció → Email verify → Login
  - [ ] Bevétel/kiadás hozzáadás
  - [ ] Költségvetés szerkesztés
  - [ ] Pro Tipp generálás
  - [ ] Export (PDF/Excel)
- [ ] Accessibility audit (axe-core)

### **9. Fázis: Deployment & finalizálás** (1-2 nap)
- [ ] Netlify account + projekt létrehozás
- [ ] Environment változók beállítás
- [ ] Scheduled functions konfiguráció
- [ ] Első deployment (staging)
- [ ] Production tesztelés (több hónap, több felhasználó)
- [ ] Performance audit (Lighthouse)
- [ ] SEO optimalizálás (meta tagek, sitemap)
- [ ] PWA setup (manifest, service worker)
- [ ] Custom domain beállítás (opcionális)
- [ ] Monitoring setup (Sentry, Vercel Analytics, stb.)
- [ ] README dokumentáció (setup guide)

---

## 13. TESZTELÉSI CHECKLIST

### **Funkcionális tesztek:**
- [ ] Regisztráció működik (email verification küldése)
- [ ] Email verification link aktiválás
- [ ] Bejelentkezés/kijelentkezés
- [ ] Jelszó reset flow
- [ ] **Biztonsági teszt**: Több felhasználó szigorú adatelkülönítése
  - [ ] User A nem látja User B adatait (API tesztek)
  - [ ] RLS policies működnek (direkt Supabase query)
- [ ] Bevétel hozzáadás/szerkesztés/törlés
- [ ] Kiadás hozzáadás/szerkesztés/törlés (autocomplete)
- [ ] Recurring transactions:
  - [ ] Hozzáadás (income + expense)
  - [ ] Szerkesztés/törlés
  - [ ] Automatikus generálás (manuális trigger tesztelés)
- [ ] Költségvetési terv módosítás
- [ ] Megtakarítás hozzáadás/szerkesztés
- [ ] Hónap váltás (dropdown + quick nav gombok)
- [ ] Grafikonok helyesen jelennek meg (adatok megegyeznek)
- [ ] PRO TIPP generálás:
  - [ ] Manuális generálás
  - [ ] Újragenerálás (verzionálás)
  - [ ] History dropdown
  - [ ] Rate limiting (max 5/nap)
- [ ] PDF export:
  - [ ] Tartalom teljes és helyes
  - [ ] Formázás megfelelő
  - [ ] Letöltés működik
- [ ] Excel export:
  - [ ] 4 sheet létrejön
  - [ ] Adatok helyesek
  - [ ] Formázás (pénznem, színek)

### **UI/UX tesztek:**
- [ ] Mobil nézet (< 768px):
  - [ ] Hamburger menü működik
  - [ ] Táblázatok scroll-olhatók
  - [ ] Modals bottom sheet-ként jelennek meg (Vaul)
  - [ ] Touch-friendly gombok (min 44x44px)
- [ ] Tablet nézet (768-1279px)
- [ ] Desktop nézet (1280px+)
- [ ] Dark mode:
  - [ ] Toggle működik
  - [ ] Színek kontrasztos (accessibility)
  - [ ] localStorage perzisztencia
- [ ] Loading states:
  - [ ] Skeleton screen adatok betöltésekor
  - [ ] Spinner modálban (form submit)
  - [ ] Pro Tipp generálásnál
- [ ] Error handling:
  - [ ] Felhasználóbarát hibaüzenetek (toast notifications)
  - [ ] Form validációk (Zod)
  - [ ] Network error esetén (offline PWA)

### **Performance tesztek:**
- [ ] Lighthouse audit:
  - [ ] Performance: > 90
  - [ ] Accessibility: > 95
  - [ ] Best Practices: > 90
  - [ ] SEO: > 90
- [ ] Bundle size:
  - [ ] First Load JS: < 200 KB (Next.js report)
- [ ] Page load time: < 2s (3G network)
- [ ] React Query cache működik (újra betöltésnél gyors)

### **Security tesztek:**
- [ ] RLS bypass kísérlet (direkt SQL injection próba)
- [ ] XSS védelem (DOMPurify tesztelés)
- [ ] CSRF token validáció
- [ ] Rate limiting működik:
  - [ ] API endpoints: 100 req/perc
  - [ ] Pro Tipp: 5 generálás/nap
- [ ] Environment változók NEM láthatók frontend-en (API key leak check)

### **Böngésző kompatibilitás:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest - macOS/iOS)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### **Accessibility tesztek:**
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader (NVDA/JAWS):
  - [ ] Form labels olvashatók
  - [ ] ARIA live regions működnek
- [ ] Kontraszt arányok (WCAG AA):
  - [ ] Light mode: 4.5:1
  - [ ] Dark mode: 4.5:1
- [ ] Focus indicators láthatók

---

## 14. EXTRA MEGJEGYZÉSEK

### **Performance:**
- **Lazy loading**: Grafikonok, export komponensek
- **Code splitting**: Route-based automatic (Next.js)
- **Image optimization**: Next.js Image component
- **Font optimization**: `next/font` (Inter)
- **Database query optimization**: Indexek (már hozzáadva 3. szekcióban)

### **SEO:**
```tsx
// app/layout.tsx
export const metadata = {
  title: 'HaviKiadas - AI-alapú költségkövető',
  description: 'Kövesd havi bevételeid és kiadásaid AI-alapú tanácsokkal. Ingyenes, biztonságos, mobilbarát.',
  keywords: 'költségkövető, kiadások, bevételek, pénzügy, AI tanácsadás',
  openGraph: {
    title: 'HaviKiadas',
    description: 'AI-alapú havi költségkövető alkalmazás',
    url: 'https://havikiadas.netlify.app',
    siteName: 'HaviKiadas',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HaviKiadas - AI-alapú költségkövető',
    description: 'Kövesd havi bevételeid és kiadásaid AI tanácsokkal',
    images: ['/twitter-image.png'],
  },
};
```

### **Error Handling:**
```tsx
// app/error.tsx (Next.js error boundary)
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Hoppá, valami hiba történt!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Újrapróbálkozás</button>
    </div>
  );
}
```

```tsx
// Globális toast notifications (Sonner)
import { toast } from 'sonner';

toast.success('Kiadás sikeresen hozzáadva!');
toast.error('Nem sikerült menteni. Próbáld újra.');
toast.loading('Mentés folyamatban...');
```

### **Dátum kezelés (Magyar formátum):**
```typescript
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';

// 2026. január 15.
format(new Date(), 'yyyy. MMMM d.', { locale: hu });

// 2026.01.15
format(new Date(), 'yyyy.MM.dd', { locale: hu });
```

### **Monitoring & Analytics (Opcionális):**
```typescript
// Sentry setup (error tracking)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Vercel Analytics (performance)
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

---

## 15. NICE-TO-HAVE FUNKCIÓK (Későbbi fázisok)

### **Fázis 10+: Bővítések (opcionális)**
1. **Multi-currency support**
   - Ft mellett EUR, USD, GBP
   - API-based árfolyam frissítés (pl. exchangerate-api.com)
   - Konverzió táblázatokban

2. **Csoportos kategóriák (Sub-categories)**
   - Bevásárlás → Élelmiszer, Háztartási cikk, Kozmetikum
   - UI: nested dropdown

3. **Shared budget (családok/párok)**
   - Shared month táblák
   - Invitation system (email link)
   - Multi-user view permissions

4. **Spending alerts**
   - Push notifications (Progressive Web App)
   - Email alerts (heti összefoglaló)
   - "Túlköltöttél X kategóriában!" toast

5. **Goal tracking (célok)**
   - Új tábla: Goals (name, target_amount, deadline, current_amount)
   - Progress bar UI
   - Auto-update from savings

6. **Receipt upload**
   - Képek csatolása kiadásokhoz (Supabase Storage)
   - OCR (Google Vision API) - összeg kinyerése
   - Gallery view

7. **Dashboard widgets customization**
   - Drag & drop (dnd-kit)
   - User preferences (widget order, visibility)
   - localStorage vagy DB tárolás

8. **Trends & Insights**
   - "Tavaly ilyenkor X Ft-ot költöttél Bevásárlásra"
   - "Ez a kategória 15%-kal nőtt az elmúlt 3 hónapban"
   - AI-generated insights (havonta)

9. **Data export enhancements**
   - CSV export
   - JSON export (backup)
   - Import funkció (CSV/JSON)
   - Automatic backup (weekly email)

10. **Gamification**
    - Badges (pl. "3 hónap költségvetésen belül!")
    - Streak counter
    - Leaderboard (opt-in, anonymous)

---

# ÖSSZEFOGLALÁS

Ez a **v2.0 specifikáció** egy **production-ready, full-stack** havi költségkövető alkalmazást ír le, amely:

## ✅ **Főbb újítások az eredeti specifikációhoz képest:**
1. **AI modell ID frissítve** (`claude-sonnet-4-5-20250929`)
2. **Database indexek** hozzáadva (performance)
3. **ProTips verzionálás** (újragenerálás támogatás)
4. **Recurring Transactions** (ismétlődő tranzakciók, scheduled functions)
5. **Export részletek** specifikálva (PDF + Excel tartalom)
6. **Testing stratégia** kidolgozva (Vitest, Playwright)
7. **Security enhancements** (rate limiting, CSRF, input sanitization)
8. **Performance optimizations** (React Query, code splitting, PWA)
9. **Accessibility konkretizálva** (WCAG 2.1 AA, keyboard nav, ARIA)
10. **Dark mode** támogatás (next-themes)
11. **User-specifikus autocomplete** (tétel nevek tanulása)
12. **Pagination** (20 tétel/oldal)
13. **Soft delete** támogatás (minden táblában)
14. **Savings táblához dátum** mező

## 🎯 **Fókusz területek:**
1. **Biztonság**: RLS, rate limiting, CSRF, input sanitization
2. **UX**: Reszponzív, dark mode, autocomplete, optimistic UI
3. **AI tanácsok**: Claude API, verzionálás, scheduled generation
4. **Automatizáció**: Recurring transactions, scheduled functions
5. **Átláthatóság**: Grafikonok, összegzők, exportálás

## 🚀 **Kezdő lépések:**
1. Kövesd a **12. Fejlesztési lépések** sorrendjét
2. Kezdd az **1. Fázis: Projekt setup**-pal
3. Haladj lépésről lépésre, tesztelj folyamatosan
4. A **13. Tesztelési checklist** alapján validálj minden fázist

**Készíts egy production-ready, biztonságos, felhasználóbarát alkalmazást!** 💪

---

**Utolsó frissítés**: 2026.02.08
**Verzió**: 2.0
**Szerző**: AI-assisted specification
