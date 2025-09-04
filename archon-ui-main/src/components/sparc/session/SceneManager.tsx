import React, { useState } from 'react'
import { 
  MapPin, Users, Sword, Shield, Eye, MessageSquare, 
  Plus, ChevronDown, ChevronUp, AlertTriangle, BookOpen,
  Zap, Target, Clock
} from 'lucide-react'
import { GameSession, Character } from '../../../services/sparcService'

interface SceneManagerProps {
  session: GameSession
  characters: Character[]
  userRole: 'seer' | 'player'
  onSceneAction?: (action: string, data?: any) => void
  className?: string
}

interface SceneNote {
  id: string
  text: string
  timestamp: Date
  type: 'note' | 'important' | 'action'
}

export default function SceneManager({
  session,
  characters,
  userRole,
  onSceneAction,
  className = ""
}: SceneManagerProps) {
  const [currentScene, setCurrentScene] = useState<string>("A mysterious tavern filled with whispers and shadows...")
  const [sceneNotes, setSceneNotes] = useState<SceneNote[]>([
    {
      id: '1',
      text: 'Party enters the Crimson Drake tavern',
      timestamp: new Date(),
      type: 'note'
    }
  ])
  const [newNote, setNewNote] = useState('')
  const [showNPCs, setShowNPCs] = useState(true)
  const [activeNPCs] = useState([
    { name: 'Bartender Klaus', role: 'Information', status: 'friendly' },
    { name: 'Hooded Figure', role: 'Mystery', status: 'suspicious' },
    { name: 'Town Guard', role: 'Authority', status: 'neutral' }
  ])

  const addNote = (type: 'note' | 'important' | 'action' = 'note') => {
    if (!newNote.trim()) return
    
    const note: SceneNote = {
      id: Date.now().toString(),
      text: newNote,
      timestamp: new Date(),
      type
    }
    
    setSceneNotes(prev => [note, ...prev])
    setNewNote('')
    
    // Notify other players of new note
    onSceneAction?.('add_scene_note', note)
  }

  const updateScene = (newScene: string) => {
    setCurrentScene(newScene)
    onSceneAction?.('update_scene', { scene: newScene })
  }

  const getNoteIcon = (type: string) => {
    switch (type) {
      case 'important': return AlertTriangle
      case 'action': return Zap
      default: return MessageSquare
    }
  }

  const getNoteColor = (type: string) => {
    switch (type) {
      case 'important': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'action': return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    }
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-6 ${className}`}>
      {/* Scene Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <MapPin size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Scene Management</h3>
          <p className="text-blue-200 text-sm">Current adventure scene</p>
        </div>
      </div>

      {/* Current Scene */}
      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-purple-400" />
          <span className="text-white font-medium">Current Scene</span>
        </div>
        
        {userRole === 'seer' ? (
          <textarea
            value={currentScene}
            onChange={(e) => setCurrentScene(e.target.value)}
            onBlur={(e) => updateScene(e.target.value)}
            className="w-full bg-transparent text-blue-200 resize-none border-none outline-none text-sm leading-relaxed"
            rows={3}
            placeholder="Describe the current scene..."
          />
        ) : (
          <p className="text-blue-200 text-sm leading-relaxed italic">
            {currentScene}
          </p>
        )}
      </div>

      {/* NPCs */}
      <div className="bg-black/20 rounded-lg border border-white/10">
        <button
          onClick={() => setShowNPCs(!showNPCs)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-green-400" />
            <span className="text-white font-medium">NPCs in Scene</span>
            <span className="text-green-400 text-sm">({activeNPCs.length})</span>
          </div>
          {showNPCs ? <ChevronUp size={16} className="text-blue-400" /> : <ChevronDown size={16} className="text-blue-400" />}
        </button>
        
        {showNPCs && (
          <div className="p-4 pt-0 space-y-2">
            {activeNPCs.map((npc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    npc.status === 'friendly' ? 'bg-green-400' :
                    npc.status === 'suspicious' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <div className="text-white font-medium text-sm">{npc.name}</div>
                    <div className="text-blue-300 text-xs">{npc.role}</div>
                  </div>
                </div>
                {userRole === 'seer' && (
                  <button
                    onClick={() => onSceneAction?.('speak_as_npc', { npc: npc.name })}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <MessageSquare size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scene Notes */}
      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} className="text-blue-400" />
          <span className="text-white font-medium">Scene Notes</span>
          <span className="text-blue-400 text-sm">({sceneNotes.length})</span>
        </div>

        {/* Add Note (Seer Only) */}
        {userRole === 'seer' && (
          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
                placeholder="Add a scene note..."
                className="flex-1 px-3 py-2 bg-black/20 text-white rounded border border-white/20 focus:border-blue-400 focus:outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addNote('note')}
                disabled={!newNote.trim()}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
              >
                Note
              </button>
              <button
                onClick={() => addNote('important')}
                disabled={!newNote.trim()}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
              >
                Important
              </button>
              <button
                onClick={() => addNote('action')}
                disabled={!newNote.trim()}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white rounded text-xs transition-colors"
              >
                Action
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sceneNotes.map((note) => {
            const NoteIcon = getNoteIcon(note.type)
            return (
              <div key={note.id} className={`p-3 rounded border ${getNoteColor(note.type)}`}>
                <div className="flex items-start gap-2">
                  <NoteIcon size={14} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white text-sm">{note.text}</p>
                    <p className="text-xs text-white/60 mt-1">
                      {note.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions (Seer Only) */}
      {userRole === 'seer' && (
        <div className="bg-black/20 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-white font-medium">Quick Actions</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSceneAction?.('initiative_check')}
              className="flex items-center justify-center gap-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
            >
              <Sword size={14} />
              Combat!
            </button>
            <button
              onClick={() => onSceneAction?.('perception_check')}
              className="flex items-center justify-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
            >
              <Eye size={14} />
              Perception
            </button>
            <button
              onClick={() => onSceneAction?.('group_save')}
              className="flex items-center justify-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
            >
              <Shield size={14} />
              Group Save
            </button>
            <button
              onClick={() => onSceneAction?.('skill_challenge')}
              className="flex items-center justify-center gap-2 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm transition-colors"
            >
              <Target size={14} />
              Challenge
            </button>
          </div>
        </div>
      )}

      {/* Session Timer */}
      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-400" />
            <span className="text-white font-medium">Session Time</span>
          </div>
          <div className="text-blue-200 font-mono text-sm">
            {/* This would be calculated from session start time */}
            1h 23m
          </div>
        </div>
      </div>
    </div>
  )
}