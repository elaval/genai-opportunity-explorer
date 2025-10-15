// components/Footer.tsx
import { useCases, getIndustries } from '@/lib/data';

const totalUseCases = useCases.length;
const totalIndustries = getIndustries().length;

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              About
            </h3>
            <p className="text-gray-600 text-sm">
              Explore {totalUseCases} real-world GenAI {totalUseCases === 1 ? 'implementation' : 'implementations'} across {totalIndustries} {totalIndustries === 1 ? 'industry' : 'industries'}. Find proven opportunities to work faster, better, and at scale.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-blue-600 text-sm">Browse Opportunities</a>
              </li>
              <li>
                <a href="/assessment" className="text-gray-600 hover:text-blue-600 text-sm">Take Assessment</a>
              </li>
              <li>
                <a href="/advanced" className="text-gray-600 hover:text-blue-600 text-sm">Advanced Explorer</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <p className="text-gray-600 text-sm">
              All case studies are verified from reputable sources including McKinsey, BCG, and industry publications.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} GenAI Opportunity Explorer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
