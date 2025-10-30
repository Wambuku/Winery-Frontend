import React, { useState, useMemo } from 'react';

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  readTime: number; // in minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface WineKnowledgeBaseProps {
  className?: string;
}

// Sample knowledge base articles
const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'Understanding Wine Tannins',
    category: 'Wine Basics',
    content: 'Tannins are naturally occurring compounds found in grape skins, seeds, and stems that give red wines their structure and aging potential. They create a dry, astringent sensation in your mouth and are responsible for the "grip" you feel when drinking red wine. Tannins act as natural preservatives, allowing wines to age gracefully over many years. Young, tannic wines often benefit from decanting or aging to soften their intensity.',
    tags: ['tannins', 'red wine', 'structure', 'aging'],
    readTime: 3,
    difficulty: 'Beginner'
  },
  {
    id: '2',
    title: 'The Art of Wine Decanting',
    category: 'Wine Service',
    content: 'Decanting serves two primary purposes: separating wine from sediment and allowing it to breathe. Young, tannic red wines benefit from aeration, which softens harsh tannins and opens up the wine\'s aromas. Older wines may have sediment that needs to be separated. The decanting process involves slowly pouring wine into a decanter, watching for sediment, and allowing the wine to rest before serving.',
    tags: ['decanting', 'aeration', 'sediment', 'service'],
    readTime: 5,
    difficulty: 'Intermediate'
  },
  {
    id: '3',
    title: 'Terroir: The Soul of Wine',
    category: 'Viticulture',
    content: 'Terroir encompasses all the environmental factors that influence wine character: soil composition, climate, topography, and human intervention. The French concept suggests that wines reflect their place of origin, creating unique expressions that cannot be replicated elsewhere. Understanding terroir helps explain why wines from different regions taste distinct, even when made from the same grape variety.',
    tags: ['terroir', 'soil', 'climate', 'region'],
    readTime: 7,
    difficulty: 'Advanced'
  },
  {
    id: '4',
    title: 'Wine Storage Essentials',
    category: 'Wine Care',
    content: 'Proper wine storage preserves and enhances wine quality. Key factors include consistent temperature (55-65°F), humidity (60-70%), darkness, minimal vibration, and proper positioning. Wines with corks should be stored horizontally to keep corks moist. Avoid temperature fluctuations and strong odors. A wine refrigerator or cellar provides ideal conditions for long-term storage.',
    tags: ['storage', 'temperature', 'humidity', 'cellar'],
    readTime: 4,
    difficulty: 'Beginner'
  },
  {
    id: '5',
    title: 'Reading Wine Labels Like a Pro',
    category: 'Wine Knowledge',
    content: 'Wine labels contain valuable information about origin, grape variety, vintage, and quality level. European wines often emphasize region (Bordeaux, Chianti), while New World wines highlight grape variety (Cabernet Sauvignon, Chardonnay). Look for producer name, alcohol content, and quality designations like AOC, DOC, or AVA. Understanding label terminology helps make informed purchasing decisions.',
    tags: ['labels', 'regions', 'quality', 'terminology'],
    readTime: 6,
    difficulty: 'Intermediate'
  },
  {
    id: '6',
    title: 'The Science of Wine Aging',
    category: 'Wine Science',
    content: 'Wine aging involves complex chemical reactions that transform harsh young wines into smooth, complex beverages. Tannins polymerize and soften, acids integrate, and new flavor compounds develop. Not all wines benefit from aging - most are designed for immediate consumption. Age-worthy wines typically have high acidity, tannins, or sugar content that provides structure for long-term development.',
    tags: ['aging', 'chemistry', 'tannins', 'development'],
    readTime: 8,
    difficulty: 'Advanced'
  }
];

const CATEGORIES = ['All', 'Wine Basics', 'Wine Service', 'Viticulture', 'Wine Care', 'Wine Knowledge', 'Wine Science'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const WineKnowledgeBase: React.FC<WineKnowledgeBaseProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    return KNOWLEDGE_ARTICLES.filter(article => {
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || article.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`wine-knowledge-base ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-wine-black mb-4 font-serif">
          Wine Knowledge Base
        </h2>
        <p className="text-gray-600 mb-6">
          Expand your wine knowledge with our comprehensive collection of articles, 
          from beginner basics to advanced concepts.
        </p>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Articles
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, content, or tags..."
                className="w-full p-2 border border-gray-300 rounded focus:ring-wine-red focus:border-wine-red"
              />
            </div>

            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-wine-red focus:border-wine-red"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty-select" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-wine-red focus:border-wine-red"
              >
                {DIFFICULTIES.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="space-y-6">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-wine-black">
                      {article.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(article.difficulty)}`}>
                      {article.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="bg-wine-red text-white px-2 py-1 rounded text-xs">
                      {article.category}
                    </span>
                    <span>{article.readTime} min read</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">
                  {expandedArticle === article.id 
                    ? article.content 
                    : `${article.content.substring(0, 200)}...`
                  }
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setExpandedArticle(
                    expandedArticle === article.id ? null : article.id
                  )}
                  className="text-wine-red hover:text-wine-red-dark font-medium text-sm"
                >
                  {expandedArticle === article.id ? 'Read Less' : 'Read More'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find relevant articles.
            </p>
          </div>
        )}
      </div>

      {/* Quick Tips Section */}
      <div className="mt-12 bg-gradient-to-r from-wine-red to-wine-red-dark text-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Wine Tips</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Tasting Order</h4>
            <p className="opacity-90">
              Taste wines from light to heavy: sparkling → white → rosé → light red → full red → dessert
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Serving Temperature</h4>
            <p className="opacity-90">
              Sparkling & White: 45-50°F | Light Red: 55°F | Full Red: 60-65°F
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineKnowledgeBase;