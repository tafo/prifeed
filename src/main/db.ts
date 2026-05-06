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

  if (version < 2) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id, created_at ASC);
    `)
    db.pragma('user_version = 2')
  }
}

export interface Post {
  id: string
  body: string
  created_at: number
  updated_at: number
}

export interface Comment {
  id: string
  post_id: string
  body: string
  created_at: number
  updated_at: number
}

export interface PostWithComments extends Post {
  comments: Comment[]
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

export function listPosts(): PostWithComments[] {
  const posts = db
    .prepare('SELECT * FROM posts ORDER BY created_at DESC')
    .all() as Post[]
  const comments = db
    .prepare('SELECT * FROM comments ORDER BY created_at ASC')
    .all() as Comment[]
  const byPost = new Map<string, Comment[]>()
  for (const c of comments) {
    const arr = byPost.get(c.post_id) ?? []
    arr.push(c)
    byPost.set(c.post_id, arr)
  }
  return posts.map((p) => ({ ...p, comments: byPost.get(p.id) ?? [] }))
}

export function deletePost(id: string): void {
  db.prepare('DELETE FROM posts WHERE id = ?').run(id)
}

export function updatePost(id: string, body: string): void {
  db.prepare('UPDATE posts SET body = ?, updated_at = ? WHERE id = ?').run(body, Date.now(), id)
}

export function createComment(postId: string, body: string): Comment {
  const now = Date.now()
  const comment: Comment = {
    id: randomUUID(),
    post_id: postId,
    body,
    created_at: now,
    updated_at: now
  }
  db.prepare(
    'INSERT INTO comments (id, post_id, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).run(comment.id, comment.post_id, comment.body, comment.created_at, comment.updated_at)
  return comment
}

export function deleteComment(id: string): void {
  db.prepare('DELETE FROM comments WHERE id = ?').run(id)
}

export function updateComment(id: string, body: string): void {
  db.prepare('UPDATE comments SET body = ?, updated_at = ? WHERE id = ?').run(
    body,
    Date.now(),
    id
  )
}
