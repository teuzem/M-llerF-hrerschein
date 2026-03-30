import React, { useState } from 'react';
import { GalleryMedia } from '../../lib/supabase';
import VideoCard from './VideoCard';

interface VideoFeedProps {
  videos: GalleryMedia[];
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(videos.length > 0 ? videos[0].id : null);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative h-[80vh] overflow-y-scroll snap-y snap-mandatory rounded-2xl shadow-2xl bg-black scrollbar-hide">
        {videos.map((video) => (
          <div key={video.id} id={`video-${video.id}`} className="h-full w-full snap-start flex items-center justify-center relative">
            <VideoCard
              video={video}
              isActive={activeVideoId === video.id}
              setActiveVideoId={setActiveVideoId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoFeed;
