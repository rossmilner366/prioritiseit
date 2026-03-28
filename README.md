# PrioritiseIt

Feature prioritisation for product teams. Score, rank, and share with stakeholders — no login required for viewers.

## Quick start

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Providers** and enable:
   - **Email** (magic link — already enabled by default)
   - **Google** (optional — add your OAuth credentials)
4. Go to **Authentication → URL Configuration** and add your Netlify domain to **Redirect URLs**: `https://your-app.netlify.app`

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your Supabase credentials from **Settings → API**:
- `VITE_SUPABASE_URL` — your project URL
- `VITE_SUPABASE_ANON_KEY` — your anon/public key

### 3. Run locally

```bash
npm install
npm run dev
```

### 4. Deploy to Netlify

1. Push to GitHub
2. Connect the repo in [Netlify](https://app.netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Update Supabase **Redirect URLs** with your Netlify domain

## Features

- **RICE & ICE scoring** — choose per board
- **Drag-and-drop ranking** — manual override with visual pin indicator
- **Shareable stakeholder view** — one-click public link, no login needed
- **2×2 impact/effort matrix** — scatter plot with quadrant labels
- **Inline editing** — click any score to edit
- **Status tracking** — backlog → planned → in progress → done
- **Dark mode** — because PMs work at night too

## Tech stack

- Vite + React
- Tailwind CSS
- Supabase (PostgreSQL, Auth, RLS)
- Recharts (matrix view)
- dnd-kit (drag-and-drop)
- Netlify (hosting)

## Project structure

```
src/
├── components/
│   ├── MatrixView.jsx      # 2×2 scatter plot
│   ├── ScoringTable.jsx    # Main scoring table with DnD
│   ├── ShareModal.jsx      # Share link modal
│   └── Sidebar.jsx         # Navigation sidebar
├── hooks/
│   ├── useAuth.js          # Supabase auth
│   ├── useBoards.js        # Board CRUD
│   └── useItems.js         # Item CRUD + reorder
├── lib/
│   └── supabase.js         # Client config
├── pages/
│   ├── AuthPage.jsx        # Login page
│   ├── BoardView.jsx       # Board detail page
│   ├── Dashboard.jsx       # All boards grid
│   └── ShareView.jsx       # Public share page
├── App.jsx
├── index.css
└── main.jsx
supabase/
└── schema.sql              # Full schema + RLS policies
```
