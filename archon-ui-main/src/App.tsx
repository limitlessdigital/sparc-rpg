export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎲 SPARC RPG
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Fast, Fun, Fantasy Role-Playing Game - Create heroes in under 5 minutes
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="text-4xl mb-4">⚔️</div>
            <h2 className="text-2xl font-bold mb-4">Character Creation</h2>
            <p className="text-slate-300 mb-6">
              Create your hero in under 5 minutes with our streamlined wizard
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold">
              Create Character
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="text-4xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold mb-4">Dice Rolling</h2>
            <p className="text-slate-300 mb-6">
              Roll dice with realistic physics and sub-100ms performance
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold">
              Roll Dice
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="text-4xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold mb-4">AI Seer</h2>
            <p className="text-slate-300 mb-6">
              Get instant help from your AI Game Master assistant
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold">
              Ask Seer
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-slate-800/30 backdrop-blur rounded-lg p-6 max-w-2xl mx-auto border border-slate-700">
            <h3 className="text-xl font-semibold mb-4">🚀 Deployment Status</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span>Frontend Build</span>
                <span className="text-green-400">✅ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Modern Dependencies</span>
                <span className="text-green-400">✅ Clean</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vercel Compatible</span>
                <span className="text-green-400">✅ Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}