// lib/filters.ts
import { UseCase, Goal, Timeline, DifficultyLevel, Framework } from './types';
import { frameworks } from './data';

// Map user goal selections to keywords in results
export const goalKeywords: Record<Goal, string[]> = {
  'work-faster': ['time', 'faster', 'speed', 'hours', 'minutes', 'reduction', 'automated', 'quick', 'saved', 'week', 'days'],
  'work-better': ['quality', 'accuracy', 'satisfaction', 'improvement', 'better', 'enhanced', 'outcomes'],
  'work-at-scale': ['scale', 'capacity', 'volume', 'served', 'handled', 'reach', 'expansion', 'equivalent to']
};

// Map timeline selections to difficulty levels
export const timelineDifficulty: Record<Timeline, string[]> = {
  'quick-wins': ['Low', 'Low to Medium'],
  'balanced': ['Medium', 'Medium to High'],
  'transformative': ['High', 'Very High']
};

// Get difficulty level from use case based on frameworks
const getDifficultyFromFramework = (useCase: UseCase): string | null => {
  // Try to find matching framework
  const framework = frameworks.find(f =>
    f.typical_use_cases.toLowerCase().includes(useCase.use_case_category.toLowerCase()) ||
    f.examples.some(ex => ex.toLowerCase().includes(useCase.organization.toLowerCase()))
  );

  return framework?.difficulty_level || null;
};

// Main filtering function
export function filterOpportunities(
  useCases: UseCase[],
  goal: Goal | null,
  timeline: Timeline | null,
  industry: string | null
): UseCase[] {
  let filtered = [...useCases];

  // Filter by goal (keyword matching in results)
  if (goal) {
    const keywords = goalKeywords[goal];
    filtered = filtered.filter(uc =>
      uc.results.some(result =>
        keywords.some(keyword => result.toLowerCase().includes(keyword.toLowerCase()))
      ) || uc.challenge.toLowerCase().includes('time') || uc.solution.toLowerCase().includes('time')
    );
  }

  // Filter by timeline (difficulty level matching)
  if (timeline) {
    const difficultyLevels = timelineDifficulty[timeline];
    filtered = filtered.filter(uc => {
      const difficulty = getDifficultyFromFramework(uc);
      if (!difficulty) return false;
      return difficultyLevels.some(level =>
        difficulty.includes(level)
      );
    });
  }

  // Filter by industry
  if (industry && industry !== 'All') {
    filtered = filtered.filter(uc => uc.industry === industry);
  }

  return filtered;
}

// Sort opportunities
export function sortOpportunities(
  opportunities: UseCase[],
  sortBy: 'difficulty' | 'timeline' | 'industry' | 'recent'
): UseCase[] {
  const sorted = [...opportunities];

  switch (sortBy) {
    case 'difficulty':
      const difficultyOrder = ['Low', 'Medium', 'High', 'Very High'];
      return sorted.sort((a, b) => {
        const aDiff = getDifficultyFromFramework(a);
        const bDiff = getDifficultyFromFramework(b);
        const aIndex = difficultyOrder.findIndex(d => aDiff?.includes(d));
        const bIndex = difficultyOrder.findIndex(d => bDiff?.includes(d));
        return aIndex - bIndex;
      });

    case 'industry':
      return sorted.sort((a, b) =>
        a.industry.localeCompare(b.industry)
      );

    case 'recent':
      return sorted.sort((a, b) =>
        new Date(b.last_reviewed).getTime() - new Date(a.last_reviewed).getTime()
      );

    default:
      return sorted;
  }
}

// Get related cases based on industry or category
export function getRelatedCases(
  currentCase: UseCase,
  allCases: UseCase[],
  limit: number = 3
): UseCase[] {
  return allCases
    .filter(uc => uc.id !== currentCase.id)
    .filter(uc => {
      // Same industry or same use case category
      const sameIndustry = uc.industry === currentCase.industry;
      const sameCategory = uc.use_case_category === currentCase.use_case_category;
      return sameIndustry || sameCategory;
    })
    .slice(0, limit);
}

// Calculate fit score for assessment recommendations
export function calculateFitScore(
  useCase: UseCase,
  answers: {
    goal: Goal | null;
    industry: string | null;
    orgSize: string | null;
    timeline: Timeline | null;
  }
): number {
  let score = 0;

  // Exact industry match: +10
  if (useCase.industry === answers.industry) score += 10;

  // Organization size match (smaller org = prefer lower difficulty)
  const difficulty = getDifficultyFromFramework(useCase);
  if (answers.orgSize === 'Small' && difficulty?.includes('Low')) score += 5;
  if (answers.orgSize === 'Medium' && difficulty?.includes('Medium')) score += 5;
  if (answers.orgSize === 'Large') score += 3;

  // Timeline alignment
  if (answers.timeline) {
    const timelineLevels = timelineDifficulty[answers.timeline];
    if (difficulty && timelineLevels.some(level => difficulty.includes(level))) {
      score += 5;
    }
  }

  // Goal match
  if (answers.goal) {
    const keywords = goalKeywords[answers.goal];
    const hasGoalMatch = useCase.results.some(result =>
      keywords.some(keyword => result.toLowerCase().includes(keyword.toLowerCase()))
    );
    if (hasGoalMatch) score += 8;
  }

  return score;
}
