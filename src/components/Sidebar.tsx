import React, { useEffect, useState } from 'react';
import { 
  Home, 
  ListMusic, 
  DownloadCloud, 
  History, 
  Settings, 
<<<<<<< Updated upstream:src/components/Sidebar.tsx
  Radio,
=======
  Activity,
>>>>>>> Stashed changes:omnistream/src/components/Sidebar.tsx
  HelpCircle,
  LogOut,
  Plus
} from 'lucide-react';
import { downloadManager } from '../services/downloadManager';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playlistAnalyzed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  playlistAnalyzed,
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
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Logo - Matches Mockup */}
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div style={{
          background: 'var(--accent-gradient)',
          borderRadius: '12px',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
          color: '#ffffff'
        }}>
<<<<<<< Updated upstream:src/components/Sidebar.tsx
          <Radio size={24} />
=======
          <Activity size={24} />
>>>>>>> Stashed changes:omnistream/src/components/Sidebar.tsx
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 850, letterSpacing: '-0.5px', margin: 0, color: 'var(--text-h)' }}>
            OmniStream
          </h2>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            MEDIA COMMAND CENTER
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
                background: isActive ? 'var(--glass-bg)' : 'transparent',
                border: '1px solid transparent',
                borderColor: isActive ? 'var(--glass-border)' : 'transparent',
                color: isActive ? 'var(--text-h)' : 'var(--text)',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)',
                position: 'relative',
                boxShadow: isActive ? 'inset 0 0 12px rgba(255, 255, 255, 0.03)' : 'none'
              }}
              className="sidebar-btn"
            >
              <Icon size={20} style={{ color: isActive ? 'var(--accent-light)' : 'currentColor' }} />
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
                  boxShadow: 'var(--shadow-glow)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* New Download Button (Matches Mockup) */}
        <button
          onClick={() => {
            setActiveTab('home');
            setTimeout(() => {
              const inputEl = document.querySelector('.input') as HTMLInputElement;
              if (inputEl) inputEl.focus();
            }, 100);
          }}
          className="btn btn-primary"
          style={{
            marginTop: '2rem',
            width: '100%',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-glow)',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          <span>New Download</span>
        </button>
      </nav>

      {/* Stats monitor and Bottom links (Help / Logout) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-light)', fontWeight: 600, fontSize: '0.8rem' }}>
              <DownloadCloud size={16} className="animate-pulse-glow" />
              <span>DOWNLOADING NOW</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-h)' }}>
              {formatSpeed(totalSpeed)}
            </div>
          </div>
        )}

        {/* Help & Logout Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => alert("OmniStream Help & Documentation Center is offline for MVP.")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left',
              transition: 'color var(--transition-fast)'
            }}
            className="sidebar-bottom-btn"
          >
            <HelpCircle size={18} color="var(--text-muted)" />
            <span>Help</span>
          </button>
          
          <button
            onClick={() => alert("Logout routine initialized.")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textAlign: 'left',
              transition: 'color var(--transition-fast)'
            }}
            className="sidebar-bottom-btn"
          >
            <LogOut size={18} color="var(--text-muted)" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
