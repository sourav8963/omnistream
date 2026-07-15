import React, { useState } from 'react';
import { 
  Save, 
  Check, 
  Sliders, 
  Server
} from 'lucide-react';
import { storage, type Settings } from '../services/storage';

interface SettingsViewProps {
  onSettingsChange: (settings: Settings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    storage.saveSettings(settings);
    onSettingsChange(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const handleUpdateField = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const speedLimits = [
    { value: 0, label: 'Unlimited' },
    { value: 50, label: '50 MB/s' },
    { value: 20, label: '20 MB/s' },
    { value: 10, label: '10 MB/s' },
    { value: 5, label: '5 MB/s' },
    { value: 1, label: '1 MB/s' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      
      {/* Page Header - Matches Mockup */}
      <div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-h)', marginBottom: '0.35rem' }}>Settings</h1>
        <p style={{ color: 'var(--text)', fontSize: '0.92rem' }}>Customize your media separation engine, quality defaults, folder paths, and thread counts.</p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '2rem' }}>
        
        {/* Subtitle section */}
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="var(--accent)" />
          General Settings
        </h3>

        {/* Concurrency and Format Settings */}
        <div className="grid-2">
          {/* Max Concurrent Downloads */}
          <div className="input-group">
            <label className="label">Max Parallel Downloads (Threads)</label>
            <select 
              className="input"
              value={settings.maxConcurrent}
              onChange={(e) => handleUpdateField('maxConcurrent', parseInt(e.target.value))}
            >
              <option value="1">1 Thread (Sequential)</option>
              <option value="2">2 Threads</option>
              <option value="3">3 Threads (Recommended)</option>
              <option value="5">5 Threads (High Bandwidth)</option>
              <option value="10">10 Threads (Aggressive)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="label">Default Container Format</label>
            <select 
              className="input"
              value={settings.defaultFormat}
              onChange={(e) => handleUpdateField('defaultFormat', e.target.value)}
            >
              <option value="mp4">MP4 (Video Container)</option>
              <option value="mkv">MKV (Video Container)</option>
              <option value="webm">WEBM (Video Container)</option>
              <option value="mp3">MP3 (Audio Codec)</option>
              <option value="flac">FLAC (Audio Lossless)</option>
            </select>
          </div>
        </div>

        {/* Default Quality Rules */}
        <div className="grid-2">
          <div className="input-group">
            <label className="label">Default Video Resolution</label>
            <select 
              className="input"
              value={settings.defaultVideoQuality}
              onChange={(e) => handleUpdateField('defaultVideoQuality', e.target.value)}
            >
              <option value="2160p">2160p (4K UHD)</option>
              <option value="1440p">1440p (QHD)</option>
              <option value="1080p">1080p (Full HD)</option>
              <option value="720p">720p (HD)</option>
              <option value="480p">480p (SD)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="label">Default Audio Bitrate</label>
            <select 
              className="input"
              value={settings.defaultAudioQuality}
              onChange={(e) => handleUpdateField('defaultAudioQuality', e.target.value)}
            >
              <option value="320kbps">320 kbps (High Quality)</option>
              <option value="192kbps">192 kbps (Standard)</option>
              <option value="128kbps">128 kbps (Optimized)</option>
              <option value="flac">FLAC (Lossless 24-bit)</option>
            </select>
          </div>
        </div>

        {/* Output Path Folder */}
        <div className="input-group">
          <label className="label">Download Directory</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="input"
              value={settings.defaultFolder}
              onChange={(e) => handleUpdateField('defaultFolder', e.target.value)}
              style={{ flexGrow: 1 }}
            />
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0 1.5rem', borderRadius: 'var(--radius-default)' }}
              onClick={() => alert("Directory browser requires desktop wrappers (Phase 2). Path updated manually.")}
            >
              Browse
            </button>
          </div>
        </div>

        {/* Bandwidth Limiter */}
        <div className="input-group">
          <label className="label">Bandwidth Cap Limit (Speed Limit)</label>
          <select 
            className="input"
            value={settings.speedLimit}
            onChange={(e) => handleUpdateField('speedLimit', parseInt(e.target.value))}
          >
            {speedLimits.map((limit) => (
              <option key={limit.value} value={limit.value}>
                {limit.label}
              </option>
            ))}
          </select>
        </div>

        {/* Appearance Settings - Matches Mockup exactly */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-h)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Appearance
          </h3>
          <div className="input-group">
            <label className="label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Theme</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {([
                { id: 'dark', label: 'Crimson Noir' },
                { id: 'dark-classic', label: 'Dark Mode' },
                { id: 'light', label: 'Light Mode' }
              ] as const).map((themeOpt) => {
                const isActive = settings.theme === themeOpt.id;
                return (
                  <button
                    key={themeOpt.id}
                    type="button"
                    onClick={() => handleUpdateField('theme', themeOpt.id)}
                    style={{
                      flexGrow: 1,
                      padding: '0.85rem 1.5rem',
                      borderRadius: 'var(--radius-default)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--accent)' : 'var(--glass-border)',
                      background: isActive ? 'var(--accent-bg)' : 'var(--glass-bg)',
                      color: isActive ? 'var(--text-h)' : 'var(--text)',
                      fontWeight: 650,
                      cursor: 'pointer',
                      boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                      transition: 'all var(--transition-normal)'
                    }}
                  >
                    {themeOpt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mock API Integration details */}
        <div className="glass-card" style={{
          background: 'var(--info-bg)',
          borderColor: 'var(--accent-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <Server size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
          <div>
            <h4 style={{ color: 'var(--text-h)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>Engine API Integrations</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: '1.4' }}>
              For testing the MVP, download loops utilize client-side worker routines. Bandwidth caps will scale down download ticks. Custom paths will change output names inside mock headers.
            </p>
          </div>
        </div>

        {/* Save button & success status toast */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderTop: '1px solid var(--border)',
          paddingTop: '1.5rem',
          marginTop: '0.5rem'
        }}>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            style={{ padding: '0.75rem 2rem' }}
          >
            <Save size={18} />
            Save Configuration
          </button>

          {savedSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--success)',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: 'var(--success-bg)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(78, 222, 163, 0.2)'
            }}>
              <Check size={16} />
              Settings Saved Successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
