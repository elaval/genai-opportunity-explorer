// lib/data.ts
import atlasDataJson from '@/data/atlas_data_v2.json';
import { AtlasData, UseCase, Framework, ImplementationGuide, InterventionTaxonomy } from './types';

const atlasData = atlasDataJson as AtlasData;

export const useCases: UseCase[] = atlasData.use_cases;
export const frameworks: Framework[] = atlasData.frameworks;
export const implementationGuide: ImplementationGuide[] = atlasData.implementation_guide;
export const interventionTaxonomy: InterventionTaxonomy[] = atlasData.intervention_taxonomy;

// Get all unique industries
export const getIndustries = (): string[] => {
  const industries = useCases.map(uc => uc.industry);
  return Array.from(new Set(industries)).sort();
};

// Get all unique sectors
export const getSectors = (): string[] => {
  const sectors = useCases.map(uc => uc.sector);
  return Array.from(new Set(sectors)).sort();
};

// Get use case by ID
export const getUseCaseById = (id: string): UseCase | undefined => {
  return useCases.find(uc => uc.id === id);
};
