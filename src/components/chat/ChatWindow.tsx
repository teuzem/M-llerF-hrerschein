import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, Message, Profile, PresenceState, Conversation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ArrowLeft, Search, X, ChevronUp, MoreVertical, UploadCloud } from 'lucide-react';
import ParticipantProfileView from './ParticipantProfileView';
import MediaSendPreview from './MediaSendPreview';

interface ChatWindowProps {
  conversation: Conversation;
  onRefresh: () => void;
  onBack: () => void;
}

export type MessageWithProfile = Message & {
  sender_profile: Pick<Profile, 'full_name' | 'avatar_url'> | null;
};

const PAGE_SIZE = 50;

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'profile'>('chat');
  const [participant, setParticipant] = useState<Profile | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState<MessageWithProfile | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [filesToPreview, setFilesToPreview] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const conversationId = conversation.id;

  const fetchMessages = useCallback(async (offset = 0, append = false) => {
    if (!user) return;
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      if (offset === 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .is('read_at', null)
          .neq('user_id', user.id);
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      if ((messagesData?.length || 0) < PAGE_SIZE) setHasMore(false);

      const sortedData = (messagesData || []).reverse();
      const userIds = [...new Set(sortedData.map(msg => msg.user_id))];
      const profilesMap = new Map<string, Pick<Profile, 'id' | 'full_name' | 'avatar_url'>>();

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        profilesData?.forEach(p => profilesMap.set(p.id, p));
      }
      
      const enrichedMessages: MessageWithProfile[] = sortedData.map(msg => ({
        ...msg,
        sender_profile: profilesMap.get(msg.user_id) || null,
      }));

      if (append) {
        setMessages(prev => [...enrichedMessages, ...prev]);
      } else {
        setMessages(enrichedMessages);
      }
    } catch (err) {
      console.error('Error in fetchMessages:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [conversationId, user]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    await fetchMessages(messages.length, true);
  }, [hasMore, loadingMore, messages.length, fetchMessages]);

  useEffect(() => {
    // Replaced initialParticipant with conversation.other_participant
    if (conversation.other_participant?.id) {
      supabase.from('profiles').select('*').eq('id', conversation.other_participant.id).single().then(({ data }) => {
        if (data) setParticipant(data);
      });
    }
    fetchMessages();
  }, [fetchMessages, conversation]);

  useEffect(() => {
    if (!loading) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!participant?.id) return;

    const presenceChannel = supabase.channel(`online-users:${participant.id}`);
    const typingChannel = supabase.channel(`typing-${conversationId}`);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState<PresenceState>();
        setIsOnline(!!presenceState[participant.id]);
      })
      .subscribe();

    typingChannel
      .on('broadcast', { event: 'TYPING_START' }, (payload: any) => {
        if (payload.payload?.user_id === participant.id) setIsTyping(true);
      })
      .on('broadcast', { event: 'TYPING_STOP' }, (payload: any) => {
        if (payload.payload?.user_id === participant.id) setIsTyping(false);
      })
      .subscribe();
      
    const messageChannel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          const newMessage = payload.new as Message;
          const senderProfile = newMessage.user_id === user?.id 
            ? null
            : participant;
          
          const enrichedNewMessage: MessageWithProfile = {
            ...newMessage,
            sender_profile: senderProfile ? { full_name: senderProfile.full_name || '', avatar_url: senderProfile.avatar_url || undefined } : null,
          };
          
          setMessages(prev => {
            // Prevent duplicates
            if (prev.some(m => String(m.id) === String(newMessage.id))) return prev;
            return [...prev, enrichedNewMessage];
          });
          
          if (newMessage.user_id !== user?.id) {
            await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', newMessage.id);
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => prev.map(m => String(m.id) === String(updatedMessage.id) ? { ...m, ...updatedMessage } : m));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [conversationId, user, participant]);

  const handleDeleteMessage = async (messageId: string) => {
    await supabase.from('messages').update({ is_deleted: true, content: '' }).eq('id', messageId);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_deleted: true, content: '' } : m));
  };



  const filteredMessages = searchQuery
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const renderPresence = () => {
    if (isTyping) return <span className="text-sm text-blue-500 animate-pulse">tippt...</span>;
    if (isOnline) return <span className="text-sm text-green-500">Online</span>;
    if (participant?.last_seen) {
      const lastSeenDate = new Date(participant.last_seen);
      const now = new Date();
      const diffMinutes = Math.round((now.getTime() - lastSeenDate.getTime()) / 60000);
      if (diffMinutes < 1) return <span className="text-sm text-gray-400">Gerade gesehen</span>;
      if (diffMinutes < 60) return <span className="text-sm text-gray-400">Vor {diffMinutes} Min. gesehen</span>;
      if (diffMinutes < 1440) return <span className="text-sm text-gray-400">Vor {Math.floor(diffMinutes / 60)} Std. gesehen</span>;
      return <span className="text-sm text-gray-400">Zuletzt {lastSeenDate.toLocaleDateString()}</span>;
    }
    return <span className="text-sm text-gray-400">Offline</span>;
  };

  if (viewMode === 'profile' && participant) {
    return <ParticipantProfileView participant={participant} onBack={() => setViewMode('chat')} />;
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set inactive if leaving the main container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragActive(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFilesToPreview(Array.from(e.dataTransfer.files).slice(0, 10));
    }
  };

  // Group messages by date for date headers
  const getDateKey = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return t('chat.today');
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return t('chat.yesterday');
    
    return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#EFEAE2] relative z-10 w-full overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <MediaSendPreview isOpen={filesToPreview.length > 0} onClose={() => setFilesToPreview([])} files={filesToPreview} conversationId={conversationId} />
      
      {isDragActive && (
        <div className="absolute inset-x-0 top-[60px] bottom-[70px] z-50 bg-white/60 backdrop-blur-sm border-2 border-dashed border-[#0055A4] rounded-xl m-4 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="w-20 h-20 bg-blue-100/80 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <UploadCloud className="w-10 h-10 text-[#0055A4]" />
          </div>
          <h3 className="text-2xl font-bold text-[#0055A4] drop-shadow-sm">Glissez-déposez vos fichiers ici</h3>
          <p className="text-gray-500 mt-2 font-medium">Images, Vidéos, Audios ou Documents</p>
        </div>
      )}

      {/* Background patterned overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'url("https://i.imgur.com/GjTIf0T.png")', backgroundRepeat: 'repeat' }}>
      </div>

      {/* Header */}
      <div className="bg-[#F0F2F5] px-4 py-2 flex items-center justify-between border-b border-gray-200 z-10 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-gray-200 md:hidden text-gray-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-grow flex items-center cursor-pointer max-w-[calc(100%-80px)] group" onClick={() => setViewMode('profile')}>
            {participant ? (
              <>
                <div className="relative flex-shrink-0">
                  <Avatar name={participant.full_name || '?'} avatarUrl={participant.avatar_url} size="md" />
                  {isOnline && <span className="absolute bottom-1 right-1 block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-[#F0F2F5]" />}
                </div>
                <div className="ml-4 flex flex-col justify-center min-w-0">
                  <h3 className="text-[16px] text-[#111B21] font-medium leading-5 truncate">{participant.full_name || 'Unknown User'}</h3>
                  <div className="truncate mt-0.5 min-h-[16px]">
                    {renderPresence()}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="ml-4 space-y-2"><div className="w-32 h-3.5 bg-gray-300 rounded"></div><div className="w-20 h-2.5 bg-gray-300 rounded"></div></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-4 text-[#54656F] flex-shrink-0">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-gray-200 rounded-full transition-colors" title={t('chat.search_messages')}>
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors hidden sm:block delay-100">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search bar inside header area */}
      {searchOpen && (
        <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center gap-3 z-10 shadow-sm animate-in slide-in-from-top-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('chat.search_messages')}
            className="flex-1 bg-gray-100 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0055A4]"
            autoFocus
          />
          {searchQuery && (
            <span className="text-xs text-gray-500 shrink-0">{t('chat.results_count', { count: filteredMessages.length })}</span>
          )}
          <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef} 
        className="flex-grow p-4 overflow-y-auto z-10 custom-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {hasMore && !loading && (
          <div className="flex justify-center mb-6 mt-2">
            <button 
              onClick={loadMore} 
              disabled={loadingMore} 
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 px-4 py-1.5 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow rounded-full transition-all border border-gray-100"
            >
              {loadingMore ? <LoadingSpinner /> : <><ChevronUp className="w-3 h-3" /> {t('chat.load_more')}</>}
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="flex-grow flex items-center justify-center h-full"><LoadingSpinner /></div>
        ) : (
          <div className="flex flex-col space-y-1.5 pb-2">
            <div className="flex justify-center my-6">
              <div className="bg-[#FFEECD] text-[#54656F] text-xs px-4 py-2 rounded-lg max-w-[85%] text-center shadow-sm font-medium">
                🔒 {t('chat.encryption_notice', 'Messages and calls are end-to-end encrypted.')}
              </div>
            </div>

            {filteredMessages.map((msg, idx) => {
              const showDate = idx === 0 || getDateKey(filteredMessages[idx - 1].created_at) !== getDateKey(msg.created_at);
              const isCurrentUser = String(msg.user_id) === String(user?.id);
              
              const hasTail = idx === 0 || showDate || filteredMessages[idx - 1].user_id !== msg.user_id;
              const extraMargin = (idx > 0 && !showDate && filteredMessages[idx - 1].user_id !== msg.user_id) ? 'mt-2' : '';

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm shadow-sm text-[#54656F] text-xs font-medium rounded-lg uppercase tracking-wider">
                        {getDateKey(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div className={`${extraMargin}`}>
                    <MessageBubble
                      message={msg}
                      isCurrentUser={isCurrentUser}
                      onDelete={handleDeleteMessage}
                      onReply={setReplyTo}
                      allMessages={messages}
                      hasTail={hasTail}
                    />
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} className="h-4 w-full" />
          </div>
        )}
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="px-5 py-3 border-t bg-[#F0F2F5] flex items-center gap-3 z-10 shadow-sm relative">
          <div className="w-1 h-full absolute left-0 top-0 bottom-0 bg-[#0055A4]"></div>
          <div className="flex-1 min-w-0 pl-1">
            <div className="text-sm font-semibold text-[#0055A4] mb-0.5">{t('chat.reply_to')}</div>
            <div className="text-sm text-gray-600 truncate">{replyTo.content || '[Media]'}</div>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-[#F0F2F5] border-t border-gray-200 z-10 shadow-inner">
        <MessageInput 
          conversationId={conversationId} 
          replyTo={replyTo} 
          onClearReply={() => setReplyTo(null)} 
          onFilesSelected={(files) => setFilesToPreview(files)}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
