import React, { useEffect, useState } from 'react';
import { Calendar, MessageSquare, Trash2, Search } from 'lucide-react';

const History = () => {
    const [sessions, setSessions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Load chat history from localStorage
        // Format expected: KEY="mediflow_history" : [{ id, date, summary, preview }]
        // For now, since we haven't implemented saving to history logic in Page.js yet,
        // we will rely on a mock or empty state until the user sends messages.
        // Ideally, page.js should push completed sessions here.
        // For this demonstration, we'll mock some data or read a specific key.

        const loadedHistory = JSON.parse(localStorage.getItem('mediflow_history') || '[]');
        setSessions(loadedHistory);
    }, []);

    const clearHistory = () => {
        if (confirm('Are you sure you want to delete all history?')) {
            localStorage.removeItem('mediflow_history');
            setSessions([]);
        }
    };

    const deleteSession = (e, index) => {
        e.stopPropagation();
        const newSessions = [...sessions];
        newSessions.splice(index, 1);
        setSessions(newSessions);
        localStorage.setItem('mediflow_history', JSON.stringify(newSessions));
    };

    const filteredSessions = sessions.filter(session =>
        session.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.date.includes(searchTerm)
    );

    return (
        <main className="history-container glass-panel">
            <div className="history-header">
                <div className="title-section">
                    <h2>Consultation Timeline</h2>
                    <p>Review your past medical conversations.</p>
                </div>

                <div className="actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {sessions.length > 0 && (
                        <button className="clear-btn" onClick={clearHistory}>
                            <Trash2 size={18} /> Clear All
                        </button>
                    )}
                </div>
            </div>

            <div className="timeline-list">
                {filteredSessions.length > 0 ? (
                    filteredSessions.map((session, idx) => (
                        <div key={idx} className="timeline-item">
                            <div className="date-badge">
                                <Calendar size={16} />
                                <span>{session.date}</span>
                            </div>
                            <div className="session-card">
                                <div className="card-top">
                                    <h3>{session.summary || "Medical Consultation"}</h3>
                                    <button className="delete-icon" onClick={(e) => deleteSession(e, idx)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="session-preview">{session.preview}</p>
                                <div className="card-footer">
                                    <span className="msg-count">
                                        <MessageSquare size={14} /> {session.messageCount} Messages
                                    </span>
                                    <span className="time">{session.time}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-history">
                        <div className="empty-icon shadow-glow">
                            <Calendar size={48} />
                        </div>
                        <h3>No Consultations Found</h3>
                        <p>Your chat sessions will appear here automatically.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .history-container {
          flex: 1;
          height: 96vh;
          margin: 2vh 2vh 2vh 0;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          overflow: hidden;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        h2 { font-weight: 600; color: var(--text-main); margin-bottom: 0.2rem; }
        p { color: var(--text-muted); }

        .actions {
          display: flex;
          gap: 1rem;
        }

        .search-bar {
          background: white;
          padding: 10px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #e2e8f0;
          width: 300px;
        }

        .search-bar input {
          border: none;
          outline: none;
          width: 100%;
          font-family: inherit;
          color: var(--text-main);
        }

        .clear-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 0 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .clear-btn:hover { background: #fecaca; }

        .timeline-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .empty-history {
          margin: auto;
          text-align: center;
          color: var(--text-muted);
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: rgba(13, 148, 136, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--primary);
        }

        .timeline-item {
          display: flex;
          gap: 1.5rem;
        }

        .date-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 1rem;
          color: var(--text-light);
          min-width: 80px;
        }

        .date-badge span { margin-top: 0.2rem; font-size: 0.85rem; font-weight: 500; }

        .session-card {
          flex: 1;
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .session-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .card-top h3 {
          font-size: 1.1rem;
          color: var(--primary-dark);
          font-weight: 600;
        }

        .delete-icon {
          background: transparent;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          padding: 4px;
        }

        .delete-icon:hover { color: #ef4444; }

        .session-preview {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f8fafc;
          font-size: 0.85rem;
          color: var(--text-light);
        }

        .msg-count { display: flex; align-items: center; gap: 6px; }
      `}</style>
        </main>
    );
};

export default History;
