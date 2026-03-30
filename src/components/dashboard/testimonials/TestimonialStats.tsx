import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../StatCard';
import { MessageSquare, Heart, Star } from 'lucide-react';
import { Testimonial, ReactionType } from '../../../lib/supabase';

interface TestimonialStatsProps {
  testimonials: Testimonial[];
}

const TestimonialStats: React.FC<TestimonialStatsProps> = ({ testimonials }) => {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const totalReviews = testimonials.length;
    if (totalReviews === 0) {
      return { totalReviews: 0, totalReactions: 0, averageRating: 0 };
    }

    const totalReactions = testimonials.reduce((sum, t) => {
      return sum + Object.values(t.reactions || {}).reduce((a, b) => a + b, 0);
    }, 0);

    const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
    const averageRating = totalRating / totalReviews;

    return {
      totalReviews,
      totalReactions,
      averageRating: parseFloat(averageRating.toFixed(1)),
    };
  }, [testimonials]);

  const statCards = [
    { title: 'Bewertungen insgesamt', value: stats.totalReviews, icon: MessageSquare, color: 'blue' as const },
    { title: 'Reaktionen insgesamt', value: stats.totalReactions, icon: Heart, color: 'red' as const },
    { title: 'Durchschnittsbewertung', value: stats.averageRating, icon: Star, color: 'yellow' as const },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default TestimonialStats;
