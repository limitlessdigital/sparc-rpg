const API_BASE = import.meta.env.PROD ? '/api/sparc' : 'http://localhost:8181/api/sparc';

// API client for SPARC backend
export class SparcApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log('API Request:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
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
    const response = await fetch(import.meta.env.PROD ? '/api/health' : 'http://localhost:8181/health');
    return response.json();
  }
}

export const api = new SparcApi();