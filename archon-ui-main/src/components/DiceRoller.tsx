import { useState } from 'react';
import { api } from '../services/api';

export default function DiceRoller({ onClose }: { onClose: () => void }) {
  const [diceCount, setDiceCount] = useState(1);
  const [diceSides, setDiceSides] = useState(20);
  const [modifier, setModifier] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const diceOptions = [4, 6, 8, 10, 12, 20];

  const rollDice = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const request = {
        session_id: 'demo-session',
        character_id: 'demo-character',
        dice_count: diceCount,
        dice_sides: diceSides,
        modifier: modifier,
        roll_type: 'manual'
      };
      
      const rollResult = await api.rollDice(request);
      const responseTime = Date.now() - startTime;
      
      setResult({ ...rollResult, responseTime });
    } catch (error) {
      console.error('Failed to roll dice:', error);
      setResult({ error: 'Failed to roll dice' });
    } finally {
      setLoading(false);
    }
  };

  const rollAgain = () => {
    setResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-8 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Dice Roller 🎲</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        {result ? (
          <div className="text-center space-y-6">
            <div className="text-6xl font-bold text-green-400">{result.total || 'Error'}</div>
            
            {result.dice_results && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Individual Rolls:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {result.dice_results.map((roll: number, i: number) => (
                      <span key={i} className="bg-slate-700 px-3 py-1 rounded text-lg">
                        {roll}
                      </span>
                    ))}
                  </div>
                </div>
                
                {modifier !== 0 && (
                  <p className="text-slate-300">
                    Base: {result.base_total} {modifier >= 0 ? '+' : ''}{modifier} = {result.total}
                  </p>
                )}
                
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Response time: {result.responseTime}ms</p>
                  <p>Target: &lt;100ms P95</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <button 
                onClick={rollAgain}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
              >
                Roll Again
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Number of Dice</label>
              <input
                type="number"
                min="1"
                max="20"
                value={diceCount}
                onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Dice Type</label>
              <div className="grid grid-cols-3 gap-2">
                {diceOptions.map((sides) => (
                  <button
                    key={sides}
                    onClick={() => setDiceSides(sides)}
                    className={`py-3 rounded-lg font-semibold transition-colors ${
                      diceSides === sides
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    d{sides}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Modifier</label>
              <input
                type="number"
                min="-50"
                max="50"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:border-blue-400 focus:outline-none"
                placeholder="0"
              />
            </div>

            <button
              onClick={rollDice}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-lg"
            >
              {loading ? 'Rolling...' : `Roll ${diceCount}d${diceSides}${modifier >= 0 ? '+' : ''}${modifier !== 0 ? modifier : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}