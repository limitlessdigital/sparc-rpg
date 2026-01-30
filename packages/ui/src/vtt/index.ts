/**
 * @sparc/ui VTT Lite System
 * 
 * Based on PRD 29: Maps & VTT Lite
 * Provides a lightweight virtual tabletop for SPARC RPG.
 */

// Types
export * from './types';

// Hook
export { useVTT } from './useVTT';
export type { UseVTTOptions, UseVTTReturn } from './useVTT';

// Main Canvas
export { MapCanvas } from './MapCanvas';
export type { MapCanvasProps } from './MapCanvas';

// Token Components
export { Token, TokenPalette, TokenPropertiesModal } from './Token';
export type { TokenPaletteProps, TokenPropertiesModalProps } from './Token';

// Tool Panels
export {
  ModeSelector,
  FogControls,
  DrawingTools,
  LayerPanel,
  ZoomControls,
  SeerToolsPanel,
} from './MapTools';
export type {
  ModeSelectorProps,
  FogControlsProps,
  DrawingToolsProps,
  LayerPanelProps,
  ZoomControlsProps,
  SeerToolsPanelProps,
} from './MapTools';

// Library & Creator
export { MapLibrary, MapCreator } from './MapLibrary';
export type { MapLibraryProps, MapCreatorProps } from './MapLibrary';

// Main View
export { VTTView, VTTWidget } from './VTTView';
export type { VTTViewProps, VTTWidgetProps } from './VTTView';
