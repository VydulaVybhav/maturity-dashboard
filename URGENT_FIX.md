# URGENT: Schema Migration Issue

## Problem
Supabase PostgREST API **does not support** schema prefixes like `edw.contributors` in the `.from()` method.

The queries like:
```typescript
supabase.from('edw.contributors').select('*')
```

Will **NOT work**. Supabase PostgREST only exposes tables from the schema configured in your Supabase settings.

## Solution Options

### Option 1: Configure Supabase to Use 'edw' Schema (RECOMMENDED)
This makes Supabase expose all tables from the `edw` schema instead of `public`:

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Scroll to **"Exposed schemas"**
3. Add `edw` to the list of exposed schemas
4. Set `edw` as the **default schema** for PostgREST

Then revert all code changes back to use table names without prefixes:
```typescript
// This will work after configuring Supabase
supabase.from('contributors').select('*')
```

### Option 2: Keep Tables in 'public' Schema (QUICKEST FIX)
Don't move tables to `edw` schema. Instead:

1. **DON'T run** the `migration_archive_legacy_tables.sql`
2. Just drop the legacy tables:
```sql
DROP TABLE IF EXISTS public.team_capabilities CASCADE;
DROP TABLE IF EXISTS public.maturity_history CASCADE;
DROP TABLE IF EXISTS public.capabilities CASCADE;
DROP TABLE IF EXISTS public.capability_domains CASCADE;
```
3. Keep all operational tables in `public` schema
4. Revert all code changes to use table names without `edw.` prefix

### Option 3: Use Postgres Views in 'public' (WORKAROUND)
Create views in the `public` schema that point to `edw` tables:

```sql
-- Move tables to edw
CREATE SCHEMA IF NOT EXISTS edw;
ALTER TABLE public.teams SET SCHEMA edw;
-- ... etc

-- Create views in public that reference edw
CREATE OR REPLACE VIEW public.teams AS SELECT * FROM edw.teams;
CREATE OR REPLACE VIEW public.contributors AS SELECT * FROM edw.contributors;
-- ... etc
```

## Immediate Action Required

**We need to revert ALL the code changes** and choose one of the options above.

The safest and quickest fix is **Option 2** - keep everything in `public` schema and just delete legacy tables.
