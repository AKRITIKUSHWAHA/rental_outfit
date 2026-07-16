import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Shirt, 
  Users, 
  ArrowLeft,
  Menu,
  X,
  Shield,
  MessageSquare
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: ShoppingBag },
    { name: 'Inventory', path: '/admin/inventory', icon: Shirt },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'WhatsApp API', path: '/admin/whatsapp', icon: MessageSquare },
  ];
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-cream-100/50">
      
      {/* Floating Toggle Button for Mobile Screens */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3.5 bg-maroon-500 text-white rounded-full shadow-lg hover:bg-maroon-600 active:scale-95 transition-all duration-200"
        >
          {isMobileOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>
      </div>
      
      {/* Admin Sidebar Navigation Panel */}
      <aside id="admin-sidebar" className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between transition-transform duration-300 ease-out md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="px-4 py-6">
          {/* Header */}
          <div className="flex items-center space-x-2 px-3 pb-6 border-b border-slate-800 mb-6">
            <Shield className="w-5 h-5 text-gold-500" />
            <span className="font-playfair font-bold text-sm text-white tracking-widest uppercase">
              Admin Console
            </span>
          </div>
          
          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                    active
                      ? 'bg-maroon-500 text-white shadow-md shadow-maroon-500/10'
                      : 'text-white hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-white'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-white hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>
      
      {/* Background overlay on Mobile when Sidebar is toggled open */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/40 z-30 md:hidden transition-opacity duration-300"
        />
      )}
      
      {/* Content pane right-aligned next to Sidebar */}
      <div className="flex-1 md:pl-64 min-w-0 flex flex-col">
        <div className="flex-grow">
          {children}
        </div>
      </div>
      
    </div>
  );
};

export default AdminLayout;
