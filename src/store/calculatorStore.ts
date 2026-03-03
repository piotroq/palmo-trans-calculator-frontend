import { create } from 'zustand';
import type { DeliveryRequest } from '../types/index';

interface CalculatorStore {
  currentStep: 1 | 2 | 3;
  formData: Partial<DeliveryRequest>;
  errors: Record<string, string>;
  isLoading: boolean;
  
  setStep: (step: 1 | 2 | 3) => void;
  updateFormData: (data: Partial<DeliveryRequest>) => void;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  setLoading: (loading: boolean) => void;
  resetForm: () => void;
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  currentStep: 1,
  formData: {},
  errors: {},
  isLoading: false,
  
  setStep: (step) => set({ currentStep: step }),
  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data },
  })),
  setError: (field, message) => set((state) => ({
    errors: { ...state.errors, [field]: message },
  })),
  clearError: (field) => set((state) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [field]: _, ...rest } = state.errors;
    return { errors: rest };
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  resetForm: () => set({
    currentStep: 1,
    formData: {},
    errors: {},
    isLoading: false,
  }),
}));
