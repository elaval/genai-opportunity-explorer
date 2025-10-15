'use client';

// components/GoalCard.tsx
import { Goal, Timeline } from '@/lib/types';
import { useCases } from '@/lib/data';
import { filterOpportunities } from '@/lib/filters';
import { useState } from 'react';

interface GoalCardProps {
  goal: Goal;
  title: string;
  description: string;
  icon: string;
  typicalImpact: string;
  exampleOrg: string;
  exampleResult: string;
  onShowOpportunities: (goal: Goal, timeline: Timeline) => void;
}

export function GoalCard({
  goal,
  title,
  description,
  icon,
  typicalImpact,
  exampleOrg,
  exampleResult,
  onShowOpportunities
}: GoalCardProps) {
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(null);

  const timelineOptions: { value: Timeline; label: string; range: string }[] = [
    { value: 'quick-wins', label: 'Quick Wins', range: '3-6 months' },
    { value: 'balanced', label: 'Balanced Impact', range: '6-18 mo' },
    { value: 'transformative', label: 'Transformative', range: '18+ mo' }
  ];

  const getOpportunityCount = (timeline: Timeline): number => {
    return filterOpportunities(useCases, goal, timeline, null).length;
  };

  const handleClick = () => {
    if (selectedTimeline) {
      onShowOpportunities(goal, selectedTimeline);
    }
  };

  return (
    <div className="group bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-200">
      {/* Header with Icon */}
      <div className="flex items-start gap-4 mb-6">
        <div className="text-5xl leading-none flex-shrink-0" role="img" aria-label={title}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{title}</h3>
          <p className="text-base text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Typical Impact - Highlighted */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-semibold text-blue-900 text-center">{typicalImpact}</p>
      </div>

      {/* Featured Example - Enhanced Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Featured Example</p>
        <p className="text-base font-bold text-gray-900 mb-1">{exampleOrg}</p>
        <p className="text-sm text-gray-700 leading-relaxed">{exampleResult}</p>

        {/* Source Badge - Integrated */}
        <div className="flex items-center gap-1 mt-3 text-xs">
          <span className="text-green-600 font-bold">✓</span>
          <span className="text-gray-600 font-medium">Verified Source</span>
        </div>
      </div>

      {/* Timeline Selection - Better Spacing */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Select Timeline:</p>
        {timelineOptions.map((option) => {
          const count = getOpportunityCount(option.value);
          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedTimeline === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`timeline-${goal}`}
                value={option.value}
                checked={selectedTimeline === option.value}
                onChange={() => setSelectedTimeline(option.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
              <div className="flex-1 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900 block">{option.label}</span>
                  <span className="text-xs text-gray-500">({option.range})</span>
                </div>
                <span className="text-sm font-bold text-blue-600 whitespace-nowrap">
                  {count} {count === 1 ? 'opportunity' : 'opportunities'}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Action Button - Prominent */}
      <button
        onClick={handleClick}
        disabled={!selectedTimeline}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-base transition-all duration-200 ${
          selectedTimeline
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {selectedTimeline
          ? `Show ${getOpportunityCount(selectedTimeline)} Opportunities ↓`
          : 'Select a timeline to continue'}
      </button>
    </div>
  );
}
