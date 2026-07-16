import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import AdminLayout from '../components/AdminLayout';
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Play,
  User,
  Settings,
  Database,
  Code,
  ShieldCheck,
  Search,
  BookOpen,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

const AdminWhatsApp = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    successCount: 0,
    failedCount: 0,
    sentCount: 0,
    byType: {
      confirmationCount: 0,
      statusUpdateCount: 0,
      leadGreetingCount: 0,
      manualCount: 0
    }
  });
  const [templates, setTemplates] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manual message inputs
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualText, setManualText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Simulated gateway output ticker logs
  const [gatewayLogs, setGatewayLogs] = useState([
    { time: new Date(Date.now() - 60000).toLocaleTimeString(), message: 'WhatsApp Simulated Gateway boot sequence complete.', type: 'SYSTEM' },
    { time: new Date(Date.now() - 40000).toLocaleTimeString(), message: 'Connected to local database.sqlite. Found models (WhatsAppLog, WhatsAppTemplate).', type: 'SYSTEM' },
    { time: new Date(Date.now() - 20000).toLocaleTimeString(), message: 'Simulated API Gateway is listening for outgoing notifications on port 5000...', type: 'SYSTEM' }
  ]);

  const addGatewayLog = (message, type = 'INFO') => {
    const time = new Date().toLocaleTimeString();
    setGatewayLogs(prev => [...prev, { time, message, type }].slice(-40));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes, templatesRes, customersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/whatsapp/logs`),
        axios.get(`${API_BASE_URL}/api/whatsapp/stats`),
        axios.get(`${API_BASE_URL}/api/whatsapp/templates`),
        axios.get(`${API_BASE_URL}/api/auth/customers`)
      ]);

      setLogs(logsRes.data);
      setStats(statsRes.data);
      setTemplates(templatesRes.data);
      setCustomers(customersRes.data);
      setError('');
      addGatewayLog('Fetched latest logs and system metrics from backend API.', 'API');
    } catch (err) {
      console.error('Error loading WhatsApp admin data', err);
      setError('Failed to retrieve WhatsApp dashboard data. Ensure the backend server is running.');
      addGatewayLog('API Connection Refused. Failed to retrieve data.', 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle template selection in Manual Dispatcher
  const handleTemplateChangeForManual = (templateId) => {
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setManualText('');
      return;
    }

    const t = templates.find(temp => temp.id === templateId);
    if (t) {
      let bodyText = t.body;
      
      // Auto replace basic name greeting if customer selected
      if (selectedCustomerId) {
        const customer = customers.find(c => c.id === parseInt(selectedCustomerId));
        if (customer) {
          bodyText = bodyText.replace(/\{name\}/g, customer.name);
          bodyText = bodyText.replace(/\{bookingId\}/g, 'B1001');
          bodyText = bodyText.replace(/\{outfit\}/g, 'Crimson Red Lehenga');
          bodyText = bodyText.replace(/\{startDate\}/g, '2026-08-20');
          bodyText = bodyText.replace(/\{endDate\}/g, '2026-08-23');
          bodyText = bodyText.replace(/\{totalAmount\}/g, '14500');
          bodyText = bodyText.replace(/\{status\}/g, 'Approved');
        }
      }
      setManualText(bodyText);
      addGatewayLog(`Selected template "${t.title}" and auto-filled editor.`, 'UI');
    }
  };

  // Handle customer selection in Manual Dispatcher
  const handleCustomerChange = (customerId) => {
    setSelectedCustomerId(customerId);
    if (!customerId) {
      setManualPhone('');
      setManualName('');
      return;
    }

    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
      setManualPhone(customer.phone || '');
      setManualName(customer.name || '');

      // Re-populate template body if one is selected
      if (selectedTemplateId) {
        const t = templates.find(temp => temp.id === selectedTemplateId);
        if (t) {
          let bodyText = t.body.replace(/\{name\}/g, customer.name);
          bodyText = bodyText.replace(/\{bookingId\}/g, 'B1001');
          bodyText = bodyText.replace(/\{outfit\}/g, 'Crimson Red Lehenga');
          bodyText = bodyText.replace(/\{startDate\}/g, '2026-08-20');
          bodyText = bodyText.replace(/\{endDate\}/g, '2026-08-23');
          bodyText = bodyText.replace(/\{totalAmount\}/g, '14500');
          bodyText = bodyText.replace(/\{status\}/g, 'Approved');
          setManualText(bodyText);
        }
      }
    }
  };

  // Send manual message
  const handleSendManual = async (e) => {
    e.preventDefault();
    if (!manualPhone || !manualText || !manualName) {
      alert('Please fill out Name, Phone, and Message text.');
      return;
    }

    setIsSubmitting(true);
    addGatewayLog(`Queued manual message dispatch to ${manualName} (${manualPhone})...`, 'QUEUE');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/whatsapp/send`, {
        recipientName: manualName,
        recipientPhone: manualPhone,
        messageText: manualText,
        messageType: 'Manual'
      });

      const log = response.data.log;
      addGatewayLog(`Simulated dispatch finished: Recipient=${log.recipientName}, Status=${log.status}`, log.status === 'Failed' ? 'ERROR' : 'SUCCESS');
      
      // Reset dispatcher form
      setSelectedCustomerId('');
      setManualPhone('');
      setManualName('');
      setManualText('');
      setSelectedTemplateId('');
      
      // Reload logs & stats
      fetchData();
      alert('Message dispatched successfully via simulated API!');
    } catch (err) {
      console.error('Error sending manual WhatsApp message', err);
      addGatewayLog(`Error dispatching message: ${err.response?.data?.message || err.message}`, 'ERROR');
      alert(err.response?.data?.message || 'Failed to dispatch manual message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save template edit
  const handleSaveTemplate = async (id, updatedBody) => {
    addGatewayLog(`Updating template "${id}"...`, 'CONFIG');
    try {
      await axios.put(`${API_BASE_URL}/api/whatsapp/templates/${id}`, {
        body: updatedBody
      });
      addGatewayLog(`Template "${id}" successfully updated and saved.`, 'SUCCESS');
      
      // Reload templates
      const templatesRes = await axios.get(`${API_BASE_URL}/api/whatsapp/templates`);
      setTemplates(templatesRes.data);
      alert('System template updated successfully!');
    } catch (err) {
      console.error('Error saving template', err);
      addGatewayLog(`Failed to update template: ${err.message}`, 'ERROR');
      alert('Failed to save template. Please try again.');
    }
  };

  // Retry sending a failed message
  const handleRetryLog = async (logId) => {
    addGatewayLog(`Re-queueing failed log entry #${logId} for immediate dispatch...`, 'RETRY');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/whatsapp/retry/${logId}`);
      addGatewayLog(`Retry of log entry #${logId} delivered successfully.`, 'SUCCESS');
      fetchData();
      alert(res.data.message || 'Retry dispatch delivered successfully!');
    } catch (err) {
      console.error('Error retrying message', err);
      addGatewayLog(`Retry of log #${logId} failed: ${err.response?.data?.error || err.message}`, 'ERROR');
      alert(err.response?.data?.message || 'Retry dispatch failed again.');
    }
  };

  // Filter & Search Logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipientPhone?.includes(searchTerm) ||
      log.messageText?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    const matchesType = typeFilter === 'All' || log.messageType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>DELIVERED</span>
          </span>
        );
      case 'Sent':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600 shrink-0" />
            <span>SENT</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-50 text-slate-650 border border-slate-200">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  // Success rate calculator
  const successRate = stats.totalCount > 0 
    ? ((stats.successCount / stats.totalCount) * 100).toFixed(1) 
    : '100';

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-playfair text-3xl font-bold text-slate-900">WhatsApp Dispatch Portal</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                Simulated Gateway
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1 flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Gateway Status: Active & Monitoring API triggers</span>
            </p>
          </div>
          
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-white hover:bg-cream-50/50 border border-cream-200 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC GATEWAY</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg shadow-sm">
            <p className="text-sm text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Total Dispatches */}
          <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.02] rounded-full translate-x-8 -translate-y-8" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Dispatched</p>
                <h3 className="text-3xl font-playfair font-bold text-slate-800 mt-2">{stats.totalCount}</h3>
              </div>
              <div className="p-3 bg-maroon-50 rounded-xl text-maroon-500">
                <Send className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-slate-500">
              <span className="text-slate-400 font-medium">Automatic Transactional Queue</span>
            </div>
          </div>

          {/* Card 2: Success Rate */}
          <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.02] rounded-full translate-x-8 -translate-y-8" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Rate</p>
                <h3 className="text-3xl font-playfair font-bold text-slate-800 mt-2">{successRate}%</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-500">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold">
              <span>{stats.successCount} Successful Deliveries</span>
            </div>
          </div>

          {/* Card 3: Failures */}
          <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.02] rounded-full translate-x-8 -translate-y-8" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Failures Logged</p>
                <h3 className="text-3xl font-playfair font-bold text-rose-600 mt-2">{stats.failedCount}</h3>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-rose-500 font-semibold">
              {stats.failedCount > 0 ? (
                <span>Requires retry or credential check</span>
              ) : (
                <span className="text-slate-400 font-normal">All systems routing cleanly</span>
              )}
            </div>
          </div>

          {/* Card 4: Type Breakdown */}
          <div className="bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 maroon-gradient-bg opacity-[0.02] rounded-full translate-x-8 -translate-y-8" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message Types</p>
                <div className="flex flex-col space-y-1 mt-2 text-[10px] font-semibold text-slate-650">
                  <div className="flex justify-between w-40">
                    <span>Confirmation:</span>
                    <span>{stats.byType.confirmationCount}</span>
                  </div>
                  <div className="flex justify-between w-40">
                    <span>Status Update:</span>
                    <span>{stats.byType.statusUpdateCount}</span>
                  </div>
                  <div className="flex justify-between w-40">
                    <span>Manual:</span>
                    <span>{stats.byType.manualCount}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl text-slate-500">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
          </div>

        </div>

        {/* Live Simulator Ticker Console */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <Code className="w-4 h-4 text-gold-500" />
            <h3 className="font-playfair text-lg font-bold text-slate-800">Simulated API Live Ticker Feed</h3>
          </div>
          <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-2xl h-48 overflow-y-auto border border-slate-800 shadow-inner flex flex-col space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {gatewayLogs.map((gLog, index) => (
              <div key={index} className="leading-relaxed flex items-start">
                <span className="text-slate-500 shrink-0 select-none mr-2">[{gLog.time}]</span>
                <span className={`shrink-0 select-none font-bold mr-2 uppercase text-[9px] px-1 py-0.5 rounded ${
                  gLog.type === 'ERROR' ? 'bg-rose-950 text-rose-400' :
                  gLog.type === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300' :
                  gLog.type === 'SYSTEM' ? 'bg-slate-800 text-slate-300' :
                  'bg-gold-950 text-gold-300'
                }`}>
                  {gLog.type}
                </span>
                <span className={gLog.type === 'ERROR' ? 'text-rose-450' : 'text-emerald-400'}>
                  {gLog.message}
                </span>
              </div>
            ))}
            <div className="animate-pulse flex items-center text-emerald-500 font-bold mt-1">
              <span>&gt; gateway ready</span>
              <span className="w-2 h-4 bg-emerald-500 ml-1"></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Panel: Manual Dispatcher Form */}
          <div className="lg:col-span-1 bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <form onSubmit={handleSendManual} className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-cream-100 pb-3">
                <Play className="w-4 h-4 text-gold-500" />
                <h3 className="font-playfair text-lg font-bold text-slate-800">Manual API Dispatcher</h3>
              </div>

              {/* Target Customer Dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Choose Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full text-sm border border-cream-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="">-- Custom Number (Not in list) --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Recipient Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Priya Sharma"
                  value={manualName}
                  onChange={(e) => {
                    setManualName(e.target.value);
                    setSelectedCustomerId(''); // Clear preset if editing
                  }}
                  className="w-full text-sm border border-cream-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Phone number */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Phone (with Country Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. 9876543210 (No + prefix)"
                  value={manualPhone}
                  onChange={(e) => {
                    setManualPhone(e.target.value);
                    setSelectedCustomerId(''); // Clear preset if editing
                  }}
                  className="w-full text-sm border border-cream-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-gold-500 font-mono"
                />
              </div>

              {/* Template Quick Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Populate From Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChangeForManual(e.target.value)}
                  className="w-full text-sm border border-cream-200 rounded-xl p-2.5 bg-white focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="">-- Custom Text Message --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              {/* Message text */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Message Content *</label>
                  <span className="text-[9px] text-slate-400 font-mono">{manualText.length} chars</span>
                </div>
                <textarea
                  required
                  rows="4"
                  placeholder="Write message content here..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full text-xs border border-cream-200 rounded-xl p-3 bg-white focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-white bg-maroon-500 hover:bg-maroon-600 px-4 py-3 rounded-xl transition-all duration-200 shadow-sm active:scale-98 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'DISPATCHING...' : 'DISPATCH MOCK MESSAGE'}</span>
              </button>
            </form>
          </div>

          {/* Right Panel: Template Customizer Panel */}
          <div className="lg:col-span-2 bg-white border border-cream-200/50 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-2 border-b border-cream-100 pb-3 mb-6">
              <Settings className="w-4 h-4 text-gold-500" />
              <h3 className="font-playfair text-lg font-bold text-slate-800">System Notification Templates</h3>
            </div>

            {templates.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12">No active system templates found.</p>
            ) : (
              <div className="space-y-6">
                {templates.map(t => (
                  <TemplateItem 
                    key={t.id} 
                    template={t} 
                    onSave={(updatedBody) => handleSaveTemplate(t.id, updatedBody)} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Logs Feed Panel */}
        <div className="bg-white border border-cream-200/50 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Logs Filter Header */}
          <div className="px-6 py-5 border-b border-cream-200/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-cream-50/10">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-gold-500" />
              <h3 className="font-playfair text-lg font-bold text-slate-800">Gateway Dispatch History Logs</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Search input */}
              <div className="relative flex-grow md:flex-grow-0">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-xs bg-white border border-cream-200/80 focus:border-gold-500 rounded-xl pl-8 pr-4 py-2 focus:outline-none transition-colors w-full md:w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-cream-200/80 focus:border-gold-500 rounded-xl px-3 py-2 focus:outline-none bg-white font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Sent">Sent</option>
                <option value="Failed">Failed</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs border border-cream-200/80 focus:border-gold-500 rounded-xl px-3 py-2 focus:outline-none bg-white font-medium cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Booking Confirmation">Booking Confirmation</option>
                <option value="Status Update">Status Update</option>
                <option value="Lead Greeting">Lead Greeting</option>
                <option value="Manual">Manual</option>
              </select>

            </div>
          </div>

          {/* Historical Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-50/20 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-cream-200/35">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Message Type</th>
                  <th className="px-6 py-4">Content</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100/60 text-sm">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-cream-50/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                      #{log.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{log.recipientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.recipientPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        log.messageType === 'Booking Confirmation' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        log.messageType === 'Status Update' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        log.messageType === 'Lead Greeting' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {log.messageType}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-600 font-sans" title={log.messageText}>
                      {log.messageText}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(log.status)}
                      {log.status === 'Failed' && log.error && (
                        <div className="text-[9px] text-rose-500 italic mt-0.5 max-w-[120px] truncate" title={log.error}>
                          Error: {log.error}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'Failed' ? (
                        <button
                          onClick={() => handleRetryLog(log.id)}
                          className="text-xs font-bold text-maroon-500 hover:text-maroon-600 hover:underline flex items-center space-x-1 ml-auto"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin-slow" />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setManualName(log.recipientName);
                            setManualPhone(log.recipientPhone);
                            setManualText(log.messageText);
                            addGatewayLog(`Copied message log #${log.id} to manual composer.`, 'UI');
                          }}
                          className="text-xs font-bold text-gold-600 hover:text-gold-700 hover:underline"
                        >
                          Clone
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                      No matching log entries discovered in historical queue.
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

// Subcomponent: Live editable system templates
const TemplateItem = ({ template, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(template.body);

  const handleCancel = () => {
    setEditedBody(template.body);
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    onSave(editedBody);
    setIsEditing(false);
  };

  return (
    <div className="border border-cream-150 rounded-xl p-4 hover:border-cream-200 transition-colors shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-gold-500 shrink-0" />
          <h4 className="font-semibold text-slate-800 text-sm leading-tight">{template.title}</h4>
        </div>
        <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded shrink-0 select-all uppercase">
          ID: {template.id}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-3 mt-3">
          <textarea
            rows="4"
            value={editedBody}
            onChange={(e) => setEditedBody(e.target.value)}
            className="w-full text-xs border border-cream-200 rounded-xl p-3 bg-white focus:outline-none focus:border-gold-500 font-sans"
          />
          <div className="flex justify-between items-center">
            {template.variables && (
              <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Allowed dynamic tags: <code className="bg-slate-50 px-1 py-0.5 rounded font-mono text-[9px] font-bold text-slate-650">{template.variables}</code>
                </span>
              </div>
            )}
            <div className="flex space-x-2 shrink-0 ml-auto">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-white border border-cream-200 rounded-lg transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="px-4 py-1.5 text-[10px] font-bold text-white bg-maroon-500 hover:bg-maroon-600 rounded-lg transition-colors shadow-sm"
              >
                SAVE TEMPLATE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 mt-3">
          <div className="bg-cream-50/15 p-3 rounded-lg border border-cream-100/50 text-xs text-slate-600 font-sans leading-relaxed whitespace-pre-line">
            {template.body}
          </div>
          <div className="flex justify-between items-center text-[10px]">
            {template.variables && (
              <div className="text-slate-400 flex items-start gap-1 max-w-[70%]">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="truncate">
                  Variable mapping: <code className="font-mono bg-slate-100/80 px-1 py-0.5 rounded text-[9px] text-slate-500 font-bold">{template.variables}</code>
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-bold text-gold-600 hover:text-gold-700 hover:underline uppercase tracking-wider shrink-0 ml-auto"
            >
              Configure Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWhatsApp;
