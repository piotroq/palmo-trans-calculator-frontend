import { useEffect, useRef } from 'react';
import { useCalculatorStore } from '../store/calculatorStore';
import { submitDeliveryRequest } from '../services/api';

declare global {
  interface Window {
    paypal: any;
  }
}

interface PayPalButtonProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const PayPalButton = ({ onSuccess, onError }: PayPalButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { formData, resetForm, setLoading } = useCalculatorStore();

  useEffect(() => {
    if (!window.paypal) {
      console.error('❌ PayPal SDK not loaded');
      return;
    }

    window.paypal
      .Buttons({
        createOrder: async (data: any, actions: any) => {
          try {
            setLoading(true);
            
            console.log('📝 Wysyłam zgłoszenie do backendu...');
            const response = await submitDeliveryRequest(formData);
            console.log('✅ Zgłoszenie wysłane:', response);

            const apiResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/payments/create-order`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  submissionId: response.id,
                  amount: formData.estimatedPrice,
                  returnUrl: `${window.location.origin}/payment-success`,
                  cancelUrl: `${window.location.origin}/payment-cancel`,
                }),
              }
            );

            if (!apiResponse.ok) {
              throw new Error('Nie można stworzyć zamówienia PayPal');
            }

            const orderData = await apiResponse.json();
            console.log('💳 PayPal order created:', orderData.orderId);
            
            setLoading(false);
            return orderData.orderId;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Nie można stworzyć zamówienia';
            console.error('❌ Error creating order:', errorMsg);
            onError(errorMsg);
            setLoading(false);
            throw error;
          }
        },

        onApprove: async (data: any, actions: any) => {
          try {
            setLoading(true);
            console.log('✅ PayPal approved, capturing payment...');
            
            const captureResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/payments/capture`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: data.orderID }),
              }
            );

            if (!captureResponse.ok) {
              throw new Error('Capture failed');
            }

            const captureData = await captureResponse.json();
            console.log('✅ Płatność potwierdzona!', captureData);
            
            alert(
              `✅ Płatność potwierdzona!\n\nNumer referencyjny: ${captureData.submission?.referenceNumber || 'Przetwarzanie...'}\n\nSprawdź email.`
            );

            resetForm();
            onSuccess();
            setLoading(false);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Błąd potwierdzenia płatności';
            console.error('❌ Capture error:', errorMsg);
            onError(errorMsg);
            setLoading(false);
          }
        },

        onError: (error: any) => {
          const errorMsg = `Błąd PayPal: ${error.message}`;
          console.error('❌ PayPal error:', errorMsg);
          onError(errorMsg);
          setLoading(false);
        },
      })
      .render(containerRef.current);
  }, [formData, onSuccess, onError, resetForm, setLoading]);

  return (
    <div 
      ref={containerRef} 
      id="paypal-button-container"
      className="mt-4"
    />
  );
};
