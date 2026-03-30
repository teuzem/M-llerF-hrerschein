import React from 'react';
import ReactPlayer from 'react-player';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, videoSrc }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('testimonials.media_uploader.video_editor.title')}>
      <div className="w-full aspect-video">
        <ReactPlayer
          url={videoSrc}
          controls
          width="100%"
          height="100%"
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Fermer</Button>
      </div>
    </Modal>
  );
};

export default VideoPlayerModal;
