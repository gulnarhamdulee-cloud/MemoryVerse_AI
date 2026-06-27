import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Command,
  Settings,
  LayoutDashboard,
  Brain,
  MessageSquare,
  Moon,
  Sun,
  Database,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Semantic query lookup
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.post(`${API_URL}/api/search/semantic`, { query });
        setResults(res.data);
      } catch (err) {
        console.error('Semantic search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const executeAction = (action) => {
    onClose();
    action();
  };

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Navigate to Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { label: 'View Memories Graph', icon: Brain, action: () => navigate('/relationships') },
    { label: 'Open Chat Assistant', icon: MessageSquare, action: () => navigate('/chat') },
    { label: 'Toggle Color Theme', icon: theme === 'dark' ? Sun : Moon, action: toggleTheme },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/55 backdrop-blur-xs">
        {/* Backdrop closer click zone */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-10"
        >
          {/* Search Header Bar */}
          <div className="relative flex items-center border-b border-border px-4 py-3.5 bg-secondary/30">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search memories semantically or run command..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-foreground placeholder-muted-foreground outline-none text-sm"
            />
            <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-card text-[9px] font-mono text-muted-foreground shadow-xs">
              ESC
            </kbd>
          </div>

          {/* Results Area */}
          <div className="max-h-[350px] overflow-y-auto p-2 space-y-4">
            {isSearching ? (
              <div className="px-3 py-4 text-xs text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                Querying second brain...
              </div>
            ) : query.trim() ? (
              // Search matches list
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Semantic Matches
                </div>
                {results.length > 0 ? (
                  results.map((res) => (
                    <button
                      key={res.document_id}
                      onClick={() => executeAction(() => navigate(`/memories/${res.document_id}`))}
                      className="w-full text-left p-3 rounded-lg hover:bg-secondary/40 border border-transparent hover:border-border transition-all flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-semibold text-foreground truncate">{res.metadata?.title || res.metadata?.filename}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{res.chunk_text}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/10 uppercase tracking-wider shrink-0 self-center">
                        {Math.round(res.score * 100)}% Match
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-xs text-muted-foreground italic text-center">
                    No matching concepts found.
                  </div>
                )}
              </div>
            ) : (
              // Default view: Quick actions list
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Quick Commands
                  </div>
                  {quickActions.map((act, idx) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => executeAction(act.action)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-secondary/40 border border-transparent hover:border-border transition-all flex items-center gap-3 text-xs font-semibold text-foreground/80 hover:text-foreground"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {act.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer controls bar */}
          <div className="px-4 py-2 border-t border-border bg-secondary/15 flex justify-between items-center text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <Command className="w-3 h-3" />
              MemoryVerse AI Palette
            </span>
            <span>Use ↑↓ to navigate, Enter to select</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
