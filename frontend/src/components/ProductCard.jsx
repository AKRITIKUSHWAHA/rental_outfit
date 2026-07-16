import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import API_BASE_URL from '../config/api';

const ProductCard = ({ outfit, isGlass = false }) => {
  const { id, name, category, size, color, rentalPrice, securityDeposit, images, status } = outfit;

  // Base URL of backend is localhost:5000, but public folder images are relative to frontend origin
  const imageUrl = images?.startsWith('http') || images?.startsWith('/')
    ? images
    : `${API_BASE_URL}${images}`;

  return (
    <div className={`${isGlass ? 'bg-white/40 backdrop-blur-md border border-pink-200/40 rounded-2xl shadow-sm hover:border-pink-300 hover:bg-white/60' : 'luxury-card'} overflow-hidden group transition-all duration-300`}>
      {/* Image Container */}
      <div className={`relative aspect-[3/4] overflow-hidden ${isGlass ? 'bg-pink-50/20' : 'bg-cream-50'}`}>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // fallback image if copy failed
            e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80';
          }}
        />
        
        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] tracking-widest font-semibold px-2.5 py-1 rounded-full uppercase">
          {category}
        </span>

        {/* Availability Badge */}
        <span className={`absolute top-3 right-3 text-[10px] tracking-wider font-bold px-2.5 py-1 rounded-full uppercase ${
          status === 'Available' 
            ? 'bg-emerald-100 text-emerald-800' 
            : status === 'Rented' 
            ? 'bg-amber-100 text-amber-800' 
            : 'bg-rose-100 text-rose-800'
        }`}>
          {status}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className={`font-playfair text-lg font-bold truncate transition-colors ${
          isGlass ? 'text-black group-hover:text-pink-650' : 'text-slate-800 group-hover:text-maroon-600'
        }`}>
          {name}
        </h3>
        
        {/* Specs */}
        <div className="flex gap-2 mt-2">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
            isGlass ? 'text-slate-900 bg-pink-100/50' : 'text-slate-500 bg-cream-200/50'
          }`}>
            Size: <strong className={isGlass ? 'text-black' : 'text-slate-700'}>{size}</strong>
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
            isGlass ? 'text-slate-900 bg-pink-100/50' : 'text-slate-500 bg-cream-200/50'
          }`}>
            Color: <strong className={isGlass ? 'text-black' : 'text-slate-700'}>{color}</strong>
          </span>
        </div>

        {/* Pricing */}
        <div className={`flex justify-between items-baseline mt-4 border-t pt-3 ${
          isGlass ? 'border-pink-100/50' : 'border-cream-100'
        }`}>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider">RENTAL (3 DAYS)</p>
            <p className={`text-lg font-extrabold ${isGlass ? 'text-pink-650' : 'text-maroon-600'}`}>₹{rentalPrice.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider">DEPOSIT (REFUNDABLE)</p>
            <p className={`text-sm font-semibold ${isGlass ? 'text-slate-800' : 'text-slate-700'}`}>₹{securityDeposit.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/outfit/${id}`}
          className={`mt-4 w-full flex items-center justify-center space-x-2 text-xs font-bold tracking-wider py-3 rounded-lg transition-all duration-300 shadow-sm ${
            isGlass 
              ? 'text-white bg-black hover:bg-slate-950 shadow-slate-950/10' 
              : 'text-white bg-slate-900 hover:bg-maroon-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>RENT NOW</span>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
