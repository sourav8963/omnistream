import React, { useState } from 'react';
import { 
  Search, 
  Music, 
  Video, 
  Rss, 
  Link2,
  ArrowRight,
  Sparkles,
  Info,
  Download,
  X,
  Languages
} from 'lucide-react';
import { urlAnalyzer, type AnalysisResult } from '../services/urlAnalyzer';
import { downloadManager } from '../services/downloadManager';

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.002 3.002 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface HomeViewProps {
  analyzedItem: AnalysisResult | null;
  onAnalyzeSuccess: (result: AnalysisResult) => void;
  onClearAnalyzed: () => void;
  setActiveTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  analyzedItem,
  onAnalyzeSuccess,
  onClearAnalyzed,
  setActiveTab,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single file config selections
  const [selectedQualityId, setSelectedQualityId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedSubtitles, setSelectedSubtitles] = useState<string[]>([]);
  const [thumbnailDownloadLoading, setThumbnailDownloadLoading] = useState(false);

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
      
      // Auto-populate default configurations for single files
      if (result.type !== 'playlist' && result.type !== 'podcast') {
        const defaultQuality = result.qualities[0];
        if (defaultQuality) {
          setSelectedQualityId(defaultQuality.id);
          setSelectedFormat(defaultQuality.container || 'mp4');
        }
        setSelectedSubtitles([]);
      } else {
        // Go to playlist preview tab
        setActiveTab('playlist');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze URL.');
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
    
    // Add to download queue
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

    // Go to Download Manager
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
      // Create a dummy image download
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

  const presets = [
    {
      label: 'YouTube Single Video',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      icon: Youtube,
      color: '#ef4444'
    },
    {
      label: 'YouTube Playlist (Batch)',
      url: 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn5n4e05b5f884bf05b5a265',
      icon: Youtube,
      color: '#ef4444'
    },
    {
      label: 'SoundCloud Track',
      url: 'https://soundcloud.com/retrofuture/synthwave-sunset',
      icon: Music,
      color: '#f97316'
    },
    {
      label: 'Podcast RSS Feed',
      url: 'https://feeds.podcast.com/lexicon-ai.xml',
      icon: Rss,
      color: '#3b82f6'
    },
    {
      label: 'Direct .MP4 Link',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
      icon: Link2,
      color: '#10b981'
    }
  ];

  const platforms = [
    { name: 'YouTube', type: 'Video & Playlists', icon: Youtube, desc: 'Highest available quality, HDR, and audio separations' },
    { name: 'SoundCloud', type: 'High Quality Audio', icon: Music, desc: 'Lossless FLAC, WAV, and high-rate MP3 streams' },
    { name: 'Vimeo', type: 'HQ Cinematics', icon: Video, desc: 'Pro cinematic content, up to 4K resolutions' },
    { name: 'RSS Podcasts', type: 'Audio/Video Feeds', icon: Rss, desc: 'Download entire seasons, episodes, and artwork' },
  ];

  // Selected quality details for info box
  const selectedQualityDetails = analyzedItem?.qualities.find(q => q.id === selectedQualityId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Hero Header */}
      <div className="animate-float" style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-bg)',
          color: 'var(--accent)',
          fontSize: '0.85rem',
          fontWeight: 600,
          border: '1px solid var(--accent-border)',
          marginBottom: '1rem'
        }}>
          <Sparkles size={14} />
          <span>VOTED #1 MEDIA ENGINE PROTOTYPE</span>
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '0.75rem' }}>
          Streamline Your <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Downloads</span>
        </h1>
        <p style={{ color: 'var(--text)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
          Download video, playlists, sound clips, and audiobooks in pristine quality.
          Completely organized, fast, and secure.
        </p>
      </div>

      {/* Large Input Paste Box */}
      <div className="glass-card" style={{
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '50%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }}></div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={22} color="var(--accent)" />
          Paste Link to Start
        </h2>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          position: 'relative',
          zIndex: 1
        }}>
          <input
            type="text"
            className="input"
            placeholder="Paste YouTube, SoundCloud, Vimeo, Podcast URL or direct file link here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            style={{
              flexGrow: 1,
              padding: '1.1rem 1.5rem',
              fontSize: '1.05rem',
              borderRadius: 'var(--radius-md)',
              borderWidth: '1.5px'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleAnalyze()}
            disabled={loading}
            style={{
              padding: '0 2.25rem',
              fontSize: '1.05rem',
              minWidth: '150px'
            }}
          >
            {loading ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'progress-animation 1s linear infinite'
              }}></div>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            fontSize: '0.9rem',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'float 0.3s ease'
          }}>
            <Info size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* SINGLE FILE CONFIGURATION CARD CONTAINER */}
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
          {/* Close Card Button */}
          <button 
            onClick={onClearAnalyzed}
            className="btn-icon"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '32px',
              height: '32px',
              borderRadius: '50%'
            }}
            title="Clear analyzed result"
          >
            <X size={16} />
          </button>

          {/* Video / Audio Thumbnail */}
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
            <button
              onClick={handleDownloadThumbnail}
              disabled={thumbnailDownloadLoading}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem' }}
            >
              {thumbnailDownloadLoading ? 'Saving...' : 'Download HD Artwork'}
            </button>
          </div>

          {/* Details / Configurations */}
          <div style={{ flexGrow: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>{analyzedItem.platform}</span>
                {analyzedItem.durationString && (
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Duration: {analyzedItem.durationString}</span>
                )}
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-h)', fontWeight: 800, paddingRight: '2rem' }}>
                {analyzedItem.title}
              </h3>
              {analyzedItem.artist && (
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginTop: '0.15rem' }}>
                  By {analyzedItem.artist}
                </p>
              )}
            </div>

            {/* Quality & Format Options Row */}
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

            {/* Subtitles Download Toggle List */}
            {analyzedItem.subtitles && analyzedItem.subtitles.length > 0 && (
              <div>
                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Languages size={15} color="var(--accent)" />
                  Extract Subtitles (Optional)
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

            {/* Selected Info Summary & Action Box */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedQualityDetails && (
                  <div>
                    Codec: <strong>{selectedQualityDetails.codec || 'AVC'}</strong> • Container: <strong>{selectedFormat.toUpperCase()}</strong> • Size: <strong>{formatSize(selectedQualityDetails.sizeBytes)}</strong>
                  </div>
                )}
              </div>

              <button
                onClick={handleQueueDownload}
                className="btn btn-primary"
                style={{ padding: '0.7rem 1.75rem', fontSize: '0.92rem', display: 'flex', gap: '0.5rem' }}
              >
                <Download size={16} />
                <span>Add to Download Queue</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Preset Buttons for Easy Demo Testing */}
      <div>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-h)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Quick Demo Presets (Click to test instantly)
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {presets.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <button
                key={index}
                onClick={() => handlePresetClick(preset.url)}
                className="btn btn-secondary"
                disabled={loading}
                style={{
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <Icon size={16} style={{ color: preset.color }} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Platforms */}
      <div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-h)', marginBottom: '1.25rem' }}>
          Supported Media Providers
        </h3>
        <div className="grid-2">
          {platforms.map((platform, idx) => {
            const Icon = platform.icon;
            return (
              <div key={idx} className="glass-card" style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{
                  background: 'var(--accent-bg)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent)'
                }}>
                  <Icon size={28} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-h)', marginBottom: '0.25rem' }}>{platform.name}</h4>
                  <span className="badge badge-accent" style={{ marginBottom: '0.5rem', fontSize: '0.65rem' }}>{platform.type}</span>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: '1.4' }}>{platform.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
