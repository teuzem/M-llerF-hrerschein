import React from 'react';
import toast from 'react-hot-toast';
import { Facebook, Twitter, Linkedin, Copy, Mail, MessageSquare as Whatsapp } from 'lucide-react';
import Modal from '../ui/Modal';
import { supabase } from '../../lib/supabase';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  text: string;
  title: string;
  mediaId: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, text, title, mediaId }) => {

  const handleShare = (network: string) => {
    supabase.rpc('increment_gallery_share', {
      media_id_to_update: mediaId,
      network_to_increment: network
    }).then(({ error }) => {
      if (error) {
        console.error(`Failed to track ${network} share:`, error);
      }
    });
  };

  const socialShares = [
    { name: 'Facebook', icon: Facebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, color: 'bg-german-red hover:bg-red-700', network: 'facebook' },
    { name: 'Twitter', icon: Twitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, color: 'bg-sky-500 hover:bg-sky-600', network: 'twitter' },
    { name: 'LinkedIn', icon: Linkedin, url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`, color: 'bg-blue-800 hover:bg-blue-900', network: 'linkedin' },
    { name: 'WhatsApp', icon: Whatsapp, url: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, color: 'bg-green-500 hover:bg-green-600', network: 'whatsapp' },
    { name: 'Email', icon: Mail, url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`, color: 'bg-gray-600 hover:bg-gray-700', network: 'email' },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link in Zwischenablage kopiert');
    handleShare('copy');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inhalte teilen">
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {socialShares.map((social) => (
            <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" onClick={() => handleShare(social.network)} className={`flex items-center justify-center p-4 rounded-lg text-white font-medium transition-colors ${social.color}`}>
              <social.icon className="w-5 h-5 mr-2" />
              {social.name}
            </a>
          ))}
        </div>
        <div className="relative">
          <input type="text" readOnly value={url} className="w-full bg-gray-100 border-gray-300 rounded-lg p-3 pr-12 focus:ring-blue-500 focus:border-blue-500" />
          <button onClick={copyToClipboard} className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-german-red" title="Link in Zwischenablage kopieren">
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
