import React from 'react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import Modal from '../ui/Modal';

const giphyFetch = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY || '');

interface GiphyPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gif: any) => void;
}

const GiphyPicker: React.FC<GiphyPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const fetchGifs = (offset: number) => giphyFetch.trending({ offset, limit: 10 });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choisir un GIF">
      <div className="h-96 overflow-y-auto">
        <Grid
          onGifClick={onSelect}
          fetchGifs={fetchGifs}
          width={550}
          columns={3}
          gutter={6}
        />
      </div>
    </Modal>
  );
};

export default GiphyPicker;
