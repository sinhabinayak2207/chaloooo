"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getApps, getApp } from 'firebase/app';

interface BotSettings {
  name: string;
  welcomeMessage: string;
  offlineMessage: string;
  emailForwarding: boolean;
  emailAddress: string;
  autoRespondToProductQueries: boolean;
}

const defaultSettings: BotSettings = {
  name: 'OCC Bot',
  welcomeMessage: 'Welcome to OCC World! How can I assist you today?',
  offlineMessage: 'Thank you for your message. Our team is currently offline, but we will respond as soon as possible.',
  emailForwarding: false,
  emailAddress: 'trade@occworld.com',
  autoRespondToProductQueries: true
};

export default function BotSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BotSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const app = getApps().length > 0 ? getApp() : null;
        if (!app) {
          throw new Error('Firebase app not initialized');
        }
        
        const db = getFirestore(app);
        const settingsRef = doc(db, 'botSettings', 'config');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as BotSettings);
        } else {
          // Initialize with default settings if not exists
          await setDoc(settingsRef, defaultSettings);
        }
      } catch (err) {
        console.error('Error fetching bot settings:', err);
        setError('Failed to load bot settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const app = getApps().length > 0 ? getApp() : null;
      if (!app) {
        throw new Error('Firebase app not initialized');
      }
      
      const db = getFirestore(app);
      const settingsRef = doc(db, 'botSettings', 'config');
      
      await setDoc(settingsRef, settings);
      
      setSuccess('Bot settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving bot settings:', err);
      setError('Failed to save bot settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">OCC Bot Settings</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSaveSettings}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Bot Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={settings.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="welcomeMessage">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  name="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="offlineMessage">
                  Offline Message
                </label>
                <textarea
                  id="offlineMessage"
                  name="offlineMessage"
                  value={settings.offlineMessage}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                  required
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    id="emailForwarding"
                    name="emailForwarding"
                    type="checkbox"
                    checked={settings.emailForwarding}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="emailForwarding">
                    Forward offline messages to email
                  </label>
                </div>
              </div>
              
              {settings.emailForwarding && (
                <div className="mb-4 ml-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emailAddress">
                    Email Address
                  </label>
                  <input
                    id="emailAddress"
                    name="emailAddress"
                    type="email"
                    value={settings.emailAddress}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required={settings.emailForwarding}
                  />
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="autoRespondToProductQueries"
                    name="autoRespondToProductQueries"
                    type="checkbox"
                    checked={settings.autoRespondToProductQueries}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="autoRespondToProductQueries">
                    Auto-respond to product queries using database
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  When enabled, the bot will automatically fetch product information from your database to answer customer questions.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
