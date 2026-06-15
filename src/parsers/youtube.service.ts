import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  source: 'youtube' | 'twitch' | 'tiktok';
  publishedAt: string;
}

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly apiKey = process.env.YOUTUBE_API_KEY;
  private readonly channelIds = (process.env.YOUTUBE_CHANNEL_IDS || '').split(',').filter(Boolean);

  async getLatestVideos(): Promise<NewsItem[]> {
    const results: NewsItem[] = [];

    for (const channelId of this.channelIds) {
      try {
        const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            key: this.apiKey,
            channelId: channelId.trim(),
            part: 'snippet',
            order: 'date',
            maxResults: 3,
            type: 'video',
          },
        });

        for (const item of res.data.items) {
          results.push({
            id: `yt_${item.id.videoId}`,
            title: item.snippet.title,
            description: item.snippet.description?.slice(0, 200) || '',
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails?.medium?.url,
            source: 'youtube',
            publishedAt: item.snippet.publishedAt,
          });
        }
      } catch (err) {
        this.logger.error(`YouTube API ошибка для канала ${channelId}: ${err.message}`);
      }
    }

    return results;
  }
}
