import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NewsItem } from './youtube.service';

@Injectable()
export class TiktokService {
  private readonly logger = new Logger(TiktokService.name);
  private readonly rapidApiKey = process.env.TIKTOK_RAPIDAPI_KEY;
  private readonly hashtags = (process.env.TIKTOK_HASHTAGS || 'gaming,esports,twitch').split(',').filter(Boolean);

  async getTrendingVideos(): Promise<NewsItem[]> {
    const results: NewsItem[] = [];

    for (const hashtag of this.hashtags.slice(0, 2)) {
      try {
        const res = await axios.get(
          'https://tiktok-api23.p.rapidapi.com/api/hashtag/posts',
          {
            headers: {
              'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com',
              'x-rapidapi-key': this.rapidApiKey,
            },
            params: {
              name: hashtag.trim(),
              count: 3,
            },
          },
        );

        const videos = res.data?.itemList || res.data?.data?.itemList || [];
        for (const video of videos) {
          const author = video.author?.uniqueId || 'unknown';
          const desc = video.desc || '';
          results.push({
            id: `tiktok_${video.id}`,
            title: `🎵 TikTok #${hashtag}: ${desc.slice(0, 80)}`,
            description: `❤️ Лайков: ${(video.stats?.diggCount || 0).toLocaleString()} | Автор: @${author}`,
            url: `https://www.tiktok.com/@${author}/video/${video.id}`,
            thumbnail: video.video?.cover,
            source: 'tiktok',
            publishedAt: new Date(video.createTime * 1000).toISOString(),
          });
        }
      } catch (err) {
        this.logger.error(`TikTok API ошибка для #${hashtag}: ${err.message}`);
      }
    }

    return results;
  }
}
