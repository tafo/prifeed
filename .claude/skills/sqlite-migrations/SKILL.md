---
name: sqlite-migrations
description: Use when changing the Prifeed SQLite schema in src/main/db.ts. Triggers on adding tables or columns, changing indexes, writing new migrate() blocks, bumping user_version, or any better-sqlite3 prepare/exec call against posts or comments. Also triggers when the user mentions schema, migration, ALTER TABLE, user_version, or evolving the data model. Use this even for a small column add. A wrong migration can corrupt the user's journal.
---

# SQLite migrations

Schema and runner live in one file: `src/main/db.ts`. No `migrations/` folder, no numbered SQL files. The `user_version` PRAGMA is the migration counter.

## Pattern

```ts
function migrate(): void {
  const version = db.pragma('user_version', { simple: true }) as number

  if (version < 1) {
    db.exec(`...`)
    db.pragma('user_version = 1')
  }

  if (version < 2) {
    db.exec(`...`)
    db.pragma('user_version = 2')
  }
}
```

## Conventions

- IDs: `TEXT PRIMARY KEY` with `crypto.randomUUID()`. Not autoincrement.
- Timestamps: `INTEGER NOT NULL` with `Date.now()` (epoch ms). Not ISO strings.
- Foreign keys: `REFERENCES ... ON DELETE CASCADE`. `foreign_keys = ON` is set in `initDb()`.
- Indexes follow access pattern: posts `(created_at DESC)`, comments `(post_id, created_at ASC)`.
- WAL mode is on.

## Adding a migration

1. Append a new `if (version < N)` block at the bottom of `migrate()`. `N` is the next integer.
2. Run schema change in `db.exec(\`...\`)`.
3. End with `db.pragma('user_version = N')`.
4. Update TS interfaces in `db.ts`.
5. Update preload and renderer types if the change crosses IPC.
6. Restart `pnpm dev`. Main process does not hot reload.

Never edit a released block. Once a user has run version 2, that block is frozen. Add a new block.

## Safe changes

```ts
// Add column
db.exec(`ALTER TABLE posts ADD COLUMN color TEXT`)

// Add index
db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(pinned, created_at DESC)`)

// Add table
db.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
  );
`)
```

## Destructive changes (rename, drop, retype)

SQLite cannot do these in place. Rebuild the table inside one transaction:

```ts
db.exec(`
  BEGIN TRANSACTION;

  CREATE TABLE posts_new (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  INSERT INTO posts_new (id, content, created_at, updated_at)
    SELECT id, body, created_at, updated_at FROM posts;

  DROP TABLE posts;
  ALTER TABLE posts_new RENAME TO posts;

  CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

  COMMIT;
`)
```

Recreate indexes after the rebuild.

## Backups before destructive blocks

```ts
const dbPath = join(app.getPath('userData'), 'prifeed.db')
copyFileSync(dbPath, `${dbPath}.backup-v${version}`)
```

Run before the destructive SQL. Tell the user where the backup lives.

## better-sqlite3

- Always parameterize: `db.prepare('... WHERE id = ?').get(id)`. No string concat with input.
- Wrap multi-row work in `db.transaction(...)`.
- Hoist prepared statements to module scope only on hot paths.

## Rules

1. Never edit a released `if (version < N)` block.
2. Forward-only. To undo, write a new block.
3. Test on a real-size DB copy (1k+ posts, 5k+ comments) before shipping.
4. Keep schema and runner in `src/main/db.ts`.

## Checklist

- [ ] New `if (version < N)` block at bottom of `migrate()`
- [ ] No edit to past blocks
- [ ] `db.pragma('user_version = N')` at end
- [ ] Multi-statement work in `BEGIN ... COMMIT`
- [ ] Indexes recreated after table rebuild
- [ ] Backup copied if data is dropped or rewritten
- [ ] TS interfaces updated
- [ ] IPC and renderer types updated if needed
- [ ] `pnpm dev` restarted
- [ ] Tested on real-size DB
