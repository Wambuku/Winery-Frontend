// Checkout page

import React from 'react';
import Head from 'next/head';
import Checkout from '../components/checkout/Checkout';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

export default function CheckoutPage() {
  return (
    <>
      <Head>
        <title>Checkout - Wine E-commerce Platform</title>
        <meta name="description" content="Complete your wine purchase securely" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AuthProvider>
        <CartProvider>
          <Checkout />
        </CartProvider>
      </AuthProvider>
    </>
  );
}