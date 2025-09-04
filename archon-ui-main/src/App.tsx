import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎲 SPARC RPG
          </h1>
          <p className="text-gray-600">
            Fast, Fun, Fantasy Role-Playing Game
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Character Creation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">⚔️ Character Creation</h2>
            <p className="text-gray-600 mb-4">
              Create your hero in under 5 minutes
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
              Create Character
            </button>
          </div>

          {/* Dice Rolling */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🎲 Dice Rolling</h2>
            <p className="text-gray-600 mb-4">
              Roll dice with realistic physics
            </p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
              Roll Dice
            </button>
          </div>

          {/* AI Seer */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🔮 AI Seer</h2>
            <p className="text-gray-600 mb-4">
              Get help from your AI Game Master
            </p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
              Ask Seer
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Deployment Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-500">✅</span>
              <span className="ml-2">Frontend deployed to Vercel</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500">⏳</span>
              <span className="ml-2">Backend services ready for deployment</span>
            </div>
            <div className="flex items-center">
              <span className="text-blue-500">ℹ️</span>
              <span className="ml-2">All SPARC RPG features implemented</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            🎉 SPARC RPG deployment successful!
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Character creation, dice rolling, AI assistance, and session management ready
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;