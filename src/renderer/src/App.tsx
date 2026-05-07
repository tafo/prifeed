import { useEffect, useMemo, useRef, useState } from 'react'
import type { PostWithComments } from '@renderer/types'
import { type Filter, getFilterCutoff } from '@renderer/lib/time'
import { Sidebar } from '@renderer/components/Sidebar'
import { TimelineFeed } from '@renderer/components/TimelineFeed'
import { ThreadPanel } from '@renderer/components/ThreadPanel'
import { ComposeModal } from '@renderer/components/ComposeModal'

function App(): React.JSX.Element {
  const [posts, setPosts] = useState<PostWithComments[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const initialized = useRef(false)

  async function refresh(): Promise<void> {
    setPosts(await window.api.posts.list())
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (selectedId && !posts.some((p) => p.id === selectedId)) {
      setSelectedId(null)
    }
  }, [posts, selectedId])

  useEffect(() => {
    if (!initialized.current && posts.length > 0) {
      initialized.current = true
      setSelectedId(posts[0].id)
    }
  }, [posts])

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setComposerOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const counts = useMemo(() => {
    const todayCutoff = getFilterCutoff('today')
    const weekCutoff = getFilterCutoff('week')
    const monthCutoff = getFilterCutoff('month')
    return {
      all: posts.length,
      today: posts.filter((p) => p.created_at >= todayCutoff).length,
      week: posts.filter((p) => p.created_at >= weekCutoff).length,
      month: posts.filter((p) => p.created_at >= monthCutoff).length
    }
  }, [posts])

  const visiblePosts = useMemo(() => {
    const cutoff = getFilterCutoff(filter)
    return posts.filter((p) => p.created_at >= cutoff)
  }, [posts, filter])

  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedId) ?? null,
    [posts, selectedId]
  )

  return (
    <div className="flex h-screen bg-bg">
      <Sidebar
        filter={filter}
        counts={counts}
        onFilterChange={setFilter}
        onNewEntry={() => setComposerOpen(true)}
      />

      <main className="min-w-0 flex-1 overflow-y-auto bg-bg">
        <div className="px-6 py-10">
          {visiblePosts.length === 0 ? (
            <p className="mx-auto max-w-3xl py-8 text-center text-sm text-text-faint">
              {posts.length === 0 ? 'No entries yet.' : 'Nothing in this range.'}
            </p>
          ) : (
            <TimelineFeed
              posts={visiblePosts}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>
      </main>

      {selectedPost && (
        <ThreadPanel
          post={selectedPost}
          onChange={refresh}
          onClose={() => setSelectedId(null)}
        />
      )}

      <ComposeModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPosted={refresh}
      />
    </div>
  )
}

export default App
