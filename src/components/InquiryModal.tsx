import React, { useState } from "react";
import { X, ClipboardCheck, Phone, Mail, User, ShieldAlert, CheckCircle, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct: string;
  onSubmitSuccess: (trackerId: string) => void;
}

export default function InquiryModal({ isOpen, onClose, initialProduct, onSubmitSuccess }: InquiryModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [productType, setProductType] = useState(initialProduct || "GG-20 Biyaran");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<{ id: string; status: string } | null>(null);

  React.useEffect(() => {
    if (initialProduct) {
      setProductType(initialProduct);
    }
  }, [initialProduct, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !productType) {
      setError("Please fill out all required fields marked with *");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          productType,
          quantity,
          message,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit. Please check connection.");
      }

      const data = await res.json();
      if (data.success && data.inquiry) {
        setSuccessTicket({ id: data.inquiry.id, status: data.inquiry.status });
        
        // Save to client local storage for tracking
        const stored = localStorage.getItem("kirit_inquiries");
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem("kirit_inquiries", JSON.stringify([data.inquiry, ...existing]));
        
        // Notify parent
        onSubmitSuccess(data.inquiry.id);
      } else {
        throw new Error(data.error || "Submission failed.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const text = `Hello Kirit Corporation & UV Seeds! I just submitted an inquiry (${successTicket?.id}) for ${productType}. Please guide me on prices and delivery terms. My Name is ${name}.`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/919825253123?text=${encoded}`, "_blank");
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setQuantity("");
    setMessage("");
    setSuccessTicket(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[#E5E2D9] bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#2D4F1E] px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-[#D4AF37]" />
                <h3 className="text-lg font-bold font-serif">Request a Custom Quote</h3>
              </div>
              <button
                onClick={resetForm}
                className="rounded-full p-1.5 text-gray-200 hover:bg-[#3D5F2F] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[80vh] overflow-y-auto p-6">
              {!successTicket ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-100">
                      <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">Your Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-[#5A5A40]" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Raman Patel"
                          className="w-full rounded-xl border border-[#E5E2D9] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2D2D2A] placeholder-gray-400 focus:border-[#2D4F1E] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-[#5A5A40]" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98252 XXXXX"
                          className="w-full rounded-xl border border-[#E5E2D9] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2D2D2A] placeholder-gray-400 focus:border-[#2D4F1E] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-[#5A5A40]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@gmail.com"
                          className="w-full rounded-xl border border-[#E5E2D9] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2D2D2A] placeholder-gray-400 focus:border-[#2D4F1E] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">Company / Farm Name</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Patel Agro Traders"
                        className="w-full rounded-xl border border-[#E5E2D9] bg-white px-4 py-2.5 text-sm text-[#2D2D2A] placeholder-gray-400 focus:border-[#2D4F1E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">Select Product *</label>
                      <div className="relative">
                        <Package className="absolute left-3 top-3.5 h-4 w-4 text-[#5A5A40]" />
                        <select
                          value={productType}
                          onChange={(e) => setProductType(e.target.value)}
                          className="w-full rounded-xl border border-[#E5E2D9] bg-white py-2.5 pl-10 pr-4 text-sm text-[#2D2D2A] focus:border-[#2D4F1E] focus:outline-none appearance-none"
                        >
                          <option value="Groundnut Seeds (GG-20 Biyaran)">GG-20 Seeds (Biyaran)</option>
                          <option value="Groundnut Seeds (GG-2 Biyaran)">GG-2 Seeds (Biyaran)</option>
                          <option value="Bold Groundnut Kernels">Bold Groundnut Kernels</option>
                          <option value="Java Groundnut Kernels">Java Groundnut Kernels</option>
                          <option value="Raw Groundnuts (With Shell)">Raw Groundnuts (In-Shell)</option>
                          <option value="Premium Peanut Splits">Premium Peanut Splits</option>
                          <option value="Custom Processing Work">Custom Cleaning/Sorting Job Work</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">Required Quantity</label>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g., 50 Bags, 10 Metric Tons"
                        className="w-full rounded-xl border border-[#E5E2D9] bg-white px-4 py-2.5 text-sm text-[#2D2D2A] placeholder-gray-400 focus:border-[#2D4F1E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-[#5A5A40] uppercase tracking-widest mb-1.5">Message or Specifications</label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Specify size counts, packing preferences, moisture limitations..."
                      className="w-full rounded-xl border border-[#E5E2D9] bg-white px-4 py-2.5 text-sm text-[#2D2D2A] placeholder-gray-400 focus:border-[#2D4F1E] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-[#2D4F1E] py-3 text-center text-sm font-bold text-white shadow-md hover:bg-[#3D5F2F] transition-colors focus:outline-none disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Submitting Inquiry..." : "Submit Inquiry Details"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F9F8F3] text-[#2D4F1E] mb-4 border border-[#E5E2D9]">
                    <CheckCircle className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <h4 className="text-xl font-bold text-[#2D4F1E] mb-1 font-serif">Inquiry Registered Successfully!</h4>
                  <p className="text-xs text-[#5A5A40] max-w-sm mx-auto mb-6">
                    Thank you, <span className="font-bold text-[#2D2D2A]">{name}</span>. Your request has been queued in our Sondarda office.
                  </p>

                  <div className="mx-auto max-w-xs rounded-2xl bg-[#F9F8F3] border border-[#E5E2D9] p-4 mb-6 text-left">
                    <div className="flex justify-between border-b border-[#E5E2D9] pb-2 mb-2 text-[10px] text-[#5A5A40] uppercase font-mono tracking-wider">
                      <span>Tracking Ticket</span>
                      <span>Status</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black text-[#2D4F1E] font-mono tracking-wider">{successTicket.id}</span>
                      <span className="rounded bg-white border border-[#E5E2D9] px-2.5 py-0.5 text-[10px] font-bold text-[#8B4513]">{successTicket.status}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#E5E2D9] text-[10.5px] text-[#5A5A40] space-y-1">
                      <div className="flex justify-between">
                        <span>Product:</span>
                        <span className="font-semibold text-[#2D2D2A]">{productType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="font-semibold text-[#2D2D2A]">{phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 px-4">
                    <button
                      onClick={handleWhatsAppRedirect}
                      type="button"
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-xs font-bold text-white shadow hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      <span>Connect instantly on WhatsApp</span>
                    </button>
                    <button
                      onClick={resetForm}
                      type="button"
                      className="w-full rounded-xl border border-[#E5E2D9] bg-white py-2.5 text-xs font-bold text-[#5A5A40] hover:bg-[#F9F8F3] transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
