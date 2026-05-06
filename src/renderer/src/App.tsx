import { useEffect, useMemo, useState } from 'react'
import type { PostWithComments } from '@renderer/types'
import { type Filter, getFilterCutoff } from '@renderer/lib/time'
import { Sidebar } from '@renderer/components/Sidebar'
import { PostComposer } from '@renderer/components/PostComposer'
import { PostCard } from '@renderer/components/PostCard'

function App(): React.JSX.Element {
  const [posts, setPosts] = useState<PostWithComments[]>([])
  const [filter, setFilter] = useState<Filter>('all')

  async function refresh(): Promise<void> {
    setPosts(await window.api.posts.list())
  }

  useEffect(() => {
    refresh()
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

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar filter={filter} counts={counts} onFilterChange={setFilter} />

      <main className="flex-1 bg-bg">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <PostComposer onPosted={refresh} />

          <section className="space-y-4">
            {visiblePosts.length === 0 && (
              <p className="py-8 text-center text-sm text-text-faint">
                {posts.length === 0 ? 'No entries yet.' : 'Nothing in this range.'}
              </p>
            )}
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} onChange={refresh} />
            ))}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
