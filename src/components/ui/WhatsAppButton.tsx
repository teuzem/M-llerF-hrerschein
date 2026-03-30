import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WhatsAppButton: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const phoneNumber = '4915212399096'; // Format for wa.me link

  let message = t('support.whatsapp.message_default');
  if (user && profile?.full_name) {
    message = t('support.whatsapp.message_logged', { name: profile.full_name });
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg z-50 transition-transform hover:scale-110"
      aria-label={t('common.contact')}
      title={t('common.contact')}
    >
      <MessageSquare className="w-8 h-8" />
    </a>
  );
};

export default WhatsAppButton;
