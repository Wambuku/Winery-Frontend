import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import WineForm from '../../../components/staff/WineForm';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockCategories = [
  { id: '1', name: 'Red Wine', description: 'Red wines', isActive: true },
  { id: '2', name: 'White Wine', description: 'White wines', isActive: true },
];

const mockWine = {
  id: '1',
  name: 'Test Wine',
  description: 'Test description',
  price: 100,
  image: '/test-image.jpg',
  ingredients: ['Cabernet Sauvignon', 'Merlot'],
  color: 'Red',
  history: 'Test history',
  vintage: 2020,
  region: 'Test Region',
  alcoholContent: 12.5,
  category: 'Red Wine',
  inStock: true,
  stockQuantity: 25,
};

const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();

describe('WineForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  it('renders form for adding new wine', () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Add New Wine')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/)).toBeInTheDocument();
    expect(screen.getByText('Add Wine')).toBeInTheDocument();
  });

  it('renders form for editing existing wine', () => {
    render(
      <WineForm
        wine={mockWine}
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Wine')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Wine')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByText('Update Wine')).toBeInTheDocument();
  });

  it('populates form fields when editing wine', () => {
    render(
      <WineForm
        wine={mockWine}
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Test Wine')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Region')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Red')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    expect(screen.getByText('Cabernet Sauvignon')).toBeInTheDocument();
    expect(screen.getByText('Merlot')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Add Wine');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Category is required')).toBeInTheDocument();
      expect(screen.getByText('Region is required')).toBeInTheDocument();
      expect(screen.getByText('Color is required')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('validates price field', async () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const priceInput = screen.getByLabelText(/Price/);
    fireEvent.change(priceInput, { target: { value: '0' } });

    const submitButton = screen.getByText('Add Wine');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
    });
  });

  it('validates vintage field', async () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const vintageInput = screen.getByLabelText(/Vintage/);
    fireEvent.change(vintageInput, { target: { value: '1700' } });

    const submitButton = screen.getByText('Add Wine');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid vintage year')).toBeInTheDocument();
    });
  });

  it('validates alcohol content field', async () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const alcoholInput = screen.getByLabelText(/Alcohol Content/);
    fireEvent.change(alcoholInput, { target: { value: '60' } });

    const submitButton = screen.getByText('Add Wine');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Alcohol content must be between 0 and 50%')).toBeInTheDocument();
    });
  });

  it('validates stock quantity field', async () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const stockInput = screen.getByLabelText(/Stock Quantity/);
    fireEvent.change(stockInput, { target: { value: '-5' } });

    const submitButton = screen.getByText('Add Wine');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Stock quantity cannot be negative')).toBeInTheDocument();
    });
  });

  it('adds and removes ingredients', () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const ingredientInput = screen.getByPlaceholderText('Add ingredient');
    const addButton = screen.getByText('Add');

    // Add ingredient
    fireEvent.change(ingredientInput, { target: { value: 'Cabernet Sauvignon' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Cabernet Sauvignon')).toBeInTheDocument();
    expect(ingredientInput).toHaveValue('');

    // Remove ingredient
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    expect(screen.queryByText('Cabernet Sauvignon')).not.toBeInTheDocument();
  });

  it('adds ingredient on Enter key press', () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const ingredientInput = screen.getByPlaceholderText('Add ingredient');

    fireEvent.change(ingredientInput, { target: { value: 'Merlot' } });
    fireEvent.keyPress(ingredientInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText('Merlot')).toBeInTheDocument();
  });

  it('prevents duplicate ingredients', () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const ingredientInput = screen.getByPlaceholderText('Add ingredient');
    const addButton = screen.getByText('Add');

    // Add ingredient twice
    fireEvent.change(ingredientInput, { target: { value: 'Pinot Noir' } });
    fireEvent.click(addButton);
    fireEvent.change(ingredientInput, { target: { value: 'Pinot Noir' } });
    fireEvent.click(addButton);

    const ingredients = screen.getAllByText('Pinot Noir');
    expect(ingredients).toHaveLength(1);
  });

  it('submits form with valid data for new wine', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockWine }),
    } as Response);

    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Test Wine' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'Test description' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'Red Wine' } });
    fireEvent.change(screen.getByLabelText(/Region/), { target: { value: 'Test Region' } });
    fireEvent.change(screen.getByLabelText(/Color/), { target: { value: 'Red' } });
    fireEvent.change(screen.getByLabelText(/Stock Quantity/), { target: { value: '25' } });

    // Add ingredient
    const ingredientInput = screen.getByPlaceholderText('Add ingredient');
    fireEvent.change(ingredientInput, { target: { value: 'Cabernet Sauvignon' } });
    fireEvent.click(screen.getByText('Add'));

    const submitButton = screen.getByText('Add Wine');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/wines', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        }),
        body: expect.stringContaining('Test Wine'),
      }));
    });

    expect(mockOnSave).toHaveBeenCalledWith(mockWine);
  });

  it('submits form with valid data for existing wine', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockWine }),
    } as Response);

    render(
      <WineForm
        wine={mockWine}
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Update Wine');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/wines/manage', expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        }),
        body: expect.stringContaining(mockWine.id),
      }));
    });

    expect(mockOnSave).toHaveBeenCalledWith(mockWine);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onCancel when close button is clicked', () => {
    render(
      <WineForm
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    vi.mocked(fetch).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <WineForm
        wine={mockWine}
        categories={mockCategories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Update Wine');
    fireEvent.click(submitButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});