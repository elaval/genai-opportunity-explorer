'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { OpportunityCard } from '@/components/OpportunityCard';
import { useCases, getIndustries, getSectors } from '@/lib/data';
import { calculateFitScore, filterOpportunities, timelineDifficulty } from '@/lib/filters';
import { getDifficultyLevel, getTimelineEstimate } from '@/lib/formatters';
import type { Goal, Timeline, UseCase } from '@/lib/types';

type ViewMode = 'cards' | 'table';
type SortKey = 'organization' | 'industry' | 'difficulty' | 'timeline' | 'fit';
type DifficultyFilter = 'All' | 'Low' | 'Medium' | 'High' | 'Very High';

const goals: { value: Goal; label: string }[] = [
  { value: 'work-faster', label: 'Work Faster' },
  { value: 'work-better', label: 'Work Better' },
  { value: 'work-at-scale', label: 'Work at Scale' },
];

const timelines: { value: Timeline; label: string }[] = [
  { value: 'quick-wins', label: 'Quick Wins' },
  { value: 'balanced', label: 'Balanced Impact' },
  { value: 'transformative', label: 'Transformative' },
];

const difficultyOrder: DifficultyFilter[] = ['Low', 'Medium', 'High', 'Very High'];

const difficultyLabels: Record<DifficultyFilter, string> = {
  All: 'All levels',
  Low: 'Low (Quick wins)',
  Medium: 'Medium',
  High: 'High',
  'Very High': 'Very High (Transformative)',
};

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'fit', label: 'Best Fit' },
  { value: 'organization', label: 'Organization' },
  { value: 'industry', label: 'Industry' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'timeline', label: 'Timeline' },
];

export default function AdvancedExplorerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [selectedTimelines, setSelectedTimelines] = useState<Timeline[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('fit');
  const [searchTerm, setSearchTerm] = useState('');

  const industries = getIndustries();
  const sectors = getSectors();

  const filteredCases = useMemo(() => {
    let list = [...useCases];

    if (selectedIndustries.length > 0) {
      list = list.filter((useCase) => selectedIndustries.includes(useCase.industry));
    }

    if (selectedSectors.length > 0) {
      list = list.filter((useCase) => selectedSectors.includes(useCase.sector));
    }

    if (difficultyFilter !== 'All') {
      list = list.filter((useCase) => getDifficultyLevel(useCase) === difficultyFilter);
    }

    if (selectedGoals.length > 0) {
      list = list.filter(
        (useCase) =>
          filterOpportunities([useCase], selectedGoals[0], null, null).length > 0 ||
          selectedGoals.some((goal) => filterOpportunities([useCase], goal, null, null).length > 0),
      );
    }

    if (selectedTimelines.length > 0) {
      list = list.filter((useCase) =>
        selectedTimelines.some((timeline) => {
          const allowedLevels = timelineDifficulty[timeline];
          const difficulty = getDifficultyLevel(useCase);
          return allowedLevels.some((level) => difficulty.includes(level));
        }),
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (useCase) =>
          useCase.organization.toLowerCase().includes(term) ||
          useCase.use_case_category.toLowerCase().includes(term) ||
          useCase.specific_application.toLowerCase().includes(term),
      );
    }

    const withFit = list.map((useCase) => ({
      useCase,
      fitScore: calculateFitScore(useCase, {
        goal: selectedGoals[0] ?? null,
        industry: selectedIndustries[0] ?? null,
        orgSize: null,
        timeline: selectedTimelines[0] ?? null,
      }),
      difficulty: getDifficultyLevel(useCase),
      timeline: getTimelineEstimate(useCase),
    }));

    const sorted = [...withFit].sort((a, b) => {
      switch (sortBy) {
        case 'organization':
          return a.useCase.organization.localeCompare(b.useCase.organization);
        case 'industry':
          return a.useCase.industry.localeCompare(b.useCase.industry);
        case 'difficulty':
          return (
            difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
          );
        case 'timeline':
          return a.timeline.localeCompare(b.timeline);
        case 'fit':
        default:
          return b.fitScore - a.fitScore;
      }
    });

    return sorted;
  }, [
    difficultyFilter,
    searchTerm,
    selectedGoals,
    selectedIndustries,
    selectedSectors,
    selectedTimelines,
    sortBy,
  ]);

  const handleToggle = <T,>(current: T[], value: T): T[] =>
    current.includes(value) ? current.filter((item) => item !== value) : [...current, value];

  const clearFilters = () => {
    setSelectedIndustries([]);
    setSelectedSectors([]);
    setDifficultyFilter('All');
    setSelectedGoals([]);
    setSelectedTimelines([]);
    setSortBy('fit');
    setSearchTerm('');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Back to explorer
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                Advanced Opportunity Explorer
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Compare all 21 proven implementations in a single view. Filter by industry, difficulty,
                goal, or timeline and switch between card and table layouts to plan your roadmap.
              </p>
            </div>
            <div className="self-start bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-900 mb-2">View mode</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-10">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Search</label>
                <div className="relative">
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by organization, use case, or application"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-semibold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortKey)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <FilterPillGroup
                label="Industry"
                options={industries}
                selected={selectedIndustries}
                onToggle={(industry) => setSelectedIndustries((prev) => handleToggle(prev, industry))}
              />

              <FilterPillGroup
                label="Sector"
                options={sectors}
                selected={selectedSectors}
                onToggle={(sector) => setSelectedSectors((prev) => handleToggle(prev, sector))}
              />
            </div>

            <div className="w-full lg:w-64 space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Difficulty</p>
                <select
                  value={difficultyFilter}
                  onChange={(event) => setDifficultyFilter(event.target.value as DifficultyFilter)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {['All', ...difficultyOrder].map((level) => (
                    <option key={level} value={level}>
                      {difficultyLabels[level as DifficultyFilter]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Goal focus</p>
                <div className="space-y-2">
                  {goals.map((goal) => (
                    <label
                      key={goal.value}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGoals.includes(goal.value)}
                        onChange={() => setSelectedGoals((prev) => handleToggle(prev, goal.value))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {goal.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Timeline</p>
                <div className="space-y-2">
                  {timelines.map((timeline) => (
                    <label
                      key={timeline.value}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTimelines.includes(timeline.value)}
                        onChange={() =>
                          setSelectedTimelines((prev) => handleToggle(prev, timeline.value))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {timeline.label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-semibold text-gray-900">{filteredCases.length}</span> opportunities
            out of {useCases.length}
          </p>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No matches yet</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Try removing a filter or broadening your search. You can also switch back to the main
              explorer for curated recommendations.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={clearFilters}
                className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md"
              >
                Reset filters
              </button>
              <Link
                href="/"
                className="px-5 py-3 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                Browse curated view →
              </Link>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredCases.map(({ useCase }) => (
              <OpportunityCard key={useCase.id} useCase={useCase} />
            ))}
          </div>
        ) : (
          <AdvancedTable rows={filteredCases} />
        )}
      </div>
    </div>
  );
}

type FilterPillGroupProps = {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

function FilterPillGroup({ label, options, selected, onToggle }: FilterPillGroupProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type AdvancedTableProps = {
  rows: Array<{
    useCase: UseCase;
    fitScore: number;
    difficulty: DifficultyFilter;
    timeline: string;
  }>;
};

function AdvancedTable({ rows }: AdvancedTableProps) {
  return (
    <div className="overflow-hidden border border-gray-200 rounded-3xl shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="px-6 py-4">Organization</th>
            <th className="px-6 py-4">Use Case</th>
            <th className="px-6 py-4">Industry</th>
            <th className="px-6 py-4">Sector</th>
            <th className="px-6 py-4">Difficulty</th>
            <th className="px-6 py-4">Timeline</th>
            <th className="px-6 py-4">Fit Score</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
          {rows.map(({ useCase, fitScore, difficulty, timeline }) => (
            <tr key={useCase.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-semibold text-gray-900">{useCase.organization}</td>
              <td className="px-6 py-4">{useCase.use_case_category}</td>
              <td className="px-6 py-4">{useCase.industry}</td>
              <td className="px-6 py-4">{useCase.sector}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    difficulty === 'Low'
                      ? 'bg-green-100 text-green-700'
                      : difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : difficulty === 'High'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {difficulty}
                </span>
              </td>
              <td className="px-6 py-4">{timeline}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  {fitScore}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/cases/${useCase.id}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
