// components/DifficultyBadge.tsx
import { DifficultyLevel } from '@/lib/types';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
}

const difficultyConfig = {
  'Low': { colorClass: 'bg-green-100 text-green-800', emoji: '🟢' },
  'Medium': { colorClass: 'bg-yellow-100 text-yellow-800', emoji: '🟡' },
  'High': { colorClass: 'bg-orange-100 text-orange-800', emoji: '🟠' },
  'Very High': { colorClass: 'bg-red-100 text-red-800', emoji: '🔴' }
};

export function DifficultyBadge({ level }: DifficultyBadgeProps) {
  const config = difficultyConfig[level];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.colorClass}`}>
      <span>{config.emoji}</span>
      <span>{level}</span>
    </span>
  );
}
