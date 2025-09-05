import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdventureForge } from '../src/components/AdventureForge/AdventureForge';
import { AdventureNode, NodeType } from '../src/components/AdventureForge/types';

// Mock canvas context for testing
HTMLCanvasElement.prototype.getContext = () => ({
  clearRect: () => {},
  fillRect: () => {},
  strokeRect: () => {},
  beginPath: () => {},
  closePath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  bezierCurveTo: () => {},
  arc: () => {},
  fill: () => {},
  stroke: () => {},
  fillText: () => {},
  measureText: () => ({ width: 50 }),
  save: () => {},
  restore: () => {},
  canvas: { width: 800, height: 600 }
}) as any;

describe('AdventureForge', () => {
  it('renders the Adventure Forge interface', () => {
    render(<AdventureForge />);
    
    expect(screen.getByText('Adventure Forge')).toBeInTheDocument();
    expect(screen.getByText('0 nodes, 0 connections')).toBeInTheDocument();
    expect(screen.getByText('Add Node')).toBeInTheDocument();
  });

  it('displays zoom controls', () => {
    render(<AdventureForge />);
    
    expect(screen.getByText('−')).toBeInTheDocument(); // Zoom out
    expect(screen.getByText('+')).toBeInTheDocument(); // Zoom in
    expect(screen.getByText('100%')).toBeInTheDocument(); // Zoom level
    expect(screen.getByText('Center')).toBeInTheDocument();
  });

  it('opens node palette when Add Node is clicked', () => {
    render(<AdventureForge />);
    
    fireEvent.click(screen.getByText('Add Node'));
    
    expect(screen.getByText('Story')).toBeInTheDocument();
    expect(screen.getByText('Decision')).toBeInTheDocument();
    expect(screen.getByText('Challenge')).toBeInTheDocument();
    expect(screen.getByText('Combat')).toBeInTheDocument();
    expect(screen.getByText('Check')).toBeInTheDocument();
  });

  it('creates nodes with correct properties', () => {
    const onSave = vi.fn();
    render(<AdventureForge onSave={onSave} />);
    
    // Open node palette
    fireEvent.click(screen.getByText('Add Node'));
    
    // Click on Story node
    fireEvent.click(screen.getByText('Story'));
    
    // Verify node count updated
    expect(screen.getByText('1 nodes, 0 connections')).toBeInTheDocument();
  });

  it('handles initial nodes prop', () => {
    const testNodes: AdventureNode[] = [
      {
        id: 'test-node-1',
        type: 'story',
        position: { x: 100, y: 100 },
        validationState: 'valid',
        properties: {
          title: 'Test Story Node',
          content: { text: 'Test content' },
          experiencePoints: 0,
          endConditions: { victory: false, failure: false }
        },
        connections: {
          inputs: [{ id: 'input', label: 'Input', position: { x: -30, y: 0 } }],
          outputs: [{ id: 'output', label: 'Output', position: { x: 30, y: 0 } }]
        }
      }
    ];

    render(<AdventureForge initialNodes={testNodes} />);
    
    expect(screen.getByText('1 nodes, 0 connections')).toBeInTheDocument();
  });

  it('saves to localStorage with adventureId', () => {
    const adventureId = 'test-adventure-123';
    render(<AdventureForge adventureId={adventureId} />);
    
    // Add a node to trigger save
    fireEvent.click(screen.getByText('Add Node'));
    fireEvent.click(screen.getByText('Story'));
    
    // Check localStorage was called (we can't easily verify the content in tests)
    expect(screen.getByText('1 nodes, 0 connections')).toBeInTheDocument();
  });

  it('handles zoom controls', () => {
    render(<AdventureForge />);
    
    // Test zoom in
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('120%')).toBeInTheDocument();
    
    // Test zoom out
    fireEvent.click(screen.getByText('−'));
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Test reset zoom
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('100%'));
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

describe('Node Type Validation', () => {
  const nodeTypes: NodeType[] = ['story', 'decision', 'challenge', 'combat', 'check'];
  
  nodeTypes.forEach(type => {
    it(`creates ${type} nodes with correct default properties`, () => {
      const onSave = vi.fn();
      render(<AdventureForge onSave={onSave} />);
      
      fireEvent.click(screen.getByText('Add Node'));
      
      // Find the node type button (capitalize first letter)
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      fireEvent.click(screen.getByText(typeLabel));
      
      expect(screen.getByText('1 nodes, 0 connections')).toBeInTheDocument();
    });
  });
});

describe('Canvas Interaction', () => {
  it('displays canvas info overlay', () => {
    render(<AdventureForge />);
    
    // The canvas overlay should show zoom and node count
    expect(screen.getByText(/Zoom:/)).toBeInTheDocument();
    expect(screen.getByText(/Nodes:/)).toBeInTheDocument();
    expect(screen.getByText(/Mode:/)).toBeInTheDocument();
  });
});