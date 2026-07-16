import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Download, 
  X, 
  Languages,
  Zap,
  Play,
  Pause,
  FolderOpen
} from 'lucide-react';
import { urlAnalyzer, type AnalysisResult } from '../services/urlAnalyzer';
import { downloadManager, type QueueItem } from '../services/downloadManager';

interface HomeViewProps {
  analyzedItem: AnalysisResult | null;
  onAnalyzeSuccess: (result: AnalysisResult) => void;
  onClearAnalyzed: () => void;
  setActiveTab: (tab: string) => void;
}

// Brand SVG Icons for Mockup Fidelity
const YoutubeSvg = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.002 3.002 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const SoundcloudSvg = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M1.77 12.38a1.27 1.27 0 0 0 .33.88l1.45 1.45a.44.44 0 0 0 .62 0l1.45-1.45a1.28 1.28 0 0 0 0-1.76L4.17 10.05a.44.44 0 0 0-.62 0L2.1 11.5a1.27 1.27 0 0 0-.33.88zm4.43.88l1.45 1.45a.44.44 0 0 0 .62 0l1.45-1.45a1.28 1.28 0 0 0 0-1.76L8.27 10.05a.44.44 0 0 0-.62 0L6.2 11.5a1.27 1.27 0 0 0 0 1.76zm4.43.88l1.45 1.45a.44.44 0 0 0 .62 0l1.45-1.45a1.28 1.28 0 0 0 0-1.76L12.37 10.05a.44.44 0 0 0-.62 0L10.3 11.5a1.27 1.27 0 0 0 0 1.76zm6.2-.88v-4.4a3.1 3.1 0 0 0-3.1-3.1 3.1 3.1 0 0 0-3.1 3.1v4.4a3.1 3.1 0 0 0 6.2 0zm5.4-1.76a2.2 2.2 0 0 0-2.2-2.2v4.4a2.2 2.2 0 0 0 2.2-2.2z"/>
  </svg>
);

const VimeoSvg = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M22.396 7.111c-.085 1.897-1.417 4.5-3.992 7.81-2.664 3.428-4.922 5.143-6.776 5.143-1.153 0-2.128-1.064-2.924-3.193l-1.597-5.836c-.596-2.18-1.24-3.27-1.928-3.27-.148 0-.663.308-1.547.925l-.927-1.19c.97-.852 1.93-1.69 2.87-2.51 1.28-1.1 2.227-1.69 2.836-1.77 1.418-.18 2.287.785 2.61 2.896l1.32 5.253c.355 1.58.742 2.37 1.164 2.37.33 0 .843-.522 1.54-1.564.698-1.042 1.077-1.84 1.14-2.397.13-.984-.25-1.477-1.137-1.477-.417 0-.89.096-1.424.288 1.07-3.486 3.107-5.187 6.108-5.102 2.203.062 3.25 1.48 3.14 4.254z"/>
  </svg>
);

const TwitchSvg = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

const TiktokSvg = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12.525.02c1.31 0 2.568.27 3.716.757.074.887.41 1.7.94 2.375.76.966 1.83 1.636 3.05 1.866v3.42a8.55 8.55 0 0 1-3.99-1.2v7.195a6.43 6.43 0 1 1-7.14-6.386v3.435a2.99 2.99 0 1 0 3.71 2.95V0h3.714Z"/>
  </svg>
);

const RssSvg = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11a9 9 0 0 1 9 9" />
    <path d="M4 4a16 16 0 0 1 16 16" />
    <circle cx="5" cy="19" r="1" fill="currentColor" />
  </svg>
);

export const HomeView: React.FC<HomeViewProps> = ({
  analyzedItem,
  onAnalyzeSuccess,
  onClearAnalyzed,
  setActiveTab,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Platforms details modal
  const [showPlatformsModal, setShowPlatformsModal] = useState(false);

  // Single file config selections
  const [selectedQualityId, setSelectedQualityId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedSubtitles, setSelectedSubtitles] = useState<string[]>([]);
  const [thumbnailDownloadLoading, setThumbnailDownloadLoading] = useState(false);

  // Recent activity list
  const [activeQueue, setActiveQueue] = useState<QueueItem[]>([]);
  
  // Interactive mock activities
  const [mockActivities, setMockActivities] = useState([
    {
      id: 'mock-1',
      title: 'Cyberpunk_2077_Official_Trailer_4K.mp4',
      progress: 82,
      sizeText: '4.2 GB of 5.1 GB',
      speedText: '24.5 MB/s',
      status: 'downloading' as const,
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=60'
    },
    {
      id: 'mock-2',
      title: 'Lex_Fridman_Podcast_Elon_Musk.mp3',
      progress: 75,
      sizeText: '158 MB of 210 MB',
      speedText: 'INTERRUPTED',
      status: 'paused' as const,
      thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&auto=format&fit=crop&q=60'
    },
    {
      id: 'mock-3',
      title: 'Our_Planet_S02E01_HDR_H265.mkv',
      progress: 100,
      sizeText: '12.8 GB',
      speedText: 'FINISHED 2M AGO',
      status: 'completed' as const,
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&auto=format&fit=crop&q=60'
    }
  ]);

  useEffect(() => {
    // Monitor the active queue for enqueued items
    const unsubscribe = downloadManager.subscribe((queue) => {
      setActiveQueue(queue.slice(0, 3)); // show top 3
    });
    return () => unsubscribe();
  }, []);

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || url;
    if (!targetUrl.trim()) {
      setError('Please paste a link first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await urlAnalyzer.analyze(targetUrl);
      onAnalyzeSuccess(result);
      
      if (result.type !== 'playlist' && result.type !== 'podcast') {
        const defaultQuality = result.qualities[0];
        if (defaultQuality) {
          setSelectedQualityId(defaultQuality.id);
          setSelectedFormat(defaultQuality.container || 'mp4');
        }
        setSelectedSubtitles([]);
      } else {
        setActiveTab('playlist');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze URL.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetUrl: string) => {
    setUrl(presetUrl);
    handleAnalyze(presetUrl);
  };

  const handleQueueDownload = () => {
    if (!analyzedItem) return;
    const qualityObj = analyzedItem.qualities.find(q => q.id === selectedQualityId) || analyzedItem.qualities[0];
    
    downloadManager.addToQueue([{
      title: analyzedItem.title,
      artist: analyzedItem.artist,
      thumbnail: analyzedItem.thumbnail,
      quality: qualityObj ? qualityObj.label : '1080p',
      format: selectedFormat || 'mp4',
      totalBytes: qualityObj ? qualityObj.sizeBytes : 150000000,
      url: analyzedItem.url,
      platform: analyzedItem.platform,
    }]);

    setActiveTab('queue');
  };

  const toggleSubtitle = (subCode: string) => {
    setSelectedSubtitles(prev => 
      prev.includes(subCode) 
        ? prev.filter(c => c !== subCode) 
        : [...prev, subCode]
    );
  };

  const handleDownloadThumbnail = () => {
    if (!analyzedItem) return;
    setThumbnailDownloadLoading(true);
    
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = analyzedItem.thumbnail;
      link.target = '_blank';
      link.download = `${analyzedItem.title.replace(/[/\\?%*:|"<>\s]/g, '_')}_thumbnail.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setThumbnailDownloadLoading(false);
    }, 1000);
  };

  const formatSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  // Mock platforms from design mockup
  const quickPlatforms = [
    { name: 'YouTube', icon: YoutubeSvg, color: '#ef4444', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { name: 'SoundCloud', icon: SoundcloudSvg, color: '#f97316', url: 'https://soundcloud.com/retrofuture/synthwave-sunset' },
    { name: 'Vimeo', icon: VimeoSvg, color: '#06b6d4', url: 'https://vimeo.com/8395230' },
    { name: 'Twitch', icon: TwitchSvg, color: '#a855f7', url: 'https://twitch.tv/ninja/clip/direct' },
    { name: 'TikTok', icon: TiktokSvg, color: '#ff0050', url: 'https://tiktok.com/@creator/video/direct' },
    { name: 'RSS', icon: RssSvg, color: '#3b82f6', url: 'https://feeds.podcast.com/lexicon-ai.xml' },
  ];

  const presets = [
    { label: 'YouTube Single Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'YouTube Playlist (Batch)', url: 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn5n4e05b5f884bf05b5a265' },
    { label: 'SoundCloud Track', url: 'https://soundcloud.com/retrofuture/synthwave-sunset' },
    { label: 'Podcast RSS Feed', url: 'https://feeds.podcast.com/lexicon-ai.xml' }
  ];

  const selectedQualityDetails = analyzedItem?.qualities.find(q => q.id === selectedQualityId);

  // If there are no real items in the queue, show the exact mockup items for visual fidelity
  const renderRecentActivityItems = () => {
    if (activeQueue.length > 0) {
      return activeQueue.map((item) => {
        const progressPercent = Math.round((item.downloadedBytes / item.totalBytes) * 100);
        return (
          <div key={item.id} className="glass-card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '0.85rem 1.25rem',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-md)'
          }}>
            <img src={item.thumbnail} alt="" style={{ width: '48px', height: '27px', objectFit: 'cover', borderRadius: '4px' }} />
            <div style={{ flexGrow: 1, minWidth: '150px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-h)' }}>
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }} title={item.title}>
                  {item.title}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="progress-bar-track" style={{ height: '5px', marginTop: '0.35rem' }}>
                <div 
                  className={`progress-bar-fill ${item.status === 'downloading' ? 'progress-shimmer-active' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                <span>{formatSize(item.downloadedBytes)} / {formatSize(item.totalBytes)}</span>
                {item.status === 'downloading' && <span>{(item.speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s</span>}
                {item.status === 'paused' && <span style={{ color: 'var(--warning)' }}>INTERRUPTED</span>}
                {item.status === 'completed' && <span style={{ color: 'var(--success)' }}>FINISHED</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {item.status === 'downloading' ? (
                <button onClick={() => downloadManager.pauseItem(item.id)} className="btn-icon" style={{ width: '28px', height: '28px' }}><Pause size={12} /></button>
              ) : item.status === 'paused' ? (
                <button onClick={() => downloadManager.resumeItem(item.id)} className="btn-icon" style={{ width: '28px', height: '28px' }}><Play size={12} /></button>
              ) : null}
              <button onClick={() => downloadManager.cancelItem(item.id)} className="btn-icon" style={{ width: '28px', height: '28px', color: 'var(--danger)' }}><X size={12} /></button>
            </div>
          </div>
        );
      });
    }

    if (mockActivities.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '1.5rem', 
          background: 'var(--glass-bg)', 
          borderRadius: 'var(--radius-md)', 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem',
          border: '1px dashed var(--glass-border)'
        }}>
          No recent activity items.
        </div>
      );
    }

    return mockActivities.map((item) => (
      <div key={item.id} className="glass-card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '0.85rem 1.25rem',
        background: 'var(--glass-bg)',
        borderRadius: 'var(--radius-md)'
      }}>
        <img src={item.thumbnail} alt="" style={{ width: '48px', height: '27px', objectFit: 'cover', borderRadius: '4px' }} />
        <div style={{ flexGrow: 1, minWidth: '150px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-h)' }}>
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }} title={item.title}>
              {item.title}
            </span>
            <span>{item.progress}%</span>
          </div>
          <div className="progress-bar-track" style={{ height: '5px', marginTop: '0.35rem' }}>
            <div 
              className={`progress-bar-fill ${item.status === 'downloading' ? 'progress-shimmer-active' : ''}`}
              style={{ width: `${item.progress}%` }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            <span>{item.sizeText}</span>
            <span style={{ color: item.status === 'paused' ? 'var(--danger)' : item.status === 'completed' ? 'var(--success)' : 'inherit' }}>
              {item.speedText}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {item.status === 'downloading' ? (
            <button 
              onClick={() => setMockActivities(prev => prev.map(m => m.id === item.id ? { ...m, status: 'paused', speedText: 'INTERRUPTED' } : m))} 
              className="btn-icon" 
              style={{ width: '28px', height: '28px' }}
            >
              <Pause size={12} />
            </button>
          ) : item.status === 'paused' ? (
            <button 
              onClick={() => setMockActivities(prev => prev.map(m => m.id === item.id ? { ...m, status: 'downloading', speedText: '24.5 MB/s' } : m))} 
              className="btn-icon" 
              style={{ width: '28px', height: '28px' }}
            >
              <Play size={12} />
            </button>
          ) : null}
          {item.status === 'completed' ? (
            <>
              <button onClick={() => alert("Simulated folder open")} className="btn-icon" style={{ width: '28px', height: '28px' }}><FolderOpen size={12} /></button>
              <button 
                onClick={() => setMockActivities(prev => prev.filter(m => m.id !== item.id))} 
                className="btn-icon" 
                style={{ width: '28px', height: '28px', color: 'var(--danger)' }}
                title="Remove activity item"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setMockActivities(prev => prev.filter(m => m.id !== item.id))} 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', color: 'var(--danger)' }}
              title="Cancel activity item"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Search Header - Mockup styling */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: '0.5rem', color: 'var(--text-h)' }}>
          Stream Any Media
        </h1>
        <p style={{ color: 'var(--text)', fontSize: '0.95rem', maxWidth: '550px', margin: '0 auto', lineHeight: '1.5' }}>
          Input your source URL below. OmniStream analyzes and optimizes your media for the ultimate viewing experience.
        </p>
      </div>

      {/* Large Input Paste Box */}
      <div className="glass-card" style={{
        padding: '1.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="input"
            placeholder="https://www.youtube.com/watch?v=.."
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
              padding: '0.85rem 1.25rem',
              fontSize: '1rem',
              borderRadius: 'var(--radius-default)'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleAnalyze()}
            disabled={loading}
            style={{
              padding: '0 2rem',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--accent)'
            }}
          >
            {loading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'progress-animation 1s linear infinite'
              }}></div>
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
            marginTop: '1rem',
            padding: '0.75rem 1.15rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            border: '1px solid rgba(255, 180, 171, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Info size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* SINGLE FILE CONFIGURATION CARD */}
      {analyzedItem && analyzedItem.type !== 'playlist' && analyzedItem.type !== 'podcast' && (
        <div className="glass-card animate-float" style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          borderColor: 'var(--accent-border)',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          position: 'relative'
        }}>
          <button 
            onClick={onClearAnalyzed}
            className="btn-icon"
            style={{ position: 'absolute', top: '1rem', right: '1rem', width: '32px', height: '32px', borderRadius: '50%' }}
            title="Clear analyzed result"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <img src={analyzedItem.thumbnail} alt="" style={{ width: '240px', height: '135px', objectFit: 'cover', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }} />
            <button
              onClick={handleDownloadThumbnail}
              disabled={thumbnailDownloadLoading}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem' }}
            >
              {thumbnailDownloadLoading ? 'Saving...' : 'Download HD Artwork'}
            </button>
          </div>

          <div style={{ flexGrow: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>{analyzedItem.platform}</span>
                {analyzedItem.durationString && (
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Duration: {analyzedItem.durationString}</span>
                )}
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-h)', fontWeight: 800 }}>{analyzedItem.title}</h3>
              {analyzedItem.artist && <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginTop: '0.15rem' }}>By {analyzedItem.artist}</p>}
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="label">Preferred Quality</label>
                <select 
                  className="input"
                  value={selectedQualityId}
                  onChange={(e) => {
                    setSelectedQualityId(e.target.value);
                    const qObj = analyzedItem.qualities.find(q => q.id === e.target.value);
                    if (qObj) setSelectedFormat(qObj.container || 'mp4');
                  }}
                  style={{ fontSize: '0.9rem', padding: '0.6rem 0.85rem' }}
                >
                  {analyzedItem.qualities.map((quality) => (
                    <option key={quality.id} value={quality.id}>
                      {quality.label} ({formatSize(quality.sizeBytes)})
                    </option>
                  ))}
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
                  <option value="mp4">MP4 (Standard H.264)</option>
                  <option value="mkv">MKV (lossless tracks)</option>
                  <option value="webm">WebM (VP9 codec)</option>
                  <option value="mp3">MP3 (Audio extraction)</option>
                  <option value="flac">FLAC (Audio Lossless)</option>
                </select>
              </div>
            </div>

            {analyzedItem.subtitles && analyzedItem.subtitles.length > 0 && (
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Languages size={15} color="var(--accent)" />
                  Extract Subtitles
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {analyzedItem.subtitles.map((sub) => {
                    const isChecked = selectedSubtitles.includes(sub.code);
                    return (
                      <button
                        key={sub.code}
                        onClick={() => toggleSubtitle(sub.code)}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: isChecked ? 'var(--accent)' : 'var(--glass-border)',
                          background: isChecked ? 'var(--accent-bg)' : 'transparent',
                          color: isChecked ? 'var(--accent)' : 'var(--text)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedQualityDetails && (
                  <div>
                    Codec: <strong>{selectedQualityDetails.codec || 'AVC'}</strong> • Container: <strong>{selectedFormat.toUpperCase()}</strong> • Size: <strong>{formatSize(selectedQualityDetails.sizeBytes)}</strong>
                  </div>
                )}
              </div>
              <button onClick={handleQueueDownload} className="btn btn-primary" style={{ padding: '0.7rem 1.75rem', fontSize: '0.92rem', display: 'flex', gap: '0.5rem' }}>
                <Download size={16} />
                <span>Add to Download Queue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Platforms (Matches Mockup) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-h)', fontWeight: 600 }}>Quick Platforms</h3>
          <span 
            onClick={() => setShowPlatformsModal(true)}
            style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            View All
          </span>
        </div>
        
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {quickPlatforms.map((platform, idx) => {
            const Icon = platform.icon;
            return (
              <div 
                key={idx} 
                className="glass-card" 
                onClick={() => handlePresetClick(platform.url)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: 'var(--glass-bg)',
                  borderColor: 'var(--glass-border)'
                }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: platform.color,
                  boxShadow: 'inset 0 0 10px rgba(255,255,255,0.02)'
                }}>
                  <Icon />
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-h)' }}>{platform.name}</h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity (Matches Mockup) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-h)', fontWeight: 600 }}>Recent Activity</h3>
          {activeQueue.length > 0 && (
            <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
              {activeQueue.filter(q => q.status === 'downloading').length} Active Tasks
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {renderRecentActivityItems()}
        </div>
      </div>

      {/* Preset Demo Options for user review */}
      <div>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-h)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Debug Preset Toggles
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePresetClick(preset.url)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Supported Platforms Modal */}
      {showPlatformsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="glass-card animate-float" style={{
            width: '100%',
            maxWidth: '650px',
            background: 'var(--glass-bg-dense, rgba(20, 10, 15, 0.85))',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setShowPlatformsModal(false)}
              className="btn-icon"
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '32px', height: '32px', borderRadius: '50%' }}
              title="Close modal"
            >
              <X size={16} />
            </button>

            <h2 style={{ fontSize: '1.6rem', color: 'var(--text-h)', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={22} color="var(--accent)" />
              All Supported Platforms & Formats
            </h2>
            <p style={{ color: 'var(--text)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              OmniStream supports parsing, separation, and caching for the following media services:
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxHeight: '380px',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}>
              {[
                { name: 'YouTube', type: 'Videos & Playlists', details: 'Supports resolutions up to 8K/4K/1080p, audio separations, and batch playlist queues.' },
                { name: 'SoundCloud', type: 'Tracks & Playlists', details: 'Extracts lossy or lossless stereo tracks, including high quality (320kbps MP3, AAC, FLAC).' },
                { name: 'Vimeo', type: 'Single Videos', details: 'Supports full-resolution video streams up to 4K and multi-language closed captions.' },
                { name: 'Twitch', type: 'Clips & Streams', details: 'Extracts broadcasting clips and game highlights with direct server latency detection.' },
                { name: 'TikTok', type: 'Short Form Videos', details: 'Directly parses portrait MP4 files and background audio/music components.' },
                { name: 'Podcast RSS Feeds', type: 'Audio Episodes', details: 'Parses any valid XML podcast feed to display episodes, descriptions, and audio streams.' },
                { name: 'Direct Links', type: 'Audio & Video files', details: 'Accepts URLs ending with .mp4, .mkv, .mp3, .webm, .flac, .m4a, or containing query tokens.' }
              ].map((platform, idx) => (
                <div key={idx} style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--text-h)', fontSize: '0.95rem' }}>{platform.name}</strong>
                    <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>{platform.type}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text)', margin: 0, lineHeight: '1.4' }}>{platform.details}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button onClick={() => setShowPlatformsModal(false)} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
