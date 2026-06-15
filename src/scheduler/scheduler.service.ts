import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as cron from 'node-cron';
import { YoutubeService } from '../parsers/youtube.service';
import { TwitchService } from '../parsers/twitch.service';
import { TiktokService } from '../parsers/tiktok.service';
import { AiProcessorService } from '../processor/ai-processor.service';
import { VkService } from '../poster/vk.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly intervalMin = parseInt(process.env.POSTING_INTERVAL_MIN || '30', 10);
  private readonly maxPostsPerRun = parseInt(process.env.MAX_POSTS_PER_RUN || '3', 10);

  constructor(
    private readonly youtube: YoutubeService,
    private readonly twitch: TwitchService,
    private readonly tiktok: TiktokService,
    private readonly ai: AiProcessorService,
    private readonly vk: VkService,
    private readonly db: DatabaseService,
  ) {}

  onModuleInit() {
    const cronExpr = `*/${this.intervalMin} * * * *`;
    this.logger.log(`⏰ Планировщик запущен: каждые ${this.intervalMin} минут`);

    // Сразу запускаем при старте
    this.runPipeline();

    cron.schedule(cronExpr, () => {
      this.runPipeline();
    });
  }

  async runPipeline() {
    this.logger.log('🔄 Запуск пайплайна сбора новостей...');

    try {
      // Собираем новости изо всех источников параллельно
      const [ytItems, twitchItems, tiktokItems] = await Promise.all([
        this.youtube.getLatestVideos().catch(() => []),
        this.twitch.getTopStreams().catch(() => []),
        this.tiktok.getTrendingVideos().catch(() => []),
      ]);

      const allItems = [...ytItems, ...twitchItems, ...tiktokItems];
      this.logger.log(`📰 Найдено новостей: YT=${ytItems.length} TW=${twitchItems.length} TT=${tiktokItems.length}`);

      let posted = 0;
      for (const item of allItems) {
        if (posted >= this.maxPostsPerRun) break;

        // Проверяем дедупликацию
        const alreadyPosted = await this.db.isPosted(item.id);
        if (alreadyPosted) continue;

        // Генерируем текст через GPT
        const postText = await this.ai.generatePostText(item);

        // Публикуем в VK с фото
        const success = await this.vk.postToWall(postText, item.thumbnail);

        if (success) {
          await this.db.markAsPosted(item.id, item.title, item.source);
          posted++;

          // Пауза 3 секунды между постами
          await new Promise((r) => setTimeout(r, 3000));
        }
      }

      this.logger.log(`✅ Опубликовано постов: ${posted}`);
    } catch (err) {
      this.logger.error(`Ошибка пайплайна: ${err.message}`);
    }
  }
}
