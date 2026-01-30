// API Service for SPARC RPG
import { useAuthStore } from '../stores/authStore';
import type { Character, Session, User } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.sparcrpg.com';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = useAuthStore.getState().token;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.message || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error. Please check your connection.' };
  }
}

// Auth API
export const authApi = {
  async login(provider: string, code: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return fetchApi('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ provider, code }),
    });
  },

  async logout(): Promise<ApiResponse<void>> {
    return fetchApi('/api/v1/auth/logout', { method: 'POST' });
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return fetchApi('/api/v1/auth/profile');
  },
};

// Characters API
export const charactersApi = {
  async list(): Promise<ApiResponse<Character[]>> {
    return fetchApi('/api/v1/characters');
  },

  async get(id: string): Promise<ApiResponse<Character>> {
    return fetchApi(`/api/v1/characters/${id}`);
  },

  async create(character: Partial<Character>): Promise<ApiResponse<Character>> {
    return fetchApi('/api/v1/characters', {
      method: 'POST',
      body: JSON.stringify(character),
    });
  },

  async update(id: string, updates: Partial<Character>): Promise<ApiResponse<Character>> {
    return fetchApi(`/api/v1/characters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return fetchApi(`/api/v1/characters/${id}`, { method: 'DELETE' });
  },

  async uploadPhoto(id: string, uri: string): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('photo', {
      uri,
      type: 'image/jpeg',
      name: 'character-photo.jpg',
    } as unknown as Blob);

    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_BASE_URL}/api/v1/characters/${id}/photo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      return { error: 'Failed to upload photo' };
    }

    return { data: await response.json() };
  },
};

// Sessions API
export const sessionsApi = {
  async list(): Promise<ApiResponse<Session[]>> {
    return fetchApi('/api/v1/sessions');
  },

  async get(id: string): Promise<ApiResponse<Session>> {
    return fetchApi(`/api/v1/sessions/${id}`);
  },

  async join(code: string, characterId: string): Promise<ApiResponse<Session>> {
    return fetchApi('/api/v1/sessions/join', {
      method: 'POST',
      body: JSON.stringify({ code, characterId }),
    });
  },

  async leave(sessionId: string): Promise<ApiResponse<void>> {
    return fetchApi(`/api/v1/sessions/${sessionId}/leave`, { method: 'POST' });
  },
};

// Devices API (Push Notifications)
export const devicesApi = {
  async register(token: string, platform: 'ios' | 'android', deviceId: string): Promise<ApiResponse<void>> {
    return fetchApi('/api/v1/devices/register', {
      method: 'POST',
      body: JSON.stringify({ token, platform, deviceId }),
    });
  },

  async unregister(deviceId: string): Promise<ApiResponse<void>> {
    return fetchApi('/api/v1/devices/unregister', {
      method: 'POST',
      body: JSON.stringify({ deviceId }),
    });
  },
};
