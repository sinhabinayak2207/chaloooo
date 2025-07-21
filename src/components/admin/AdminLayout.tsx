"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FiHome, FiUsers, FiShoppingBag, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-green-600">OCC Admin</h1>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <FiHome className="mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/products" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <FiShoppingBag className="mr-3" />
            Products
          </Link>
          <Link href="/admin/users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <FiUsers className="mr-3" />
            Users
          </Link>
          
          {/* Chat Management Section */}
          <div className="mt-4 mb-2 px-6">
            <h3 className="text-xs uppercase font-semibold text-gray-500">Chat Management</h3>
          </div>
          <Link href="/admin/chat" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <FiMessageSquare className="mr-3" />
            Chat Sessions
          </Link>
          <Link href="/admin/chat/faq" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 pl-12">
            FAQ Management
          </Link>
          <Link href="/admin/chat/bot-settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 pl-12">
            Bot Settings
          </Link>
          
          <Link href="/admin/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <FiSettings className="mr-3" />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
