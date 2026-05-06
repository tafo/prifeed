import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

const api = {
  posts: {
    create: (body: string): Promise<Post> => ipcRenderer.invoke('posts:create', body),
    list: (): Promise<PostWithComments[]> => ipcRenderer.invoke('posts:list'),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('posts:delete', id),
    update: (id: string, body: string): Promise<void> =>
      ipcRenderer.invoke('posts:update', id, body)
  },
  comments: {
    create: (postId: string, body: string): Promise<Comment> =>
      ipcRenderer.invoke('comments:create', postId, body),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('comments:delete', id),
    update: (id: string, body: string): Promise<void> =>
      ipcRenderer.invoke('comments:update', id, body)
  }
}

export type Api = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
