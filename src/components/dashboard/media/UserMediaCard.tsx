import React from 'react';
import { useTranslation } from 'react-i18next';
import { GalleryMedia } from '../../../lib/supabase';
import { Edit, Trash2, Heart, MessageCircle, Share2, Video as VideoIcon } from 'lucide-react';
import ReactPlayer from 'react-player/lazy';

interface UserMediaCardProps {
  media: GalleryMedia & { share_counts?: any };
  onDelete: (id: string) => void;
  onEdit: (media: GalleryMedia) => void;
}

const StatusBadge: React.FC<{ status: 'approved' | 'pending' | 'rejected' }> = ({ status }) => {
  const { t } = useTranslation();
  const statusMap = {
    approved: { label: 'Veröffentlicht', color: 'green' },
    pending: { label: 'Ausstehend', color: 'yellow' },
    rejected: { label: 'Abgelehnt', color: 'red' },
  };

  const { label, color } = statusMap[status];
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
  };

  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color]}`}>{label}</span>;
};

const UserMediaCard: React.FC<UserMediaCardProps> = ({ media, onDelete, onEdit }) => {
  const { t } = useTranslation();
  const totalLikes = 0; // Temporairement désactivé pour éviter les erreurs de relation
  const totalComments = 0; // Temporairement désactivé pour éviter les erreurs de relation
  const totalShares = media.share_counts ? Object.values(media.share_counts).reduce((a: number, b: any) => a + b, 0) as number : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div className="relative aspect-video bg-gray-200">
        {media.media_type === 'image' ? (
          <img src={media.media_url} alt="Media" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full">
            <ReactPlayer url={media.media_url} light={true} width="100%" height="100%" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={media.status || 'pending'} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-around text-xs text-gray-500 mb-3 border-b pb-3">
          <div className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-500"/> {totalLikes}</div>
          <div className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-500"/> {totalComments}</div>
          <div className="flex items-center gap-1"><Share2 className="w-3 h-3 text-green-500"/> {totalShares}</div>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button onClick={() => onEdit(media)} className="p-2 text-gray-500 hover:text-german-red hover:bg-blue-50 rounded-full" title="Bearbeiten">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(media.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Löschen">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMediaCard;
