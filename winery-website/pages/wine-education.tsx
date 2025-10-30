import React from 'react';
import Head from 'next/head';
import { WineKnowledgeBase } from '../components/education';

const WineEducationPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Wine Education - Learn About Wine | Wine Shop</title>
        <meta 
          name="description" 
          content="Expand your wine knowledge with our comprehensive educational resources. Learn about wine regions, types, tasting, and more." 
        />
        <meta name="keywords" content="wine education, wine knowledge, wine tasting, wine regions, wine types" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-wine-black to-charcoal text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
                Wine Education Center
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                Discover the fascinating world of wine through our comprehensive educational resources
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <WineKnowledgeBase />
        </div>
      </div>
    </>
  );
};

export default WineEducationPage;