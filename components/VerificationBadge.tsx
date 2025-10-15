// components/VerificationBadge.tsx
import { Source } from '@/lib/types';

interface VerificationBadgeProps {
  source: Source;
}

export function VerificationBadge({ source }: VerificationBadgeProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-green-600">✓</span>
      <span className="text-gray-600">Verified</span>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline ml-1"
        title={`Source: ${source.publisher}`}
      >
        {source.publisher}
      </a>
    </div>
  );
}
