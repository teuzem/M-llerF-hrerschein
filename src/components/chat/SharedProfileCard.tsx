import React from 'react';
import toast from 'react-hot-toast';
import { supabase, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SharedProfileCardProps {
  profile: Partial<Profile>;
  onSwitchConversation?: (conversationId: string) => void;
}

const SharedProfileCard: React.FC<SharedProfileCardProps> = ({ profile, onSwitchConversation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useTranslation();

  const handleStartConversation = async () => {
    if (!user || !profile.id) {
      toast.error(t('chat.login_required', 'Sie müssen angemeldet sein.'));
      return;
    }
    if (user.id === profile.id) {
      toast.error(t('chat.cannot_start_with_self', 'Sie können keine Konversation mit sich selbst starten.'));
      return;
    }

    setIsLoading(true);
    try {
      const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: profile.id,
      });

      if (error) throw error;
      
      if (onSwitchConversation) {
        onSwitchConversation(conversationId);
      }
      toast.success(t('chat.conversation_started', 'Konversation gestartet.'));

    } catch (error: any) {
      toast.error(t('chat.start_conversation_error', 'Konversation kann nicht gestartet werden.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm max-w-xs w-64">
      <div className="flex items-center space-x-3 mb-4">
        <Avatar name={profile.full_name || '?'} avatarUrl={profile.avatar_url} size="md" />
        <div>
          <p className="font-bold text-gray-800">{profile.full_name}</p>
          <p className="text-xs text-gray-500">{t('dashboard.profile.title', 'Benutzerprofil')}</p>
        </div>
      </div>
      <Button onClick={handleStartConversation} isLoading={isLoading} className="w-full text-sm py-2">
        <MessageSquare className="w-4 h-4 mr-2" />
        {t('chat.send_message', 'Nachricht')}
      </Button>
    </div>
  );
};

export default SharedProfileCard;
