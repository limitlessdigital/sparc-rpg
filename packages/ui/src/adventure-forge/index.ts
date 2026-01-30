/**
 * Adventure Forge - Visual Adventure Editor
 * 
 * Canvas-based node graph editor for creating SPARC adventures.
 * Based on PRDs 08-11.
 */

// Types
export * from './types';

// Node configuration
export {
  NODE_CONFIGS,
  NODE_WIDTH,
  NODE_HEIGHT,
  generateId,
  getOutputPorts,
  getRequiredPorts,
  getConnectionType,
  createNode,
  duplicateNode,
} from './node-config';

// Connection utilities
export {
  CONNECTION_CONFIGS,
  generateBezierPath,
  getPortPosition,
  getMidpoint,
  validateConnection,
  generateConnectionId,
  createConnection,
} from './connection-utils';

// Validation
export { validateAdventure, validateNode } from './validation';

// Components
export { ForgeCanvas, useCanvasContext } from './ForgeCanvas';
export type { ForgeCanvasProps } from './ForgeCanvas';

export { NodePalette } from './NodePalette';
export type { NodePaletteProps } from './NodePalette';

export { NodeEditor } from './NodeEditor';
export type { NodeEditorProps } from './NodeEditor';

export { ValidationPanel } from './ValidationPanel';
export type { ValidationPanelProps } from './ValidationPanel';
