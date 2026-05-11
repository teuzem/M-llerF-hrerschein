import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, Profile, PresenceState, Conversation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Search, Crown, Users, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onRefresh: () => void;
  onConversationCreated?: (conversationId: string, profile: Profile) => void;
}

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight || !text) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200/80 rounded px-0.5">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};

const formatTime = (dateStr: string, t: any) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return t('chat.yesterday', 'Gestern');
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations, loading, searchTerm, setSearchTerm,
  selectedConversationId, onSelectConversation, onRefresh, onConversationCreated
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Fetch all profiles from database for contacts tab
  useEffect(() => {
    if (!user) return;
    const fetchAllProfiles = async () => {
      setProfilesLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('full_name', { ascending: true });
      if (error) {
        console.error('Error loading contacts:', error);
      } else {
        setAllProfiles(data || []);
      }
      setProfilesLoading(false);
    };
    fetchAllProfiles();

    // Real-time subscription for profile changes
    const profileChannel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAllProfiles();
      })
      .subscribe();

    return () => { supabase.removeChannel(profileChannel); };
  }, [user]);

  // Online presence tracking
  useEffect(() => {
    if (!user) return;
    const presenceChannel = supabase.channel('online-users-list');
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState<PresenceState>();
        setOnlineUsers(new Set(Object.keys(newState)));
      })
      .subscribe();
    return () => { supabase.removeChannel(presenceChannel); };
  }, [user]);

  // Sort contacts: admins first, then online, then alphabetical
  const sortedProfiles = useMemo(() => {
    let filtered = allProfiles;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      const aIsAdmin = a.role === 'admin';
      const bIsAdmin = b.role === 'admin';
      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;
      const aOnline = onlineUsers.has(a.id);
      const bOnline = onlineUsers.has(b.id);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      return (a.full_name || '').localeCompare(b.full_name || '');
    });
  }, [allProfiles, searchTerm, onlineUsers]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(c =>
      c.other_participant.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const handleStartConversation = async (profile: Profile) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: profile.id,
      });
      if (error) throw error;
      if (onConversationCreated) {
        onConversationCreated(data, profile);
      }
      onRefresh();
      // Switch to chats tab
      setActiveTab('chats');
    } catch (error: any) {
      console.error(error);
      toast.error(t('chat.error_start_convo'));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[#0055A4] to-[#003d7a] px-4 pt-4 pb-3">
        <h2 className="text-white text-xl font-bold mb-3">{t('chat.title')}</h2>
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200 w-4 h-4" />
          <input
            type="text"
            placeholder={t('chat.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/15 text-white placeholder-blue-200 border-none rounded-lg text-sm focus:bg-white/25 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all"
          />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all relative ${
            activeTab === 'chats'
              ? 'text-[#0055A4]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {t('chat.conversations')}
          {activeTab === 'chats' && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0055A4]"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all relative ${
            activeTab === 'contacts'
              ? 'text-[#0055A4]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          {t('chat.contacts')}
          {activeTab === 'contacts' && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0055A4]"
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'chats' ? (
          // CONVERSATIONS TAB
          loading ? (
            <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 px-4">
              <MessageCircle className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-sm font-medium">{t('chat.no_conversations')}</p>
              <p className="text-xs text-center mt-1">{t('chat.no_conversations_desc')}</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredConversations.map((convo, index) => {
                const isAdmin = convo.other_participant.role === 'admin';
                return (
                  <motion.div
                    key={convo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onSelectConversation(convo)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-all hover:bg-gray-50 ${
                      selectedConversationId === convo.id ? 'bg-blue-50 border-l-4 border-l-[#0055A4]' : ''
                    }`}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative flex-shrink-0">
                      <Avatar name={convo.other_participant.full_name || '?'} avatarUrl={convo.other_participant.avatar_url} size="md" />
                      {onlineUsers.has(convo.other_participant.id || '') && (
                        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
                      )}
                      {isAdmin && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className={`text-sm font-semibold truncate ${convo.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          <Highlight text={convo.other_participant.full_name || ''} highlight={searchTerm} />
                          {isAdmin && (
                            <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                              {t('chat.admin_badge')}
                            </span>
                          )}
                        </h4>
                        {convo.last_message_time && (
                          <span className={`text-[11px] flex-shrink-0 ${convo.unread_count > 0 ? 'text-[#0055A4] font-semibold' : 'text-gray-400'}`}>
                            {formatTime(convo.last_message_time, t)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <p className={`text-[13px] truncate pr-2 ${convo.unread_count > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                          {convo.last_message_text || '...'}
                        </p>
                        {convo.unread_count > 0 && (
                          <span className="flex-shrink-0 min-w-[20px] h-5 bg-german-red text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5">
                            {convo.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )
        ) : (
          // CONTACTS TAB
          profilesLoading ? (
            <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>
          ) : sortedProfiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 px-4">
              <Users className="w-12 h-12 mb-2 text-gray-300" />
              <p className="text-sm font-medium">{t('chat.no_contacts')}</p>
            </div>
          ) : (
            <AnimatePresence>
              {sortedProfiles.map((profile, index) => {
                const isAdmin = profile.role === 'admin';
                const isOnline = onlineUsers.has(profile.id);
                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleStartConversation(profile)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-all hover:bg-blue-50"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar name={profile.full_name || '?'} avatarUrl={profile.avatar_url} size="md" />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
                      )}
                      {isAdmin && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate">
                        <Highlight text={profile.full_name || '?'} highlight={searchTerm} />
                        {isAdmin && (
                          <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                            {t('chat.admin_badge')}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isOnline ? (
                          <span className="text-green-600 font-medium">{t('chat.online', 'Online')}</span>
                        ) : profile.last_seen ? (
                          <span>{t('chat.last_seen', 'Zuletzt gesehen')} {formatTime(profile.last_seen, t)}</span>
                        ) : (
                          <span className="text-gray-400">{t('chat.offline', 'Offline')}</span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )
        )}
      </div>
    </div>
  );
};

export default ConversationList;
