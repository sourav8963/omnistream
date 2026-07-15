export interface Settings {
  theme: 'system' | 'dark' | 'light';
  defaultFolder: string;
  defaultVideoQuality: string;
  defaultAudioQuality: string;
  defaultFormat: string;
  maxConcurrent: number;
  speedLimit: number; // in MB/s, 0 for unlimited
}

export interface HistoryItem {
  id: string;
  title: string;
  url: string;
  platform: string;
  thumbnail: string;
  quality: string;
  format: string;
  sizeBytes: number;
  durationString: string;
  downloadedAt: string;
  isFavorite: boolean;
  artist?: string;
  album?: string;
}

export interface PinnedPlaylist {
  url: string;
  title: string;
  platform: string;
  thumbnail: string;
  itemCount: number;
  pinnedAt: string;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  defaultFolder: 'C:\\Users\\LORD\\Downloads\\OmniStream',
  defaultVideoQuality: '1080p',
  defaultAudioQuality: '320kbps',
  defaultFormat: 'mp4',
  maxConcurrent: 3,
  speedLimit: 0,
};

export const storage = {
  getSettings(): Settings {
    try {
      const stored = localStorage.getItem('omnistream_settings');
      if (!stored) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Settings): void {
    localStorage.setItem('omnistream_settings', JSON.stringify(settings));
  },

  getHistory(): HistoryItem[] {
    try {
      const stored = localStorage.getItem('omnistream_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveHistory(history: HistoryItem[]): void {
    localStorage.setItem('omnistream_history', JSON.stringify(history));
  },

  addHistoryItem(item: Omit<HistoryItem, 'downloadedAt' | 'isFavorite'>): HistoryItem {
    const history = this.getHistory();
    const newItem: HistoryItem = {
      ...item,
      downloadedAt: new Date().toISOString(),
      isFavorite: false,
    };
    // Prevent duplicates in history list by removing old one if exists
    const filtered = history.filter((h) => h.url !== item.url || h.quality !== item.quality);
    this.saveHistory([newItem, ...filtered]);
    return newItem;
  },

  toggleFavorite(id: string): HistoryItem[] {
    const history = this.getHistory();
    const updated = history.map((item) => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    this.saveHistory(updated);
    return updated;
  },

  removeHistoryItem(id: string): HistoryItem[] {
    const history = this.getHistory();
    const updated = history.filter((item) => item.id !== id);
    this.saveHistory(updated);
    return updated;
  },

  getPinnedPlaylists(): PinnedPlaylist[] {
    try {
      const stored = localStorage.getItem('omnistream_pinned_playlists');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  savePinnedPlaylists(playlists: PinnedPlaylist[]): void {
    localStorage.setItem('omnistream_pinned_playlists', JSON.stringify(playlists));
  },

  togglePinPlaylist(playlist: Omit<PinnedPlaylist, 'pinnedAt'>): PinnedPlaylist[] {
    const pinned = this.getPinnedPlaylists();
    const exists = pinned.find((p) => p.url === playlist.url);
    let updated: PinnedPlaylist[];
    if (exists) {
      updated = pinned.filter((p) => p.url !== playlist.url);
    } else {
      const newPin: PinnedPlaylist = {
        ...playlist,
        pinnedAt: new Date().toISOString(),
      };
      updated = [newPin, ...pinned];
    }
    this.savePinnedPlaylists(updated);
    return updated;
  },
};
