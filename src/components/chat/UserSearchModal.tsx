import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { Search, Crown, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationSelect: (conversationId: string, profile?: Profile) => void;
  onProfileSelect?: (profile: Profile) => void;
  mode?: 'startConversation' | 'shareProfile';
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onConversationSelect,
  onProfileSelect,
  mode = 'startConversation',
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingConvo, setStartingConvo] = useState<string | null>(null);

  // Fetch all users when modal opens
  useEffect(() => {
    if (!isOpen || !user) {
      setSearchTerm('');
      setAllUsers([]);
      return;
    }

    const fetchAllUsers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error(t('chat.error_search', 'Fehler bei der Suche.'));
      } else {
        setAllUsers(data || []);
      }
      setLoading(false);
    };

    fetchAllUsers();
  }, [isOpen, user, t]);

  // Filter users by search term
  const filteredUsers = searchTerm
    ? allUsers.filter(p =>
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allUsers;

  // Sort: admins first
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return (a.full_name || '').localeCompare(b.full_name || '');
  });

  const handleSelectUser = async (selectedUser: Profile) => {
    if (!user) return;

    if (mode === 'shareProfile' && onProfileSelect) {
      onProfileSelect(selectedUser);
      onClose();
      return;
    }

    // Start conversation
    setStartingConvo(selectedUser.id);
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: selectedUser.id,
      });
      if (error) throw error;
      onConversationSelect(data, selectedUser);
      onClose();
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      toast.error(t('chat.error_start_convo', 'Konversation kann nicht gestartet werden.'));
    } finally {
      setStartingConvo(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('chat.new_message', 'Neue Nachricht')}>
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('chat.search_users', 'Benutzer suchen...')}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
          autoFocus
        />
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-[11px] text-gray-400 mb-2 px-1">
          {sortedUsers.length} {t('chat.contacts', 'Kontakte')}
        </p>
      )}

      {/* User list */}
      <div className="h-72 overflow-y-auto -mx-1">
        {loading ? (
          <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
        ) : sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-10 h-10 mb-2 text-gray-300" />
            <p className="text-sm">{t('chat.no_contacts', 'Keine Kontakte gefunden')}</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {sortedUsers.map(profile => {
              const isAdmin = profile.role === 'admin';
              return (
                <li
                  key={profile.id}
                  onClick={() => handleSelectUser(profile)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    startingConvo === profile.id
                      ? 'bg-teal-50 opacity-70'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar name={profile.full_name || '?'} avatarUrl={profile.avatar_url} size="md" />
                    {isAdmin && (
                      <span className="absolute -top-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5">
                        <Crown className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-800 truncate">{profile.full_name || '?'}</span>
                      {isAdmin && (
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded-full font-medium flex-shrink-0">
                          {t('chat.admin_badge', 'Admin')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                  </div>
                  {startingConvo === profile.id && (
                    <LoadingSpinner />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default UserSearchModal;
