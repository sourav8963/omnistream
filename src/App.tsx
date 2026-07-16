import { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  X, 
  Music, 
  Video, 
  ListMusic, 
  Zap, 
  AlertCircle,
  FileDown,
  Loader2
} from 'lucide-react';
import { urlAnalyzer, type AnalysisResult } from './services/urlAnalyzer';

interface DownloadItem {
  id: string;
  title: string;
  artist?: string;
  type: 'song' | 'video' | 'playlist';
  progress: number;
  status: 'waiting' | 'downloading' | 'completed' | 'failed';
  speed: string;
  eta: string;
  thumbnail: string;
  url: string;
  format: string;
  quality: string;
  platform: string;
  completedAt?: string;
}

// Brand Icon from favicon.svg
const BrandIcon = () => (
  <svg viewBox="0 0 48 48" width="36" height="36" fill="none" style={{ color: 'var(--accent)' }}>
    <g transform="translate(12, 12)" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.247 7.761a6 6 0 0 1 0 8.478"></path>
      <path d="M19.075 4.933a10 10 0 0 1 0 14.134"></path>
      <path d="M4.925 19.067a10 10 0 0 1 0-14.134"></path>
      <path d="M7.753 16.239a6 6 0 0 1 0-8.478"></path>
      <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
    </g>
  </svg>
);

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedItem, setAnalyzedItem] = useState<AnalysisResult | null>(null);
  
  // Selected configuration for enqueued items
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  
  // Download Queue
  const [queue, setQueue] = useState<DownloadItem[]>([]);
  // Completed history
  const [history, setHistory] = useState<DownloadItem[]>(() => {
    try {
      const stored = localStorage.getItem('omnistream_lite_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('omnistream_lite_history', JSON.stringify(history));
  }, [history]);

  // Set default settings on analyze success
  useEffect(() => {
    if (analyzedItem) {
      if (analyzedItem.type === 'song') {
        setSelectedQuality('320kbps');
        setSelectedFormat('mp3');
      } else if (analyzedItem.type === 'video') {
        setSelectedQuality('1080p');
        setSelectedFormat('mp4');
      } else {
        setSelectedQuality('1080p');
        setSelectedFormat('mp4');
      }
    }
  }, [analyzedItem]);

  // Download simulation loop
  useEffect(() => {
    const activeDownloads = queue.filter(item => item.status === 'downloading');
    const waitingDownloads = queue.filter(item => item.status === 'waiting');

    // If nothing is actively downloading but there are waiting items, start downloading the first one
    if (activeDownloads.length === 0 && waitingDownloads.length > 0) {
      setQueue(prev => prev.map(item => 
        item.id === waitingDownloads[0].id 
          ? { ...item, status: 'downloading', speed: 'Starting...' } 
          : item
      ));
      return;
    }

    if (activeDownloads.length === 0) return;

    // Simulate progress ticks
    const interval = setInterval(() => {
      setQueue(prev => {
        let isAnyFinished = false;
        const updated = prev.map(item => {
          if (item.status !== 'downloading') return item;

          const nextProgress = item.progress + Math.floor(Math.random() * 8) + 4;
          if (nextProgress >= 100) {
            isAnyFinished = true;
            // Trigger browser mock file download
            triggerMockDownload(item);
            
            const completedItem: DownloadItem = { 
              ...item, 
              progress: 100, 
              status: 'completed', 
              completedAt: new Date().toISOString() 
            };
            
            // Add to history
            setHistory(h => [completedItem, ...h]);
            
            return completedItem;
          }

          // Random speed & ETA calculations
          const speedNum = (Math.random() * 8 + 12).toFixed(1);
          const remainingPct = 100 - nextProgress;
          const etaSecs = Math.max(1, Math.round(remainingPct / (Math.random() * 2 + 3)));
          
          return {
            ...item,
            progress: nextProgress,
            speed: `${speedNum} MB/s`,
            eta: `${etaSecs}s`
          };
        });

        // Filter out completed ones from active queue
        if (isAnyFinished) {
          return updated.filter(item => item.status !== 'completed');
        }
        return updated;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [queue]);

  const triggerMockDownload = (item: DownloadItem) => {
    const textContent = `OmniStream Media Download Report
=================================
Title: ${item.title}
Artist/Channel: ${item.artist || 'Unknown'}
Platform: ${item.platform === 'YouTube' ? 'YouTube' : 'Web Stream'}
Content Type: ${item.type.toUpperCase()}
Quality: ${item.quality}
Format: ${item.format}
Source URL: ${item.url}
Completed At: ${new Date().toISOString()}

Enjoy your separated offline media stream!`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title.replace(/[/\\?%*:|"<>\s]/g, '_')}_[${item.quality}].txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || url;
    if (!targetUrl.trim()) {
      setError('Please paste a link first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalyzedItem(null);

    try {
      const result = await urlAnalyzer.analyze(targetUrl);
      setAnalyzedItem(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!analyzedItem) return;

    if (analyzedItem.type === 'playlist' && analyzedItem.playlistItems) {
      // Add all tracks from the playlist to queue
      const playlistItemsToAdd: DownloadItem[] = analyzedItem.playlistItems.map((track, i) => ({
        id: `q-${Math.random().toString(36).substring(2, 9)}-${i}`,
        title: track.title,
        artist: track.artist,
        type: 'song',
        progress: 0,
        status: 'waiting',
        speed: '0 MB/s',
        eta: '- -',
        thumbnail: track.thumbnail,
        url: track.url,
        format: selectedFormat || 'mp3',
        quality: selectedQuality || '320kbps',
        platform: analyzedItem.platform
      }));
      setQueue(prev => [...prev, ...playlistItemsToAdd]);
    } else {
      // Add single video or song to queue
      const singleItem: DownloadItem = {
        id: `q-${Math.random().toString(36).substring(2, 9)}`,
        title: analyzedItem.title,
        artist: analyzedItem.artist,
        type: analyzedItem.type,
        progress: 0,
        status: 'waiting',
        speed: '0 MB/s',
        eta: '- -',
        thumbnail: analyzedItem.thumbnail,
        url: analyzedItem.url,
        format: selectedFormat,
        quality: selectedQuality,
        platform: analyzedItem.platform
      };
      setQueue(prev => [...prev, singleItem]);
    }

    // Reset analyzer view
    setAnalyzedItem(null);
    setUrl('');
  };

  const handleCancelQueueItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handlePresetClick = (presetUrl: string) => {
    setUrl(presetUrl);
    handleAnalyze(presetUrl);
  };

  const presets = [
    { label: 'YouTube Song 🎵', url: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'YouTube Video 🎥', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'YouTube Playlist 📂', url: 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn5n4e05b5f884bf05b5a265' }
  ];

  return (
    <div style={{
      maxWidth: '850px',
      margin: '2rem auto',
      padding: '0 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* Brand Header */}
      <header style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.75rem',
        marginTop: '1rem'
      }}>
        <div style={{
          background: 'rgba(25, 10, 15, 0.6)',
          border: '1px solid var(--accent-border)',
          borderRadius: '16px',
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <BrandIcon />
        </div>
        <div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: '-1.5px',
            margin: 0,
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(201, 0, 53, 0.15)'
          }}>
            OmniStream Lite
          </h1>
          <p style={{
            fontSize: '0.98rem',
            color: 'var(--text)',
            marginTop: '0.35rem',
            maxWidth: '480px',
            lineHeight: 1.5
          }}>
            Analyze and extract high-quality audio or video streams from YouTube links instantly.
          </p>
        </div>
      </header>

      {/* Input Paste Card */}
      <section className="glass-card animate-float" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="input"
            placeholder="Paste YouTube Video, Music, or Playlist link here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              if (pastedText) {
                setUrl(pastedText);
                handleAnalyze(pastedText);
              }
            }}
            style={{
              flexGrow: 1,
              padding: '0.95rem 1.35rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-default)'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleAnalyze()}
            disabled={loading}
            style={{
              padding: '0 2.2rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--accent)'
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                <span>Analyze</span>
                <Zap size={15} />
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            fontSize: '0.88rem',
            border: '1px solid rgba(255, 180, 171, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Preset Toggles */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1.25rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Try Presets:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset.url)}
              className="btn btn-secondary"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {/* Analysis Result Card */}
      {analyzedItem && (
        <section className="glass-card animate-float" style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          borderColor: 'var(--accent-border)',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          position: 'relative'
        }}>
          <button 
            onClick={() => setAnalyzedItem(null)}
            className="btn-icon"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '32px',
              height: '32px',
              borderRadius: '50%'
            }}
            title="Clear Analysis"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <img 
              src={analyzedItem.thumbnail} 
              alt="" 
              style={{
                width: '240px',
                height: '135px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)'
              }} 
            />
            {analyzedItem.durationString && (
              <span className="badge badge-info" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                Duration: {analyzedItem.durationString}
              </span>
            )}
          </div>

          <div style={{ flexGrow: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-accent" style={{
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {analyzedItem.type === 'song' && <Music size={10} />}
                  {analyzedItem.type === 'video' && <Video size={10} />}
                  {analyzedItem.type === 'playlist' && <ListMusic size={10} />}
                  {analyzedItem.type.toUpperCase()}
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{analyzedItem.platform} Source</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-h)', fontWeight: 800 }}>{analyzedItem.title}</h3>
              {analyzedItem.artist && (
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginTop: '0.15rem' }}>
                  By {analyzedItem.artist}
                </p>
              )}
            </div>

            {/* Quality and Format Selectors */}
            {analyzedItem.type !== 'playlist' && (
              <div className="grid-2">
                <div className="input-group">
                  <label className="label">Preferred Quality</label>
                  <select 
                    className="input"
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    style={{ fontSize: '0.9rem', padding: '0.6rem 0.85rem' }}
                  >
                    {analyzedItem.type === 'song' ? (
                      <>
                        <option value="320kbps">320 kbps (High Quality)</option>
                        <option value="192kbps">192 kbps (Medium)</option>
                        <option value="128kbps">128 kbps (Optimized)</option>
                      </>
                    ) : (
                      <>
                        <option value="1080p">1080p (Full HD)</option>
                        <option value="720p">720p (HD)</option>
                        <option value="480p">480p (SD)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="input-group">
                  <label className="label">Format Container</label>
                  <select 
                    className="input"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    style={{ fontSize: '0.9rem', padding: '0.6rem 0.85rem' }}
                  >
                    {analyzedItem.type === 'song' ? (
                      <>
                        <option value="mp3">MP3 (Audio Extraction)</option>
                        <option value="m4a">M4A (AAC Audio)</option>
                        <option value="flac">FLAC (Lossless)</option>
                      </>
                    ) : (
                      <>
                        <option value="mp4">MP4 (H.264 standard)</option>
                        <option value="mkv">MKV (Lossless tracks)</option>
                        <option value="webm">WebM (VP9 codec)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Playlist Track list */}
            {analyzedItem.type === 'playlist' && analyzedItem.playlistItems && (
              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                background: 'rgba(0,0,0,0.1)'
              }}>
                <label className="label" style={{ fontSize: '0.78rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Playlist Tracks ({analyzedItem.playlistItems.length}):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {analyzedItem.playlistItems.map((track, i) => (
                    <div key={track.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text)',
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '4px'
                    }}>
                      <span>{i + 1}. {track.title}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{track.durationString}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.25rem',
              marginTop: '0.5rem'
            }}>
              <button 
                onClick={handleDownload} 
                className="btn btn-primary" 
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download size={16} />
                <span>
                  {analyzedItem.type === 'playlist' ? 'Download All Tracks' : `Download ${selectedFormat.toUpperCase()}`}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Active Downloads Section */}
      {queue.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-h)', fontWeight: 700 }}>
            Active Downloads ({queue.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {queue.map((item) => (
              <div key={item.id} className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '0.85rem 1.25rem',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md)'
              }}>
                <img 
                  src={item.thumbnail} 
                  alt="" 
                  style={{ width: '48px', height: '27px', objectFit: 'cover', borderRadius: '4px' }} 
                />
                
                <div style={{ flexGrow: 1, minWidth: '150px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-h)' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }} title={item.title}>
                      {item.title}
                    </span>
                    <span>{item.progress}%</span>
                  </div>
                  
                  <div className="progress-bar-track" style={{ height: '5px', marginTop: '0.35rem' }}>
                    <div 
                      className={`progress-bar-fill progress-shimmer-active`}
                      style={{ width: `${item.progress}%`, background: 'var(--accent)' }}
                    ></div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>{item.type.toUpperCase()} • {item.quality} ({item.format.toUpperCase()})</span>
                    <span>{item.speed} • ETA: {item.eta}</span>
                  </div>
                </div>

                <div>
                  <button 
                    onClick={() => handleCancelQueueItem(item.id)} 
                    className="btn-icon" 
                    style={{ width: '28px', height: '28px', color: 'var(--danger)' }}
                    title="Cancel download"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed Downloads History */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-h)', fontWeight: 700 }}>
            Completed Downloads ({history.length})
          </h3>
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory} 
              className="btn btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)'
              }}
            >
              <Trash2 size={12} />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="glass-card" style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            border: '1px dashed var(--glass-border)'
          }}>
            Your completed downloads will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((item) => (
              <div key={item.id} className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '0.85rem 1.25rem',
                background: 'var(--glass-bg)',
                borderRadius: 'var(--radius-md)'
              }}>
                <img 
                  src={item.thumbnail} 
                  alt="" 
                  style={{ width: '48px', height: '27px', objectFit: 'cover', borderRadius: '4px' }} 
                />

                <div style={{ flexGrow: 1, minWidth: '150px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-h)' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }} title={item.title}>
                      {item.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-accent" style={{ fontSize: '0.6rem', padding: '0.05rem 0.25rem' }}>
                      {item.type.toUpperCase()}
                    </span>
                    <span>{item.quality} • {item.format.toUpperCase()}</span>
                    <span>•</span>
                    <span>Finished: {item.completedAt ? new Date(item.completedAt).toLocaleTimeString() : 'Just now'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => triggerMockDownload(item)}
                    className="btn btn-secondary"
                    title="Save File to Disk again"
                    style={{
                      height: '32px',
                      padding: '0 0.75rem',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <FileDown size={12} />
                    <span>Save File</span>
                  </button>

                  <button 
                    onClick={() => handleRemoveHistoryItem(item.id)} 
                    className="btn-icon" 
                    style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
                    title="Remove entry"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default App;
