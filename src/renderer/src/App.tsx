import { useEffect, useState } from 'react'

interface Post {
  id: string
  body: string
  created_at: number
  updated_at: number
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString()
}

function App(): React.JSX.Element {
  const [posts, setPosts] = useState<Post[]>([])
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function refresh(): Promise<void> {
    const list = await window.api.posts.list()
    setPosts(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function submit(): Promise<void> {
    const body = draft.trim()
    if (!body) return
    setSubmitting(true)
    try {
      await window.api.posts.create(body)
      setDraft('')
      await refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Prifeed</h1>
          <p className="text-sm text-neutral-400">Your local, private feed.</p>
        </header>

        <section className="mb-8 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write something..."
            rows={3}
            className="w-full resize-none bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={submit}
              disabled={submitting || !draft.trim()}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {posts.length === 0 && (
            <p className="text-center text-sm text-neutral-500">No posts yet.</p>
          )}
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <p className="whitespace-pre-wrap text-neutral-100">{post.body}</p>
              <p className="mt-2 text-xs text-neutral-500">{formatDate(post.created_at)}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

export default App
