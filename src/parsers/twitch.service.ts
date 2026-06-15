import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NewsItem } from './youtube.service';

@Injectable()
export class TwitchService {
  private readonly logger = new Logger(TwitchService.name);
  private readonly clientId = process.env.TWITCH_CLIENT_ID;
  private readonly clientSecret = process.env.TWITCH_CLIENT_SECRET;
  private readonly gameIds = (process.env.TWITCH_GAME_IDS || '').split(',').filter(Boolean);
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    const res = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
    );
    this.accessToken = res.data.access_token;
    this.tokenExpiry = Date.now() + res.data.expires_in * 1000 - 60000;
    return this.accessToken;
  }

  async getTopStreams(): Promise<NewsItem[]> {
    const results: NewsItem[] = [];
    try {
      const token = await this.getAccessToken();
      const params: any = { first: 5 };
      if (this.gameIds.length > 0) {
        params.game_id = this.gameIds.map((id) => id.trim());
      }

      const res = await axios.get('https://api.twitch.tv/helix/streams', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Client-Id': this.clientId,
        },
        params,
      });

      for (const stream of res.data.data) {
        results.push({
          id: `twitch_${stream.id}`,
          title: `🎮 ${stream.user_name} стримит: ${stream.title}`,
          description: `👀 Зрителей: ${stream.viewer_count.toLocaleString()} | Игра: ${stream.game_name}`,
          url: `https://www.twitch.tv/${stream.user_login}`,
          thumbnail: stream.thumbnail_url?.replace('{width}', '320').replace('{height}', '180'),
          source: 'twitch',
          publishedAt: stream.started_at,
        });
      }
    } catch (err) {
      this.logger.error(`Twitch API ошибка: ${err.message}`);
    }
    return results;
  }
}
