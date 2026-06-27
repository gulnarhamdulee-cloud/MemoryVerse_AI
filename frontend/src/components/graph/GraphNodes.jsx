import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
  FolderOpen, FileText, User, MapPin, Building2,
  Hash, Heart, Brain
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Handle (invisible, just for connections)
// ─────────────────────────────────────────────────────────────────────────────
const Handles = () => (
  <>
    <Handle type="target" position={Position.Top}    style={{ opacity: 0 }} />
    <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    <Handle type="target" position={Position.Left}   style={{ opacity: 0 }} />
    <Handle type="source" position={Position.Right}  style={{ opacity: 0 }} />
  </>
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOT NODE — Central MemoryVerse hub
// ─────────────────────────────────────────────────────────────────────────────
export const RootNode = memo(({ data }) => (
  <div
    onClick={data.onClick}
    className={`
      relative flex flex-col items-center justify-center
      w-24 h-24 rounded-full cursor-pointer select-none
      bg-gradient-to-br from-indigo-600 to-violet-700
      border-4 shadow-xl transition-all duration-300
      ${data.focused ? 'border-white shadow-indigo-500/60 scale-110' : 'border-indigo-400/60 hover:scale-105'}
    `}
  >
    <Handles />
    <Brain className="w-7 h-7 text-white mb-1" />
    <span className="text-white text-[9px] font-bold tracking-wider uppercase text-center leading-tight px-1">
      {data.label}
    </span>
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY NODE — Folder-style rounded rectangle
// ─────────────────────────────────────────────────────────────────────────────
export const CategoryNode = memo(({ data }) => {
  const isExpanded = data.expanded;
  return (
    <div
      onClick={data.onClick}
      className={`
        flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer select-none
        border-2 transition-all duration-300 shadow-md min-w-[130px]
        ${isExpanded
          ? 'bg-indigo-600 border-indigo-400 shadow-indigo-500/40 scale-105'
          : 'bg-indigo-600/20 border-indigo-500/50 hover:bg-indigo-600/35 hover:border-indigo-400 hover:scale-105'
        }
        ${data.faded ? 'opacity-25' : 'opacity-100'}
      `}
    >
      <Handles />
      <FolderOpen className={`w-4 h-4 shrink-0 ${isExpanded ? 'text-white' : 'text-indigo-400'}`} />
      <div className="flex flex-col">
        <span className={`text-xs font-bold ${isExpanded ? 'text-white' : 'text-indigo-300'}`}>
          {data.label}
        </span>
        {data.count !== undefined && (
          <span className={`text-[9px] ${isExpanded ? 'text-indigo-200' : 'text-indigo-400/70'}`}>
            {data.count} {data.count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      <div className={`ml-auto text-[9px] font-bold transition-transform duration-200 ${isExpanded ? 'text-white rotate-180' : 'text-indigo-400'}`}>
        ▾
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT NODE — Slate rectangle with file icon
// ─────────────────────────────────────────────────────────────────────────────
export const DocumentNode = memo(({ data }) => (
  <div
    onClick={data.onClick}
    className={`
      flex items-center gap-2.5 px-3.5 py-2 rounded-lg cursor-pointer select-none
      border transition-all duration-200 shadow-sm max-w-[180px]
      ${data.selected
        ? 'bg-slate-600 border-slate-400 shadow-slate-500/30 scale-105'
        : 'bg-slate-700/60 border-slate-600/60 hover:bg-slate-600/80 hover:border-slate-500 hover:scale-102'
      }
      ${data.faded ? 'opacity-20' : 'opacity-100'}
    `}
  >
    <Handles />
    <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
    <span className="text-[10px] font-semibold text-slate-200 truncate">{data.label}</span>
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// PERSON NODE — Circle with user icon (Emerald)
// ─────────────────────────────────────────────────────────────────────────────
export const PersonNode = memo(({ data }) => (
  <div
    onClick={data.onClick}
    className={`
      flex flex-col items-center justify-center cursor-pointer select-none
      w-16 h-16 rounded-full border-2 transition-all duration-200 shadow-md
      ${data.selected
        ? 'bg-emerald-500 border-emerald-300 shadow-emerald-400/40 scale-110'
        : 'bg-emerald-500/20 border-emerald-500/60 hover:bg-emerald-500/35 hover:scale-105'
      }
      ${data.faded ? 'opacity-20' : 'opacity-100'}
    `}
  >
    <Handles />
    <User className={`w-5 h-5 ${data.selected ? 'text-white' : 'text-emerald-400'}`} />
    <span className={`text-[8px] font-bold mt-0.5 text-center leading-tight px-1 ${data.selected ? 'text-white' : 'text-emerald-300'}`}>
      {data.label.length > 10 ? data.label.slice(0, 9) + '…' : data.label}
    </span>
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION NODE — Circle with MapPin (Orange)
// ─────────────────────────────────────────────────────────────────────────────
export const LocationNode = memo(({ data }) => (
  <div
    onClick={data.onClick}
    className={`
      flex flex-col items-center justify-center cursor-pointer select-none
      w-16 h-16 rounded-full border-2 transition-all duration-200 shadow-md
      ${data.selected
        ? 'bg-orange-500 border-orange-300 shadow-orange-400/40 scale-110'
        : 'bg-orange-500/20 border-orange-500/60 hover:bg-orange-500/35 hover:scale-105'
      }
      ${data.faded ? 'opacity-20' : 'opacity-100'}
    `}
  >
    <Handles />
    <MapPin className={`w-5 h-5 ${data.selected ? 'text-white' : 'text-orange-400'}`} />
    <span className={`text-[8px] font-bold mt-0.5 text-center leading-tight px-1 ${data.selected ? 'text-white' : 'text-orange-300'}`}>
      {data.label.length > 10 ? data.label.slice(0, 9) + '…' : data.label}
    </span>
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZATION NODE — Hexagon (Violet) — rendered as a styled div
// ─────────────────────────────────────────────────────────────────────────────
export const OrganizationNode = memo(({ data }) => (
  <div
    onClick={data.onClick}
    className={`
      flex flex-col items-center justify-center cursor-pointer select-none
      transition-all duration-200
      ${data.faded ? 'opacity-20' : 'opacity-100'}
      ${data.selected ? 'scale-110' : 'hover:scale-105'}
    `}
    style={{ width: 70, height: 70 }}
  >
    <Handles />
    {/* Hexagon via CSS clip-path */}
    <div
      style={{
        clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
        width: 68, height: 68,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: data.selected ? 'rgb(139, 92, 246)' : 'rgba(139,92,246,0.22)',
        border: 'none',
        transition: 'all 0.2s',
      }}
    >
      <Building2 className={`w-5 h-5 ${data.selected ? 'text-white' : 'text-violet-400'}`} />
      <span className={`text-[7px] font-bold mt-0.5 text-center px-1 leading-tight ${data.selected ? 'text-white' : 'text-violet-300'}`}>
        {data.label.length > 9 ? data.label.slice(0, 8) + '…' : data.label}
      </span>
    </div>
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC NODE — Pill shape (Sky Blue)
// ─────────────────────────────────────────────────────────────────────────────
export const TopicNode = memo(({ data }) => (
  <div
    onClick={data.onClick}
    className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer select-none
      border transition-all duration-200 shadow-sm
      ${data.selected
        ? 'bg-sky-500 border-sky-300 shadow-sky-400/30 scale-105'
        : 'bg-sky-500/20 border-sky-500/50 hover:bg-sky-500/35 hover:scale-105'
      }
      ${data.faded ? 'opacity-20' : 'opacity-100'}
    `}
  >
    <Handles />
    <Hash className={`w-3 h-3 shrink-0 ${data.selected ? 'text-white' : 'text-sky-400'}`} />
    <span className={`text-[10px] font-bold ${data.selected ? 'text-white' : 'text-sky-300'}`}>
      {data.label.length > 14 ? data.label.slice(0, 13) + '…' : data.label}
    </span>
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// EMOTION NODE — Circle (Rose)
// ─────────────────────────────────────────────────────────────────────────────
export const EmotionNode = memo(({ data }) => (
  <div
    onClick={data.onClick}
    className={`
      flex flex-col items-center justify-center cursor-pointer select-none
      w-14 h-14 rounded-full border-2 transition-all duration-200 shadow-md
      ${data.selected
        ? 'bg-rose-500 border-rose-300 shadow-rose-400/40 scale-110'
        : 'bg-rose-500/20 border-rose-500/60 hover:bg-rose-500/35 hover:scale-105'
      }
      ${data.faded ? 'opacity-20' : 'opacity-100'}
    `}
  >
    <Handles />
    <Heart className={`w-4 h-4 ${data.selected ? 'text-white' : 'text-rose-400'}`} />
    <span className={`text-[8px] font-bold mt-0.5 text-center leading-tight px-1 ${data.selected ? 'text-white' : 'text-rose-300'}`}>
      {data.label.length > 8 ? data.label.slice(0, 7) + '…' : data.label}
    </span>
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// Node types registry for React Flow
// ─────────────────────────────────────────────────────────────────────────────
export const nodeTypes = {
  root:         RootNode,
  category:     CategoryNode,
  Document:     DocumentNode,
  Person:       PersonNode,
  Location:     LocationNode,
  Organization: OrganizationNode,
  Tag:          TopicNode,
  Emotion:      EmotionNode,
};
