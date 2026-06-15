import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private db: Database.Database;

  onModuleInit() {
    const dbPath = path.join(process.cwd(), 'data', 'news.db');
    this.db = new Database(dbPath);
    this.createTables();
    this.logger.log(`🗄️ SQLite БД инициализирована: ${dbPath}`);
  }

  private createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posted_news (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        source TEXT NOT NULL,
        posted_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_posted_at ON posted_news(posted_at);
    `);
  }

  async isPosted(id: string): Promise<boolean> {
    const row = this.db.prepare('SELECT id FROM posted_news WHERE id = ?').get(id);
    return !!row;
  }

  async markAsPosted(id: string, title: string, source: string): Promise<void> {
    this.db
      .prepare('INSERT OR IGNORE INTO posted_news (id, title, source) VALUES (?, ?, ?)')
      .run(id, title, source);
  }

  async getStats(): Promise<{ total: number; bySource: Record<string, number> }> {
    const total = (this.db.prepare('SELECT COUNT(*) as cnt FROM posted_news').get() as any).cnt;
    const rows = this.db
      .prepare('SELECT source, COUNT(*) as cnt FROM posted_news GROUP BY source')
      .all() as Array<{ source: string; cnt: number }>;

    const bySource: Record<string, number> = {};
    for (const row of rows) bySource[row.source] = row.cnt;

    return { total, bySource };
  }

  // Очищаем записи старше 30 дней
  async cleanup(): Promise<void> {
    const result = this.db
      .prepare("DELETE FROM posted_news WHERE posted_at < datetime('now', '-30 days')")
      .run();
    if (result.changes > 0) {
      this.logger.log(`🧹 Очищено старых записей: ${result.changes}`);
    }
  }
}
