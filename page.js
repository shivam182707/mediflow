'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import ReportAnalyzer from '@/components/ReportAnalyzer';
import TrendAnalyzer from '@/components/TrendAnalyzer';
import History from '@/components/History';
import Settings from '@/components/Settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [docContext, setDocContext] = useState(null);
  const [historySessions, setHistorySessions] = useState([]); // New state for history

  // Backend Endpoints
  const CHAT_ENDPOINT = "http://localhost:8000/ask";
  const UPLOAD_ENDPOINT = "http://localhost:8000/analyze_report";

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (text) => {
    const timestamp = getCurrentTime();
    // Optimistic UI Update
    const userMsg = { role: 'user', content: text, timestamp };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Inject Document Context if available
      let payload = text;
      if (docContext) {
        payload = `[System Note: Context from uploaded medical file]\n${docContext}\n\n[User Question]: ${text}`;
      }

      const response = await axios.post(CHAT_ENDPOINT, { message: payload });

      const aiMsg = {
        role: 'assistant',
        content: response.data || "I'm sorry, I couldn't process that request.",
        timestamp: getCurrentTime()
      };

      const sessionMessages = [...updatedMessages, aiMsg];
      setMessages(sessionMessages);

      // Save to History (Mock functionality: Save last session state)
      saveToHistory(sessionMessages[0].content, sessionMessages);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = {
        role: 'assistant',
        content: "⚠️ **Connection Error**: Unable to reach the medical server. Is the backend running?",
        timestamp: getCurrentTime()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file) => {
    // Notify user upload started
    const timestamp = getCurrentTime();
    const userMsg = { role: 'user', content: `📎 Uploaded: **${file.name}**`, timestamp };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(UPLOAD_ENDPOINT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const reportText = response.data;
      setDocContext(reportText); // Save context for future questions

      // Formatting the report response nicely
      const aiMsg = {
        role: 'assistant',
        content: `### 📄 Analysis Result for ${file.name}\n\n${reportText}\n\n*I have memorized this report. You can now ask me questions about it!*`,
        timestamp: getCurrentTime()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Upload Error:", error);
      const errorMsg = {
        role: 'assistant',
        content: "⚠️ **Analysis Failed**: Could not process the document.",
        timestamp: getCurrentTime()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to save session to history
  const saveToHistory = (summaryText, msgs) => {
    const history = JSON.parse(localStorage.getItem('mediflow_history') || '[]');
    // For this simple version, we just append a new session entry if it's the first message, 
    // or update the last one.
    // To keep it simple, let's just create a new entry for every "Session" start or just log it.
    // A better approach in a real app is managing Session IDs.
    // Here we will just upsert a "Current Session" entry.

    const today = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if we have a session for today/now
    // Simplified: Just add a new entry for the first interaction, update otherwise
    // We'll just push a new entry to the top for the "Latest Consultation" visual
    const newEntry = {
      id: Date.now(),
      date: today,
      time: time,
      summary: summaryText.substring(0, 60) + "...",
      preview: msgs[msgs.length - 1].content.substring(0, 100) + "...",
      messageCount: msgs.length
    };

    // In a real app we'd update index 0 if it belongs to same session
    // For demo, we insert.
    const newHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem('mediflow_history', JSON.stringify(newHistory));
  };


  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'chat' && (
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
        />
      )}

      {activeTab === 'analyze' && (
        <ReportAnalyzer />
      )}

      {activeTab === 'trends' && (
        <TrendAnalyzer />
      )}

      {activeTab === 'history' && (
        <History />
      )}

      {activeTab === 'settings' && (
        <Settings />
      )}

      <style jsx>{`
        .app-container {
          display: flex;
          background: linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 100%);
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}
