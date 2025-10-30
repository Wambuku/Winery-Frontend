import React from 'react';

interface WineTypeData {
  name: string;
  description: string;
  characteristics: string[];
  servingTemp: string;
  glassType: string;
  commonGrapes: string[];
  foodPairings: string[];
}

interface WineTypeInfoProps {
  wineType: string;
  className?: string;
}

// Educational data about wine types
const WINE_TYPES: Record<string, WineTypeData> = {
  'Red': {
    name: 'Red Wine',
    description: 'Red wines are made from dark-colored grape varieties and get their color from grape skin contact during fermentation.',
    characteristics: ['Rich tannins', 'Complex flavors', 'Age-worthy', 'Full-bodied'],
    servingTemp: '60-68°F (15-20°C)',
    glassType: 'Large bowl red wine glass',
    commonGrapes: ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah', 'Sangiovese'],
    foodPairings: ['Red meat', 'Game', 'Aged cheeses', 'Dark chocolate']
  },
  'White': {
    name: 'White Wine',
    description: 'White wines are typically made from white grapes, though some can be made from red grapes with minimal skin contact.',
    characteristics: ['Crisp acidity', 'Fresh flavors', 'Light to medium body', 'Refreshing'],
    servingTemp: '45-50°F (7-10°C)',
    glassType: 'Smaller bowl white wine glass',
    commonGrapes: ['Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Pinot Grigio', 'Gewürztraminer'],
    foodPairings: ['Seafood', 'Poultry', 'Light pasta', 'Fresh cheeses']
  },
  'Rosé': {
    name: 'Rosé Wine',
    description: 'Rosé wines are made from red grapes with limited skin contact, creating their characteristic pink color.',
    characteristics: ['Light to medium body', 'Fresh acidity', 'Fruit-forward', 'Versatile'],
    servingTemp: '45-50°F (7-10°C)',
    glassType: 'White wine glass or rosé-specific glass',
    commonGrapes: ['Grenache', 'Sangiovese', 'Pinot Noir', 'Syrah', 'Mourvèdre'],
    foodPairings: ['Salads', 'Light seafood', 'Mediterranean cuisine', 'Summer dishes']
  },
  'Sparkling': {
    name: 'Sparkling Wine',
    description: 'Sparkling wines contain significant levels of carbon dioxide, creating effervescence and celebration.',
    characteristics: ['Effervescent bubbles', 'High acidity', 'Celebratory', 'Palate cleansing'],
    servingTemp: '40-45°F (4-7°C)',
    glassType: 'Flute or tulip glass',
    commonGrapes: ['Chardonnay', 'Pinot Noir', 'Pinot Meunier', 'Glera', 'Chenin Blanc'],
    foodPairings: ['Oysters', 'Caviar', 'Light appetizers', 'Celebration foods']
  },
  'Dessert': {
    name: 'Dessert Wine',
    description: 'Sweet wines typically served with or as dessert, made through various methods to concentrate sugars.',
    characteristics: ['High residual sugar', 'Rich texture', 'Concentrated flavors', 'Lower alcohol'],
    servingTemp: '45-50°F (7-10°C)',
    glassType: 'Small dessert wine glass',
    commonGrapes: ['Riesling', 'Moscato', 'Sauternes blend', 'Port varieties'],
    foodPairings: ['Desserts', 'Blue cheese', 'Foie gras', 'Fruit tarts']
  }
};

export const WineTypeInfo: React.FC<WineTypeInfoProps> = ({ wineType, className = '' }) => {
  const typeInfo = WINE_TYPES[wineType];

  if (!typeInfo) {
    return (
      <div className={`wine-type-info ${className}`}>
        <h3 className="text-lg font-semibold text-wine-black mb-2">
          {wineType} Wine
        </h3>
        <p className="text-gray-600">
          Learn about the characteristics and serving suggestions for {wineType.toLowerCase()} wines.
        </p>
      </div>
    );
  }

  return (
    <div className={`wine-type-info ${className}`}>
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-wine-black mb-3 font-serif">
          {typeInfo.name}
        </h3>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          {typeInfo.description}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-wine-red mb-2">Characteristics</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {typeInfo.characteristics.map((char, index) => (
                  <li key={index}>{char}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-wine-red mb-2">Common Grape Varieties</h4>
              <div className="flex flex-wrap gap-2">
                {typeInfo.commonGrapes.map((grape, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-wine-red text-white text-xs rounded-full"
                  >
                    {grape}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-cream rounded border-l-2 border-wine-red">
                <h5 className="font-medium text-wine-black">Serving Temperature</h5>
                <p className="text-sm text-gray-600">{typeInfo.servingTemp}</p>
              </div>
              
              <div className="p-3 bg-cream rounded border-l-2 border-wine-red">
                <h5 className="font-medium text-wine-black">Recommended Glass</h5>
                <p className="text-sm text-gray-600">{typeInfo.glassType}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-wine-red mb-2">Food Pairings</h4>
              <div className="flex flex-wrap gap-2">
                {typeInfo.foodPairings.map((pairing, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gold-accent text-wine-black text-xs rounded"
                  >
                    {pairing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineTypeInfo;