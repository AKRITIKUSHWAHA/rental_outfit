import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => 
    `text-sm font-semibold tracking-wide transition-colors duration-200 ${
      isActive(path) 
        ? 'text-pink-600 border-b-2 border-pink-500 pb-1' 
        : 'text-black hover:text-pink-600 pb-1'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-playfair text-2xl font-bold tracking-wider text-pink-600">
                KR <span className="text-black">RENTAL OUTFITS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={navLinkClass('/')}>HOME</Link>
            <Link to="/catalog" className={navLinkClass('/catalog')}>LEHENGAS</Link>
            
            {isAuthenticated && !isAdmin && (
              <Link to="/my-bookings" className={navLinkClass('/my-bookings')}>MY BOOKINGS</Link>
            )}

            {isAdmin && (
              <Link to="/admin/dashboard" className="flex items-center space-x-1 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors">
                <Shield className="w-4 h-4" />
                <span>ADMIN PANEL</span>
              </Link>
            )}
          </div>

          {/* Profile/Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 border-l border-pink-200/60 pl-4">
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Namaste,</p>
                  <p className="text-sm font-bold text-black">{user?.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-xs font-bold text-pink-600 hover:text-white bg-pink-100 hover:bg-pink-500 px-3 h-9 rounded-lg transition-all duration-200 border border-pink-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOGOUT</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-black hover:text-pink-600 px-3 py-2 transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold tracking-wider text-white bg-pink-500 hover:bg-pink-600 px-4 h-9 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm shadow-pink-500/30"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:text-pink-600 p-2 rounded-md focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#FFF0F2]/95 backdrop-blur-sm border-b border-pink-200/60 transition-all duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-black hover:bg-pink-100 hover:text-pink-600"
            >
              Home
            </Link>
            <Link
              to="/catalog"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-black hover:bg-pink-100 hover:text-pink-600"
            >
              Lehengas
            </Link>
            {isAuthenticated && !isAdmin && (
              <Link
                to="/my-bookings"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-black hover:bg-pink-100 hover:text-pink-600"
              >
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-pink-600 hover:bg-pink-100"
              >
                Admin Panel
              </Link>
            )}

            <div className="border-t border-pink-200/60 my-2 pt-2">
              {isAuthenticated ? (
                <div className="px-3 py-2">
                  <p className="text-xs text-slate-500">Namaste,</p>
                  <p className="text-sm font-bold text-black mb-2">{user?.name}</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center space-x-2 text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-sm font-semibold text-black border border-pink-300 py-2 rounded-lg hover:bg-pink-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-sm font-semibold text-white bg-pink-500 py-2 rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
