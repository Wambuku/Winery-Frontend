import React from 'react';

interface WineRegion {
  name: string;
  country: string;
  description: string;
  characteristics: string[];
  famousWines: string[];
  climate: string;
}

interface WineRegionInfoProps {
  region: string;
  className?: string;
}

// Educational data about wine regions
const WINE_REGIONS: Record<string, WineRegion> = {
  'Bordeaux': {
    name: 'Bordeaux',
    country: 'France',
    description: 'Bordeaux is one of the world\'s most prestigious wine regions, known for its exceptional red wine blends and elegant whites.',
    characteristics: ['Complex blends', 'Age-worthy wines', 'Cabernet Sauvignon and Merlot dominant', 'Maritime climate influence'],
    famousWines: ['Château Margaux', 'Château Lafite Rothschild', 'Château Pétrus'],
    climate: 'Maritime temperate climate with mild winters and warm summers'
  },
  'Tuscany': {
    name: 'Tuscany',
    country: 'Italy',
    description: 'Tuscany produces some of Italy\'s most celebrated wines, including Chianti and Brunello di Montalcino.',
    characteristics: ['Sangiovese grape variety', 'Rolling hills terroir', 'Traditional winemaking', 'Food-friendly wines'],
    famousWines: ['Chianti Classico', 'Brunello di Montalcino', 'Super Tuscans'],
    climate: 'Mediterranean climate with hot, dry summers and mild winters'
  },
  'Napa Valley': {
    name: 'Napa Valley',
    country: 'United States',
    description: 'California\'s premier wine region, renowned for world-class Cabernet Sauvignon and innovative winemaking.',
    characteristics: ['Premium Cabernet Sauvignon', 'Diverse microclimates', 'Modern techniques', 'Boutique wineries'],
    famousWines: ['Opus One', 'Screaming Eagle', 'Caymus'],
    climate: 'Mediterranean climate with warm days and cool nights'
  },
  'Rioja': {
    name: 'Rioja',
    country: 'Spain',
    description: 'Spain\'s most famous wine region, known for elegant Tempranillo-based reds with excellent aging potential.',
    characteristics: ['Tempranillo grape', 'Oak aging tradition', 'Classification system', 'Food pairing excellence'],
    famousWines: ['Marqués de Riscal', 'López de Heredia', 'CVNE'],
    climate: 'Continental climate with Atlantic and Mediterranean influences'
  }
};

export const WineRegionInfo: React.FC<WineRegionInfoProps> = ({ region, className = '' }) => {
  const regionInfo = WINE_REGIONS[region];

  if (!regionInfo) {
    return (
      <div className={`wine-region-info ${className}`}>
        <h3 className="text-lg font-semibold text-wine-black mb-2">
          {region} Region
        </h3>
        <p className="text-gray-600">
          Discover the unique characteristics of wines from the {region} region.
        </p>
      </div>
    );
  }

  return (
    <div className={`wine-region-info ${className}`}>
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-wine-red">
        <h3 className="text-xl font-bold text-wine-black mb-2 font-serif">
          {regionInfo.name}, {regionInfo.country}
        </h3>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          {regionInfo.description}
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-wine-red mb-2">Key Characteristics</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {regionInfo.characteristics.map((char, index) => (
                <li key={index}>{char}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-wine-red mb-2">Famous Wines</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {regionInfo.famousWines.map((wine, index) => (
                <li key={index}>{wine}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h4 className="font-semibold text-wine-black mb-1">Climate</h4>
          <p className="text-sm text-gray-600">{regionInfo.climate}</p>
        </div>
      </div>
    </div>
  );
};

export default WineRegionInfo;