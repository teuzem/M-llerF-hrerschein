import React from 'react';
import { PayPalButtons, OnApproveData, OnApproveActions } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

interface PayPalButtonsComponentProps {
  totalAmount: number;
  onPaymentSuccess: (details: { paymentMethod: 'paypal'; transactionId: string }) => void;
}

const PayPalButtonsComponent: React.FC<PayPalButtonsComponentProps> = ({ totalAmount, onPaymentSuccess }) => {
  const { t } = useTranslation();

  const createOrder = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: { amount: totalAmount.toFixed(2) },
      });
      if (error || !data.orderID) {
        throw new Error(error?.message || 'Failed to create PayPal order.');
      }
      return data.orderID;
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const onApprove = async (data: OnApproveData, actions: OnApproveActions): Promise<void> => {
    try {
      const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: { orderID: data.orderID },
      });

      if (error || captureData.status !== 'COMPLETED') {
        throw new Error(error?.message || 'Failed to capture PayPal payment.');
      }

      onPaymentSuccess({ paymentMethod: 'paypal', transactionId: captureData.id });
    } catch (err: any) {
      toast.error(err.message || t('payment.error.message'));
      throw err;
    }
  };

  const onError = (err: any) => {
    toast.error(err.message || t('payment.error.message'));
  };

  return (
    <PayPalButtons
      style={{ layout: 'vertical' }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onError}
    />
  );
};

export default PayPalButtonsComponent;
