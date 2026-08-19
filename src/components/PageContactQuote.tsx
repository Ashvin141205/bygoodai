import React, { useState, useEffect } from "react";
import { Phone, Mail, Clock, MapPin, Send, CheckCircle, Search, ClipboardList, RefreshCw, MessageSquare } from "lucide-react";

interface PageContactQuoteProps {
  onOpenInquiry: (productName: string) => void;
  onSubmitSuccess?: () => void;
}

export interface InquiryTicket {
  id: string;
  name: string;
  phone: string;
  product: string;
  message: string;
  timestamp: string;
  status: string;
}

export default function PageContactQuote({ onOpenInquiry, onSubmitSuccess }: PageContactQuoteProps) {
  // Forms tab: "contact" | "quote" | "tracker"
  const [activeTab, setActiveTab] = useState("contact");
  
  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  // RFQ Quote Form States
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quoteCompany, setQuoteCompany] = useState("");
  const [quoteVariety, setQuoteVariety] = useState("GG-20 Seeds");
  const [quoteTons, setQuoteTons] = useState("5 Tons");
  const [quotePack, setQuotePack] = useState("Breathable Jute Bags");
  const [quoteMsg, setQuoteMsg] = useState("");
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Ticket Tracker States
  const [trackerPhone, setTrackerPhone] = useState("");
  const [myTickets, setMyTickets] = useState<InquiryTicket[]>([]);
  const [trackerHasSearched, setTrackerHasSearched] = useState(false);

  // Load local storage inquiries
  const loadLocalInquiries = () => {
    try {
      const stored = localStorage.getItem("kirit_inquiries");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse local inquiries:", e);
    }
    return [];
  };

  // Handle contact form submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    // Create a local inquiry record
    const newInquiry: InquiryTicket = {
      id: "KRT-" + Math.floor(Math.random() * 90000 + 10000),
      name: contactName,
      phone: contactPhone,
      product: "General Contact / Message",
      message: contactMessage,
      timestamp: new Date().toLocaleString(),
      status: "In Progress (Received)"
    };

    const currentList = loadLocalInquiries();
    const updated = [newInquiry, ...currentList];
    localStorage.setItem("kirit_inquiries", JSON.stringify(updated));

    setContactSuccess(true);
    setContactName("");
    setContactPhone("");
    setContactMessage("");

    if (onSubmitSuccess) onSubmitSuccess();
  };

  // Handle RFQ Submit
  const handleRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteName || !quotePhone) return;

    // Create inquiry record
    const rfqText = `Company: ${quoteCompany} | Tonnage: ${quoteTons} | Packaging: ${quotePack} | Message: ${quoteMsg}`;
    const newInquiry: InquiryTicket = {
      id: "KRT-" + Math.floor(Math.random() * 90000 + 10000),
      name: quoteName,
      phone: quotePhone,
      product: `RFQ: ${quoteVariety}`,
      message: rfqText,
      timestamp: new Date().toLocaleString(),
      status: "Awaiting Pricing Quote"
    };

    const currentList = loadLocalInquiries();
    const updated = [newInquiry, ...currentList];
    localStorage.setItem("kirit_inquiries", JSON.stringify(updated));

    setQuoteSuccess(true);
    setQuoteName("");
    setQuotePhone("");
    setQuoteEmail("");
    setQuoteCompany("");
    setQuoteMsg("");

    if (onSubmitSuccess) onSubmitSuccess();
  };

  // Handle search tracker
  const handleTrackerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const all = loadLocalInquiries();
    
    if (trackerPhone.trim() === "") {
      setMyTickets(all);
    } else {
      const filtered = all.filter((ticket: InquiryTicket) => 
        ticket.phone.includes(trackerPhone.trim())
      );
      setMyTickets(filtered);
    }
    setTrackerHasSearched(true);
  };

  // Initialize tracker on activeTab search
  useEffect(() => {
    if (activeTab === "tracker") {
      const all = loadLocalInquiries();
      setMyTickets(all);
    }
  }, [activeTab]);

  return (
    <div className="space-y-16 pb-20 text-left">
      {/* CONTACT HERO */}
      <section className="bg-gradient-to-r from-[#2D4F1E] to-[#1C3213] text-white py-16 text-center space-y-4">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Connect With Us</span>
          <h1 className="text-4xl sm:text-5xl font-black font-serif tracking-tight text-white leading-tight">
            Contact Kirit Corporation & UV Seeds
          </h1>
          <p className="text-sm sm:text-base text-[#E5E2D9] max-w-2xl mx-auto leading-relaxed">
            Reach our Keshod factory, place certified sowing seed bookings, request custom grading quotations, or track active inquiry tickets in real-time.
          </p>
        </div>
      </section>

      {/* THREE-COLUMN STATS / DIRECT CHANNELS */}
      <section className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E5E2D9] p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E]">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-[#8B4513] uppercase tracking-wider">Call Directly / WhatsApp</h4>
            <p className="text-sm font-bold text-gray-900 mt-1">+91-98252-53123</p>
            <p className="text-[11px] text-[#5A5A40]">Sales Desk / Agronomist Desk</p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E2D9] p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E]">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-[#8B4513] uppercase tracking-wider">Email Address</h4>
            <p className="text-sm font-bold text-gray-900 mt-1">inquire@kiritcorp.com</p>
            <p className="text-[11px] text-[#5A5A40]">Commercial & Export Cargo</p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E2D9] p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-[#8B4513] uppercase tracking-wider">Operational Hours</h4>
            <p className="text-sm font-bold text-gray-900 mt-1">09:00 AM - 07:00 PM</p>
            <p className="text-[11px] text-[#5A5A40]">Monday to Saturday (IST)</p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E2D9] p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-[#F9F8F3] border border-[#E5E2D9] flex items-center justify-center text-[#2D4F1E]">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-[#8B4513] uppercase tracking-wider">Sondarda Plant</h4>
            <p className="text-xs font-bold text-gray-900 mt-1">Veraval Highway Road</p>
            <p className="text-[11px] text-[#5A5A40]">Sondarda, Keshod, Gujarat</p>
          </div>
        </div>
      </section>

      {/* CORE FORMS & TRACKER CONTAINER */}
      <section className="max-w-6xl mx-auto px-4 grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Side Tab Form Panel */}
        <div className="lg:col-span-7 bg-white border border-[#E5E2D9] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex border-b border-gray-200 pb-4 justify-start gap-4">
            <button
              onClick={() => setActiveTab("contact")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                activeTab === "contact"
                  ? "border-[#2D4F1E] text-[#2D4F1E]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab("quote")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                activeTab === "quote"
                  ? "border-[#2D4F1E] text-[#2D4F1E]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              B2B Request a Quote
            </button>
            <button
              onClick={() => setActiveTab("tracker")}
              className={`pb-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                activeTab === "tracker"
                  ? "border-[#2D4F1E] text-[#2D4F1E]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              Ticket Tracker
            </button>
          </div>

          {/* TAB 1: CONTACT US */}
          {activeTab === "contact" && (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 font-serif">Send Us a Direct Message</h3>
              <p className="text-xs text-[#5A5A40]">Fill out your details and our plant operators will get back to you via call or WhatsApp.</p>

              {contactSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span>Success! Your inquiry ticket was submitted. You can check its state in the 'Ticket Tracker' tab.</span>
                </div>
              ) : null}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Your Name (નામ)</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Phone Number (મોબાઇલ નંબર)</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Your Message (સંદેશ)</label>
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Ask about UV Seeds booking, job work, or kernel pricing..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#2D4F1E] text-white text-xs font-bold px-6 py-3.5 hover:bg-[#3D5F2F] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Message</span>
              </button>
            </form>
          )}

          {/* TAB 2: REQUEST FOR QUOTE */}
          {activeTab === "quote" && (
            <form onSubmit={handleRfqSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 font-serif">Request Commercial B2B Quotation</h3>
              <p className="text-xs text-[#5A5A40]">For wholesale buyers, oil manufacturers, and exporters. Receive custom pricing reports.</p>

              {quoteSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span>Success! Your RFQ pricing ticket has been stored in memory. Track it in the tracker tab.</span>
                </div>
              ) : null}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    placeholder="Enter contact name"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Corporate Name / Farm Name</label>
                  <input
                    type="text"
                    value={quoteCompany}
                    onChange={(e) => setQuoteCompany(e.target.value)}
                    placeholder="Enter farm or business name"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Required Groundnut Grade</label>
                  <select
                    value={quoteVariety}
                    onChange={(e) => setQuoteVariety(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                  >
                    <option value="UV Seeds: GG-20 Biyaran">UV Seeds: GG-20 Sowing Seeds</option>
                    <option value="UV Seeds: GG-2 Early Biyaran">UV Seeds: GG-2 Sowing Seeds</option>
                    <option value="Export Bold Kernels">Export Grade Bold Peanuts</option>
                    <option value="Export Java Kernels">Export Grade Java Peanuts</option>
                    <option value="Peanut Splits Grade-B">Peanut Splits (Industrial)</option>
                    <option value="In-Shell Raw Pods">In-Shell Raw Pods</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Required Tonnage</label>
                  <select
                    value={quoteTons}
                    onChange={(e) => setQuoteTons(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                  >
                    <option value="1 to 5 Tons">1 to 5 Metric Tons (Min)</option>
                    <option value="5 to 10 Tons">5 to 10 Metric Tons</option>
                    <option value="10 to 25 Tons">10 to 25 Metric Tons (1 Container)</option>
                    <option value="25+ Tons">25+ Metric Tons (Multiple Cargo)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Packaging Type</label>
                  <select
                    value={quotePack}
                    onChange={(e) => setQuotePack(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                  >
                    <option value="Breathable Jute Bags">Breathable Gunny Jute Sacks (50kg)</option>
                    <option value="Standard PP Bags">Laminated PP Bags (30kg/50kg)</option>
                    <option value="Vacuum Sealed Packs">High-Vacuum Barrier Sealed Packs (25kg)</option>
                    <option value="Bulk Bags Jumbo">Jumbo Bulk Tote Bags (1 Ton capacity)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Additional Sizing Specs / Destination</label>
                <textarea
                  rows={3}
                  value={quoteMsg}
                  onChange={(e) => setQuoteMsg(e.target.value)}
                  placeholder="Specify count-per-ounce, moisture criteria, and destination delivery port..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#2D4F1E] text-white text-xs font-bold px-6 py-3.5 hover:bg-[#3D5F2F] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Submit RFQ Quote Ticket</span>
              </button>
            </form>
          )}

          {/* TAB 3: TICKET TRACKER */}
          {activeTab === "tracker" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 font-serif">Inquiry & Ticket Tracker</h3>
                <p className="text-xs text-[#5A5A40]">Search and track inquiries or RFQs submitted from this browser. Enter your mobile number to filter.</p>
              </div>

              <form onSubmit={handleTrackerSearch} className="flex gap-2">
                <input
                  type="text"
                  value={trackerPhone}
                  onChange={(e) => setTrackerPhone(e.target.value)}
                  placeholder="Filter by phone number..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#2D4F1E] bg-[#F9F8F3]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#2D4F1E] text-white px-4 py-3 hover:bg-[#3D5F2F] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-xs font-bold hidden sm:inline">Search</span>
                </button>
              </form>

              {myTickets.length === 0 ? (
                <div className="text-center py-10 bg-[#F9F8F3] border border-dashed border-[#E5E2D9] rounded-2xl space-y-2">
                  <ClipboardList className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">No active inquiry tickets found</p>
                  <p className="text-[11px] text-gray-400">If you just submitted an inquiry, please try searching by entering your exact phone number.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myTickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="border border-[#E5E2D9] rounded-2xl p-4 bg-[#F9F8F3] text-left space-y-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center border-b border-gray-200/50 pb-2 flex-wrap gap-2">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#2D4F1E]">{ticket.id}</span>
                          <span className="text-[10px] text-gray-400 ml-2">• Submitted: {ticket.timestamp}</span>
                        </div>
                        <span className="bg-[#D4AF37]/10 text-[#8B4513] border border-[#D4AF37]/30 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                          {ticket.status}
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p><span className="font-bold text-gray-500">Contact: </span><span className="text-gray-900 font-bold">{ticket.name} ({ticket.phone})</span></p>
                        <p><span className="font-bold text-gray-500">Inquired Item: </span><span className="text-[#2D4F1E] font-extrabold">{ticket.product}</span></p>
                        {ticket.message && (
                          <div className="bg-white border border-gray-100 p-2 rounded-xl text-gray-600 mt-2 text-[11px] font-mono leading-relaxed max-h-24 overflow-y-auto">
                            {ticket.message}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side Map / Address Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Map Frame Card */}
          <div className="border border-[#E5E2D9] bg-white p-3 rounded-3xl shadow-sm overflow-hidden">
            <div className="h-64 rounded-2xl bg-[#F9F8F3] relative flex items-center justify-center text-center p-6 border border-[#E5E2D9] overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2D4F1E_1.2px,transparent_1.2px)] [background-size:16px_16px]" />
              
              <div className="space-y-4 relative z-10">
                <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#2D4F1E] mx-auto shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 font-serif">Sondarda Plant Highway Coordinates</h4>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-xs">Opposite Shrinathji Weighbridge, Veraval National Highway road, Sondarda, Junagadh District, Gujarat, India</p>
                  <p className="text-[10px] text-[#2D4F1E] font-black mt-2 bg-white/80 inline-block px-3 py-1 rounded border border-[#E5E2D9]">📍 Coordinates: 21.2829° N, 70.2618° E</p>
                </div>
                <a
                  href="https://maps.google.com/?q=Sondarda+Keshod+Gujarat"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#2D4F1E] text-white text-xs font-bold px-4 py-2 hover:bg-[#3D5F2F] shadow transition-all inline-flex items-center gap-1"
                >
                  Open Google Maps <Search className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick FAQ card */}
          <div className="border border-[#E5E2D9] bg-white p-6 rounded-3xl space-y-3 shadow-sm text-xs">
            <h4 className="font-bold text-gray-900 font-serif">Farmer & Trader Support</h4>
            <p className="text-gray-500 leading-relaxed">
              We provide raw pod quality diagnostics and seed moisture evaluation free of charge for local Saurashtra farming arrivals. Simply carry your farm harvest bags to our Sondarda weigh-bridge office during regular daylight hours.
            </p>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-[#8B4513] uppercase text-[9px] tracking-widest">Keshod, Sondarda</span>
              <a
                href="https://wa.me/919825253123?text=Namaste!%20I%20am%20interested%20in%20your%20Groundnut%20Seeds%20and%20processing%20services."
                target="_blank"
                rel="noreferrer"
                className="text-[#2D4F1E] hover:text-[#3D5F2F] font-bold flex items-center gap-1"
              >
                <span>WhatsApp Live Chat</span>
                <MessageSquare className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
