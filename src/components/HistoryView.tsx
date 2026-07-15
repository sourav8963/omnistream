import React, { useEffect, useState } from 'react';
import { 
  Star, 
  Search, 
  Trash2, 
  Download, 
  ChevronRight,
  HardDrive,
  Calendar
} from 'lucide-react';
import { storage, type HistoryItem, type PinnedPlaylist } from '../services/storage';
import { downloadManager } from '../services/downloadManager';

interface HistoryViewProps {
  onReAnalyzePlaylist: (url: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onReAnalyzePlaylist,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pinned, setPinned] = useState<PinnedPlaylist[]>([]);
  const [subTab, setSubTab] = useState<'recent' | 'favorites' | 'pinned'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setHistory(storage.getHistory());
    setPinned(storage.getPinnedPlaylists());
  };

  useEffect(() => {
    loadData();
    // Also load data when queue manager finishes things, so let's set a small interval or hook listener
    const unsubscribeQueue = downloadManager.subscribe(() => {
      loadData();
    });
    return () => unsubscribeQueue();
  }, []);

  const handleToggleFavorite = (id: string) => {
    const updated = storage.toggleFavorite(id);
    setHistory(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = storage.removeHistoryItem(id);
    setHistory(updated);
  };

  const handleSaveMockFile = (item: HistoryItem) => {
    // Mimic the download manager trigger
    const content = `OmniStream Download Complete!
===================================
File: ${item.title}
Platform: ${item.platform}
Source Link: ${item.url}
Quality: ${item.quality}
Format: ${item.format}
Size: ${(item.sizeBytes / (1024 * 1024)).toFixed(2)} MB
Downloaded At: ${new Date(item.downloadedAt).toLocaleString()}

Thank you for using OmniStream!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title.replace(/[/\\?%*:|"<>\s]/g, '_')}_[${item.quality}].txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenPinnedPlaylist = (url: string) => {
    onReAnalyzePlaylist(url);
  };

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter history based on search query and sub tab
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.artist && item.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (subTab === 'favorites') {
      return matchesSearch && item.isFavorite;
    }
    return matchesSearch;
  });

  const filteredPinned = pinned.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Search and Navigation Panel */}
      <div className="glass-card" style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Sub Tabs Toggle */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--glass-bg)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
          {[
            { id: 'recent', label: 'Recent Downloads' },
            { id: 'favorites', label: 'Favorites' },
            { id: 'pinned', label: 'Pinned Playlists' },
          ].map((tab) => {
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={subTab === 'pinned' ? 'Search pinned playlists...' : 'Search history...'}
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.45rem 1rem 0.45rem 2.2rem', width: '240px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}
          />
        </div>
      </div>

      {/* History Grid List */}
      {subTab === 'pinned' ? (
        // Pinned Playlists View
        <div className="grid-2">
          {filteredPinned.length === 0 ? (
            <div style={{ gridColumn: 'span 2', padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No pinned playlists found. Pinned playlists will appear here.
            </div>
          ) : (
            filteredPinned.map((playlist) => (
              <div 
                key={playlist.url} 
                className="glass-card" 
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  alignItems: 'center',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <img 
                  src={playlist.thumbnail} 
                  alt="" 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', boxShadow: 'var(--shadow)' }}
                />
                
                <div style={{ flexGrow: 1, minWidth: '150px' }}>
                  <span className="badge badge-accent" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', marginBottom: '0.35rem' }}>
                    {playlist.platform}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-h)', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {playlist.title}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'block' }}>
                    {playlist.itemCount} tracks
                  </span>
                </div>

                <button 
                  onClick={() => handleOpenPinnedPlaylist(playlist.url)}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', gap: '0.25rem' }}
                >
                  <span>Open</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        // Recent / Favorites Downloads View
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredHistory.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              {subTab === 'favorites' ? 'No starred downloads. Star downloads in history to pin them here.' : 'Your download history is empty.'}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div 
                key={item.id} 
                className="glass-card" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1rem 1.25rem',
                  background: 'var(--glass-bg)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap'
                }}
              >
                {/* Media icon or thumbnail */}
                <img 
                  src={item.thumbnail} 
                  alt="" 
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                />

                {/* Details */}
                <div style={{ flexGrow: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-h)' }}>
                      {item.title}
                    </h4>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>
                    <span className="badge badge-accent" style={{ padding: '0.05rem 0.35rem', fontSize: '0.6rem' }}>{item.platform}</span>
                    <span className="badge badge-info" style={{ padding: '0.05rem 0.35rem', fontSize: '0.6rem' }}>{item.quality} • {item.format.toUpperCase()}</span>
                    {item.artist && <span style={{ color: 'var(--text-muted)' }}>By {item.artist}</span>}
                  </div>
                </div>

                {/* File size & Download Date details */}
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8rem', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text)' }}>
                    <HardDrive size={14} color="var(--text-muted)" />
                    {formatSize(item.sizeBytes)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text)' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    {formatDate(item.downloadedAt)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
                  <button 
                    onClick={() => handleToggleFavorite(item.id)}
                    className="btn-icon"
                    title={item.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                    style={{ width: '34px', height: '34px', color: item.isFavorite ? '#eab308' : 'var(--text-muted)' }}
                  >
                    <Star size={14} fill={item.isFavorite ? '#eab308' : 'transparent'} />
                  </button>

                  <button 
                    onClick={() => handleSaveMockFile(item)}
                    className="btn btn-secondary"
                    title="Save File to Downloads again"
                    style={{ height: '34px', padding: '0 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Download size={14} />
                    <span>Redownload</span>
                  </button>

                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="btn-icon"
                    title="Delete History entry"
                    style={{ width: '34px', height: '34px', color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
