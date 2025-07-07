export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  createdAt: Date;
  likes: number;
  replies?: Comment[];
}

export interface ContentItem {
  id: string;
  type: 'text' | 'image';
  title: string;
  content: string; // For text content or image URL (if type is 'image' and not a file upload)
  description?: string;
  createdAt: Date;
  likeState: 'liked' | 'none';
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  comments: Comment[];
  imageUrl?: string;
}