import React from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Copy } from 'lucide-react';
import Button from '../ui/Button';

interface CryptoPaymentProps {
  totalAmount: number;
  onPaymentSuccess: (details: { paymentMethod: 'crypto'; transactionId?: string }) => void;
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({ totalAmount, onPaymentSuccess }) => {
  const { t } = useTranslation();
  const walletAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'; // Example BTC address

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Adresse kopiert!');
  };

  const handleManualConfirmation = () => {
    // In a real app, you'd poll a backend service that checks the blockchain.
    // For this demo, we'll just confirm manually.
    onPaymentSuccess({ paymentMethod: 'crypto', transactionId: `manual_crypto_${Date.now()}` });
  };

  return (
    <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
      <p className="text-sm text-gray-600 mb-4">{t('payment.crypto.info')}</p>
      
      <div className="flex justify-center mb-4">
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bitcoin:${walletAddress}?amount=${totalAmount}`} 
          alt="QR Code"
          className="rounded-lg"
        />
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">{t('payment.crypto.address')}</p>
        <div className="flex items-center justify-center bg-white p-2 border rounded-md">
          <p className="text-xs font-mono break-all mr-2">{walletAddress}</p>
          <button onClick={copyToClipboard} title={t('payment.crypto.copy')}>
            <Copy className="w-4 h-4 text-gray-500 hover:text-german-red" />
          </button>
        </div>
      </div>
      
      <p className="font-bold text-lg mb-4">{totalAmount} € <span className="text-sm text-gray-500">(en BTC)</span></p>

      <Button onClick={handleManualConfirmation} className="w-full">
        J'ai effectué le paiement
      </Button>
    </div>
  );
};

export default CryptoPayment;
