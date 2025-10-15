// lib/formatters.ts
import { UseCase, DifficultyLevel } from './types';
import { frameworks } from './data';

// Bold numbers in results
export function formatResult(result: string): string {
  return result.replace(/(\d+%|\d+x|\d+\+|£\d+|€\d+|\$\d+|\d+ days|\d+ hours|\d+ minutes)/g, '<strong>$1</strong>');
}

// Extract metric from result string
export function extractMetric(result: string): string | null {
  const match = result.match(/(\d+%|\d+x|\d+\+)/);
  return match ? match[1] : null;
}

// Get difficulty level for a use case
export function getDifficultyLevel(useCase: UseCase): DifficultyLevel {
  // Try to find matching framework
  const framework = frameworks.find(f =>
    f.typical_use_cases.toLowerCase().includes(useCase.use_case_category.toLowerCase()) ||
    f.examples.some(ex => ex.toLowerCase().includes(useCase.organization.toLowerCase()))
  );

  if (!framework?.difficulty_level) return 'Medium';

  if (framework.difficulty_level.includes('Very High')) return 'Very High';
  if (framework.difficulty_level.includes('High')) return 'High';
  if (framework.difficulty_level.includes('Medium')) return 'Medium';
  return 'Low';
}

// Get timeline estimate based on difficulty
export function getTimelineEstimate(useCase: UseCase): string {
  const difficulty = getDifficultyLevel(useCase);

  const timelineMap: Record<DifficultyLevel, string> = {
    'Low': '3-6 months',
    'Medium': '6-12 months',
    'High': '12-18 months',
    'Very High': '18+ months'
  };

  return timelineMap[difficulty];
}

// Get investment level based on difficulty
export function getInvestmentLevel(useCase: UseCase): string {
  const difficulty = getDifficultyLevel(useCase);

  const investmentMap: Record<DifficultyLevel, string> = {
    'Low': 'Low-Medium',
    'Medium': 'Medium',
    'High': 'Medium-High',
    'Very High': 'High'
  };

  return investmentMap[difficulty];
}

// Get ROI timeline based on difficulty
export function getROITimeline(useCase: UseCase): string {
  const difficulty = getDifficultyLevel(useCase);

  const roiMap: Record<DifficultyLevel, string> = {
    'Low': '6-12 months',
    'Medium': '12-18 months',
    'High': '18-24 months',
    'Very High': '24-36+ months'
  };

  return roiMap[difficulty];
}

// Truncate text to specified length
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Format date to readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
