'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { OpportunityCard } from '@/components/OpportunityCard';
import { useCases, getIndustries } from '@/lib/data';
import { calculateFitScore, filterOpportunities } from '@/lib/filters';
import type { Goal, Timeline } from '@/lib/types';

type OrgSize = 'Small' | 'Medium' | 'Large';

type Answers = {
  goal: Goal | null;
  industry: string | null;
  orgSize: OrgSize | null;
  timeline: Timeline | null;
};

const steps = [
  { id: 1, title: 'Pick your priority' },
  { id: 2, title: 'Tell us about your context' },
  { id: 3, title: 'Choose your timeline' },
] as const;

const goalOptions: Array<{
  value: Goal;
  title: string;
  description: string;
  emoji: string;
}> = [
  {
    value: 'work-faster',
    title: 'Move faster',
    description: 'Automate work, shrink cycle times, and unlock staff capacity.',
    emoji: '⚡',
  },
  {
    value: 'work-better',
    title: 'Improve quality',
    description: 'Boost accuracy, consistency, and service quality for end users.',
    emoji: '🎯',
  },
  {
    value: 'work-at-scale',
    title: 'Expand reach',
    description: 'Serve more people, channels, or products without increasing headcount.',
    emoji: '📈',
  },
];

const orgSizeOptions: Array<{ value: OrgSize; label: string; hint: string }> = [
  {
    value: 'Small',
    label: 'Small (0-1K employees)',
    hint: 'Lean teams, scrappy pilots, quick approvals.',
  },
  {
    value: 'Medium',
    label: 'Mid-size (1K-10K employees)',
    hint: 'Cross-functional squads, mature data practices.',
  },
  {
    value: 'Large',
    label: 'Enterprise (10K+ employees)',
    hint: 'Global operations, layered governance, change management required.',
  },
];

const timelineOptions: Array<{
  value: Timeline;
  label: string;
  range: string;
  description: string;
}> = [
  {
    value: 'quick-wins',
    label: 'Quick wins',
    range: '3-6 months',
    description: 'Low-lift ideas that deliver measurable value fast.',
  },
  {
    value: 'balanced',
    label: 'Balanced impact',
    range: '6-18 months',
    description: 'Medium-difficulty programs with meaningful payoffs.',
  },
  {
    value: 'transformative',
    label: 'Transformative',
    range: '18+ months',
    description: 'Bold bets that reimagine the business or service model.',
  },
];

const initialAnswers: Answers = {
  goal: null,
  industry: null,
  orgSize: null,
  timeline: null,
};

const formatMatchBadge = (count: number) =>
  count === 0 ? 'No matches yet' : `${count} match${count === 1 ? '' : 'es'}`;

const formatMatchInline = (count: number) => `${count} match${count === 1 ? '' : 'es'}`;

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);

  const industries = getIndustries();

  const recommendations = useMemo(() => {
    const usableCases = useCases
      .map((useCase) => {
        const passesFilters =
          filterOpportunities([useCase], answers.goal, answers.timeline, answers.industry).length >
          0;

        if (!passesFilters) return null;

        const fitScore = calculateFitScore(useCase, answers);
        return { useCase, fitScore };
      })
      .filter((entry): entry is { useCase: (typeof useCases)[number]; fitScore: number } => !!entry)
      .sort((a, b) => b.fitScore - a.fitScore)
      .slice(0, 3);

    return usableCases;
  }, [answers]);

  const finished = currentStep >= steps.length;
  const goalMatchCounts = useMemo<Record<Goal, number>>(() => {
    const counts: Record<Goal, number> = {
      'work-faster': 0,
      'work-better': 0,
      'work-at-scale': 0,
    };
    goalOptions.forEach((option) => {
      counts[option.value] = filterOpportunities(
        useCases,
        option.value,
        answers.timeline,
        answers.industry,
      ).length;
    });
    return counts;
  }, [answers.timeline, answers.industry]);

  const industryMatchCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    industries.forEach((industry) => {
      counts[industry] = filterOpportunities(useCases, answers.goal, answers.timeline, industry).length;
    });
    return counts;
  }, [answers.goal, answers.timeline, industries]);

  const orgSizeMatchCounts = useMemo<Record<OrgSize, number>>(() => {
    const sizes: OrgSize[] = ['Small', 'Medium', 'Large'];
    const counts: Record<OrgSize, number> = {
      Small: 0,
      Medium: 0,
      Large: 0,
    };
    sizes.forEach((size) => {
      const count = useCases.filter((useCase) => {
        const passesFilters =
          filterOpportunities([useCase], answers.goal, answers.timeline, answers.industry).length > 0;
        if (!passesFilters) return false;
        const score = calculateFitScore(useCase, {
          goal: answers.goal,
          industry: answers.industry,
          orgSize: size,
          timeline: answers.timeline,
        });
        return score > 0;
      }).length;
      counts[size] = count;
    });
    return counts;
  }, [answers.goal, answers.industry, answers.timeline]);

  const timelineMatchCounts = useMemo<Record<Timeline, number>>(() => {
    const counts: Record<Timeline, number> = {
      'quick-wins': 0,
      balanced: 0,
      transformative: 0,
    };
    timelineOptions.forEach((option) => {
      counts[option.value] = filterOpportunities(
        useCases,
        answers.goal,
        option.value,
        answers.industry,
      ).length;
    });
    return counts;
  }, [answers.goal, answers.industry]);

  const canContinue = useMemo(() => {
    if (finished) return false;

    if (currentStep === 0) {
      return Boolean(answers.goal);
    }

    if (currentStep === 1) {
      return Boolean(answers.industry && answers.orgSize);
    }

    if (currentStep === 2) {
      return Boolean(answers.timeline);
    }

    return false;
  }, [answers.goal, answers.industry, answers.orgSize, answers.timeline, currentStep, finished]);

  const handleBack = () => {
    if (currentStep === 0) return;
    if (finished) {
      setCurrentStep(steps.length - 1);
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (finished) return;
    if (!canContinue) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleReset = () => {
    setAnswers(initialAnswers);
    setCurrentStep(0);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Back to explorer
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Find Your Best GenAI Starting Point
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answer three quick questions and we’ll surface the top opportunities that match your
            goals, industry, and readiness.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 mt-10">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
          <header className="border-b border-gray-200 bg-gray-50 px-6 sm:px-10 py-6">
            <div className="flex items-center justify-between text-sm font-medium text-gray-600">
              <span>{finished ? 'Recommendations' : `Step ${currentStep + 1} of ${steps.length}`}</span>
              <span>{finished ? 'Complete' : steps[currentStep].title}</span>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: finished
                    ? '100%'
                    : `${((currentStep + (canContinue ? 0.25 : 0)) / steps.length) * 100}%`,
                }}
              ></div>
            </div>
          </header>

          <div className="p-6 sm:p-10">
            {finished ? (
              <ResultsView
                recommendations={recommendations}
                onRestart={handleReset}
                answers={answers}
              />
            ) : (
              <>
                {currentStep === 0 && (
                  <GoalStep
                    selectedGoal={answers.goal}
                    onSelect={(goal) => setAnswers((prev) => ({ ...prev, goal }))}
                    matchCounts={goalMatchCounts}
                  />
                )}
                {currentStep === 1 && (
                  <ContextStep
                    selectedIndustry={answers.industry}
                    selectedOrgSize={answers.orgSize}
                    industries={industries}
                    onSelectIndustry={(industry) => setAnswers((prev) => ({ ...prev, industry }))}
                    onSelectOrgSize={(orgSize) => setAnswers((prev) => ({ ...prev, orgSize }))}
                    industryCounts={industryMatchCounts}
                    orgSizeCounts={orgSizeMatchCounts}
                  />
                )}
                {currentStep === 2 && (
                  <TimelineStep
                    selectedTimeline={answers.timeline}
                    onSelectTimeline={(timeline) => setAnswers((prev) => ({ ...prev, timeline }))}
                    matchCounts={timelineMatchCounts}
                  />
                )}

                <div className="flex items-center justify-between mt-10">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={
                      currentStep === steps.length - 1 && canContinue
                        ? () => setCurrentStep(steps.length)
                        : handleNext
                    }
                    disabled={!canContinue}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                      canContinue
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {currentStep === steps.length - 1 ? 'See my recommendations' : 'Next'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type GoalStepProps = {
  selectedGoal: Goal | null;
  onSelect: (goal: Goal) => void;
  matchCounts: Record<Goal, number>;
};

function GoalStep({ selectedGoal, onSelect, matchCounts }: GoalStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What matters most right now?</h2>
        <p className="text-gray-600">
          Choose the outcome you care about most. We’ll use it to prioritize the right plays.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {goalOptions.map((option) => {
          const isActive = option.value === selectedGoal;
          const count = matchCounts[option.value];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`text-left border-2 rounded-2xl p-5 h-full transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span role="img" aria-hidden="true" className="text-3xl block mb-4">
                {option.emoji}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
              <span
                className={`mt-4 inline-block text-xs font-semibold ${
                  count === 0 ? 'text-red-500' : 'text-blue-600'
                }`}
              >
                {formatMatchBadge(count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ContextStepProps = {
  selectedIndustry: string | null;
  selectedOrgSize: OrgSize | null;
  industries: string[];
  onSelectIndustry: (industry: string | null) => void;
  onSelectOrgSize: (size: OrgSize) => void;
  industryCounts: Record<string, number>;
  orgSizeCounts: Record<OrgSize, number>;
};

function ContextStep({
  selectedIndustry,
  selectedOrgSize,
  industries,
  onSelectIndustry,
  onSelectOrgSize,
  industryCounts,
  orgSizeCounts,
}: ContextStepProps) {
  const totalIndustries = industries.length;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your context</h2>
        <p className="text-gray-600">
          We’ll tailor recommendations based on your industry and organizational scale.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="industry" className="block text-sm font-semibold text-gray-800">
          Industry
        </label>
        <div className="relative">
          <select
            id="industry"
            value={selectedIndustry ?? ''}
            onChange={(event) => {
              const value = event.target.value || null;
              onSelectIndustry(value);
            }}
            className="w-full appearance-none border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="" disabled>
              Select your industry
            </option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry} ({formatMatchInline(industryCounts[industry] ?? 0)})
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
            ▼
          </span>
        </div>
        {selectedIndustry && (
          <p
            className={`text-xs font-semibold ${
              (industryCounts[selectedIndustry] ?? 0) === 0 ? 'text-red-500' : 'text-blue-600'
            }`}
          >
            {formatMatchBadge(industryCounts[selectedIndustry] ?? 0)}
          </p>
        )}
        <p className="text-xs text-gray-500">
          We currently support {totalIndustries} {totalIndustries === 1 ? 'industry' : 'industries'} covered in the GenAI opportunity atlas.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-800 mb-3">Organization size</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {orgSizeOptions.map((option) => {
            const isActive = option.value === selectedOrgSize;
            const count = orgSizeCounts[option.value];
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectOrgSize(option.value)}
                className={`text-left border-2 rounded-2xl p-4 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">{option.hint}</p>
                <span
                  className={`mt-3 inline-block text-xs font-semibold ${
                    count === 0 ? 'text-red-500' : 'text-blue-600'
                  }`}
                >
                  {formatMatchBadge(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type TimelineStepProps = {
  selectedTimeline: Timeline | null;
  onSelectTimeline: (timeline: Timeline) => void;
  matchCounts: Record<Timeline, number>;
};

function TimelineStep({ selectedTimeline, onSelectTimeline, matchCounts }: TimelineStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What timeline are you targeting?</h2>
        <p className="text-gray-600">
          Timelines help us align the level of effort and investment with your expectations.
        </p>
      </div>

      <div className="space-y-4">
        {timelineOptions.map((option) => {
          const isActive = option.value === selectedTimeline;
          const count = matchCounts[option.value];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectTimeline(option.value)}
              className={`w-full text-left border-2 rounded-2xl p-5 transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.range}</p>
                </div>
                {isActive && (
                  <span className="text-blue-600 text-sm font-semibold bg-white px-3 py-1 rounded-full border border-blue-200">
                    Selected
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{option.description}</p>
              <span
                className={`mt-3 inline-block text-xs font-semibold ${
                  count === 0 ? 'text-red-500' : 'text-blue-600'
                }`}
              >
                {formatMatchBadge(count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type ResultsViewProps = {
  recommendations: Array<{ useCase: (typeof useCases)[number]; fitScore: number }>;
  answers: Answers;
  onRestart: () => void;
};

function ResultsView({ recommendations, onRestart, answers }: ResultsViewProps) {
  const hasEnoughData =
    answers.goal !== null && answers.industry !== null && answers.timeline !== null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Your top opportunities</h2>
          <p className="text-gray-600">
            Based on your inputs, here are the most relevant real-world implementations to explore
            next.
          </p>
        </div>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
        >
          Start over
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-sm text-blue-900">
        <p className="font-semibold mb-2">How we matched these</p>
        <p>
          We scored each opportunity against your goal, industry, organization size, and timeline.
          Recommendations update instantly if you go back and adjust your answers.
        </p>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid gap-6">
          {recommendations.map(({ useCase, fitScore }) => (
            <div key={useCase.id} className="relative">
              <div className="absolute -top-3 -right-3 bg-white border border-blue-200 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                Fit score {fitScore}/28
              </div>
              <OpportunityCard useCase={useCase} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900 mb-3">No perfect matches yet</p>
          <p className="text-gray-600 max-w-xl mx-auto">
            We couldn’t find strong matches with your current selections. Try adjusting your timeline
            or picking a different goal to widen the net.
          </p>
          {hasEnoughData && (
            <button
              onClick={onRestart}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md"
            >
              Restart assessment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
