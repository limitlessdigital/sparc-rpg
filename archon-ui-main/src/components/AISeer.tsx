import { useState } from 'react';
import { api } from '../services/api';

interface Message {
  role: 'user' | 'seer';
  content: string;
  timestamp: Date;
  responseTime?: number;
}

export default function AISeer({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'seer',
      content: "Greetings, adventurer! I am the AI Seer, your Game Master assistant. Ask me about rules, get advice for your quest, or seek guidance on your next move. What wisdom do you seek?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    const startTime = Date.now();
    
    try {
      const request = {
        query: userMessage.content,
        context: {
          session_id: 'demo-session',
          previous_messages: messages.slice(-5) // Last 5 messages for context
        },
        request_type: 'general',
        max_response_time_ms: 3000
      };
      
      const response = await api.getSeerAdvice(request);
      const responseTime = Date.now() - startTime;
      
      const seerMessage: Message = {
        role: 'seer',
        content: response.advice || response.response || "I sense great wisdom is needed, but the mystical energies are unclear. Please try your question again.",
        timestamp: new Date(),
        responseTime
      };
      
      setMessages(prev => [...prev, seerMessage]);
    } catch (error) {
      console.error('Failed to get seer advice:', error);
      const errorMessage: Message = {
        role: 'seer',
        content: "The mystical connection is disrupted. Please ensure the SPARC backend is running and try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">AI Seer 🔮</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-900 rounded-lg">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs opacity-70 mt-1 flex justify-between">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.responseTime && (
                    <span>{message.responseTime}ms</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-purple-600 text-white p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <span className="text-sm">The Seer is consulting the mystical energies...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the Seer for wisdom..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:border-purple-400 focus:outline-none resize-none"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold"
          >
            Ask
          </button>
        </div>
        
        <p className="text-xs text-slate-500 mt-2 text-center">
          Target response time: &lt;3 seconds • Press Enter to send
        </p>
      </div>
    </div>
  );
}