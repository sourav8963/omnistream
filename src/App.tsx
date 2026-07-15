import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { PlaylistView } from './components/PlaylistView';
import { QueueView } from './components/QueueView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { storage, type Settings } from './services/storage';
import { urlAnalyzer, type AnalysisResult } from './services/urlAnalyzer';

function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [analyzedItem, setAnalyzedItem] = useState<AnalysisResult | null>(null);
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());

  // Apply theme class when settings or theme updates
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark-theme');
    } else if (settings.theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark-theme');
    } else {
      // System choice
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.setAttribute('data-theme', 'dark');
        root.classList.add('dark-theme');
      } else {
        root.setAttribute('data-theme', 'light');
        root.classList.remove('dark-theme');
      }
    }
  }, [settings.theme]);

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  const toggleTheme = () => {
    const nextTheme: 'dark' | 'light' = settings.theme === 'dark' ? 'light' : 'dark';
    const updated: Settings = { ...settings, theme: nextTheme };
    storage.saveSettings(updated);
    setSettings(updated);
  };

  const handleAnalyzeSuccess = (result: AnalysisResult) => {
    setAnalyzedItem(result);
  };

  const handleClearAnalyzed = () => {
    setAnalyzedItem(null);
  };

  const handleReAnalyzePlaylist = async (url: string) => {
    setActiveTab('home');
    try {
      const result = await urlAnalyzer.analyze(url);
      setAnalyzedItem(result);
      if (result.type === 'playlist' || result.type === 'podcast') {
        setActiveTab('playlist');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to re-load playlist.');
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            analyzedItem={analyzedItem}
            onAnalyzeSuccess={handleAnalyzeSuccess}
            onClearAnalyzed={handleClearAnalyzed}
            setActiveTab={setActiveTab}
          />
        );
      case 'playlist':
        return (
          <PlaylistView
            playlist={analyzedItem}
            onClear={handleClearAnalyzed}
            setActiveTab={setActiveTab}
          />
        );
      case 'queue':
        return <QueueView />;
      case 'history':
        return (
          <HistoryView
            onReAnalyzePlaylist={handleReAnalyzePlaylist}
          />
        );
      case 'settings':
        return <SettingsView onSettingsChange={handleSettingsChange} />;
      default:
        return (
          <HomeView
            analyzedItem={analyzedItem}
            onAnalyzeSuccess={handleAnalyzeSuccess}
            onClearAnalyzed={handleClearAnalyzed}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  const isPlaylistAnalyzed = analyzedItem !== null && (analyzedItem.type === 'playlist' || analyzedItem.type === 'podcast');

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        playlistAnalyzed={isPlaylistAnalyzed}
        theme={settings.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : settings.theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Dashboard */}
      <main className="main-content">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;
