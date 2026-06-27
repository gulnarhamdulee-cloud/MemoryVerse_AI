import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Premium loading overlay state matching Linear/Apple minimal style
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold tracking-wide animate-pulse">
            Syncing second brain...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to Login, saving the source location so we can redirect back if needed
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
