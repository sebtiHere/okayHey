import React, { useState } from 'react';
import { X, ThumbsUp, Reply, MessageCircle } from 'lucide-react';
import { ContentItem, Comment } from '../types/ContentItem';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
  onAddComment: (itemId: string, content: string, parentId?: string) => void;
  onLikeComment: (itemId: string, commentId: string) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  item,
  onAddComment,
  onLikeComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(item.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onAddComment(item.id, replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedComments = [...item.comments].sort((a, b) => b.likes - a.likes);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2D2A2E] w-full max-w-2xl border border-[#5B595C] max-h-[90vh] flex flex-col shadow-2xl rounded-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#5B595C]">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-[#78DCE8]" />
            <h2 className="text-lg font-semibold font-mono text-[#FCFCFA]">
              COMMENTS ({item.comments.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#727072] hover:text-[#FF6188] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-4 border-b border-[#5B595C] bg-[#221F22]">
          <h3 className="font-mono text-sm font-semibold text-[#FCFCFA] mb-2">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-[#A9DC76] font-mono">
              {item.description}
            </p>
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sortedComments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-[#727072] mb-3" />
              <p className="text-[#727072] font-mono text-sm">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            sortedComments.map((comment) => (
              <div key={comment.id} className="bg-[#221F22] border border-[#5B595C] rounded p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {comment.authorAvatar && (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${comment.authorId}/${comment.authorAvatar}.png`}
                        alt="Comment Author Avatar"
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-sm font-mono text-[#A9DC76] font-semibold">
                      {comment.authorUsername}
                    </span>
                    <span className="text-xs text-[#727072] font-mono">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onLikeComment(item.id, comment.id)}
                      className="flex items-center space-x-1 text-xs font-mono text-[#727072] hover:text-[#78DCE8] transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center space-x-1 text-xs font-mono text-[#727072] hover:text-[#AB9DF2] transition-colors"
                    >
                      <Reply className="w-3 h-3" />
                      <span>REPLY</span>
                    </button>
                  </div>
                </div>
                
                <p className="text-sm font-mono text-[#FCFCFA] leading-relaxed mb-3">
                  {comment.content}
                </p>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3 space-y-2">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.authorUsername}...`}
                      rows={2}
                      className="w-full px-3 py-2 border border-[#5B595C] bg-[#2D2A2E] font-mono text-sm text-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-[#AB9DF2] focus:border-transparent resize-none placeholder-[#727072] rounded"
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-3 py-1 text-xs font-mono text-[#727072] hover:text-[#FCFCFA] transition-colors"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        disabled={!replyContent.trim()}
                        className="px-3 py-1 text-xs font-mono text-[#221F22] bg-[#AB9DF2] hover:bg-[#AB9DF2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded"
                      >
                        REPLY
                      </button>
                    </div>
                  </form>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-[#5B595C] space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-[#2D2A2E] border border-[#5B595C] rounded p-2">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            {reply.authorAvatar && (
                              <img
                                src={`https://cdn.discordapp.com/avatars/${reply.authorId}/${reply.authorAvatar}.png`}
                                alt="Reply Author Avatar"
                                className="w-4 h-4 rounded-full"
                              />
                            )}
                            <span className="text-xs font-mono text-[#78DCE8] font-semibold">
                              {reply.authorUsername}
                            </span>
                            <span className="text-xs text-[#727072] font-mono">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <button
                            onClick={() => onLikeComment(item.id, reply.id)}
                            className="flex items-center space-x-1 text-xs font-mono text-[#727072] hover:text-[#78DCE8] transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{reply.likes}</span>
                          </button>
                        </div>
                        <p className="text-xs font-mono text-[#FCFCFA] leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <div className="p-4 border-t border-[#5B595C]">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 border border-[#5B595C] bg-[#221F22] font-mono text-sm text-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-[#78DCE8] focus:border-transparent resize-none placeholder-[#727072] rounded"
            />
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 text-sm font-medium font-mono text-[#221F22] bg-[#78DCE8] hover:bg-[#78DCE8]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded"
              >
                POST_COMMENT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};