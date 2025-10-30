import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import AdminLayout from '../components/admin/AdminLayout';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-8">
            You don't have permission to access the admin panel.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Wine Store</title>
        <meta name="description" content="Wine Store Admin Management Panel" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminLayout />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // In a real application, you might want to check authentication server-side
  // and redirect unauthorized users before the page loads
  
  return {
    props: {},
  };
};

export default AdminPage;