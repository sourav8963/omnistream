export interface MediaQuality {
  id: string; // e.g. '2160p', '1080p', '320kbps'
  label: string; // e.g. '2160p (4K)', '1080p (Full HD)', '320 kbps'
  sizeBytes: number;
  fps?: number;
  codec?: string;
  container?: string;
  isAudioOnly: boolean;
}

export interface MediaSubtitle {
  code: string;
  label: string;
}

export interface PlaylistItem {
  id: string;
  title: string;
  artist?: string;
  thumbnail: string;
  durationSeconds: number;
  durationString: string;
  url: string;
  platform: string;
  estimatedSize1080pBytes: number;
}

export interface AnalysisResult {
  type: 'video' | 'playlist' | 'audio' | 'podcast' | 'direct';
  platform: 'YouTube' | 'Vimeo' | 'SoundCloud' | 'Podcast' | 'Direct Link';
  title: string;
  artist?: string;
  description?: string;
  thumbnail: string;
  durationString?: string;
  durationSeconds?: number;
  url: string;
  itemCount?: number;
  qualities: MediaQuality[];
  subtitles?: MediaSubtitle[];
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

        // 1. YouTube Playlist
        if (
          urlToCheck.includes('youtube.com/playlist') ||
          urlToCheck.includes('list=')
        ) {
          resolve({
            type: 'playlist',
            platform: 'YouTube',
            title: 'Ultimate Lo-Fi Coding Session Beats',
            artist: 'Lofi Girl & Friends',
            description: 'The ultimate compilation of mellow beats to code, study, and relax to. Updated daily.',
            thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=60',
            url: urlToCheck,
            itemCount: 8,
            qualities: [],
            playlistItems: [
              {
                id: 'yt-item-1',
                title: 'Coding in Tokyo (Midnight Ambient Beat)',
                artist: 'Lofi Girl',
                thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 195,
                durationString: '03:15',
                url: 'https://www.youtube.com/watch?v=tokyo111',
                platform: 'YouTube',
                estimatedSize1080pBytes: 42000000,
              },
              {
                id: 'yt-item-2',
                title: 'Rainy Night Coffee Shop (Jazz Hop)',
                artist: 'Coffee Beans',
                thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 242,
                durationString: '04:02',
                url: 'https://www.youtube.com/watch?v=coffee222',
                platform: 'YouTube',
                estimatedSize1080pBytes: 52000000,
              },
              {
                id: 'yt-item-3',
                title: 'Cyberpunk Neon Workspace (Synthwave Lofi)',
                artist: 'Vector Graphics',
                thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 310,
                durationString: '05:10',
                url: 'https://www.youtube.com/watch?v=cyber333',
                platform: 'YouTube',
                estimatedSize1080pBytes: 68000000,
              },
              {
                id: 'yt-item-4',
                title: 'Chill Chill Coding (Chillhop Session)',
                artist: 'Nujabes Tribute',
                thumbnail: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 188,
                durationString: '03:08',
                url: 'https://www.youtube.com/watch?v=chill444',
                platform: 'YouTube',
                estimatedSize1080pBytes: 40000000,
              },
              {
                id: 'yt-item-5',
                title: 'Autumn Wind & Piano Lofi',
                artist: 'Sora Keyboard',
                thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 215,
                durationString: '03:35',
                url: 'https://www.youtube.com/watch?v=autumn555',
                platform: 'YouTube',
                estimatedSize1080pBytes: 46000000,
              },
              {
                id: 'yt-item-6',
                title: 'Late Night Debugging Session',
                artist: 'StackOverflow Beats',
                thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 290,
                durationString: '04:50',
                url: 'https://www.youtube.com/watch?v=debug666',
                platform: 'YouTube',
                estimatedSize1080pBytes: 62000000,
              },
              {
                id: 'yt-item-7',
                title: 'Sunday Morning Coffee & Git Push',
                artist: 'Commit History',
                thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 205,
                durationString: '03:25',
                url: 'https://www.youtube.com/watch?v=push777',
                platform: 'YouTube',
                estimatedSize1080pBytes: 44000000,
              },
              {
                id: 'yt-item-8',
                title: 'Deep Focus Ambient Drone',
                artist: 'Wavelengths',
                thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 480,
                durationString: '08:00',
                url: 'https://www.youtube.com/watch?v=drone888',
                platform: 'YouTube',
                estimatedSize1080pBytes: 105000000,
              },
            ],
          });
        }
        // 2. YouTube Single Video
        else if (
          urlToCheck.includes('youtube.com') ||
          urlToCheck.includes('youtu.be')
        ) {
          resolve({
            type: 'video',
            platform: 'YouTube',
            title: 'Building a React Framework from Scratch in 2 Hours',
            artist: 'Codecraft Academy',
            description: 'Learn the inner workings of Virtual DOM, Fiber architecture, state hooks, and component reconciliation by implementing React from first principles.',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
            durationString: '01:54:20',
            durationSeconds: 6860,
            url: urlToCheck,
            qualities: [
              { id: '2160p', label: '2160p (4K UHD)', sizeBytes: 1450000000, fps: 60, codec: 'VP9', container: 'MKV', isAudioOnly: false },
              { id: '1440p', label: '1440p (QHD)', sizeBytes: 850000000, fps: 60, codec: 'VP9', container: 'MKV', isAudioOnly: false },
              { id: '1080p', label: '1080p (Full HD)', sizeBytes: 450000000, fps: 60, codec: 'H.264', container: 'MP4', isAudioOnly: false },
              { id: '720p', label: '720p (HD)', sizeBytes: 250000000, fps: 30, codec: 'H.264', container: 'MP4', isAudioOnly: false },
              { id: '480p', label: '480p (SD)', sizeBytes: 120000000, fps: 30, codec: 'H.264', container: 'MP4', isAudioOnly: false },
              { id: '360p', label: '360p', sizeBytes: 75000000, fps: 30, codec: 'H.264', container: 'MP4', isAudioOnly: false },
              { id: '320kbps', label: '320 kbps (High Quality Audio)', sizeBytes: 274400000, codec: 'AAC', container: 'M4A', isAudioOnly: true },
              { id: '192kbps', label: '192 kbps (Medium)', sizeBytes: 164640000, codec: 'AAC', container: 'M4A', isAudioOnly: true },
              { id: '128kbps', label: '128 kbps (Standard)', sizeBytes: 109760000, codec: 'Opus', container: 'WebM', isAudioOnly: true },
            ],
            subtitles: [
              { code: 'en', label: 'English (auto-generated)' },
              { code: 'en-cc', label: 'English (CC)' },
              { code: 'es', label: 'Spanish' },
              { code: 'ja', label: 'Japanese' },
              { code: 'de', label: 'German' },
            ],
          });
        }
        // 3. Vimeo
        else if (urlToCheck.includes('vimeo.com')) {
          resolve({
            type: 'video',
            platform: 'Vimeo',
            title: 'Cinematic Dreamscapes of Northern Lights (8K)',
            artist: 'Astraea Films',
            description: 'A visual poem capturing the ethereal Aurora Borealis dancing across the Arctic skies of Norway and Iceland.',
            thumbnail: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=500&auto=format&fit=crop&q=60',
            durationString: '04:15',
            durationSeconds: 255,
            url: urlToCheck,
            qualities: [
              { id: '2160p', label: '2160p (4K)', sizeBytes: 22000000, fps: 24, codec: 'HEVC', container: 'MP4', isAudioOnly: false },
              { id: '1080p', label: '1080p (Full HD)', sizeBytes: 8500000, fps: 24, codec: 'H.264', container: 'MP4', isAudioOnly: false },
              { id: '720p', label: '720p (HD)', sizeBytes: 4000000, fps: 24, codec: 'H.264', container: 'MP4', isAudioOnly: false },
            ],
            subtitles: [
              { code: 'en', label: 'English' },
              { code: 'fr', label: 'French' },
            ],
          });
        }
        // 4. SoundCloud
        else if (urlToCheck.includes('soundcloud.com')) {
          resolve({
            type: 'audio',
            platform: 'SoundCloud',
            title: 'Synthwave Sunset (Late Night Cruiser Mix)',
            artist: 'RetroFuture95',
            description: 'Retro synth layers, nostalgic pads, and driving LinnDrum beats for night driving.',
            thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
            durationString: '07:45',
            durationSeconds: 465,
            url: urlToCheck,
            qualities: [
              { id: 'flac', label: 'FLAC (Lossless 24-bit)', sizeBytes: 78000000, codec: 'FLAC', container: 'FLAC', isAudioOnly: true },
              { id: '320kbps', label: 'MP3 (320 kbps High)', sizeBytes: 18600000, codec: 'MP3', container: 'MP3', isAudioOnly: true },
              { id: '256kbps', label: 'AAC (256 kbps High)', sizeBytes: 14800000, codec: 'AAC', container: 'M4A', isAudioOnly: true },
              { id: '128kbps', label: 'OPUS (128 kbps Standard)', sizeBytes: 7400000, codec: 'Opus', container: 'WebM', isAudioOnly: true },
            ],
          });
        }
        // 5. Podcast RSS Feed
        else if (urlToCheck.includes('podcast') || urlToCheck.includes('.rss') || urlToCheck.includes('/feed') || urlToCheck.includes('/rss')) {
          resolve({
            type: 'podcast',
            platform: 'Podcast',
            title: 'The Lexicon of AI (Tech & Society)',
            artist: 'Dr. Sarah Vance',
            description: 'Exploring how machine learning, cognitive sciences, and human creativity intersect in the 21st century.',
            thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=60',
            url: urlToCheck,
            itemCount: 4,
            qualities: [],
            playlistItems: [
              {
                id: 'pod-item-1',
                title: 'Episode 42: Quantum Computing Foundations',
                artist: 'Dr. Sarah Vance',
                thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 3240,
                durationString: '54:00',
                url: 'https://example.com/podcasts/ep42.mp3',
                platform: 'Podcast',
                estimatedSize1080pBytes: 129600000,
              },
              {
                id: 'pod-item-2',
                title: 'Episode 41: Large Language Models and Common Sense',
                artist: 'Dr. Sarah Vance',
                thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 2880,
                durationString: '48:00',
                url: 'https://example.com/podcasts/ep41.mp3',
                platform: 'Podcast',
                estimatedSize1080pBytes: 115200000,
              },
              {
                id: 'pod-item-3',
                title: 'Episode 40: The Ethics of Artificial General Intelligence',
                artist: 'Dr. Sarah Vance',
                thumbnail: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 4110,
                durationString: '01:08:30',
                url: 'https://example.com/podcasts/ep40.mp3',
                platform: 'Podcast',
                estimatedSize1080pBytes: 164400000,
              },
              {
                id: 'pod-item-4',
                title: 'Episode 39: Neural Interfaces and Cybernetics',
                artist: 'Dr. Sarah Vance',
                thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=60',
                durationSeconds: 3500,
                durationString: '58:20',
                url: 'https://example.com/podcasts/ep39.mp3',
                platform: 'Podcast',
                estimatedSize1080pBytes: 140000000,
              },
            ],
          });
        }
        // 6. Direct media URL (ignoring query parameters for extension checks)
        else if (
          urlToCheck.includes('direct') ||
          urlToCheck.split('?')[0].endsWith('.mp4') ||
          urlToCheck.split('?')[0].endsWith('.mkv') ||
          urlToCheck.split('?')[0].endsWith('.mp3') ||
          urlToCheck.split('?')[0].endsWith('.webm') ||
          urlToCheck.split('?')[0].endsWith('.flac') ||
          urlToCheck.split('?')[0].endsWith('.m4a')
        ) {
          const cleanPath = urlToCheck.split('?')[0];
          const isAudio = 
            cleanPath.endsWith('.mp3') || 
            cleanPath.endsWith('.flac') || 
            cleanPath.endsWith('.m4a') || 
            urlToCheck.includes('audio');

          resolve({
            type: isAudio ? 'audio' : 'video',
            platform: 'Direct Link',
            title: cleanPath.split('/').pop() || 'Direct Media File Download',
            description: `Direct media stream parsed from remote server: ${urlToCheck}`,
            thumbnail: isAudio
              ? 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60'
              : 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&auto=format&fit=crop&q=60',
            durationString: '02:40',
            durationSeconds: 160,
            url: urlToCheck,
            qualities: isAudio
              ? [
                  { id: 'original', label: 'Original Audio Stream', sizeBytes: 15400000, codec: 'AAC', container: 'M4A', isAudioOnly: true },
                  { id: '128kbps', label: '128 kbps (Standard)', sizeBytes: 2560000, codec: 'MP3', container: 'MP3', isAudioOnly: true },
                ]
              : [
                  { id: 'original', label: 'Original Video Quality', sizeBytes: 88000000, fps: 30, codec: 'H.264', container: 'MP4', isAudioOnly: false },
                  { id: '720p', label: '720p Convert', sizeBytes: 44000000, fps: 30, codec: 'H.264', container: 'MP4', isAudioOnly: false },
                ],
          });
        }
        // 7. General fallback
        else {
          // Check if looks like a URL
          try {
            new URL(urlToCheck);
            // Valid URL, default to a simulated Video
            resolve({
              type: 'video',
              platform: 'Direct Link',
              title: `Media stream from ${new URL(urlToCheck).hostname}`,
              description: 'A parsed media resource detected on the host website. Formats extracted dynamically.',
              thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
              durationString: '05:00',
              durationSeconds: 300,
              url: urlToCheck,
              qualities: [
                { id: '1080p', label: '1080p (Full HD)', sizeBytes: 65000000, fps: 30, codec: 'H.264', container: 'MP4', isAudioOnly: false },
                { id: '720p', label: '720p (HD)', sizeBytes: 35000000, fps: 30, codec: 'H.264', container: 'MP4', isAudioOnly: false },
                { id: '320kbps', label: '320 kbps (High Quality Audio)', sizeBytes: 12000000, codec: 'AAC', container: 'M4A', isAudioOnly: true },
              ],
            });
          } catch {
            reject(new Error("Invalid link. Please enter a valid URL (e.g. starting with http:// or https://)"));
          }
        }
      }, 800); // Small realistic delay
    });
  },
};
