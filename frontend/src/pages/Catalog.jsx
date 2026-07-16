import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [size, setSize] = useState(searchParams.get('size') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '6000');

  const fetchOutfits = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (size) params.size = size;
    if (maxPrice) params.maxPrice = maxPrice;

    axios.get(`${API_BASE_URL}/api/outfits`, { params })
      .then(res => {
        setOutfits(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching catalog', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOutfits();
    // Update URL query parameters
    const newParams = {};
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (size) newParams.size = size;
    if (maxPrice) newParams.maxPrice = maxPrice;
    setSearchParams(newParams);
  }, [search, category, size, maxPrice]);

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setSize('');
    setMaxPrice('6000');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-black">Explore Our Collections</h1>
        <p className="text-slate-700 text-sm mt-1">Rent designer outfits sanitized, dry-cleaned, and tailored to your custom fit.</p>
        <div className="h-0.5 w-16 bg-pink-500 mt-3 mx-auto md:mx-0"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="bg-white/60 backdrop-blur-sm border border-pink-200/50 p-6 rounded-xl shadow-sm h-fit space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-pink-100">
            <span className="flex items-center space-x-2 font-playfair font-bold text-black">
              <SlidersHorizontal className="w-4 h-4 text-pink-500" />
              <span>Filters</span>
            </span>
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-pink-600 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black uppercase tracking-wider">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Lehengas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm text-black bg-white/70 border border-pink-200 focus:border-pink-500 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none transition-all duration-200"
              />
              <Search className="w-4 h-4 text-pink-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm text-black bg-white/70 border border-pink-200 focus:border-pink-500 rounded-lg px-3 py-2.5 focus:outline-none transition-all duration-200"
            >
              <option value="">All Collections</option>
              <optgroup label="── Lehengas ──">
                <option value="Bridal Lehenga">Bridal Lehenga</option>
                <option value="Side Lehenga">Side Lehenga</option>
                <option value="Engagement Lehenga">Engagement Lehenga</option>
                <option value="Sangeet Lehenga">Sangeet Lehenga</option>
                <option value="Party Wear Lehenga">Party Wear Lehenga</option>
              </optgroup>
              <optgroup label="── Gowns ──">
                <option value="Bridal Gown">Bridal Gown</option>
                <option value="Evening Gown">Evening Gown</option>
              </optgroup>
            </select>
          </div>

          {/* Size Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black uppercase tracking-wider">Standard Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full text-sm text-black bg-white/70 border border-pink-200 focus:border-pink-500 rounded-lg px-3 py-2.5 focus:outline-none transition-all duration-200"
            >
              <option value="">All Sizes</option>
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
              <option value="XL">Extra Large (XL)</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-black uppercase tracking-wider">Max Rent Price</label>
              <span className="text-sm font-bold text-pink-600">₹{parseFloat(maxPrice).toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="10000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹2,000</span>
              <span>₹10,000</span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-pink-100/40 border border-pink-200/50 rounded-xl h-[420px]"></div>
              ))}
            </div>
          ) : outfits.length === 0 ? (
            <div className="text-center py-16 bg-white/60 border border-pink-200/50 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-4">
              <Filter className="w-12 h-12 text-pink-300" />
              <h3 className="font-playfair text-xl font-bold text-black">No Outfits Found</h3>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">We couldn't find any Lehengas matching your exact filters. Try broadening your options!</p>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {outfits.map(outfit => (
                <ProductCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Catalog;
