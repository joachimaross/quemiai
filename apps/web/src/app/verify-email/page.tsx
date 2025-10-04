'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setError('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      // Simulate email verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('success');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Failed to verify email');
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      // Simulate resending verification email
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      alert('Failed to send verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-space px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center">
            {status === 'verifying' && (
              <>
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 font-heading">
                  Verifying Email
                </h1>
                <p className="text-gray-400">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 font-heading">
                  Email Verified!
                </h1>
                <p className="text-gray-400 mb-6">
                  Your email has been successfully verified. Redirecting to your dashboard...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zeeky-blue"></div>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 font-heading">
                  Verification Failed
                </h1>
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
                  {error}
                </div>
                <p className="text-gray-400 mb-6">
                  The verification link may have expired or is invalid.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full px-6 py-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                  <Link
                    href="/login"
                    className="block w-full px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-deep-space">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zeeky-blue"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
