import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler/scheduler.service';
import { YoutubeService } from './parsers/youtube.service';
import { TwitchService } from './parsers/twitch.service';
import { TiktokService } from './parsers/tiktok.service';
import { AiProcessorService } from './processor/ai-processor.service';
import { VkService } from './poster/vk.service';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [],
  providers: [
    SchedulerService,
    YoutubeService,
    TwitchService,
    TiktokService,
    AiProcessorService,
    VkService,
    DatabaseService,
  ],
})
export class AppModule {}
