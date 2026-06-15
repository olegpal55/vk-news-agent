import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { NewsItem } from '../parsers/youtube.service';

@Injectable()
export class AiProcessorService {
  private readonly logger = new Logger(AiProcessorService.name);
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  private readonly sourceEmoji = {
    youtube: '📺',
    twitch: '🎮',
    tiktok: '🎵',
  };

  async generatePostText(item: NewsItem): Promise<string> {
    const emoji = this.sourceEmoji[item.source];
    const prompt = `Ты Менеджер СММ для гейминг/еспортс сообщества. Напиши пост для ВКонтакте об этой новости:

Источник: ${item.source.toUpperCase()}
Заголовок: ${item.title}
Описание: ${item.description}
Ссылка: ${item.url}

Требования:
- Начни с эмодзи ${emoji}
- Макс 200-250 символов без ссылки
- Добавь хэштеги #gaming #esports #${item.source}
- Язык: русский
- Сохрани ссылку на отдельной строке в конце`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      const text = response.choices[0]?.message?.content?.trim() || '';
      return text;
    } catch (err) {
      this.logger.error(`GPT ошибка: ${err.message}`);
      // Фоллбэк: пост без GPT
      return `${emoji} ${item.title}\n\n${item.description}\n\n${item.url}\n\n#gaming #${item.source} #esports`;
    }
  }
}
