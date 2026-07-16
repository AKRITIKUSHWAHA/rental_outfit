import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { Calendar, Shield, CreditCard, Sparkles, MapPin, CheckSquare, Info } from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 font-medium">No booking details found. Please start from the Lehenga details page.</p>
        <Link to="/catalog" className="mt-4 inline-block text-xs bg-maroon-500 text-white px-4 py-2 rounded-lg font-bold">
          Go to Collections
        </Link>
      </div>
    );
  }

  const {
    outfitId,
    outfitName,
    images,
    rentalPrice,
    securityDeposit,
    startDate,
    endDate,
    bustSize,
    waistSize,
    hipsSize,
    lengthSize,
    height,
    totalAmount
  } = booking;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!address || !city || !pincode || !stateName) {
      setError('Please provide complete shipping address details.');
      return;
    }

    if (!agreement) {
      setError('You must accept the Lehenga Rental Agreement to place a booking.');
      return;
    }

    setSubmitting(true);
    const shippingAddress = `${address}, ${city}, ${stateName} - ${pincode}`;
    const isOnline = paymentMethod !== 'cash';
    const finalPaymentMethod = isOnline ? 'Online' : 'Cash';
    const simulatedTxn = isOnline 
      ? `Simulated ${paymentMethod.toUpperCase()} Txn: tx_` + Math.floor(Math.random() * 90000000 + 10000000)
      : 'Cash on Delivery (COD)';

    try {
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        outfitId,
        startDate,
        endDate,
        bustSize,
        waistSize,
        hipsSize,
        lengthSize,
        height,
        shippingAddress,
        paymentMethod: finalPaymentMethod,
        paymentDetails: simulatedTxn
      });

      // Navigate to My Bookings page
      navigate('/my-bookings?booked=success');
    } catch (err) {
      console.error('Checkout error', err);
      setError(err.response?.data?.message || 'Error processing your rental. Please try again.');
      setSubmitting(false);
    }
  };

  const imageUrl = images?.startsWith('http') || images?.startsWith('/')
    ? images
    : `${API_BASE_URL}${images}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-playfair text-3xl font-bold text-slate-900 text-center mb-8">Confirm Your Booking</h1>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-lg mb-6 max-w-4xl mx-auto">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        
        {/* Left Columns (2/3): Address & Payments Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-white border border-cream-200/50 p-6 rounded-xl luxury-shadow space-y-4">
              <h3 className="font-playfair text-lg font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b border-cream-100">
                <MapPin className="w-4 h-4 text-gold-500" />
                <span>Delivery Address</span>
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Apartment/Flat No, Block, Street Name"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold text-slate-500">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Delhi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold text-slate-500">State</label>
                    <input
                      type="text"
                      required
                      placeholder="Delhi NCR"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold text-slate-500">Pincode</label>
                    <input
                      type="text"
                      required
                      placeholder="110001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-cream-200/50 p-6 rounded-xl luxury-shadow space-y-4">
              <h3 className="font-playfair text-lg font-bold text-slate-800 flex items-center space-x-2 pb-2 border-b border-cream-100">
                <CreditCard className="w-4 h-4 text-gold-500" />
                <span>Simulated Payment Gateway</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'upi' ? 'border-maroon-500 bg-maroon-50/30' : 'border-cream-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm text-slate-700 text-center">UPI / QR</span>
                  <span className="text-[10px] text-slate-400 mt-1 text-center">UPI / GPay</span>
                </label>

                <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'card' ? 'border-maroon-500 bg-maroon-50/30' : 'border-cream-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm text-slate-700 text-center">Card</span>
                  <span className="text-[10px] text-slate-400 mt-1 text-center">Credit / Debit</span>
                </label>

                <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'netbanking' ? 'border-maroon-500 bg-maroon-50/30' : 'border-cream-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={() => setPaymentMethod('netbanking')}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm text-slate-700 text-center">Net Banking</span>
                  <span className="text-[10px] text-slate-400 mt-1 text-center">Bank Transfer</span>
                </label>

                <label className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'cash' ? 'border-maroon-500 bg-maroon-50/30' : 'border-cream-200'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm text-slate-700 text-center">Cash (COD)</span>
                  <span className="text-[10px] text-slate-400 mt-1 text-center">Pay Cash on Delivery</span>
                </label>
              </div>
              <p className="text-[10px] text-slate-400">Payment is simulated for development. Your booking will record as Paid immediately (for Online) or Pending (for Cash COD) upon checkout.</p>
            </div>

            {/* Terms and conditions */}
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreement}
                  onChange={(e) => setAgreement(e.target.checked)}
                  className="rounded border-cream-300 text-maroon-600 focus:ring-maroon-500 mt-1 cursor-pointer"
                />
                <span className="text-xs text-slate-500 leading-relaxed">
                  I agree to the <strong className="text-slate-700">Lehenga Rental Policy</strong>. I understand that the refundable deposit will be processed within 48 hours of return pick-up, subject to outfit condition check. Any major tear, stain or permanent damage may result in deposit deductions.
                </span>
              </label>
            </div>

            {/* Pay and Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-sm font-bold tracking-wider text-white bg-maroon-500 hover:bg-maroon-600 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'PROCESSING BOOKING...' : `PAY & BOOK NOW (₹${totalAmount.toLocaleString('en-IN')})`}</span>
            </button>

          </form>
        </div>

        {/* Right Column (1/3): Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-cream-200/50 p-6 rounded-xl luxury-shadow space-y-4">
            <h3 className="font-playfair text-lg font-bold text-slate-800 pb-2 border-b border-cream-100">Booking Summary</h3>

            {/* Lehenga thumbnail info */}
            <div className="flex space-x-3">
              <div className="w-16 h-20 bg-cream-50 rounded-lg overflow-hidden border border-cream-200 shrink-0">
                <img
                  src={imageUrl}
                  alt={outfitName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-800 text-sm truncate">{outfitName}</h4>
                <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span>{startDate} to {endDate}</span>
                </div>
              </div>
            </div>

            {/* Custom Measurements Summary */}
            <div className="bg-cream-100/50 border border-cream-200/60 p-4 rounded-lg space-y-2">
              <h5 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Fitted Custom Sizes:</h5>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                <div>Bust: <strong className="text-slate-700">{bustSize}"</strong></div>
                <div>Waist: <strong className="text-slate-700">{waistSize}"</strong></div>
                <div>Hips: <strong className="text-slate-700">{hipsSize}"</strong></div>
                <div>Length: <strong className="text-slate-700">{lengthSize}"</strong></div>
                <div>Height: <strong className="text-slate-700">{height} ft</strong></div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between text-slate-500">
                <span>Lehenga Rent (3 days)</span>
                <span>₹{rentalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Refundable Deposit</span>
                <span>₹{securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Alteration / Fitting fee</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Dry Cleaning & Sanitizing</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping & Return Pick-up</span>
                <span className="text-emerald-600 font-medium">FREE</span>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-cream-100 pt-3">
                <span>Total Amount Payable</span>
                <span className="text-maroon-600 font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-start space-x-2 text-xs text-emerald-800">
            <Shield className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            <span>Secure Booking System. Your data is encrypted and transactions are fully protected. Refund policy guarantees prompt return of security deposits.</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
