// Mock data for demo until backend is deployed
const MOCK_CHARACTER_CLASSES = {
  "Fighter": {
    "description": "Master of weapons and armor, excel in combat",
    "base_stats": {"strength": 16, "constitution": 15, "dexterity": 13},
    "equipment": ["Longsword", "Shield", "Chain Mail", "Healing Potion"]
  },
  "Wizard": {
    "description": "Wielder of arcane magic and ancient knowledge", 
    "base_stats": {"intelligence": 16, "wisdom": 14, "constitution": 12},
    "equipment": ["Spellbook", "Staff", "Robes", "Component Pouch"]
  },
  "Rogue": {
    "description": "Stealthy scout skilled in deception and precision",
    "base_stats": {"dexterity": 16, "intelligence": 14, "charisma": 13},
    "equipment": ["Daggers", "Thieves' Tools", "Leather Armor", "Rope"]
  }
};

// API client for SPARC backend
export class SparcApi {
  private mockMode = true; // Enable mock mode for demo

  private async mockRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log('Mock API Request:', endpoint);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    if (endpoint === '/characters/templates') {
      return MOCK_CHARACTER_CLASSES as T;
    }
    
    if (endpoint === '/characters' && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const template = MOCK_CHARACTER_CLASSES[body.character_class as keyof typeof MOCK_CHARACTER_CLASSES];
      return {
        id: `char_${Math.floor(Math.random() * 9000) + 1000}`,
        name: body.name,
        character_class: body.character_class,
        level: 1,
        stats: template.base_stats,
        equipment: template.equipment,
        creation_time: Date.now()
      } as T;
    }
    
    if (endpoint === '/dice/roll') {
      const body = JSON.parse(options.body as string);
      const rolls = Array.from({length: body.dice_count}, () => 
        Math.floor(Math.random() * body.dice_sides) + 1
      );
      const baseTotal = rolls.reduce((a, b) => a + b, 0);
      return {
        dice_results: rolls,
        base_total: baseTotal,
        modifier: body.modifier || 0,
        total: baseTotal + (body.modifier || 0),
        timestamp: Date.now()
      } as T;
    }
    
    if (endpoint === '/ai/seer-advice') {
      const body = JSON.parse(options.body as string);
      const responses = [
        `The mystical energies reveal... "${body.query}" requires careful consideration. Roll for wisdom!`,
        `I sense great potential in your query about "${body.query}". The dice will guide your fate.`,
        `Ancient knowledge whispers that "${body.query}" is best approached with courage and strategy.`,
        `The stars align favorably for your question about "${body.query}". Trust in your abilities.`,
        `Magic flows strongly here. Regarding "${body.query}", remember that heroes are forged in challenge.`
      ];
      return {
        advice: responses[Math.floor(Math.random() * responses.length)],
        confidence: 0.7 + Math.random() * 0.3,
        timestamp: Date.now()
      } as T;
    }
    
    throw new Error(`Mock endpoint not implemented: ${endpoint}`);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (this.mockMode) {
      return this.mockRequest<T>(endpoint, options);
    }
    
    // Real API implementation would go here
    throw new Error('Real API not available yet');
  }

  // Character Creation
  async getCharacterTemplates() {
    return this.request('/characters/templates');
  }

  async createCharacter(request: any) {
    return this.request('/characters', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Dice Rolling
  async rollDice(request: any) {
    return this.request('/dice/roll', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // AI Seer
  async getSeerAdvice(request: any) {
    return this.request('/ai/seer-advice', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Health Check
  async healthCheck() {
    if (this.mockMode) {
      return {
        status: "healthy",
        service: "SPARC Game Engine (Mock Mode)",
        version: "1.0.0",
        deployment: "demo"
      };
    }
    const response = await fetch(import.meta.env.PROD ? '/api/health' : 'http://localhost:8181/health');
    return response.json();
  }
}

export const api = new SparcApi();