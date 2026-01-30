/**
 * SPARC Session Types
 */

export interface SessionCode {
  code: string;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  createdBy: string;
}

export interface SessionState {
  id: string;
  code: SessionCode | null;
  hostId: string;
  players: string[];
  status: 'lobby' | 'active' | 'paused' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}
