import React, { useState, useEffect, useMemo } from 'react';
import { ValidationEngine } from './ValidationEngine';
import { AdventureNode, NodeConnection, ValidationError, ValidationWarning } from './types';
import { AlertTriangle, CheckCircle, XCircle, Info, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface ValidationPanelProps {
  nodes: AdventureNode[];
  connections: NodeConnection[];
  onNodeSelect?: (nodeId: string) => void;
  className?: string;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  nodes,
  connections,
  onNodeSelect,
  className = ''
}) => {
  const [validationEngine] = useState(() => new ValidationEngine());
  const [isExpanded, setIsExpanded] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoValidate, setAutoValidate] = useState(true);

  const validationReport = useMemo(() => {
    return validationEngine.generateReport(nodes, connections);
  }, [validationEngine, nodes, connections]);

  const filteredErrors = useMemo(() => {
    let errors = validationReport.details.errors;
    let warnings = showWarnings ? validationReport.details.warnings : [];

    if (selectedCategory !== 'all') {
      const categoryRules = validationEngine.getRulesByCategory(selectedCategory);
      const categoryRuleIds = new Set(categoryRules.map(r => r.id));
      
      errors = errors.filter(error => 
        categoryRuleIds.has(error.id.replace(/_(.*?)_.*/, '').replace(/^(.*?)_.*/, '$1'))
      );
      warnings = warnings.filter(warning => 
        categoryRuleIds.has(warning.id.replace(/_(.*?)_.*/, '').replace(/^(.*?)_.*/, '$1'))
      );
    }

    return [...errors, ...warnings].sort((a, b) => {
      // Sort by severity (errors first), then by node
      if (a.severity !== b.severity) {
        return a.severity === 'error' ? -1 : 1;
      }
      return (a.nodeId || '').localeCompare(b.nodeId || '');
    });
  }, [validationReport, showWarnings, selectedCategory, validationEngine]);

  const getStatusIcon = () => {
    const { errorCount, warningCount } = validationReport.summary;
    
    if (errorCount > 0) {
      return <XCircle className="text-red-500" size={20} />;
    }
    if (warningCount > 0) {
      return <AlertTriangle className="text-yellow-500" size={20} />;
    }
    return <CheckCircle className="text-green-500" size={20} />;
  };

  const getStatusText = () => {
    const { errorCount, warningCount, isValid } = validationReport.summary;
    
    if (isValid && warningCount === 0) {
      return 'Adventure is valid and ready to publish';
    }
    if (isValid && warningCount > 0) {
      return `Adventure is valid with ${warningCount} warning${warningCount > 1 ? 's' : ''}`;
    }
    return `${errorCount} error${errorCount > 1 ? 's' : ''} must be fixed before publishing`;
  };

  const handleErrorClick = (error: ValidationError | ValidationWarning) => {
    if (error.nodeId && onNodeSelect) {
      onNodeSelect(error.nodeId);
    }
  };

  const getErrorIcon = (error: ValidationError | ValidationWarning) => {
    switch (error.severity) {
      case 'error':
        return <XCircle className="text-red-500 flex-shrink-0" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500 flex-shrink-0" size={16} />;
      default:
        return <Info className="text-blue-500 flex-shrink-0" size={16} />;
    }
  };

  const categories = [
    { id: 'all', name: 'All Issues', icon: '🔍' },
    { id: 'structure', name: 'Structure', icon: '🏗️' },
    { id: 'logic', name: 'Logic', icon: '🧠' },
    { id: 'content', name: 'Content', icon: '📝' },
    { id: 'accessibility', name: 'Accessibility', icon: '♿' },
    { id: 'performance', name: 'Performance', icon: '⚡' }
  ];

  return (
    <div className={`bg-white border border-gray-300 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900">Adventure Validation</h3>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoValidate(!autoValidate)}
            className={`p-2 rounded ${autoValidate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            title={autoValidate ? 'Auto-validation enabled' : 'Auto-validation disabled'}
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{validationReport.summary.totalNodes}</div>
              <div className="text-sm text-gray-600">Nodes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{validationReport.summary.totalConnections}</div>
              <div className="text-sm text-gray-600">Connections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{validationReport.summary.errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{validationReport.summary.warningCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {isExpanded && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showWarnings}
                onChange={(e) => setShowWarnings(e.target.checked)}
                className="mr-2"
              />
              Show warnings
            </label>
          </div>
        </div>
      )}

      {/* Validation Issues */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {filteredErrors.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
              <p className="font-medium">No issues found!</p>
              <p className="text-sm">Your adventure looks good for this category.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredErrors.map((error, index) => {
                const node = error.nodeId ? nodes.find(n => n.id === error.nodeId) : null;
                
                return (
                  <div
                    key={index}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${error.nodeId ? 'cursor-pointer' : ''}`}
                    onClick={() => handleErrorClick(error)}
                  >
                    <div className="flex gap-3">
                      {getErrorIcon(error)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900 break-words">
                            {error.message}
                          </p>
                          {node && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full whitespace-nowrap">
                              {node.properties.title || node.type}
                            </span>
                          )}
                        </div>
                        
                        {error.suggestion && (
                          <p className="mt-1 text-xs text-gray-600">
                            <strong>💡 Suggestion:</strong> {error.suggestion}
                          </p>
                        )}
                        
                        {node && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${
                              node.type === 'story' ? 'bg-blue-500' :
                              node.type === 'decision' ? 'bg-purple-500' :
                              node.type === 'challenge' ? 'bg-yellow-500' :
                              node.type === 'combat' ? 'bg-red-500' :
                              node.type === 'check' ? 'bg-green-500' : 'bg-gray-500'
                            }`}></span>
                            <span className="text-xs text-gray-500 capitalize">
                              {node.type} node
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {isExpanded && validationReport.recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 border-t border-gray-200">
          <h4 className="font-medium text-blue-900 mb-2">📋 Recommendations</h4>
          <ul className="space-y-1">
            {validationReport.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-800">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Real-time node validation indicator component
interface NodeValidationIndicatorProps {
  node: AdventureNode;
  allNodes: AdventureNode[];
  connections: NodeConnection[];
  className?: string;
}

export const NodeValidationIndicator: React.FC<NodeValidationIndicatorProps> = ({
  node,
  allNodes,
  connections,
  className = ''
}) => {
  const [validationEngine] = useState(() => new ValidationEngine());
  
  const nodeErrors = useMemo(() => {
    return validationEngine.validateNode(node, allNodes, connections);
  }, [validationEngine, node, allNodes, connections]);

  const errorCount = nodeErrors.filter(e => e.severity === 'error').length;
  const warningCount = nodeErrors.filter(e => e.severity === 'warning').length;

  if (errorCount === 0 && warningCount === 0) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <CheckCircle className="text-green-500" size={16} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} title={`${errorCount} errors, ${warningCount} warnings`}>
      {errorCount > 0 && (
        <div className="flex items-center gap-1">
          <XCircle className="text-red-500" size={16} />
          <span className="text-xs font-medium text-red-600">{errorCount}</span>
        </div>
      )}
      {warningCount > 0 && (
        <div className="flex items-center gap-1">
          <AlertTriangle className="text-yellow-500" size={16} />
          <span className="text-xs font-medium text-yellow-600">{warningCount}</span>
        </div>
      )}
    </div>
  );
};