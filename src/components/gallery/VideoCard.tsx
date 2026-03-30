import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player/lazy';
import { supabase, GalleryMedia } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import toast from 'react-hot-toast';

import Avatar from '../ui/Avatar';
import CommentSidebar from './CommentSidebar';
import ShareModal from './ShareModal';

import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Play } from 'lucide-react';

interface VideoCardProps {
  video: GalleryMedia;
  isActive: boolean;
  setActiveVideoId: (id: string | null) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, setActiveVideoId }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(videoRef as React.RefObject<Element>, { threshold: 0.6 });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState((video.likes || [])[0]?.count || 0);
  
  const [isCommentSidebarOpen, setIsCommentSidebarOpen] = useState(false);
  const [commentCount, setCommentCount] = useState((video.comments || [])[0]?.count || 0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (entry?.isIntersecting) {
      setActiveVideoId(video.id);
    } else if (isActive) {
      setActiveVideoId(null);
    }
  }, [entry?.isIntersecting, video.id, setActiveVideoId, isActive]);

  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  useEffect(() => {
    if (!user) return;
    const fetchUserInteractions = async () => {
      const { data: likeData } = await supabase.from('gallery_likes').select('id').eq('media_id', video.id).eq('user_id', user.id).maybeSingle();
      setIsLiked(!!likeData);
      const { data: favData } = await supabase.from('gallery_favorites').select('id').eq('media_id', video.id).eq('user_id', user.id).maybeSingle();
      setIsFavorited(!!favData);
    };
    fetchUserInteractions();
  }, [user, video.id]);

  const handlePlayPause = () => {
    if (isActive) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveVideoId(video.id);
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error('Melden Sie sich an, um dieses Video zu liken.');
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => prev + (newIsLiked ? 1 : -1));
    if (newIsLiked) {
      await supabase.from('gallery_likes').insert({ media_id: video.id, user_id: user.id });
    } else {
      await supabase.from('gallery_likes').delete().match({ media_id: video.id, user_id: user.id });
    }
  };

  const handleFavorite = async () => {
    if (!user) return toast.error('Melden Sie sich an, um dieses Video zu speichern.');
    const newIsFavorited = !isFavorited;
    setIsFavorited(newIsFavorited);
    if (newIsFavorited) {
      await supabase.from('gallery_favorites').insert({ media_id: video.id, user_id: user.id });
      toast.success('Zu Favoriten hinzugefügt!');
    } else {
      await supabase.from('gallery_favorites').delete().match({ media_id: video.id, user_id: user.id });
    }
  };

  return (
    <>
      <CommentSidebar
        isOpen={isCommentSidebarOpen}
        onClose={() => setIsCommentSidebarOpen(false)}
        mediaId={video.id}
        onCommentPosted={() => setCommentCount(prev => prev + 1)}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`${window.location.origin}/gallery#${video.id}`}
        text="Schauen Sie sich unser Video an!"
        title={`${video.profiles?.full_name || 'Anonym'}`}
        mediaId={video.id}
      />
      <div ref={videoRef} className="relative w-full h-full bg-black rounded-lg" onClick={handlePlayPause}>
        <ReactPlayer
          url={video.media_url}
          playing={isPlaying}
          loop
          muted={isMuted}
          width="100%"
          height="100%"
          className="react-player"
          playsinline
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <Play className="w-16 h-16 text-white/70" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
          <div className="flex items-center gap-3">
            {video.profiles ? (
              <Link to={`/clients/${video.profiles.id}`} onClick={e => e.stopPropagation()} className="pointer-events-auto">
                <Avatar name={video.profiles.full_name || 'A'} avatarUrl={video.profiles.avatar_url} size="md" />
              </Link>
            ) : (
              <Avatar name="Anonym" avatarUrl={null} size="md" />
            )}
            <p className="font-bold text-white text-sm shadow-black [text-shadow:_1px_1px_2px_var(--tw-shadow-color)]">
              {video.profiles?.full_name || 'Anonym'}
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 right-2 flex flex-col items-center gap-4 text-white pointer-events-auto">
          <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center">
            <Heart className={`w-8 h-8 transition-colors ${isLiked ? 'text-red-500 fill-current' : ''}`} />
            <span className="text-xs font-semibold">{likeCount}</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsCommentSidebarOpen(true); }} className="flex flex-col items-center">
            <MessageCircle className="w-8 h-8" />
            <span className="text-xs font-semibold">{commentCount}</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleFavorite(); }} className="flex flex-col items-center">
            <Bookmark className={`w-8 h-8 transition-colors ${isFavorited ? 'text-yellow-400 fill-current' : ''}`} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); }} className="flex flex-col items-center">
            <Share2 className="w-8 h-8" />
          </button>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="absolute top-2 right-2 p-2 bg-black/30 rounded-full pointer-events-auto">
          {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>
    </>
  );
};

export default VideoCard;
