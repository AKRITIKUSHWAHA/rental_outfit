import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AdminLayout from '../components/AdminLayout';
import { 
  TrendingUp, 
  ShoppingBag, 
  Shirt, 
  Wrench, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users
} from 'lucide-react';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayNum, setSelectedDayNum] = useState(new Date().getDate());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, outfitsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/bookings`),
          axios.get(`${API_BASE_URL}/api/outfits`)
        ]);
        setBookings(bookingsRes.data);
        setOutfits(outfitsRes.data);
        setError('');
      } catch (err) {
        console.error('Error fetching dashboard data', err);
        setError('Failed to load dashboard data. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate Stats
  const totalRevenue = bookings
    .filter(b => b.status !== 'Cancelled' && b.status !== 'Refunded')
    .reduce((sum, b) => {
      // revenue is totalAmount minus securityDeposit
      const rentalCost = b.totalAmount - b.securityDeposit;
      return sum + (rentalCost > 0 ? rentalCost : 0);
    }, 0);

  const onlineRevenue = bookings
    .filter(b => b.status !== 'Cancelled' && b.status !== 'Refunded' && b.paymentMethod === 'Online')
    .reduce((sum, b) => {
      const rentalCost = b.totalAmount - b.securityDeposit;
      return sum + (rentalCost > 0 ? rentalCost : 0);
    }, 0);

  const cashRevenue = bookings
    .filter(b => b.status !== 'Cancelled' && b.status !== 'Refunded' && b.paymentMethod === 'Cash')
    .reduce((sum, b) => {
      const rentalCost = b.totalAmount - b.securityDeposit;
      return sum + (rentalCost > 0 ? rentalCost : 0);
    }, 0);

  const activeBookings = bookings.filter(b => 
    ['Pending', 'Approved', 'Alteration', 'Dispatched', 'Delivered'].includes(b.status)
  );

  const maintenanceOutfits = outfits.filter(o => o.status === 'Maintenance');
  const totalOutfits = outfits.filter(o => o.status !== 'Retired');

  // Booking Status counts
  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  // Category counts
  const categoryCounts = outfits.reduce((acc, o) => {
    acc[o.category] = (acc[o.category] || 0) + 1;
    return acc;
  }, {});

  // Size counts
  const sizeCounts = outfits.reduce((acc, o) => {
    acc[o.size] = (acc[o.size] || 0) + 1;
    return acc;
  }, {});

  // Calendar Math
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const emptySlots = Array(firstDayIndex).fill(null);
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarSlots = [...emptySlots, ...dayNumbers];

  const getDayDateString = (dayNum) => {
    if (!dayNum) return '';
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getBookingsForDay = (dayNum) => {
    if (!dayNum) return [];
    const dateStr = getDayDateString(dayNum);
    return bookings.filter(b => 
      b.status !== 'Cancelled' && 
      b.status !== 'Refunded' &&
      b.startDate <= dateStr && 
      b.endDate >= dateStr
    );
  };

  const nextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
    setSelectedDayNum(1);
  };

  const prevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
    setSelectedDayNum(1);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-slate-900">Admin Control Center</h1>
            <p className="text-slate-500 text-sm mt-1">Manage operations, bookings, and inventory for KR Rental Outfits.</p>
          </div>
        </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <p className="text-sm text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.03] rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 font-sans">
                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </h3>
              <div className="text-[10px] text-slate-500 font-semibold mt-1.5 flex gap-2">
                <span className="text-emerald-600">Online: ₹{onlineRevenue.toLocaleString('en-IN')}</span>
                <span className="text-slate-350">|</span>
                <span className="text-blue-650">Cash: ₹{cashRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.03] rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Bookings</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 font-sans">{activeBookings.length}</h3>
              <span className="text-xs text-maroon-500 font-semibold mt-1 inline-flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Awaiting fulfillment</span>
              </span>
            </div>
            <div className="p-3 bg-maroon-50 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-maroon-500" />
            </div>
          </div>
        </div>

        {/* Total Outfits */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.03] rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outfits</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 font-sans">{totalOutfits.length}</h3>
              <span className="text-xs text-gold-600 font-semibold mt-1 inline-flex items-center space-x-1">
                <Shirt className="w-3.5 h-3.5" />
                <span>Active pieces in catalog</span>
              </span>
            </div>
            <div className="p-3 bg-gold-50 rounded-xl">
              <Shirt className="w-6 h-6 text-gold-500" />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.03] rounded-full translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Maintenance</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2 font-sans">{maintenanceOutfits.length}</h3>
              <span className="text-xs text-blue-600 font-semibold mt-1 inline-flex items-center space-x-1">
                <Wrench className="w-3.5 h-3.5" />
                <span>Dry cleaning & alterations</span>
              </span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Wrench className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Booking Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Calendar Widget (Col-span-2) */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-playfair text-lg font-bold text-slate-800">Rental Bookings Calendar</h3>
              <p className="text-xs text-slate-400 mt-0.5">Click a date to view scheduled dispatches or returns</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevMonth} 
                className="p-2 border border-cream-200 hover:border-gold-500 hover:bg-cream-50/50 rounded-lg text-slate-600 transition-colors"
              >
                &larr;
              </button>
              <span className="text-sm font-bold text-slate-700 min-w-[100px] text-center font-playfair uppercase tracking-wider">
                {monthNames[month]} {year}
              </span>
              <button 
                onClick={nextMonth} 
                className="p-2 border border-cream-200 hover:border-gold-500 hover:bg-cream-50/50 rounded-lg text-slate-600 transition-colors"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Weekdays Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {calendarSlots.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square bg-cream-50/10 rounded-xl"></div>;
              }

              const isSelected = day === selectedDayNum;
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              const dayBookings = getBookingsForDay(day);
              const hasBookings = dayBookings.length > 0;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDayNum(day)}
                  className={`aspect-square rounded-xl p-1 flex flex-col justify-between items-center transition-all duration-200 relative border ${
                    isSelected 
                      ? 'border-maroon-500 bg-maroon-50/20 text-maroon-850 font-bold scale-[1.03] shadow-sm'
                      : isToday
                        ? 'border-gold-400 bg-gold-50/40 text-gold-700 font-semibold'
                        : 'border-cream-100 hover:border-gold-300 hover:bg-cream-50/30 text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xs">{day}</span>
                  {hasBookings && (
                    <div className="flex gap-1 justify-center w-full mb-1">
                      {dayBookings.slice(0, 3).map((b, i) => {
                        let dotColor = 'bg-slate-400';
                        const dateStr = getDayDateString(day);
                        if (b.startDate === dateStr) dotColor = 'bg-emerald-500'; // Dispatch date start
                        else if (b.endDate === dateStr) dotColor = 'bg-maroon-500'; // Return date end
                        else dotColor = 'bg-blue-400'; // In rent
                        
                        return <span key={i} className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>;
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Bookings list (Col-span-1) */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm lg:col-span-1 flex flex-col h-full min-h-[350px]">
          <h3 className="font-playfair text-lg font-bold text-slate-800 mb-2 border-b border-cream-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-maroon-500"></span>
            <span>Schedule details</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            {selectedDayNum ? getDayDateString(selectedDayNum) : 'Select a date'}
          </p>

          <div className="flex-grow overflow-y-auto space-y-3 pr-1">
            {selectedDayNum && getBookingsForDay(selectedDayNum).length > 0 ? (
              getBookingsForDay(selectedDayNum).map((b) => {
                const dateStr = getDayDateString(selectedDayNum);
                const isDispatch = b.startDate === dateStr;
                const isReturn = b.endDate === dateStr;
                
                let highlightText = 'In Rent';
                let highlightBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                if (isDispatch) {
                  highlightText = 'Dispatch Day';
                  highlightBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                } else if (isReturn) {
                  highlightText = 'Return Pick-up';
                  highlightBadgeColor = 'bg-maroon-50 text-maroon-700 border-maroon-200';
                }

                return (
                  <div key={b.id} className="border border-cream-150/60 p-3.5 rounded-xl hover:border-gold-300 transition-colors space-y-2 bg-cream-50/10">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-800 text-sm line-clamp-1">{b.outfit?.name || `Outfit #${b.outfitId}`}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border shrink-0 ${highlightBadgeColor}`}>
                        {highlightText}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      <div>Customer: <strong className="text-slate-700">{b.user?.name || `User #${b.userId}`}</strong></div>
                      <div className="font-mono mt-0.5">Phone: {b.user?.phone || 'N/A'}</div>
                      <div className="mt-1 font-semibold text-slate-650">Rental cost: ₹{b.totalAmount - b.securityDeposit}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 flex flex-col justify-center items-center h-full">
                <p className="text-sm font-semibold">No rental bookings scheduled for this date.</p>
                <p className="text-xs text-slate-400 mt-1">Select a highlighted calendar day to see schedules.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid for charts & distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Booking Status Counts */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="font-playfair text-lg font-bold text-slate-800 mb-4">Booking Status Overview</h3>
            <div className="space-y-3.5">
              {['Pending', 'Approved', 'Alteration', 'Dispatched', 'Delivered', 'Returned', 'Completed', 'Cancelled'].map(status => {
                const count = statusCounts[status] || 0;
                const percentage = bookings.length > 0 ? (count / bookings.length) * 100 : 0;
                let barColor = 'bg-slate-400';
                if (status === 'Pending') barColor = 'bg-amber-400';
                else if (status === 'Approved') barColor = 'bg-emerald-500';
                else if (status === 'Alteration') barColor = 'bg-blue-400';
                else if (status === 'Dispatched') barColor = 'bg-indigo-500';
                else if (status === 'Delivered') barColor = 'bg-teal-500';
                else if (status === 'Returned' || status === 'Completed') barColor = 'bg-maroon-500';
                else if (status === 'Cancelled') barColor = 'bg-red-500';

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{status}</span>
                      <span>{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {bookings.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">No bookings found</p>
              )}
            </div>
          </div>

          <div className="border-t border-cream-100 mt-6 pt-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Revenue By Payment Type</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Online Payments</span>
                <span className="text-base font-bold text-emerald-800 mt-1 block">₹{onlineRevenue.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-emerald-500 mt-0.5 block">{bookings.filter(b => b.paymentMethod === 'Online').length} orders</span>
              </div>
              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Cash Payments</span>
                <span className="text-base font-bold text-blue-800 mt-1 block">₹{cashRevenue.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-blue-500 mt-0.5 block">{bookings.filter(b => b.paymentMethod === 'Cash').length} orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm lg:col-span-1">
          <h3 className="font-playfair text-lg font-bold text-slate-800 mb-4">Lehenga Categories</h3>
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const totalItems = outfits.filter(o => o.status !== 'Retired').length;
              const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{cat}</span>
                    <span>{count} items</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full gold-gradient-bg transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {outfits.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No outfits found</p>
            )}
          </div>
        </div>

        {/* Size Distribution */}
        <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm lg:col-span-1">
          <h3 className="font-playfair text-lg font-bold text-slate-800 mb-4">Size Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {['S', 'M', 'L', 'XL'].map(size => {
              const count = sizeCounts[size] || 0;
              const totalItems = outfits.filter(o => o.status !== 'Retired').length;
              const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;

              return (
                <div key={size} className="border border-cream-200/60 p-4 rounded-xl flex flex-col justify-between hover:border-gold-300 transition-colors">
                  <span className="text-xs font-bold text-slate-400 uppercase">Size {size}</span>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <span className="text-2xl font-bold text-slate-800">{count}</span>
                    <span className="text-xs text-slate-500 font-medium">pcs</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-maroon-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white border border-cream-200/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-cream-200/60 flex justify-between items-center">
          <h3 className="font-playfair text-lg font-bold text-slate-800">Recent Booking Requests</h3>
          <Link to="/admin/bookings" className="text-xs font-bold text-maroon-500 hover:text-maroon-600 inline-flex items-center space-x-1">
            <span>View All Bookings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-cream-200/40">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Outfit</th>
                <th className="px-6 py-4">Rental Dates</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100/60 text-sm">
              {bookings.slice(0, 5).map((booking) => {
                let statusBadge = '';
                if (booking.status === 'Pending') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                else if (booking.status === 'Approved') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                else if (booking.status === 'Alteration') statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                else if (booking.status === 'Dispatched') statusBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                else if (booking.status === 'Delivered') statusBadge = 'bg-teal-50 text-teal-700 border-teal-200';
                else if (booking.status === 'Returned' || booking.status === 'Completed') statusBadge = 'bg-maroon-50 text-maroon-700 border-maroon-200';
                else statusBadge = 'bg-red-50 text-red-700 border-red-200';

                return (
                  <tr key={booking.id} className="hover:bg-cream-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{booking.user?.name || `Customer #${booking.userId}`}</div>
                      <div className="text-xs text-slate-400">{booking.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{booking.outfit?.name || `Outfit #${booking.outfitId}`}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {booking.startDate} to {booking.endDate}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      ₹{booking.totalAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusBadge}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to="/admin/bookings" 
                        className="text-xs font-bold text-maroon-500 hover:text-maroon-700 hover:underline inline-flex items-center space-x-1"
                      >
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No bookings found in the system yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
  );
};

export default AdminDashboard;
