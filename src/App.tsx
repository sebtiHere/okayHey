import React, { useState, useEffect, useRef } from 'react';
import { Plus, Image, FileText } from 'lucide-react';
import { ContentBoard } from './components/ContentBoard';
import { AddContentModal } from './components/AddContentModal';
import { AuthButton } from './components/AuthButton';
import { ActiveUsersPanel } from './components/ActiveUsersPanel';
import { StatusPanel } from './components/StatusPanel';
import { WebsiteStatus } from './components/WebsiteStatus';
import { ContentItem, Comment } from './types/ContentItem';
import { DiscordUser } from './types/User';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'image' | 'text'>('image');
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content`, { credentials: 'include' });
        const data = await response.json();
        const parsedData = data.map((item: ContentItem) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          comments: item.comments.map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
            replies: comment.replies?.map((reply: any) => ({
              ...reply,
              createdAt: new Date(reply.createdAt),
            })) || [],
          })),
        }));
        setItems(parsedData);
      } catch (error) {
        // console.error('Error fetching content:', error);
      }
    };

    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/me`, { credentials: 'include' });
        const data = await response.json();
        setUser(data.user);
      } catch {
        setUser(null);
      }
    };

    const handleDocumentClick = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastClickTime.current;
      if (timeDiff < 300) {
        clickCount.current += 1;
      } else {
        clickCount.current = 1;
      }
      lastClickTime.current = currentTime;
      if (user) {
        // console.log('User data for admin check: ', user.username, user.isAdmin);
      }

      if (clickCount.current === 3 && user && user.username === 'sebtii' && user.isAdmin === 1) {
        setShowAdminPanel(true);
        clickCount.current = 0;
        // console.log('Admin panel opened!');
      }
    };

    window.addEventListener('click', handleDocumentClick);

    fetchContent();
    checkAuthStatus();

    return () => {
      window.removeEventListener('click', handleDocumentClick);
    };
  }, [user]);

  const handleAddContent = async (newItem: Omit<ContentItem, 'id' | 'createdAt' | 'likeState' | 'comments' | 'authorId' | 'authorUsername' | 'authorAvatar'>, file?: File | null) => {
    if (!user) return alert('Login required.');
    const newContentId = Date.now().toString();
    try {
      const response = file ? await fetch(`${import.meta.env.VITE_API_URL}/api/content`, {
        method: 'POST',
        body: (() => {
          const fd = new FormData();
          fd.append('id', newContentId);
          fd.append('type', newItem.type);
          fd.append('title', newItem.title);
          fd.append('content', newItem.content);
          newItem.description && fd.append('description', newItem.description);
          fd.append('image', file);
          return fd;
        })(),
        credentials: 'include',
      }) : await fetch(`${import.meta.env.VITE_API_URL}/api/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, id: newContentId }),
        credentials: 'include',
      });

      if (response.status === 201) {
        const addedItem = await response.json();
        setItems(prev => [{ ...addedItem, createdAt: new Date(addedItem.createdAt), comments: [] }, ...prev]);
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to add content.');
      }
    } catch (err) {
      // console.error(err);
      alert('Failed to add content.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, { credentials: 'include' });
      setUser(null);
    } catch (err) {
      // console.error('Error logging out:', err);
      alert('Failed to log out.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!user) return alert('Login required.');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete content: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      // console.error('Error deleting content:', err);
      alert('Failed to delete content due to a network error.');
    }
  };

  const handleLikeItem = async (id: string) => {
    if (!user) return alert('Login required.');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      setItems(prev => prev.map(item => item.id === id ? { ...item, likeState: data.newLikeState } : item));
    } catch {
      alert('Failed to like item.');
    }
  };

  const handleAddComment = async (itemId: string, content: string, parentId?: string) => {
    if (!user) return alert('Login required.');
    const commentId = `c${Date.now()}`;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/${itemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, content, parentId }),
        credentials: 'include',
      });
      const newComment = await response.json();
      setItems(prev => prev.map(item => {
        if (item.id !== itemId) return item;
        const updatedComment = { ...newComment, createdAt: new Date(newComment.createdAt) };
        if (parentId) {
          return {
            ...item,
            comments: item.comments.map(comment =>
              comment.id === parentId
                ? { ...comment, replies: [...(comment.replies || []), updatedComment] }
                : comment
            ),
          };
        } else {
          return { ...item, comments: [...item.comments, updatedComment] };
        }
      }));
    } catch (err) {
      // console.error('Error adding comment:', err);
    }
  };

  const handleLikeComment = async (itemId: string, commentId: string) => {
    if (!user) return alert('Login required.');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/content/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      setItems(prev => prev.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          comments: item.comments.map(comment => {
            if (comment.id === commentId) return { ...comment, likes: comment.likes + 1 };
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => reply.id === commentId ? { ...reply, likes: reply.likes + 1 } : reply),
              };
            }
            return comment;
          }),
        };
      }));
    } catch {
      alert('Failed to like comment.');
    }
  };

  const openModal = (type: 'image' | 'text') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#221F22]">
      <header className="bg-[#2D2A2E] border-b border-[#5B595C] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-[#FCFCFA] font-mono">sebti board</h1>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button onClick={() => openModal('image')} className="inline-flex items-center px-2 sm:px-4 py-2 border border-[#5B595C] text-xs sm:text-sm font-medium font-mono text-[#FCFCFA] bg-[#2D2A2E] hover:bg-[#403E41] hover:border-[#A9DC76] transition-all duration-200">
                <Image className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">ADD_</span>IMAGE
              </button>
              <button onClick={() => openModal('text')} className="inline-flex items-center px-2 sm:px-4 py-2 border border-[#5B595C] text-xs sm:text-sm font-medium font-mono text-[#FCFCFA] bg-[#2D2A2E] hover:bg-[#403E41] hover:border-[#78DCE8] transition-all duration-200">
                <FileText className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">ADD_</span>TEXT
              </button>
              <AuthButton user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="xl:w-1/6 w-full">
            <StatusPanel />
          </div>
          <div className="xl:w-4/6 w-full">
            <WebsiteStatus />
            <div className="space-y-8">
              <ContentBoard 
                items={items} 
                onDeleteItem={handleDeleteItem}
                onLikeItem={handleLikeItem}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
                currentUser={user}
              />
            </div>
          </div>
          <div className="xl:w-1/6 w-full">
            <ActiveUsersPanel currentUser={user} />
          </div>
        </div>
      </main>

      {showAdminPanel && user && user.username === '.sebtii' && user.isAdmin === 1 && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      <AddContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddContent}
        type={modalType}
      />
    </div>
  );
}

export default App;
