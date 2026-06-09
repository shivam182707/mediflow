import React, { useState } from 'react';
import { User, Shield, Database, Save, LogOut, Sun, Moon } from 'lucide-react';

const Settings = () => {
    const [formData, setFormData] = useState({
        doctorName: "Dr. Emily Hartman",
        theme: "light",
        notifications: true
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('mediflow_settings', JSON.stringify(formData));
        setSaved(true);
        // In a real app, this would trigger a theme context update
        if (formData.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleTheme = () => {
        setFormData(prev => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light'
        }));
    };

    const handleClearData = () => {
        if (confirm("This will clear all local data including chat history. Continue?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <main className="settings-container glass-panel">
            <div className="settings-header">
                <h2>System Configuration</h2>
                <p>Manage your profile and application preferences.</p>
            </div>

            <div className="settings-grid">
                <section className="settings-card">
                    <div className="card-title">
                        <User size={20} />
                        <h3>Doctor Profile</h3>
                    </div>
                    <div className="input-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            value={formData.doctorName}
                            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                        />
                    </div>
                    <p className="hint">This name appears in the sidebar and chat interface.</p>
                </section>

                <section className="settings-card">
                    <div className="card-title">
                        {formData.theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                        <h3>Appearance</h3>
                    </div>
                    <div className="theme-control">
                        <label>Interface Theme</label>
                        <div className="theme-toggle-row">
                            <button
                                className={`theme-btn ${formData.theme === 'light' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, theme: 'light' })}
                            >
                                <Sun size={18} /> Light Mode
                            </button>
                            <button
                                className={`theme-btn ${formData.theme === 'dark' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, theme: 'dark' })}
                            >
                                <Moon size={18} /> Dark Mode
                            </button>
                        </div>
                    </div>
                    <p className="hint">Choose your preferred visual style.</p>
                </section>

                <section className="settings-card">
                    <div className="card-title">
                        <Database size={20} />
                        <h3>Data Management</h3>
                    </div>
                    <div className="data-control">
                        <p>Clear all locally stored chat sessions and settings.</p>
                        <button className="danger-btn" onClick={handleClearData}>
                            <TrashIcon /> Clear Local Data
                        </button>
                    </div>
                </section>
            </div>

            <div className="action-footer">
                <button className="save-btn" onClick={handleSave}>
                    <Save size={18} />
                    {saved ? 'Saved Successfully!' : 'Save Changes'}
                </button>
            </div>

            <style jsx>{`
        .settings-container {
          flex: 1;
          height: 96vh;
          margin: 2vh 2vh 2vh 0;
          border-radius: 24px;
          padding: 2rem 3rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .settings-header {
          margin-bottom: 3rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 1.5rem;
        }

        h2 { color: var(--text-main); margin-bottom: 0.5rem; }
        p { color: var(--text-muted); }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .settings-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }

        .card-title {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 1.5rem;
          color: var(--primary-dark);
        }

        .card-title h3 {
           font-size: 1.1rem;
           font-weight: 600;
        }

        .input-group {
          margin-bottom: 1rem;
        }

        label {
          display: block;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }

        input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-family: inherit;
          font-size: 1rem;
        }

        input:focus {
           outline: none;
           border-color: var(--primary);
           background: white;
        }

        .theme-control {
          margin-bottom: 1rem;
        }

        .theme-toggle-row {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .theme-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .theme-btn:hover {
          background: white;
          border-color: var(--primary-light);
        }

        .theme-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
        }

        .hint {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-top: auto;
        }

        .danger-btn {
          margin-top: 1rem;
          width: 100%;
          padding: 12px;
          border: 1px solid #fee2e2;
          background: #fff;
          color: #ef4444;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .danger-btn:hover { background: #fee2e2; }

        .action-footer {
           margin-top: auto;
           display: flex;
           justify-content: flex-end;
           padding-top: 2rem;
           border-top: 1px solid var(--glass-border);
        }

        .save-btn {
           background: var(--primary);
           color: white;
           border: none;
           padding: 14px 28px;
           border-radius: 14px;
           font-size: 1rem;
           font-weight: 600;
           cursor: pointer;
           display: flex;
           align-items: center;
           gap: 10px;
           transition: all 0.2s;
        }

        .save-btn:hover {
           background: var(--primary-dark);
           transform: translateY(-2px);
           box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
        }
      `}</style>
        </main>
    );
};

const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

export default Settings;
