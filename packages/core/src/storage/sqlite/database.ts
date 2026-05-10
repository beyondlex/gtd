import { Database } from "bun:sqlite";
import { runMigrations } from "./migrations.js";

export class DatabaseManager {
  private db: Database;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.db = new Database(dbPath, { create: true });
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA foreign_keys = ON;");
  }

  initialize(): void {
    runMigrations(this.db);
  }

  getDb(): Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }

  getPath(): string {
    return this.dbPath;
  }
}