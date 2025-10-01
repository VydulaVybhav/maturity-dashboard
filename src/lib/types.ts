// src/lib/types.ts

// ===== TEAM TYPES =====
export interface Team {
  id: string;
  name: string;
  color_from: string;
  color_to: string;
  created_at: string;
  updated_at: string;
}

// ===== OPERATIONAL MODEL TYPES =====
export interface OperationalDomain {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type ContributorType = 'metric' | 'checklist' | 'activity';
export type ContributorStatus = 'compliant' | 'in_progress' | 'at_risk' | 'non_compliant';

export interface Contributor {
  id: string;
  domain_id: string;
  name: string;
  description?: string;
  type: ContributorType;
  status: ContributorStatus;
  maturity_level: 1 | 2 | 3; // Ad hoc / Organized / Adaptive
  target_quarter?: string;
  created_at: string;
  updated_at: string;
  domain?: OperationalDomain;
  teams?: Team[];
  team_contributors?: Array<{ team: Team }>;
}

export interface TeamContributor {
  id: string;
  team_id: string;
  contributor_id: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  team_id?: string;
  contributor_id?: string;
  person_name?: string;
  achieved_at: string;
  created_at: string;
  team?: Team;
  contributor?: Contributor;
}

export interface StatusHistory {
  id: string;
  contributor_id: string;
  status: ContributorStatus;
  maturity_level: number;
  recorded_at: string;
}

// ===== DASHBOARD METRICS =====
export interface DashboardMetrics {
  // SLA Metrics
  slaCompliance: {
    requests: number; // percentage 0-100
    changeTasks: number;
    incidents: number;
    overall: number;
  };

  // Domain Health
  domainHealth: {
    operationalReliability: number; // 1-3 maturity score
    resilienceRecovery: number;
    continuousImprovement: number;
    overall: number;
  };

  // Status Counts
  statusCounts: {
    compliant: number;
    inProgress: number;
    atRisk: number;
    nonCompliant: number;
  };

  // Team Stats
  totalTeams: number;
  activeContributors: number;
  recentAchievements: number;
}

// ===== LEGACY TYPES (for backwards compatibility during migration) =====
export interface CapabilityDomain {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Capability {
  id: string;
  domain_id: string;
  name: string;
  description?: string;
  current_maturity: number;
  target_maturity: number;
  trend: 'up' | 'down' | 'stable';
  velocity: number;
  target_quarter: string;
  created_at: string;
  updated_at: string;
  domain?: CapabilityDomain;
  teams?: Team[];
}

export interface TeamCapability {
  id: string;
  team_id: string;
  capability_id: string;
  created_at: string;
}

export interface MaturityHistory {
  id: string;
  capability_id: string;
  maturity_level: number;
  recorded_at: string;
}
