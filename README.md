# 💰 HaviKiadas - Budget Tracking Application

Modern költségkövető alkalmazás Next.js 15 és Supabase technológiával.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

---

## 🚀 Project Status (2026.02.08)

### ✅ Completed Phases

#### Phase 1: Project Setup & Authentication
- ✅ Next.js 15 App Router setup
- ✅ Supabase integration
- ✅ Email/Password authentication with verification
- ✅ Protected routes with middleware
- ✅ Row-Level Security (RLS) policies
- ✅ Dark mode support

#### Phase 2: Month & Transaction Management
- ✅ Month CRUD operations
- ✅ Auto-create months on first access
- ✅ Month selector dropdown
- ✅ Month navigation (previous/next)

#### Phase 3: Income & Expense Tracking
- ✅ Income CRUD (4 source types: Fizetés, Utalás, Vállalkozás, Egyéb)
- ✅ Expense CRUD (8 categories: Bevásárlás, Szórakozás, etc.)
- ✅ Form validation with Zod (Hungarian error messages)
- ✅ Soft delete pattern
- ✅ Summary cards (total income, total expenses, balance)
- ✅ Income/Expense lists with edit/delete actions
- ✅ Dialog modals for forms
- ✅ Toast notifications
- ✅ Responsive design (mobile/tablet/desktop)

#### Phase 4: Budget Planning System
- ✅ Budget CRUD operations
- ✅ Category-based budget limits
- ✅ Budget vs. actual spending comparison
- ✅ Progress bars with color coding:
  - 🟢 Green: < 75% spent
  - 🟠 Orange: 75-90% spent
  - 🟡 Yellow: 90-100% spent
  - 🔴 Red: Over budget
- ✅ Budget overview component
- ✅ Batch budget updates (set all categories at once)

### ⚠️ Pending Action

**IMPORTANT**: Run the SQL migration for budgets table:
1. Open `CREATE_BUDGETS_TABLE.sql` in the project root
2. Go to Supabase Dashboard → SQL Editor
3. Copy and paste the entire SQL content
4. Click "Run" to execute

### 📋 Next Steps (Not Started)

- **Phase 5**: Charts & Visualizations (Recharts integration)
- **Phase 6**: AI PRO TIPP (Claude API for financial advice)
- **Phase 7**: Export functionality (PDF/Excel)
- **Phase 8**: Recurring transactions
- **Phase 9**: Savings goals
- **Phase 10**: Multi-month analytics

---

## 📦 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sarnyaia1/budgetbuddy.git
cd budgetbuddy
```

2. **Install dependencies:**
```bash
npm install
```

3. **Setup environment variables:**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional (for future AI features)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Get your Supabase credentials:
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to Settings → API
- Copy the Project URL and anon/public key

4. **Setup Supabase Database:**

Go to your Supabase project → SQL Editor and run the following SQL files:

**a) Create core tables** (if using migrations):
```bash
# If you have migration files in supabase/migrations/
# Run them in order
```

**b) Create budgets table (Phase 4 - NEW):**
```bash
# Open CREATE_BUDGETS_TABLE.sql in the project root
# Copy the entire content
# Paste into Supabase SQL Editor
# Click "Run"
```

The migration creates:
- `budgets` table with proper constraints
- RLS policies for security
- Indexes for performance
- Unique constraint (one budget per category per month per user)
- Trigger for automatic `updated_at` timestamp

5. **Start the development server:**
```bash
npm run dev
```

6. **Open the app:**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Database Schema

### Core Tables

1. **auth.users** (Supabase managed)
   - User authentication and profiles

2. **months**
   - `id` (UUID, primary key)
   - `user_id` (references auth.users)
   - `year` (integer, 2000-2100)
   - `month` (integer, 1-12)
   - `starting_balance` (decimal)
   - `created_at`, `updated_at`, `deleted_at`

3. **income**
   - `id` (UUID, primary key)
   - `user_id` (references auth.users)
   - `month_id` (references months)
   - `date` (date)
   - `amount` (decimal, > 0)
   - `source_type` (enum: Fizetés, Utalás, Vállalkozás, Egyéb)
   - `custom_source` (text, for "Egyéb")
   - `notes` (text)
   - `created_at`, `updated_at`, `deleted_at`

4. **expenses**
   - `id` (UUID, primary key)
   - `user_id` (references auth.users)
   - `month_id` (references months)
   - `date` (date)
   - `amount` (decimal, > 0)
   - `item_name` (text)
   - `category` (enum: see categories below)
   - `notes` (text)
   - `created_at`, `updated_at`, `deleted_at`

5. **budgets** ⬅️ NEW (Phase 4)
   - `id` (UUID, primary key)
   - `user_id` (references auth.users)
   - `month_id` (references months)
   - `category` (text, matches expense categories)
   - `budget_amount` (decimal, >= 0)
   - `created_at`, `updated_at`, `deleted_at`
   - **Unique constraint**: (month_id, category, user_id)

### Expense Categories (8)

1. Bevásárlás
2. Szórakozás
3. Vendéglátás
4. Extra
5. Utazás
6. Kötelező kiadás
7. Ruha
8. Sport

### Income Source Types (4)

1. Fizetés
2. Utalás
3. Vállalkozás
4. Egyéb (requires custom_source)

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript compiler check
npm run type-check

# Run linter
npm run lint
```

### Project Structure

```
havikiadas/
├── app/
│   ├── (auth)/                    # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-email/
│   ├── dashboard/                 # Main dashboard page
│   ├── actions/                   # Server Actions
│   │   ├── auth.ts               # Authentication actions
│   │   ├── months.ts             # Month CRUD
│   │   ├── income.ts             # Income CRUD
│   │   ├── expenses.ts           # Expense CRUD
│   │   └── budget.ts             # Budget CRUD (NEW)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                        # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── table.tsx
│   ├── forms/                     # Form components
│   │   ├── income-form.tsx
│   │   ├── expense-form.tsx
│   │   └── budget-form.tsx       # NEW
│   └── dashboard/                 # Dashboard components
│       ├── month-selector.tsx
│       ├── summary-cards.tsx
│       ├── income-list.tsx
│       ├── expense-list.tsx
│       └── budget-overview.tsx   # NEW
├── lib/
│   ├── supabase/                  # Supabase client setup
│   │   ├── client.ts
│   │   └── server.ts
│   ├── validations/               # Zod validation schemas
│   │   ├── auth.ts
│   │   ├── month.ts
│   │   ├── income.ts
│   │   ├── expense.ts
│   │   └── budget.ts             # NEW
│   ├── types/
│   │   └── database.ts           # TypeScript type definitions
│   └── utils.ts                   # Utility functions
├── CREATE_BUDGETS_TABLE.sql       # ⚠️ SQL migration file
├── .env.local                     # Environment variables (gitignored)
├── .env.example                   # Example env file
├── netlify.toml                   # Netlify configuration
├── SPECIFICATION.md               # Full project specification
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json
└── README.md
```

---

## 🚀 Deployment to Netlify

### Prerequisites

- GitHub repository (already setup: `sarnyaia1/budgetbuddy`)
- Netlify account

### Deployment Steps

1. **Create `netlify.toml` configuration:**

Already included in the project (see below).

2. **Push code to GitHub:**

```bash
git add .
git commit -m "feat: Ready for deployment"
git push origin master
```

3. **Connect to Netlify:**

- Go to [Netlify](https://app.netlify.com)
- Click **"Add new site"** → **"Import an existing project"**
- Choose **GitHub** and select `sarnyaia1/budgetbuddy`

4. **Configure build settings:**

Netlify should auto-detect from `netlify.toml`, but verify:

```
Build command: npm run build
Publish directory: .next
```

5. **Add environment variables:**

Go to **Site settings** → **Environment variables** and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Optional (for future AI features):
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

6. **Deploy:**

Click **"Deploy site"** and wait for the build to complete.

7. **Custom domain (optional):**

Go to **Site settings** → **Domain management** → **Add custom domain**

---

## 📝 Usage Guide

### 1. Register & Login

1. Navigate to `/register`
2. Create an account with email and password
3. Check your email inbox for verification link
4. Click the verification link
5. Login at `/login`

### 2. Dashboard Overview

After logging in, you'll see the main dashboard with:

- **Month Selector**: Choose or create a month
- **Summary Cards**: Total income, total expenses, and balance
- **Income Section**: List of all income transactions
- **Expense Section**: List of all expense transactions
- **Budget Section**: Budget planning and progress tracking (NEW)

### 3. Add Income

1. Click **"Új bevétel"** (New Income) button
2. Fill in the form:
   - **Dátum**: Date of income (default: today)
   - **Összeg**: Amount in HUF
   - **Forrás típusa**: Source type (Fizetés, Utalás, Vállalkozás, Egyéb)
   - **Forrás neve**: Custom source name (required if "Egyéb" selected)
   - **Megjegyzés**: Optional notes
3. Click **"Hozzáadás"** (Add) to save

### 4. Add Expense

1. Click **"Új kiadás"** (New Expense) button
2. Fill in the form:
   - **Dátum**: Date of expense (default: today)
   - **Tétel neve**: Item name (e.g., "Tesco bevásárlás")
   - **Összeg**: Amount in HUF
   - **Kategória**: Category (8 options)
   - **Megjegyzés**: Optional notes
3. Click **"Hozzáadás"** (Add) to save

### 5. Set Budget (NEW - Phase 4)

1. Scroll to **"Költségvetés"** section
2. If no budget exists, click **"Beállítás"** (Setup)
3. If budget exists, click **"Módosítás"** (Modify)
4. Set budget amounts for each category
5. View the total budget at the bottom
6. Click **"Költségvetés mentése"** (Save Budget)

### 6. Track Budget Progress

After setting budgets, you'll see:

- **Overall Summary Card**: Total budget vs. total spent
- **Category Cards**: Individual progress for each category

Progress bar colors:
- 🟢 **Green**: Less than 75% spent (on track)
- 🟠 **Orange**: 75-90% spent (warning)
- 🟡 **Yellow**: 90-100% spent (caution)
- 🔴 **Red**: Over budget (exceeded limit)

### 7. Edit Transactions

- Click the **pencil icon** (✏️) on any transaction
- Modify the fields in the modal
- Click **"Frissítés"** (Update) to save

### 8. Delete Transactions

- Click the **trash icon** (🗑️) on any transaction
- Confirm the deletion
- Transaction will be soft-deleted (marked as deleted, not removed)

### 9. Switch Months

Use the month selector dropdown to:
- View different months
- Create new months automatically
- Navigate to previous/next month

---

## 🔐 Security Features

### Row-Level Security (RLS)

All database tables have RLS policies that ensure:
- Users can only access their own data
- No user can view or modify another user's transactions
- Automatic filtering by `user_id` on all queries

### Data Protection

- **Soft Delete**: Records are marked as deleted (`deleted_at`) instead of being permanently removed
- **Input Validation**: Zod schemas validate all form inputs with Hungarian error messages
- **Authentication**: Protected routes require valid authentication
- **SQL Injection Protection**: Parameterized queries via Supabase client

### Best Practices

- Environment variables are never committed to Git (`.env.local` in `.gitignore`)
- Sensitive keys (API keys, service role keys) should only be used server-side
- HTTPS enforced in production (Netlify default)

---

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (Radix UI) |
| **Forms** | react-hook-form + Zod |
| **Notifications** | sonner (toast) |
| **Icons** | Lucide React |
| **Date Handling** | date-fns |
| **Language** | TypeScript 5.3 |
| **Deployment** | Netlify |

---

## 🐛 Troubleshooting

### Issue: "Not authenticated" error

**Solution**:
1. Make sure you're logged in
2. Check if your session has expired (login again)
3. Verify that cookies are enabled in your browser

### Issue: Budget section not visible

**Solution**:
1. Ensure you've run the `CREATE_BUDGETS_TABLE.sql` migration
2. Check Supabase Dashboard → Table Editor → verify "budgets" table exists
3. Refresh your browser

### Issue: "Cannot read properties of undefined"

**Solution**:
1. Check browser console for specific error
2. Verify all environment variables are set correctly in `.env.local`
3. Restart the development server (`npm run dev`)

### Issue: Dark mode not persisting

**Solution**:
1. Check browser localStorage is enabled
2. Allow cookies for the site
3. Clear browser cache and reload

### Issue: Form validation errors in Hungarian not showing

**Solution**:
1. Check Zod schema definitions in `lib/validations/`
2. Verify error messages are correctly mapped
3. Check browser console for JavaScript errors

### Issue: Supabase connection error

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
2. Check Supabase project status (not paused)
3. Verify RLS policies are enabled (not blocking queries)

---

## 📚 Additional Documentation

- [SPECIFICATION.md](./SPECIFICATION.md) - Full project specification with detailed requirements
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- GitHub Issues: [github.com/sarnyaia1/budgetbuddy/issues](https://github.com/sarnyaia1/budgetbuddy/issues)
- Create a new issue with detailed description

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🎯 Roadmap

### Phase 5: Charts & Visualizations (Coming Soon)
- Pie chart for expense breakdown by category
- Line chart for monthly trends
- Interactive tooltips

### Phase 6: AI PRO TIPP (Coming Soon)
- Claude API integration
- Personalized financial advice
- Monthly AI-generated tips

### Phase 7: Export Functionality (Coming Soon)
- PDF export with detailed reports
- Excel export with multiple sheets
- Email reports

### Phase 8: Recurring Transactions (Coming Soon)
- Setup recurring income (e.g., monthly salary)
- Setup recurring expenses (e.g., subscriptions)
- Automatic transaction generation

### Phase 9: Savings Goals (Coming Soon)
- Set savings targets
- Track progress towards goals
- Visual progress indicators

### Phase 10: Advanced Analytics (Coming Soon)
- Multi-month comparisons
- Spending trends
- Category insights

---

**Last Updated**: 2026.02.08
**Current Version**: Phase 4 (Budget Planning System)
**Repository**: [github.com/sarnyaia1/budgetbuddy](https://github.com/sarnyaia1/budgetbuddy)
