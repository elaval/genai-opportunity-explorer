// lib/types.ts

export interface Source {
  url: string;
  publisher: string;
  footnote: string;
}

export interface UseCase {
  id: string;
  organization: string;
  sector: 'Private' | 'Public' | 'Nonprofit' | 'Public/Education';
  industry: string;
  use_case_category: string;
  specific_application: string;
  challenge: string;
  solution: string;
  results: string[];
  key_insight: string;
  sources: Source[];
  tags: string[];
  last_reviewed: string;
}

export interface Framework {
  intervention_type: string;
  sub_category: string;
  value_proposition: string;
  typical_use_cases: string;
  difficulty_level: string;
  technology_maturity: string;
  time_to_value: string;
  investment_level: string;
  key_success_factors: string;
  common_challenges: string;
  ROI_timeline: string;
  examples: string[];
}

export interface ImplementationGuide {
  dimension: string;
  category: string;
  top_use_cases: string[];
  primary_value: string;
  typical_ROI: string;
  quick_wins: string[];
  strategic_plays: string[];
  key_sources: string[];
}

export interface InterventionTaxonomy {
  id: string;
  name: string;
  definition: string;
  examples: string | null;
  typical_value: string | null;
  typical_difficulty: string;
  tech: string[];
  recommended_metrics: string | null;
  time_to_value: string | null;
  success_factors: string;
  last_reviewed: string;
}

export type Goal = 'work-faster' | 'work-better' | 'work-at-scale';
export type Timeline = 'quick-wins' | 'balanced' | 'transformative';
export type DifficultyLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface AtlasData {
  use_cases: UseCase[];
  frameworks: Framework[];
  implementation_guide: ImplementationGuide[];
  intervention_taxonomy: InterventionTaxonomy[];
}

export interface SearchQuery {
  goal: string;
  timeline: string;
  industry?: string;
  timestamp: number;
}

export interface UserPreferences {
  view?: 'grid' | 'list';
  sort?: string;
}

export interface AppState {
  savedOpportunities: string[];
  recentSearches: SearchQuery[];
  preferences: UserPreferences;
}
