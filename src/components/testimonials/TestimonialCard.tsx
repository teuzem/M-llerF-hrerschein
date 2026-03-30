import React, { useState } from 'react';
import { Star, MapPin, MessageCircle, Share2 } from 'lucide-react';
import ReactPlayer from 'react-player';
import { Testimonial } from '../../lib/supabase';
import Avatar from '../ui/Avatar';
import ReactionButtons from './ReactionButtons';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const { t } = useTranslation();
  const [showComments, setShowComments] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const authorName = testimonial.profiles?.full_name || testimonial.author_name;
  const avatarUrl = testimonial.profiles?.avatar_url;

  const renderMedia = () => {
    if (!testimonial.media_urls || testimonial.media_urls.length === 0) return null;

    return (
      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))` }}>
        {testimonial.media_urls.map((url, index) => (
          <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            {ReactPlayer.canPlay(url) ? (
              <div className="w-full h-full">
                <ReactPlayer url={url} width="100%" height="100%" controls light={true} />
              </div>
            ) : (
              <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const shareUrl = `${window.location.origin}/testimonials#${testimonial.id}`;
  const shareText = `${t('share_modal.caption')} "${testimonial.content.substring(0, 100)}..."`;
  const shareTitle = t('testimonials.share.title', { name: authorName });

  return (
    <>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={shareUrl}
        text={shareText}
        title={shareTitle}
        testimonialId={testimonial.id}
      />
      <div id={testimonial.id} className="bg-white rounded-lg shadow-md overflow-hidden scroll-mt-24">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center mb-4">
              {testimonial.user_id ? (
                <Link to={`/clients/${testimonial.user_id}`} className="transition-transform duration-200 hover:scale-105">
                  <Avatar name={authorName} avatarUrl={avatarUrl} size="md" />
                </Link>
              ) : (
                <Avatar name={authorName} avatarUrl={avatarUrl} size="md" />
              )}
              <div className="ml-4">
                <p className="font-bold text-gray-800">{authorName}</p>
                {(testimonial.city || testimonial.region) && (
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{testimonial.city}{testimonial.city && testimonial.region ? ', ' : ''}{testimonial.region}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4" fill={i < testimonial.rating ? '#FFC107' : '#E0E0E0'} strokeWidth={0} />
              ))}
            </div>
          </div>
          <p className="text-gray-600 italic mb-4">"{testimonial.content}"</p>
          
          {renderMedia()}
          
          <div className="border-t mt-4 pt-2 flex items-center justify-between text-gray-500">
            <ReactionButtons testimonial={testimonial} />
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1 hover:text-german-red">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{t('testimonials.social.comment')}</span>
              </button>
              <button onClick={handleShare} className="flex items-center space-x-1 hover:text-german-red">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">{t('testimonials.social.share')}</span>
              </button>
            </div>
          </div>

          {showComments && <CommentSection testimonialId={testimonial.id} />}
        </div>
      </div>
    </>
  );
};

export default TestimonialCard;
