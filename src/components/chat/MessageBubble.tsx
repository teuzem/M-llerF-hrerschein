import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player/lazy';
import { Download, MapPin, Reply, Check, CheckCheck, Ban, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageLightbox from './ImageLightbox';
import SharedProfileCard from './SharedProfileCard';
import type { MessageWithProfile } from './ChatWindow';
import toast from 'react-hot-toast';

interface MessageBubbleProps {
  message: MessageWithProfile;
  isCurrentUser: boolean;
  onDelete?: (messageId: string) => void;
  onReply?: (message: MessageWithProfile) => void;
  allMessages?: MessageWithProfile[];
  hasTail?: boolean;
}

const renderContentWithMentions = (text: string) => {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = text.split(mentionRegex);
  return parts.map((part, index) => {
    if (index % 3 === 1) {
      const userId = parts[index + 1];
      return <Link key={index} to={`/clients/${userId}`} className="font-medium text-blue-500 hover:underline">@{part}</Link>;
    }
    if (index % 3 === 2) return null;
    return <span key={index} style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{part}</span>;
  }).filter(Boolean);
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, hasTail, onDelete, onReply, allMessages }) => {
  const { t } = useTranslation();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const alignment = isCurrentUser ? 'items-end' : 'items-start';
  const mediaUrl = message.media_url;

  // Find replied message
  const repliedMessage = message.reply_to && allMessages
    ? allMessages.find(m => String(m.id) === String(message.reply_to))
    : null;

  if (message.is_deleted) {
    return (
      <div className={`flex flex-col ${alignment}`}>
        <div className="px-4 py-2 rounded-2xl bg-gray-100 text-gray-400 italic flex items-center gap-2">
          <Ban className="w-4 h-4" /> Diese Nachricht wurde gelöscht
        </div>
        <p className="text-xs text-gray-400 mt-1 px-1">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    toast.success('Kopiert');
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(message.id);
    setShowMenu(false);
  };

  const handleReply = () => {
    if (onReply) onReply(message);
    setShowMenu(false);
  };

  const renderContent = () => {
    const hasCaption = message.content && message.content.trim() !== '';
    const mediaAndCaption = (mediaElement: React.ReactNode) => (
      <div className="flex flex-col gap-1">
        {mediaElement}
        {hasCaption && <p className="text-sm pt-1">{renderContentWithMentions(message.content)}</p>}
      </div>
    );

    if (mediaUrl) {
      switch (message.media_type) {
        case 'image':
          return mediaAndCaption(
            <>
              <ImageLightbox isOpen={isLightboxOpen} src={mediaUrl} onClose={() => setIsLightboxOpen(false)} />
              <img src={mediaUrl} alt="Geteilter Inhalt" className="rounded-lg max-w-xs cursor-pointer" onClick={() => setIsLightboxOpen(true)} />
            </>
          );
        case 'video':
          return mediaAndCaption(
            <div className="w-64"><div className="aspect-video rounded-lg overflow-hidden"><ReactPlayer url={mediaUrl} controls width="100%" height="100%" /></div></div>
          );
        case 'voice':
          return mediaAndCaption(
            <div className="w-56">
              <audio src={mediaUrl} controls className="w-full" />
            </div>
          );
        case 'file': {
          const fileName = decodeURIComponent(mediaUrl.split('/').pop() || 'Document').replace(/^\d+-/, '');
          return mediaAndCaption(
            <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/60 border border-gray-200 rounded-lg text-gray-800 hover:bg-white transition-colors w-64 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[#0055A4]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-900 truncate" title={fileName}>{fileName}</p>
                <p className="text-[11px] text-gray-500 uppercase mt-0.5">{fileName.split('.').pop() || 'Fichier'}</p>
              </div>
              <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </a>
          );
        }
        default:
          return (
            <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-german-red hover:bg-gray-200">
              <Download className="w-5 h-5" />
              <span>{hasCaption ? message.content : 'Document'}</span>
            </a>
          );
      }
    }
    if (message.location_data) {
      const { latitude, longitude } = message.location_data;
      return (
        <a href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
          <MapPin className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{t('chat.shared_location', 'Geteilter Standort')}</span>
        </a>
      );
    }
    if (message.media_type === 'profile') {
      try {
        const profileData = JSON.parse(message.content);
        return <SharedProfileCard profile={profileData} />;
      } catch (e) {
        return <p className="text-red-400 text-sm">Fehler: Profil konnte nicht angezeigt werden.</p>;
      }
    }
    return <p className="text-[14.2px] leading-[19px] whitespace-pre-wrap word-break-words">{renderContentWithMentions(message.content)}</p>;
  };

  return (
    <div
      className={`flex flex-col ${alignment} group relative w-full mb-1`}
      onContextMenu={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
    >
      <div className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        
        {/* Reply preview */}
        {repliedMessage && (
          <div className={`mb-1 px-3 py-2 rounded-lg text-xs w-full cursor-pointer hover:opacity-90 transition-opacity
            ${isCurrentUser ? 'bg-[#cbf0c4] text-[#0b141a] border-l-4 border-[#06cf9c]' : 'bg-[#f0f2f5] text-[#0b141a] border-l-4 border-[#358cb6]'}
          `}>
            <span className={`font-semibold block mb-0.5 ${isCurrentUser ? 'text-[#06cf9c]' : 'text-[#358cb6]'}`}>
              {repliedMessage.sender_profile?.full_name || t('chat.you', 'Ich')}
            </span>
            <p className="truncate text-[13px] opacity-80">{repliedMessage.content || '[Medien]'}</p>
          </div>
        )}

        <div className={`
          relative px-2.5 pt-1.5 pb-2 rounded-lg shadow-sm
          ${isCurrentUser ? 'bg-[#d9fdd3] text-[#111b21]' : 'bg-white text-[#111b21]'}
          ${hasTail ? (isCurrentUser ? 'rounded-tr-none' : 'rounded-tl-none') : ''}
          ${message.media_type === 'profile' ? 'p-0 bg-transparent shadow-none' : ''}
        `}>
          
          {/* WhatsApp Message Tails */}
          {hasTail && isCurrentUser && message.media_type !== 'profile' && (
            <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 right-[-8px] text-[#d9fdd3]">
              <path fill="currentColor" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
            </svg>
          )}
          {hasTail && !isCurrentUser && message.media_type !== 'profile' && (
            <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 left-[-8px] text-white">
              <path fill="currentColor" d="M1.533 3.568 8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
            </svg>
          )}

          <div className="flex flex-col">
            {renderContent()}
            
            {/* Inline Timestamp / Status within the bubble */}
            <div className="flex items-center justify-end gap-1 mt-1 -mb-1 float-right" style={{ shapeOutside: 'inset(calc(100% - 20px) 0 0 calc(100% - 60px))' }}>
              <span className="text-[11px] text-gray-500 font-medium">
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isCurrentUser && (
                message.read_at ? (
                  <CheckCheck className="w-[15px] h-[15px] text-[#53bdeb]" />
                ) : (
                  <Check className="w-[15px] h-[15px] text-gray-400" />
                )
              )}
            </div>
            {/* Invisible space filler for the float */}
            <span className="inline-block w-[60px] h-[15px]" aria-hidden="true"></span>
          </div>

        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div className={`absolute ${isCurrentUser ? 'right-0' : 'left-0'} top-full mt-1 bg-white shadow-[0_2px_15px_rgba(11,20,26,0.1)] rounded-lg py-2 z-20 min-w-[160px] max-w-[200px] border border-gray-100`}>
          <button onClick={handleCopy} className="w-full flex items-center px-5 py-2.5 text-[14px] text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors">
            {t('chat.action_copy', 'Kopieren')}
          </button>
          <button onClick={handleReply} className="w-full flex items-center px-5 py-2.5 text-[14px] text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors">
            {t('chat.action_reply', 'Antworten')}
          </button>
          {isCurrentUser && onDelete && (
            <button onClick={handleDelete} className="w-full flex items-center px-5 py-2.5 text-[14px] text-red-500 hover:bg-[#f5f6f6] transition-colors">
              {t('chat.action_delete', 'Löschen')}
            </button>
          )}
        </div>
      )}

      {/* Action buttons on hover (Desktop only) */}
      <div className={`absolute ${isCurrentUser ? 'left-[-40px]' : 'right-[-40px]'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex`}>
        <button onClick={handleReply} className="p-1.5 bg-white shadow-md rounded-full hover:bg-gray-50 text-gray-500 transition-colors" title={t('chat.action_reply', 'Antworten')}>
          <Reply className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default MessageBubble;
