import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DifficultyBadge } from '@/components/DifficultyBadge';
import { OpportunityCard } from '@/components/OpportunityCard';
import { VerificationBadge } from '@/components/VerificationBadge';
import { frameworks, getUseCaseById, useCases } from '@/lib/data';
import {
  formatDate,
  formatResult,
  getDifficultyLevel,
  getInvestmentLevel,
  getROITimeline,
  getTimelineEstimate,
} from '@/lib/formatters';
import { getRelatedCases } from '@/lib/filters';
import type { Framework, UseCase } from '@/lib/types';

type CasePageProps = {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

const frameworkCache = new Map<string, Framework | undefined>();

function findFrameworkForUseCase(useCase: UseCase): Framework | undefined {
  if (frameworkCache.has(useCase.id)) {
    return frameworkCache.get(useCase.id);
  }

  const match = frameworks.find((framework) => {
    const categoryMatch = framework.typical_use_cases
      ?.toLowerCase()
      .includes(useCase.use_case_category.toLowerCase());
    const exampleMatch = framework.examples.some((example) =>
      example.toLowerCase().includes(useCase.organization.toLowerCase()),
    );
    return categoryMatch || exampleMatch;
  });

  frameworkCache.set(useCase.id, match);
  return match;
}

function toList(text?: string): string[] {
  if (!text) return [];
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildImplementationRoadmap(framework?: Framework): string[] {
  if (!framework) {
    return [
      'Document the current workflow and identify high-volume tasks that create the most friction.',
      'Pilot a GenAI solution with a focused team, capturing metrics that prove business value.',
      'Scale the deployment with change management, training, and continuous monitoring.',
    ];
  }

  const phaseOne = `Document processes and gather high-quality training data — a prerequisite for ${framework.value_proposition.toLowerCase()}.`;
  const phaseTwo = `Launch a pilot to reach time-to-value in ${framework.time_to_value.toLowerCase()}, validating the ${framework.sub_category.toLowerCase()} approach.`;
  const phaseThree = `Invest ${framework.investment_level.toLowerCase()} to scale and track ROI within ${framework.ROI_timeline.toLowerCase()}.`;

  return [phaseOne, phaseTwo, phaseThree];
}

function buildBackLink(searchParams?: CasePageProps['searchParams']): string {
  if (!searchParams) return '/';

  const params = new URLSearchParams();
  const maybeGoal = searchParams.goal;
  const maybeTimeline = searchParams.timeline;
  const maybeIndustry = searchParams.industry;

  if (typeof maybeGoal === 'string') params.set('goal', maybeGoal);
  if (typeof maybeTimeline === 'string') params.set('timeline', maybeTimeline);
  if (typeof maybeIndustry === 'string') params.set('industry', maybeIndustry);

  const query = params.toString();
  return query ? `/?${query}` : '/';
}

export async function generateStaticParams() {
  return useCases.map((useCase) => ({ id: useCase.id }));
}

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const useCase = getUseCaseById(params.id);

  if (!useCase) {
    return {
      title: 'Use Case Not Found | GenAI Opportunity Explorer',
    };
  }

  return {
    title: `${useCase.organization} | ${useCase.use_case_category} | GenAI Opportunity Explorer`,
    description: useCase.challenge,
  };
}

export default function CasePage({ params, searchParams }: CasePageProps) {
  const useCase = getUseCaseById(params.id);

  if (!useCase) {
    notFound();
  }

  const difficulty = getDifficultyLevel(useCase);
  const timeline = getTimelineEstimate(useCase);
  const investment = getInvestmentLevel(useCase);
  const roiTimeline = getROITimeline(useCase);
  const framework = findFrameworkForUseCase(useCase);
  const successFactors = toList(framework?.key_success_factors);
  const commonChallenges = toList(framework?.common_challenges);
  const roadmap = buildImplementationRoadmap(framework);
  const relatedCases = getRelatedCases(useCase, useCases, 3);
  const backLink = buildBackLink(searchParams);

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-6"
        >
          ← Back to explorer
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                  {useCase.industry}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                  {useCase.organization}
                </h1>
                <p className="text-xl text-blue-700 font-semibold mb-4">
                  {useCase.use_case_category}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full font-medium">
                    Sector: {useCase.sector}
                  </span>
                  <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full font-medium">
                    Application: {useCase.specific_application}
                  </span>
                  <DifficultyBadge level={difficulty} />
                  <VerificationBadge source={useCase.sources[0]} />
                  <span className="text-xs text-gray-500">
                    Last reviewed {formatDate(useCase.last_reviewed)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-12 p-8 lg:p-10">
            <div className="space-y-10">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">The Challenge</h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {useCase.challenge}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">GenAI Solution</h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {useCase.solution}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Results</h2>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <ul className="space-y-3">
                    {useCase.results.map((result, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-blue-900 leading-relaxed">
                        <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
                        <span
                          className="font-medium"
                          dangerouslySetInnerHTML={{ __html: formatResult(result) }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Insight</h2>
                <p className="text-gray-700 leading-relaxed italic">
                  {useCase.key_insight}
                </p>
              </section>

              {successFactors.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Success Factors</h2>
                  <ul className="space-y-2">
                    {successFactors.map((factor) => (
                      <li key={factor} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                        <span className="mt-1 text-blue-500">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {commonChallenges.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Common Challenges</h2>
                  <ul className="space-y-2">
                    {commonChallenges.map((challenge) => (
                      <li
                        key={challenge}
                        className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed"
                      >
                        <span className="mt-1 text-red-500">•</span>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {roadmap.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Implementation Roadmap</h2>
                  <ol className="space-y-3 list-decimal list-inside text-sm text-gray-700 leading-relaxed">
                    {roadmap.map((step, index) => (
                      <li key={index} className="pl-1">
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            <aside className="space-y-8">
              <section className="bg-gray-900 text-white rounded-2xl p-6 shadow-md">
                <h2 className="text-lg font-semibold mb-4">At a Glance</h2>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm text-gray-300">Difficulty</dt>
                    <dd className="mt-1">
                      <DifficultyBadge level={difficulty} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-300">Timeline</dt>
                    <dd className="mt-1 text-base font-semibold">{timeline}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-300">Investment</dt>
                    <dd className="mt-1 text-base font-semibold">{investment}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-300">ROI Window</dt>
                    <dd className="mt-1 text-base font-semibold">{roiTimeline}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-300">Sector</dt>
                    <dd className="mt-1 text-base">{useCase.sector}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-300">Industry</dt>
                    <dd className="mt-1 text-base">{useCase.industry}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-300">Sources</dt>
                    <dd className="mt-2 space-y-2">
                      {useCase.sources.map((source) => (
                        <div key={source.url} className="flex flex-col">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-200 hover:text-white underline-offset-2 hover:underline text-sm font-semibold"
                          >
                            {source.publisher}
                          </a>
                          <span className="text-xs text-gray-400">{source.footnote}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Technology & Approach</h2>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <span className="font-semibold text-gray-900">Intervention Type:</span>{' '}
                    {framework?.intervention_type ?? 'GenAI initiative'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Sub-category:</span>{' '}
                    {framework?.sub_category ?? useCase.use_case_category}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Technology Maturity:</span>{' '}
                    {framework?.technology_maturity ?? 'Emerging'}
                  </div>
                  {useCase.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {useCase.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>

        {relatedCases.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Related Opportunities</h2>
              <Link
                href="/?view=all"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View entire library →
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {relatedCases.map((related) => (
                <OpportunityCard key={related.id} useCase={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
