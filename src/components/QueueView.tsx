import React, { useEffect, useState } from 'react';
import { 
  Pause, 
  Play, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PauseCircle,
  Download,
  AlertTriangle
} from 'lucide-react';
import { downloadManager, type QueueItem } from '../services/downloadManager';
import { SpeedGraph } from './SpeedGraph';

export const QueueView: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [speedHistory, setSpeedHistory] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'failed' | 'paused'>('active');

  useEffect(() => {
    // Subscribe to queue changes
    const unsubscribeQueue = downloadManager.subscribe((updatedQueue) => {
      setQueue(updatedQueue);
    });

    // Hook up speed history updater
    const speedInterval = setInterval(() => {
      setSpeedHistory([...downloadManager.getSpeedHistory()]);
    }, 500);

    return () => {
      unsubscribeQueue();
      clearInterval(speedInterval);
    };
  }, []);

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatETA = (seconds: number): string => {
    if (seconds < 0) return 'estimating...';
    if (seconds === 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatSpeed = (bytesPerSec: number): string => {
    if (bytesPerSec === 0) return '0 KB/s';
    const mb = bytesPerSec / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB/s`;
    return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
  };

  // Filter queue items by tab status
  const filteredItems = queue.filter(item => {
    if (activeTab === 'active') {
      return item.status === 'downloading' || item.status === 'waiting';
    }
    if (activeTab === 'completed') {
      return item.status === 'completed';
    }
    if (activeTab === 'failed') {
      return item.status === 'failed';
    }
    if (activeTab === 'paused') {
      return item.status === 'paused';
    }
    return false;
  });

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'downloading':
        return <RefreshCw size={18} className="animate-pulse-glow" style={{ color: 'var(--accent)', animation: 'progress-animation 2s linear infinite' }} />;
      case 'waiting':
        return <Clock size={18} style={{ color: 'var(--info)' }} />;
      case 'completed':
        return <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />;
      case 'failed':
        return <XCircle size={18} style={{ color: 'var(--danger)' }} />;
      case 'paused':
        return <PauseCircle size={18} style={{ color: 'var(--warning)' }} />;
    }
  };

  const handleTriggerMockDownload = (item: QueueItem) => {
    downloadManager.triggerRealDownload(item);
  };

  const activeCount = queue.filter(item => item.status === 'downloading').length;
  const waitingCount = queue.filter(item => item.status === 'waiting').length;
  const completedCount = queue.filter(item => item.status === 'completed').length;
  const failedCount = queue.filter(item => item.status === 'failed').length;
  const pausedCount = queue.filter(item => item.status === 'paused').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Network Speed Graph */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <SpeedGraph speedHistory={speedHistory} />
      </div>

      {/* Main Queue Dashboard */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        
        {/* Controls Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-h)' }}>Download Queue</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {activeCount} active downloads, {waitingCount} waiting, {queue.length} total
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => downloadManager.resumeAll()} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
              disabled={pausedCount === 0}
            >
              <Play size={14} /> Resume All
            </button>
            <button 
              onClick={() => downloadManager.pauseAll()} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
              disabled={activeCount === 0 && waitingCount === 0}
            >
              <Pause size={14} /> Pause All
            </button>
            <button 
              onClick={() => downloadManager.clearCompleted()} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem', color: 'var(--text)' }}
              disabled={completedCount === 0 && failedCount === 0}
            >
              <Trash2 size={14} /> Clear Finished
            </button>
          </div>
        </div>

        {/* Tabs Selection Bar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          {[
            { id: 'active', label: 'Active', count: activeCount + waitingCount },
            { id: 'paused', label: 'Paused', count: pausedCount },
            { id: 'completed', label: 'Completed', count: completedCount },
            { id: 'failed', label: 'Failed', count: failedCount },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--accent-bg)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  background: isActive ? 'var(--accent)' : 'var(--border)',
                  color: isActive ? '#fff' : 'var(--text)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Downloads Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredItems.length === 0 ? (
            <div style={{
              padding: '3.5rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={32} opacity="0.5" />
              <span style={{ fontSize: '0.95rem' }}>No downloads found in this tab.</span>
            </div>
          ) : (
            filteredItems.map((item) => {
              const progressPercent = Math.round((item.downloadedBytes / item.totalBytes) * 100);
              return (
                <div 
                  key={item.id} 
                  className="glass-card" 
                  style={{
                    padding: '1.15rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    flexWrap: 'wrap',
                    background: 'var(--glass-bg)',
                    borderColor: item.status === 'downloading' ? 'var(--accent-border)' : 'var(--glass-border)'
                  }}
                >
                  {/* Miniature Thumbnail */}
                  <img 
                    src={item.thumbnail} 
                    alt="" 
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />

                  {/* Metadata and Title Info */}
                  <div style={{ flexGrow: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(item.status)}
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-h)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '300px' }} title={item.title}>
                        {item.title}
                      </h4>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span className="badge badge-accent" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>{item.platform}</span>
                      <span className="badge badge-info" style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>{item.quality} - {item.format.toUpperCase()}</span>
                      {item.artist && <span style={{ color: 'var(--text-muted)' }}>By {item.artist}</span>}
                    </div>
                  </div>

                  {/* Progress Bar Column */}
                  <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-h)' }}>{progressPercent}%</span>
                      <span style={{ color: 'var(--text)' }}>
                        {formatSize(item.downloadedBytes)} / {formatSize(item.totalBytes)}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    <div style={{
                      height: '7px',
                      background: 'var(--border)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        background: 'var(--accent-gradient)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                        position: 'relative',
                        backgroundImage: item.status === 'downloading' ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' : 'none',
                        backgroundSize: '15px 15px',
                        animation: item.status === 'downloading' ? 'progress-animation 1s linear infinite' : 'none'
                      }}></div>
                    </div>

                    {/* Speed/ETA Details */}
                    {item.status === 'downloading' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>Speed: {formatSpeed(item.speedBytesPerSec)}</span>
                        <span>ETA: {formatETA(item.etaSeconds)}</span>
                      </div>
                    )}
                    {item.status === 'waiting' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--info)' }}>
                        Queued. Waiting for free thread...
                      </div>
                    )}
                    {item.status === 'paused' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--warning)' }}>
                        Paused. Progress preserved.
                      </div>
                    )}
                    {item.status === 'failed' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 600 }}>
                        Network handshake failed.
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {item.status === 'downloading' && (
                      <button 
                        onClick={() => downloadManager.pauseItem(item.id)} 
                        className="btn-icon" 
                        title="Pause"
                        style={{ width: '34px', height: '34px' }}
                      >
                        <Pause size={14} />
                      </button>
                    )}
                    {item.status === 'paused' && (
                      <button 
                        onClick={() => downloadManager.resumeItem(item.id)} 
                        className="btn-icon" 
                        title="Resume"
                        style={{ width: '34px', height: '34px' }}
                      >
                        <Play size={14} />
                      </button>
                    )}
                    {item.status === 'failed' && (
                      <button 
                        onClick={() => downloadManager.retryItem(item.id)} 
                        className="btn-icon" 
                        title="Retry"
                        style={{ width: '34px', height: '34px', color: 'var(--accent)' }}
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    {item.status === 'completed' && (
                      <>
                        <button 
                          onClick={() => handleTriggerMockDownload(item)} 
                          className="btn btn-secondary" 
                          title="Save Mock File to Downloads"
                          style={{ padding: '0 0.75rem', height: '34px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--success-bg)', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}
                        >
                          <Download size={14} />
                          Save File
                        </button>
                      </>
                    )}

                    <button 
                      onClick={() => downloadManager.cancelItem(item.id)} 
                      className="btn-icon" 
                      title={item.status === 'completed' ? 'Remove from list' : 'Cancel download'}
                      style={{ width: '34px', height: '34px', color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
