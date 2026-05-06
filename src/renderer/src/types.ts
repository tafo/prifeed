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
