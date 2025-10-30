import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Vintage Cellar - Premium Wine Collection',
  description = 'Discover exceptional wines from around the world. Curated selection of premium vintages for every occasion.',
  className = ''
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content="/og-image.jpg" />
        
        {/* Additional SEO */}
        <meta name="keywords" content="wine, premium wine, vintage, red wine, white wine, sparkling wine, wine collection, Kenya wine, online wine store" />
        <meta name="author" content="Vintage Cellar" />
        <link rel="canonical" href="https://vintagecellar.co.ke" />
      </Head>

      <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`}>
        <Header />
        
        <main 
          id="main-content" 
          className="flex-1"
          role="main"
          aria-label="Main content"
        >
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout;