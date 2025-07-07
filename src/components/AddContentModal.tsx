import React, { useState, useRef } from 'react';
import { X, Upload, Link } from 'lucide-react';
import { ContentItem } from '../types/ContentItem';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ContentItem, 'id' | 'createdAt' | 'likeState' | 'comments' | 'authorId' | 'authorUsername' | 'authorAvatar'>, file?: File | null) => void;
  type: 'image' | 'text';
}

export const AddContentModal: React.FC<AddContentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    if (type === 'image') {
      if (imageInputType === 'url' && !content.trim()) return;
      if (imageInputType === 'file' && !selectedFile) return;
    } else {
      if (!content.trim()) return;
    }

    if (type === 'image' && imageInputType === 'file' && selectedFile) {
      onSubmit(
        {
          type,
          title: title.trim(),
          content: '', // Content will be the file, so send empty string for content text
          description: description.trim() || undefined,
        },
        selectedFile
      );
    } else {
      onSubmit({
        type,
        title: title.trim(),
        content: content.trim(),
        description: description.trim() || undefined,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setDescription('');
    setImageInputType('url');
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2D2A2E] w-full max-w-md border border-[#5B595C] max-h-[90vh] flex flex-col shadow-2xl rounded-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#5B595C]">
          <h2 className="text-lg font-semibold font-mono text-[#FCFCFA]">
            ADD_{type.toUpperCase()}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#727072] hover:text-[#FF6188] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium font-mono text-[#A9DC76] mb-1">
                TITLE*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#5B595C] bg-[#221F22] font-mono text-sm text-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-[#A9DC76] focus:border-transparent placeholder-[#727072] rounded"
                placeholder="Enter title..."
                required
              />
            </div>

            {/* Image Input Type Selection */}
            {type === 'image' && (
              <div>
                <label className="block text-sm font-medium font-mono text-[#78DCE8] mb-2">
                  IMAGE_SOURCE*
                </label>
                <div className="flex space-x-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageInputType('url')}
                    className={`flex-1 px-3 py-2 text-sm font-mono border rounded transition-all duration-200 ${
                      imageInputType === 'url'
                        ? 'bg-[#78DCE8] text-[#221F22] border-[#78DCE8]'
                        : 'bg-[#221F22] text-[#FCFCFA] border-[#5B595C] hover:border-[#78DCE8]'
                    }`}
                  >
                    <Link className="w-4 h-4 inline mr-2" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType('file')}
                    className={`flex-1 px-3 py-2 text-sm font-mono border rounded transition-all duration-200 ${
                      imageInputType === 'file'
                        ? 'bg-[#78DCE8] text-[#221F22] border-[#78DCE8]'
                        : 'bg-[#221F22] text-[#FCFCFA] border-[#5B595C] hover:border-[#78DCE8]'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    DEVICE
                  </button>
                </div>
              </div>
            )}

            {/* Content Input */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium font-mono text-[#78DCE8] mb-1">
                {type === 'image' 
                  ? (imageInputType === 'url' ? 'IMAGE_URL*' : 'UPLOAD_IMAGE*')
                  : 'TEXT_CONTENT*'
                }
              </label>
              
              {type === 'image' && imageInputType === 'url' ? (
                <input
                  type="url"
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-[#5B595C] bg-[#221F22] font-mono text-sm text-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-[#78DCE8] focus:border-transparent placeholder-[#727072] rounded"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              ) : type === 'image' && imageInputType === 'file' ? (
                <div>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-[#5B595C] rounded-lg p-4 sm:p-6 text-center hover:border-[#78DCE8] transition-colors cursor-pointer touch-manipulation"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="text-[#A9DC76] font-mono text-xs sm:text-sm break-all">
                          ✓ {selectedFile.name}
                        </div>
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-24 sm:max-h-32 mx-auto rounded border border-[#5B595C]"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-[#727072]" />
                        <div className="text-[#FCFCFA] font-mono text-xs sm:text-sm">
                          Tap to select image
                        </div>
                        <div className="text-[#727072] font-mono text-xs">
                          JPG, PNG, GIF, WebP
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-[#5B595C] bg-[#221F22] font-mono text-sm text-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-[#78DCE8] focus:border-transparent resize-none placeholder-[#727072] rounded"
                  placeholder="Enter your text content..."
                  required
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium font-mono text-[#AB9DF2] mb-1">
                DESCRIPTION
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-[#5B595C] bg-[#221F22] font-mono text-sm text-[#FCFCFA] focus:outline-none focus:ring-2 focus:ring-[#AB9DF2] focus:border-transparent resize-none placeholder-[#727072] rounded"
                placeholder="Optional description..."
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-[#5B595C]">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 sm:px-4 text-sm font-medium font-mono text-[#FCFCFA] bg-[#2D2A2E] border border-[#5B595C] hover:bg-[#403E41] hover:border-[#FF6188] transition-all duration-200 rounded"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-2 sm:px-4 text-sm font-medium font-mono text-[#221F22] bg-[#A9DC76] border border-[#A9DC76] hover:bg-[#A9DC76]/90 hover:shadow-lg hover:shadow-[#A9DC76]/20 transition-all duration-200 rounded"
            >
              ADD_{type.toUpperCase()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};