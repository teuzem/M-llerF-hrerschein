import React, { useState, useEffect } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ThumbsUp, Heart, Smile, Frown, Angry } from 'lucide-react';
import { supabase, Testimonial, ReactionType } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

interface ReactionButtonsProps {
  testimonial: Testimonial;
}

const reactionEmojis: Record<ReactionType, React.ReactNode> = {
  like: '👍',
  love: '❤️',
  wow: '😮',
  sad: '😢',
  angry: '😠',
};

const ReactionButtons: React.FC<ReactionButtonsProps> = ({ testimonial }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [reactions, setReactions] = useState(testimonial.reactions || {});

  useEffect(() => {
    if (!user) return;
    const fetchUserReaction = async () => {
      const { data } = await supabase
        .from('testimonial_reactions')
        .select('reaction_type')
        .eq('testimonial_id', testimonial.id)
        .eq('user_id', user.id)
        .single();
      if (data) {
        setUserReaction(data.reaction_type as ReactionType);
      }
    };
    fetchUserReaction();
  }, [user, testimonial.id]);

  const handleReaction = async (reaction: ReactionType) => {
    if (!user) {
      toast.error(t('testimonials.social.login_required_react'));
      return;
    }

    // Optimistic UI update
    const oldReaction = userReaction;
    const oldReactions = { ...reactions };
    
    let newReactions = { ...reactions };
    if (oldReaction) newReactions[oldReaction] = (newReactions[oldReaction] || 1) - 1;
    if (oldReaction !== reaction) {
      newReactions[reaction] = (newReactions[reaction] || 0) + 1;
      setUserReaction(reaction);
    } else {
      setUserReaction(null); // Un-react
    }
    setReactions(newReactions);

    try {
      if (oldReaction === reaction) { // Un-react
        await supabase.from('testimonial_reactions').delete().match({ testimonial_id: testimonial.id, user_id: user.id });
      } else { // Add or change reaction
        await supabase.from('testimonial_reactions').upsert({
          testimonial_id: testimonial.id,
          user_id: user.id,
          reaction_type: reaction,
        }, { onConflict: 'testimonial_id, user_id' });
      }
    } catch (error) {
      // Revert optimistic update on error
      setUserReaction(oldReaction);
      setReactions(oldReactions);
      toast.error(t('testimonials.social.reaction_error'));
    }
  };

  const topReactions = Object.entries(reactions)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex items-center space-x-2">
      <Popover className="relative">
        <Popover.Button className="flex items-center space-x-1 text-gray-500 hover:text-german-red transition-colors">
          <ThumbsUp className={`w-4 h-4 ${userReaction ? 'text-german-red' : ''}`} />
          <span className="text-sm">J'aime</span>
        </Popover.Button>
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Popover.Panel className="absolute bottom-full mb-2 w-max bg-white p-2 rounded-full shadow-lg border flex space-x-1">
            {Object.keys(reactionEmojis).map(key => (
              <button key={key} onClick={() => handleReaction(key as ReactionType)} className="text-2xl transform hover:scale-125 transition-transform">
                {reactionEmojis[key as ReactionType]}
              </button>
            ))}
          </Popover.Panel>
        </Transition>
      </Popover>
      {totalReactions > 0 && (
        <div className="flex items-center text-sm text-gray-500">
          {topReactions.map(([type]) => (
            <span key={type} className="text-sm -ml-1">{reactionEmojis[type as ReactionType]}</span>
          ))}
          <span className="ml-1.5">{totalReactions}</span>
        </div>
      )}
    </div>
  );
};

export default ReactionButtons;
