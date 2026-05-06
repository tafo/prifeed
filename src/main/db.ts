import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { randomUUID } from 'crypto'

let db: Database.Database

export function initDb(): void {
  const dbPath = join(app.getPath('userData'), 'prifeed.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate()
}

function migrate(): void {
  const version = db.pragma('user_version', { simple: true }) as number
  if (version < 1) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
    `)
    db.pragma('user_version = 1')
  }
}

export interface Post {
  id: string
  body: string
  created_at: number
  updated_at: number
}

export function createPost(body: string): Post {
  const now = Date.now()
  const post: Post = {
    id: randomUUID(),
    body,
    created_at: now,
    updated_at: now
  }
  db.prepare(
    'INSERT INTO posts (id, body, created_at, updated_at) VALUES (?, ?, ?, ?)'
  ).run(post.id, post.body, post.created_at, post.updated_at)
  return post
}

export function listPosts(): Post[] {
  return db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all() as Post[]
}

export function deletePost(id: string): void {
  db.prepare('DELETE FROM posts WHERE id = ?').run(id)
}
