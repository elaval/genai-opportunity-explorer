'use client';

// components/OpportunityCard.tsx
import Link from 'next/link';
import { UseCase } from '@/lib/types';
import { DifficultyBadge } from './DifficultyBadge';
import { VerificationBadge } from './VerificationBadge';
import { getDifficultyLevel, getTimelineEstimate, formatResult } from '@/lib/formatters';
import { useAppState } from '@/lib/context';

interface OpportunityCardProps {
  useCase: UseCase;
}

export function OpportunityCard({ useCase }: OpportunityCardProps) {
  const { state, dispatch } = useAppState();
  const isSaved = state.savedOpportunities.includes(useCase.id);
  const difficulty = getDifficultyLevel(useCase);
  const timeline = getTimelineEstimate(useCase);

  const handleSave = () => {
    if (isSaved) {
      dispatch({ type: 'REMOVE_OPPORTUNITY', payload: useCase.id });
    } else {
      dispatch({ type: 'SAVE_OPPORTUNITY', payload: useCase.id });
    }
  };

  return (
    <div className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="font-bold text-xl text-gray-900 mb-2 leading-tight">{useCase.organization}</h3>
          <span className="inline-flex items-center text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {useCase.industry}
          </span>
        </div>
        <div className="flex-shrink-0">
          <VerificationBadge source={useCase.sources[0]} />
        </div>
      </div>

      {/* Use Case Category - Prominent */}
      <h4 className="font-semibold text-base mb-3 text-blue-600 leading-snug">
        {useCase.use_case_category}
      </h4>

      {/* Challenge - Better Typography */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
          <span className="font-semibold text-gray-700">The Challenge:</span> {useCase.challenge}
        </p>
      </div>

      {/* Results - Enhanced */}
      <div className="mb-5 flex-1">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Key Results</p>
        <ul className="space-y-2">
          {useCase.results.slice(0, 3).map((result, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span
                className="text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: formatResult(result)
                }}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Meta - Better Spacing */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-200">
        <DifficultyBadge level={difficulty} />
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <span>⏱️</span>
          <span className="font-medium">{timeline}</span>
        </div>
      </div>

      {/* Actions - Prominent Buttons */}
      <div className="flex gap-3 mt-auto">
        <Link
          href={`/cases/${useCase.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition-all duration-200 text-center shadow-sm hover:shadow-md"
        >
          View Details →
        </Link>
        <button
          onClick={handleSave}
          className={`border-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isSaved
              ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
              : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
          }`}
          aria-label={isSaved ? 'Remove from collection' : 'Save to collection'}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>
    </div>
  );
}
