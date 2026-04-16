'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CrmLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated via session cookie
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/crm-check');
        if (res.ok) {
          router.push('/portal/crm');
        }
      } catch (err) {
        // Not authenticated, stay on login page
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/crm-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/portal/crm');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-6">CRM Master Lock</h1>
        <p className="text-zinc-400 text-center mb-6 text-sm">
          Enter the master administrative code to access the Delegate Operations Hub.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter Access Key..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-200 text-black font-semibold rounded p-3 transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Unlock CRM Base'}
          </button>
        </form>
      </div>
    </div>
  );
}
