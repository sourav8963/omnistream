import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  Search, 
  Music, 
  Video, 
  FolderPlus,
  ArrowUpDown,
  Pin,
  Clock,
  HardDrive
} from 'lucide-react';
import { type AnalysisResult } from '../services/urlAnalyzer';
import { downloadManager } from '../services/downloadManager';
import { storage } from '../services/storage';

interface PlaylistViewProps {
  playlist: AnalysisResult | null;
  onClear: () => void;
  setActiveTab: (tab: string) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  onClear,
  setActiveTab,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'index' | 'title' | 'duration'>('index');
  const [sortAsc, setSortAsc] = useState(true);
  const [isPinned, setIsPinned] = useState(false);

  // Settings config before batch downloading
  const [batchQuality, setBatchQuality] = useState('1080p');
  const [batchFormat, setBatchFormat] = useState('mp4');
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  // Synchronize state when playlist changes
  useEffect(() => {
    if (playlist) {
      if (playlist.playlistItems) {
        setSelectedIds(new Set(playlist.playlistItems.map(item => item.id)));
      }
      const pinned = storage.getPinnedPlaylists();
      setIsPinned(pinned.some(p => p.url === playlist.url));
    }
  }, [playlist]);

  const togglePin = () => {
    if (!playlist) return;
    const updated = storage.togglePinPlaylist({
      url: playlist.url,
      title: playlist.title,
      platform: playlist.platform,
      thumbnail: playlist.thumbnail,
      itemCount: playlist.itemCount || playlist.playlistItems?.length || 0,
    });
    setIsPinned(updated.some(p => p.url === playlist.url));
  };

  const handleSelectAll = () => {
    if (playlist && playlist.playlistItems) {
      setSelectedIds(new Set(playlist.playlistItems.map(item => item.id)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!playlist || !playlist.playlistItems) return [];
    return playlist.playlistItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.artist && item.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [playlist, searchQuery]);

  // Sort items
  const sortedItems = useMemo(() => {
    if (!playlist || !playlist.playlistItems) return [];
    const items = [...filteredItems];
    items.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'duration') {
        comparison = a.durationSeconds - b.durationSeconds;
      } else {
        // 'index' / order parsed
        const idxA = playlist.playlistItems?.indexOf(a) ?? 0;
        const idxB = playlist.playlistItems?.indexOf(b) ?? 0;
        comparison = idxA - idxB;
      }
      return sortAsc ? comparison : -comparison;
    });
    return items;
  }, [filteredItems, sortBy, sortAsc, playlist]);

  const toggleSort = (field: 'index' | 'title' | 'duration') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  // Calculate estimated sizes
  const totalEstimates = useMemo(() => {
    if (!playlist || !playlist.playlistItems) return 0;
    let size = 0;
    playlist.playlistItems.forEach(item => {
      if (selectedIds.has(item.id)) {
        // audio only is lighter
        size += isAudioOnly ? item.estimatedSize1080pBytes * 0.15 : item.estimatedSize1080pBytes;
      }
    });
    return size;
  }, [playlist, selectedIds, isAudioOnly]);

  // Early return if playlist is null, placing it after all hooks
  if (!playlist) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-h)', marginBottom: '0.5rem' }}>No Playlist Loaded</h3>
        <p style={{ color: 'var(--text)' }}>Go to the Home tab and paste a playlist URL to preview and download.</p>
      </div>
    );
  }

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const handleBatchDownload = () => {
    if (selectedIds.size === 0) return;

    const itemsToEnqueue = playlist.playlistItems
      ?.filter(item => selectedIds.has(item.id))
      .map(item => ({
        title: item.title,
        artist: item.artist || playlist.artist,
        album: playlist.title,
        thumbnail: item.thumbnail,
        quality: isAudioOnly ? '320kbps' : batchQuality,
        format: isAudioOnly ? 'mp3' : batchFormat,
        totalBytes: isAudioOnly ? Math.round(item.estimatedSize1080pBytes * 0.15) : item.estimatedSize1080pBytes,
        url: item.url,
        platform: playlist.platform,
      })) || [];

    downloadManager.addToQueue(itemsToEnqueue);
    setActiveTab('queue');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Top Banner & Info */}
      <div className="glass-card" style={{
        display: 'flex',
        gap: '2rem',
        padding: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        position: 'relative'
      }}>
        <img 
          src={playlist.thumbnail} 
          alt={playlist.title} 
          style={{
            width: '180px',
            height: '180px',
            borderRadius: 'var(--radius-md)',
            objectFit: 'cover',
            boxShadow: 'var(--shadow-lg)'
          }}
        />

        <div style={{ flexGrow: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-accent">{playlist.platform}</span>
            <span className="badge badge-info">{playlist.type.toUpperCase()}</span>
          </div>
          
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-h)' }}>
            {playlist.title}
          </h2>
          
          <p style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            By {playlist.artist || 'Various Artists'}
          </p>
          
          <p style={{ color: 'var(--text)', fontSize: '0.88rem', maxWidth: '700px', lineHeight: '1.5', marginBottom: '1rem' }}>
            {playlist.description || 'No description available for this import.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={16} />
              {playlist.playlistItems?.length || 0} Tracks
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <HardDrive size={16} />
              Est. Batch Size: {formatSize(totalEstimates)}
            </span>
          </div>
        </div>

        {/* Buttons for actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          justifyContent: 'center',
          alignSelf: 'stretch'
        }}>
          <button 
            onClick={togglePin}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            <Pin size={16} fill={isPinned ? 'var(--accent)' : 'transparent'} color={isPinned ? 'var(--accent)' : 'currentColor'} />
            <span>{isPinned ? 'Pinned to Library' : 'Pin Playlist'}</span>
          </button>
          <button 
            onClick={onClear}
            className="btn btn-secondary"
            style={{ color: 'var(--danger)' }}
          >
            Reset Analysis
          </button>
        </div>
      </div>

      {/* Main List & Batch Customization Row */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left side list */}
        <div className="glass-card" style={{ flexGrow: 1, minWidth: '450px', padding: '1.5rem' }}>
          {/* Header toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={selectedIds.size === playlist.playlistItems?.length ? handleDeselectAll : handleSelectAll}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              >
                {selectedIds.size === playlist.playlistItems?.length ? 'Deselect All' : 'Select All'}
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {selectedIds.size} of {playlist.playlistItems?.length || 0} selected
              </span>
            </div>

            {/* Search filter */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search tracks..."
                className="input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.45rem 1rem 0.45rem 2.2rem', width: '200px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          {/* Table Header labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 40px 60px 1fr 100px 100px',
            gap: '1rem',
            padding: '0.5rem 1rem',
            fontWeight: 700,
            fontSize: '0.8rem',
            color: 'var(--text-h)',
            borderBottom: '1px solid var(--border)',
            marginBottom: '0.5rem'
          }}>
            <div></div>
            <div 
              onClick={() => toggleSort('index')} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              # <ArrowUpDown size={12} />
            </div>
            <div>Cover</div>
            <div 
              onClick={() => toggleSort('title')} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Title <ArrowUpDown size={12} />
            </div>
            <div 
              onClick={() => toggleSort('duration')} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Duration <ArrowUpDown size={12} />
            </div>
            <div>Size</div>
          </div>

          {/* Songs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '500px', overflowY: 'auto' }}>
            {sortedItems.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No tracks found matching "{searchQuery}"
              </div>
            ) : (
              sortedItems.map((item) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 40px 60px 1fr 100px 100px',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--accent-bg)' : 'transparent',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      borderColor: isSelected ? 'var(--accent-border)' : 'transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="playlist-row"
                  >
                    <div>
                      {isSelected ? (
                        <CheckSquare size={18} color="var(--accent)" />
                      ) : (
                        <Square size={18} color="var(--text-muted)" />
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)' }}>
                      {(playlist.playlistItems?.indexOf(item) ?? 0) + 1}
                    </div>
                    <img 
                      src={item.thumbnail} 
                      alt="" 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? 'var(--text-h)' : 'var(--text-h)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.artist || playlist.artist}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                      {item.durationString}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatSize(isAudioOnly ? item.estimatedSize1080pBytes * 0.15 : item.estimatedSize1080pBytes)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side batch config panel */}
        <div className="glass-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-h)' }}>Batch Settings</h3>

          {/* Audio vs Video Mode Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.25rem'
          }}>
            <button
              onClick={() => setIsAudioOnly(false)}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: !isAudioOnly ? 'var(--accent)' : 'transparent',
                color: !isAudioOnly ? '#fff' : 'var(--text)',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem'
              }}
            >
              <Video size={16} />
              Video
            </button>
            <button
              onClick={() => setIsAudioOnly(true)}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: isAudioOnly ? 'var(--accent)' : 'transparent',
                color: isAudioOnly ? '#fff' : 'var(--text)',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem'
              }}
            >
              <Music size={16} />
              Audio
            </button>
          </div>

          {/* Quality Select */}
          {!isAudioOnly ? (
            <div className="input-group">
              <label className="label">Video Resolution</label>
              <select 
                className="input" 
                value={batchQuality}
                onChange={(e) => setBatchQuality(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              >
                <option value="2160p">2160p (4K UHD) @60fps</option>
                <option value="1440p">1440p (QHD) @60fps</option>
                <option value="1080p">1080p (Full HD) @60fps</option>
                <option value="720p">720p (HD) @30fps</option>
                <option value="480p">480p (SD)</option>
              </select>
            </div>
          ) : (
            <div className="input-group">
              <label className="label">Audio Quality</label>
              <select className="input" style={{ fontSize: '0.9rem' }} disabled>
                <option value="320kbps">320 kbps (High Quality)</option>
                <option value="192kbps">192 kbps (Standard)</option>
                <option value="flac">FLAC (Lossless 24-bit)</option>
              </select>
            </div>
          )}

          {/* Format Select */}
          <div className="input-group">
            <label className="label">Container Format</label>
            {!isAudioOnly ? (
              <select 
                className="input"
                value={batchFormat}
                onChange={(e) => setBatchFormat(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              >
                <option value="mp4">MP4 (Recommended)</option>
                <option value="mkv">MKV (Matroska)</option>
                <option value="webm">WebM (VP9/Opus)</option>
              </select>
            ) : (
              <select className="input" style={{ fontSize: '0.9rem' }} disabled>
                <option value="mp3">MP3 (High compatibility)</option>
                <option value="m4a">M4A (AAC Codec)</option>
                <option value="wav">WAV (Uncompressed)</option>
              </select>
            )}
          </div>

          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.25rem',
            marginTop: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Tracks to queue:</span>
              <strong style={{ color: 'var(--text-h)' }}>{selectedIds.size}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>Est. disk usage:</span>
              <strong style={{ color: 'var(--text-h)' }}>{formatSize(totalEstimates)}</strong>
            </div>

            <button
              onClick={handleBatchDownload}
              disabled={selectedIds.size === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem'
              }}
            >
              <FolderPlus size={18} />
              <span>Queue {selectedIds.size} Downloads</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
