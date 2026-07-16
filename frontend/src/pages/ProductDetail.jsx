import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ruler, Info, ShieldCheck, ShoppingCart, HelpCircle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Custom Sizes (Alterations)
  const [bustSize, setBustSize] = useState('');
  const [waistSize, setWaistSize] = useState('');
  const [hipsSize, setHipsSize] = useState('');
  const [lengthSize, setLengthSize] = useState('');
  const [height, setHeight] = useState('');

  // Error validations
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/outfits/${id}`)
      .then(res => {
        setOutfit(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching outfit details', err);
        setError('Outfit not found or server error');
        setLoading(false);
      });
  }, [id]);

  // Set default dates (tomorrow and 3 days later)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const threeDaysLater = new Date(tomorrow);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    setStartDate(tomorrow.toISOString().split('T')[0]);
    setEndDate(threeDaysLater.toISOString().split('T')[0]);
  }, []);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!startDate || !endDate) {
      setValidationError('Please select both rental start and end dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (start >= end) {
      setValidationError('End date must be after the start date.');
      return;
    }

    if (diffDays < 3) {
      setValidationError('Minimum rental period is 3 days.');
      return;
    }

    if (!bustSize || !waistSize || !hipsSize || !lengthSize || !height) {
      setValidationError('Tailoring measurements are mandatory for custom fits.');
      return;
    }

    const bookingPayload = {
      outfitId: outfit.id,
      outfitName: outfit.name,
      images: outfit.images,
      rentalPrice: outfit.rentalPrice,
      securityDeposit: outfit.securityDeposit,
      startDate,
      endDate,
      bustSize: parseFloat(bustSize),
      waistSize: parseFloat(waistSize),
      hipsSize: parseFloat(hipsSize),
      lengthSize: parseFloat(lengthSize),
      height: parseFloat(height),
      totalAmount: outfit.rentalPrice + outfit.securityDeposit
    };

    if (!isAuthenticated) {
      // Store temporary booking specs in localStorage and redirect to login
      localStorage.setItem('temp_booking', JSON.stringify(bookingPayload));
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout', { state: { booking: bookingPayload } });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-500 mx-auto"></div>
        <p className="text-slate-500 text-sm mt-4">Loading royal details...</p>
      </div>
    );
  }

  if (error || !outfit) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-rose-600 font-semibold">{error || 'Something went wrong'}</p>
        <button onClick={() => navigate('/catalog')} className="mt-4 text-xs bg-slate-900 text-white px-4 py-2 rounded-lg">
          Back to Catalog
        </button>
      </div>
    );
  }

  const imageUrl = outfit.images?.startsWith('http') || outfit.images?.startsWith('/')
    ? outfit.images
    : `${API_BASE_URL}${outfit.images}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Product Image */}
        <div className="space-y-4">
          <div className="aspect-[3/4] overflow-hidden bg-cream-50 rounded-2xl border border-cream-200/50 shadow-md">
            <img
              src={imageUrl}
              alt={outfit.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>
          <div className="bg-cream-50 border border-cream-200/40 rounded-xl p-4 flex items-center space-x-3 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Every Lehenga undergoes a strict 5-stage dry cleaning and sanitization process prior to shipping. We guarantee freshness.</span>
          </div>
        </div>

        {/* Right Column: Title, Specs, Forms */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{outfit.category}</span>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-slate-900 mt-1">{outfit.name}</h1>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">{outfit.description}</p>
          </div>

          {/* Details list */}
          <div className="grid grid-cols-2 gap-4 border-y border-cream-100 py-4">
            <div className="text-sm">
              <span className="text-slate-400">Base Size:</span> <strong className="text-slate-700">{outfit.size} (Altered to fit)</strong>
            </div>
            <div className="text-sm">
              <span className="text-slate-400">Color:</span> <strong className="text-slate-700">{outfit.color}</strong>
            </div>
          </div>

          {/* Pricing Panel */}
          <div className="bg-cream-100/50 border border-cream-200/60 rounded-xl p-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">3-Day Rental Cost</p>
              <p className="text-3xl font-extrabold text-maroon-600 mt-1">₹{outfit.rentalPrice.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400 mt-1">*Includes standard dry-cleaning</p>
            </div>
            <div className="border-l border-cream-200/80 pl-6">
              <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Refundable Deposit</p>
              <p className="text-xl font-bold text-slate-700 mt-2">₹{outfit.securityDeposit.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400 mt-1">*100% refunded on damage-free return</p>
            </div>
          </div>

          {/* Booking & Alteration Form */}
          <form onSubmit={handleBookingSubmit} className="space-y-6">
            
            {/* 1. Date Picker */}
            <div className="space-y-3">
              <h3 className="font-playfair text-lg font-bold text-slate-800 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gold-500" />
                <span>Select Booking Dates</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Pick-up Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // from tomorrow
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Return Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">Lehenga will be dispatched 1 day before start date. Fits are done prior to delivery.</p>
            </div>

            {/* 2. Alteration Sizes */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="font-playfair text-lg font-bold text-slate-800 flex items-center space-x-2">
                  <Ruler className="w-4 h-4 text-gold-500" />
                  <span>Custom Fit Measurements</span>
                </h3>
                <div className="group relative">
                  <HelpCircle className="w-4 h-4 text-slate-400 hover:text-gold-500 cursor-pointer" />
                  <div className="absolute right-0 bottom-6 hidden group-hover:block bg-slate-900 text-white text-[10px] p-3 rounded-lg w-56 z-20 space-y-1 shadow-md leading-relaxed">
                    <p><strong>Bust:</strong> Fullest part of chest (inches)</p>
                    <p><strong>Waist:</strong> Slimmest part of mid-section (inches)</p>
                    <p><strong>Hips:</strong> Fullest part of hips (inches)</p>
                    <p><strong>Length:</strong> Waist line to floor with heels on (inches)</p>
                    <p><strong>Height:</strong> Your overall height in feet (e.g. 5.4)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 block">Bust (Inches)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="34"
                    value={bustSize}
                    onChange={(e) => setBustSize(e.target.value)}
                    className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white text-center focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 block">Waist (Inches)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="28"
                    value={waistSize}
                    onChange={(e) => setWaistSize(e.target.value)}
                    className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white text-center focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 block">Hips (Inches)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="38"
                    value={hipsSize}
                    onChange={(e) => setHipsSize(e.target.value)}
                    className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white text-center focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 block">Length (Inches)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="40"
                    value={lengthSize}
                    onChange={(e) => setLengthSize(e.target.value)}
                    className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white text-center focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-semibold text-slate-500 block">Height (Feet)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5.4"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white text-center focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* Error notifications */}
            {validationError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
                {validationError}
              </div>
            )}

            {/* Submit Action */}
            {outfit.status === 'Available' ? (
              <button
                type="submit"
                className="w-full py-4 text-sm font-bold tracking-wider text-white bg-maroon-500 hover:bg-maroon-600 rounded-xl transition-all duration-300 shadow-md shadow-maroon-500/10 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isAuthenticated ? 'PROCEED TO BOOKING' : 'LOGIN TO BOOK NOW'}</span>
              </button>
            ) : (
              <div className="w-full text-center py-4 bg-slate-100 text-slate-500 font-semibold rounded-xl text-sm border border-slate-200">
                OUTFIT CURRENTLY RENTED / UNAVAILABLE
              </div>
            )}
          </form>

        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
