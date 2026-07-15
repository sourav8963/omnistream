import React, { useEffect, useState } from 'react';
import { 
  Home, 
  ListMusic, 
  DownloadCloud, 
  History, 
  Settings, 
  Moon, 
  Sun,
  Activity
} from 'lucide-react';
import { downloadManager } from '../services/downloadManager';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playlistAnalyzed: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  playlistAnalyzed,
  theme,
  toggleTheme,
}) => {
  const [activeCount, setActiveCount] = useState(0);
  const [totalSpeed, setTotalSpeed] = useState(0);

  useEffect(() => {
    // Listen to queue updates to get active download count
    const unsubscribeQueue = downloadManager.subscribe((queue) => {
      const active = queue.filter(item => item.status === 'downloading').length;
      setActiveCount(active);
    });

    // Listen to overall download speed changes
    const unsubscribeSpeed = downloadManager.subscribeSpeed((speedBytes) => {
      setTotalSpeed(speedBytes);
    });

    return () => {
      unsubscribeQueue();
      unsubscribeSpeed();
    };
  }, []);

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec === 0) return '0 KB/s';
    const mb = bytesPerSec / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB/s`;
    }
    const kb = bytesPerSec / 1024;
    return `${kb.toFixed(0)} KB/s`;
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    ...(playlistAnalyzed ? [{ id: 'playlist', label: 'Playlist Preview', icon: ListMusic }] : []),
    { id: 'queue', label: 'Download Manager', icon: DownloadCloud, badge: activeCount > 0 ? activeCount : undefined },
    { id: 'history', label: 'History & Favorites', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div style={{
          background: 'var(--accent-gradient)',
          borderRadius: '12px',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Activity size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Omni<span style={{ color: 'var(--accent)' }}>Stream</span>
          </h2>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Media Engine
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--accent-bg)' : 'transparent',
                border: '1px solid transparent',
                borderColor: isActive ? 'var(--accent-border)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text)',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
              className="sidebar-btn"
            >
              <Icon size={20} />
              <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
              {item.badge !== undefined && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--accent-gradient)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Speed Monitor Panel & Theme Toggle at bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        {activeCount > 0 && (
          <div className="glass-card" style={{
            padding: '1rem',
            background: 'var(--accent-bg)',
            borderColor: 'var(--accent-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.8rem' }}>
              <DownloadCloud size={16} className="animate-pulse-glow" />
              <span>DOWNLOADING NOW</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-h)' }}>
              {formatSpeed(totalSpeed)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text)' }}>
              Speed capped at {activeCount} active stream{activeCount > 1 ? 's' : ''}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            Theme: {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
          <button 
            onClick={toggleTheme}
            className="btn-icon"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
};
