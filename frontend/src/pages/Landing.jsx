import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Brain, FileText, Link2, Calendar, Sparkles, ArrowRight,
  Sun, Moon, Search, MessageSquare, Shield, Network,
  Zap, Database, Eye, ChevronRight
} from 'lucide-react';

// ── Neural background — adapts to theme ──────────────────────────────────────
function NeuralBackground({ isDark }) {
  const nodes = [
    { x:8,y:12},{x:22,y:5},{x:38,y:18},{x:55,y:8},{x:70,y:22},{x:85,y:10},
    {x:92,y:35},{x:78,y:48},{x:62,y:38},{x:45,y:32},{x:28,y:42},{x:12,y:55},
    {x:5,y:72},{x:18,y:85},{x:35,y:78},{x:52,y:88},{x:68,y:75},{x:82,y:82},
    {x:95,y:65},{x:88,y:52},{x:48,y:55},{x:30,y:62},{x:65,y:58},{x:15,y:35},
  ];
  const connections = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],
    [12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,7],[8,20],[20,21],
    [21,10],[20,22],[22,16],[9,20],[3,9],[4,8],[5,19],[0,11],[2,9],[6,18],[14,20],
  ];

  const lineColor   = isDark ? 'rgba(99,102,241,0.12)'  : 'rgba(99,102,241,0.08)';
  const pulseColor  = isDark ? 'rgba(99,102,241,0.45)'  : 'rgba(99,102,241,0.35)';
  const nodeColor   = isDark ? 'rgba(139,92,246,0.45)'  : 'rgba(139,92,246,0.30)';
  const orb1        = isDark ? 'rgba(99,102,241,0.18)'  : 'rgba(99,102,241,0.08)';
  const orb2        = isDark ? 'rgba(139,92,246,0.14)'  : 'rgba(139,92,246,0.07)';
  const orb3        = isDark ? 'rgba(16,185,129,0.10)'  : 'rgba(16,185,129,0.06)';
  const orb4        = isDark ? 'rgba(59,130,246,0.10)'  : 'rgba(59,130,246,0.06)';
  const grid        = isDark ? 'rgba(99,102,241,1)'     : 'rgba(99,102,241,0.4)';
  const gridOpacity = isDark ? '0.03' : '0.04';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true" style={{ willChange: 'transform' }}>
      {/* Gradient orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full" style={{ background:`radial-gradient(circle,${orb1} 0%,transparent 70%)`,willChange:'transform' }} />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full" style={{ background:`radial-gradient(circle,${orb2} 0%,transparent 70%)`,willChange:'transform' }} />
      <div className="absolute bottom-[-5%] left-[20%] w-[500px] h-[500px] rounded-full" style={{ background:`radial-gradient(circle,${orb3} 0%,transparent 70%)`,willChange:'transform' }} />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full" style={{ background:`radial-gradient(circle,${orb4} 0%,transparent 70%)`,willChange:'transform' }} />

      {/* SVG neural network */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" viewBox="0 0 100 100" style={{ willChange: 'transform' }}>
        <defs>
          <radialGradient id="nodeGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.9)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.4)" />
          </radialGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="0.3" result="cb" />
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {connections.map(([a,b],i)=>(
          <line key={i} x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`} x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`} stroke={lineColor} strokeWidth="0.15"/>
        ))}
        {[[0,20],[3,8],[15,20],[10,22]].map(([a,b],i)=>(
          <line key={`p${i}`} x1={`${nodes[a].x}%`} y1={`${nodes[a].y}%`} x2={`${nodes[b].x}%`} y2={`${nodes[b].y}%`}
            stroke={pulseColor} strokeWidth="0.2" strokeDasharray="1 3"
            style={{ animation:`dashMove ${4+i}s linear infinite`, animationDelay:`${i*0.8}s` }}/>
        ))}
        {nodes.map((n,i)=>(
          <circle key={i} cx={`${n.x}%`} cy={`${n.y}%`}
            r={i%5===0?'0.55':'0.3'}
            fill={i%5===0?'url(#nodeGrad2)':nodeColor}
            filter={i%5===0?'url(#glow2)':undefined}
            style={i%7===0?{animation:`nodePulse ${3+(i%3)}s ease-in-out infinite`,animationDelay:`${(i*0.4)%3}s`}:undefined}/>
        ))}
      </svg>

      {/* Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage:`linear-gradient(${grid} 1px,transparent 1px),linear-gradient(90deg,${grid} 1px,transparent 1px)`,
        backgroundSize:'60px 60px', opacity: gridOpacity
      }}/>
    </div>
  );
}

// ── 3D Hero Card ──────────────────────────────────────────────────────────────
function HeroCard({ isDark }) {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(useTransform(tiltY,[-0.5,0.5],[8,-8]),{damping:30,stiffness:200});
  const rotateY = useSpring(useTransform(tiltX,[-0.5,0.5],[-8,8]),{damping:30,stiffness:200});

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    tiltX.set((e.clientX-rect.left)/rect.width-0.5);
    tiltY.set((e.clientY-rect.top)/rect.height-0.5);
  };

  const chips = [
    {icon:FileText,  color:'#f43f5e', label:'Internship_Letter.pdf',  pos:'top-[8%] left-[6%]',   delay:0,   dur:7 },
    {icon:Brain,     color:'#10b981', label:'Machine Learning',        pos:'top-[15%] right-[6%]', delay:0.5, dur:9 },
    {icon:Calendar,  color:'#38bdf8', label:'Weekly Sync Notes',       pos:'bottom-[20%] left-[8%]',delay:1,  dur:8 },
    {icon:Sparkles,  color:'#f59e0b', label:'React Expert',            pos:'bottom-[25%] right-[5%]',delay:1.5,dur:6},
    {icon:Search,    color:'#a78bfa', label:'Semantic Search',         pos:'top-[50%] left-[2%]',  delay:0.8, dur:10},
    {icon:Network,   color:'#6366f1', label:'Graph Connected',         pos:'top-[45%] right-[2%]', delay:0.3, dur:11},
  ];

  const cardBg    = isDark
    ? 'linear-gradient(135deg,rgba(99,102,241,0.08) 0%,rgba(139,92,246,0.05) 50%,rgba(16,185,129,0.05) 100%)'
    : 'linear-gradient(135deg,rgba(99,102,241,0.05) 0%,rgba(139,92,246,0.03) 50%,rgba(16,185,129,0.03) 100%)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.15)';
  const cardShadow = isDark
    ? '0 0 0 1px rgba(99,102,241,0.15),0 24px 80px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 0 0 1px rgba(99,102,241,0.12),0 24px 80px rgba(99,102,241,0.08),inset 0 1px 0 rgba(255,255,255,0.8)';
  const chipBg    = isDark ? 'rgba(15,15,25,0.85)' : 'rgba(255,255,255,0.92)';
  const chipText  = isDark ? '#e2e8f0' : '#1e293b';
  const statsBg   = isDark ? 'rgba(10,10,20,0.8)' : 'rgba(248,250,255,0.9)';
  const statsBorder = isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.2)';
  const statsText = isDark ? '#94a3b8' : '#64748b';

  return (
    <motion.div
      initial={{opacity:0,scale:0.9,y:20}} animate={{opacity:1,scale:1,y:0}}
      transition={{duration:1.0,ease:[0.16,1,0.3,1],delay:0.2}}
      style={{rotateX,rotateY,transformStyle:'preserve-3d',perspective:1000}}
      onMouseMove={handleMouseMove}
      onMouseLeave={()=>{tiltX.set(0);tiltY.set(0);}}
      className="relative h-[500px] rounded-3xl cursor-pointer select-none"
    >
      <div className="absolute inset-0 rounded-3xl border overflow-hidden"
        style={{background:cardBg,backdropFilter:'blur(20px)',borderColor:cardBorder,boxShadow:cardShadow}}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px]"
          style={{background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)'}}/>
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 500">
          {[[50,100,200,250],[200,250,350,150],[350,150,250,380],[250,380,100,320],[100,320,50,100]].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(99,102,241,0.6)" strokeWidth="0.8"/>
          ))}
        </svg>
      </div>

      {chips.map((fc,i)=>{
        const Icon=fc.icon;
        return (
          <motion.div key={i}
            animate={{y:[0,fc.delay%2===0?-10:8,0]}}
            transition={{repeat:Infinity,duration:fc.dur,ease:'easeInOut',delay:fc.delay}}
            className={`absolute ${fc.pos} flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-semibold shadow-lg`}
            style={{background:chipBg,backdropFilter:'blur(12px)',border:`1px solid ${fc.color}30`,color:chipText,boxShadow:`0 4px 20px rgba(0,0,0,0.12),0 0 0 1px ${fc.color}15`}}
          >
            <Icon style={{width:12,height:12,color:fc.color,flexShrink:0}}/>
            {fc.label}
          </motion.div>
        );
      })}

      <motion.div animate={{scale:[1,1.06,1]}} transition={{repeat:Infinity,duration:4,ease:'easeInOut'}}
        className="absolute inset-0 flex items-center justify-center" style={{transform:'translateZ(20px)'}}>
        <div className="relative w-28 h-28 rounded-full flex items-center justify-center"
          style={{background:'radial-gradient(circle,rgba(99,102,241,0.25) 0%,rgba(99,102,241,0.04) 70%)',boxShadow:'0 0 60px rgba(99,102,241,0.35),0 0 120px rgba(99,102,241,0.08)'}}>
          <Brain className="w-12 h-12" style={{color:'#818cf8'}}/>
          <div className="absolute inset-0 rounded-full" style={{border:'1px solid rgba(99,102,241,0.3)',animation:'ringPulse 3s ease-out infinite'}}/>
          <div className="absolute inset-[-16px] rounded-full" style={{border:'1px solid rgba(99,102,241,0.15)',animation:'ringPulse 3s ease-out infinite',animationDelay:'0.5s'}}/>
        </div>
      </motion.div>

      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between px-4 py-2.5 rounded-2xl"
        style={{background:statsBg,backdropFilter:'blur(10px)',border:`1px solid ${statsBorder}`}}>
        {[{label:'Documents',val:'47',color:'#818cf8'},{label:'Connections',val:'312',color:'#10b981'},{label:'Queries',val:'1.2k',color:'#f59e0b'}].map(s=>(
          <div key={s.label} className="text-center">
            <p className="text-sm font-bold" style={{color:s.color}}>{s.val}</p>
            <p className="text-[9px] font-semibold" style={{color:statsText}}>{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress,[0,0.18],[1,0]);

  useEffect(()=>{
    const fn=()=>setIsScrolled(window.scrollY>20);
    window.addEventListener('scroll',fn,{passive:true});
    return()=>window.removeEventListener('scroll',fn);
  },[]);

  // Theme-sensitive tokens
  const bg        = isDark ? '#080811'         : '#f8f9ff';
  const textPrimary  = isDark ? '#ffffff'       : '#0f172a';
  const textMuted    = isDark ? '#94a3b8'       : '#64748b';
  const navBg     = isDark ? 'rgba(8,8,17,0.88)' : 'rgba(248,249,255,0.92)';
  const navBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.12)';
  const glassBg   = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.72)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(99,102,241,0.12)';
  const glassShadow = isDark
    ? '0 0 0 1px rgba(99,102,241,0.05),0 20px 60px rgba(0,0,0,0.4)'
    : '0 0 0 1px rgba(99,102,241,0.06),0 20px 60px rgba(99,102,241,0.06),0 2px 8px rgba(0,0,0,0.04)';
  const footerBg  = isDark ? 'rgba(5,5,15,0.95)'  : 'rgba(248,249,255,0.98)';
  const footerBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.10)';
  const scrollLineBg = isDark ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.4)';
  const pillBg    = isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)';
  const pillBorder = isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.20)';
  const trustBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.06)';
  const trustBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.12)';
  const ctaBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.18)';
  const quoteNumColor = isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.20)';
  const stepHoverBar  = 'linear-gradient(to right,{color},transparent)';
  const timelineLineBg = isDark
    ? 'linear-gradient(to bottom,transparent,rgba(99,102,241,0.5),rgba(99,102,241,0.2),transparent)'
    : 'linear-gradient(to bottom,transparent,rgba(99,102,241,0.35),rgba(99,102,241,0.15),transparent)';

  const features = [
    {title:'AI Organization',   desc:'Auto-extracts entities, emotions, topics, and titles from every document.',       icon:Brain,        color:'#6366f1'},
    {title:'Semantic Search',   desc:'Find memories by meaning — not just keywords. Context-aware vector retrieval.',   icon:Search,       color:'#10b981'},
    {title:'Memory Timeline',   desc:'Chrono-map your life — group memories by Date, Month, Year, or People.',         icon:Calendar,     color:'#38bdf8'},
    {title:'Relationship Graph',desc:'Builds an interactive multi-level knowledge graph linking docs, people & places.',icon:Network,      color:'#a78bfa'},
    {title:'Chat Assistant',    desc:'Ask questions naturally. Streaming answers with document citations.',             icon:MessageSquare,color:'#f59e0b'},
    {title:'Local & Private',   desc:'Everything stored in your local SQLite + ChromaDB. Zero cloud uploads.',         icon:Shield,       color:'#f43f5e'},
  ];

  const steps = [
    {n:'01',title:'Upload Memories',    desc:'Drop any PDF, DOCX, TXT. MemoryVerse reads, chunks, and indexes it instantly.',color:'#6366f1'},
    {n:'02',title:'AI Understands It',  desc:'Groq extracts people, places, emotions, topics, and generates a smart summary.',color:'#10b981'},
    {n:'03',title:'Connections Emerge', desc:'A living relationship graph links every entity across all your documents.',      color:'#f59e0b'},
    {n:'04',title:'Ask Anything',       desc:'Chat with your second brain. Get answers backed by real citations.',            color:'#a78bfa'},
  ];

  return (
    <div className="relative min-h-screen font-sans overflow-x-hidden transition-colors duration-300"
      style={{background:bg, color:textPrimary}}>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes dashMove  { to { stroke-dashoffset:-20; } }
        @keyframes nodePulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes ringPulse { 0%{opacity:0.8;transform:scale(1)} 100%{opacity:0;transform:scale(1.6)} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .mv-gradient-text {
          background: linear-gradient(135deg,#818cf8,#a78bfa,#10b981,#38bdf8,#818cf8);
          background-size: 300% 300%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: gradShift 6s ease infinite;
        }
        .mv-glow-btn { box-shadow: 0 0 24px rgba(99,102,241,0.45),0 0 60px rgba(99,102,241,0.12); transition: box-shadow 0.2s; }
        .mv-glow-btn:hover { box-shadow: 0 0 32px rgba(99,102,241,0.65),0 0 80px rgba(99,102,241,0.22); }
      `}</style>

      {/* ── Background ── */}
      <NeuralBackground isDark={isDark} />

      {/* ── Navbar ── */}
      <motion.nav initial={{y:-80,opacity:0}} animate={{y:0,opacity:1}}
        transition={{type:'spring',damping:22,stiffness:120}}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={isScrolled?{padding:'12px 0',background:navBg,backdropFilter:'blur(20px)',borderBottom:`1px solid ${navBorder}`}:{padding:'20px 0'}}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
              style={{background:'linear-gradient(135deg,#6366f1,#a78bfa)',boxShadow:'0 0 16px rgba(99,102,241,0.4)'}}>M</div>
            <span className="font-bold text-base tracking-tight" style={{color:textPrimary}}>
              MemoryVerse <span style={{color:'#818cf8'}}>AI</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold" style={{color:textMuted}}>
            {['Features','How It Works','Experience','About'].map(item=>(
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g,'-')}`}
                className="transition-colors duration-200 hover:text-indigo-500">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-indigo-500/10"
              style={{color:textMuted}}>
              {isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>
            <Link to="/login" className="hidden sm:inline-block text-xs font-semibold px-4 py-2 transition-colors hover:text-indigo-500"
              style={{color:textMuted}}>Sign In</Link>
            <Link to="/register"
              className="text-xs font-bold text-white px-4 py-2 rounded-xl transition-all mv-glow-btn"
              style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>Get Started</Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <motion.section style={{opacity:heroOpacity}}
        className="relative min-h-screen flex items-center px-6 md:px-12 max-w-7xl mx-auto pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center w-full">

          {/* Left */}
          <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}}
            transition={{duration:0.9,ease:[0.16,1,0.3,1]}} className="space-y-7 max-w-xl">

            <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
              style={{background:pillBg,border:`1px solid ${pillBorder}`,color:'#818cf8'}}>
              <Sparkles className="w-3 h-3"/>Your Personal Second Brain
            </motion.div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.05]">
              <span style={{color:textPrimary}}>Your Digital</span><br/>
              <span style={{color:textPrimary}}>Journey.</span><br/>
              <span className="mv-gradient-text">Remembered.</span>
            </h1>

            <p className="text-base leading-relaxed font-medium" style={{color:textMuted}}>
              Upload your PDFs, notes, and documents. MemoryVerse AI extracts connections, builds a living knowledge graph, and lets you{' '}
              <span style={{color:'#818cf8'}} className="font-semibold">ask anything</span> about your entire digital life.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2">
              {[{icon:Zap,label:'Instant Indexing',color:'#f59e0b'},{icon:Shield,label:'100% Local',color:'#10b981'},{icon:Database,label:'Vector Search',color:'#6366f1'}].map(p=>{
                const Icon=p.icon;
                return(
                  <div key={p.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                    style={{background:trustBg,border:`1px solid ${trustBorder}`,color:p.color}}>
                    <Icon className="w-3 h-3"/>{p.label}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all mv-glow-btn"
                style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>
                Start for Free<ArrowRight className="w-4 h-4"/>
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:border-indigo-500/40"
                style={{border:`1px solid ${ctaBorder}`,color:textMuted}}>
                <Eye className="w-4 h-4"/>See How It Works
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {['#6366f1','#10b981','#f59e0b','#f43f5e'].map((c,i)=>(
                  <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[8px] font-bold text-white"
                    style={{background:c,borderColor:bg}}>{['ZH','AI','ML','DL'][i]}</div>
                ))}
              </div>
              <p className="text-xs" style={{color:textMuted}}>
                <span className="font-semibold" style={{color:textPrimary}}>Powered by Groq + ChromaDB</span> · Built for hackathons
              </p>
            </div>
          </motion.div>

          {/* Right — 3D Card */}
          <HeroCard isDark={isDark}/>
        </div>

        {/* Scroll hint */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.5}}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{color:isDark?'#475569':'#94a3b8'}}>Scroll to explore</p>
          <div className="w-[1px] h-8" style={{background:`linear-gradient(to bottom,${scrollLineBg},transparent)`}}/>
        </motion.div>
      </motion.section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="text-center space-y-3 mb-20">
            <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#818cf8'}}>The Experience</span>
            <h2 className="text-4xl font-black tracking-tight" style={{color:textPrimary}}>How MemoryVerse Works</h2>
            <p className="text-sm max-w-lg mx-auto" style={{color:textMuted}}>Four steps from raw file to intelligent insight.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s,i)=>(
              <motion.div key={i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}}
                viewport={{once:true}} transition={{delay:i*0.1}}
                className="rounded-2xl p-6 space-y-4 group transition-all duration-300"
                style={{background:glassBg,border:`1px solid ${glassBorder}`,boxShadow:glassShadow,backdropFilter:'blur(16px)'}}>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black" style={{color:s.color,opacity:0.15}}>{s.n}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{background:`${s.color}20`,border:`1px solid ${s.color}40`,color:s.color}}>{s.n}</div>
                </div>
                <h3 className="font-bold text-base" style={{color:textPrimary}}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{color:textMuted}}>{s.desc}</p>
                <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                  style={{background:`linear-gradient(to right,${s.color},transparent)`}}/>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{background:`radial-gradient(ellipse 80% 50% at 50% 50%,${isDark?'rgba(99,102,241,0.04)':'rgba(99,102,241,0.03)'} 0%,transparent 70%)`}}/>
        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="text-center space-y-3 mb-20">
            <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#818cf8'}}>Features</span>
            <h2 className="text-4xl font-black tracking-tight" style={{color:textPrimary}}>Structured Cognitive Capabilities</h2>
            <p className="text-sm max-w-lg mx-auto" style={{color:textMuted}}>Built on vector databases, RAG pipelines, and graph schemas — premium memory retrieval for real humans.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f,i)=>{
              const Icon=f.icon;
              return(
                <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}}
                  viewport={{once:true}} transition={{delay:i*0.07}} whileHover={{y:-4,scale:1.01}}
                  className="rounded-2xl p-6 space-y-4 group cursor-default transition-all duration-300"
                  style={{background:glassBg,border:`1px solid ${glassBorder}`,boxShadow:glassShadow,backdropFilter:'blur(16px)'}}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{background:`${f.color}15`,border:`1px solid ${f.color}30`}}>
                    <Icon className="w-5 h-5" style={{color:f.color}}/>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1.5" style={{color:textPrimary}}>{f.title}</h3>
                    <p className="text-xs leading-relaxed" style={{color:textMuted}}>{f.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{color:f.color}}>
                    <span>Explore</span><ChevronRight className="w-3 h-3"/>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section id="experience" className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="text-center space-y-3 mb-20">
            <span className="text-xs font-bold uppercase tracking-widest" style={{color:'#818cf8'}}>Chronology</span>
            <h2 className="text-4xl font-black tracking-tight" style={{color:textPrimary}}>Your Life, Mapped in Time</h2>
            <p className="text-sm max-w-md mx-auto" style={{color:textMuted}}>Every memory organized chronologically — the full picture of your journey.</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-[1px]" style={{background:timelineLineBg}}/>
            <div className="space-y-8 pl-16">
              {[
                {year:'2022',title:'College Thesis Drafts',   desc:'Academic reports, literature summaries, and slides.',tag:'Academic', color:'#6366f1'},
                {year:'2023',title:'Internship Work Logs',    desc:'Standup records, project plans, and API blueprints.',tag:'Work',     color:'#10b981'},
                {year:'2024',title:'Hackathon Repositories',  desc:'Pitch decks, mockup designs, and config layouts.',  tag:'Projects', color:'#f59e0b'},
                {year:'2025',title:'Neural Nets Research',    desc:'Ongoing ML research documentation and experiments.',tag:'Research', color:'#a78bfa'},
              ].map((item,i)=>(
                <motion.div key={i} initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}}
                  viewport={{once:true}} transition={{delay:i*0.1}} className="relative group">
                  <div className="absolute -left-[46px] top-3 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{background:item.color,boxShadow:`0 0 12px ${item.color}55`}}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white"/>
                  </div>
                  <div className="rounded-2xl p-5 transition-all duration-300"
                    style={{background:glassBg,border:`1px solid ${glassBorder}`,boxShadow:glassShadow,backdropFilter:'blur(16px)'}}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold" style={{color:item.color}}>{item.year}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{background:`${item.color}15`,color:item.color,border:`1px solid ${item.color}30`}}>{item.tag}</span>
                    </div>
                    <h3 className="font-bold text-sm" style={{color:textPrimary}}>{item.title}</h3>
                    <p className="text-xs mt-1 leading-relaxed" style={{color:textMuted}}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{background:`radial-gradient(ellipse 60% 80% at 50% 50%,${isDark?'rgba(99,102,241,0.06)':'rgba(99,102,241,0.04)'} 0%,transparent 70%)`}}/>
        <motion.div initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} viewport={{once:true}}
          className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <div className="text-6xl font-serif leading-none" style={{color:quoteNumColor}}>"</div>
          <blockquote className="text-2xl sm:text-3xl font-bold leading-relaxed tracking-tight" style={{color:textPrimary}}>
            Not another AI assistant.<br/><span className="mv-gradient-text">A memory companion.</span>
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{background:'linear-gradient(135deg,#6366f1,#a78bfa)'}}>ZH</div>
            <div className="text-left">
              <p className="text-xs font-bold" style={{color:textPrimary}}>Zahid Hamdule</p>
              <p className="text-[10px]" style={{color:textMuted}}>Creator, MemoryVerse AI</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{background:`radial-gradient(ellipse 80% 60% at 50% 100%,${isDark?'rgba(99,102,241,0.12)':'rgba(99,102,241,0.07)'} 0%,transparent 70%)`}}/>
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{color:textPrimary}}>
            Start building your<br/><span className="mv-gradient-text">second brain</span> today.
          </h2>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{color:textMuted}}>
            Your documents, memories, and knowledge — structured, searchable, and always within reach.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white transition-all mv-glow-btn"
              style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>
              Create Free Account<ArrowRight className="w-4 h-4"/>
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all hover:border-indigo-500/40"
              style={{border:`1px solid ${ctaBorder}`,color:textMuted}}>
              Explore Demo
            </Link>
          </div>
          <p className="text-[10px]" style={{color:isDark?'#334155':'#94a3b8'}}>No credit card. No cloud. 100% local.</p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 text-xs" style={{borderTop:`1px solid ${footerBorder}`,background:footerBg,color:textMuted}}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-white"
              style={{background:'linear-gradient(135deg,#6366f1,#a78bfa)'}}>M</div>
            <span className="font-bold text-sm" style={{color:textPrimary}}>MemoryVerse AI</span>
          </div>
          <div className="flex gap-8">
            {['Features','Documentation','Privacy','Contact'].map(l=>(
              <a key={l} href="#features" className="hover:text-indigo-500 transition-colors">{l}</a>
            ))}
          </div>
          <p>© 2026 MemoryVerse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
