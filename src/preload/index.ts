import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export interface Post {
  id: string
  body: string
  created_at: number
  updated_at: number
}

const api = {
  posts: {
    create: (body: string): Promise<Post> => ipcRenderer.invoke('posts:create', body),
    list: (): Promise<Post[]> => ipcRenderer.invoke('posts:list'),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('posts:delete', id)
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
