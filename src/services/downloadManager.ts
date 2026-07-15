import { storage } from './storage';

export interface QueueItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  thumbnail: string;
  quality: string;
  format: string;
  totalBytes: number;
  downloadedBytes: number;
  status: 'downloading' | 'waiting' | 'completed' | 'failed' | 'paused';
  speedBytesPerSec: number;
  etaSeconds: number;
  url: string;
  platform: string;
  addedAt: string;
}

type QueueListener = (items: QueueItem[]) => void;
type SpeedListener = (speedSec: number) => void;

let queue: QueueItem[] = [];
const listeners = new Set<QueueListener>();
const speedListeners = new Set<SpeedListener>();
let intervalId: ReturnType<typeof setInterval> | null = null;

// Store historical speeds for the graph (last 30 ticks)
let speedHistory: number[] = Array(30).fill(0);

const triggerListeners = () => {
  listeners.forEach((listener) => listener([...queue]));
};

const updateSpeedHistory = (totalSpeed: number) => {
  speedHistory.push(totalSpeed);
  if (speedHistory.length > 30) {
    speedHistory.shift();
  }
};

export const downloadManager = {
  getQueue(): QueueItem[] {
    return queue;
  },

  getSpeedHistory(): number[] {
    return speedHistory;
  },

  subscribe(listener: QueueListener): () => void {
    listeners.add(listener);
    listener([...queue]);
    return () => {
      listeners.delete(listener);
    };
  },

  subscribeSpeed(listener: SpeedListener): () => void {
    speedListeners.add(listener);
    return () => {
      speedListeners.delete(listener);
    };
  },

  addToQueue(items: Omit<QueueItem, 'id' | 'downloadedBytes' | 'status' | 'speedBytesPerSec' | 'etaSeconds' | 'addedAt'>[]): void {
    const newItems = items.map((item) => ({
      ...item,
      id: `q-${Math.random().toString(36).substring(2, 9)}`,
      downloadedBytes: 0,
      status: 'waiting' as const,
      speedBytesPerSec: 0,
      etaSeconds: -1,
      addedAt: new Date().toISOString(),
    }));

    queue = [...queue, ...newItems];
    triggerListeners();
    this.startLoop();
  },

  pauseItem(id: string): void {
    queue = queue.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'paused', speedBytesPerSec: 0, etaSeconds: -1 };
      }
      return item;
    });
    triggerListeners();
  },

  resumeItem(id: string): void {
    queue = queue.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'waiting' };
      }
      return item;
    });
    triggerListeners();
    this.startLoop();
  },

  cancelItem(id: string): void {
    queue = queue.filter((item) => item.id !== id);
    triggerListeners();
    if (queue.filter((item) => item.status === 'downloading' || item.status === 'waiting').length === 0) {
      this.stopLoop();
    }
  },

  retryItem(id: string): void {
    queue = queue.map((item) => {
      if (item.id === id) {
        return { ...item, status: 'waiting', downloadedBytes: 0, speedBytesPerSec: 0, etaSeconds: -1 };
      }
      return item;
    });
    triggerListeners();
    this.startLoop();
  },

  pauseAll(): void {
    queue = queue.map((item) => {
      if (item.status === 'downloading' || item.status === 'waiting') {
        return { ...item, status: 'paused', speedBytesPerSec: 0, etaSeconds: -1 };
      }
      return item;
    });
    triggerListeners();
    this.stopLoop();
  },

  resumeAll(): void {
    queue = queue.map((item) => {
      if (item.status === 'paused') {
        return { ...item, status: 'waiting' };
      }
      return item;
    });
    triggerListeners();
    this.startLoop();
  },

  clearCompleted(): void {
    queue = queue.filter((item) => item.status !== 'completed' && item.status !== 'failed');
    triggerListeners();
  },

  triggerRealDownload(item: QueueItem): void {
    // Generate a real client-side download for demo purposes
    // Creates a dummy text file containing details of the download
    const content = `OmniStream Download Completed!
===================================
File: ${item.title}
Platform: ${item.platform}
Source Link: ${item.url}
Quality: ${item.quality}
Format: ${item.format}
Size: ${(item.totalBytes / (1024 * 1024)).toFixed(2)} MB
Downloaded At: ${new Date().toLocaleString()}

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
  },

  startLoop(): void {
    if (intervalId) return;

    intervalId = setInterval(() => {
      const settings = storage.getSettings();
      const activeDownloads = queue.filter((item) => item.status === 'downloading');
      const waitingDownloads = queue.filter((item) => item.status === 'waiting');

      // Check if we can start downloading waiting items
      if (activeDownloads.length < settings.maxConcurrent && waitingDownloads.length > 0) {
        const spotsOpen = settings.maxConcurrent - activeDownloads.length;
        const toStart = waitingDownloads.slice(0, spotsOpen);
        
        queue = queue.map((item) => {
          if (toStart.some((ts) => ts.id === item.id)) {
            return { ...item, status: 'downloading' };
          }
          return item;
        });
        
        triggerListeners();
        return; // Next tick will process them
      }

      // If no active downloads and no waiting downloads, stop loop
      if (activeDownloads.length === 0 && waitingDownloads.length === 0) {
        this.stopLoop();
        updateSpeedHistory(0);
        speedListeners.forEach((l) => l(0));
        return;
      }

      // Simulate connection speed
      // Base Speed: Settings Limit or default (between 15MB/s and 35MB/s)
      let totalAvailableSpeed = 0;
      if (settings.speedLimit > 0) {
        // Fluctuates slightly below the limit
        totalAvailableSpeed = (settings.speedLimit * 1024 * 1024) * (0.9 + Math.random() * 0.1);
      } else {
        // Simulates a fast home connection (18MB/s - 32MB/s)
        totalAvailableSpeed = (18 + Math.random() * 14) * 1024 * 1024;
      }

      const activeCount = activeDownloads.length;
      const speedPerActive = activeCount > 0 ? totalAvailableSpeed / activeCount : 0;

      let actualTotalSpeed = 0;

      queue = queue.map((item) => {
        if (item.status === 'downloading') {
          // Check for simulated download error (1% chance per tick for realism)
          const isError = Math.random() < 0.005; 
          if (isError) {
            return { ...item, status: 'failed', speedBytesPerSec: 0, etaSeconds: -1 };
          }

          // Progress bytes
          const bytesProgressed = Math.min(speedPerActive * 0.5, item.totalBytes - item.downloadedBytes); // 0.5 sec tick
          const newDownloaded = item.downloadedBytes + bytesProgressed;
          actualTotalSpeed += speedPerActive;

          if (newDownloaded >= item.totalBytes) {
            // Complete download, add to history
            storage.addHistoryItem({
              id: item.id,
              title: item.title,
              url: item.url,
              platform: item.platform,
              thumbnail: item.thumbnail,
              quality: item.quality,
              format: item.format,
              sizeBytes: item.totalBytes,
              durationString: item.totalBytes > 200000000 ? '02:40' : '03:15', // dummy duration or map appropriately
              artist: item.artist,
              album: item.album,
            });

            return {
              ...item,
              downloadedBytes: item.totalBytes,
              status: 'completed',
              speedBytesPerSec: 0,
              etaSeconds: 0,
            };
          } else {
            const eta = Math.round((item.totalBytes - newDownloaded) / speedPerActive);
            return {
              ...item,
              downloadedBytes: newDownloaded,
              speedBytesPerSec: speedPerActive,
              etaSeconds: eta,
            };
          }
        }
        return item;
      });

      // Update speed graph
      updateSpeedHistory(actualTotalSpeed);
      speedListeners.forEach((l) => l(actualTotalSpeed));

      triggerListeners();
    }, 500); // 500ms intervals
  },

  stopLoop(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },
};
