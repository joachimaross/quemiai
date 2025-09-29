import React from 'react';
export default function AuthPage() {
  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold neon-gradient animate-neon-flicker">Sign In / Sign Up</h1>
      <p className="mt-2 text-lg text-secondary">Access your account securely.</p>
      {/* Auth UI components will go here */}
    </main>
  );
}
