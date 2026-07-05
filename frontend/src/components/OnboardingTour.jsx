import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Brain, UploadCloud, Network, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    title: "Welcome to MemoryVerse AI",
    description: "Your second brain is active. We automatically extract and connect your certifications, project reports, resumes, and internship letter files.",
    icon: Brain,
    color: "text-violet-500 bg-violet-500/10",
    actionText: "Let's Explore",
    targetPath: "/dashboard",
    targetId: "tour-sidebar-dashboard"
  },
  {
    title: "Instant Demo Ingestion",
    description: "Don't want to browse folders? Go to 'Upload Files' and click 'Import Demo Dataset' to populate sample documents instantly.",
    icon: UploadCloud,
    color: "text-sky-500 bg-sky-500/10",
    actionText: "Go to Ingestion",
    targetPath: "/upload",
    targetId: "tour-sidebar-upload"
  },
  {
    title: "Connected Relationships",
    description: "The AI parses names, locations, and skills. Check the 'Relationships' graph to see document layers mapped visually.",
    icon: Network,
    color: "text-emerald-500 bg-emerald-500/10",
    actionText: "View Node Mapping",
    targetPath: "/relationships",
    targetId: "tour-sidebar-relationships"
  },
  {
    title: "Ask Your Second Brain",
    description: "Query your digital history in the 'Chat Assistant'. Responses are formatted in Markdown, complete with matching sources and similarity percentages.",
    icon: MessageSquare,
    color: "text-amber-500 bg-amber-500/10",
    actionText: "Open Chat Assistant",
    targetPath: "/chat",
    targetId: "tour-sidebar-chat"
  }
];

export default function OnboardingTour() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState(null);
  const popoverRef = useRef(null);

  // Initialize and check completion
  useEffect(() => {
    const isCompleted = localStorage.getItem('mv_onboarding_completed');
    if (!isCompleted) {
      setIsOpen(true);
    }
  }, []);

  // Monitor DOM coordinates of the highlighted element
  useEffect(() => {
    if (!isOpen) return;

    const updateCoords = () => {
      const step = STEPS[currentStep];
      if (!step || !step.targetId) {
        setCoords(null);
        return;
      }
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        // Only target if element is visible on screen (i.e. not hidden on mobile)
        if (rect.width > 0 && rect.height > 0) {
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom,
          });
          return;
        }
      }
      setCoords(null);
    };

    updateCoords();

    // Poll to react quickly to transitions, loads, or router navigation delays
    const interval = setInterval(updateCoords, 100);

    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [currentStep, isOpen]);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < STEPS.length) {
      setCurrentStep(nextStep);
      navigate(STEPS[nextStep].targetPath);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('mv_onboarding_completed', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  // Determine popover position: next to element if coordinates exist, otherwise center screen
  let popoverStyle = {};
  let showArrow = false;

  if (coords && window.innerWidth >= 768) {
    showArrow = true;
    // Align to the right of the highlighted sidebar element
    popoverStyle = {
      position: 'fixed',
      left: `${coords.right + 20}px`,
      top: `${coords.top + coords.height / 2}px`,
      transform: 'translateY(-50%)',
      zIndex: 110,
    };
  } else {
    // Default fallback to center of screen (e.g. mobile or element not loaded yet)
    popoverStyle = {
      position: 'fixed',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 110,
    };
  }

  return (
    <AnimatePresence>
      {/* Darkened backdrop overlay */}
      <div className="fixed inset-0 z-[90] pointer-events-none" />

      {/* Spotlight box element */}
      {coords && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed z-[100] rounded-lg pointer-events-none ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]"
          style={{
            top: coords.top - 4,
            left: coords.left - 4,
            width: coords.width + 8,
            height: coords.height + 8,
          }}
        />
      )}

      {/* Simple fallback dark backdrop when no coords (i.e. loading or mobile center modal) */}
      {!coords && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100]" onClick={handleSkip} />
      )}

      {/* Popover Card */}
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        style={popoverStyle}
        className="w-full max-w-sm bg-card border border-border shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
      >
        {/* Pointer Arrow */}
        {showArrow && (
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 bg-card border-l border-b border-border" />
        )}

        {/* Header Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-violet-500 to-emerald-500" />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 md:p-6 space-y-5 relative">
          {/* Step count / Title */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>

          {/* Icon & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${step.color}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {step.description}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex gap-1.5">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-semibold rounded-lg shadow-sm shadow-primary/10 hover:shadow-md transition-all"
            >
              {step.actionText}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
