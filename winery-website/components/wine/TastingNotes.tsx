import React, { useState } from 'react';
import { TastingNote, TastingProfile, Wine } from '../../types';

interface TastingNotesProps {
  wine: Wine;
  tastingNotes: TastingNote[];
  onAddTastingNote?: (note: Omit<TastingNote, 'id' | 'createdAt'>) => void;
  className?: string;
}

interface TastingNoteFormData {
  rating: number;
  appearance: string;
  aroma: string;
  taste: string;
  finish: string;
  overallNotes: string;
}

const StarRating: React.FC<{ rating: number; onRatingChange?: (rating: number) => void; readonly?: boolean }> = ({ 
  rating, 
  onRatingChange, 
  readonly = false 
}) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange?.(star)}
          className={`text-xl ${
            star <= rating 
              ? 'text-gold-accent' 
              : 'text-gray-300'
          } ${!readonly ? 'hover:text-gold-accent cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const TastingProfileChart: React.FC<{ wine: Wine }> = ({ wine }) => {
  // Generate a sample tasting profile based on wine characteristics
  const generateProfile = (): TastingProfile => {
    const isRed = wine.color.toLowerCase() === 'red';
    const isWhite = wine.color.toLowerCase() === 'white';
    const isDessert = wine.category.toLowerCase().includes('dessert');
    
    return {
      sweetness: isDessert ? 4 : (isWhite ? 2 : 1),
      acidity: isWhite ? 4 : 3,
      tannins: isRed ? 4 : 1,
      body: isRed ? 4 : (isWhite ? 2 : 3),
      intensity: wine.alcoholContent > 13 ? 4 : 3
    };
  };

  const profile = generateProfile();
  
  const ProfileBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500">{value}/5</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold text-wine-black mb-3">Tasting Profile</h4>
      <ProfileBar label="Sweetness" value={profile.sweetness} color="bg-pink-400" />
      <ProfileBar label="Acidity" value={profile.acidity} color="bg-yellow-400" />
      {wine.color.toLowerCase() === 'red' && (
        <ProfileBar label="Tannins" value={profile.tannins} color="bg-red-400" />
      )}
      <ProfileBar label="Body" value={profile.body} color="bg-purple-400" />
      <ProfileBar label="Intensity" value={profile.intensity} color="bg-blue-400" />
    </div>
  );
};

export const TastingNotes: React.FC<TastingNotesProps> = ({ 
  wine, 
  tastingNotes, 
  onAddTastingNote,
  className = '' 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TastingNoteFormData>({
    rating: 5,
    appearance: '',
    aroma: '',
    taste: '',
    finish: '',
    overallNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTastingNote) {
      onAddTastingNote({
        wineId: wine.id,
        userId: 'current-user', // This would come from auth context
        userName: 'Current User', // This would come from auth context
        isVerifiedPurchase: false, // This would be determined by order history
        ...formData
      });
    }
    setShowForm(false);
    setFormData({
      rating: 5,
      appearance: '',
      aroma: '',
      taste: '',
      finish: '',
      overallNotes: ''
    });
  };

  const averageRating = tastingNotes.length > 0 
    ? tastingNotes.reduce((sum, note) => sum + note.rating, 0) / tastingNotes.length 
    : 0;

  return (
    <div className={`tasting-notes ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-wine-black font-serif">
          Tasting Notes & Reviews
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-wine-red text-white rounded hover:bg-wine-red-dark transition-colors"
        >
          Add Tasting Note
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex items-center space-x-4 mb-2">
              <StarRating rating={Math.round(averageRating)} readonly />
              <span className="text-lg font-semibold text-wine-black">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-500">
                ({tastingNotes.length} {tastingNotes.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        </div>
        
        <TastingProfileChart wine={wine} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6 border">
          <h4 className="text-lg font-semibold text-wine-black mb-4">Add Your Tasting Note</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating
            </label>
            <StarRating 
              rating={formData.rating} 
              onRatingChange={(rating) => setFormData({ ...formData, rating })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appearance
              </label>
              <textarea
                value={formData.appearance}
                onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-wine-red focus:border-wine-red"
                rows={2}
                placeholder="Color, clarity, viscosity..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aroma
              </label>
              <textarea
                value={formData.aroma}
                onChange={(e) => setFormData({ ...formData, aroma: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-wine-red focus:border-wine-red"
                rows={2}
                placeholder="Fruit, floral, earthy notes..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taste
              </label>
              <textarea
                value={formData.taste}
                onChange={(e) => setFormData({ ...formData, taste: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-wine-red focus:border-wine-red"
                rows={2}
                placeholder="Flavors, balance, structure..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finish
              </label>
              <textarea
                value={formData.finish}
                onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-wine-red focus:border-wine-red"
                rows={2}
                placeholder="Length, aftertaste, lingering notes..."
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Notes
            </label>
            <textarea
              value={formData.overallNotes}
              onChange={(e) => setFormData({ ...formData, overallNotes: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-wine-red focus:border-wine-red"
              rows={3}
              placeholder="Your overall impression and recommendations..."
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="px-4 py-2 bg-wine-red text-white rounded hover:bg-wine-red-dark transition-colors"
            >
              Submit Tasting Note
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {tastingNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-wine-black">{note.userName}</span>
                  {note.isVerifiedPurchase && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <StarRating rating={note.rating} readonly />
              </div>
              <span className="text-sm text-gray-500">
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
            </div>

            {note.overallNotes && (
              <p className="text-gray-700 mb-3">{note.overallNotes}</p>
            )}

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {note.appearance && (
                <div>
                  <span className="font-medium text-wine-red">Appearance:</span>
                  <p className="text-gray-600">{note.appearance}</p>
                </div>
              )}
              {note.aroma && (
                <div>
                  <span className="font-medium text-wine-red">Aroma:</span>
                  <p className="text-gray-600">{note.aroma}</p>
                </div>
              )}
              {note.taste && (
                <div>
                  <span className="font-medium text-wine-red">Taste:</span>
                  <p className="text-gray-600">{note.taste}</p>
                </div>
              )}
              {note.finish && (
                <div>
                  <span className="font-medium text-wine-red">Finish:</span>
                  <p className="text-gray-600">{note.finish}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {tastingNotes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No tasting notes yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TastingNotes;