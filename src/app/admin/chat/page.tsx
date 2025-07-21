"use client";

import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getApps, getApp } from 'firebase/app';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
// Define ChatSession type locally since we removed the tawk integration
interface ChatSession {
  sessionId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  startTime: Date;
  endTime?: Date;
  messages: Array<{
    messageId: string;
    sender: string;
    senderName?: string;
    content: string;
    timestamp: any;
  }>;
  resolved?: boolean;
  agentName?: string;
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        setLoading(true);
        const app = getApps().length > 0 ? getApp() : null;
        if (!app) {
          throw new Error('Firebase app not initialized');
        }
        
        const db = getFirestore(app);
        const chatSessionsRef = collection(db, 'chatSessions');
        const q = query(chatSessionsRef, orderBy('startTime', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);
        
        const sessions: ChatSession[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          sessions.push({
            sessionId: doc.id,
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
            startTime: data.startTime?.toDate() || new Date(),
            endTime: data.endTime?.toDate(),
            messages: data.messages || [],
            resolved: data.resolved || false,
            agentName: data.agentName
          });
        });
        
        setChatSessions(sessions);
      } catch (err) {
        console.error('Error fetching chat sessions:', err);
        setError('Failed to load chat sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChatSessions();
    }
  }, [user]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Chat Sessions</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h2 className="text-lg font-semibold">Recent Chat Sessions ({chatSessions.length})</h2>
                </div>
                <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                  {chatSessions.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">
                      No chat sessions found
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div 
                        key={session.sessionId}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedSession?.sessionId === session.sessionId ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{session.userName || 'Anonymous User'}</p>
                            <p className="text-sm text-gray-500">{session.userEmail || 'No email'}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${session.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {session.resolved ? 'Resolved' : 'Active'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(session.startTime)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.messages.length} messages
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-2/3">
              {selectedSession ? (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">{selectedSession.userName || 'Anonymous User'}</h2>
                      <p className="text-sm text-gray-500">
                        Started: {formatDate(selectedSession.startTime)}
                        {selectedSession.endTime && ` • Ended: ${formatDate(selectedSession.endTime)}`}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${selectedSession.resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {selectedSession.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                  
                  <div className="p-4 max-h-[500px] overflow-y-auto">
                    {selectedSession.messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No messages in this chat session
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedSession.messages.map((message) => (
                          <div 
                            key={message.messageId}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                message.sender === 'user' 
                                  ? 'bg-blue-100 text-blue-900' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div className="text-xs text-gray-500 mb-1">
                                {message.senderName} • {formatDate(message.timestamp)}
                              </div>
                              <p>{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg p-8 text-center text-gray-500">
                  Select a chat session to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
