import { describe, it, expect } from 'vitest';
import { useCalculatorStore } from '../store/calculatorStore';

describe('Calculator Store', () => {
  it('should initialize with default values', () => {
    const state = useCalculatorStore.getState();
    
    expect(state.currentStep).toBe(1);
    expect(state.formData).toEqual({});
    expect(state.errors).toEqual({});
    expect(state.isLoading).toBe(false);
  });

  it('should update current step', () => {
    const { setStep, currentStep } = useCalculatorStore.getState();
    
    setStep(2);
    expect(useCalculatorStore.getState().currentStep).toBe(2);
    
    // Reset
    setStep(1);
  });

  it('should update form data', () => {
    const { updateFormData, resetForm } = useCalculatorStore.getState();
    
    updateFormData({ pickupAddress: 'Berlin, Germany' });
    expect(useCalculatorStore.getState().formData.pickupAddress).toBe('Berlin, Germany');
    
    // Reset
    resetForm();
  });

  it('should set and clear errors', () => {
    const { setError, clearError, errors } = useCalculatorStore.getState();
    
    setError('testField', 'Test error message');
    expect(useCalculatorStore.getState().errors.testField).toBe('Test error message');
    
    clearError('testField');
    expect(useCalculatorStore.getState().errors.testField).toBeUndefined();
  });

  it('should reset form to initial state', () => {
    const { resetForm, setStep, updateFormData, setError } = useCalculatorStore.getState();
    
    // Set some state
    setStep(3);
    updateFormData({ pickupAddress: 'Test' });
    setError('field', 'error');
    
    // Reset
    resetForm();
    
    const state = useCalculatorStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.formData).toEqual({});
    expect(state.errors).toEqual({});
    expect(state.isLoading).toBe(false);
  });
});
