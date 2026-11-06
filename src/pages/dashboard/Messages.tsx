import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase, Conversation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import UserSearchModal from '../../components/chat/UserSearchModal';
import { MessageSquare, PenSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardMessages = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewConvoOpen, setIsNewConvoOpen] = useState(false);

  const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
    if (!user) return [];
    setLoading(true);
    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) {
        console.error('Error fetching user conversations:', participantsError);
        toast.error(t('chat.error_loading', 'Fehler beim Laden der Nachrichten.'));
        return [];
      }

      if (!participantsData || participantsData.length === 0) {
        setConversations([]);
        return [];
      }

      const conversationIds = participantsData.map(p => p.conversation_id);

      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('last_message_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations details:', conversationsError);
        return [];
      }

      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Get other participant's user_id from conversation_participants
          const { data: otherParticipantData } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)
            .limit(1)
            .maybeSingle();

          let otherProfile: any = {};
          if (otherParticipantData?.user_id) {
            // Fetch profile separately to avoid ambiguous FK join issues
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', otherParticipantData.user_id)
              .single();
            otherProfile = profileData || {};
          }

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)
            .is('read_at', null);

          return {
            id: conv.id,
            created_at: conv.created_at,
            other_participant: otherProfile as { id?: string; full_name?: string; [key: string]: any },
            last_message_text: lastMessage?.content || null,
            last_message_time: lastMessage?.created_at || null,
            unread_count: unreadCount || 0
          };
        })
      );

      const result = enrichedConversations.filter(c => c.other_participant.id);
      setConversations(result);
      return result;
    } catch (error: any) {
      console.error('Error in fetchConversations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const changesChannel = supabase
        .channel('realtime-all-conversations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => { fetchConversations(); })
        .subscribe();
      return () => { supabase.removeChannel(changesChannel); };
    }
  }, [user, fetchConversations]);

  const handleNewConversation = async (conversationId: string, profile?: any) => {
    setIsNewConvoOpen(false);
    // Try to find in existing conversations
    let convo = conversations.find(c => c.id === conversationId);
    if (convo) {
      setSelectedConversation(convo);
      return;
    }
    // Refetch and find in fresh list
    const freshList = await fetchConversations();
    convo = freshList.find(c => c.id === conversationId);
    if (convo) {
      setSelectedConversation(convo);
    } else if (profile) {
      // Fallback: construct it manually if DB sync is slow
      const manualConvo: Conversation = {
        id: conversationId,
        created_at: new Date().toISOString(),
        other_participant: profile,
        last_message_text: null,
        last_message_time: null,
        unread_count: 0
      };
      setSelectedConversation(manualConvo);
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(c =>
      c.other_participant.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <UserSearchModal
        isOpen={isNewConvoOpen}
        onClose={() => setIsNewConvoOpen(false)}
        onConversationSelect={handleNewConversation}
        onProfileSelect={() => {}}
        mode="startConversation"
      />
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> {t('chat.title', 'Nachrichten')}
        </h2>
        <button onClick={() => setIsNewConvoOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-german-red text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">
          <PenSquare className="w-4 h-4" /> {t('chat.new_message', 'Neue Nachricht')}
        </button>
      </div>
      <div className="flex-grow flex border border-gray-200 bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
        <div className="flex w-full h-full">
          <div className={`w-full md:w-1/3 md:flex flex-col border-r border-gray-200 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <ConversationList
              conversations={filteredConversations}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedConversationId={selectedConversation?.id || null}
              onSelectConversation={setSelectedConversation}
              onRefresh={() => { fetchConversations(); }}
              onConversationCreated={handleNewConversation}
            />
          </div>

          <div className={`w-full md:w-2/3 flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              <ChatWindow
                key={selectedConversation.id}
                conversation={selectedConversation}
                onRefresh={() => { fetchConversations(); }}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="flex-grow flex-col items-center justify-center text-center text-gray-500 bg-gray-50 hidden md:flex">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold">{t('chat.title', 'Nachrichten')}</h2>
                <p className="max-w-xs text-sm">{t('chat.select_conversation', 'Wählen Sie eine Konversation aus, um zu beginnen')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardMessages;
