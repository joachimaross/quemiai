
"use client";

import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, OAuthProvider } from 'firebase/auth';
import { fetchUserProfile } from '../../src/lib/api';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialize Firebase app (check if already initialized to avoid errors in hot reload)
const app = (() => {
  if (typeof window !== "undefined" && (window as any)._firebaseApp) {
    return (window as any)._firebaseApp;
  }
  const newApp = initializeApp(firebaseConfig);
  if (typeof window !== "undefined") {
    (window as any)._firebaseApp = newApp;
  }
  return newApp;
})();

const auth = getAuth(app);
export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const handleFetchProfile = async () => {
    setError("");
    setProfile(null);
    try {
      const data = await fetchUserProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold neon-gradient animate-neon-flicker">Sign In / Sign Up</h1>
      <p className="mt-2 text-lg text-secondary">Access your account securely.</p>
      <div className="mt-6 flex flex-col gap-4 w-full max-w-xs">
        <button onClick={handleFetchProfile} className="bg-cyan-700 hover:bg-cyan-800 text-white py-2 rounded font-semibold mb-2">
          Fetch My Profile (Protected)
        </button>
        {profile && (
          <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-x-auto max-w-xs">
            {JSON.stringify(profile, null, 2)}
          </pre>
        )}
        <button onClick={handleGoogleSignIn} className="bg-white text-black py-2 rounded shadow hover:bg-gray-200 font-semibold flex items-center justify-center gap-2">
          <span>🔎</span> Sign in with Google
        </button>
        <button onClick={handleAppleSignIn} className="bg-black text-white py-2 rounded shadow hover:bg-gray-800 font-semibold flex items-center justify-center gap-2">
          <span></span> Sign in with Apple
        </button>
        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-2 mt-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none"
            required
          />
          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold" disabled={loading}>
              Sign In
            </button>
            <button type="button" onClick={handleEmailSignUp} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold" disabled={loading}>
              Sign Up
            </button>
          </div>
        </form>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
    </main>
  );
}
