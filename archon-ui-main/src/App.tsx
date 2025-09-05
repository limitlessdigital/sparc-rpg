import { useState, useEffect } from 'react';
import CharacterCreation from './components/CharacterCreation';
import DiceRoller from './components/DiceRoller';
import AISeer from './components/AISeer';
import { api } from './services/api';

type ActiveModal = 'character' | 'dice' | 'seer' | null;

export default function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await api.healthCheck();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const openModal = (modal: ActiveModal) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

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
            <button 
              onClick={() => openModal('character')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold"
            >
              Create Character
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="text-4xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold mb-4">Dice Rolling</h2>
            <p className="text-slate-300 mb-6">
              Roll six-sided dice with realistic physics and sub-100ms performance
            </p>
            <button 
              onClick={() => openModal('dice')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold"
            >
              Roll Dice
            </button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="text-4xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold mb-4">AI Seer</h2>
            <p className="text-slate-300 mb-6">
              Get instant help from your AI Game Master assistant
            </p>
            <button 
              onClick={() => openModal('seer')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold"
            >
              Ask Seer
            </button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-slate-800/30 backdrop-blur rounded-lg p-6 max-w-2xl mx-auto border border-slate-700">
            <h3 className="text-xl font-semibold mb-4">🚀 System Status</h3>
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
                <span>Backend Connection</span>
                <span className={backendStatus === 'connected' ? 'text-green-400' : backendStatus === 'disconnected' ? 'text-red-400' : 'text-yellow-400'}>
                  {backendStatus === 'connected' ? '✅ Connected' : backendStatus === 'disconnected' ? '❌ Offline' : '⏳ Checking...'}
                </span>
              </div>
            </div>
            {backendStatus === 'disconnected' && (
              <p className="text-xs text-red-400 mt-4">
                Backend not available. Run: <code>cd python && uv run python -m src.server.main</code>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'character' && <CharacterCreation onClose={closeModal} />}
      {activeModal === 'dice' && <DiceRoller onClose={closeModal} />}
      {activeModal === 'seer' && <AISeer onClose={closeModal} />}
    </div>
  )
}