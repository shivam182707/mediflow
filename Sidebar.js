import React from 'react';
import { MessageSquare, FileText, Activity, Settings, TrendingUp } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'chat', icon: MessageSquare, label: 'Assistant' },
    { id: 'analyze', icon: FileText, label: 'Report Analyzer' },
    { id: 'trends', icon: TrendingUp, label: 'Health Trends' },
    { id: 'history', icon: Activity, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="logo-area">
        <div className="logo-icon">
          <Activity size={24} color="white" />
        </div>
        <span className="logo-text">Mediflow</span>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="nav-label">{item.label}</span>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="user-area">
        <div className="user-avatar">DR</div>
        <div className="user-info">
          <p className="user-name">Dr. Emily Hartman</p>
          <p className="user-role">Online</p>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 96vh;
          margin: 2vh;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          background: #ffffff; /* Fallback */
          background: rgba(255, 255, 255, 0.9);
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 3rem;
          padding: 0 0.5rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-glow);
        }

        .logo-text {
          font-family: var(--font-main);
          font-weight: 700;
          font-size: 1.5rem;
          color: var(--primary-dark);
          letter-spacing: -0.5px;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 14px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-family: var(--font-main);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(13, 148, 136, 0.05);
          color: var(--primary);
        }

        .nav-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }

        .user-area {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(241, 245, 249, 0.5);
          border-radius: 16px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--success, #10b981);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
