import React from 'react';
import { Profile } from '../../lib/supabase';
import Avatar from '../ui/Avatar';
import { ArrowLeft, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Link as LinkIcon } from 'lucide-react';

interface ParticipantProfileViewProps {
  participant: Profile;
  onBack: () => void;
}

const socialIcons: { [key: string]: React.ReactNode } = {
  facebook: <Facebook className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  default: <LinkIcon className="w-5 h-5" />,
};

const getSocialIcon = (url: string) => {
  if (!url) return socialIcons.default;
  if (url.includes('facebook.com')) return socialIcons.facebook;
  if (url.includes('twitter.com') || url.includes('x.com')) return socialIcons.twitter;
  if (url.includes('instagram.com')) return socialIcons.instagram;
  if (url.includes('linkedin.com')) return socialIcons.linkedin;
  return socialIcons.default;
};

const ParticipantProfileView: React.FC<ParticipantProfileViewProps> = ({ participant, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-shrink-0 p-4 border-b bg-white flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="text-xl font-semibold">Infos du contact</h2>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col items-center p-8 bg-white border-b">
          <Avatar name={participant.full_name || '?'} avatarUrl={participant.avatar_url} size="lg" />
          <h3 className="mt-4 text-2xl font-bold">{participant.full_name || 'Utilisateur inconnu'}</h3>
          <p className="text-gray-500">{participant.email}</p>
        </div>
        
        <div className="p-6 space-y-6">
          {participant.bio && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Bio</h4>
              <p className="text-gray-700 italic">"{participant.bio}"</p>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-sm font-semibold text-gray-500 mb-3">Coordonnées</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-700"><Mail className="w-5 h-5 mr-3 text-gray-400"/> {participant.email}</div>
              <div className="flex items-center text-gray-700"><Phone className="w-5 h-5 mr-3 text-gray-400"/> {participant.phone || 'Non renseigné'}</div>
              {(participant.city || participant.region) && (
                <div className="flex items-center text-gray-700"><MapPin className="w-5 h-5 mr-3 text-gray-400"/> {participant.city}{participant.city && participant.region ? ', ' : ''}{participant.region}</div>
              )}
            </div>
          </div>

          {participant.social_links && Object.keys(participant.social_links).length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">Réseaux sociaux</h4>
              <div className="space-y-2">
                {Object.entries(participant.social_links).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center text-german-red hover:underline p-2 rounded-md hover:bg-gray-50">
                    <div className="w-8 h-8 flex items-center justify-center mr-3 text-gray-500">
                      {getSocialIcon(url)}
                    </div>
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantProfileView;
