import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  X, User, MapPin, Building2, Hash, Heart, FileText,
  Link2, Sparkles, RefreshCw, ChevronRight, Network,
  FolderOpen, Brain
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TYPE_COLORS = {
  Person:       'text-emerald-400 bg-emerald-400/10 border-emerald-500/30',
  Location:     'text-orange-400  bg-orange-400/10  border-orange-500/30',
  Organization: 'text-violet-400  bg-violet-400/10  border-violet-500/30',
  Tag:          'text-sky-400     bg-sky-400/10     border-sky-500/30',
  Emotion:      'text-rose-400    bg-rose-400/10    border-rose-500/30',
  Document:     'text-slate-300   bg-slate-400/10   border-slate-500/30',
  Category:     'text-indigo-400  bg-indigo-400/10  border-indigo-500/30',
  Root:         'text-indigo-300  bg-indigo-400/10  border-indigo-500/30',
};

const TYPE_ICONS = {
  Person:       User,
  Location:     MapPin,
  Organization: Building2,
  Tag:          Hash,
  Emotion:      Heart,
  Document:     FileText,
  Category:     FolderOpen,
  Root:         Brain,
};

export default function GraphSidePanel({ selectedNode, onClose, onNavigateToNode }) {
  const [detail, setDetail]   = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingDetail, setLoadingDetail]   = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!selectedNode || selectedNode.type === 'Root' || selectedNode.type === 'Category') {
      setDetail(null);
      setSummary(null);
      return;
    }
    fetchDetail(selectedNode.id);
    setSummary(null);
  }, [selectedNode?.id]);

  const fetchDetail = async (nodeId) => {
    setLoadingDetail(true);
    try {
      const res = await axios.get(`${API_URL}/api/graph/detail/${nodeId}`);
      setDetail(res.data);
    } catch (e) {
      console.error('Detail fetch failed', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchSummary = async () => {
    if (!selectedNode) return;
    setLoadingSummary(true);
    try {
      const res = await axios.get(`${API_URL}/api/graph/summary/${selectedNode.id}`);
      setSummary(res.data.summary);
    } catch (e) {
      setSummary('Could not generate summary at this time.');
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!selectedNode) return null;

  const IconComp = TYPE_ICONS[selectedNode.type] || Network;
  const colorCls = TYPE_COLORS[selectedNode.type] || TYPE_COLORS.Document;
  const isLeafNode = selectedNode.type !== 'Root' && selectedNode.type !== 'Category';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 340, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 340, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="absolute right-0 top-0 bottom-0 w-80 z-20 flex flex-col
                   bg-card/95 backdrop-blur-md border-l border-border shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg border ${colorCls} shrink-0`}>
              <IconComp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {selectedNode.type}
              </p>
              <h3 className="text-sm font-bold text-foreground truncate">{selectedNode.label}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Stats row (only for leaf nodes) */}
          {isLeafNode && (
            loadingDetail ? (
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 bg-secondary/40 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : detail ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Connections', value: detail.stats.total_connections },
                  { label: 'Documents',   value: detail.stats.document_count },
                  { label: 'Entities',    value: detail.stats.entity_count },
                ].map(s => (
                  <div key={s.label} className="bg-secondary/30 border border-border rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : null
          )}

          {/* AI Summary Section */}
          {isLeafNode && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    AI Insight
                  </span>
                </div>
                {!summary && !loadingSummary && (
                  <button
                    onClick={fetchSummary}
                    className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md transition-colors"
                  >
                    Generate
                  </button>
                )}
                {loadingSummary && (
                  <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                )}
              </div>
              {summary ? (
                <p className="text-xs text-foreground/80 leading-relaxed italic">"{summary}"</p>
              ) : !loadingSummary ? (
                <p className="text-[10px] text-muted-foreground">
                  Click Generate for an AI-powered insight about this entity.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <div className="h-3 bg-indigo-400/10 rounded animate-pulse" />
                  <div className="h-3 bg-indigo-400/10 rounded animate-pulse w-4/5" />
                </div>
              )}
            </div>
          )}

          {/* Related Documents */}
          {isLeafNode && detail?.documents?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Related Documents ({detail.documents.length})
              </p>
              <div className="space-y-1.5">
                {detail.documents.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => onNavigateToNode && onNavigateToNode(doc.id)}
                    className="w-full text-left p-2.5 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/60 hover:border-primary/30 transition-all group"
                  >
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {doc.title || doc.filename}
                    </p>
                    {doc.summary && (
                      <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">{doc.summary}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Connected Entities */}
          {isLeafNode && detail?.connected_entities?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3 h-3" /> Connected Entities ({detail.connected_entities.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detail.connected_entities.map(ent => {
                  const ec = TYPE_COLORS[ent.type] || TYPE_COLORS.Document;
                  return (
                    <button
                      key={ent.id}
                      onClick={() => onNavigateToNode && onNavigateToNode(ent.id)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-full border ${ec} hover:opacity-80 transition-all`}
                    >
                      {ent.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category info */}
          {selectedNode.type === 'Category' && (
            <div className="py-8 text-center space-y-2">
              <FolderOpen className="w-10 h-10 text-indigo-400/50 mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                {selectedNode.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedNode.count ?? '—'} {selectedNode.count === 1 ? 'entity' : 'entities'}.
                Click the node on the graph to expand and explore.
              </p>
            </div>
          )}

          {/* Root info */}
          {selectedNode.type === 'Root' && (
            <div className="py-8 text-center space-y-2">
              <Brain className="w-10 h-10 text-indigo-400/50 mx-auto" />
              <p className="text-sm font-semibold text-foreground">Your Second Brain</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click any category node to explore its entities. Click an entity to see its connections and get AI insights.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
