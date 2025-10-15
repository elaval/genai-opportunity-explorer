// components/Header.tsx
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              <h1 className="text-2xl font-extrabold text-gray-900">
                <span className="text-blue-600">GenAI</span> Explorer
              </h1>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-base font-semibold text-gray-700 hover:text-blue-600 transition-colors relative group"
            >
              Browse
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/assessment"
              className="text-base font-semibold text-gray-700 hover:text-blue-600 transition-colors relative group"
            >
              Assessment
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/advanced"
              className="text-base font-semibold text-gray-700 hover:text-blue-600 transition-colors relative group"
            >
              Advanced
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
            </Link>
          </nav>
          <div className="md:hidden">
            <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
