import React from 'react';
import { ContentItem } from '../types/ContentItem';
import { ContentCard } from './ContentCard';
import { DiscordUser } from '../types/User';

interface ContentBoardProps {
  items: ContentItem[];
  onDeleteItem: (id: string) => void;
  onLikeItem: (id: string) => void;
  onAddComment: (itemId: string, content: string, parentId?: string) => void;
  onLikeComment: (itemId: string, commentId: string) => void;
  currentUser: DiscordUser | null;
}

export const ContentBoard: React.FC<ContentBoardProps> = ({ 
  items, 
  onDeleteItem, 
  onLikeItem,
  onAddComment,
  onLikeComment,
  currentUser
}) => {
  // Sort by a mix of newest and most popular (likes + recency)
  const sortedItems = [...items].sort((a, b) => {
    const now = Date.now();
    const hoursA = Math.min((now - new Date(a.createdAt).getTime()) / 36e5, 48);
    const hoursB = Math.min((now - new Date(b.createdAt).getTime()) / 36e5, 48);
    // Popularity: 2 points if liked, plus sum of comment likes
    const likesA = (a.likeState === 'liked' ? 2 : 0) + a.comments.reduce((sum, c) => sum + (c.likes || 0), 0);
    const likesB = (b.likeState === 'liked' ? 2 : 0) + b.comments.reduce((sum, c) => sum + (c.likes || 0), 0);
    const scoreA = likesA + (48 - hoursA);
    const scoreB = likesB + (48 - hoursB);
    return scoreB - scoreA;
  });

  return (
    <div className="masonry-grid">
      <style>{`
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          align-items: start;
        }
      `}</style>
      {sortedItems.map((item, idx) => (
        <ContentCard 
          key={item.id || idx}
          item={item} 
          onDelete={onDeleteItem}
          onLike={onLikeItem}
          onAddComment={onAddComment}
          onLikeComment={onLikeComment}
          currentUser={currentUser}
          className="break-inside-avoid"
        />
      ))}
    </div>
  );
};