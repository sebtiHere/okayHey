import React, { useState } from 'react';
import { X, Calendar, Hash, Heart, MessageCircle, Reply, ThumbsUp } from 'lucide-react';
import { ContentItem, Comment } from '../types/ContentItem';
import { CommentsModal } from './CommentsModal';
import { DiscordUser } from '../types/User';

interface ContentCardProps {
  item: ContentItem;
  onDelete: (id: string) => void;
  onLike: (id: string) => void;
  onAddComment: (itemId: string, content: string, parentId?: string) => void;
  onLikeComment: (itemId: string, commentId: string) => void;
  currentUser: DiscordUser | null;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
  item, 
  onDelete, 
  onLike, 
  onAddComment, 
  onLikeComment, 
  currentUser,
  className = ''
}) => {
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showQuickComment, setShowQuickComment] = useState(false);
  const [quickComment, setQuickComment] = useState('');
  const [showFullText, setShowFullText] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getHeartStyles = () => {
    switch (item.likeState) {
      case 'liked':
        return 'text-[#FF6188] fill-[#FF6188] animate-pulse';
      default:
        return 'text-[#727072] hover:text-[#FF6188]';
    }
  };

  const getHeartAnimation = () => {
    if (item.likeState === 'liked') {
      return 'animate-bounce';
    }
    return '';
  };

  const getMostPopularComment = (): Comment | null => {
    if (item.comments.length === 0) return null;
    return item.comments.reduce((prev, current) => 
      (prev.likes > current.likes) ? prev : current
    );
  };

  const handleQuickCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickComment.trim()) {
      onAddComment(item.id, quickComment.trim());
      setQuickComment('');
      setShowQuickComment(false);
    }
  };

  const popularComment = getMostPopularComment();

  return (
    <div className={`break-inside-avoid mb-6 bg-[#2D2A2E] border border-[#5B595C] overflow-hidden group hover:shadow-2xl hover:shadow-[#A9DC76]/10 hover:border-[#A9DC76] transition-all duration-300 relative rounded-xl max-w-[420px] min-w-[320px] w-full flex flex-col mx-auto ${className}`}
      style={{ boxSizing: 'border-box', padding: '2px' }}>
      {/* Card Header */}
      <div className="flex items-start justify-between p-3 border-b border-[#5B595C]">
        <div className="flex-1">
          <h3 className="font-mono text-base font-semibold text-[#FCFCFA] mb-1">
            {item.title}
          </h3>
          <div className="flex items-center text-sm text-[#727072] font-mono flex-wrap gap-2">
            <span className="flex items-center">
              <Hash className="w-4 h-4 mr-1" />
              {item.id}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(item.createdAt)}
            </span>
            {item.authorUsername && (
              <span className="flex items-center">
                {item.authorAvatar && (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${item.authorId}/${item.authorAvatar}.png`}
                    alt="Author Avatar"
                    className="w-5 h-5 rounded-full mr-1"
                  />
                )}
                by <span className="text-[#AB9DF2] ml-1">{item.authorUsername}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => onLike(item.id)}
            className={`transition-all duration-200 ${getHeartStyles()} ${getHeartAnimation()}`}
          >
            <Heart className="w-5 h-5" />
          </button>
          {currentUser && currentUser.id === item.authorId && (
            <button
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#727072] hover:text-[#FF6188]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-start">
        {item.type === 'image' && item.imageUrl && (
          <div className="relative w-full bg-[#393539] overflow-hidden border border-[#5B595C] rounded-lg mb-2">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${item.imageUrl}`}
              alt={item.title}
              className="w-full h-auto object-cover"
              style={{ display: 'block', maxHeight: '600px' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Error';
              }}
            />
          </div>
        )}

        {item.type === 'text' && (
          <div className="bg-[#221F22] p-3 mt-2 border border-[#5B595C] rounded-md flex flex-col items-start">
            <pre className="text-sm font-mono text-[#FCFCFA] whitespace-pre-wrap break-words w-full">
              {showFullText || item.content.length <= 500
                ? item.content
                : item.content.slice(0, 500) + '...'}
            </pre>
            {item.content.length > 500 && (
              <button
                className="mt-2 text-xs font-mono text-[#78DCE8] hover:underline focus:outline-none"
                onClick={() => setShowFullText((v) => !v)}
              >
                {showFullText ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {item.description && (
          <p className="text-sm text-[#A9DC76] font-mono mt-3 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Popular Comment Preview */}
      {popularComment && (
        <div className="px-4 pb-3">
          <div className="bg-[#221F22] border border-[#5B595C] rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#AB9DF2]">MOST POPULAR</span>
              <div className="flex items-center text-xs text-[#727072] font-mono">
                <ThumbsUp className="w-3 h-3 mr-1" />
                <span>{popularComment.likes}</span>
              </div>
            </div>
            <p className="text-sm font-mono text-[#FCFCFA] leading-relaxed">
              {popularComment.content}
            </p>
            <div className="text-xs text-[#727072] font-mono mt-2 flex items-center">
              {popularComment.authorAvatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${popularComment.authorId}/${popularComment.authorAvatar}.png`}
                  alt="Comment Author Avatar"
                  className="w-4 h-4 rounded-full mr-1"
                />
              )}
              by <span className="text-[#AB9DF2] ml-1">{popularComment.authorUsername}</span>
            </div>
          </div>
        </div>
      )}

      {/* Comment Buttons + Quick Comment Form */}
      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQuickComment(!showQuickComment)}
            className="flex items-center px-3 py-1.5 text-xs font-mono text-[#FCFCFA] bg-[#221F22] border border-[#5B595C] hover:border-[#78DCE8] hover:bg-[#2D2A2E] transition rounded"
          >
            <Reply className="w-3 h-3 mr-1" />
            RESPOND
          </button>
          <button
            onClick={() => setShowCommentsModal(true)}
            className="flex items-center px-3 py-1.5 text-xs font-mono text-[#FCFCFA] bg-[#221F22] border border-[#5B595C] hover:border-[#A9DC76] hover:bg-[#2D2A2E] transition rounded"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            VIEW_ALL ({item.comments.length})
          </button>
        </div>

        {showQuickComment && (
          <form onSubmit={handleQuickCommentSubmit} className="space-y-2">
            <textarea
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="w-full px-3 py-2 border border-[#5B595C] bg-[#221F22] font-mono text-sm text-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-[#78DCE8] focus:border-transparent resize-none placeholder-[#727072] rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowQuickComment(false);
                  setQuickComment('');
                }}
                className="px-3 py-1 text-xs font-mono text-[#727072] hover:text-[#FCFCFA]"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={!quickComment.trim()}
                className="px-3 py-1 text-xs font-mono text-[#221F22] bg-[#78DCE8] hover:bg-[#78DCE8]/90 disabled:opacity-50 rounded"
              >
                POST
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-[#727072] font-mono">
          <span>TYPE: <span className="text-[#78DCE8]">{item.type ? item.type.toUpperCase() : 'UNKNOWN'}</span></span>
          <div className="flex items-center space-x-3">
            <span>LEN: <span className="text-[#AB9DF2]">{item.content ? item.content.length : 0}</span></span>
            {item.likeState === 'liked' && (
              <span className="text-[#FF6188]">LIKED</span>
            )}
          </div>
        </div>
      </div>

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        item={item}
        onAddComment={onAddComment}
        onLikeComment={onLikeComment}
      />
    </div>
  );
};
