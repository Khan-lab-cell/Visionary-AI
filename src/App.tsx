/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-4 text-center">
        <div className="glass-card p-8 max-w-md border-red-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">Configuration Required</h2>
          <p className="text-slate-400 mb-6">
            Supabase environment variables are missing. Please set <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in the Secrets panel.
          </p>
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 transition-all"
          >
            Back to Landing Page
          </a>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={session ? <Navigate to="/dashboard" /> : (
            <div className="min-h-screen bg-[#030014] pt-32 pb-20 px-4">
              <AuthForm mode="login" />
            </div>
          )} 
        />
        <Route 
          path="/signup" 
          element={session ? <Navigate to="/dashboard" /> : (
            <div className="min-h-screen bg-[#030014] pt-32 pb-20 px-4">
              <AuthForm mode="signup" />
            </div>
          )} 
        />
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/login" />} 
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
