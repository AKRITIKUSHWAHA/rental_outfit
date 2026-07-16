import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AdminLayout from '../components/AdminLayout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  X, 
  Image as ImageIcon,
  Shirt,
  Tags,
  Sliders,
  AlertTriangle,
  Info,
  Calendar
} from 'lucide-react';

const AdminInventory = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingOutfitId, setEditingOutfitId] = useState(null);

  // Schedule View States
  const [viewingScheduleOutfit, setViewingScheduleOutfit] = useState(null);
  const [outfitBookings, setOutfitBookings] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Bridal Lehenga',
    size: 'M',
    color: '',
    rentalPrice: '',
    securityDeposit: '',
    images: '/images/lehenga_crimson.png', // Default seeded image
    status: 'Available'
  });

  const [customImageMode, setCustomImageMode] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Default images presets
  const imagePresets = [
    { name: 'Bridal Crimson Red', value: '/images/lehenga_crimson.png' },
    { name: 'Velvet Emerald Green', value: '/images/lehenga_emerald.png' },
    { name: 'Blush Pink Organza', value: '/images/lehenga_pink.png' },
    { name: 'Royal Blue Georgette', value: '/images/lehenga_blue.png' }
  ];

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/outfits`);
      setOutfits(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching inventory', err);
      setError('Failed to fetch outfit list. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  const handleViewSchedule = async (outfit) => {
    try {
      setViewingScheduleOutfit(outfit);
      setLoadingSchedule(true);
      const res = await axios.get(`${API_BASE_URL}/api/bookings`);
      const filtered = res.data.filter(b => b.outfitId === outfit.id);
      setOutfitBookings(filtered);
    } catch (err) {
      console.error('Error fetching bookings schedule', err);
      alert('Failed to load bookings schedule.');
    } finally {
      setLoadingSchedule(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      description: '',
      category: 'Bridal Lehenga',
      size: 'M',
      color: '',
      rentalPrice: '',
      securityDeposit: '',
      images: '/images/lehenga_crimson.png',
      status: 'Available'
    });
    setCustomImageMode(false);
    setCustomImageUrl('');
    setEditingOutfitId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (outfit) => {
    setModalMode('edit');
    setFormData({
      name: outfit.name,
      description: outfit.description || '',
      category: outfit.category,
      size: outfit.size,
      color: outfit.color,
      rentalPrice: outfit.rentalPrice,
      securityDeposit: outfit.securityDeposit,
      images: outfit.images,
      status: outfit.status
    });
    setEditingOutfitId(outfit.id);
    
    // Check if image is custom
    const isPreset = imagePresets.some(preset => preset.value === outfit.images);
    if (!isPreset && outfit.images) {
      setCustomImageMode(true);
      setCustomImageUrl(outfit.images);
    } else {
      setCustomImageMode(false);
      setCustomImageUrl('');
    }
    
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const finalImageUrl = customImageMode ? customImageUrl : formData.images;
    if (!finalImageUrl) {
      alert('Please specify an image for the lehenga.');
      return;
    }

    const payload = {
      ...formData,
      rentalPrice: parseFloat(formData.rentalPrice),
      securityDeposit: parseFloat(formData.securityDeposit),
      images: finalImageUrl
    };

    try {
      if (modalMode === 'add') {
        const res = await axios.post(`${API_BASE_URL}/api/outfits`, payload);
        setOutfits(prev => [...prev, res.data]);
      } else {
        const res = await axios.put(`${API_BASE_URL}/api/outfits/${editingOutfitId}`, payload);
        setOutfits(prev => prev.map(o => o.id === editingOutfitId ? res.data : o));
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving outfit', err);
      alert('Error saving outfit details. Please verify your inputs.');
    }
  };

  const handleRetireOutfit = async (id) => {
    if (!confirm('Are you sure you want to retire this outfit? Retiring will hide it from the customer catalog, but preserve booking history.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/outfits/${id}`);
      // Remove retired item from client view list
      setOutfits(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error retiring outfit', err);
      alert('Failed to retire outfit. Please try again.');
    }
  };

  // Get status color label
  const getStatusLabelStyle = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500 text-white';
      case 'Rented':
        return 'bg-maroon-500 text-white';
      case 'Maintenance':
        return 'bg-amber-500 text-white';
      case 'Retired':
        return 'bg-slate-400 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  // Filter Logic
  const filteredOutfits = outfits.filter(o => {
    const matchesSearch = 
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.color.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesSize = sizeFilter === 'All' || o.size === sizeFilter;
    const matchesCategory = categoryFilter === 'All' || o.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesSize && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-slate-900">Lehenga Inventory</h1>
            <p className="text-slate-500 text-sm mt-1">Register new dresses, upload styles, manage tailorial statuses, and retired items.</p>
          </div>
          
          <button
            onClick={openAddModal}
            className="flex items-center justify-center space-x-2 text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW LEHENGA</span>
          </button>
        </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <p className="text-sm text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by name, description, or color..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all duration-200"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
          </div>

          {/* Size Filter */}
          <div>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-xl px-4 py-3 focus:outline-none transition-all duration-200"
            >
              <option value="All">Sizes (All)</option>
              <option value="S">Small (S)</option>
              <option value="M">Medium (M)</option>
              <option value="L">Large (L)</option>
              <option value="XL">Extra Large (XL)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-xl px-4 py-3 focus:outline-none transition-all duration-200"
            >
              <option value="All">Statuses (All)</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Category quick selectors */}
        <div className="flex gap-2 pt-2 border-t border-cream-100 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center mr-2">
            <Sliders className="w-3.5 h-3.5 text-gold-500 mr-1.5" />
            Category:
          </span>
          {['All', 'Bridal Lehenga', 'Side Lehenga', 'Engagement Lehenga', 'Sangeet Lehenga', 'Party Wear Lehenga', 'Bridal Gown', 'Evening Gown'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                categoryFilter === cat 
                  ? 'bg-maroon-500 text-white border-maroon-600 shadow-sm'
                  : 'bg-white text-slate-500 border-cream-200 hover:bg-cream-50'
              }`}
            >
              {cat === 'All' ? 'All Collections' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid inventory rendering */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-maroon-500"></div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredOutfits.map((outfit) => (
              <div key={outfit.id} className="bg-white border border-cream-200/50 rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-gold-300/60 transition-all duration-300">
                {/* Photo frame */}
                <div className="aspect-[4/5] bg-cream-50 relative overflow-hidden">
                  <img 
                    src={outfit.images.startsWith('http') ? outfit.images : `${API_BASE_URL}${outfit.images}`} 
                    alt={outfit.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/lehenga_crimson.png'; // Fallback
                    }}
                  />
                  {/* Status Overlay */}
                  <span className={`absolute top-3 right-3 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm ${getStatusLabelStyle(outfit.status)}`}>
                    {outfit.status}
                  </span>
                  
                  {/* Size Label */}
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2 py-1 rounded-lg border border-cream-200 shadow-sm">
                    Size: {outfit.size}
                  </span>
                </div>

                {/* Info block */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest block mb-1">{outfit.category}</span>
                    <h3 className="font-playfair text-base font-bold text-slate-800 line-clamp-1">{outfit.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{outfit.description || 'No description provided.'}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-2">Color: <span className="text-slate-700">{outfit.color}</span></p>
                  </div>

                  <div className="border-t border-cream-100 mt-4 pt-3 flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Rental Price:</span>
                      <span className="font-bold text-slate-700">₹{outfit.rentalPrice}/day</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Refundable Security:</span>
                      <span className="font-bold text-slate-700">₹{outfit.securityDeposit}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2">
                      <button
                        onClick={() => openEditModal(outfit)}
                        className="flex items-center justify-center space-x-1 py-1.5 border border-cream-200 hover:border-gold-400 text-xs font-bold text-slate-600 hover:text-gold-600 bg-white rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleRetireOutfit(outfit.id)}
                        className="flex items-center justify-center space-x-1 py-1.5 border border-red-100 hover:border-red-400 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Retire</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleViewSchedule(outfit)}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 mt-2 bg-cream-50/50 hover:bg-cream-100 border border-cream-200/60 text-xs font-bold text-maroon-500 hover:text-maroon-700 rounded-lg transition-colors shadow-sm"
                    >
                      <Calendar className="w-3.5 h-3.5 text-gold-500" />
                      <span>View Rental Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOutfits.length === 0 && (
            <div className="bg-white border border-cream-200/50 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
              <Shirt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold">No outfits match your filter conditions.</p>
              <p className="text-sm text-slate-400 mt-1">Try resetting filters or registering a new lehenga.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Lehenga Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cream-200/80 flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-cream-100 flex justify-between items-center bg-cream-50/50 sticky top-0 bg-white z-10">
              <h3 className="font-playfair text-xl font-bold text-slate-800">
                {modalMode === 'add' ? 'Register New Lehenga' : 'Edit Lehenga Details'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-cream-100/50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-grow flex flex-col">
              <div className="p-6 space-y-5 flex-grow">
                {/* Lehenga Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lehenga Name</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Royal Ruby Silk Zardozi Lehenga"
                    className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
                  <textarea
                    rows="3"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the fabric, embroidery detail, flare width, and matching elements (dupatta/blouse details)..."
                    className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                  />
                </div>

                {/* Grid Inputs: Category & Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category Collection</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                    >
                      <option value="Bridal Lehenga">Bridal Lehenga</option>
                      <option value="Side Lehenga">Side Lehenga</option>
                      <option value="Engagement Lehenga">Engagement Lehenga</option>
                      <option value="Sangeet Lehenga">Sangeet Lehenga</option>
                      <option value="Party Wear Lehenga">Party Wear Lehenga</option>
                      <option value="Bridal Gown">Bridal Gown</option>
                      <option value="Evening Gown">Evening Gown</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Base Size</label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                    >
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                    </select>
                  </div>
                </div>

                {/* Grid Inputs: Color & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Color Themes</label>
                    <input
                      type="text"
                      required
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="e.g. Ruby Red & Antique Gold"
                      className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Operational Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                    >
                      <option value="Available">Available</option>
                      <option value="Rented">Rented</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Grid Inputs: Rental Price & Security Deposit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rental Price (INR / day)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      name="rentalPrice"
                      value={formData.rentalPrice}
                      onChange={handleInputChange}
                      placeholder="e.g. 3500"
                      className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Refundable Deposit (INR)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      name="securityDeposit"
                      value={formData.securityDeposit}
                      onChange={handleInputChange}
                      placeholder="e.g. 8000"
                      className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Image upload selection */}
                <div className="space-y-3 pt-2 border-t border-cream-100">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center">
                      <ImageIcon className="w-3.5 h-3.5 text-gold-500 mr-1.5" />
                      Outfit Photo Asset
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomImageMode(!customImageMode)}
                      className="text-xs text-maroon-500 hover:text-maroon-700 font-bold"
                    >
                      {customImageMode ? 'Select from Presets' : 'Enter Custom Image URL'}
                    </button>
                  </div>

                  {customImageMode ? (
                    <input
                      type="text"
                      required
                      placeholder="https://example.com/images/my-lehenga.jpg"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="w-full text-sm bg-cream-50/30 border border-cream-200/85 focus:border-gold-500 rounded-xl px-4 py-2.5 focus:outline-none transition-colors"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {imagePresets.map(preset => {
                        const isSelected = formData.images === preset.value;
                        return (
                          <button
                            type="button"
                            key={preset.value}
                            onClick={() => setFormData(prev => ({ ...prev, images: preset.value }))}
                            className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-colors truncate ${
                              isSelected 
                                ? 'border-maroon-500 text-maroon-600 bg-maroon-50/30 font-semibold' 
                                : 'border-cream-200 text-slate-500 hover:bg-cream-50'
                            }`}
                          >
                            {preset.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-cream-50/40 p-2.5 rounded-lg border border-cream-150/40">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p>Presets map to high-resolution pre-seeded images stored in local web storage. Custom URLs must support CORS.</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-cream-50/30 border-t border-cream-100 flex justify-end space-x-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-cream-200 rounded-xl transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 rounded-xl shadow-sm transition-all"
                >
                  {modalMode === 'add' ? 'SAVE LEHENGA' : 'UPDATE LEHENGA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Schedule Modal */}
      {viewingScheduleOutfit && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-cream-200/80 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-cream-100 flex justify-between items-center bg-cream-50/50 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-playfair text-lg font-bold text-slate-800">Rental Schedule</h3>
                <p className="text-xs text-slate-400 mt-1">{viewingScheduleOutfit.name}</p>
              </div>
              <button
                onClick={() => setViewingScheduleOutfit(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-cream-100/50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow bg-white">
              {loadingSchedule ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-500"></div>
                </div>
              ) : outfitBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold">No rental bookings scheduled for this lehenga yet.</p>
                  <p className="text-xs text-slate-400 mt-1">When customers book this product, the dates and prices will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outfitBookings.map((b) => (
                    <div key={b.id} className="border border-cream-200/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gold-300 transition-colors bg-white shadow-sm">
                      <div>
                        <div className="font-semibold text-slate-700">{b.user?.name || `Customer #${b.userId}`}</div>
                        <div className="text-xs text-slate-400 font-medium mt-1">Dates: <strong className="text-slate-600">{b.startDate} to {b.endDate}</strong></div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">Status: <span className="font-semibold text-maroon-600">{b.status}</span></div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-slate-800">Rent Collected: ₹{b.totalAmount - b.securityDeposit}</div>
                        <div className="text-[10px] text-slate-450 font-semibold mt-1">Paid via {b.paymentMethod || 'Online'} ({b.paymentStatus})</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-cream-50/30 border-t border-cream-100 flex justify-end sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setViewingScheduleOutfit(null)}
                className="px-5 py-2 text-xs font-bold text-slate-600 bg-white border border-cream-200 rounded-xl hover:bg-cream-50 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminInventory;
