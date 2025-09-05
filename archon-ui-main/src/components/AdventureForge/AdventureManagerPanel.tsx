import React, { useState, useEffect, useMemo } from 'react';
import { DataManager, AdventureMetadata, AdventureData } from './DataManager';
import { AdventureNode, NodeConnection } from './types';
import { 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Clock, 
  Star, 
  AlertCircle,
  CheckCircle,
  Zap,
  FileText,
  Share,
  Archive,
  Settings
} from 'lucide-react';

interface AdventureManagerPanelProps {
  currentAdventure?: {
    metadata: AdventureMetadata;
    nodes: AdventureNode[];
    connections: NodeConnection[];
  };
  onLoadAdventure?: (adventure: AdventureData) => void;
  onNewAdventure?: () => void;
  className?: string;
}

export const AdventureManagerPanel: React.FC<AdventureManagerPanelProps> = ({
  currentAdventure,
  onLoadAdventure,
  onNewAdventure,
  className = ''
}) => {
  const [dataManager] = useState(() => new DataManager());
  const [adventures, setAdventures] = useState<AdventureMetadata[]>([]);
  const [selectedTab, setSelectedTab] = useState<'library' | 'current' | 'export' | 'import' | 'storage'>('library');
  const [showNewAdventureDialog, setShowNewAdventureDialog] = useState(false);
  const [importData, setImportData] = useState<string>('');
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    refreshAdventures();
    updateStorageInfo();
  }, []);

  const refreshAdventures = () => {
    const adventureList = dataManager.listAdventures();
    setAdventures(adventureList);
  };

  const updateStorageInfo = () => {
    const info = dataManager.getStorageInfo();
    setStorageInfo(info);
  };

  const handleSaveCurrentAdventure = async () => {
    if (!currentAdventure) return;

    try {
      const adventureData: AdventureData = {
        metadata: currentAdventure.metadata,
        nodes: currentAdventure.nodes,
        connections: currentAdventure.connections,
        startNodeId: currentAdventure.nodes[0]?.id || '',
        validationResult: { isValid: true, errors: [], warnings: [] },
        playerStats: {
          timesPlayed: 0,
          averageRating: 0,
          completionRate: 0
        }
      };

      dataManager.saveAdventure(adventureData);
      refreshAdventures();
      updateStorageInfo();
      
      // Show success notification
      console.log('Adventure saved successfully');
    } catch (error) {
      console.error('Failed to save adventure:', error);
      alert('Failed to save adventure. Please try again.');
    }
  };

  const handleLoadAdventure = (adventureId: string) => {
    const adventure = dataManager.loadAdventure(adventureId);
    if (adventure && onLoadAdventure) {
      onLoadAdventure(adventure);
    }
  };

  const handleDeleteAdventure = (adventureId: string) => {
    if (confirm('Are you sure you want to delete this adventure? This action cannot be undone.')) {
      dataManager.deleteAdventure(adventureId);
      refreshAdventures();
      updateStorageInfo();
    }
  };

  const handleDuplicateAdventure = (adventureId: string) => {
    const sourceAdventure = adventures.find(a => a.id === adventureId);
    if (sourceAdventure) {
      const newTitle = `${sourceAdventure.title} (Copy)`;
      const duplicated = dataManager.duplicateAdventure(adventureId, newTitle);
      if (duplicated) {
        refreshAdventures();
        updateStorageInfo();
      }
    }
  };

  const handleExportAdventure = (adventureId: string, format: 'json' | 'md' = 'json') => {
    try {
      const fileData = dataManager.generateDownloadFile(adventureId, format);
      
      // Create download link
      const blob = new Blob([fileData.content], { type: fileData.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export adventure:', error);
      alert('Failed to export adventure. Please try again.');
    }
  };

  const handleImportAdventure = () => {
    try {
      const exportData = JSON.parse(importData);
      const imported = dataManager.importAdventure(exportData, {
        author: 'Imported User',
        title: exportData.meta?.title || 'Imported Adventure'
      });
      
      if (imported) {
        refreshAdventures();
        updateStorageInfo();
        setImportData('');
        setSelectedTab('library');
        alert('Adventure imported successfully!');
      }
    } catch (error) {
      console.error('Failed to import adventure:', error);
      alert('Failed to import adventure. Please check the format and try again.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'library', label: 'Adventure Library', icon: FolderOpen },
    { id: 'current', label: 'Current Adventure', icon: FileText },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'storage', label: 'Storage', icon: Archive }
  ];

  return (
    <div className={`bg-white border border-gray-300 rounded-lg shadow-sm ${className}`}>
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold text-gray-900">Adventure Manager</h3>
          <button
            onClick={() => setShowNewAdventureDialog(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            New Adventure
          </button>
        </div>
        
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {selectedTab === 'library' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Saved Adventures ({adventures.length})</h4>
              <button
                onClick={refreshAdventures}
                className="p-1 text-gray-500 hover:text-gray-700 rounded"
                title="Refresh"
              >
                <Clock size={16} />
              </button>
            </div>

            {adventures.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="mx-auto mb-2" size={48} />
                <p className="font-medium">No adventures yet</p>
                <p className="text-sm">Create your first adventure to get started!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {adventures.map(adventure => (
                  <div key={adventure.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 truncate">{adventure.title}</h5>
                        <p className="text-sm text-gray-600 truncate">by {adventure.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(adventure.difficulty)}`}>
                            {adventure.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">{adventure.estimatedPlaytime}min</span>
                          <span className="text-xs text-gray-500">{formatDate(adventure.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleLoadAdventure(adventure.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Load Adventure"
                        >
                          <FolderOpen size={14} />
                        </button>
                        <button
                          onClick={() => handleExportAdventure(adventure.id, 'json')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Export as JSON"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicateAdventure(adventure.id)}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAdventure(adventure.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'current' && (
          <div>
            {currentAdventure ? (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{currentAdventure.metadata.title}</h4>
                  <p className="text-sm text-gray-600">by {currentAdventure.metadata.author}</p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nodes:</span> {currentAdventure.nodes.length}
                    </div>
                    <div>
                      <span className="font-medium">Connections:</span> {currentAdventure.connections.length}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span> {currentAdventure.metadata.difficulty}
                    </div>
                    <div>
                      <span className="font-medium">Playtime:</span> {currentAdventure.metadata.estimatedPlaytime}min
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCurrentAdventure}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Save size={16} />
                    Save Adventure
                  </button>
                  <button
                    onClick={() => handleExportAdventure(currentAdventure.metadata.id, 'json')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Download size={16} />
                    Export JSON
                  </button>
                  <button
                    onClick={() => handleExportAdventure(currentAdventure.metadata.id, 'md')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <FileText size={16} />
                    Export MD
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto mb-2" size={48} />
                <p className="font-medium">No adventure loaded</p>
                <p className="text-sm">Load an adventure from the library or create a new one.</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'export' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Export Adventures</h4>
              <p className="text-sm text-gray-600 mb-4">
                Export your adventures as JSON files to share with others or as Markdown documentation.
              </p>
            </div>

            <div className="space-y-2">
              {adventures.map(adventure => (
                <div key={adventure.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <h5 className="font-medium">{adventure.title}</h5>
                    <p className="text-sm text-gray-600">by {adventure.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportAdventure(adventure.id, 'json')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => handleExportAdventure(adventure.id, 'md')}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Markdown
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'import' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Import Adventure</h4>
              <p className="text-sm text-gray-600 mb-4">
                Paste exported adventure JSON data to import it into your library.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adventure JSON Data
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none font-mono text-sm"
                placeholder="Paste exported adventure JSON here..."
              />
            </div>

            <button
              onClick={handleImportAdventure}
              disabled={!importData.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Adventure
            </button>
          </div>
        )}

        {selectedTab === 'storage' && storageInfo && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Storage Usage</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Archive className="text-blue-600" size={20} />
                  <span className="font-medium text-blue-900">Total Adventures</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{storageInfo.totalAdventures}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-green-600" size={20} />
                  <span className="font-medium text-green-900">Storage Used</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{formatFileSize(storageInfo.totalSize)}</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-yellow-600" size={20} />
                  <span className="font-medium text-yellow-900">Available Space</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900">{formatFileSize(storageInfo.availableSpace)}</div>
              </div>

              {storageInfo.largestAdventure && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="text-purple-600" size={20} />
                    <span className="font-medium text-purple-900">Largest Adventure</span>
                  </div>
                  <div className="text-lg font-bold text-purple-900">{formatFileSize(storageInfo.largestAdventure.size)}</div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Storage Tips</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Browser storage has a ~5MB limit per site</li>
                <li>• Export adventures regularly to avoid data loss</li>
                <li>• Delete unused adventures to free up space</li>
                <li>• Large adventures with many nodes use more storage</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* New Adventure Dialog */}
      {showNewAdventureDialog && (
        <NewAdventureDialog
          onCreateAdventure={(title, author, description) => {
            const adventure = dataManager.createAdventure(title, author, description);
            dataManager.saveAdventure(adventure);
            refreshAdventures();
            updateStorageInfo();
            if (onLoadAdventure) {
              onLoadAdventure(adventure);
            }
            setShowNewAdventureDialog(false);
          }}
          onClose={() => setShowNewAdventureDialog(false)}
        />
      )}
    </div>
  );
};

// New Adventure Dialog Component
interface NewAdventureDialogProps {
  onCreateAdventure: (title: string, author: string, description: string) => void;
  onClose: () => void;
}

const NewAdventureDialog: React.FC<NewAdventureDialogProps> = ({ onCreateAdventure, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && author.trim()) {
      onCreateAdventure(title.trim(), author.trim(), description.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Adventure</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adventure Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter adventure title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author Name *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Your name..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
              rows={3}
              placeholder="Brief description of your adventure..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Adventure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};