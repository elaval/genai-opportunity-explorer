'use client';

// components/HomeContent.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { GoalCard } from '@/components/GoalCard';
import { OpportunityCard } from '@/components/OpportunityCard';
import { Goal, Timeline, UseCase } from '@/lib/types';
import { useCases, getIndustries } from '@/lib/data';
import { filterOpportunities, sortOpportunities } from '@/lib/filters';
import Link from 'next/link';

export function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(
    searchParams.get('goal') as Goal | null
  );
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(
    searchParams.get('timeline') as Timeline | null
  );
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(
    searchParams.get('industry')
  );
  const [sortBy, setSortBy] = useState<string>('difficulty');
  const [filteredCases, setFilteredCases] = useState<UseCase[]>([]);

  const industries = getIndustries();

  // Update URL when filters change
  const updateURL = (goal: Goal | null, timeline: Timeline | null, industry: string | null) => {
    const params = new URLSearchParams();
    if (goal) params.set('goal', goal);
    if (timeline) params.set('timeline', timeline);
    if (industry) params.set('industry', industry);

    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newURL, { scroll: false });
  };

  // Handle goal and timeline selection from GoalCard
  const handleShowOpportunities = (goal: Goal, timeline: Timeline) => {
    setSelectedGoal(goal);
    setSelectedTimeline(timeline);
    updateURL(goal, timeline, selectedIndustry);

    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle view all opportunities
  const handleViewAll = () => {
    setSelectedGoal(null);
    setSelectedTimeline(null);
    setSelectedIndustry(null);
    updateURL(null, null, null);

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Filter and sort cases
  useEffect(() => {
    let filtered = selectedGoal || selectedTimeline || selectedIndustry
      ? filterOpportunities(useCases, selectedGoal, selectedTimeline, selectedIndustry)
      : useCases;

    filtered = sortOpportunities(filtered, sortBy as any);
    setFilteredCases(filtered);
  }, [selectedGoal, selectedTimeline, selectedIndustry, sortBy]);

  const showResults = selectedGoal || selectedTimeline || searchParams.get('view') === 'all';

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Discover Your <span className="text-blue-600">GenAI</span> Opportunities
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore <span className="font-semibold text-gray-900">21 real-world implementations</span> across <span className="font-semibold text-gray-900">11 industries</span>. Find proven opportunities to transform your work.
            </p>
          </div>

          {/* Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <GoalCard
              goal="work-faster"
              title="Work Faster"
              description="Complete tasks & serve people more quickly"
              icon="🚀"
              typicalImpact="30-80% time reduction"
              exampleOrg="Klarna"
              exampleResult="Handled 2/3 of inquiries (equivalent to 700 agents)"
              onShowOpportunities={handleShowOpportunities}
            />
            <GoalCard
              goal="work-better"
              title="Work Better"
              description="Improve quality, accuracy, and outcomes"
              icon="⭐"
              typicalImpact="15-25% improvement"
              exampleOrg="China Mobile Shanghai"
              exampleResult="99% fraud detection accuracy"
              onShowOpportunities={handleShowOpportunities}
            />
            <GoalCard
              goal="work-at-scale"
              title="Work at Scale"
              description="Serve more people, handle greater volume"
              icon="📈"
              typicalImpact="2-10x capacity increase"
              exampleOrg="Vodafone"
              exampleResult="45 million conversations handled monthly"
              onShowOpportunities={handleShowOpportunities}
            />
          </div>

          {/* Alternative Entry Points */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-6 max-w-2xl mx-auto">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">OR</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-base transition-colors"
              >
                <span>Not sure where to start?</span>
                <span className="underline">Take 3-minute assessment →</span>
              </Link>
              <span className="hidden sm:inline text-gray-300 text-2xl font-thin">|</span>
              <button
                onClick={handleViewAll}
                className="text-blue-600 hover:text-blue-700 font-semibold text-base underline transition-colors"
              >
                View all opportunities →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {showResults && (
        <section id="results" className="py-16 bg-white border-t-2 border-gray-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Filter Header */}
            <div className="mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {selectedGoal && (
                  <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedGoal === 'work-faster' && 'Work Faster'}
                    {selectedGoal === 'work-better' && 'Work Better'}
                    {selectedGoal === 'work-at-scale' && 'Work at Scale'}
                    <button
                      onClick={() => {
                        setSelectedGoal(null);
                        updateURL(null, selectedTimeline, selectedIndustry);
                      }}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedTimeline && (
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedTimeline === 'quick-wins' && 'Quick Wins'}
                    {selectedTimeline === 'balanced' && 'Balanced Impact'}
                    {selectedTimeline === 'transformative' && 'Transformative'}
                    <button
                      onClick={() => {
                        setSelectedTimeline(null);
                        updateURL(selectedGoal, null, selectedIndustry);
                      }}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedIndustry && (
                  <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedIndustry}
                    <button
                      onClick={() => {
                        setSelectedIndustry(null);
                        updateURL(selectedGoal, selectedTimeline, null);
                      }}
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-gray-900">
                    Showing <span className="text-blue-600">{filteredCases.length}</span> {filteredCases.length === 1 ? 'opportunity' : 'opportunities'}
                  </p>
                  {(selectedGoal || selectedTimeline || selectedIndustry) && (
                    <button
                      onClick={() => {
                        setSelectedGoal(null);
                        setSelectedTimeline(null);
                        setSelectedIndustry(null);
                        updateURL(null, null, null);
                      }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Industry Filter */}
                  <select
                    value={selectedIndustry || ''}
                    onChange={(e) => {
                      const value = e.target.value || null;
                      setSelectedIndustry(value);
                      updateURL(selectedGoal, selectedTimeline, value);
                    }}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    <option value="">All Industries</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-colors"
                  >
                    <option value="difficulty">Sort: Difficulty</option>
                    <option value="industry">Sort: Industry</option>
                    <option value="recent">Sort: Recently Updated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {filteredCases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCases.map((useCase) => (
                  <OpportunityCard key={useCase.id} useCase={useCase} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">No exact matches found</h3>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Try adjusting your filters or browse all opportunities to find the perfect fit for your needs.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedGoal(null);
                      setSelectedTimeline(null);
                      setSelectedIndustry(null);
                      updateURL(null, null, null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Show all opportunities
                  </button>
                </div>
              </div>
            )}

            {/* Implementation Help Box */}
            {filteredCases.length > 0 && (
              <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Need Implementation Help?
                    </h3>
                    <p className="text-gray-600">Get the resources and support you need to succeed</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-colors">
                    <span className="text-2xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Download Implementation Checklist</p>
                      <p className="text-sm text-gray-600">Step-by-step guide for successful deployment</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-colors">
                    <span className="text-2xl flex-shrink-0">📊</span>
                    <div>
                      <p className="font-semibold text-gray-900">Get Industry Benchmark Report</p>
                      <p className="text-sm text-gray-600">Compare your progress with industry leaders</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-colors">
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div>
                      <p className="font-semibold text-gray-900">Talk to Implementation Expert</p>
                      <p className="text-sm text-gray-600">Get personalized guidance for your use case</p>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
