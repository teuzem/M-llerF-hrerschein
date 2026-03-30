import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

interface StripeCheckoutFormProps {
  totalAmount: number;
  applicationId: string;
  licenseType?: string;
  onPaymentSuccess: (details: { paymentMethod: 'stripe'; transactionId: string }) => void;
}

const cardElementOptions = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

  const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({ 
    totalAmount, 
    applicationId, 
    licenseType, 
    onPaymentSuccess 
  }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    try {
      // 1. Create Payment Intent on the server
      const { data: intentData, error: intentError } = await supabase.functions.invoke('create-german-payment-intent', {
        body: { 
          amount: Math.round(totalAmount * 100), // Amount in cents
          applicationId,
          licenseType
        },
      });

      if (intentError || !intentData.clientSecret) {
        throw new Error(intentError?.message || 'Failed to create payment intent.');
      }

      const clientSecret = intentData.clientSecret;

      // 2. Confirm the payment on the client
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }
      
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (paymentError) {
        toast.error(paymentError.message || t('payment.error.message'));
        setIsLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        onPaymentSuccess({ paymentMethod: 'stripe', transactionId: paymentIntent.id });
      }
    } catch (error: any) {
      toast.error(error.message || t('payment.error.message'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('payment.card.info')}</label>
        <div className="p-3 border border-gray-300 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      <Button type="submit" disabled={!stripe || isLoading} isLoading={isLoading} className="w-full">
        {t('payment.card.pay_button', { amount: totalAmount.toFixed(2) })}
      </Button>
    </form>
  );
};

export default StripeCheckoutForm;
