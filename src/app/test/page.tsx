// src/app/test/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('teams').select('count');
        
        if (error) throw error;
        
        setConnectionStatus('success');
      } catch (err: any) {
        setConnectionStatus('error');
        setError(err.message);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/30 rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-light text-slate-100 mb-4">Supabase Connection Test</h1>
        
        {connectionStatus === 'testing' && (
          <div className="text-slate-400">Testing connection...</div>
        )}
        
        {connectionStatus === 'success' && (
          <div className="text-emerald-400 flex items-center gap-2">
            ✅ Successfully connected to Supabase!
          </div>
        )}
        
        {connectionStatus === 'error' && (
          <div>
            <div className="text-rose-400 mb-2">❌ Connection failed</div>
            <div className="text-sm text-slate-500 bg-slate-900/50 p-3 rounded-lg">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}