// Tests for checkout stepper component

import React from 'react';
import { render, screen } from '@testing-library/react';
import CheckoutStepper from '../../../components/checkout/CheckoutStepper';
import { CheckoutStep } from '../../../types/checkout';

const mockSteps: CheckoutStep[] = [
  { id: 'shipping', title: 'Shipping', completed: false, active: true },
  { id: 'payment', title: 'Payment', completed: false, active: false },
  { id: 'confirmation', title: 'Confirmation', completed: false, active: false },
];

describe('CheckoutStepper', () => {
  it('renders all steps', () => {
    render(<CheckoutStepper steps={mockSteps} currentStep={0} />);
    
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  it('shows active step correctly', () => {
    render(<CheckoutStepper steps={mockSteps} currentStep={0} />);
    
    const shippingStep = screen.getByText('Shipping');
    expect(shippingStep).toHaveClass('text-wine-red');
  });

  it('shows completed steps with checkmark', () => {
    const completedSteps: CheckoutStep[] = [
      { id: 'shipping', title: 'Shipping', completed: true, active: false },
      { id: 'payment', title: 'Payment', completed: false, active: true },
      { id: 'confirmation', title: 'Confirmation', completed: false, active: false },
    ];

    render(<CheckoutStepper steps={completedSteps} currentStep={1} />);
    
    // Check for checkmark SVG in completed step
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('displays step numbers for non-completed steps', () => {
    render(<CheckoutStepper steps={mockSteps} currentStep={0} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});