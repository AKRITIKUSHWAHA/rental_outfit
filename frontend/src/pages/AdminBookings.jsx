import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AdminLayout from '../components/AdminLayout';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  MapPin, 
  CreditCard, 
  Ruler, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Info,
  Calendar,
  AlertCircle,
  Plus,
  Shirt
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal / Detail state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Manual booking states
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [manualFormData, setManualFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    outfitId: '',
    startDate: '',
    endDate: '',
    bustSize: '',
    waistSize: '',
    hipsSize: '',
    lengthSize: '',
    height: '',
    shippingAddress: '',
    paymentMethod: 'Cash',
    paymentDetails: 'Manual Walk-in Booking'
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/bookings`);
      setBookings(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings', err);
      setError('Failed to fetch bookings list. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    
    // Fetch outfits for dropdown selection
    axios.get(`${API_BASE_URL}/api/outfits`)
      .then(res => setOutfits(res.data))
      .catch(err => console.error('Error fetching outfits list', err));
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualFormData.outfitId) {
      alert('Please select a Lehenga outfit.');
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/api/bookings/manual`, {
        ...manualFormData,
        outfitId: parseInt(manualFormData.outfitId),
        bustSize: manualFormData.bustSize ? parseFloat(manualFormData.bustSize) : null,
        waistSize: manualFormData.waistSize ? parseFloat(manualFormData.waistSize) : null,
        hipsSize: manualFormData.hipsSize ? parseFloat(manualFormData.hipsSize) : null,
        lengthSize: manualFormData.lengthSize ? parseFloat(manualFormData.lengthSize) : null,
        height: manualFormData.height ? parseFloat(manualFormData.height) : null
      });
      
      setIsManualModalOpen(false);
      // Reset form
      setManualFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        outfitId: '',
        startDate: '',
        endDate: '',
        bustSize: '',
        waistSize: '',
        hipsSize: '',
        lengthSize: '',
        height: '',
        shippingAddress: '',
        paymentMethod: 'Cash',
        paymentDetails: 'Manual Walk-in Booking'
      });
      
      // Refresh list
      fetchBookings();
    } catch (err) {
      console.error('Error saving manual booking', err);
      alert(err.response?.data?.message || 'Error processing manual booking request.');
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingStatusId(bookingId);
      const res = await axios.put(`${API_BASE_URL}/api/bookings/${bookingId}/status`, { status: newStatus });
      
      // Update state local list
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );

      // Update selected booking if currently viewing in drawer
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating booking status', err);
      alert('Failed to update booking status. Please try again.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Status values
  const statuses = [
    'All',
    'Pending',
    'Approved',
    'Alteration',
    'Dispatched',
    'Delivered',
    'Returned',
    'Refunded',
    'Completed',
    'Cancelled'
  ];

  // Filtering Logic
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.user?.phone || '').includes(searchTerm) ||
      (b.outfit?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Alteration':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dispatched':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Delivered':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Returned':
      case 'Completed':
        return 'bg-maroon-50 text-maroon-700 border-maroon-200';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-slate-900">Rental Bookings</h1>
            <p className="text-slate-500 text-sm mt-1">Review custom sizes, track shipping status, and update rental orders.</p>
          </div>
          
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center justify-center space-x-2 text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE MANUAL BOOKING</span>
          </button>
        </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <p className="text-sm text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm mb-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by customer name, email, phone, or lehenga name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-all duration-200"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
          </div>

          {/* Status quick select */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-sm bg-cream-50/30 border border-cream-200/80 focus:border-gold-500 rounded-xl px-4 py-3 focus:outline-none transition-all duration-200"
            >
              {statuses.map(st => (
                <option key={st} value={st}>{st === 'All' ? 'Filter by Status (All)' : st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Horizontal scrollable quick-filters on Desktop */}
        <div className="hidden sm:flex flex-wrap gap-2 pt-2 border-t border-cream-100">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                statusFilter === st 
                  ? 'bg-maroon-500 text-white border-maroon-600 shadow-sm'
                  : 'bg-white text-slate-500 border-cream-200 hover:bg-cream-50 hover:text-maroon-500'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-maroon-500"></div>
        </div>
      ) : (
        <div className="bg-white border border-cream-200/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-cream-200/40">
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Outfit Description</th>
                  <th className="px-6 py-4">Fulfillment Dates</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100/60 text-sm">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-cream-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{booking.user?.name || `User #${booking.userId}`}</div>
                      <div className="text-xs text-slate-400 font-medium inline-flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{booking.user?.email}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5 inline-flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{booking.user?.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{booking.outfit?.name || `Outfit #${booking.outfitId}`}</div>
                      <div className="text-xs text-slate-400 font-medium">Deposit: ₹{booking.securityDeposit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-600">{booking.startDate}</div>
                      <div className="text-xs text-slate-400">to {booking.endDate}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div>₹{booking.totalAmount}</div>
                      <div className="text-[10px] text-slate-450 font-normal mt-0.5">
                        {booking.paymentMethod || 'Online'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-cream-50 hover:bg-cream-100 hover:text-maroon-500 rounded-lg border border-cream-200/60 transition-colors"
                        >
                          View Details & Sizes
                        </button>
                        
                        <select
                          value={booking.status}
                          disabled={updatingStatusId === booking.id}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="text-xs font-semibold bg-white border border-cream-200/80 focus:border-gold-500 rounded-lg px-2 py-1 focus:outline-none transition-colors"
                        >
                          {statuses.filter(s => s !== 'All').map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      No matching bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Measurements & Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cream-200/80 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-cream-100 flex justify-between items-center bg-cream-50/50 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-playfair text-xl font-bold text-slate-800">Booking Details & Sizing</h3>
                <p className="text-xs text-slate-400 mt-1">Booking ID: #{selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-cream-100/50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-grow">
              
              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-gold-500" />
                  <span>Customer Info</span>
                </h4>
                <div className="bg-cream-50/30 border border-cream-150/40 p-4 rounded-xl space-y-2">
                  <div className="text-base font-semibold text-slate-700">{selectedBooking.user?.name || `Customer #${selectedBooking.userId}`}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{selectedBooking.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{selectedBooking.user?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizing Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Ruler className="w-3.5 h-3.5 text-gold-500" />
                  <span>Tailorial Custom Sizing</span>
                </h4>
                <div className="bg-maroon-50/20 border border-maroon-100/30 p-4 rounded-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="bg-white border border-cream-200/50 p-3 rounded-lg text-center shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Bust</p>
                      <p className="text-lg font-bold text-maroon-600 mt-1">{selectedBooking.bustSize ? `${selectedBooking.bustSize}"` : 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-cream-200/50 p-3 rounded-lg text-center shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Waist</p>
                      <p className="text-lg font-bold text-maroon-600 mt-1">{selectedBooking.waistSize ? `${selectedBooking.waistSize}"` : 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-cream-200/50 p-3 rounded-lg text-center shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Hips</p>
                      <p className="text-lg font-bold text-maroon-600 mt-1">{selectedBooking.hipsSize ? `${selectedBooking.hipsSize}"` : 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-cream-200/50 p-3 rounded-lg text-center shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Length</p>
                      <p className="text-lg font-bold text-maroon-600 mt-1">{selectedBooking.lengthSize ? `${selectedBooking.lengthSize}"` : 'N/A'}</p>
                    </div>
                    <div className="bg-white border border-cream-200/50 p-3 rounded-lg text-center shadow-sm col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Height</p>
                      <p className="text-lg font-bold text-maroon-600 mt-1">{selectedBooking.height ? `${selectedBooking.height} ft` : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start space-x-2 text-xs text-slate-400">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p>These sizing metrics are recorded for alterations. Please ensure standard 2-inch margins before fitting adjustment.</p>
                  </div>
                </div>
              </div>

              {/* Outfit details & pricing */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-gold-500" />
                  <span>Outfit details</span>
                </h4>
                <div className="border border-cream-200/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="font-semibold text-slate-700 text-base">{selectedBooking.outfit?.name}</div>
                    <div className="text-xs text-slate-400 font-medium mt-1">Category: {selectedBooking.outfit?.category} | Base Size: {selectedBooking.outfit?.size}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400">Rental Price: ₹{selectedBooking.totalAmount - selectedBooking.securityDeposit}</div>
                    <div className="text-xs text-slate-400">Refundable Deposit: ₹{selectedBooking.securityDeposit}</div>
                    <div className="text-sm font-bold text-slate-800 mt-1">Total Paid: ₹{selectedBooking.totalAmount}</div>
                  </div>
                </div>
              </div>

              {/* Date & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Rental Period */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-500" />
                    <span>Rental Period</span>
                  </h4>
                  <div className="border border-cream-200/60 p-4 rounded-xl text-sm font-medium text-slate-700 bg-cream-50/10">
                    <div>Start Date: {selectedBooking.startDate}</div>
                    <div className="mt-1">End Date: {selectedBooking.endDate}</div>
                  </div>
                </div>

                {/* Shipping address */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-500" />
                    <span>Shipping Address</span>
                  </h4>
                  <div className="border border-cream-200/60 p-4 rounded-xl text-sm text-slate-600 bg-cream-50/10 h-fit">
                    {selectedBooking.shippingAddress}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-gold-500" />
                  <span>Payment Information ({selectedBooking.paymentMethod || 'Online'})</span>
                </h4>
                <div className="border border-cream-200/60 p-4 rounded-xl text-sm text-slate-600 flex items-center space-x-2 bg-cream-50/10">
                  {selectedBooking.paymentStatus === 'Paid' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className={`font-semibold ${selectedBooking.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedBooking.paymentStatus}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span>{selectedBooking.paymentDetails}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-cream-50/30 border-t border-cream-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sticky bottom-0 z-10 bg-white">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-bold text-slate-500">Current Status:</span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyle(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Change Status:</span>
                <select
                  value={selectedBooking.status}
                  onChange={(e) => handleStatusChange(selectedBooking.id, e.target.value)}
                  className="text-xs font-semibold bg-white border border-cream-200/80 focus:border-gold-500 rounded-lg px-3 py-2 focus:outline-none transition-colors"
                >
                  {statuses.filter(s => s !== 'All').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Manual Booking Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cream-200/80 flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-cream-100 flex justify-between items-center bg-cream-50/50 sticky top-0 bg-white z-10">
              <h3 className="font-playfair text-xl font-bold text-slate-800">Walk-in Booking Entry</h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-cream-100/50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleManualSubmit} className="flex-grow flex flex-col">
              <div className="p-6 space-y-6 flex-grow bg-white">
                {/* Section 1: Customer Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-gold-500" />
                    <span>Customer Contact details</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Customer Name *</label>
                      <input
                        type="text"
                        required
                        value={manualFormData.customerName}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Name"
                        className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Phone Number *</label>
                      <input
                        type="text"
                        required
                        value={manualFormData.customerPhone}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        placeholder="Phone Number"
                        className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={manualFormData.customerEmail}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        placeholder="email@example.com"
                        className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Store Pickup / Delivery Address</label>
                      <input
                        type="text"
                        value={manualFormData.shippingAddress}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                        placeholder="Store Pick-up"
                        className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Lehenga & Dates */}
                <div className="space-y-3 pt-3 border-t border-cream-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Shirt className="w-3.5 h-3.5 text-gold-500" />
                    <span>Rental Selection</span>
                  </h4>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Lehenga Outfit *</label>
                    <select
                      required
                      value={manualFormData.outfitId}
                      onChange={(e) => setManualFormData(prev => ({ ...prev, outfitId: e.target.value }))}
                      className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                    >
                      <option value="">-- Select Lehenga Outfit --</option>
                      {outfits.filter(o => o.status !== 'Retired').map(o => (
                        <option key={o.id} value={o.id}>
                          {o.name} (Rent: ₹{o.rentalPrice}/day, Size: {o.size}) - {o.status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={manualFormData.startDate}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">End Date *</label>
                      <input
                        type="date"
                        required
                        value={manualFormData.endDate}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Sizing Customization */}
                <div className="space-y-3 pt-3 border-t border-cream-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Ruler className="w-3.5 h-3.5 text-gold-500" />
                    <span>Fitting & Sizing (inches)</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Bust</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="34.5"
                        value={manualFormData.bustSize}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, bustSize: e.target.value }))}
                        className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Waist</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="28"
                        value={manualFormData.waistSize}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, waistSize: e.target.value }))}
                        className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Hips</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="38"
                        value={manualFormData.hipsSize}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, hipsSize: e.target.value }))}
                        className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Length</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="42"
                        value={manualFormData.lengthSize}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, lengthSize: e.target.value }))}
                        className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="text-xs font-semibold text-slate-500">Height (ft)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="5.4"
                        value={manualFormData.height}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full text-sm border border-cream-200 rounded-lg p-2 bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Payment Details */}
                <div className="space-y-3 pt-3 border-t border-cream-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gold-500" />
                    <span>Payment Information</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Payment Method</label>
                      <select
                        value={manualFormData.paymentMethod}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                      >
                        <option value="Cash">Cash Payments (COD)</option>
                        <option value="Online">Online Payments</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Payment Reference Details</label>
                      <input
                        type="text"
                        value={manualFormData.paymentDetails}
                        onChange={(e) => setManualFormData(prev => ({ ...prev, paymentDetails: e.target.value }))}
                        placeholder="Reference details"
                        className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-cream-50/30 border-t border-cream-100 flex justify-end space-x-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-cream-200 rounded-xl transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 rounded-xl shadow-sm transition-all"
                >
                  SAVE MANUAL BOOKING
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </AdminLayout>
  );
};

export default AdminBookings;
