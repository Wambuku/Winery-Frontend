// Integration test for checkout flow

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ShippingForm from '../../components/checkout/ShippingForm';
import PaymentForm from '../../components/checkout/PaymentForm';
import { ShippingAddress, PaymentDetails } from '../../types/checkout';

describe('Checkout Flow Integration', () => {
  describe('ShippingForm', () => {
    it('validates required fields and submits valid data', async () => {
      const mockOnSubmit = vi.fn();
      
      render(<ShippingForm onSubmit={mockOnSubmit} />);
      
      // Try to submit empty form
      const submitButton = screen.getByText('Continue to Payment');
      fireEvent.click(submitButton);
      
      // Check validation errors appear
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '+254712345678' },
      });
      fireEvent.change(screen.getByLabelText(/address/i), {
        target: { value: '123 Test Street' },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: 'Nairobi' },
      });
      fireEvent.change(screen.getByLabelText(/postal code/i), {
        target: { value: '00100' },
      });
      
      // Submit the form
      fireEvent.click(submitButton);
      
      // Check that onSubmit was called with correct data
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+254712345678',
          address: '123 Test Street',
          city: 'Nairobi',
          postalCode: '00100',
          country: 'Kenya',
        });
      });
    });

    it('validates email format', async () => {
      const mockOnSubmit = vi.fn();
      
      render(<ShippingForm onSubmit={mockOnSubmit} />);
      
      // Enter invalid email
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' },
      });
      
      const submitButton = screen.getByText('Continue to Payment');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });
  });

  describe('PaymentForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnBack = vi.fn();
    const total = 3000;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('renders payment options and order total', () => {
      render(
        <PaymentForm 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
          total={total} 
        />
      );
      
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
      expect(screen.getByText('KSh 3,000')).toBeInTheDocument();
      expect(screen.getByText('M-Pesa')).toBeInTheDocument();
      expect(screen.getByText('Cash Payment')).toBeInTheDocument();
    });

    it('submits M-Pesa payment with valid phone number', async () => {
      render(
        <PaymentForm 
          onSubmit={mockOnSubmit} 
          onBack={mockOnBack} 
          total={total} 
        />
      );
      
      // Fill M-Pesa phone number
      const phoneInput = screen.getByLabelText(/m-pesa phone number/i);
      fireEvent.change(phoneInput, { target: { value: '+254712345678' } });
      
      // Submit form
      const completeOrderButton = screen.getByText('Complete Order');
      fireEvent.click(completeOrderButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          method: 'mpesa',
          mpesaPhone: '+254712345678',
        });
      });
    });
  });
});