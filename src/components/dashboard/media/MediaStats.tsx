import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../StatCard';
import { Image, Heart, MessageCircle, Share2 } from 'lucide-react';
import { GalleryMedia } from '../../../lib/supabase';

interface MediaStatsProps {
  media: GalleryMedia[];
}

const MediaStats: React.FC<MediaStatsProps> = ({ media }) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const totalMedia = media.length;
    if (totalMedia === 0) {
      return { totalMedia: 0, totalLikes: 0, totalComments: 0, totalShares: 0 };
    }

    const totalLikes = 0; // Temporairement désactivé pour éviter les erreurs de relation
    const totalComments = 0; // Temporairement désactivé pour éviter les erreurs de relation
    const totalShares = media.reduce((sum, m) => {
      const shareCounts = (m as any).share_counts;
      return sum + (shareCounts ? Object.values(shareCounts).reduce((a: number, b: any) => a + b, 0) as number : 0);
    }, 0);

    return { totalMedia, totalLikes, totalComments, totalShares };
  }, [media]);

  const statCards = [
    { title: 'Medien insgesamt', value: stats.totalMedia, icon: Image, color: 'blue' as const },
    { title: 'Likes insgesamt', value: stats.totalLikes, icon: Heart, color: 'red' as const },
    { title: 'Kommentare insgesamt', value: stats.totalComments, icon: MessageCircle, color: 'green' as const },
    { title: 'Teilungen insgesamt', value: stats.totalShares, icon: Share2, color: 'yellow' as const },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default MediaStats;
