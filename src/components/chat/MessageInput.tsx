import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { supabase, TypingEvent, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Send, Paperclip, Smile, Gift, MapPin, Image as ImageIcon, User as UserIcon, Mic, X } from 'lucide-react';
import { Popover, Transition } from '@headlessui/react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import GiphyPicker from './GiphyPicker';
import GalleryPickerModal from './GalleryPickerModal';
import UserSearchModal from './UserSearchModal';
import MentionSuggestions from './MentionSuggestions';
import { debounce } from 'lodash';
import type { MessageWithProfile } from './ChatWindow';
import { useTranslation } from 'react-i18next';

interface MessageInputProps {
  conversationId: string;
  replyTo?: MessageWithProfile | null;
  onClearReply?: () => void;
  onFilesSelected: (files: File[]) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ conversationId, replyTo, onClearReply, onFilesSelected }) => {
  const { user, profile } = useAuth();
  const { register, handleSubmit, setValue, getValues, reset, watch } = useForm<{ content: string }>({
    defaultValues: { content: '' }
  });
  const { t } = useTranslation();
  const [isGiphyOpen, setIsGiphyOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isProfileShareModalOpen, setIsProfileShareModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<Profile[]>([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStartPosition, setMentionStartPosition] = useState<number | null>(null);

  // Watch content for reactive send/mic button toggle
  const watchedContent = watch('content');
  const hasContent = !!(watchedContent && watchedContent.trim().length > 0);

  // Use a ref for the typing channel to prevent recreation on every render
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    typingChannelRef.current = supabase.channel(`typing-input-${conversationId}`);
    typingChannelRef.current.subscribe();
    return () => {
      if (typingChannelRef.current) {
        supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
    };
  }, [conversationId]);

  const sendTypingStop = useMemo(
    () => debounce(async () => {
      if (!user || !typingChannelRef.current) return;
      const event: TypingEvent = { event: 'TYPING_STOP', payload: { user_id: user.id, user_name: profile?.full_name || '' } };
      try {
        await typingChannelRef.current.send({ type: 'broadcast', event: event.event, payload: event.payload });
      } catch (e) { /* ignore */ }
    }, 3000),
    [user, profile]
  );

  const sendTypingStart = useCallback(async () => {
    if (!user || !typingChannelRef.current) return;
    const event: TypingEvent = { event: 'TYPING_START', payload: { user_id: user.id, user_name: profile?.full_name || '' } };
    try {
      await typingChannelRef.current.send({ type: 'broadcast', event: event.event, payload: event.payload });
    } catch (e) { /* ignore */ }
  }, [user, profile]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { sendTypingStop.cancel(); };
  }, [sendTypingStop]);

  useEffect(() => {
    const fetchMentions = async (query: string) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${query}%`)
        .neq('id', user.id)
        .limit(5);
      if (error) console.error(error);
      else { setMentionResults((data || []) as Profile[]); setMentionIndex(0); }
    };
    if (mentionQuery !== null && mentionQuery.length >= 0) fetchMentions(mentionQuery);
    else setMentionResults([]);
  }, [mentionQuery, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const value = input.value;
    const cursorPosition = input.selectionStart || 0;
    setValue('content', value, { shouldDirty: true });

    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    
    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]))) {
      const query = textBeforeCursor.substring(lastAt + 1);
      if (!query.includes('\n')) { setMentionQuery(query); setMentionStartPosition(lastAt); }
      else setMentionQuery(null);
    } else {
      setMentionQuery(null);
    }
    
    if (value) { sendTypingStart(); sendTypingStop(); }
    else { sendTypingStop.cancel(); sendTypingStop(); }
  };

  const handleMentionSelect = (selectedProfile: Profile) => {
    if (mentionStartPosition === null || !inputRef.current) return;
    const currentContent = getValues('content');
    const cursorPosition = inputRef.current.selectionStart || 0;
    const prefix = currentContent.substring(0, mentionStartPosition);
    const suffix = currentContent.substring(cursorPosition);
    const mentionText = `@[${selectedProfile.full_name}](${selectedProfile.id}) `;
    const newContent = `${prefix}${mentionText}${suffix}`;
    setValue('content', newContent, { shouldDirty: true });
    const newCursorPosition = prefix.length + mentionText.length;
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition); }, 0);
    setMentionQuery(null);
    setMentionResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i + 1) % mentionResults.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(i => (i - 1 + mentionResults.length) % mentionResults.length); }
      else if (e.key === 'Enter') { e.preventDefault(); handleMentionSelect(mentionResults[mentionIndex]); }
      else if (e.key === 'Escape') { e.preventDefault(); setMentionQuery(null); setMentionResults([]); }
    }
  };

  const sendMessage = async (
    content: string,
    media_url?: string,
    media_type?: 'image' | 'video' | 'file' | 'gif' | 'profile' | 'voice',
    location_data?: object
  ) => {
    if (!user) return;
    try {
      const messageData: any = {
        conversation_id: conversationId,
        user_id: user.id,
        content,
        media_url,
        media_type,
        location_data,
      };
      if (replyTo) messageData.reply_to = Number(replyTo.id);
      
      const { error } = await supabase.from('messages').insert(messageData);
      if (error) {
        console.error('Error sending message:', error);
        toast.error(t('chat.send_error', 'Nachricht konnte nicht gesendet werden.'));
        return;
      }
      sendTypingStop.cancel();
      if (onClearReply) onClearReply();
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error(t('chat.send_error', 'Nachricht konnte nicht gesendet werden.'));
    }
  };

  const onTextSubmit = (data: { content: string }) => {
    if (!data.content || data.content.trim() === '') return;
    sendMessage(data.content.trim());
    reset({ content: '' });
    // Focus the input after sending
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const current = getValues('content') || '';
    setValue('content', current + emojiData.emoji, { shouldDirty: true });
  };

  const handleGifSelect = (gif: any) => {
    sendMessage(`GIF: ${gif.title}`, gif.images.original.url, 'gif');
    setIsGiphyOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files).slice(0, 10)); // up to 10 files
    }
  };

  const handleShareLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendMessage(t('chat.shared_location'), undefined, undefined, { latitude, longitude });
      },
      () => toast.error(t('chat.location_error'))
    );
  };

  const handleGallerySelect = (media: { media_url: string; media_type: 'image' | 'video' | 'file' }) => {
    const file = new File([], media.media_url, { type: `external/${media.media_type}` });
    onFilesSelected([file]);
    setIsGalleryOpen(false);
  };

  const handleProfileShareSelect = (profileToShare: Profile) => {
    const profileData = { id: profileToShare.id, full_name: profileToShare.full_name, avatar_url: profileToShare.avatar_url };
    sendMessage(JSON.stringify(profileData), undefined, 'profile');
    setIsProfileShareModalOpen(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0 && user) {
          const filePath = `${user.id}/${conversationId}/${Date.now()}-voice.webm`;
          const { error: uploadError } = await supabase.storage.from('chat_media').upload(filePath, audioBlob);
          if (uploadError) { toast.error(t('chat.voice_upload_error')); return; }
          const { data: urlData } = supabase.storage.from('chat_media').getPublicUrl(filePath);
          sendMessage('🎤 ' + t('chat.voice_message'), urlData.publicUrl, 'voice');
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (error) {
      toast.error(t('chat.mic_access_denied'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingIntervalRef.current) { clearInterval(recordingIntervalRef.current); recordingIntervalRef.current = null; }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current?.stream?.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingIntervalRef.current) { clearInterval(recordingIntervalRef.current); recordingIntervalRef.current = null; }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  // Register content field
  const { ref: registerRef, ...registerRest } = register('content');

  return (
    <>
      <GiphyPicker isOpen={isGiphyOpen} onClose={() => setIsGiphyOpen(false)} onSelect={handleGifSelect} />
      <GalleryPickerModal 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        onSelect={handleGallerySelect} 
        onFileUpload={(files) => {
          onFilesSelected(files);
          setIsGalleryOpen(false);
        }}
      />
      <UserSearchModal isOpen={isProfileShareModalOpen} onClose={() => setIsProfileShareModalOpen(false)} onConversationSelect={() => {}} onProfileSelect={handleProfileShareSelect} mode="shareProfile" />

      <div className="relative">
        {mentionQuery !== null && (
          <MentionSuggestions profiles={mentionResults} onSelect={handleMentionSelect} selectedIndex={mentionIndex} />
        )}

        {isRecording ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-700 font-mono text-sm">{formatTime(recordingTime)}</span>
            <span className="text-red-600 text-sm">{t('chat.recording')}</span>
            <div className="flex-1" />
            <button onClick={cancelRecording} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200" title={t('chat.cancel')}>
              <X className="w-5 h-5" />
            </button>
            <button onClick={stopRecording} className="p-2 bg-[#0055A4] text-white rounded-full hover:bg-[#003d7a]" title={t('chat.send')}>
              <Send className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onTextSubmit)} className="flex items-center gap-2">
            <Popover className="relative">
              <Popover.Button className="p-2 text-gray-500 hover:text-[#0055A4] rounded-full hover:bg-gray-100 transition-colors">
                <Smile className="w-6 h-6" />
              </Popover.Button>
              <Popover.Panel className="absolute bottom-12 left-0 mb-2 z-10">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </Popover.Panel>
            </Popover>
            <Popover className="relative">
              <Popover.Button className="p-2 text-gray-500 hover:text-[#0055A4] rounded-full hover:bg-gray-100 transition-colors">
                <Paperclip className="w-6 h-6 transform -rotate-45" />
              </Popover.Button>
              <Transition
                as={React.Fragment}
                enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1 scale-95" enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0 scale-100" leaveTo="opacity-0 translate-y-1 scale-95"
              >
                <Popover.Panel className="absolute bottom-14 left-0 w-56 bg-white shadow-xl rounded-2xl border border-gray-100 p-2 z-10 flex flex-col gap-1">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    {t('chat.document')}
                  </button>
                  <button type="button" onClick={() => setIsGalleryOpen(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    {t('chat.photos_videos')}
                  </button>
                  <button type="button" onClick={() => setIsGiphyOpen(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Gift className="w-5 h-5" />
                    </div>
                    {t('chat.gif')}
                  </button>
                  <button type="button" onClick={handleShareLocation} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    {t('chat.location')}
                  </button>
                  <button type="button" onClick={() => setIsProfileShareModalOpen(true)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    {t('chat.contact')}
                  </button>
                </Popover.Panel>
              </Transition>
            </Popover>
            <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
            <input
              {...registerRest}
              ref={(e) => { registerRef(e); inputRef.current = e; }}
              type="text"
              placeholder={replyTo ? t('chat.replying_placeholder') : t('chat.type_message')}
              autoComplete="off"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:ring-1 focus:ring-[#0055A4] focus:border-transparent placeholder-gray-500 shadow-sm"
            />
            {hasContent ? (
              <button type="submit" className="p-2.5 bg-[#0055A4] text-white rounded-full hover:bg-[#003d7a] transition-colors shadow-sm" title={t('chat.send')}>
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={startRecording} type="button" className="p-2.5 text-gray-500 hover:text-[#0055A4] transition-colors" title={t('chat.voice_message')}>
                <Mic className="w-6 h-6" />
              </button>
            )}
          </form>
        )}
      </div>
    </>
  );
};

export default MessageInput;
