import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Calendar, User, Ruler, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

const MyBookings = () => {
  const [searchParams] = useSearchParams();
  const showSuccessBanner = searchParams.get('booked') === 'success';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/bookings/my-bookings`)
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings', err);
        setLoading(false);
      });
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Alteration': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Dispatched': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Returned': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Refunded': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusDesc = (status) => {
    switch (status) {
      case 'Pending': return 'Awaiting boutique review and approval.';
      case 'Approved': return 'Accepted! Ready to move to tailor room.';
      case 'Alteration': return 'Tailor altering the waist and length to your measurements.';
      case 'Dispatched': return 'Outfit dispatched. Out for delivery to your location.';
      case 'Delivered': return 'Delivered! Wear it and shine at your special event.';
      case 'Returned': return 'Lehenga returned. Undergoing QC damage check.';
      case 'Refunded': return 'Deposit check passed. Refunded to your original method.';
      case 'Completed': return 'Rental completed successfully. Thank you!';
      case 'Cancelled': return 'Booking has been cancelled.';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-500 mx-auto"></div>
        <p className="text-slate-500 text-sm mt-4">Loading your rentals...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Thank you Banner */}
      {showSuccessBanner && (
        <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-xl max-w-3xl mx-auto mb-10 flex items-start space-x-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-playfair text-xl font-bold text-emerald-800">Booking Placed Successfully!</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Namaste! Your order has been registered. Our tailors will soon begin altering the dress to match your measurements. You can track its status live below.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-10 text-center md:text-left max-w-4xl mx-auto">
        <h1 className="font-playfair text-3xl font-bold text-slate-900">Your Rentals History</h1>
        <p className="text-slate-500 text-sm mt-1">Review live fit adjustments, delivery dispatches, and deposit refunds.</p>
        <div className="h-0.5 w-16 gold-gradient-bg mt-3 mx-auto md:mx-0"></div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-cream-200/50 p-12 rounded-xl text-center max-w-xl mx-auto space-y-4 luxury-shadow">
          <Calendar className="w-12 h-12 text-cream-300 mx-auto" />
          <h3 className="font-playfair text-xl font-bold text-slate-700">No Bookings Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">You haven't rented any Lehenga from KR Rental Outfits yet. Find your perfect outfit today!</p>
          <Link
            to="/catalog"
            className="inline-block text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 px-6 py-3 rounded-lg transition-colors"
          >
            Explore Lehenga Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-8 max-w-4xl mx-auto">
          {bookings.map((booking) => {
            const outfit = booking.outfit;
            const imageUrl = outfit?.images?.startsWith('http') || outfit?.images?.startsWith('/')
              ? outfit?.images
              : `${API_BASE_URL}${outfit?.images}`;

            return (
              <div key={booking.id} className="bg-white border border-cream-200/50 rounded-xl luxury-shadow overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                
                {/* Outfit Info Column */}
                <div className="md:col-span-1 space-y-3">
                  <div className="aspect-[3/4] bg-cream-50 border border-cream-200 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={outfit?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <h3 className="font-playfair font-bold text-slate-800 text-sm leading-snug">{outfit?.name}</h3>
                </div>

                {/* Rental Details & Measurements Column */}
                <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    
                    {/* Dates banner */}
                    <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-cream-50/50 p-2 border border-cream-100 rounded-lg w-fit">
                      <Calendar className="w-4 h-4 text-gold-500" />
                      <span><strong>Rent Dates:</strong> {booking.startDate} to {booking.endDate}</span>
                    </div>

                    {/* Sizes panel */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                        <Ruler className="w-3 h-3 text-gold-500" />
                        <span>Alteration Measurements Sent</span>
                      </p>
                      <div className="grid grid-cols-5 gap-1.5 text-xs text-slate-600 bg-cream-50/50 px-2 py-1.5 border border-cream-100 rounded-lg text-center font-medium">
                        <div>Bust<br /><strong className="text-slate-800">{booking.bustSize}"</strong></div>
                        <div>Waist<br /><strong className="text-slate-800">{booking.waistSize}"</strong></div>
                        <div>Hips<br /><strong className="text-slate-800">{booking.hipsSize}"</strong></div>
                        <div>Len<br /><strong className="text-slate-800">{booking.lengthSize}"</strong></div>
                        <div>Ht<br /><strong className="text-slate-800">{booking.height} ft</strong></div>
                      </div>
                    </div>

                    {/* Address panel */}
                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gold-500" />
                        <span>Delivery Address</span>
                      </p>
                      <p className="pl-4 leading-relaxed truncate">{booking.shippingAddress}</p>
                    </div>

                  </div>

                  <div className="text-xs text-slate-400">
                    Booking ID: <strong className="text-slate-600">#{booking.id}</strong> | Rented on {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Status and Pricing Column */}
                <div className="md:col-span-1 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-cream-100 pt-4 md:pt-0 md:pl-6">
                  
                  {/* Status Badge */}
                  <div className="text-left md:text-right space-y-1.5 w-full">
                    <span className={`inline-block border text-[10px] tracking-widest font-bold px-3 py-1 rounded-full uppercase ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{getStatusDesc(booking.status)}</p>
                  </div>

                  {/* Pricing Total */}
                  <div className="text-left md:text-right mt-4 w-full">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Paid</p>
                    <p className="text-lg font-black text-maroon-600">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
                    <p className="text-[9px] text-slate-400 italic">Incl. deposit ₹{booking.securityDeposit.toLocaleString('en-IN')}</p>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyBookings;
