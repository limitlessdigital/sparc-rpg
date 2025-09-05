import React, { useState } from 'react';
import { DataManager } from './DataManager';
import { AdventureExport, AdventureNode, NodeConnection } from './types';
import { Share, Link, Copy, CheckCircle, Download, Upload } from 'lucide-react';

interface AdventureShareProps {
  nodes: AdventureNode[];
  connections: NodeConnection[];
  title: string;
  author: string;
  onImportAdventure?: (nodes: AdventureNode[], connections: NodeConnection[]) => void;
}

export const AdventureShare: React.FC<AdventureShareProps> = ({
  nodes,
  connections,
  title,
  author,
  onImportAdventure
}) => {
  const [dataManager] = useState(() => new DataManager());
  const [shareLink, setShareLink] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'export' | 'import'>('export');

  const generateShareableData = (): AdventureExport => {
    return {
      meta: {
        title,
        authorId: author,
        version: 1,
        estimatedPlaytime: Math.max(10, Math.min(180, nodes.length * 5)), // Rough estimate
        difficulty: 'intermediate'
      },
      nodes,
      connections,
      startNodeId: nodes[0]?.id || '',
      validationState: { isValid: true, errors: [], warnings: [] }
    };
  };

  const handleGenerateShareLink = () => {
    const exportData = generateShareableData();
    const jsonData = JSON.stringify(exportData);
    const encoded = btoa(encodeURIComponent(jsonData));
    
    // Create a data URL for easy sharing
    const shareableLink = `${window.location.origin}${window.location.pathname}#import=${encoded}`;
    setShareLink(shareableLink);
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadJSON = () => {
    const exportData = generateShareableData();
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.adventure.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFromData = () => {
    try {
      const exportData: AdventureExport = JSON.parse(importData);
      
      if (!exportData.nodes || !exportData.connections) {
        throw new Error('Invalid adventure format');
      }
      
      if (onImportAdventure) {
        onImportAdventure(exportData.nodes, exportData.connections);
      }
      
      setImportData('');
      alert('Adventure imported successfully!');
    } catch (error) {
      alert('Failed to import adventure. Please check the format.');
    }
  };

  const handleImportFromLink = () => {
    try {
      const url = new URL(importData);
      const hash = url.hash;
      const importMatch = hash.match(/#import=(.+)/);
      
      if (importMatch) {
        const encoded = importMatch[1];
        const decoded = decodeURIComponent(atob(encoded));
        const exportData: AdventureExport = JSON.parse(decoded);
        
        if (onImportAdventure) {
          onImportAdventure(exportData.nodes, exportData.connections);
        }
        
        setImportData('');
        alert('Adventure imported successfully from link!');
      } else {
        throw new Error('Invalid share link format');
      }
    } catch (error) {
      alert('Failed to import from link. Please check the URL.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setMode('export')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              mode === 'export'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Share className="inline mr-2" size={16} />
            Export & Share
          </button>
          <button
            onClick={() => setMode('import')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              mode === 'import'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="inline mr-2" size={16} />
            Import
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {mode === 'export' ? (
          <div className="space-y-6">
            {/* Adventure Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 mb-3">by {author}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nodes:</span> {nodes.length}
                </div>
                <div>
                  <span className="font-medium">Connections:</span> {connections.length}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Export Options</h4>
                
                <div className="space-y-3">
                  {/* Download JSON */}
                  <button
                    onClick={handleDownloadJSON}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download size={18} />
                    Download as JSON File
                  </button>

                  {/* Generate Share Link */}
                  <button
                    onClick={handleGenerateShareLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Link size={18} />
                    Generate Share Link
                  </button>
                </div>
              </div>

              {/* Share Link Display */}
              {shareLink && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Share Link</h5>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
                    />
                    <button
                      onClick={() => handleCopyToClipboard(shareLink)}
                      className={`px-3 py-2 rounded ${
                        copied
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Share this link with others to let them import your adventure directly into their Adventure Forge.
                  </p>
                </div>
              )}

              {/* Raw JSON Export */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Raw JSON Data</h5>
                <textarea
                  value={JSON.stringify(generateShareableData(), null, 2)}
                  readOnly
                  className="w-full h-32 px-3 py-2 bg-white border border-gray-300 rounded text-xs font-mono resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleCopyToClipboard(JSON.stringify(generateShareableData(), null, 2))}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Copy JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Import Adventure</h4>
              <p className="text-sm text-gray-600 mb-4">
                Import an adventure from a share link or raw JSON data.
              </p>
            </div>

            {/* Import from Link */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">From Share Link</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste share link here..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
                <button
                  onClick={handleImportFromLink}
                  disabled={!importData.includes('#import=')}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  Import
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h5 className="font-medium text-gray-700 mb-2">From JSON Data</h5>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste adventure JSON data here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded resize-none font-mono text-sm"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleImportFromData}
                  disabled={!importData.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Import JSON
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-t border-gray-200 pt-4">
              <h5 className="font-medium text-gray-700 mb-2">From File</h5>
              <input
                type="file"
                accept=".json,.adventure"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      setImportData(content);
                    };
                    reader.readAsText(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-600 mt-1">
                Select a .json or .adventure file to import
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};