import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Phone, AlertCircle } from 'lucide-react';

const Register = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
        phone,
      });
      login(res.data.token, res.data.user);
      
      // Handle temporary booking redirect if relevant
      const tempBooking = localStorage.getItem('temp_booking');
      if (tempBooking && redirect === 'checkout') {
        const parsed = JSON.parse(tempBooking);
        localStorage.removeItem('temp_booking');
        navigate('/checkout', { state: { booking: parsed }, replace: true });
      } else {
        navigate(redirect, { replace: true });
      }
    } catch (err) {
      console.error('Registration error', err);
      setError(err.response?.data?.message || 'Error registering account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-cream-200/50 p-8 rounded-xl luxury-shadow max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-playfair text-3xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500 text-xs mt-1">Join KR Rental Outfits to find and rent your perfect Lehenga.</p>
          <div className="h-0.5 w-16 gold-gradient-bg mx-auto mt-3"></div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2.5 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Aisha Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none transition-all duration-200"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="aisha@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none transition-all duration-200"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none transition-all duration-200"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none transition-all duration-200"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 text-sm font-bold tracking-wider text-white bg-maroon-500 hover:bg-maroon-600 rounded-lg transition-all duration-300 shadow-md shadow-maroon-500/10 flex items-center justify-center space-x-2"
          >
            {submitting ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div className="border-t border-cream-100 pt-4 text-center text-xs text-slate-500">
          <p>Already have an account? <Link to="/login" className="text-maroon-500 hover:underline font-bold">Log in Here</Link></p>
        </div>

      </div>
    </div>
  );
};

export default Register;
