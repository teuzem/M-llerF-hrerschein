import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Download } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, onClose, src }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    const fileName = src.substring(src.lastIndexOf('/') + 1) || 'image.jpg';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-4xl max-h-[90vh] transform transition-all">
                <img src={src} alt="Aperçu" className="w-full h-full object-contain" />
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
                    title="Télécharger"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-white bg-black/50 rounded-full hover:bg-black/70"
                    title="Fermer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImageLightbox;
