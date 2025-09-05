import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function CharacterCreation({ onClose }: { onClose: () => void }) {
  const [templates, setTemplates] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [characterName, setCharacterName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      console.log('Loading character templates...');
      const data = await api.getCharacterTemplates();
      console.log('Templates loaded:', data);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      console.error('Error details:', error);
    }
  };

  const createCharacter = async () => {
    if (!selectedClass || !characterName) return;
    
    setLoading(true);
    try {
      const request = {
        name: characterName,
        character_class: selectedClass,
        session_id: 'demo-session'
      };
      const result = await api.createCharacter(request);
      setCharacter(result);
    } catch (error) {
      console.error('Failed to create character:', error);
    } finally {
      setLoading(false);
    }
  };

  if (character) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6 text-green-400">Character Created! 🎉</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{character.name}</h3>
              <p className="text-slate-300">{character.character_class} • Level {character.level}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-400">Stats</h4>
                {character.stats && Object.entries(character.stats).map(([stat, value]) => (
                  <p key={stat} className="text-sm">{stat}: {String(value)}</p>
                ))}
              </div>
              <div>
                <h4 className="font-semibold text-purple-400">Equipment</h4>
                {character.equipment?.map((item: string, i: number) => (
                  <p key={i} className="text-sm">• {item}</p>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Create Your Hero ⚔️</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Character Name</label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:border-blue-400 focus:outline-none"
              placeholder="Enter your hero's name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Choose Your Class</label>
            <div className="grid grid-cols-1 gap-3">
              {templates && Object.entries(templates).map(([className, template]: [string, any]) => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedClass === className 
                      ? 'border-blue-400 bg-blue-900/30' 
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="font-semibold">{className}</div>
                  <div className="text-sm text-slate-300 mt-1">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createCharacter}
            disabled={!selectedClass || !characterName || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold"
          >
            {loading ? 'Creating Hero...' : 'Create Character'}
          </button>
        </div>
      </div>
    </div>
  );
}