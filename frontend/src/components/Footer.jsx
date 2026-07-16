import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  // Hide footer on admin pages to prevent layout clashing with fixed elements
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#FFE0E6] text-black border-t-2 border-pink-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="font-playfair text-2xl font-bold tracking-wider text-pink-600">
              KR <span className="text-black">RENTAL OUTFITS</span>
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">
              Designer Bridal & Side Lehengas on Rent. We also offer premium Jewellery, Gowns, and Party Wear to complete your perfect look in Jabalpur.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair text-lg font-bold text-black mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li><Link to="/" className="hover:text-pink-600 transition-colors font-medium">Home</Link></li>
              <li><Link to="/catalog" className="hover:text-pink-600 transition-colors font-medium">All Collections</Link></li>
              <li><Link to="/catalog?category=Bridal%20Lehenga" className="hover:text-pink-600 transition-colors font-medium">Bridal Lehenga</Link></li>
              <li><Link to="/catalog?category=Side%20Lehenga" className="hover:text-pink-600 transition-colors font-medium">Side Lehenga</Link></li>
              <li><Link to="/catalog?category=Engagement%20Lehenga" className="hover:text-pink-600 transition-colors font-medium">Engagement Lehenga</Link></li>
              <li><Link to="/catalog?category=Sangeet%20Lehenga" className="hover:text-pink-600 transition-colors font-medium">Sangeet Specials</Link></li>
              <li><Link to="/catalog?category=Bridal%20Gown" className="hover:text-pink-600 transition-colors font-medium">Bridal Gown</Link></li>
              <li><Link to="/catalog?category=Evening%20Gown" className="hover:text-pink-600 transition-colors font-medium">Evening Gown</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-playfair text-lg font-bold text-black mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <span>Jabalpur, Madhya Pradesh - 482001</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-pink-500 shrink-0" />
                <span>+91 91831 70731</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-pink-500 shrink-0" />
                <span>contact@krrentaloutfits.com</span>
              </li>
            </ul>
          </div>

          {/* Timing details */}
          <div>
            <h4 className="font-playfair text-lg font-bold text-black mb-4">Boutique Hours</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-pink-500 shrink-0" />
                <span>Mon - Sat: 11:00 AM - 8:00 PM</span>
              </li>
              <li className="text-xs text-pink-500 italic pl-6">
                *Closed on Sundays
              </li>
              <li className="text-xs text-slate-500 pl-6 mt-2">
                Bookings available 24/7 online. For physical trials, please schedule an appointment.
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-pink-300 mt-12 pt-6 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} KR Rental Outfits Jabalpur. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
