import React, { useState, useEffect } from 'react';
import { Wine, CategoryData, CreateWineData } from '../../types';

interface WineFormProps {
  wine?: Wine | null;
  categories: CategoryData[];
  onSave: (wine: Wine) => void;
  onCancel: () => void;
}

export default function WineForm({ wine, categories, onSave, onCancel }: WineFormProps) {
  const [formData, setFormData] = useState<CreateWineData>({
    name: '',
    description: '',
    price: 0,
    image: '',
    ingredients: [],
    color: '',
    history: '',
    vintage: new Date().getFullYear(),
    region: '',
    alcoholContent: 0,
    category: '',
    stockQuantity: 0,
  });
  const [ingredientInput, setIngredientInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (wine) {
      setFormData({
        name: wine.name,
        description: wine.description,
        price: wine.price,
        image: wine.image,
        ingredients: wine.ingredients,
        color: wine.color,
        history: wine.history,
        vintage: wine.vintage,
        region: wine.region,
        alcoholContent: wine.alcoholContent,
        category: wine.category,
        stockQuantity: wine.stockQuantity,
      });
    }
  }, [wine]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.region.trim()) newErrors.region = 'Region is required';
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (formData.vintage < 1800 || formData.vintage > new Date().getFullYear() + 5) {
      newErrors.vintage = 'Please enter a valid vintage year';
    }
    if (formData.alcoholContent < 0 || formData.alcoholContent > 50) {
      newErrors.alcoholContent = 'Alcohol content must be between 0 and 50%';
    }
    if (formData.stockQuantity < 0) newErrors.stockQuantity = 'Stock quantity cannot be negative';
    if (formData.ingredients.length === 0) newErrors.ingredients = 'At least one ingredient is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = wine ? '/api/wines/manage' : '/api/wines';
      const method = wine ? 'PUT' : 'POST';
      const body = wine ? { ...formData, id: wine.id } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data.data);
      } else {
        const errorData = await response.json();
        console.error('Failed to save wine:', errorData);
      }
    } catch (error) {
      console.error('Failed to save wine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateWineData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim() && !formData.ingredients.includes(ingredientInput.trim())) {
      handleInputChange('ingredients', [...formData.ingredients, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    handleInputChange('ingredients', formData.ingredients.filter(i => i !== ingredient));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server or cloud storage
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      handleInputChange('image', imageUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {wine ? 'Edit Wine' : 'Add New Wine'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat.isActive).map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (KSh) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                      errors.stockQuantity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.stockQuantity && <p className="mt-1 text-sm text-red-600">{errors.stockQuantity}</p>}
                </div>
              </div>

              {/* Wine Details */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Wine Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Region *</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                      errors.region ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Color *</label>
                  <select
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                      errors.color ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Color</option>
                    <option value="Red">Red</option>
                    <option value="White">White</option>
                    <option value="Rosé">Rosé</option>
                    <option value="Sparkling">Sparkling</option>
                  </select>
                  {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Vintage *</label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear() + 5}
                    value={formData.vintage}
                    onChange={(e) => handleInputChange('vintage', parseInt(e.target.value) || new Date().getFullYear())}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                      errors.vintage ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.vintage && <p className="mt-1 text-sm text-red-600">{errors.vintage}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Alcohol Content (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={formData.alcoholContent}
                    onChange={(e) => handleInputChange('alcoholContent', parseFloat(e.target.value) || 0)}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                      errors.alcoholContent ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.alcoholContent && <p className="mt-1 text-sm text-red-600">{errors.alcoholContent}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* History */}
            <div>
              <label className="block text-sm font-medium text-gray-700">History</label>
              <textarea
                rows={3}
                value={formData.history}
                onChange={(e) => handleInputChange('history', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red"
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingredients *</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  placeholder="Add ingredient"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red"
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-wine-red text-white"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.ingredients && <p className="mt-1 text-sm text-red-600">{errors.ingredients}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Wine Image</label>
              <div className="mt-1 flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-wine-red file:text-white hover:file:bg-wine-red-dark"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Wine preview"
                    className="h-16 w-16 object-cover rounded-md"
                  />
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-wine-red text-white rounded-md hover:bg-wine-red-dark disabled:opacity-50"
              >
                {loading ? 'Saving...' : wine ? 'Update Wine' : 'Add Wine'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}