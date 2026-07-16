import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import ProductCard from '../components/ProductCard';
import { Sparkles, Ruler, ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/outfits`)
      .then(res => {
        // Show top 3 outfits as featured
        setFeatured(res.data.slice(0, 3));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching featured outfits', err);
        setLoading(false);
      });
  }, []);

  return (
    <div 
      className="text-black min-h-screen relative overflow-hidden -mt-16 pt-16 space-y-24 pb-20 bg-[#FFF0F2]"
      style={{
        backgroundImage: "url('/images/hero_model.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Light pink glass overlay — keeps text legible while model image glows through */}
      <div className="absolute inset-0 bg-[#FFF0F2]/60 pointer-events-none z-0" />
      
      {/* Ambient background glows - Pink & Gold theme */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-pink-300/30 blur-[130px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-gold-500/10 blur-[110px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full bg-rose-400/20 blur-[90px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center px-4 bg-transparent overflow-hidden z-10">
        {/* Abstract decorative grid */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#f43f5e_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e_1px,transparent_1px)] bg-[size:4rem_4rem] z-0" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center">
            <span className="flex items-center space-x-2 border border-pink-300/40 bg-pink-200/30 text-pink-700 text-xs font-bold tracking-widest px-4 py-1.5 rounded-full uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Lehenga & Bridal Rental Boutique - Jabalpur</span>
            </span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-6xl md:text-7xl font-bold tracking-wide text-black leading-tight">
            Adorn Yourself in <br />
            <span className="font-italic text-pink-650">Royalty</span>
          </h1>

          <p className="text-slate-900 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Rent luxury designer Lehengas, bridal wear, and wedding outfits online. Custom tailor alterations included with every booking.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              to="/catalog"
              className="bg-black hover:bg-slate-900 text-white font-bold text-sm tracking-wider px-8 py-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-md shadow-slate-950/20"
            >
              <span>BROWSE LEHENGAS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="border border-black/10 hover:border-black/25 text-black hover:bg-black/5 font-semibold text-sm tracking-wider px-8 py-4 rounded-lg flex items-center justify-center transition-all duration-300"
            >
              HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20 z-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-black">How It Works</h2>
          <div className="h-0.5 w-16 bg-pink-500 mx-auto"></div>
          <p className="text-slate-800 text-sm">Rent your dream attire in 4 simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
          {/* Step 1 */}
          <div className="text-center p-6 bg-white/40 backdrop-blur-md border border-pink-200/40 rounded-2xl shadow-sm hover:border-pink-300 hover:bg-white/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-700 flex items-center justify-center mx-auto mb-4 font-bold font-playfair shadow-sm">1</div>
            <h3 className="font-playfair text-lg font-bold text-black mb-2">Select Attire</h3>
            <p className="text-xs text-slate-800 leading-relaxed">Browse our curated designer catalog and choose the outfit that steals your heart.</p>
          </div>

          {/* Step 2 */}
          <div className="text-center p-6 bg-white/40 backdrop-blur-md border border-pink-200/40 rounded-2xl shadow-sm hover:border-pink-300 hover:bg-white/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-700 flex items-center justify-center mx-auto mb-4 font-bold shadow-sm"><Ruler className="w-5 h-5" /></div>
            <h3 className="font-playfair text-lg font-bold text-black mb-2">Send Measurements</h3>
            <p className="text-xs text-slate-800 leading-relaxed">Provide your waist, bust, hips, length, and height. Our expert tailors will alter it to fit you perfectly.</p>
          </div>

          {/* Step 3 */}
          <div className="text-center p-6 bg-white/40 backdrop-blur-md border border-pink-200/40 rounded-2xl shadow-sm hover:border-pink-300 hover:bg-white/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-700 flex items-center justify-center mx-auto mb-4 font-bold shadow-sm"><ShieldCheck className="w-5 h-5" /></div>
            <h3 className="font-playfair text-lg font-bold text-black mb-2">Wear & Shine</h3>
            <p className="text-xs text-slate-800 leading-relaxed">Receive a dry-cleaned, sanitized, and customized outfit delivered right to your door before your event.</p>
          </div>

          {/* Step 4 */}
          <div className="text-center p-6 bg-white/40 backdrop-blur-md border border-pink-200/40 rounded-2xl shadow-sm hover:border-pink-300 hover:bg-white/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-700 flex items-center justify-center mx-auto mb-4 font-bold shadow-sm"><RefreshCw className="w-5 h-5" /></div>
            <h3 className="font-playfair text-lg font-bold text-black mb-2">Easy Return</h3>
            <p className="text-xs text-slate-800 leading-relaxed">Pack the outfit in the provided return box. We pick it up for free, and refund your security deposit instantly.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-black">Featured Creations</h2>
          <div className="h-0.5 w-16 bg-pink-500 mx-auto"></div>
          <p className="text-slate-800 text-sm">Explore our most rented luxurious masterpieces.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white/40 border border-pink-200/30 rounded-2xl h-[450px]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map(outfit => (
              <ProductCard key={outfit.id} outfit={outfit} isGlass={true} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 text-sm font-bold tracking-wider text-black bg-pink-200 hover:bg-pink-300 px-6 py-3 rounded-xl transition-all duration-300 border border-pink-300/40 shadow-sm"
          >
            <span>VIEW ENTIRE CATALOG</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
