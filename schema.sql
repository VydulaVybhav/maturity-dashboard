CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  color_from text NOT NULL,
  color_to text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);
CREATE TABLE public.operational_domains (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT operational_domains_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contributors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  domain_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type = ANY (ARRAY['metric'::text, 'checklist'::text, 'activity'::text])),
  status text NOT NULL DEFAULT 'in_progress'::text CHECK (status = ANY (ARRAY['compliant'::text, 'in_progress'::text, 'at_risk'::text, 'non_compliant'::text])),
  maturity_level integer NOT NULL DEFAULT 1 CHECK (maturity_level >= 1 AND maturity_level <= 3),
  target_quarter text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contributors_pkey PRIMARY KEY (id),
  CONSTRAINT contributors_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.operational_domains(id)
);
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  team_id uuid,
  contributor_id uuid,
  person_name text,
  achieved_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id),
  CONSTRAINT achievements_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.contributors(id),
  CONSTRAINT achievements_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);


CREATE TABLE public.status_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  contributor_id uuid NOT NULL,
  status text NOT NULL,
  maturity_level integer NOT NULL,
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT status_history_pkey PRIMARY KEY (id),
  CONSTRAINT status_history_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.contributors(id)
);
CREATE TABLE public.team_contributors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  contributor_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_contributors_pkey PRIMARY KEY (id),
  CONSTRAINT team_contributors_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES public.contributors(id),
  CONSTRAINT team_contributors_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
