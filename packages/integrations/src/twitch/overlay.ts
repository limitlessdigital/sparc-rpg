/**
 * Twitch overlay management for OBS browser sources
 */

import { z } from 'zod';
import type {
  OverlayConfig,
  OverlayState,
  OverlaySceneState,
  OverlayCharacterState,
  OverlayRollState,
  OverlayComponents,
  OverlayTheme,
} from './types';
import { randomUUID } from 'crypto';

// ============================================================================
// Overlay URL Generation
// ============================================================================

export interface OverlayUrlOptions {
  baseUrl: string;
  overlayId: string;
  token: string;
  theme?: OverlayTheme;
  components?: Partial<OverlayComponents>;
}

export function generateOverlayUrl(options: OverlayUrlOptions): string {
  const url = new URL(`${options.baseUrl}/overlay/${options.overlayId}`);
  url.searchParams.set('token', options.token);
  
  if (options.theme) {
    url.searchParams.set('theme', options.theme);
  }
  
  if (options.components) {
    url.searchParams.set('components', JSON.stringify(options.components));
  }
  
  return url.toString();
}

// ============================================================================
// Overlay Configuration Manager
// ============================================================================

export interface OverlayStorage {
  getConfig(overlayId: string): Promise<OverlayConfig | null>;
  getConfigByToken(token: string): Promise<OverlayConfig | null>;
  getConfigsByStreamer(streamerId: string): Promise<OverlayConfig[]>;
  saveConfig(config: OverlayConfig): Promise<void>;
  deleteConfig(overlayId: string): Promise<void>;
}

export class OverlayManager {
  constructor(
    private storage: OverlayStorage,
    private baseUrl: string
  ) {}

  /**
   * Create a new overlay configuration
   */
  async createOverlay(params: {
    streamerId: string;
    sessionId?: string;
    theme?: OverlayTheme;
    components?: Partial<OverlayComponents>;
  }): Promise<{ config: OverlayConfig; url: string }> {
    const id = randomUUID();
    const token = randomUUID();
    const now = new Date().toISOString();

    const config: OverlayConfig = {
      id,
      streamerId: params.streamerId,
      sessionId: params.sessionId,
      theme: params.theme || 'dark',
      components: {
        currentScene: true,
        diceRolls: true,
        characterBars: true,
        turnOrder: false,
        chatFeed: false,
        timer: false,
        ...params.components,
      },
      animationSpeed: 'normal',
      rollDisplayDuration: 5000,
      autoHideInactive: true,
      overlayToken: token,
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.saveConfig(config);

    const url = generateOverlayUrl({
      baseUrl: this.baseUrl,
      overlayId: id,
      token,
      theme: config.theme,
    });

    return { config, url };
  }

  /**
   * Update overlay configuration
   */
  async updateOverlay(
    overlayId: string,
    updates: Partial<Pick<OverlayConfig, 'theme' | 'components' | 'position' | 'customCss' | 'animationSpeed' | 'rollDisplayDuration' | 'autoHideInactive' | 'sessionId'>>
  ): Promise<OverlayConfig | null> {
    const config = await this.storage.getConfig(overlayId);
    if (!config) return null;

    const updated: OverlayConfig = {
      ...config,
      ...updates,
      components: updates.components 
        ? { ...config.components, ...updates.components }
        : config.components,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveConfig(updated);
    return updated;
  }

  /**
   * Regenerate overlay token (invalidates old URL)
   */
  async regenerateToken(overlayId: string): Promise<{ config: OverlayConfig; url: string } | null> {
    const config = await this.storage.getConfig(overlayId);
    if (!config) return null;

    const newToken = randomUUID();
    const updated: OverlayConfig = {
      ...config,
      overlayToken: newToken,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveConfig(updated);

    const url = generateOverlayUrl({
      baseUrl: this.baseUrl,
      overlayId: config.id,
      token: newToken,
      theme: config.theme,
    });

    return { config: updated, url };
  }

  /**
   * Get overlay URL for OBS
   */
  async getOverlayUrl(overlayId: string): Promise<string | null> {
    const config = await this.storage.getConfig(overlayId);
    if (!config) return null;

    return generateOverlayUrl({
      baseUrl: this.baseUrl,
      overlayId: config.id,
      token: config.overlayToken,
      theme: config.theme,
    });
  }

  /**
   * Validate overlay token
   */
  async validateToken(overlayId: string, token: string): Promise<boolean> {
    const config = await this.storage.getConfig(overlayId);
    return config !== null && config.overlayToken === token;
  }

  /**
   * Delete an overlay
   */
  async deleteOverlay(overlayId: string): Promise<void> {
    await this.storage.deleteConfig(overlayId);
  }

  /**
   * List overlays for a streamer
   */
  async listOverlays(streamerId: string): Promise<OverlayConfig[]> {
    return this.storage.getConfigsByStreamer(streamerId);
  }
}

// ============================================================================
// Overlay State Manager (Real-time state for WebSocket broadcast)
// ============================================================================

export interface OverlayStateSubscriber {
  onStateUpdate(state: OverlayState): void;
  onDisconnect(): void;
}

export class OverlayStateManager {
  private states: Map<string, OverlayState> = new Map();
  private subscribers: Map<string, Set<OverlayStateSubscriber>> = new Map();

  /**
   * Initialize state for a session
   */
  initializeState(sessionId: string): void {
    if (!this.states.has(sessionId)) {
      this.states.set(sessionId, {
        sessionId,
        isLive: false,
        characters: [],
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  /**
   * Get current state for a session
   */
  getState(sessionId: string): OverlayState | undefined {
    return this.states.get(sessionId);
  }

  /**
   * Subscribe to state updates
   */
  subscribe(sessionId: string, subscriber: OverlayStateSubscriber): () => void {
    if (!this.subscribers.has(sessionId)) {
      this.subscribers.set(sessionId, new Set());
    }
    this.subscribers.get(sessionId)!.add(subscriber);

    // Send current state
    const state = this.states.get(sessionId);
    if (state) {
      subscriber.onStateUpdate(state);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.get(sessionId)?.delete(subscriber);
    };
  }

  /**
   * Update scene state
   */
  updateScene(sessionId: string, scene: OverlaySceneState): void {
    this.updateState(sessionId, state => ({
      ...state,
      scene,
    }));
  }

  /**
   * Update character states
   */
  updateCharacters(sessionId: string, characters: OverlayCharacterState[]): void {
    this.updateState(sessionId, state => ({
      ...state,
      characters,
    }));
  }

  /**
   * Update a single character
   */
  updateCharacter(sessionId: string, character: OverlayCharacterState): void {
    this.updateState(sessionId, state => ({
      ...state,
      characters: state.characters.map(c =>
        c.id === character.id ? character : c
      ),
    }));
  }

  /**
   * Add a new dice roll
   */
  addRoll(sessionId: string, roll: Omit<OverlayRollState, 'id' | 'timestamp'>): void {
    const rollState: OverlayRollState = {
      ...roll,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.updateState(sessionId, state => ({
      ...state,
      lastRoll: rollState,
    }));
  }

  /**
   * Set session live status
   */
  setLiveStatus(sessionId: string, isLive: boolean): void {
    this.updateState(sessionId, state => ({
      ...state,
      isLive,
    }));
  }

  /**
   * Clear state for a session
   */
  clearState(sessionId: string): void {
    this.states.delete(sessionId);
    
    // Notify subscribers
    const subs = this.subscribers.get(sessionId);
    if (subs) {
      for (const sub of subs) {
        sub.onDisconnect();
      }
      this.subscribers.delete(sessionId);
    }
  }

  private updateState(
    sessionId: string,
    updater: (state: OverlayState) => OverlayState
  ): void {
    const current = this.states.get(sessionId);
    if (!current) {
      this.initializeState(sessionId);
    }

    const updated = updater(this.states.get(sessionId)!);
    updated.lastUpdated = new Date().toISOString();
    this.states.set(sessionId, updated);

    // Notify subscribers
    const subs = this.subscribers.get(sessionId);
    if (subs) {
      for (const sub of subs) {
        sub.onStateUpdate(updated);
      }
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createOverlayManager(
  storage: OverlayStorage,
  baseUrl: string
): OverlayManager {
  return new OverlayManager(storage, baseUrl);
}

export function createOverlayStateManager(): OverlayStateManager {
  return new OverlayStateManager();
}

// ============================================================================
// Overlay HTML Template Generator
// ============================================================================

export function generateOverlayHtml(config: OverlayConfig, state: OverlayState): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SPARC RPG Overlay</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: transparent;
      color: ${config.theme === 'light' ? '#1a1a2e' : '#ffffff'};
      overflow: hidden;
    }
    
    .overlay-container {
      padding: 16px;
      background: ${config.theme === 'transparent' ? 'transparent' : config.theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(26,26,46,0.9)'};
      border-radius: 8px;
      max-width: 400px;
    }
    
    .scene-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 8px;
      color: ${config.theme === 'light' ? '#9b59b6' : '#bb86fc'};
    }
    
    .scene-description {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-bottom: 16px;
    }
    
    .character-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding: 8px;
      background: rgba(0,0,0,0.2);
      border-radius: 4px;
    }
    
    .character-bar.active {
      border-left: 3px solid #bb86fc;
    }
    
    .character-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #444;
    }
    
    .character-name {
      flex: 1;
      font-weight: 500;
    }
    
    .hp-bar {
      width: 80px;
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .hp-fill {
      height: 100%;
      background: linear-gradient(90deg, #e74c3c, #2ecc71);
      transition: width 0.3s ease;
    }
    
    .dice-roll {
      padding: 16px;
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      text-align: center;
      animation: rollIn 0.3s ease;
    }
    
    .dice-roll.success { border: 2px solid #2ecc71; }
    .dice-roll.failure { border: 2px solid #e74c3c; }
    .dice-roll.critical { border: 2px solid #f1c40f; }
    
    .dice-results {
      font-size: 2rem;
      margin: 8px 0;
    }
    
    @keyframes rollIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    ${config.customCss || ''}
  </style>
</head>
<body>
  <div class="overlay-container" id="overlay">
    <!-- Content populated by WebSocket -->
  </div>
  
  <script>
    const CONFIG = ${JSON.stringify({ ...config, overlayToken: undefined })};
    const INITIAL_STATE = ${JSON.stringify(state)};
    
    // WebSocket connection for real-time updates
    function connectWebSocket() {
      const ws = new WebSocket(\`wss://\${location.host}/ws/overlay/\${CONFIG.id}\`);
      
      ws.onmessage = (event) => {
        const state = JSON.parse(event.data);
        updateOverlay(state);
      };
      
      ws.onclose = () => {
        setTimeout(connectWebSocket, 3000);
      };
    }
    
    function updateOverlay(state) {
      // Update scene
      if (CONFIG.components.currentScene && state.scene) {
        document.querySelector('.scene-title').textContent = state.scene.title;
        document.querySelector('.scene-description').textContent = state.scene.description;
      }
      
      // Update characters
      if (CONFIG.components.characterBars) {
        // ... character bar updates
      }
      
      // Show dice roll
      if (CONFIG.components.diceRolls && state.lastRoll) {
        showDiceRoll(state.lastRoll);
      }
    }
    
    function showDiceRoll(roll) {
      const container = document.getElementById('dice-roll-container');
      const resultClass = roll.isCritical ? 'critical' : roll.success ? 'success' : 'failure';
      
      container.innerHTML = \`
        <div class="dice-roll \${resultClass}">
          <div class="roll-character">\${roll.character} rolls \${roll.attribute}!</div>
          <div class="dice-results">\${roll.diceResults.join(' ')}</div>
          <div class="roll-total">Total: \${roll.total} vs DC \${roll.difficulty}</div>
          <div class="roll-result">\${roll.success ? '✓ Success' : '✗ Failure'}</div>
        </div>
      \`;
      
      setTimeout(() => {
        container.innerHTML = '';
      }, CONFIG.rollDisplayDuration);
    }
    
    // Initialize
    updateOverlay(INITIAL_STATE);
    connectWebSocket();
  </script>
</body>
</html>
  `.trim();
}
