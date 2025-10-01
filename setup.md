# 1. Create Next.js app
npx create-next-app@latest maturity-dashboard --typescript --tailwind --app 

# 2. Install Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 3. Install Lucide icons
npm install lucide-react

# 4. Create Supabase project at supabase.com

# 5. Run migration
 In Supabase dashboard: SQL Editor → paste migration file → Run

# 6. Add environment variables to .env.local

# 7. Generate TypeScript types
npx supabase gen types typescript --project-id your-project-ref > lib/supabase/database.types.ts


maturity-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── capabilities/
│   │   └── page.tsx
│   ├── roadmap/
│   │   └── page.tsx
│   └── admin/
│       ├── teams/
│       │   └── page.tsx
│       ├── domains/
│       │   └── page.tsx
│       └── capabilities/
│           └── page.tsx
├── components/
│   ├── navigation/
│   │   └── NavBar.tsx
│   ├── dashboard/
│   │   ├── MetricsGrid.tsx
│   │   └── DomainHealth.tsx
│   ├── capabilities/
│   │   └── CapabilityCard.tsx
│   └── roadmap/
│       └── QuarterView.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── types.ts
└── supabase/
    └── migrations/
        └── 20250101000000_initial_schema.sql



        Domain	Contributor / Focus Area	Type / Evidence	Status / Maturity
Operational Reliability	SLA Adherence – Requests	Metric	Check / Ignore / X
	SLA Adherence – Change Tasks	Metric	Check / Ignore / X
	SLA Adherence – Incidents	Metric	Check / Ignore / X
Resilience & Recovery	DR Checklist	Checklist / Practice	Check / Ignore / X
Continuous Improvement	Process Updates	Activity / Practice	Check / Ignore / X
	Lessons Learned Applied	Activity / Practice	Check / Ignore / X

Domain Maturity Levels (qualitative):

Level 1: Ad hoc / inconsistent

Level 2: Organized / generally reliable

Level 3: Adaptive / thriving

✅ Notes on structure:

Operational Reliability: focused specifically on SLA adherence for Requests, Change Tasks, and Incidents.

Resilience & Recovery: focused on DR Checklist items (can be expanded with sub-items as needed).

Continuous Improvement: remains flexible for multiple activities/practices.

If you want, I can expand the two contributors in CI and Resilience with sub-items in a clean, leadership-