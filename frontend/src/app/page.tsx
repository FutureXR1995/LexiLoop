/**
 * LexiLoop Homepage
 * Main landing page for the vocabulary learning platform
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">LexiLoop</h1>
              <span className="ml-2 text-sm text-gray-500">v0.1.0</span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/learn" className="text-gray-600 hover:text-indigo-600">
                Learn
              </Link>
              <Link href="/library" className="text-gray-600 hover:text-indigo-600">
                Library
              </Link>
              <Link href="/progress" className="text-gray-600 hover:text-indigo-600">
                Progress
              </Link>
              <Link href="/advanced-test" className="text-gray-600 hover:text-indigo-600">
                Advanced Tests
              </Link>
              <Link href="/social" className="text-gray-600 hover:text-indigo-600">
                Social
              </Link>
              <Link href="/auth/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Learn Vocabulary Through
            <span className="text-indigo-600"> AI Stories</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Master new words naturally with AI-generated stories that create meaningful contexts for every vocabulary word you learn.
          </p>
          
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/learn"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Start Learning
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link
                href="/demo"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-3xl mb-4">🧠</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  AI-Generated Stories
                </h3>
                <p className="text-gray-600">
                  Every story is unique and crafted to naturally include your target vocabulary words
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Three-Layer Testing
                </h3>
                <p className="text-gray-600">
                  Word meaning, typing practice, and comprehension tests ensure deep learning
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <div className="text-3xl mb-4">🔄</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Spaced Repetition
                </h3>
                <p className="text-gray-600">
                  Smart algorithm brings back words you need to practice at optimal intervals
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Choose Words</h4>
              <p className="text-gray-600 text-sm">
                Select vocabulary words from our curated word books or create your own
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Read Stories</h4>
              <p className="text-gray-600 text-sm">
                AI generates engaging stories that naturally incorporate your chosen words
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Test & Learn</h4>
              <p className="text-gray-600 text-sm">
                Complete interactive tests to reinforce your learning and track progress
              </p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-16 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              🚧 Phase 0.5 - Technical Verification
            </h3>
            <p className="text-yellow-700">
              This is a prototype version for testing core functionality. 
              Full features coming in Phase 1!
            </p>
            <div className="mt-4 text-sm text-yellow-600">
              <p>✅ AI Story Generation • ✅ Content Validation • ✅ API Framework</p>
              <p>🔄 Frontend UI • 🔄 User Authentication • 📅 Database Integration</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 LexiLoop. Made with ❤️ for language learners.</p>
          <p className="mt-2 text-gray-400 text-sm">
            Powered by OpenAI GPT-4o • Azure Speech Services • Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}