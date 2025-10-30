import React from 'react';
import { Wine } from '../../types';

interface PairingCategory {
  category: string;
  items: string[];
  description: string;
}

interface WinePairingsProps {
  wine: Wine;
  className?: string;
}

// Generate pairing suggestions based on wine characteristics
const generatePairings = (wine: Wine): PairingCategory[] => {
  const pairings: PairingCategory[] = [];

  // Base pairings on wine color/type
  switch (wine.color.toLowerCase()) {
    case 'red':
      pairings.push({
        category: 'Main Courses',
        items: ['Grilled ribeye steak', 'Lamb with rosemary', 'Beef bourguignon', 'Aged cheddar'],
        description: 'Rich red wines pair beautifully with robust, flavorful dishes'
      });
      pairings.push({
        category: 'Cheeses',
        items: ['Aged gouda', 'Blue cheese', 'Manchego', 'Parmigiano-Reggiano'],
        description: 'The tannins in red wine complement aged, hard cheeses'
      });
      break;

    case 'white':
      pairings.push({
        category: 'Seafood & Poultry',
        items: ['Grilled salmon', 'Roasted chicken', 'Lobster with butter', 'Pan-seared scallops'],
        description: 'White wines enhance delicate flavors without overwhelming them'
      });
      pairings.push({
        category: 'Light Dishes',
        items: ['Caesar salad', 'Pasta primavera', 'Goat cheese tart', 'Fresh oysters'],
        description: 'Crisp acidity complements fresh, light preparations'
      });
      break;

    case 'rosé':
      pairings.push({
        category: 'Mediterranean',
        items: ['Grilled vegetables', 'Prosciutto and melon', 'Niçoise salad', 'Herb-crusted fish'],
        description: 'Rosé\'s versatility shines with Mediterranean flavors'
      });
      pairings.push({
        category: 'Summer Fare',
        items: ['Caprese salad', 'Grilled shrimp', 'Charcuterie board', 'Fresh berries'],
        description: 'Perfect for outdoor dining and seasonal ingredients'
      });
      break;

    case 'sparkling':
      pairings.push({
        category: 'Appetizers',
        items: ['Caviar and blinis', 'Smoked salmon canapés', 'Fried calamari', 'Cheese soufflé'],
        description: 'Bubbles cleanse the palate and enhance celebratory foods'
      });
      pairings.push({
        category: 'Celebrations',
        items: ['Wedding cake', 'Chocolate truffles', 'Fresh strawberries', 'Champagne cocktails'],
        description: 'Traditional pairing for special occasions and desserts'
      });
      break;

    default:
      pairings.push({
        category: 'Classic Pairings',
        items: ['Artisanal cheese', 'Dark chocolate', 'Roasted nuts', 'Fresh fruit'],
        description: 'Timeless combinations that enhance wine appreciation'
      });
  }

  // Add region-specific pairings
  if (wine.region.toLowerCase().includes('italy') || wine.region.toLowerCase().includes('tuscany')) {
    pairings.push({
      category: 'Italian Cuisine',
      items: ['Osso buco', 'Truffle risotto', 'Bistecca Fiorentina', 'Pecorino Toscano'],
      description: 'Traditional pairings from the wine\'s region of origin'
    });
  } else if (wine.region.toLowerCase().includes('france') || wine.region.toLowerCase().includes('bordeaux')) {
    pairings.push({
      category: 'French Cuisine',
      items: ['Coq au vin', 'Duck confit', 'Roquefort cheese', 'Cassoulet'],
      description: 'Classic French preparations that complement regional wines'
    });
  }

  return pairings;
};

export const WinePairings: React.FC<WinePairingsProps> = ({ wine, className = '' }) => {
  const pairings = generatePairings(wine);

  return (
    <div className={`wine-pairings ${className}`}>
      <h3 className="text-xl font-semibold text-wine-black mb-4 font-serif">
        Perfect Pairings
      </h3>
      
      <div className="space-y-6">
        {pairings.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <h4 className="text-lg font-semibold text-wine-red mb-2">
              {category.category}
            </h4>
            <p className="text-sm text-gray-600 mb-3 italic">
              {category.description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {category.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className="bg-gradient-to-r from-cream to-white p-3 rounded border-l-2 border-gold-accent hover:shadow-md transition-shadow"
                >
                  <span className="text-sm font-medium text-wine-black">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-wine-red to-wine-red-dark text-white rounded-lg">
        <h4 className="font-semibold mb-2">Pairing Tip</h4>
        <p className="text-sm opacity-90">
          When pairing wine with food, consider the weight and intensity of both. 
          Light wines pair with delicate dishes, while bold wines complement robust flavors. 
          Don't forget to consider the sauce and preparation method!
        </p>
      </div>
    </div>
  );
};

export default WinePairings;