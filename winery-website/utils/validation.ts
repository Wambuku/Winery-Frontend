// Validation utilities for forms and data

import { VALIDATION } from './constants';

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
}

// Name validation
export function isValidName(name: string): boolean {
  return name.trim().length > 0 && name.length <= VALIDATION.MAX_NAME_LENGTH;
}

// Price validation
export function isValidPrice(price: number): boolean {
  return price >= VALIDATION.MIN_WINE_PRICE && price <= VALIDATION.MAX_WINE_PRICE;
}

// Quantity validation
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= VALIDATION.MAX_CART_QUANTITY;
}

// Phone number validation (for M-Pesa)
export function isValidPhoneNumber(phone: string): boolean {
  // Kenyan phone number format: +254XXXXXXXXX or 254XXXXXXXXX or 07XXXXXXXX
  const phoneRegex = /^(\+?254|0)?[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Format phone number for M-Pesa (254XXXXXXXXX format)
export function formatPhoneForMpesa(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  
  if (cleaned.startsWith('+254')) {
    return cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    return cleaned;
  } else if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }
  
  return cleaned;
}

// Sanitize string input
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Validate wine data
export function validateWineData(wine: Partial<{
  name: string;
  description: string;
  price: number;
  alcoholContent: number;
  vintage: number;
}>): string[] {
  const errors: string[] = [];

  if (!wine.name || !isValidName(wine.name)) {
    errors.push('Wine name is required and must be valid');
  }

  if (!wine.description || wine.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push('Wine description is required and must not exceed maximum length');
  }

  if (wine.price === undefined || !isValidPrice(wine.price)) {
    errors.push('Wine price must be a valid amount');
  }

  if (wine.alcoholContent !== undefined && (wine.alcoholContent < 0 || wine.alcoholContent > 50)) {
    errors.push('Alcohol content must be between 0 and 50 percent');
  }

  if (wine.vintage !== undefined) {
    const currentYear = new Date().getFullYear();
    if (wine.vintage < 1800 || wine.vintage > currentYear) {
      errors.push('Vintage year must be valid');
    }
  }

  return errors;
}