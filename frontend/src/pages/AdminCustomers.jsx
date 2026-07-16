import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AdminLayout from '../components/AdminLayout';
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Shirt, 
  CreditCard, 
  User as UserIcon, 
  ArrowRight,
  Info,
  History,
  Plus,
  Download,
  Copy,
  Send,
  MessageSquare,
  Check,
  X
} from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Visitor manual lead states
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');

  // WhatsApp Selection & composer states
  const [selectedBroadcastUserIds, setSelectedBroadcastUserIds] = useState([]);
  const [activeRightTab, setActiveRightTab] = useState('History'); // 'History' vs 'Broadcast'
  const [broadcastMessage, setBroadcastMessage] = useState(
    `Hello {name},\n\nWe have launched our new designer Lehenga collection at KR Rental Outfits! Visit our catalog here: ${window.location.origin}/catalog to select yours.\n\nBest Regards,\nKR Rental Outfits Jabalpur Team`
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, bookingsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/auth/customers`),
          axios.get(`${API_BASE_URL}/api/bookings`)
        ]);
        setCustomers(customersRes.data);
        setBookings(bookingsRes.data);
        setError('');
        
        // Auto-select first customer if exists
        if (customersRes.data.length > 0) {
          setSelectedCustomerId(customersRes.data[0].id);
        }
      } catch (err) {
        console.error('Error loading customer list', err);
        setError('Failed to retrieve customer accounts. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone) {
      alert('Please provide Name and Phone number.');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/customers`, {
        name: visitorName,
        phone: visitorPhone,
        email: visitorEmail
      });
      
      // Refresh list
      const customersRes = await axios.get(`${API_BASE_URL}/api/auth/customers`);
      setCustomers(customersRes.data);
      
      // Select new visitor
      setSelectedCustomerId(res.data.user.id);
      
      // Reset form
      setVisitorName('');
      setVisitorPhone('');
      setVisitorEmail('');
      setIsVisitorModalOpen(false);
      alert('Visitor lead registered successfully!');
    } catch (err) {
      console.error('Error adding visitor', err);
      alert(err.response?.data?.message || 'Failed to register walk-in visitor lead.');
    }
  };

  const handleCopyNumbers = () => {
    const targets = selectedBroadcastUserIds.length > 0 
      ? customers.filter(c => selectedBroadcastUserIds.includes(c.id))
      : filteredCustomers;
      
    if (targets.length === 0) {
      alert('No customer phone numbers to copy.');
      return;
    }
    
    const numbersList = targets.map(t => t.phone).join(', ');
    navigator.clipboard.writeText(numbersList);
    alert(`Copied ${targets.length} phone number(s) to clipboard!`);
  };

  const handleExportCSV = () => {
    const targets = selectedBroadcastUserIds.length > 0 
      ? customers.filter(c => selectedBroadcastUserIds.includes(c.id))
      : filteredCustomers;

    if (targets.length === 0) {
      alert('No customer details to export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `"Name","Phone","Email"\n`;
    
    targets.forEach(t => {
      csvContent += `"${t.name || ''}","${t.phone || ''}","${t.email || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `krrentaloutfits_customers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectForBroadcast = (customerId, e) => {
    e.stopPropagation();
    setSelectedBroadcastUserIds(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredCustomers.map(c => c.id);
    const allSelected = filteredIds.every(id => selectedBroadcastUserIds.includes(id));
    if (allSelected) {
      setSelectedBroadcastUserIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedBroadcastUserIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  // Filter customers by search term
  const filteredCustomers = customers.filter(c => {
    return (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (c.phone || '').includes(searchTerm) ||
           (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  // Get all bookings made by selected customer
  const customerBookings = selectedCustomer 
    ? bookings.filter(b => b.userId === selectedCustomerId)
    : [];

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
            <h1 className="font-playfair text-3xl font-bold text-slate-900">Customers Directory</h1>
            <p className="text-slate-500 text-sm mt-1">Search profiles and view history of specific walk-in or online bookings.</p>
          </div>
          
          <button
            onClick={() => setIsVisitorModalOpen(true)}
            className="flex items-center justify-center space-x-2 text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ADD VISITOR / CUSTOMER</span>
          </button>
        </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <p className="text-sm text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Customers Directory list */}
          <div className="lg:col-span-1 bg-white border border-cream-200/50 rounded-2xl shadow-sm overflow-hidden h-[75vh] flex flex-col">
            <div className="p-4 border-b border-cream-100 bg-cream-50/20">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, phone or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm bg-white border border-cream-200/80 focus:border-gold-500 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="p-3 border-b border-cream-100 bg-cream-50/15 flex justify-between items-center text-xs font-semibold text-slate-655">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filteredCustomers.length > 0 && filteredCustomers.every(c => selectedBroadcastUserIds.includes(c.id))}
                  onChange={handleSelectAllFiltered}
                  className="rounded border-cream-300 text-maroon-600 focus:ring-maroon-500"
                />
                <span>Select all filtered ({filteredCustomers.length})</span>
              </label>
              
              {selectedBroadcastUserIds.length > 0 && (
                <button 
                  onClick={() => setSelectedBroadcastUserIds([])}
                  className="text-maroon-600 hover:text-maroon-700 font-bold"
                >
                  Clear ({selectedBroadcastUserIds.length})
                </button>
              )}
            </div>

            <div className="flex-grow overflow-y-auto divide-y divide-cream-100/60">
              {filteredCustomers.map(customer => {
                const isActive = customer.id === selectedCustomerId;
                const custBookingsCount = bookings.filter(b => b.userId === customer.id).length;

                return (
                  <div
                    key={customer.id}
                    className={`w-full p-4 flex items-center justify-between border-l-4 transition-colors ${
                      isActive 
                        ? 'bg-maroon-50/40 border-maroon-500' 
                        : 'hover:bg-cream-50/40 border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBroadcastUserIds.includes(customer.id)}
                      onChange={(e) => toggleSelectForBroadcast(customer.id, e)}
                      className="mr-3 w-4 h-4 rounded border-cream-300 text-maroon-600 focus:ring-maroon-500 cursor-pointer shrink-0"
                    />

                    <button
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className="flex-grow text-left min-w-0 pr-2"
                    >
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{customer.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{customer.phone}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{customer.email}</p>
                    </button>
                    
                    <div className="shrink-0 flex items-center space-x-1.5">
                      <span className="text-xs bg-cream-100 text-slate-600 font-bold px-2 py-1 rounded-lg">
                        {custBookingsCount}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-maroon-500' : 'text-slate-350'}`} />
                    </div>
                  </div>
                );
              })}
              {filteredCustomers.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-12">No customers found</p>
              )}
            </div>
          </div>

          {/* Right Column: Customer Details & History logs */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCustomer ? (
              <div className="space-y-6">
                
                {/* Profile Card */}
                <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.02] rounded-full translate-x-8 -translate-y-8"></div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 mb-4">
                    <UserIcon className="w-3.5 h-3.5 text-gold-500" />
                    <span>Customer Profile</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h2 className="text-2xl font-playfair font-bold text-slate-800">{selectedCustomer.name}</h2>
                      <p className="text-xs text-slate-450 mt-1">Customer ID: #{selectedCustomer.id}</p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-slate-600 self-center">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="font-medium font-mono">{selectedCustomer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs to toggle details vs marketing broadcast */}
                <div className="flex bg-cream-55 p-1 rounded-xl border border-cream-200/50 shadow-inner w-full max-w-[420px]">
                  <button
                    onClick={() => setActiveRightTab('History')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all duration-200 ${
                      activeRightTab === 'History' 
                        ? 'bg-white text-maroon-500 shadow-sm' 
                        : 'text-slate-500 hover:text-maroon-500'
                    }`}
                  >
                    Booking History Logs
                  </button>
                  <button
                    onClick={() => setActiveRightTab('Broadcast')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all duration-200 ${
                      activeRightTab === 'Broadcast' 
                        ? 'bg-white text-maroon-500 shadow-sm' 
                        : 'text-slate-500 hover:text-maroon-500'
                    }`}
                  >
                    WhatsApp Broadcast Helper
                  </button>
                </div>

                {activeRightTab === 'History' ? (
                  /* Booking Logs */
                  <div className="bg-white border border-cream-200/50 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-cream-200/60 flex items-center space-x-2 bg-cream-50/15">
                      <History className="w-5 h-5 text-gold-500" />
                      <h3 className="font-playfair text-lg font-bold text-slate-800">Booking Schedule History</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-cream-50/30 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-cream-200/35">
                            <th className="px-6 py-4">Booking ID</th>
                            <th className="px-6 py-4">Lehenga Outfit</th>
                            <th className="px-6 py-4">Rental Dates</th>
                            <th className="px-6 py-4">Amount Paid</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Payment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-100/60 text-sm">
                          {customerBookings.map(b => {
                            const isCash = b.paymentMethod === 'Cash';
                            return (
                              <tr key={b.id} className="hover:bg-cream-50/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                                  #{b.id}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-slate-700">{b.outfit?.name || `Outfit #${b.outfitId}`}</div>
                                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Size {b.outfit?.size}</div>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-600">
                                  <div>{b.startDate}</div>
                                  <div className="text-[10px] text-slate-400">to {b.endDate}</div>
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-800">
                                  ₹{b.totalAmount}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyle(b.status)}`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs">
                                  <div className="font-semibold text-slate-750">{b.paymentMethod || 'Online'}</div>
                                  <div className={`text-[10px] font-bold mt-0.5 ${b.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {b.paymentStatus}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {customerBookings.length === 0 && (
                            <tr>
                              <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                No bookings recorded for this customer account.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* WhatsApp Broadcast Helper view */
                  <div className="bg-white border border-cream-200/50 rounded-2xl shadow-sm p-6 space-y-6">
                    <div className="flex items-center space-x-2 border-b border-cream-100 pb-4">
                      <MessageSquare className="w-5 h-5 text-gold-500" />
                      <h3 className="font-playfair text-lg font-bold text-slate-800">WhatsApp Broadcast Exporter</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={handleCopyNumbers}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-cream-50/50 hover:bg-cream-100/50 text-slate-700 rounded-xl font-bold text-xs border border-cream-200 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>COPY SELECTED (CSV)</span>
                      </button>
                      
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-cream-50/50 hover:bg-cream-100/50 text-slate-700 rounded-xl font-bold text-xs border border-cream-200 transition-colors"
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                        <span>EXPORT CONTACTS (CSV)</span>
                      </button>
                    </div>

                    {/* Message Composer */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Broadcast Message Template</label>
                      <textarea
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        rows="5"
                        className="w-full text-sm border border-cream-200 rounded-xl p-3 bg-white focus:outline-none focus:border-gold-500 font-sans"
                        placeholder="Use {name} to personalize dynamically..."
                      />
                      <p className="text-[10px] text-slate-400">
                        Use placeholder <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9px] font-bold">{'{name}'}</code> to personalize name greetings.
                      </p>
                    </div>

                    {/* Broadcast Targets Links */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp Link Dispatcher</h4>
                      
                      <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl text-xs text-amber-800 flex gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Broadcast Image Tip:</strong> copy your catalog image, click <strong>Send Chat</strong> below to open WhatsApp Web, and paste (Ctrl+V) the image directly into their message bar.
                        </div>
                      </div>

                      <div className="border border-cream-150 rounded-xl divide-y divide-cream-100 max-h-[250px] overflow-y-auto">
                        {(selectedBroadcastUserIds.length > 0 
                          ? customers.filter(c => selectedBroadcastUserIds.includes(c.id))
                          : filteredCustomers
                        ).map(c => {
                          const personalizedText = broadcastMessage.replace(/\{name\}/g, c.name);
                          const waLink = `https://web.whatsapp.com/send?phone=91${c.phone}&text=${encodeURIComponent(personalizedText)}`;
                          
                          return (
                            <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-cream-50/10 text-xs">
                              <div className="min-w-0 pr-2">
                                <span className="font-bold text-slate-700 block">{c.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{c.phone}</span>
                              </div>
                              
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold transition-colors shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>SEND CHAT</span>
                              </a>
                            </div>
                          );
                        })}
                        {(selectedBroadcastUserIds.length === 0 && filteredCustomers.length === 0) && (
                          <div className="p-8 text-center text-slate-400">
                            No active list selected for broadcast.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border border-cream-200/50 rounded-2xl p-12 text-center text-slate-400 shadow-sm h-full flex flex-col justify-center items-center">
                <Info className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-base font-semibold text-slate-700">No Customers Selected</p>
                <p className="text-sm text-slate-400 mt-1">Please select a customer from the left directory to view their rental bookings logs.</p>
              </div>
            )}
          </div>
          
        </div>
      )}
      </div>

      {/* Add Walk-in Visitor Modal */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-cream-200/80 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-cream-100 flex justify-between items-center bg-cream-50/50">
              <h3 className="font-playfair text-lg font-bold text-slate-850">Register Walk-in Visitor Lead</h3>
              <button
                onClick={() => setIsVisitorModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-cream-100/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVisitor}>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Visitor/Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="E.g. Priya Sharma"
                    className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">WhatsApp Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="E.g. 9876543210"
                    className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full text-sm border border-cream-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-cream-50/30 border-t border-cream-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsVisitorModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-cream-200 rounded-xl transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 rounded-xl shadow-sm transition-all"
                >
                  REGISTER VISITOR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCustomers;
