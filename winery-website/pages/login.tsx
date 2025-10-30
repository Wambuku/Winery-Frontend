// Login page

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import { LoginCredentials } from '../types';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setLoginError(null);
      await login(credentials);
      
      // Redirect to dashboard or home page after successful login
      const redirectTo = (router.query.redirect as string) || '/';
      router.push(redirectTo);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Wine E-commerce Platform
          </h1>
          <p className="text-center text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <LoginForm 
          onSubmit={handleLogin}
          loading={loading}
          error={loginError || error || undefined}
        />
      </div>
    </div>
  );
}