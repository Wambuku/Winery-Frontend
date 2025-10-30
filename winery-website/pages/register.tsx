// Register page

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';
import { RegisterData } from '../types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterData) => {
    try {
      setRegisterError(null);
      await register(data);
      
      // Redirect to dashboard or home page after successful registration
      router.push('/');
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Registration failed');
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
            Create your account
          </p>
        </div>
        
        <RegisterForm 
          onSubmit={handleRegister}
          loading={loading}
          error={registerError || error || undefined}
        />
      </div>
    </div>
  );
}