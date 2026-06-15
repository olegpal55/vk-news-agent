# 🤖 VK News Agent

> AI-агент для автоматического сбора новостей с Twitch, YouTube, TikTok и постинга в группу ВКонтакте

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat&logo=openai&logoColor=white)

## ✨ Возможности

- 📺 **YouTube** — получает последние видео с выбранных каналов через YouTube Data API v3
- 🎮 **Twitch** — следит за топ-стримами по выбранным играм через Twitch Helix API
- 🎵 **TikTok** — парсит трендовые видео через RapidAPI TikTok Scraper
- 🤖 **GPT-4o** — генерирует красивый текст поста с эмодзи и хэштегами
- 📢 **VK API** — автоматически публикует посты в группу ВКонтакте
- 🔁 **Планировщик** — запускается каждые 30 минут через node-cron
- 🗄️ **SQLite** — хранит уже опубликованные новости (дедупликация)
- 🐳 **Docker** — полная контейнеризация для простого деплоя

## 🏗️ Архитектура

```
[YouTube API] ──┐
[Twitch API]  ──┼──► [Scheduler] ──► [AI Processor] ──► [VK Poster]
[TikTok API]  ──┘         │                                    │
                      [SQLite DB] ◄──── дедупликация ──────────┘
```

## 📁 Структура проекта

```
vk-news-agent/
├── src/
│   ├── parsers/
│   │   ├── youtube.service.ts
│   │   ├── twitch.service.ts
│   │   └── tiktok.service.ts
│   ├── processor/
│   │   └── ai-processor.service.ts
│   ├── poster/
│   │   └── vk.service.ts
│   ├── scheduler/
│   │   └── scheduler.service.ts
│   ├── database/
│   │   ├── news.entity.ts
│   │   └── database.service.ts
│   ├── app.module.ts
│   └── main.ts
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## 🚀 Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone https://github.com/olegpal55/vk-news-agent.git
cd vk-news-agent
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Настроить переменные окружения

```bash
cp .env.example .env
# заполнить .env своими токенами
```

### 4. Запустить через Docker

```bash
docker-compose up -d
```

### 5. Или запустить локально

```bash
npm run start:dev
```

## 🔑 Переменные окружения

| Переменная | Описание | Где получить |
|---|---|---|
| `YOUTUBE_API_KEY` | Ключ YouTube Data API v3 | console.cloud.google.com |
| `YOUTUBE_CHANNEL_IDS` | ID каналов через запятую | youtube.com → About |
| `TWITCH_CLIENT_ID` | Client ID Twitch App | dev.twitch.tv/console |
| `TWITCH_CLIENT_SECRET` | Client Secret Twitch App | dev.twitch.tv/console |
| `TWITCH_GAME_IDS` | ID игр через запятую | IGDB / Twitch API |
| `TIKTOK_RAPIDAPI_KEY` | Ключ RapidAPI TikTok | rapidapi.com |
| `TIKTOK_HASHTAGS` | Хэштеги для поиска | — |
| `OPENAI_API_KEY` | Ключ OpenAI | platform.openai.com |
| `VK_ACCESS_TOKEN` | Токен VK с правами wall | vk.com/dev |
| `VK_GROUP_ID` | ID группы ВКонтакте | — |
| `POSTING_INTERVAL_MIN` | Интервал постинга (минуты) | — |
| `MAX_POSTS_PER_RUN` | Макс. постов за один запуск | — |

## 🔐 Получение токенов

### YouTube API
1. Перейти на [console.cloud.google.com](https://console.cloud.google.com)
2. Создать проект → Включить YouTube Data API v3
3. Credentials → Create API Key

### Twitch API
1. Перейти на [dev.twitch.tv/console](https://dev.twitch.tv/console)
2. Register Your Application → получить Client ID и Client Secret

### VK API
1. Создать Standalone-приложение на [vk.com/dev](https://vk.com/dev)
2. Получить токен через Implicit Flow с правами: `wall,photos,groups`
3. URL: `https://oauth.vk.com/authorize?client_id=APP_ID&display=page&scope=wall,photos,groups&response_type=token&v=5.199`

### OpenAI
1. Перейти на [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key

## 🛠️ Команды

```bash
npm run start          # запуск
npm run start:dev      # разработка (watch mode)
npm run build          # сборка
npm run lint           # линтер
```

## 📦 Деплой на Render

1. Подключить репозиторий на [render.com](https://render.com)
2. Выбрать тип: **Background Worker**
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start:prod`
5. Добавить Environment Variables

## 🧩 Технологии

- **NestJS** — backend framework
- **TypeScript** — типизация
- **node-cron** — планировщик задач
- **axios** — HTTP-клиент
- **better-sqlite3** — локальная БД
- **openai** — GPT-4o SDK
- **Docker** — контейнеризация

## 📄 Лицензия

MIT
