export interface PlaylistItem {
  id: string;
  title: string;
  artist?: string;
  thumbnail: string;
  durationString: string;
  url: string;
}

export interface AnalysisResult {
  type: 'song' | 'video' | 'playlist';
  platform: 'YouTube' | 'Other';
  title: string;
  artist?: string;
  description?: string;
  thumbnail: string;
  durationString?: string;
  url: string;
  playlistItems?: PlaylistItem[];
}

export const urlAnalyzer = {
  analyze(urlStr: string): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const cleanUrl = urlStr.trim();
        if (!cleanUrl) {
          reject(new Error('Please enter a valid URL'));
          return;
        }

        let urlToCheck = cleanUrl;
        if (!/^https?:\/\//i.test(cleanUrl)) {
          urlToCheck = 'https://' + cleanUrl;
        }

        // Validate URL format
        try {
          new URL(urlToCheck);
        } catch {
          reject(new Error('Invalid link. Please enter a valid URL (e.g. starting with http:// or https://)'));
          return;
        }

        const isYouTube = urlToCheck.includes('youtube.com') || urlToCheck.includes('youtu.be');
        
        if (!isYouTube) {
          // Fallback for non-YouTube links
          resolve({
            type: 'video',
            platform: 'Other',
            title: `Media Stream from ${new URL(urlToCheck).hostname}`,
            artist: 'Web Stream',
            description: 'Direct parsed media resource from remote host.',
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
            url: urlToCheck,
            durationString: '05:00'
          });
          return;
        }

        // 1. YouTube Playlist
        if (urlToCheck.includes('/playlist') || urlToCheck.includes('list=')) {
          let listId = 'PL4fGSI1pDJn5n4e05b5f884bf05b5a265';
          try {
            const urlObj = new URL(urlToCheck);
            const listParam = urlObj.searchParams.get('list');
            if (listParam) listId = listParam;
          } catch {
            // ignore
          }

          const generatedItems: PlaylistItem[] = Array.from({ length: 6 }).map((_, i) => {
            const trackNum = i + 1;
            return {
              id: `yt-playlist-item-${listId}-${trackNum}`,
              title: `Playlist Track #${trackNum} (${listId})`,
              artist: `YouTube Artist`,
              thumbnail: `https://images.unsplash.com/photo-${[
                '1511671782779-c97d3d27a1d4',
                '1470225620780-dba8ba36b745',
                '1514525253161-7a46d19cd819',
                '1498038432885-c6f3f1b912ee',
                '1506157786151-b8491531f063',
                '1487180142328-0c4e37023af5'
              ][i % 6]}?w=150&auto=format&fit=crop&q=60`,
              durationString: `0${3 + i}:00`,
              url: `https://www.youtube.com/watch?v=mock_${listId}_${trackNum}`,
            };
          });

          resolve({
            type: 'playlist',
            platform: 'YouTube',
            title: listId === 'PL4fGSI1pDJn5n4e05b5f884bf05b5a265' 
              ? 'Ultimate Lo-Fi Coding Session Beats' 
              : `YouTube Playlist (${listId})`,
            artist: 'Lofi Girl & Friends',
            description: `Dynamically analyzed YouTube playlist containing ${generatedItems.length} media tracks.`,
            thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60',
            url: urlToCheck,
            durationString: '24:30',
            playlistItems: generatedItems
          });
        }
        // 2. YouTube Song (detected by music.youtube.com or song keywords)
        else if (urlToCheck.includes('music.youtube.com') || urlToCheck.includes('song') || urlToCheck.includes('music')) {
          resolve({
            type: 'song',
            platform: 'YouTube',
            title: 'Synthwave Sunset (Late Night Cruiser Mix)',
            artist: 'RetroFuture95',
            description: 'Retro synth layers, nostalgic pads, and driving LinnDrum beats for night driving.',
            thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
            durationString: '07:45',
            url: urlToCheck
          });
        }
        // 3. YouTube Video (default)
        else {
          resolve({
            type: 'video',
            platform: 'YouTube',
            title: 'Building a React Framework from Scratch in 2 Hours',
            artist: 'Codecraft Academy',
            description: 'Learn the inner workings of Virtual DOM, Fiber architecture, state hooks, and component reconciliation by implementing React from first principles.',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
            durationString: '01:54:20',
            url: urlToCheck
          });
        }
      }, 800);
    });
  },
};
